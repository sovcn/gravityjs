'use strict';

angular.module('mean.graphs').controller('GraphsController', ['$scope', '$stateParams', '$location', 'Global', 'Graphs', function ($scope, $stateParams, $location, Global, Graphs) {
    $scope.global = Global;
    
    // Default to JSON format
    var DEFAULT_FORMAT = 'JSON';
    var PLAYBACK_ARBITRARY = 'ARB';
    var PLAYBACK_REAL = 'REAL';
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
    

    // Chronograph Setup
    $scope.isEditMode = false;
    $scope.playSpeed = 1;
    var playSpeedScale = d3.scale.pow()
                                    .exponent(2.5)
                                     .domain([0, 100])
                                     .range([0, 10]);

    // Called when Edit button is clicked.
    $scope.chronographEdit = function(event){
        if( !$scope.graphObj || $scope.graphObj == undefined ){
            console.error("Error: No graph is loaded, cannot change mode.");
            return;
        }

        $scope.graphObj.setMode("edit");

        $scope.isEditMode = true;
    };

    // Called when Save button is clicked.
    $scope.chronographSave = function(){
        if( !$scope.graphObj || $scope.graphObj == undefined || !$scope.graph || $scope.graph == undefined  ){
            console.error("Error: No graph is loaded, cannot change mode.");
            return;
        }

            var graphData = $scope.graphObj.exportData();
            var graph = $scope.graph;
            graph.data = JSON.stringify(graphData);
            graph.format = chronograph.data.JSON; // Exported data is always in JSON for now.
            
            if (!graph.updated) {
                graph.updated = [];
            }
            graph.updated.push(new Date().getTime());
            
            graph.$update(function() {
                $scope.drawGraph(graph);

                $scope.isEditMode = false;
                $scope.graphObj.setMode("view");
            });
    };

    // Used to draw the graph whenever it is loaded.
    $scope.drawGraph = function(graph){
        $scope.graphObj = chronograph.newGraph(graph._id, graph.name, graph.data, graph.format);
            
        $scope.graphObj.draw('#graph_container');
        $scope.graphObj.setMode("view");

        //$scope.graphObj.calculateTraversalMap(15);

        $scope.timeline = chronograph.newTimeline("#timeline_container", "#play_button_container", [0, 500], [0, $scope.graphObj.maxSteps], function(value){
            $scope.graphObj.setArbitraryTimeStep(value);
        });
        $scope.timeline.draw();


        // Set up play speed slider

        $('#playSpeedSlider').slider({
            max: 100,
            value: 50,
            slide: function(event, ui){
                var value = $(this).slider("value");

                // Make sure that Angular knows about the change...
                $scope.$apply(function(){
                    value = playSpeedScale(value);
                    value = Math.floor(value*100)/100;
                    $scope.playSpeed = value;
                    $scope.timeline.setPlaySpeed(value);
                });
            }
        });
    }

    $scope.chronographCancel = function(){
        if( !$scope.graphObj || $scope.graphObj == undefined ){
            console.error("Error: No graph is loaded, cannot change mode.");
            return;
        }

        Graphs.get({
            graphId: $scope.graphObj.id
        }, function(graph) {
            $scope.graph = graph;
            
            $scope.drawGraph(graph);
            
            $scope.isEditMode = false;
            $scope.graphObj.setMode("view");

        });
    };

    $scope.isSelectedAgent = function(id){
        if( id in $scope.selectedAgents )
            return true;
        else
            return false;
    }

    $scope.agentClick = function(id){
        if( !$scope.graphObj || $scope.graphObj == undefined ){
            console.error("Error: No graph is loaded, cannot perform this action.");
            return;
        }

        if( id in $scope.selectedAgents ){
            delete $scope.selectedAgents[id];
        }
        else{
            $scope.selectedAgents[id] = true;
        }
        $scope.graphObj.agents[id].select($scope.graphObj.agents);
    };

    $scope.heatmapToggle = function(){

        if( !$scope.graphObj || $scope.graphObj == undefined ){
            console.error("Error: No graph is loaded, cannot perform this action.");
            return;
        }

        if( $scope.heatmap ){
            console.log("Heatmap.");
            $scope.graphObj.enableHeatmap();
        }
        else{
            console.log("No Heatmap.");
            $scope.graphObj.disableHeatmap();
        }
    };
    
    $scope.chronograph = function(){
    	
        $scope.selectedAgents = {};
        $scope.playback = PLAYBACK_ARBITRARY;
        $scope.heatmap = false;

    	Graphs.get({
            graphId: $stateParams.graphId
        }, function(graph) {
            $scope.graph = graph;
            
            $scope.drawGraph(graph);

            $scope.agents = $scope.graphObj.agents;
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