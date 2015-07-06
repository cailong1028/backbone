/**
 * Created by cailong on 2015/6/15.
 */
require(['backbone'], function(/*Backbone*/){
	module('dtd');

	var dtdFunc = function(obj){
		var dtd = new Backbone.Dtd;
		setTimeout(function(){
			obj.i = 2;
			dtd.resolve();
		}, 0);
		obj.i = 1;
		return dtd.promise();
	};

	asyncTest('dtd test!', function(){
		var foo = {i: 0};
		dtdFunc(foo).done(function(){
			QUnit.start();
			equal(foo.i, 2, 'foo.i should be 2 after dtd resolve');
		}).done(function(){
			foo.i++;
			equal(foo.i, 3, 'foo.i should be 3 after dtd resolve');
		}).done([function(){
			foo.i++;
			equal(foo.i, 4, 'foo.i should be 4 after dtd resolve');
		}, function(){
			foo.i++;
			equal(foo.i, 5, 'foo.i should be 5 after dtd resolve');
		}]);
	});
});
