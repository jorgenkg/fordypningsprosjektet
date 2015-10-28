var cy = null;
var viewModel = null;
var flowChart = null;
var costChart = null;

$(function(){ // on dom ready
  var $overlay = $("#flowGraphCanvas");
  $overlay.attr("width", $overlay.parent().outerWidth());
  $overlay = $("#costGraphCanvas");
  $overlay.attr("width", $overlay.parent().outerWidth());
  
  viewModel = {
      solutions: ko.observableArray(),
    
      showGraphs: ko.observable(true),
      showSettings: ko.observable(false),
      progressValue: ko.observable( 0 ),
      
      settings: {
        sleepTime         : ko.observable(1),
        numberOfIterations: ko.observable(100),
        evaporationRate   : ko.observable(0.1),
        numberOfAnts      : ko.observable(7),
        Q                 : ko.observable(1.0),
        initialPheromone  : ko.observable(1.0),
        visualize         : ko.observable(false),
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
  
  
  flowChart = new Chart( $("#flowGraphCanvas").get(0).getContext("2d") );
  costChart = new Chart( $("#costGraphCanvas").get(0).getContext("2d") );
}); // on dom ready