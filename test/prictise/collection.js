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
		col.fetch({data: {id: 1, name: 'client name', sex: 'male'}, reset: true}).done(function(){
			QUnit.start();
			equal(col.models.length, 2, 'collection models.length should be 2');
		});
	});

	test('set reset=false', function(){
		var model1 = new Model({
			id: 1,
			name: 'a'
		}), model2 = new Model({
			id: 2,
			name: 'b'
		}), model3 = new Model({
			id: 3,
			name: 'c'
		});
		col = new Collection([model1, model2]);
		col.on('add', function(changeModels){
			equal(changeModels.length, 1, 'add length is 1');
		});
		col.on('remove', function(changeModels){
			equal(changeModels.length, 1, 'remove length is 1');
		});
		col.set([model2, model3], {reset: false});
	});

	test('set reset=true', function(){
		var model1 = new Model({
			id: 1,
			name: 'a'
		}), model2 = new Model({
			id: 2,
			name: 'b'
		}), model3 = new Model({
			id: 3,
			name: 'c'
		});
		col = new Collection([model1, model2]);
		col.on('add', function(changeModels){
			equal(changeModels.length, 2, 'add length is 2');
		});
		col.on('remove', function(changeModels){
			equal(changeModels.length, 2, 'remove length is 2');
		});
		col.set([model2, model3], {reset: true});
	});

	test('remove', function(){
		var model1 = new Model({
			id: 1,
			name: 'a'
		}), model2 = new Model({
			id: 2,
			name: 'b'
		}), model3 = new Model({
			id: 3,
			name: 'c'
		});
		col = new Collection([model1, model2]);
		col.on('remove', function(removeModels){
			equal(removeModels[0].get('name'), 'a', '删除的model的name是a');
		});
		col.remove(model1);
	});
})();
