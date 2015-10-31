function Edge( source, sink, capacity, cyEdge ){
  this.id = source.id+">"+sink.id;
  this.source = source;
  this.sink = sink;
  
  this.cyEdge = cyEdge;
  
  this.expended = 0;
  this.capacity = capacity;
  this.backtracked = false;
  this.maxed = false; // whether this edge has been limited by the pheromone limiter during the current iteration
  
  this.pheromone = 0.0;
}


Edge.prototype.reset = function () {
  this.expended = 0;
  this.backtracked = false;
};


Edge.prototype.visibility = function () {
  return 1.0 / this.cost();
};


Edge.prototype.cost = function () {
  return 1.0 + this.expended;
};