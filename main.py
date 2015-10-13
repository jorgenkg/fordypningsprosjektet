from graph import Graph
from ANT import Ant, adjust_pheromones
import itertools
import copy

evaporation_rate = 0.1
Q = 50

graph = Graph( "graph.txt" )

ants = [ Ant( graph ) for _ in xrange( 6 ) ]

current_best_solution = ( -1, None )

for name, node in graph.nodes.items():
    for edge in node.edges:
        edge.pheromone = 1000000


for i in xrange( 100 ):
    for ant in ants:
        ant.move()
    
    for name, node in graph.nodes.items():
        for edge in node.edges:
            edge.pheromone *= (1 - evaporation_rate)
    
    
    best_ant = max( ants, key = lambda ant: ant.flowed() )
    flowed = ant.flowed()
    if flowed:
        best_ant.deposite_pheromone( flowed )
        adjust_pheromones( graph, flowed, evaporation_rate )
    
    if flowed > current_best_solution[0]:
        current_best_solution = ( flowed, copy.deepcopy(graph), copy.deepcopy(best_ant) )
    
    print i, current_best_solution[0]

print "Flow:", current_best_solution[0]
graph = current_best_solution[1]
graph.plotdot( current_best_solution[2] )