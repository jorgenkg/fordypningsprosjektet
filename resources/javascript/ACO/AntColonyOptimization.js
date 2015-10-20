var ACO = function( settings ){
  // augment the settings parameter with predefined defaults
  console.log(" pre", settings.visualize );
  this.settings = _.defaults( settings || {}, this.defaultSettings() );
  console.log(" post", settings.visualize );
};


ACO.prototype.defaultSettings = function(){
  return {
    numberOfIterations: 200,
    evaporationRate   : 0.1,
    numberOfAnts      : 6,
    Q                 : 1.0,
    initialPheromone  : 100000.0,
    visualize         : false,
  };
};


ACO.prototype.maxFlow = function ( graph ) {
  var self = this;
  
  var ants        = this.generateAnts( this.settings.numberOfAnts );
  var edges       = graph.getEdges();
  
  var candidateSolution = {};
  var epochSolution = {};
  var globalSolution = {
    traveledEdges: [],
    flowAmount: -1,
    flowCost: Infinity
  };
  
  var i = 0, j = 0;
  
  // Initialize the pheromone levels
  for( j=0; j < edges.length; j++){
    edges[j].pheromone = this.settings.initialPheromone;
  }
  
  var epoch = function( ){
    // An iteration of the algorithm. This has to be defined as a function
    // rather than a loop in order to deaccelerate the rendering speed to 
    // a interpretable rate.
    
    candidateSolution = {
      traveledEdges: [],
      flowAmount: -1,
      flowCost: Infinity
    };
    
    for( j=0; j < ants.length; j++ ){
      // Let each ant construct a candidate solution
      epochSolution = ants[j].move( graph );
      // Reset the book keeping variables
      graph.resetFlow();
      
      candidateSolution = self.decideBestSolution( epochSolution, candidateSolution );
    }
    
    globalSolution = self.decideBestSolution( candidateSolution, globalSolution );
    
    // RENDERING
    if( self.settings.visualize ){
      var countFlow = _.countBy( globalSolution.traveledEdges, function( edge ){ return edge.id; });
      for( j=0; j < edges.length; j++){
        if( !_.isUndefined( countFlow[edges[j].id] )){
          edges[j].cyEdge.data("label", countFlow[edges[j].id]+" of "+edges[j].capacity+" "+edges[j].pheromone.toFixed(2) );
          if( globalSolution !== candidateSolution){
            // Only update the graphics if the rendered solution actually has changed
            edges[j].cyEdge.css({ 'line-color': 'red', 'target-arrow-color': 'red' });
          }
        }
        else {
          edges[j].cyEdge.data("label", "0 of "+edges[j].capacity+" "+edges[j].pheromone.toFixed(2) );
          if( globalSolution !== candidateSolution){
            // Only update the graphics if the rendered solution actually has changed
            edges[j].cyEdge.css({ 'line-color': '#ddd', 'target-arrow-color': '#ddd' });
          }
        }
      }
      //END
    }
    
    
    for( j=0; j < edges.length; j++){
      // Evaporate some of the pheromones
      edges[j].pheromone *= (1 - self.settings.evaporationRate);
    }
    
    if( candidateSolution.flowAmount > 0 ){
      // Let only this epoch's most fit ant deposit pheromones and deposit only once per edge, even 
      // though we might have traversed it multiple times.
      self.depositePheromone( _.uniq(candidateSolution.traveledEdges), self.settings.Q/candidateSolution.flowCost );
    }
    
    self.adjustPheromoneLevels( graph, globalSolution.flowCost, self.settings.evaporationRate, 0.5 );
  };
  
  if( self.settings.visualize ){
    for( j=0; j < edges.length; j++){
      // Initialize the visualization labels
      edges[j].cyEdge.data("label", "0 of "+edges[j].capacity ); // currently not yet using any flow
    }
  }
  
  var counter = 0;
  var notifier = $.notify('Running...', {type: "info", progress: 0, showProgressbar: true, allow_dismiss: false});
  var timer = setInterval( function(){
    epoch( );
    counter += 1;
    notifier.update({"progress": _.floor(100.0*counter / self.settings.numberOfIterations)});
    if( counter >= self.settings.numberOfIterations ){
      var results = "Ran for "+counter+" iterations. Flow: " + globalSolution.flowAmount + " Cost: " + globalSolution.flowCost;
      notifier.update({"type": "success", "message": results, showProgressbar: false});
      clearInterval( timer );
      viewModel.solutions.unshift({ flow: globalSolution.flowAmount, cost: globalSolution.flowCost });
      console.log( globalSolution );
      
      // RENDERING
      var countFlow = _.countBy( globalSolution.traveledEdges, function( edge ){ return edge.id; });
      for( j=0; j < edges.length; j++){
        if( !_.isUndefined( countFlow[edges[j].id] )){
          edges[j].cyEdge.data("label", countFlow[edges[j].id]+" of "+edges[j].capacity+" "+edges[j].pheromone.toFixed(2) );
          edges[j].cyEdge.css({ 'line-color': 'red', 'target-arrow-color': 'red' });
        }
        else {
          edges[j].cyEdge.data("label", "0 of "+edges[j].capacity+" "+edges[j].pheromone.toFixed(2) );
          edges[j].cyEdge.css({ 'line-color': '#ddd', 'target-arrow-color': '#ddd' });
        }
      }
      //END
    }
    else{
    }
  }, self.settings.visualize ? 40 : 0);
};


ACO.prototype.generateAnts = function( numberOfAnts ){
  var ants = [];
  for( var i=0; i < numberOfAnts; i++ ){
    ants.push( new Ant() );
  }
  
  return ants;
};


ACO.prototype.decideBestSolution = function( localSolution, globalSolution ) {
  if( localSolution.flowAmount > globalSolution.flowAmount ){
    // This ant has found a path with more flow
    return localSolution;
  }
  else if( localSolution.flowAmount === globalSolution.flowAmount && 
            localSolution.flowCost < globalSolution.flowCost ){
    // This ant has found a cheaper way to transport the same flow amout.
              return localSolution;
  }
  
  return globalSolution;
};


ACO.prototype.depositePheromone = function( traveledEdges, quantity ){
  for( var i=0; i < traveledEdges.length; i++ ){
    traveledEdges[i].pheromone += quantity;
  }
};


ACO.prototype.adjustPheromoneLevels = function( graph, cost, evaporationRate, pBest ){
  pBest = _.isUndefined(pBest) ? 0.5 : pBest; // define the variable if it wasnt passed as a param
  
  var numerOfNodes = graph.numerOfNodes();
  var maxPheromone = 1.0 / (cost * evaporationRate);
  var minPheromone = maxPheromone * (1.0 - Math.pow(pBest, 1.0/numerOfNodes) ) / ((numerOfNodes/2.0-1)*Math.pow(pBest, 1.0/numerOfNodes));
  
  _.forEach( graph.getEdges(), function ( edge ) {
    if( edge.pheromone > maxPheromone ){
      edge.pheromone = maxPheromone;
    }
    else if( edge.pheromone < minPheromone ){
      edge.pheromone = minPheromone;
    }
  });
};