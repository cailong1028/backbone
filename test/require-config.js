/**
 * Created by cailong on 2015/7/6.
 */
/*global define, require*/
'use strict';
require.config({
	baseUrl: './',
	paths: {
		jquery: 'vendor/jquery',
		underscore: 'vendor/underscore',
		backbone: 'prictise/backbone_prictise',//如果不定义baseUrl的话,需要以./开头 如果直接写prictise/backbone_prictise会找不到模块,!!!!!! 无语
		//QUnit: 'vendor/qunit'
	},
	shim: {
		//因为bakbone依赖于underscore,所以在调用模块的使用如果声明了Backbone,无需再声明underscore
		//例子: require(['backbone], function(){
		//     _.extend({}, {id: 'cid'});
		// });
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: [
				'underscore',
				'jquery'
			],
			//一旦加载,使用Backbone作为模块名称即可调用
			exports: 'Backbone'
		}
		/*//想把QUnit的配置通过requirejs来管理,但下面的配置没有用
		 QUnit: {
		 exports: 'QUnit',
		 init: function(){
		 QUnit.config.autoload = true;
		 QUnit.config.autostart = true;
		 }
		 }*/
	}
});
require([
	//'./setup/dom-setup'//TODO 将页面的初始化交由requirejs模块加载,但是好像没有作用
], function(){
	require([
		'underscore_test/test',//如果定义的路径和paths中定义的同名,会报错误,比如此处文件夹名称改为underscore,requirejs会报错,TODO 原因?
		'prictise/dtd',
		'prictise/constructor',
		'prictise/dtd',
		'prictise/jsonp',
		'prictise/events',
		'prictise/model',
		'prictise/collection',
		'prictise/view',
		'prictise/router_history'
	]);
});
