/**
 * Created by cailong on 2015/5/27.
 */
'use strict';
(function(){
	module('undersocre');
	test('bindAll', function(){
		var a = {name: 'aName'}, b = {
			name: 'bName',
			getName: function(){
				return this.name;
			}
		};
		_.bindAll(b, 'getName');
		a.getName = b.getName;
		equal(a.getName(), 'bName', 'ctx be bound');
	});
})();
