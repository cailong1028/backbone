/**
 * Created by cailong on 2015/6/2.
 */
(function(){
	module('Model test');
	test('simple Backbone Model set and get', function(){
		var model1 = new Backbone.Model({id: 1, name: 'a'});
		equal(model1.get('name'), 'a', 'name should be "a"');
	});
	test('simple Backbone Model onChange', function(){
		var model1 = new Backbone.Model({id: 1, name: 'a'});
		model1.on('change', function(changed){
			ok(changed.name === 'b', 'changed name should be "b"');
		});
		model1.set('name', 'b')
	});
	test('simple Backbone Model set and get', 3, function(){
		var Model1 = Backbone.Model.extend({
			url: 'www.cailong.com'
		});
		var model1 = new Model1({id: 1, name: 'cailong'});
		model1.on('change', function(changed){
			equal(changed.name, '闻喜', 'cahnged name shoud be "闻喜"');
		});
		equal(model1.url, 'www.cailong.com', 'model url should be "www.cailong.com"');
		equal(model1.get('name'), 'cailong', 'model name should be "cailong"');
		model1.set('name', '闻喜');
	});
})();