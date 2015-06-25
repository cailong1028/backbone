/**
 * Created by cailong on 2015/6/16.
 */
(function(){
	module('Backbone collection');

	var Model = Backbone.Model.extend({});
	var Collection = Backbone.Collection.extend({
		model: Model,
		parse: function(res){
			return res;
		},
		url: 'collection'
	});
	var col2 = new Backbone.Collection([{name: 'foo', age: 16}, {name: 'bar', age: 12}]);
	var col = new Collection();

	test('set', function(){
		var model = new Model({name: 'zhangsan', age: 25});
		col.set(model);
		equal(col.get(model).get('name'), 'zhangsan');
	});

	asyncTest('fetch', function(){
		col = new Collection;
		col.on('add', function(changeModels){
			equal(changeModels.length, 2);
		});
		col.on('remove', function(changeModels){
			equal(changeModels.length, 1);
			equal(changeModels[0].get('name'), 'zhangsan');
		});
		col.set({name: 'zhangsan', age: 25}, {silent: true});
		col.fetch({data: {id: 1, name: 'client name', sex: 'male'}, wait: true, reset: true}).done(function(){
			QUnit.start();
			equal(col.models.length, 2, 'collection models.length should be 2');
		});
	});
})();
