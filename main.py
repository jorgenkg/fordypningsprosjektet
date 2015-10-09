from graph import Graph
from ANT import Ant
import itertools

evaporation_rate = 0.1

graph = Graph( "graph.txt" )

ants = [ Ant( graph ) for _ in xrange( 5 ) ]


for name, node in graph.nodes.items():
    for edge in node.edges:
        edge.pheromone = 1000


for i in xrange( 50 ):
    for ant in ants:
        ant.move()
    
    for name, node in graph.nodes.items():
        for edge in node.edges:
            edge.pheromone *= (1 - evaporation_rate)
    
    for ant in ants:
        ant.deposite_pheromone()
    #groupbysink = itertools.groupby(ants, lambda ant: ant.current_position)
    #
    #for goal, discoverers in groupbysink:
    #    best_ant = max( discoverers, key=lambda ant: ant.travel_cost() )
    #    best_ant.deposite_pheromone()

graph.plotdot()