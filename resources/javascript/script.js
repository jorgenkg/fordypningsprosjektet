var cy = null;

$(function(){ // on dom ready

  cy = cytoscape({
    container: document.getElementById('cy'),
  
    style: cytoscape.stylesheet()
      .selector('node')
        .css({
          'content': 'data(id)'
        })
      .selector('edge')
        .css({
          'target-arrow-shape': 'triangle',
          'width': 4,
          'line-color': '#ddd',
          'target-arrow-color': '#ddd',
          'content': 'data(label)'
        }),
  
    elements: {
    nodes: [
		{ data: { id: '0' } },
		{ data: { id: '1' } },
		{ data: { id: '2' } },
		{ data: { id: '3' } },
		{ data: { id: '4' } },
		{ data: { id: '5' } },
    ],
    edges: [
		{ data: { id: '0>1', weight: 16, source: '0', target: '1' } },
		{ data: { id: '0>2', weight: 13, source: '0', target: '2' } },
		{ data: { id: '1>2', weight: 10, source: '1', target: '2' } },
		{ data: { id: '1>3', weight: 12, source: '1', target: '3' } },
		{ data: { id: '2>1', weight: 4, source: '2', target: '1' } },
		{ data: { id: '2>4', weight: 14, source: '2', target: '4' } },
		{ data: { id: '3>2', weight: 9, source: '3', target: '2' } },
		{ data: { id: '3>5', weight: 20, source: '3', target: '5' } },
		{ data: { id: '4>3', weight: 7, source: '4', target: '3' } },
		{ data: { id: '4>5', weight: 4, source: '4', target: '5' } },
    ]
},
  
    layout: {
      name: "circle",
      directed: false,
      roots: '#a',
      padding: 10
    }
  });
  
  
  $("#restartSearch").on("click", function(){
    
    var notify = $.notify('Searching...', {delay: 1});
    
    var nodez = _.map( cy.nodes(), function ( elem ) {
      return new GraphNode( elem.id(), elem.id()==='0', elem.id()===(cy.nodes().length-1).toString() );
    });
  
    _.each( cy.edges(), function( edge ){
      var capacity = edge.data().weight;
      var source = _.find( nodez, function ( node ) {
        if(edge.source().id() === node.id && node.isStartNode()){
          edge.source().css({'background-color': '#73e45b'});
        }
        return edge.source().id() === node.id;
      });
      var sink = _.find( nodez, function ( node ) {
        if(edge.target().id() === node.id && node.isGoalNode()){
          edge.target().css({'background-color': '#ffba66'});
        }
        return edge.target().id() === node.id;
      });
      source.addChild( sink, capacity, edge );
    });
  
    var graph = new Graph( nodez );
    
    _.forEach( graph.getEdges(), function ( edge ) {
      edge.cyEdge.data("label", "0 of "+edge.capacity );
    });
    
    var aco = new ACO( );
    aco.maxFlow( graph ); // async
  });
  
  $("#clearResults").on("click", function(){
    _.each( cy.edges(), function( edge ){
      edge.data("label", "" );
      edge.css({ 'line-color': '#ddd', 'target-arrow-color': '#ddd' });
    });
  
  });
  
  
}); // on dom ready