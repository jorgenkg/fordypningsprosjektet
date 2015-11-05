import random

class Node:
    def __init__(self, name ):
        self.name = name
        self.children = []
    #end
    
    def add_children(self, nodes ):
        self.children = [ (node, random.randint( min_weight, max_weight )) for node in nodes ]
    #end
#endclass


"""
VARIABLES
"""
max_weight  = 8
min_weight  = 1
n_nodes     = 100
max_degree  = 7



nodes       = [ Node(str(i)) for i in xrange( n_nodes )]

for i, node in enumerate(nodes):
    if i == 0:
        node.add_children( random.sample(set(nodes)-set([node]), max_degree ))
    elif node != nodes[-1]:
        # not the last node (sink)
        chosen_degree = random.randint( 1, max_degree )
        node.add_children( random.sample(set(nodes)-set([node]), chosen_degree))



template = """{{
    nodes: [
{nodes}
    ],
    edges: [
{edges}
    ]
}};"""


node_template = "\t\t{{ data: {{ id: '{name}' }} }},"
edge_template = "\t\t{{ data: {{ id: '{name}', weight: {flow}, source: '{source}', target: '{target}' }} }},"

nodes_string = [ node_template.format( name = node.name ) for node in nodes ]
edges_string = []

for source in nodes:
    for sink, capacity in source.children:
        edges_string.append( edge_template.format( 
                        name="%s>%s" % ( source.name, sink.name ),
                        flow = capacity,
                        source = source.name,
                        target = sink.name,
                    ))
print template.format( nodes="\n".join(nodes_string), edges='\n'.join(edges_string) )