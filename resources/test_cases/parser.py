template = """{{
    nodes: [
{nodes}
    ],
    edges: [
{edges}
    ]
}}"""


node_template = "\t\t{{ data: {{ id: '{name}' }} }},"
edge_template = "\t\t{{ data: {{ id: '{name}', weight: {flow}, source: '{source}', target: '{target}' }} }},"

with open("resources/test_cases/graph1.txt","r") as f:
    n = int(f.readline())
    
    nodes = [ (i, node_template.format( name = str(i) )) for i in range( n ) ]
    edges = []
    
    for i in xrange( n ):
        connections = map(int, f.readline().split())
        for j, capacity in enumerate(connections):
            if capacity != 0:
                edges.append( edge_template.format( 
                                name="%s>%s" % ( nodes[i][0], nodes[j][0] ),
                                flow = capacity,
                                source = nodes[i][0],
                                target = nodes[j][0],
                            ))
    print template.format( nodes="\n".join([s for x,s in nodes]), edges='\n'.join(edges) )


    
    
        
    