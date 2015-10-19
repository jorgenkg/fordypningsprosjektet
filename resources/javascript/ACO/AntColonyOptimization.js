var ACO = function( settings ){
  this.settings = _.defaults( settings || {}, this.defaultSettings() );
};


ACO.prototype.maxFlow = function ( graph ) {
  var self = this;
  var globalSolution = {
    traveledEdges: [],
    flowAmount: -1,
    flowCost: Infinity
  };
  
  var ants        = this.generateAnts( this.settings.numberOfAnts );
  var edges       = graph.getEdges();
  
  var i = 0, j = 0;
  var candidateSolution = {};
  var epochSolution = {};
  
  // Initialize the pheromone levels
  for( j=0; j < edges.length; j++){
    edges[j].pheromone = this.settings.initialPheromone;
  }
  
  var epoch = function( ){
    // Loop through the specified number of iterations 
    
    candidateSolution = {
      traveledEdges: [],
      flowAmount: -1,
      flowCost: Infinity
    };
    
    var keep = [];
    
    for( j=0; j < ants.length; j++ ){
      // Let each ant construct a candidate solution
      epochSolution = ants[j].move( graph );
      // Reset the book keeping variables
      graph.resetFlow();
      
      keep.push( _.map(epochSolution.traveledEdges, "id") );
      
      candidateSolution = self.decideBestSolution( epochSolution, candidateSolution );
    }
    
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
    
    globalSolution = self.decideBestSolution( candidateSolution, globalSolution );
    
    for( j=0; j < edges.length; j++){
      // Evaporate some of the pheromones
      edges[j].pheromone *= (1 - self.settings.evaporationRate);
    }
    
    if( candidateSolution.flowAmount > 0 ){
      // This epoch's most fit ant has found a flow path
      // Let only the fittest ant deposit pheromones.
      self.depositePheromone( candidateSolution.traveledEdges, self.settings.Q/candidateSolution.flowCost );
    }
    
    self.adjustPheromoneLevels( graph, globalSolution.flowCost, self.settings.evaporationRate, 0.5 );
  };
  
  var counter = 0;
  var timer = setInterval( function(){
    epoch( );
    counter += 1;
    if( counter >= self.settings.numberOfIterations ){
      console.log("done");
      clearInterval( timer );
    }
    else{
    }
  }, 300);
  
  return globalSolution;
};


ACO.prototype.defaultSettings = function(){
  return {
    numberOfIterations: 50,
    evaporationRate   : 0.1,
    numberOfAnts      : 7,
    Q                 : 1.0,
    initialPheromone  : 100000.0
  };
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
  var numerOfNodes = graph.numerOfNodes();
  pBest = _.isUndefined(pBest) ? 0.5 : pBest;
  
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