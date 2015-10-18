function Edge( source, sink, capacity, cyEdge ){
  this.id = source.id+">"+sink.id;
  this.source = source;
  this.sink = sink;
  
  this.cyEdge = cyEdge;
  
  this.expended = 0;
  this.capacity = capacity;
  this.backtracked = false;
  
  this.pheromone = 0.0;
  this.visibility = 1.0 / this.cost();
}


Edge.prototype.reset = function () {
  this.expended = 0;
  this.backtracked = false;
  this.pheromone = 100000.0;
};

Edge.prototype.cost = function () {
  return 1;
};