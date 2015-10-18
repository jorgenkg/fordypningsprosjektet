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
          { data: { id: 'a' } },
          { data: { id: 'b' } },
          { data: { id: 'c' } },
          { data: { id: 'd' } },
          { data: { id: 'e' } },
          { data: { id: 'f' } }
        ], 
      
        edges: [
          { data: { id: 'ab', weight: 3, source: 'a', target: 'b' } },
          { data: { id: 'ac', weight: 3, source: 'a', target: 'c' } },
          { data: { id: 'bc', weight: 2, source: 'b', target: 'c' } },
          { data: { id: 'bd', weight: 3, source: 'b', target: 'd' } },
          { data: { id: 'ce', weight: 2, source: 'c', target: 'e' } },
          { data: { id: 'de', weight: 4, source: 'd', target: 'e' } },
          { data: { id: 'df', weight: 2, source: 'd', target: 'f' } },
          { data: { id: 'ef', weight: 3, source: 'e', target: 'f' } }
        ]
      },
  
    layout: {
      name: 'breadthfirst',
      directed: true,
      roots: '#a',
      padding: 10
    }
  });
  
  
  $("#restartSearch").on("click", function(){
    var notify = $.notify('<strong>Restarting</strong> the search... ok', {delay: 500});
    
    var nodez = _.map( cy.nodes(), function ( elem ) {
      return new GraphNode( elem.id(), elem.id()==='a', elem.id()==='f' );
    });
  
    _.each( cy.edges(), function( edge ){
      var capacity = edge.data().weight;
      var source = _.find( nodez, function ( node ) {
        return edge.source().id() === node.id;
      });
      var sink = _.find( nodez, function ( node ) {
        return edge.target().id() === node.id;
      });
    
      source.addChild( sink, capacity, edge );
    });
  
    var graph = new Graph( nodez );
  
    var aco = new ACO( );
    var solution = aco.maxFlow( graph );
  
    var countFlow = _.countBy( solution.traveledEdges, function( id ){ return id; });
    var edgeDict  = _.indexBy( graph.getEdges(), "id" );
    
    _.forEach( solution.traveledEdges, function ( edge ) {
      edgeDict[edge].cyEdge.data("label", countFlow[edge] );
      edgeDict[edge].cyEdge.css({ 'line-color': 'red', 'target-arrow-color': 'red' });
    });
    
    console.log( solution, countFlow );
  });
  
  $("#clearResults").on("click", function(){
    _.each( cy.edges(), function( edge ){
      edge.data("label", "" );
      edge.css({ 'line-color': '#ddd', 'target-arrow-color': '#ddd' });
    });
  
  });
  
  
}); // on dom ready