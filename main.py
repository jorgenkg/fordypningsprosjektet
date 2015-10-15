from graph import Graph
from ANT import Ant, adjust_pheromones
import itertools
import copy

N_ITERATIONS     = 50
EVAPORATION_RATE = 0.1
N_ANTS           = 8
Q                = 1.


graph            = Graph( "graph.txt" )
ants             = [ Ant( graph ) for _ in range( N_ANTS ) ]


highest_flow     = -1
best_ant         = None


for name, node in graph.nodes.items():
    for edge in node.edges:
        edge.pheromone = 1000000


for i in range( N_ITERATIONS ):
    for ant in ants:
        ant.move()
        graph.reset_flow()
    
    for name, node in graph.nodes.items():
        for edge in node.edges:
            edge.pheromone *= (1 - EVAPORATION_RATE)
    
    fittest_ant = min( ants, key = lambda ant: ant.travel_cost )
    
    if fittest_ant.flow_through > highest_flow:
        highest_flow     = fittest_ant.flow_through
        best_ant         = copy.deepcopy(fittest_ant)
    elif fittest_ant.flow_through == highest_flow and best_ant.travel_cost > fittest_ant.travel_cost:
        highest_flow     = fittest_ant.flow_through
        best_ant         = copy.deepcopy(fittest_ant)
    
    if fittest_ant.flow_through > 0:
        fittest_ant.deposite_pheromone( Q/fittest_ant.travel_cost )
    
    adjust_pheromones( graph, best_ant.travel_cost, EVAPORATION_RATE )
    
    print( "* Iteration %d\tCurrent flow: %d\tBest flow: %d" % (i, fittest_ant.flow_through, highest_flow))
#end




print( "Flow:", highest_flow, "\tCost:", best_ant.travel_cost)

# Uncomment this line to draw the resulting flow graph
# Requires you to install PyDot
# best_ant.graph.plotdot( best_ant )