/**
 * Created by cailong on 2015/6/29.
 */
require([
	'backbone'
], function(/*Backbone*/){
	module('Backbone View');

	var Model = Backbone.Model.extend({
		defaults: {
			id: 1,
			name: 'Zhang',
			sex: 'male'
		}
	});
	var model = new Model;
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'classA classB',
		initialize: function(){
			//this.render();
		},
		serialize: function(){
			return model.toJSON();
		},
		template: function(){
			return '<h1>area</h1><h2><%= name%></h2>';
		}
	});

	asyncTest('new a view', function(){
		var view = new View();
		view.render().done(function(){
			QUnit.start();
			ok(view instanceof  Backbone.View, 'new a view which type is Backbone.View');
			equal(view.$el.find('h1').html(), 'area', '通过view el对象获得document');
		});
	});

	asyncTest('view.$el', function(){
		var view = new View();
		view.render().done(function(){
			QUnit.start();
			equal(view.$el.find('h2').html(), 'Zhang', 'view template object name is "Zhang"');
		});
	});

	asyncTest('view $', function(){
		var view = new View;
		view.render().done(function(){
			QUnit.start();
			equal(view.$('h1').html(), 'area');
		});
	});

	test('regexp exec方法和string match方法的区别', function(){
		/*regexp的exec和string的match方法的区别
		exec返回第一个匹配到的并且括号分组内部关联匹配到的字符串数组集合
		match 当reg的范围为global时,返回所有匹配到的字符串集合
		当reg没有/g时,和exec的效果完全相同*/
		var reg = /c(a|b)t\d/;
		var regG = /c(a|b)t\d/g;
		var str = 'cat2, cbt8, cbt9';
		equal(reg.exec(str).length, 2, '正则式的exec方法返回第一个匹配的字符串及其括号匹配内部的数组');
		equal(str.match(reg).length, 2, 'string的match方法,在reg不是global的时候的作用和reg的exec方法一样');
		equal(str.match(regG).length, 3, 'string的match方法,在reg是global的时候返回匹配到的字符串的集合');
	});

	test('sting replace方法高级应用(MDN API地址:https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions, ' +
	'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace)', function(){
		var a = 'abcdabeacbbca';
		var reg = /a([b|c]+)?/g;
		//首字母大写
		String.prototype.capitalize = function(){
			return this.replace(/(^|\s|,)(\b\w)/g, function(match, p1, p2, offset, str){
				return p1+p2.toUpperCase();
			});
		};
		equal('a bcded   , sdf.'.capitalize(), 'A Bcded   , Sdf.', '首字母大写');
	});

	test('string replace高级用法2,正则式n个括号,replace第二个参数(是函数)的arguments的长度为n+3,其余三个为match,offset,originStr', function(){
		var str = 'abd';
		var reg = /(a)(b)(c|d)/g;
		str.replace(reg, function(){
			equal(arguments.length, 6, '长度为6')
		});
		equal(reg.exec(str).length, 4, '长度为4');
	});

	asyncTest('使用自定义模板方法_template代替underscore的模板方法', function(){
		var View2 = Backbone.View.extend({
			model: model,
			template: '<h1>area</h1><h2><%= name%></h2>	',
			serialize: function(){
				return this.model.toJSON();
			},
			initialize: function(){
			}
		});
		var view = new View2();
		view.render().done(function(){
			QUnit.start();
			equal(view.$el.find('h2').html(), 'Zhang', '如果看到此处说明自定义的模板函数是正确的');
		});
	});

	asyncTest('动态解析模板, 将template解析的正则式改为{{}}', function(){
		var View2 = Backbone.View.extend({
			model: model,
			template: '<h1>area</h1><h2>{{= name}}</h2>	',
			templateSettings: {
				evaluate    : /{{([\s\S]+?)}}/g,
				escape      : /{{-([\s\S]+?)}}/g,
				interpolate : /{{=([\s\S]+?)}}/g
			},
			serialize: function(){
				return this.model.toJSON();
			},
			initialize: function(){
			}
		});
		var view = new View2();
		view.render().done(function(){
			QUnit.start();
			equal(view.$el.find('h2').html(), 'Zhang', '如果看到此处说明自定义的模板的动态解析是正确的');
		});
	});

	asyncTest('模板的evaluate', function(){
		var i = 0;
		window.myPlus = function(){
			i++;
		};
		var View2 = Backbone.View.extend({
			model: model,
			template: '<h1>area</h1><h2>{{myPlus()}}</h2>',
			templateSettings: {
				evaluate    : /{{([\s\S]+?)}}/g,
				interpolate : /{{=([\s\S]+?)}}/g,
				escape      : /{{-([\s\S]+?)}}/g
			},
			serialize: function(){
				return this.model.toJSON();
			},
			initialize: function(){
			}
		});
		var view = new View2;
		view.render().done(function(){
			QUnit.start();
			equal(i, 1, '模板中的执行代码解析, 通过执行函数, i++ 值为1');
		});

	});

	asyncTest('使用html模板', function(){
		var View2 = Backbone.View.extend({
			model: model,
			template: 'template/test',
			templateSettings: {
				evaluate    : /{{([\s\S]+?)}}/g,
				interpolate : /{{=([\s\S]+?)}}/g,
				escape      : /{{-([\s\S]+?)}}/g
			},
			serialize: function(){
				return this.model.toJSON();
			},
			initialize: function(){
				this.render().done(function(){
					QUnit.start();
					equal(view.$('h2').html(), 'Zhang', 'html模板获取值');
				});
			}
		});
		var view = new View2;
	});

	asyncTest('ajax 获取本地的模板文件', function(){
		$.ajax({
			type: 'GET',
			url: 'template/test.hbs',
			dataType: 'text',
			success: function(data){
				QUnit.start();
				equal(1, 1, '本地文件获取成功');
			}
		});
	});

	asyncTest('使用html已经生成的js模板', function(){
		var View2 = Backbone.View.extend({
			model: model,
			template: 'template/test',
			templateSettings: {
				evaluate    : /{{([\s\S]+?)}}/g,
				interpolate : /{{=([\s\S]+?)}}/g,
				escape      : /{{-([\s\S]+?)}}/g
			},
			serialize: function(){
				return this.model.toJSON();
			},
			initialize: function(){
				this.render().done(function(){
					QUnit.start();
					equal(view.$('h2').html(), 'Zhang', 'html模板获取值');
				});
			}
		});
		var view = new View2;
	});

	//似乎是不对的
	/*test('修改的虽然是this.attr, 但是当this中无此attr属性的时候,而其class的prototype中此attr是,实际上修改的是prototype中的attr属性,', function(){
		var A = function(){
		};
		A.prototype = {
			a: 'aa'
		};
		var a = new A;
		(_.bind(function(){
			this.a = 'bb';
		}, a))();
		var b = new A;
		equal(b.a, 'bb', 'b.a 应该等于 bb');
	});*/

	asyncTest('文件名调用模板(在没有定义或者生成js文件的情况下)', function(){
		var View = Backbone.View.extend({
			model: model,
			template: 'template/test2',
			templateSettings: {
				evaluate    : /{{([\s\S]+?)}}/g,
				interpolate : /{{=([\s\S]+?)}}/g,
				escape      : /{{-([\s\S]+?)}}/g
			},
			serialize: function(){
				return this.model.toJSON();
			},
			initialize: function(){}
		});
		var view = new View();
		view.render().done(function(){
			QUnit.start();
			equal(view.$('h2').html(), 'Zhang', 'html模板获取值');
		});
	});

	asyncTest('requirejs 的 define 和 require的调用', function(){
		define('a', [], function(){
			return 'aaaa';
		});
		require(['a'], function(a){
			QUnit.start();
			equal(a, 'aaaa', '通过require获得define');
		});
	});
});
