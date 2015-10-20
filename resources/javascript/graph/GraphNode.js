
var GraphNode = function GraphNode( id, isStart, isGoal ){
  this.id = id;
  this.isGoal = isGoal;
  this.isStart = isStart;
  
  this.edges = [];        // Edges originating from this node
};


GraphNode.prototype.addChild = function ( node, edgeCapacity, cyEdge ) {
  var edge = new Edge( this, node, edgeCapacity, cyEdge );
  this.edges.push( edge );
};

GraphNode.prototype.isGoalNode = function () {
  return this.isGoal;
};

GraphNode.prototype.isStartNode = function () {
  return this.isStart;
};

GraphNode.prototype.hasValidEdges = function ( tabuNodes ) {
  return _.any( this.edges, function ( edge ) {
    return !edge.backtracked && (edge.capacity - edge.expended) > 0 && !_.contains( tabuNodes, edge.sink );
  });
};

GraphNode.prototype.getValidEdges = function ( tabuNodes ) {
  return _.filter( this.edges, function ( edge ) {
    return !edge.backtracked && (edge.capacity - edge.expended) > 0 && !_.contains( tabuNodes, edge.sink );
  });
};