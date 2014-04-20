'use strict';

angular.module('mean.graphs').controller('GraphsController', ['$scope', '$stateParams', '$location', 'Global', 'Graphs', function ($scope, $stateParams, $location, Global, Graphs) {
    $scope.global = Global;
    
    // Default to JSON format
    var DEFAULT_FORMAT = 'JSON';
    $scope.format = DEFAULT_FORMAT;
    
    $scope.create = function() {
    	
    	if( this.format !== 'JSON' && this.format !== 'XML' )
    		this.format = DEFAULT_FORMAT;
    	
    	// TODO - input format validation...
    	
        var graph = new Graphs({
            name: this.name,
            data: this.data,
            format: this.format
        });
        graph.$save(function(response) {
            $location.path('graphs/' + response._id);
        });

        this.title = '';
        this.content = '';
    };

    
    $scope.remove = function(graph) {
        if (graph) {
            graph.$remove();

            for (var i in $scope.graphs) {
                if ($scope.graphs[i] === graph) {
                    $scope.graphs.splice(i, 1);
                }
            }
        }
        else {
            $scope.graph.$remove();
            $location.path('graphs');
        }
    };

    $scope.update = function() {
        var graph = $scope.graph;
        if (!graph.updated) {
            graph.updated = [];
        }
        graph.updated.push(new Date().getTime());

        graph.$update(function() {
            $location.path('graphs/' + graph._id);
        });
    };
    

    $scope.find = function() {
        Graphs.byUser(function(graphs) {
            $scope.graphs = graphs;
        });
    };

    $scope.findOne = function() {
        Graphs.get({
            graphId: $stateParams.graphId
        }, function(graph) {
            $scope.graph = graph;
            if( graph.format === chronograph.data.JSON ){
            	$scope.parsedData = JSON.stringify(JSON.parse(graph.data), null, '\t');
            }
            else{
            	$scope.parsedData = graph.data;
            }
        });
    };
    
    
    $scope.chronograph = function(){
    	
    	Graphs.get({
            graphId: $stateParams.graphId
        }, function(graph) {
            $scope.graph = graph;
            var graphObj;
            
            graphObj = chronograph.newGraph(graph._id, graph.name, graph.data, graph.format);
            
            gravity.load('#chronograph_container', graphObj);
        });
    	
    };
    
    $scope.importTraversal = function(){
    	Graphs.get({
            graphId: $stateParams.graphId
        }, function(graph) {
            $scope.graph = graph;
            
            var graphObj = chronograph.newGraph(graph._id, graph.name, graph.data, graph.format);
            
            try{
            	var result = graphObj.importTraversalData($scope.traversalData, $scope.label, chronograph.data.RAW_TRAVERSAL);
            	
            	var graphData = graphObj.exportData();
            	
            	graph.data = JSON.stringify(graphData);
            	graph.format = chronograph.data.JSON; // Exported data is always in JSON for now.
            	
            	if (!graph.updated) {
                    graph.updated = [];
                }
                graph.updated.push(new Date().getTime());
                
                graph.$update(function() {
                    $location.path('graphs/' + graph._id);
                });
            }
            catch(e){
            	if(e.name !== 'ChronographException' )
            		throw e;
            	
            	// Handle the error.
            	console.error(e.message);
            }
        });
    };
}]);