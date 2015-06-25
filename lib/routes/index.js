/**
 * Created by cailong on 2015/6/10.
 */
var express = require('express');
var router = express.Router();

var tickets_types = [{name: "咨询"}, {name: "建议"}, {name: "投诉"}];
/* GET home page. */
router.get('/', function(req, res, next) {
	//res.render('index', { title: 'Express' });
	res.send({id: 'id_1'});
});

//jsonp
router.get('/tickets-type-collection', function(req, res, next) {
	var ret = 'jsonpCallback([{name: "咨询"}, {name: "建议"}, {name: "投诉"}])';
	res.send(ret);
});

router.get('/api/tickets/ticketfilterdomain', function(req, res, next) {
	var ret = 'jsonpCallback({"type":["Consulting service","Proposals","Requests","Complaints","Other"]})';
	res.send(ret);
});

module.exports = router;
