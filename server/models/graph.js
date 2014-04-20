'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Graph Schema
 */
var GraphSchema = new Schema({
	name: {type: String, required: true},
	data: {type: String, required: true},
	format: {type: String, default: 'JSON'},
	modified: {type: Date, default: Date.now},
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

/**
 * Statics
 */
GraphSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').exec(cb);
};

mongoose.model('Graph', GraphSchema);
