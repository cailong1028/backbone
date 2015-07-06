/**
 * Created by cailong on 2015/7/6.
 */
define('.template/test', [], function(){
	var temp = function(){
		return '<h1>this is h1</h1><h2>{{name}}</h2>'
	};
	return temp;
});
define('tester2', ['tester'], function(tester){
	console.log(tester());
});
