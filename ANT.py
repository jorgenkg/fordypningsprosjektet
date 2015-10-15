import random

class Ant:
    def __init__(self, graph, alpha = 1, beta = 1 ):
        self.graph = graph
        self.alpha = alpha
        self.beta  = beta
    #end
    
    def move(self, ):
        self.traveled_edges   = []
        self.tabu             = [ self.graph.start_node ]
        self.current_position = self.graph.start_node

        
        while self.current_position.has_valid_edges( self.tabu ) or self.current_position != self.graph.start_node:
            edge           = self.choose_edge()
            edge.capacity -= 1
            self.traveled_edges.append( edge )
            
            
            if edge.sink in self.graph.goal_nodes:
                # We have arrived at a sink node
                # Teleport the ant to the goal node and reset the tabu list
                # before starting a new flow discovering round
                self.current_position = self.graph.start_node
                self.tabu = [ self.graph.start_node ]
            else:
                # Mark this new node as our current location
                self.current_position = edge.sink
                self.tabu.append( self.current_position )
            
            if not self.current_position.has_valid_edges( self.tabu ):
                # This node has no more out-capacity. We have to back up to a 
                # node we can actually flow out of. If we back up to the start
                # node and still can't flow out, we can terminate our search.
                self.backtrack_until_valid()
        
        
        self.flow_through = sum( 1
                                 for edge in self.traveled_edges
                                 if edge.sink in self.graph.goal_nodes )
        self.travel_cost  = sum( edge.aquisition_cost + edge.cost * (edge.flow_limit - edge.capacity)
                                 for edge in set(self.traveled_edges))
    #end
    
    def backtrack_until_valid(self, ):
        # Back up to a node we can actually flow out of. Making sure not to back
        # out of the start node (intuitively).
        while not self.current_position.has_valid_edges( self.tabu ) and self.current_position != self.graph.start_node:
            # Lookup the previous node and remove the edge from the list of traveled paths. 
            # The edge may have been visited muliple times during the search, but we are 
            # only interested in removing a single entry.
            previous_edge         = self.traveled_edges.pop()
            previous_edge.usable  = False
            self.current_position = previous_edge.source
    #end
    
    def choose_edge(self, ):
        valid_edges = self.current_position.valid_edges( self.tabu )
        
        assert len(valid_edges), "No valid paths"
        
        divisor = sum( 
                    edge.pheromone**self.alpha * edge.capacity**self.beta 
                    for edge in valid_edges)
        
        s = [ (edge.pheromone**self.alpha * edge.capacity**self.beta / divisor, edge) 
                for edge in valid_edges ]
        
        return weighted_choice( s )
    #end
    
    def deposite_pheromone(self, quantity ):
        for edge in set(self.traveled_edges):
            edge.pheromone += quantity
    #end
#endclass


def weighted_choice( choices ):
   # Choose from a list of options with probability p
   # eg: list = [ (p, element_one), (1-p, element_two) ]
   total = sum(weight for weight, option in choices)
   bounds = random.uniform(0, total)
   
   upto = 0
   for weight, option in choices:
      if upto + weight > bounds:
         return option
      upto += weight
#end


def adjust_pheromones( graph, cost, evaporation_rate, p_best = 0.5 ):
    n = len(graph.nodes.keys()) # the number of nodes
    
    max_pheromone = 1. / (evaporation_rate * cost)
    min_pheromone = max_pheromone * (1. - p_best**(1. / n)) / ((n/2.-1)*p_best**(1. / n))
    
    for name, node in graph.nodes.items():
        for edge in node.edges:
            edge.pheromone = min( max_pheromone, max( edge.pheromone, min_pheromone ))
#end