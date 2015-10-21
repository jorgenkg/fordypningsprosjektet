var cy = null;
var viewModel = null;

$(function(){ // on dom ready
  viewModel = {
      solutions: ko.observableArray(),
    
      showSettings: ko.observable(false),
      progressValue: ko.observable( 0 ),
      
      settings: {
        sleepTime         : ko.observable(300),
        numberOfIterations: ko.observable(100),
        evaporationRate   : ko.observable(0.1),
        numberOfAnts      : ko.observable(6),
        Q                 : ko.observable(1.0),
        initialPheromone  : ko.observable(100000.0),
        visualize         : ko.observable(true),
      }
  };
  
  ko.applyBindings( viewModel );
  
  cy = cytoscape({
    container: document.getElementById('cy'),
  
    style: cytoscape.stylesheet()
      .selector('node')
        .css({
          'content': 'data(id)'
        })
      .selector('edge')
        .css({
          'target-arrow-shape': 'triangle',
          'width': 2,
          'line-color': '#ddd',
          'target-arrow-color': '#ddd',
          'content': 'data(label)'
        }),
  
    elements: predefined_graph1,
  
    layout: {
      name: "circle",
      roots: '#0'
    }
  });
}); // on dom ready