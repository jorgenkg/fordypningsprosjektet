import random

class Ant:
    def __init__(self, graph, alpha = 1, beta = 0.1 ):
        self.graph = graph
        self.alpha = alpha
        self.beta = beta
    #end
    
    def move(self, ):
        self.traveled_edges = []
        
        self.current_position = self.graph.start_node
        
        while True:
            if self.current_position.valid_edges():
                edge = self.choose_edge()
            
                self.traveled_edges.append( edge )
                edge.current_flow_limit -= 1
                
                if edge.sink in self.graph.goal_nodes:
                    self.current_position = self.graph.start_node
                else:
                    self.current_position = edge.sink
            else:
                self.backtrack_until_valid()
                if self.current_position == self.graph.start_node and not self.current_position.valid_edges():
                    break
        
        
        
        self.flow_through = sum( 1
                                 for edge in self.traveled_edges
                                 if edge.sink in self.graph.goal_nodes )
        
    #end
    
    def backtrack_until_valid(self, ):
        while not self.current_position.valid_edges() and self.current_position != self.graph.start_node:
            previous_edge = self.traveled_edges.pop()
            previous_edge.usable = False
            self.current_position = previous_edge.source
    #end
    
    def choose_edge(self, ):
        valid_edges = self.current_position.valid_edges()
        
        assert len(valid_edges), "No valid paths"
        
        divisor = sum( 
                    edge.pheromone**self.alpha * edge.current_flow_limit**self.beta 
                    for edge in valid_edges)
        
        s = [ (edge.pheromone**self.alpha * edge.current_flow_limit**self.beta / divisor, edge) 
                for edge in valid_edges ]
        
        return weighted_choice( s )
    #end
    
    def deposite_pheromone(self, quantity ):
        for edge in self.traveled_edges:
            edge.pheromone += quantity
    #end
    
    def travel_cost(self, ):
        return len(self.traveled_edges)
#endclass


def weighted_choice( choices ):
   total = sum(weight for weight, option in choices)
   bounds = random.uniform(0, total)
   
   upto = 0
   for weight, option in choices:
      if upto + weight > bounds:
         return option
      upto += weight
#end


def adjust_pheromones( graph, cost, evaporation_rate, p_best = 0.5 ):
    n = len(graph.nodes.keys())
    
    max_pheromone = 1. / (evaporation_rate * cost)
    min_pheromone = max_pheromone * (1. - p_best**(1. / n)) / ((n/2.-1)*p_best**(1. / n))
    
    for name, node in graph.nodes.items():
        for edge in node.edges:
            edge.pheromone = min( max_pheromone, max( edge.pheromone, min_pheromone ))
    