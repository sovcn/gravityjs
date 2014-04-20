'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Graph = mongoose.model('Graph'),
    _ = require('lodash');

/**
 * Create Graph
 */
exports.create = function(req, res) {
    var graph = new Graph(req.body);
    graph.user = req.user;

    graph.save(function(err) {
        if (err) {
            return res.send('/', {
                errors: err.errors,
                graph: graph
            });
        } else {
            res.jsonp(graph);
        }
    });
};


/**
 * List of Graphs
 */
exports.all = function(req, res) {
    Graph.find().sort('-modified').populate('user', 'name username').exec(function(err, graphs) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(graphs);
        }
    });
};



/**
 * List of Graphs for Current User
 */
exports.allForUser = function(req, res) {
    Graph.find({user: req.user}).sort('-modified').populate('user', 'name username').exec(function(err, graphs) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(graphs);
        }
    });
};


/**
 * Find Graph by id
 */
exports.graph = function(req, res, next, id) {
    Graph.load(id, function(err, graph) {
        if (err) return next(err);
        if (!graph) return next(new Error('Failed to load graph ' + id));
        req.graph = graph;
        next();
    });
};

/**
 * Show a Graph
 */
exports.show = function(req, res) {
    res.jsonp(req.graph);
};


/**
 * Update a Graph
 */
exports.update = function(req, res) {
    var graph = req.graph;

    graph = _.extend(graph, req.body);

    graph.save(function(err) {
        if (err) {
            return res.send('/', {
                errors: err.errors,
                graph: graph
            });
        } else {
            res.jsonp(graph);
        }
    });
};


/**
 * Destroy a Graph
 */
exports.destroy = function(req, res) {
    var graph = req.graph;

    graph.remove(function(err) {
        if (err) {
            return res.send('/', {
                errors: err.errors,
                graph: graph
            });
        } else {
            res.jsonp(graph);
        }
    });
};