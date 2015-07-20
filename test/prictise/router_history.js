/**
 * Created by cailong on 2015/7/20.
 */
require([
	'backbone'
], function(Backbone){
	module('router and history');

	test('history route', function(){
		var Router = Backbone.Router.extend({
			routes: {
				'test1': '_test1'
			},
			_test1: function(){
				equal(0 , 0, 'router的第一个测试通过');
			}
		});
		var router = new Router();
		Backbone.history.navigate('test1', true)
	});
});
