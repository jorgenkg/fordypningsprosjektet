var ACO = function( settings ){
  this.settings = _.defaults( settings || {}, this.defaultSettings() );
};


ACO.prototype.maxFlow = function ( graph ) {
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
  
  for( i=0; i < this.settings.numberOfIterations; i++ ){
    // Loop through the specified number of iterations 
    
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
      
      if( epochSolution.flowAmount > candidateSolution.flowAmount ){
        // This ant has found a path with more flow
        candidateSolution = epochSolution;
      }
      else if( epochSolution.flowAmount === candidateSolution.flowAmount && 
                candidateSolution.flowCost < globalSolution.flowCost ){
        // This ant has found a cheaper way to transport the same flow amout.
        candidateSolution = epochSolution;
      }
    }
    
    if( candidateSolution.flowAmount > globalSolution.flowAmount ){
      // The best ant within this epoch has more flow than the global solution 
      globalSolution = candidateSolution;
    }
    else if( candidateSolution.flowAmount === globalSolution.flowAmount && 
              candidateSolution.flowCost < globalSolution.flowCost ){
      // The best ant within this epoch found a cheaper way than the global
      // solution to transport the same flow amout.
      globalSolution = candidateSolution;
    }
    
    for( j=0; j < edges.length; j++){
      // Evaporate some of the pheromones
      edges[j].pheromone *= (1 - this.settings.evaporationRate);
    }
    
    if( candidateSolution.flowAmount > 0 ){
      // This ant has found a flow path
      this.depositePheromone( candidateSolution.traveledEdges, this.settings.Q/candidateSolution.flowCost );
    }
    
    this.adjustPheromoneLevels( graph, globalSolution.flowCost, this.settings.evaporationRate, 0.5 );
  }
  
  return globalSolution;
};


ACO.prototype.defaultSettings = function(){
  return {
    numberOfIterations: 50,
    evaporationRate   : 0.1,
    numberOfAnts      : 8,
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