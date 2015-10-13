import collections

class EdgeBase:
    def __init__(self, source, sink):
        self.key = hash(self)
        
        self.render = True
        
        self.source    = source
        self.sink      = sink
        
        self.pheromone = 0
        self.usable = True
#endclass

class Edge( EdgeBase ):
    def __init__(self, source, sink, flow_limit):
        EdgeBase.__init__(self, source, sink) 
        
        self.cost = 1. # float
        self.flow_limit    = float( flow_limit )
        
        self.visibility = self.flow_limit
        self.current_flow_limit = self.flow_limit
    #end
    
    def reset_flow(self, ):
        self.current_flow_limit = self.flow_limit
    #end
    
    def __repr__(self, ):
        return u"%s -> %s" % (self.source.name, self.sink.name)
#endclass

class Node:
    def __init__(self, name = "-" ):
        self.edges = []
        self.reverse_edges = []
        self.name  = str(name)
    #end
    
    def add_child(self, edge_flow_limit, node ):
        self.edges.append( Edge( self, node, edge_flow_limit ))
        node.reverse_edges.append( self.edges[-1] )
    #end
    
    def reset_flow(self, ):
        for edge in self.edges:
            edge.current_flow_limit = edge.flow_limit
    #end
    
    def valid_edges(self, ):
        return [ edge for edge in self.edges if edge.usable and edge.current_flow_limit > 0 ]
#endclass

class Graph:
    def __init__(self, filename ):
        with open( filename, "r") as f:
            lines = map( lambda x: x.strip().split(), f.readlines() )
        
        start           = lines.pop(0)[0]
        goals           = lines.pop(0)
        
        nodeids         = [ x for sourceid, sinkid, flow_limit in lines for x in [sourceid, sinkid] ]
        
        self.nodes      = { nodeid : Node( name = nodeid ) for nodeid in nodeids }
        self.start_node = self.nodes[ start ]
        self.goal_nodes = [ self.nodes[ name ] for name in goals ]
        
        for sourceid, sinkid, flow_limit in lines:
            self.nodes[ sourceid ].add_child( flow_limit, self.nodes[ sinkid ])
    #end
    
    def plotdot(self, ant ):
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
        
        
        lookup = collections.defaultdict(int)
        
        for edge in ant.traveled_edges:
            lookup[ edge.key ] += 1
        
        for name, node in self.nodes.items():
            for edge in node.edges:
                if edge.render:
                    label = str(edge.flow_limit) +" [%d]" % lookup[ edge.key ]
                    drawing.add_edge(pydot.Edge( name , edge.sink.name, label=label))

        drawing.write_pdf('network.pdf')
    #end
    
    def reset_flow(self, ):
        for key, node in self.nodes.items():
            node.reset_flow()
    #end