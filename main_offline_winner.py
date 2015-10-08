from graph import Graph
from ANT import Ant
import itertools

evaporation_rate = 0.2

graph = Graph( "graph.txt" )

ants = [ Ant( graph ) for _ in xrange( 5 ) ]


for name, node in graph.nodes.items():
    for edge in node.edges:
        edge.pheromone = 0.1


for i in xrange( 20 ):
    for ant in ants:
        ant.move()
    
    for name, node in graph.nodes.items():
        for edge in node.edges:
            edge.pheromone *= (1 - evaporation_rate)
    
    groupbysink = itertools.groupby(ants, lambda ant: ant.current_position)
    
    for goal, discoverers in groupbysink:
        ant = min( discoverers, key=lambda ant: ant.travel_cost() )
        ant.deposite_pheromone()
    
    

graph.plotdot()