from graph import Graph
from ANT import Ant, adjust_pheromones
import itertools
import copy

evaporation_rate = 0.1
Q = 1.

graph = Graph( "graph.txt" )

ants = [ Ant( graph ) for _ in xrange( 6 ) ]

current_best_solution = ( -1, None )

for name, node in graph.nodes.items():
    for edge in node.edges:
        edge.pheromone = 1000000


for i in xrange( 20 ):
    for ant in ants:
        ant.move()
        graph.reset_flow()
    
    for name, node in graph.nodes.items():
        for edge in node.edges:
            edge.pheromone *= (1 - evaporation_rate)
    
    best_ant = max( ants, key = lambda ant: ant.flow_through )
    
    if best_ant.flow_through > current_best_solution[0]:
        current_best_solution = ( best_ant.flow_through, copy.deepcopy(graph), copy.deepcopy(best_ant) )
        
    if best_ant.flow_through > 0:
        best_ant.deposite_pheromone( Q/best_ant.travel_cost )
        adjust_pheromones( graph, current_best_solution[2].travel_cost, evaporation_rate )
    
    print i, current_best_solution[0]
#end



flow, graph, ant = current_best_solution

print "Flow:", flow, "\tCost:", ant.travel_cost

graph.plotdot( ant )