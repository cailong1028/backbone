/**
 * Created by cailong on 2015/6/16.
 */
(function(){
	module('Backbone collection');
	asyncTest('fetch', function(){
		var Model = Backbone.Model.extend({

		});
		var Collection = Backbone.Collection.extend({
			model: Model,
			url: 'collection'
		});
		var collection = new Collection();
		collection.on('change', function(){

		});
		collection.fetch({data: {id: 1, name: 'client name', sex: 'male'}, reset: true}).done(function(){
			QUnit.start();
			equal(collection.models.length, 2, 'collection models.length should be 2');
		});
	});
})();
