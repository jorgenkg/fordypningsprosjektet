$(function(){ // on dom ready
  $("#restartSearch").on("click", function(){
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
      initialPheromone  : parseFloat(viewModel.settings.initialPheromone()),
      visualize         : viewModel.settings.visualize()
    };
    
    console.log( configuration );
    
    new ACO( configuration ) // initialize a colony
      .maxFlow( new Graph( graphNodes ) ); // start the search. This is async due to javascript rendering.
  });
  
  $("#clearResults").on("click", function(){
    _.each( cy.edges(), function( edge ){
      edge.data("label", "" );
      edge.css({ 'line-color': '#ddd', 'target-arrow-color': '#ddd' });
    });
  
  });
  
  
}); // on dom ready