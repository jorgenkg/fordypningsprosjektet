from graph import Graph
from ANT import Ant
import itertools

evaporation_rate = 0.1

graph = Graph( "graph.txt" )

ants = [ Ant( graph ) for _ in xrange( 10 ) ]


for name, node in graph.nodes.items():
    for edge in node.edges:
        edge.pheromone = 0.1


for i in xrange( 20 ):
    for ant in ants:
        ant.move()
    
    for name, node in graph.nodes.items():
        for edge in node.edges:
            edge.pheromone *= (1 - evaporation_rate)
    
    for ant in ants:
        ant.deposite_pheromone( )
    
    

graph.plotdot()