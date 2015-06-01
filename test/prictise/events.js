/**
 * Created by cailong on 2015/5/28.
 */
'use strict';
(function(){
	module('Backbone_events_myprictise');
	test('on and trigger', function(){
		var Obj = function(cnt){
			this.cnt = cnt;
		};
		_.extend(Obj.prototype, Backbone.Events);
		var obj = new Obj(0);
		obj.on('a', function(a, b){
			obj.cnt++;
			console.log(a+'--'+b);
		});
		obj.on('a', function(a, b, c, d, e, f){// test fork push
			obj.cnt++;
		});
		obj.trigger('a', 'AA', 'BB');
		equal(obj.cnt, 2, 'obj cnt should be 2');
		obj.trigger('a');
		obj.trigger('a');
		obj.trigger('a');
		obj.trigger('a');
		equal(obj.cnt, 10, 'obj cnt should be 10');
	});
})();
