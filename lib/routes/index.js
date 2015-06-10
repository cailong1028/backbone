/**
 * Created by cailong on 2015/6/10.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	//res.render('index', { title: 'Express' });
	res.send({id: 'id_1'});
});

module.exports = router;
