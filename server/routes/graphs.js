'use strict';

// Articles routes use articles controller
var graphs = require('../controllers/graphs');
var authorization = require('./middlewares/authorization');

//Article authorization helpers
var hasAuthorization = function(req, res, next) {
	if (req.graph.user.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

module.exports = function(app) {
	
	app.get('/graphs', graphs.all);
	app.get('/graphs/user', graphs.allForUser);
    app.post('/graphs', authorization.requiresLogin, graphs.create);
    app.get('/graphs/:graphId', graphs.show);
    app.put('/graphs/:graphId', authorization.requiresLogin, hasAuthorization, graphs.update);
    app.del('/graphs/:graphId', authorization.requiresLogin, hasAuthorization, graphs.destroy);
    
 // Finish with setting up the graphId param
    app.param('graphId', graphs.graph);
};