/**
 * Created by cailong on 2015/6/16.
 */
var express = require('express');
var router = express.Router();
var url = require('url');

router.get('', function(req, res, next){
	var query = url.parse(req.url, true).query;
	console.log(query);
	var models = [{id: 1, name: 'a'}, {id: 2, name: 'b'}];
	res.json(models);
});

module.exports = router;

