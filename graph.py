import collections

class EdgeBase:
    def __init__(self, source, sink):
        self.key = hash(self)
        
        self.source    = source
        self.sink      = sink
        
        self.pheromone = 0
#endclass

class Edge( EdgeBase ):
    def __init__(self, source, sink, weight):
        EdgeBase.__init__(self, source, sink)
        
        self.render = True 
        
        self.cost = 1. # float
        self.weight    = float( weight )
        self.visibility = 1. / self.cost
#endclass

class GhostEdge( EdgeBase ):
    def __init__(self, source, sink, weight ):
        EdgeBase.__init__(self, source, sink)
        
        self.render = False 
        
        self.weight = 0
        self.cost = 0. # float
        self.visibility = 1. / float(weight)
#endclass

class Node:
    def __init__(self, name = "-" ):
        self.edges = []
        self.name  = str(name)
    #end
    
    def add_child(self, edge_weight, node ):
        self.edges.append( Edge( self, node, edge_weight ))
        self.edges.append( GhostEdge( self, node, edge_weight ))
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
        
        for name, node in self.nodes.items():
            for edge in node.edges:
                if edge.render:
                    label = str(edge.weight) + ("" if not edge.key in map(lambda x: x.key, ant.traveled_edges) else " *")
                    drawing.add_edge(pydot.Edge( name , edge.sink.name, label=label))

        drawing.write_pdf('network.pdf')
    #end
    
    def find_path(self, source, sink, traveled_edges_keys, path = []):
        if source == sink:
            return path
        
        for edge in source.edges:
            residual = edge.weight - self.flow[ edge.key ]
            if residual > 0 and (edge.key, edge) not in path and edge.key in traveled_edges_keys:
                result = self.find_path( edge.sink, sink, traveled_edges_keys, path + [(edge.key, edge)]) 
                if result != None:
                    return result
 
    def max_flow(self, source, sink, traveled_edges ):
        self.flow = collections.defaultdict(int)
        traveled_edges_keys = map(lambda x: x.key, traveled_edges)
        path = self.find_path(source, sink, traveled_edges_keys)
        
        while path != None:
            residuals = [edge.weight - self.flow[key] for key, edge in path]
            flow = min(residuals)
            for key, edge in path:
                self.flow[key] += flow
            path = self.find_path(source, sink, traveled_edges_keys)
        return sum(self.flow[edge.key] for edge in source.edges)
#endclass