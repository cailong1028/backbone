/**
 * Created by cailong on 2015/6/10.
 */
var express = require('express');
var router = express.Router();
var url = require('url');
var _ = require('underscore');

/* GET home page. */
router.get('/:model_id', function(req, res, next) {
	//res.render('index', { title: 'Express' });
	var query = url.parse(req.url, true).query;
	res.json({'uuid': req.params.model_id, name: query.name});
});

router.post('/', function(req, res, next){
	var bodyJson = req.body;
	//on create add a 'id' attribute
	bodyJson.id = 'server return model id';
	res.json(bodyJson);
});

router.patch('/:model_id', function(req, res, next){
	var bodyJson = req.body;
	bodyJson.name = bodyJson.name;
	res.json(bodyJson);
});

router.delete('/:model_id', function(req, res, next){
	var bodyJson = req.body;
	res.json(_.extend({},{model_id: req.params.model_id}, bodyJson, {deleted: true}));
});

module.exports = router;