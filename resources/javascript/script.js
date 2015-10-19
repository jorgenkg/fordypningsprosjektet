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
          { data: { id: 'f' } },
          { data: { id: 'g' } },
          { data: { id: 'h' } }
        ], 
      
        edges: [
          { data: { id: 'ac', weight: 9, source: 'a', target: 'c' } },
          { data: { id: 'ba', weight: 2, source: 'b', target: 'a' } },
          { data: { id: 'bd', weight: 10, source: 'b', target: 'd' } },
          { data: { id: 'be', weight: 10, source: 'b', target: 'e' } },
          { data: { id: 'ca', weight: 3, source: 'c', target: 'a' } },
          { data: { id: 'cd', weight: 3, source: 'c', target: 'd' } },
          { data: { id: 'cg', weight: 4, source: 'c', target: 'g' } },
          
          { data: { id: 'dc', weight: 2, source: 'd', target: 'c' } },
          
          { data: { id: 'eb', weight: 2, source: 'e', target: 'b' } },
          { data: { id: 'ed', weight: 1, source: 'e', target: 'd' } },
          { data: { id: 'ef', weight: 1, source: 'e', target: 'f' } },
          { data: { id: 'eh', weight: 2, source: 'e', target: 'h' } },
          
          { data: { id: 'fd', weight: 1, source: 'f', target: 'd' } },
          { data: { id: 'fe', weight: 1, source: 'f', target: 'e' } },
          { data: { id: 'fg', weight: 3, source: 'f', target: 'g' } },
          
          { data: { id: 'gc', weight: 2, source: 'g', target: 'c' } },
          
          { data: { id: 'he', weight: 4, source: 'h', target: 'e' } },
          { data: { id: 'hg', weight: 2, source: 'h', target: 'g' } }
        ]
      },
  
    layout: {
      name: "circle",
      directed: true,
      roots: '#a',
      padding: 10
    }
  });
  
  
  $("#restartSearch").on("click", function(){
    
    var notify = $.notify('<strong>Restarting</strong> the search... ok', {delay: 1});
    
    var nodez = _.map( cy.nodes(), function ( elem ) {
      return new GraphNode( elem.id(), elem.id()==='h', elem.id()==='a' );
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
    var solution = aco.maxFlow( graph );
  
    var countFlow = _.countBy( solution.traveledEdges, function( edge ){ return edge.id; });
    
    _.forEach( solution.traveledEdges, function ( edge ) {
      edge.cyEdge.data("label", countFlow[edge.id]+" of "+edge.capacity );
      edge.cyEdge.css({ 'line-color': 'red', 'target-arrow-color': 'red' });
    });
    
    console.log( solution );
  });
  
  $("#clearResults").on("click", function(){
    _.each( cy.edges(), function( edge ){
      edge.data("label", "" );
      edge.css({ 'line-color': '#ddd', 'target-arrow-color': '#ddd' });
    });
  
  });
  
  
}); // on dom ready