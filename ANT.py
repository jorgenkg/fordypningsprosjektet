import random

class Ant:
    def __init__(self, graph, alpha = 1, beta = 1 ):
        self.graph = graph
        self.alpha = alpha
        self.beta = beta
    #end
    
    def move(self, ):
        self.traveled_edges = [] # tabu list
        self.current_position = self.graph.start_node
        
        while not self.current_position in self.graph.goal_nodes:
            edge = self.choose_edge()
            self.traveled_edges.append( edge )
            self.current_position = edge.sink
        
        
    #end
    
    def choose_edge(self, ):
        valid_next_nodes = [ edge
                            for edge in self.current_position.edges
                            if edge not in self.traveled_edges ]
        
        assert len(valid_next_nodes), \
            "No valid paths"
        
        divisor = sum( 
                    edge.pheromone**self.alpha * edge.visibility**self.beta 
                    for edge in valid_next_nodes)
        
        s = [ (edge.pheromone**self.alpha * edge.visibility**self.beta / divisor, edge) 
                for edge in valid_next_nodes ]
        
        return weighted_choice( s )
    #end
    
    def deposite_pheromone(self, value = None ):
        for edge in self.traveled_edges:
            edge.pheromone += value if value else 1. / edge.weight
    #end
    
    def travel_cost(self, ):
        return sum( edge.weight for edge in self.traveled_edges )
#endclass


def weighted_choice( choices ):
   total = sum(weight for weight, option in choices)
   bounds = random.uniform(0, total)
   
   upto = 0
   for weight, option in choices:
      if upto + weight > bounds:
         return option
      upto += weight