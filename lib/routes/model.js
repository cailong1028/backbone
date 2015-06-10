/**
 * Created by cailong on 2015/6/10.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:model_id', function(req, res, next) {
	//res.render('index', { title: 'Express' });
	res.json({'uuid': req.params.model_id, name: 'name_A'});
});

module.exports = router;