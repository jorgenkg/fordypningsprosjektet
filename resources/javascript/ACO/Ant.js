function Ant(){
}


Ant.prototype.move = function( graph ){
  /*
   * Construct a candidate solution for the given graph
   */
  
  var currentPosition = graph.startNode();
  var tabuNodes = [ currentPosition ];
  var traveledEdges = [];
  
  while( currentPosition.hasValidEdges( tabuNodes ) || currentPosition !== graph.startNode() ){
    nextEdge = this.chooseNextEdge( currentPosition, tabuNodes, traveledEdges );
    
    nextEdge.expended += 1; // we are currently using an unit of the capacity
    traveledEdges.push( nextEdge );
    
    var nextNode = nextEdge.sink;
    if( nextNode.isGoalNode() ){
      // We have arrived at a sink node
      // Teleport the ant to the goal node and reset the tabu list
      // before starting a new flow discovering round
      currentPosition = graph.startNode();
      tabuNodes = [ currentPosition ];
    }
    else{
      currentPosition = nextNode;
      tabuNodes.push( currentPosition );
    }
    
    if( !currentPosition.hasValidEdges( tabuNodes ) ){
      // This node has no more out-capacity. We have to back up to a 
      // node we can actually flow out of. If we back up to the start
      // node and still can't flow out, we can terminate our search.
      currentPosition = this.reverseMovement( currentPosition, traveledEdges, tabuNodes );
    }
  }
  // 
  
  var flowAmount = _.sum( traveledEdges, function( edge ){
    return edge.source === graph.startNode() ? 1 : 0;
  });
  
  var flowCost = _.sum( _.uniq(traveledEdges), function( edge ){
    return edge.cost();
  });
  
  return {
    traveledEdges: traveledEdges,
    flowAmount: flowAmount,
    flowCost: flowCost
  };
};


Ant.prototype.reverseMovement = function( position, traveledEdges, tabuNodes ){
  // Back up to a node we can actually flow out of. Making sure not to back
  // out of the start node (intuitively).
  
  while( !position.hasValidEdges( tabuNodes ) && !position.isStartNode() ){
    previousEdge = traveledEdges.pop();
    previousEdge.expended -= 1;
    previousEdge.sink.backtracked(); // notify this node that we had to backtrack from it
    
    position = previousEdge.source;
  }
  
  return position;
};


Ant.prototype.chooseNextEdge = function( node, tabuNodes, traveledEdges ){
  var alpha = 1.0, beta = 0.0;
  var validEdges = node.getValidEdges( tabuNodes );
  
  if( validEdges.length === 0 )
    throw "No valid edges to travel";
  
  //if( Math.random() < 0.1 ){
  //  // Check if we should act suboptimally
  //  var isWalkingAGoodPath = _.chain(traveledEdges)
  //        .takeRight( 2 )
  //        .pluck( "maxed" )
  //        .all()
  //        .value();
  //  var isFacingAGoodPath = _.chain( validEdges )
  //        .pluck("maxed")
  //        .any()
  //        .value();
  //  
  //  if( isFacingAGoodPath && isWalkingAGoodPath ){
  //    alpha = beta / 2;
  //  }
  //}
  
  var divisor = _.sum( validEdges, function ( edge ) {
    return edge.pheromone;
  });
  
  var s = _.map( validEdges, function ( edge ) {
      var probability = edge.pheromone / divisor;
    return [probability, edge];
  });
  
  
  var chosen = weightedSelect( s );
  
  return chosen;
};