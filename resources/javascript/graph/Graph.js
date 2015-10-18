function Graph( nodes ){
  this.nodes = nodes;
  this.edges = [];
}


Graph.prototype.getNodes = function () {
  return this.nodes;
};


Graph.prototype.startNode = function () {
  return _.find( this.nodes, function ( node ) {
    return node.isStart;
  });
};


Graph.prototype.getEdges = function () {
  if( this.edges.length === 0 ){
    this.edges = this.collectEdges();
  }
  
  return this.edges;
};


Graph.prototype.numerOfNodes = function () {
  return this.nodes.length;
};


Graph.prototype.resetFlow = function () {
  _.forEach( this.edges, function ( edge ) {
    edge.reset();
  });
};


Graph.prototype.collectEdges = function () {
  return _.chain( this.nodes )
    .map( function ( node ) {
      return node.edges;
    })
    .flatten()
    .value();
};