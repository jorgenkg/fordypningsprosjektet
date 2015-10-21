var ACO = function( settings ){
  // augment the settings parameter with predefined defaults
  this.settings = _.defaults( settings || {}, this.defaultSettings() );
};


ACO.prototype.defaultSettings = function(){
  return {
    numberOfIterations: 200,
    evaporationRate   : 0.1,
    numberOfAnts      : 6,
    Q                 : 1.0,
    initialPheromone  : 100000.0
  };
};


ACO.prototype.maxFlow = function ( graph ) {
  var self = this;
  var promiseFinished = Promise.defer();
  
  var ants        = this.generateAnts( this.settings.numberOfAnts );
  var edges       = graph.getEdges();
  
  var epochSolution = {};
  var candidateSolution     = {};
  var globalSolution    = {
    traveledEdges: [],
    flowAmount: -1,
    flowCost: Infinity
  };
  
  // Initialize the pheromone levels
  _.each( edges, function ( edge ) {
    edge.pheromone = self.settings.initialPheromone;
  });
  
  var epoch = function( ){
    // An iteration of the algorithm. This has to be defined as a function
    // rather than a loop in order to deaccelerate the rendering speed to 
    // a interpretable rate.
    
    epochSolution = {
      traveledEdges: [],
      flowAmount: -1,
      flowCost: Infinity
    };
    
    var passings = [];
    
    _.each( ants, function ( ant ) {
      // Let each ant construct a candidate solution
      candidateSolution = ant.move( graph );
      // Reset the book keeping variables
      graph.resetFlow();
      
      passings.push( candidateSolution.traveledEdges );
      epochSolution = self.decideBestSolution( candidateSolution, epochSolution );
    });
    
    globalSolution = self.decideBestSolution( epochSolution, globalSolution );
    
    // RENDERING
    if( viewModel.settings.visualize() ){
      var countFlow     = _.countBy( globalSolution.traveledEdges, "id");
      var countPassings = _.countBy(_.flatten( passings ), "id");
      
      _.each( edges, function ( edge ) {
        var expended  = _.isUndefined( countFlow[edge.id] ) ? 0 : countFlow[edge.id];
        var wayfarers = _.isUndefined( countPassings[edge.id] ) ? 0 : countPassings[edge.id];
        edge.cyEdge.data("label", expended +" of "+edge.capacity+" "+edge.pheromone.toFixed(2)+" "+ wayfarers);
        
        if( globalSolution !== epochSolution){
          // Only update the graphics if the rendered solution actually has changed
          if( !_.isUndefined( countFlow[edge.id] ) ){
            edge.cyEdge.css({ 'line-color': 'red', 'target-arrow-color': 'red' });
          }
          else {
            edge.cyEdge.css({ 'line-color': '#ddd', 'target-arrow-color': '#ddd' });
          }
          
        }
      });
      //END
    }
    
    _.each( edges, function ( edge ) {
      // Evaporate some of the pheromones
      edge.pheromone *= (1 - self.settings.evaporationRate);
    });
    
    if( epochSolution.flowAmount > 0 ){
      // Let only this epoch's most fit ant deposit pheromones and deposit only once per edge, even 
      // though we might have traversed it multiple times.
      self.depositePheromone( _.uniq(epochSolution.traveledEdges), self.settings.Q/epochSolution.flowCost );
    }
    
    self.adjustPheromoneLevels( graph, globalSolution.flowCost, self.settings.evaporationRate, 0.5 );
  };
  
  
  var counter = 0;
  
  var run = function run( last_draw ){
    if( _.isUndefined(last_draw) ){
        // last_draw is undefined = this is the first call to run()
        last_draw = new Date().getMilliseconds();
    }
    
    
    var dt = Math.max(new Date().getMilliseconds() - last_draw, 0);       // time passed since last draw
    var afterTime = new Date().getMilliseconds();
    var sleep = Math.max(parseInt(viewModel.settings.sleepTime()) - dt, 0);
    
    Promise
      .delay( viewModel.settings.visualize() ? sleep : 0 )
      .then(function () {
        epoch( );
      
        counter += 1;

        viewModel.progressValue( _.floor(100.0*counter / self.settings.numberOfIterations) );

        if( counter < self.settings.numberOfIterations ){
          // Continue with another iteration
          run( afterTime );
        }
        else{
          // We have finished the specified number of interations
        
          // Resolve the promise with our discovered solution
          promiseFinished.resolve( globalSolution );
        
          // Help the garbage collector
          epoch = null;
          for (var i = 0; i < ants.length; i++) {
            ants[i] = null;
          }
        }
      });
  };
  
  run();
  
  return promiseFinished.promise;
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