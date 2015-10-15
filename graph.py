import collections


class Edge:
    def __init__(self, source, sink, flow_limit, cost, aquisition_cost):
        self.key                = hash(self)
        self.render             = True
                                
        self.source             = source
        self.sink               = sink
        
        self.cost               = float(cost)
        self.aquisition_cost    = float(aquisition_cost)
        
        self.pheromone          = 0
        self.visibility         = 1 / self.aquisition_cost
        
        self.flow_limit         = float( flow_limit )
        self.capacity = self.flow_limit
        self.usable             = True 
    #end
    
    def __repr__(self, ):
        # DEBUG: defined how `print Edge()` should appear in the console.
        return u"%s -> %s" % (self.source.name, self.sink.name)
#endclass

class Node:
    def __init__(self, name = "-" ):
        self.edges         = []
        self.name          = str(name)

    #end
    
    def add_child(self, edge_flow_limit, cost, aquisition_cost, node ):
        # Create an edge to a child node
        self.edges.append(
            Edge( self, node, edge_flow_limit, cost, aquisition_cost )
        )
    #end
    
    def reset_flow(self, ):
        # The capacity variable keeps track of how much flow may still be 
        # funneled through a given edge. The value will be decreased each time 
        # a flow unit is routed through the edge. Therefore we need to reset 
        # the counter after each ant has constructed their solution.
        for edge in self.edges:
            edge.capacity = edge.flow_limit
            edge.usable   = True
    #end
    
    def has_valid_edges(self,  tabu ):
        return any( edge.usable and edge.capacity > 0 and edge.sink not in tabu 
                    for edge in self.edges)
    #end
    
    def valid_edges(self, tabu ):
        return [ edge 
                 for edge in self.edges 
                 if edge.usable and edge.capacity > 0 and edge.sink not in tabu ]
#endclass



class Graph:
    def __init__(self, filename ):
        with open( filename, "r") as f:
            lines = map( lambda x: x.strip().split(), f.readlines() )
            lines = filter(
                lambda line: line[0] != "//",
                lines
            )
        
        start           = lines.pop(0)[0]
        goals           = lines.pop(0)
        
        nodeids         = set( x for sourceid, sinkid, flow_limit, cost, aquisition_cost in lines for x in [sourceid, sinkid] )
        
        self.nodes      = { nodeid : Node( name = nodeid ) for nodeid in nodeids }
        self.start_node = self.nodes[ start ]
        self.goal_nodes = [ self.nodes[ name ] for name in goals ]
        
        for sourceid, sinkid, flow_limit, cost, aquisition_cost in lines:
            self.nodes[ sourceid ].add_child( flow_limit, cost, aquisition_cost, self.nodes[ sinkid ])
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
                    label = u"%d of %1.f [%1.03f]" % (lookup[ edge.key ], edge.flow_limit, edge.pheromone)
                    drawing.add_edge(pydot.Edge( name , edge.sink.name, label=label))

        drawing.write_pdf('network.pdf')
    #end
    
    def reset_flow(self, ):
        for key, node in self.nodes.items():
            node.reset_flow()
    #end