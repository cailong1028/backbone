'use strict';
(function(){
    module('js constructor');
	test('类的prototype包含constructor属性', function(){
		/**
		一个类的prototype属性中默认有一个constructor，指向类本身，此类生成的实例
		例子：
		var A = new function(name){
				this.name = name;
		}
		此时A.prototype.constructor === A;
		定义一个A的实例a
		var a = new A;
		a.constructor 根据原型链 会查找 A.prototype.constructor <==> A
		
		当对A.prototype重新设值的时候，比如
		A.prototype = {
			getName: function(){
				return this.name;
			}
		}
		这个操作实际上是进行了如下代码操作
		A.prototype = new Object({
			getName: function(){
				return this.name;
			}
		});
		那么此时在定义一个A的实例a2
		var a2 = new A;
		a2.constructor 根据原型链 会查找 A.prototype.constructor 而此时 A.prototype.constructor是Object对象的一个实例，继续根据原型链查找 A.prototype.constructor <==> Object.prototype.constructor <==> Object
		即
		a2.constructor <==> Object  //不是我们期待的A了噢

		如果还想让a2.constructor指向A，
		所以才有了
		A.prototype = {
			constructor: A, //直接定义为A，使之不再根据对象的原型链查找了
			getName: function(name){
				return this.name
			}
		}
		*/
	    var A = function(name){
		    this.name = name;
		}
		var a1 = new A;
		ok(a1.constructor === A);
		A.prototype = {
		     getName: function(){
				 return this.name;
			 }
		};
		var a2 = new A;
		ok(a2.constructor !== A);
		A.prototype = {
			 constructor: A,
		     getName: function(){
				 return this.name;
			 }
		};
		var a3 = new A;
		ok(a3.constructor === A);
	});
}    
)();
