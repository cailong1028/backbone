/**
 * Created by cailong on 2015/6/18.
 */
(function(){
	module('jsonp');
	asyncTest('跨域测试', function(){
		$.ajax({
			url: 'http://localhost:3001/tickets-type-collection',
			type: 'GET',
			dataType: 'jsonp',
			jsonp: 'callback',
			jsonpCallback: 'jsonpCallback',
			success: function(res){
				QUnit.start();
				equal(res.length, 3, 'return length should be 3');
			}
		}).done(function(res){
			equal(res.length, 3, 'return length should be 3');
		});
	});
})();
