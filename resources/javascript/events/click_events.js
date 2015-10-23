$(function(){ // on dom ready
  $("#settingsButton").on("click", function(){
    viewModel.showSettings( !viewModel.showSettings() );
  });
  
  
  $("#startSearchButton").on("click", function(){
    var cyNodes     = cy.nodes(); // GUI nodes
    var cyEdges     = cy.edges(); // GUI edges
    
    var startNodeId = '0';                              // The flow starts here
    var goalNodeId  = (cy.nodes().length-1).toString(); // And ends here
    
    var graphNodes  = _.map( cyNodes, function ( elem ) {
      // Create the list of graph nodes to conduct our search on
      var isStartNode = (elem.id() === startNodeId);
      var isGoalNode  = (elem.id() === goalNodeId);
      return new GraphNode( elem.id(), isStartNode, isGoalNode );
    });
    
    var nodeLookup = _.indexBy( graphNodes, "id");
    
    _.each( cyEdges, function( edge ){
      // Add the edges from the GUI framework
      var capacity = edge.data().weight;
      var source   = nodeLookup[ edge.source().id() ];
      var target   = nodeLookup[ edge.target().id() ];
      
      if( source.isStartNode() ){
        edge.source().css({'background-color': '#73e45b'});
      }
      
      if( target.isGoalNode() ){
        edge.target().css({'background-color': '#ffba66'});
      }
      
      source.addChild( target, capacity, edge );
    });
    
    var configuration = {
      numberOfIterations: parseInt(viewModel.settings.numberOfIterations()),
      evaporationRate   : parseFloat(viewModel.settings.evaporationRate()),
      numberOfAnts      : parseInt(viewModel.settings.numberOfAnts()),
      Q                 : parseFloat(viewModel.settings.Q()),
      initialPheromone  : parseFloat(viewModel.settings.initialPheromone())
    };
    
    console.log( cy.json() );
    
    var graph = new Graph( graphNodes );
    var aco = new ACO( configuration ); // initialize a colony and start the search. 
    
    _.each( graph.getEdges(), function ( edge ) {
      // Initialize the visualization labels
      edge.cyEdge.data("label", "0 of "+edge.capacity );
    });
    
    aco
      .maxFlow( graph ) // Returns a bluebird promise.
      .then(function ( solution ) {
        console.log( "Solution:", solution );
      
        // Update the solution list in the GUI
        viewModel.solutions.unshift({ flow: solution.flowAmount, cost: solution.flowCost });
      })
      .delay(1000)
      .then(function () {
        viewModel.progressValue( 0 );
      })
      .catch(function () {
        console.error( arguments );
      })
      ;
  });
  
  $("#clearResults").on("click", function(){
    // clear the result list
    viewModel.solutions.removeAll();
    
    _.each( cy.edges(), function( edge ){
      edge.data("label", "" );
      edge.css({ 'line-color': '#ddd', 'target-arrow-color': '#ddd' });
    });
    
    flowChart.clear();
    costChart.clear();
  });
  
  $("#graphVisibilityButton").on("click",function () {
    viewModel.showGraphs( !viewModel.showGraphs() );
  });
  
}); // on dom ready