class Edge:
    def __init__(self, source, sink, weight):
        self.source    = source
        self.sink      = sink
        self.weight    = float( weight )
        
        self.pheromone = 0
        self.visibility = (self.weight / max( self.pheromone, 1))**2
#endclass

class Node:
    def __init__(self, name = "-" ):
        self.edges = []
        self.name  = str(name)
    #end
    
    def add_child(self, edge_weight, node ):
        self.edges.append( Edge( self, node, edge_weight ))
    #end
#endclass

class Graph:
    def __init__(self, filename ):
        with open( filename, "r") as f:
            lines = map( lambda x: x.strip().split(), f.readlines() )
        
        start           = lines.pop(0)[0]
        goals           = lines.pop(0)
        
        nodeids         = [ x for sourceid, sinkid, weight in lines for x in [sourceid, sinkid] ]
        
        self.nodes      = { nodeid : Node( name = nodeid ) for nodeid in nodeids }
        self.start_node = self.nodes[ start ]
        self.goal_nodes = [ self.nodes[ name ] for name in goals ]
        
        for sourceid, sinkid, weight in lines:
            self.nodes[ sourceid ].add_child( weight, self.nodes[ sinkid ])
    #end
    
    def plotdot(self, ):
        import pydot
        drawing = pydot.Dot(graph_type='digraph', rankdir="LR",  fontname="Monaoc")

        for name, node in self.nodes.items():
            if node == self.start_node:
                color = "#eeeeee"
            elif node in self.goal_nodes:
                color = "#dddddd"
            else:
                color = "#ffffff"    
            drawing.add_node( pydot.Node( name, style="filled", fillcolor=color, fontname="Monaoc") )

        for name, node in self.nodes.items():
            for edge in node.edges:
                drawing.add_edge(pydot.Edge( name , edge.sink.name, label="%d %0.02f" % (edge.weight, edge.pheromone) ))

        drawing.write_pdf('network.pdf')
    #end
#endclass