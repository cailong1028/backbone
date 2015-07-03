/**
 * Created by cailong on 2015/6/16.
 */
(function(){
	module('Backbone Collection');

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

	test('reset', function(){
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
		col.reset(model3);
		ok(col.get(model3) === model3);
	});

	test('get', function(){
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
		ok(col.get(model1) === model1);
		ok(col.get({id: 2, name: 'b'}) != model2, '属性相同,依然不是用一个对象');
		ok(col.get(model3) !== model3);
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

	test('at', function(){
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
		equal(col.at(0), model1, 'collection models[0] === model1');
	});

	test('toJSON', function(){
		var model1 = new Model({
			id: 1,
			name: 'a'
		});
		col = new Collection(model1);
		equal(col.toJSON()[0].name, 'a', 'toJSON返回的是models的数组对象');
	});

	test('add', function(){
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
		col.add(model2);
		equal(col.models.length, 2, 'collection 中不存储相同的model对象');
		col.add([model1, model2]);
		equal(col.models.length, 2, 'collection 中不存储相同的model对象');
		col.add([model3]);
		equal(col.models.length, 3, '添加一个新的model对象,长度增加为3');
	});

	test('push', function(){
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
		col.push(model3);
		equal(col.models.length, 3, 'push一个新的model对象,长度增加为3');
		col.push([{id: 4, name: 4}, {id: 5, name: '5'}]);
		equal(col.models.length, 5, 'push model array to collection');
		col.push([model3, {id: 6, name: '6'}]);
		equal(col.models.length, 6, 'push 一个已在models中的model对象,不会add');
	});

	test('pop', function(){
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
		col = new Collection([model1, model2, model3]);
		equal(col.pop(), model3, 'pop出 collection中 models中的最后一个对象');
		equal(col.length, 2, 'pop 一个model之后 collection length--');
	});

	test('shift', function(){
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
		col = new Collection([model1, model2, model3]);
		equal(col.shift(), model1, 'shift collection中 models中的第一个对象');
		equal(col.length, 2, 'shift 一个model之后 collection length--');
	});

	test('unshift', function(){
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
		equal(col.unshift(model3).at(0), model3, 'unshift models add 到 models的第一位置');
		equal(col.length, 3, 'unshift 一个model之后 collection length + 1');
		equal(col.unshift([{id: 4, name: '4'}, {id: 5, name: '5'}]).at(0).get('name'), '5', 'unshift [modles]');
		equal(col.length, 5, 'unshift 一个model之后 collection length 增加');
		equal(col.unshift(model3).length, 5, 'unshift 已存在的model 对象, 没有操作发生');
	});

	test('length', function(){
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
		col = new Collection([model1, model2, model3]);
		equal(col.length, 3, 'col.length === 3');
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
})();
