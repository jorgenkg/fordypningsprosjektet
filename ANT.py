import random

class Ant:
    def __init__(self, graph, alpha = 1, beta = 1 ):
        self.graph = graph
        self.alpha = alpha
        self.beta = beta
    #end
    
    def move(self, ):
        self.traveled_edges = [] # tabu list
        
        self.move_from = [ self.graph.start_node ]
        found_goals = []
        
        n_edges = sum(1 for node in self.graph.nodes.values() for edge in node.edges)
        
        while len(found_goals) != len(self.graph.goal_nodes) and len(self.traveled_edges) < n_edges / 2:
            edge = self.choose_edge()
            self.traveled_edges.append( edge )
            self.move_from.append( edge.sink )
            
            if edge.sink in self.graph.goal_nodes:
                found_goals.append( edge.sink )
    #end
    
    def choose_edge(self, ):
        valid_edges = [ edge
                            for node in self.move_from
                            for edge in node.edges
                            if edge not in self.traveled_edges ]
        
        assert len(valid_edges), "No valid paths"
        
        divisor = sum( 
                    edge.pheromone**self.alpha * edge.visibility**self.beta 
                    for edge in valid_edges)
        
        s = [ (edge.pheromone**self.alpha * edge.visibility**self.beta / divisor, edge) 
                for edge in valid_edges ]
        
        return weighted_choice( s )
    #end
    
    def deposite_pheromone(self, quantity ):
        for edge in self.traveled_edges:
            edge.pheromone += quantity
    #end
    
    def flowed(self, ):
        source = self.graph.start_node
        sink   = self.graph.goal_nodes[0]
        return self.graph.max_flow( source, sink, self.traveled_edges )
    #end
    
    def travel_cost(self, ):
        return sum( edge.cost for edge in self.traveled_edges )
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


def adjust_pheromones( graph, cost, evaporation_rate, p_best = 0.3 ):
    n = len(graph.nodes.keys())
    
    max_pheromone = 1. / (evaporation_rate * cost)
    min_pheromone = max_pheromone * (1. - p_best**(1. / n)) / ((n/2.-1)*p_best**(1. / n))
    
    for name, node in graph.nodes.items():
        for edge in node.edges:
            edge.pheromone = min( max_pheromone, max( edge.pheromone, min_pheromone ))
    