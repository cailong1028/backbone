/**
 * Created by cailong on 2015/6/2.
 */
(function(){
	module('Model test');
	var Model1, model1;
	test('simple Backbone Model set and get', function(){
		model1 = new Backbone.Model({id: 1, name: 'a'});
		equal(model1.get('name'), 'a', 'name should be "a"');
	});
	test('simple Backbone Model onChange', function(){
		var model1 = new Backbone.Model({id: 1, name: 'a'});
		model1.on('change', function(changed){
			equal(model1.get('name'), 'b', 'changed name should be "b"');
		});
		model1.set('name', 'b')
	});
	test('simple Backbone Model set and get', function(){
		Model1 = Backbone.Model.extend({
			validate: function(attrs){
				if(attrs.id !== 1) return 'invalid Id';
			},
			url: 'www.cailong.com'
		});
		model1 = new Model1({id: 1, name: 'cailong'});
		model1.on('change', function(changed){
			equal(model1.get('name'), '闻喜', 'cahnged name shoud be "闻喜"');
		});
		equal(model1.url, 'www.cailong.com', 'model url should be "www.cailong.com"');
		equal(model1.get('name'), 'cailong', 'model name should be "cailong"');
		model1.set('name', '闻喜');

		//validate ,
		var model2 = new Model1();
		equal(typeof model2.set({id: 1, name: 'model2 name'}), 'object', 'when id === 1, after model set , should return a model object');
	});

	//异步测试使用asyncTest
	asyncTest('model fetch(get) test', function(){
		var Model2 = Backbone.Model.extend({
			idAttribute: 'uuid',
			urlRoot: function(){
				return 'model';
			}
		});
		var model2 = new Model2({
			uuid: '2c5f84b2-0902-11e5-8ee1-f3d2a4a7088c'
		});
		model2.on('change', function(){
			equal(model2.get('name'), 'name_A');
		});
		model2.on('sync', function(){
			equal(model2.get('name'), 'name_A');
		});
		model2.fetch({data: {name: 'name_A'}, wait: true}).done(function(res){
			//执行done
			QUnit.start();
			equal(model2.get('name'), 'name_A');
		});
	});

	var Model = Backbone.Model.extend({
		urlRoot: 'model'
	});
	asyncTest('model create(post) test', function(){
		var model = new Model({name: 'model1Name'});
		model.on('change', function(){
			equal(model.get('id'), 'server return model id');
		});
		model.on('sync', function(){
			equal(model.get('id'), 'server return model id');
		});
		model.save({data:{sex: '男'}, wait: true}).done(function(){
			QUnit.start();
			equal(model.get('id'), 'server return model id');
		}).fail(function(){
			console.log('post fail!');
		});
	});

	asyncTest('model update(patch) test', function(){
		var model = new Model({id: 1, name: 'client model1Name'});
		model.on('change', function(){
			equal(model.get('name'), 'server return model name');
		});
		model.on('sync', function(){
			equal(model.get('name'), 'server return model name');
		});
		model.save({data: {name: 'server return model name'}, wait: true}).done(function(){
			QUnit.start();
			equal(model.get('name'), 'server return model name');
		}).fail(function(){
			console.log('patch fail!');
		});
	});

	asyncTest('model destory(delete) test', function(){
		var model = new Model({id: '1'});
		model.destroy({data:{name: 'deleted name'}, wait: true}).done(function(req){
			QUnit.start();
			equal(model.get('name'), 'deleted name');
			equal(model.get('deleted'), true);
		});
	});
})();