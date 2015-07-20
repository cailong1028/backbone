/**
 * Created by cailong on 2015/5/28.
 */
(function(factory){
	//定义root, global,window,or web worker
	//注意root的定义方法(amazing)
	var root = (typeof self === 'object' && self.self === self && self) ||
		(typeof global === 'object' && global.global === global && global);
	if(typeof define === 'function' && define.amd){
		define(['underscore', 'jquery', 'exports'], function(_, $, exports){
			root.Backbone = factory(root, exports, _, $);
		});
	}else{
		root.Backbone = factory(root, {}, _, (root.jquery || root.Zepto || root.$));
	}
})(function(root, Backbone, underscore, $){
	var amdSupport = typeof define === 'function' && define.amd;
	var previousBackbone = root.Backbone;
	Backbone.$ = $;

	//noConflict
	Backbone.noConflict = function(){
		root.Backbone = previousBackbone;
		return this;
	};

	//Backbone Events object
	var Events = Backbone.Events = {};
	var eventsStripper = /\s*,\s*|\s+/;

	Events.on = function(name, callback, context){
		var args = arguments;
		if(args.length < 1){
			throw new Error('argments of Backbone Events:on are {name, callback, [context]}');
		}
		if(typeof args[0] !== 'string'){
			throw new Error('');
		}
		if(args.length < 2){
			throw new Error('Backbone Events:on need callback');
		}
		if(typeof args[1] !== 'function'){
			throw new Error('callback of Backbone Events:on should be function');
		}

		if(eventsStripper.test(name)){
			var names = name.split(eventsStripper);
			for(var i = 0; i < names.length; i++){
				this.registeEvents(this, names[i], callback, context);
			}
		}else{
			this.registeEvents(this, name, callback, context);
		}
	};

	Events.registeEvents = function(ctx, eventName, callback, context){
		var event, _events = ctx._events = ctx._events || {};
		event = _events[eventName] = _events[eventName] || [];
		event.push({
			callback: callback,
			context: context,
			ctx: ctx
		});
	};

	Events.trigger = function(eventName){
		var args = arguments, eventNames;
		if(args.length < 1){
			throw new Error('argments of Backbone Events:trigger are {name, [argument1, argument2...]}');
		}
		var event, _events = this._events, event_args = Array.prototype.slice.call(arguments, 1);
		if(!_events) return;
		eventNames = eventName.split(eventsStripper);
		for(var i = 0; i < eventNames.length; i++){
			event = _events[eventNames[i]];
			if(!event) continue;
			for(var j = 0; j < event.length; j++){
				var eventChild = event[j];
				eventChild.callback.apply(eventChild.context || eventChild.ctx, event_args);
			}
		}
	};

	Events.extend = function(options){
		var EventsSubClass = function(){

		};
		_.extend(EventsSubClass.prototype, Events, options || {});
		return EventsSubClass;
	};

	//Backbone Model
	//----------------------------------
	var Model = Backbone.Model = function(attributes, options){
		attributes = attributes || {};
		this.options = options = options || {};
		this.attributes = this.attributes || this.defaults || {};
		this.cid = _.uniqueId(this.cidPrefix);
		this.set(attributes, options);
		this.changed = {};
		this.initialize.apply(this, arguments);
	};

	_.extend(Model.prototype, Events, {
		defaults: {},
		cidPrefix: 'c',
		idAttribute: 'id',
		initialize:function(){
		},
		get: function(name){
			return this.attributes[name];
		},
		url: function(){
			//TODO should use stand path
			var id = this.get(this.idAttribute);
			return  _.result(this, 'urlRoot')+(id ? '/'+id : '');
		},
		set: function(key, val, options){
			if(!key) return this;
			var attrs, prevAttrs, currAttrs;
			if(typeof key === 'object'){
				attrs = key;
				key = options;
			}else{
				(attrs = {})[key] = val;
			}
			this.changed = {};
			prevAttrs = _.clone(this.attributes);//clone
			currAttrs = this.parse(_.extend({}, prevAttrs, attrs));//clone
			if(!this._validate(currAttrs)) return false;
			this.attributes = currAttrs;
			for(var key in attrs){
				if(currAttrs[key] !== prevAttrs[key]){
					this.changed[key] = currAttrs[key];
				}
			}
			this.trigger('change', this.changed);
			return this;
		},
		toJSON: function(){
			return _.clone(this.attributes);
		},
		parse: function(data){
			return data;
		},
		fetch: function(options){
			//需要设置参数
			return Backbone.sync('GET', this, options);
		},
		save: function(options){
			var type = this.isNew() ? 'POST' : 'PATCH';
			return Backbone.sync(type, this, options);
		},
		destroy: function(options){
			return Backbone.sync('DELETE', this, options);
		},
		isNew: function(){
			return !this.get(this.idAttribute);
		},
		_validate: function(attrs){
			if(!this.validate) return true;
			var validateError = this.validateError = this.validate(attrs);
			if(validateError) {
				this.trigger('invalide', validateError);
				return false;
			}
			return true;
		}
	});

	//Backbone Collection
	//------------------------------------------------------
	var Collection = Backbone.Collection = function(models, options){
		this.length = 0;
		this.options = options || {};
		_.extend(this.options, {reset: false, remove: false});
		this.cid = _.uniqueId(this.cidPrefix);
		this.initialize.apply(this, arguments);
		this.reset(models, this.options);
	};

	_.extend(Collection.prototype, Events, {
		cidPrefix: 'c',
		model: Model,
		strict: true,
		url: function(){},
		initialize: function(){},
		parse: function(models){
			return models;
		},
		set: function(models, options){
			options = _.extend({}, options || {});
			var parse = options.parse || this.parse;
			if(!models) return this;
			if(parse && _.isFunction(parse)) models = parse.call(this, models, options);
			if(!_.isArray(models)) models = [models];
			//简单事务
			var toAdd = [], toRemove = [], triggerEvents = {};
			for(var i = 0; i < models.length; i++){
				var model = models[i];
				var existing = this.get(model);
				if(!(model = this._prepareModel(model))) throw new Error(model.validateError);
				if(options.remove && existing){//替换
					toRemove.push(existing);
				}else if(!options.remove && (!existing || options.reset)){
					toAdd.push(model);
				}
			}
			if(options.reset && !options.remove){
				toRemove = _.clone(this.models);
			}
			for(var i = 0; i < toRemove.length; i++){
				var model = toRemove[i];
				delete this._byId[model.cid];
				if(model.get(model.idAttribute)) delete this._byId[model.get(model.idAttribute)];
				//delete model;
				this.models.remove(model);
				this.length --;
			}
			if(toRemove.length > 0){
				triggerEvents.remove = toRemove;
			}
			if(!options.remove){
				for (var i = 0; i < toAdd.length; i++) {
					var oneAdd = toAdd[i];
					this._byId[oneAdd.cid] = oneAdd;
					if (oneAdd.get(oneAdd.idAttribute)) this._byId[oneAdd.idAttribute] = oneAdd;
					options.addToHead ? this.models.unshift(oneAdd) : this.models.push(oneAdd);
					this.length ++;
				}
				triggerEvents.add = toAdd;
			}
			if(!options.silent) {
				//this.trigger(_.keys(triggerEvents).join(' '), triggerEvents);
				for(var key in triggerEvents){
					this.trigger(key, triggerEvents[key]);
				}
			}
			return this;
		},
		reset: function(models, options){
			options = options ? _.clone(options) : {};
			options.previousModels = this.models;
			this.models = [];
			this._byId = {};
			this.add(models || [], options);
			return this;
		},
		at: function(index){
			return index > -1 && index < this.models.length ? this.models[index] : void 0;
		},
		get: function(model){
			var cid = model.cid, id = this._isModel(model) ? model.get(this.idAttribute) : model.id;
			return this._byId[id] || this._byId[cid] || void 0;
		},
		toJSON: function(){
			return this.models.map(function(model){return model.toJSON();});
		},
		add: function(models, options){
			this.set(models, _.extend({reset: false, remove: false}, options));
			return this;
		},
		remove: function(models, options){
			this.set(models, {reset: false, remove: true});
		},
		push: function(models){
			this.add(models);
			return this;
		},
		pop: function(){
			if(this.models.length < 1) return void 0;
			var lastModel = this.at(this.models.length - 1);
			this.remove(lastModel);
			return lastModel;
		},
		shift: function(){
			if(this.models.length < 1) return void 0;
			var firstModel = this.at(0);
			this.remove(firstModel);
			return firstModel;
		},
		unshift: function(models){
			return this.add(models, {addToHead: true});
		},
		fetch: function(options){
			return Backbone.sync('GET', this, options);
		},
		_isModel: function(obj){
			return obj instanceof Model;
		},
		_prepareModel: function(model, options){
			model = this._isModel(model) ? model : new this.model(model, options)
			if(!model._validate(model.attributes)){
				this.trigger('invalidate', model.validateError);
				return false;
			}
			return model;
		}
	});

	//Backbone View
	//------------------------------------------------------
	var View = Backbone.View = function(options){
		//功能如下, 绘制页面, 加载数据(Model, Collection)
		_.extend(this, _.pick(options, this.viewOptions));//此处pick方法用的好
		this.setElement();
		//this.__template = this._template();
		this.initialize.call(this, arguments);
	};

	_.extend(View.prototype, Events, {
		viewOptions: ['model', 'collection', 'el', '$el', 'tagName', 'className', 'templateSettings'],
		template: '',
		templateSettings: {},
		_templateFileSuffix: '.hbs',
		_templateDir: '.template',
		_defultSettings: {
			escape      : /<%-([\s\S]+?)%>/g,
			interpolate : /<%=([\s\S]+?)%>/g,
			evaluate    : /<%([\s\S]+?)%>/g
		},
		initialize: function(){},
		serialize: function(){
			return {};
		},
		beforeRender: function(){},
		render: function(){
			var dtd = new Dtd;
			this.beforeRender();
			//使用underscore 绘制模板
			//this.$el.html(_.template(_.result(this, 'template') || '')(this.serialize()));
			//使用自定义的_template方法 绘制模板(如果constructor中存在__templateFunction__,直接调用,如果不存在,调用模板生成)
			if(this.__templateFunction__ && _.isFunction(this.__templateFunction__)){
				setTimeout(_.bind(function(){
					this.$el.html(this.__templateFunction__.call(this, this.serialize()));
					this.afterRender();
					dtd.resolve();
				}, this), 0);
				return dtd.promise();
			}
			this._template().done(_.bind(function(tempFunc){
				if(!_.isFunction(tempFunc)){
					//TODO 非函数方式的处理方式
					dtd.resolve();
					return;
				}
				this.$el.html(tempFunc.call(this, this.serialize()));
				this.afterRender();
				dtd.resolve();
			}, this));
			return dtd.promise();
		},
		afterRender: function(){},
		$: function(selector){
			return this.$el.find(selector);
		},
		_setElement: function(el){
			this.$el = el instanceof Backbone.$ ? el :  Backbone.$(el);
			this.el = this.$el[0];
		},
		setElement: function(){
			var el = document.createElement(this.tagName? _.result(this, 'tagName') : 'div');
			this.className ? el.setAttribute('class', _.result(this, 'className')) : void 0;
			this._setElement(el);
		},
		_template: function(){
			var dtd = new Dtd;
			var templateClone = _.clone(_.result(this, 'template') || '');
			this._templateDefineName(templateClone).done(_.bind(function(tempFunc){
				//dtd.resolve(this.tempFunc);
				dtd.resolve(tempFunc);
			}, this));
			return dtd.promise();
		},
		_templateDefineName: function(template){
			//1:	模板形式调用( 以完成, 见下面的模板的加载顺序)
			//TODO
			//2:	类handlebars注册方法
			//TODO
			//3:	使用参数
			//TODO
			//4:	特殊标签的使用,比如handlebars的if, each等
			//TODO
			//5:	添加最后一个的正则式{{- }} 的用法和定义

			//模板的加载顺序是
			//1:	如果判断是html字符串,直接生成js模板,将生成的js模板作为一个function属性配置到当前view对应的constructor中, 并触发dtd
			//2:	如果判断是路径, 查找cdn中是否存在此js模板,存在则将此js模板作为一个function属性配置到当前view对应的constructor中, 并触发dtd
			//3:  	如果判断是路径, 但是在cdn中并不存在此js模板,查找html模板,如果存在,生成对应的js模板,作为一个function属性配置到当前view对应的constructor中, 并触发dtd
			//4: 	如果都没找到,抛出模板未找到的异常
			var dtd = new Dtd, htmlReg = /(<\S+>)|(<\/\S+>)/g;
			var selfView = this;
			//如果判断为html字符串,直接返回字符串
			if(template === '' || htmlReg.test(template)){
				setTimeout(function(){
					var tempFunc = selfView.constructor.prototype.__templateFunction__ = selfView._templateFunction(template);
					dtd.resolve(tempFunc);
				}, 0);
				return dtd.promise();
			}
			//路径,则查找(按照普通js方式处理,没有必要区分amd模式和普通模式)
			Backbone.$.get(template + '.js', {}, function(){}, 'text').done(function(content){
				var tempFunc = selfView.constructor.prototype.__templateFunction__ = eval(content);
				dtd.resolve(tempFunc);
			}).fail(function(){
				Backbone.$.get(template + selfView._templateFileSuffix, {}, function(){}, 'text').done(function(content){
					var tempFunc = selfView.constructor.prototype.__templateFunction__ = selfView._templateFunction(content);
					dtd.resolve(tempFunc);
				}).fail(function(){
					dtd.resolve();
					throw  new Error('template file not found');
				});
			});
			/*Backbone.$.ajax({
				type: 'GET',
				url: template + '.js',
				dataType: 'text',
				success: function (content) {
					dtd.resolve(eval(content));
				},
				error: function () {
					//生成define一个js模板,下次调用的时候,require方式就能够加载了
					//var functionBody = 'define(\'' + selfView._templateDir + '/' + template + '\' ,[], function(){\n';
					//获取文件文本
					Backbone.$.ajax({
						type: 'GET',
						url: template + selfView._templateFileSuffix,
						dataType: 'text',
						success: function (content) {
							dtd.resolve(selfView._templateFunction(content));
						},
						error: function () {
							dtd.resolve();
							throw  new Error('template file not found');
						}
					});
				}
			});*/
			return dtd.promise();
		},
		_templateFunction: function(tempStr){
			return new Function('obj', this._templateFunctionBody(tempStr));
		},
		_templateFunctionBody: function(tempStr){
			var functionBody = '';
			var noMatch = /(.)^/g;
			//动态解析表达式 不使用_.defaults而使用_.extend的原因: 默认确定好settings中属性的顺序
			var settings = this.templateSettings = _.extend({}, this._defultSettings, this.templateSettings);
			//对文件的解析方式, 对字符串的解析
			//1: 获取对象, 2: 执行体; 3:
			//加上reg结尾判断-->$的原因是,没有任何一个匹配的时候,确保replace的第二个方法参数的执行,这是在underscore中的
			//做法,但在新的方法_template中没有必要,因为完全使用替换的方式实现
			var reg = new RegExp([
				(settings.escape || noMatch).source,
				(settings.interpolate || noMatch).source,
				(settings.evaluate || noMatch).source
			].join('|')+'|$', 'g');
			var source = tempStr.replace(reg, function(match, escape, interpolate, evaluate, offset, originStr){
				if(escape){
					//TODO 用法?
				}else if(interpolate){
					return '\'\n+(typeof '+interpolate+' === \'undefined\' ? \'\' : '+interpolate+')+\n\'';
				}else if(evaluate){
					//TODO 拆分字符串, 并调用方法库
					return '\'\n+'+evaluate+'+\n\'';
				}
				return '';
			});
			functionBody += 'var _t, __p=\'\';\n' +
			'with(obj || {}){\n' +
			'__p+=\''+source+'\'\n' +
			'}\n' +
			'return __p;';
			return functionBody;
		}
	});

	//Backbone.Router
	//----------------------------------------------------------------------------------------------------
	//使用router和pushstate,hashchange,iframe来实现改变url,页面不刷新,同时实现页面的展示
	/*
	* 1: 定义router,new router, unshift到history.handlers中
	* 2: 页面跳转history.navigate的时候, 首先改变url(replacestate, hashchane, iframe), 然后加载handler中的处理方法
	* 3:
	* */
	var Router = Backbone.Router = function(options){
		options = options || {};
		if(options.routes) this.routes = options.routes;
        this.addRoutes();
		this.initialize.apply(this, arguments);
	};

	_.extend(Router.prototype, Events, {
		initialize: function(){},
		//push to history handlers
		addRoutes: function(){
			var _keys = _.keys(_.result(this, 'routes'));
			for(var _key; _key = _keys.pop();){
				var _key_reg = _key instanceof RegExp ? _key : new RegExp(_key);
				var callback = this.routes[_key];
				_.isFunction(callback) ? void(0) : callback = this[callback];
				history.handlers.unshift({route: _key_reg, callback: callback});
			}
		}
	});

	//Backbone.History
	//----------------------------------------------------------------------------------------------------
	var History = Backbone.History = function(){
		this.handlers = [];
		if(window){
			this.location = window.location;
			this.history = window.history;
		}
	};

	_.extend(History.prototype, Events, {
		navigate: function(url, trigger){
			//TODO pushstate, hashchange, iframe
			//TODO pushState的实参
			if(this.history.pushState) this.history.pushState({}, '', url);

			//触发操作
			if(!!trigger){
				this.loadUrl(url);
			}
		},
		loadUrl: function(url){
			var i = 0;
			var handler, routeCallback, routeReg;
			while(i < this.handlers.length){
				handler = this.handlers[i];
				routeReg = handler.route;
				if(routeReg.test(url)){
					routeCallback = handler.callback;
					break;
				}
				i++;
			}
			if(!!routeCallback){
				//TODO 参数, 通过url和routeReg 摘开
				routeCallback();
			}
		}
	});

	var history = Backbone.history = new History;

	//对象继承方法, 一个非常值得研究的方法. Collection, Model, Router, View extend
	//------------------------------------------------------
	var extend = function(protoProps){
		protoProps = protoProps || {};
		var Parent = this;
		var Child = function(){
			Parent.apply(this, Array.prototype.slice.call(arguments));
		};
		var parentInstance = new Parent;
		for(var key in parentInstance){
			if(Object.prototype.hasOwnProperty.call(parentInstance, key)) delete parentInstance[key];
		}
		_.extend(Child.prototype = parentInstance, protoProps);//不要使用 _.extend(child.prototype, parentInstance, protoProps); 因为_.extend只会clone ownPrototype
		//使用_.extend(prototype, props)的方式代替prototype = props的方式, 应为prototype = props的方式, 会改变对象的constructor,
		//但在继承的情况下只能使用Child.prototye = new Parent(), 此时就需要手动设置其constructor属性,如下
		//这样的实现,使对象可以精确定位到他所属的类
		Child.prototype.constructor = Child;
		//实现级联继承
		Child.extend = extend;
		return Child;
	};

	//Backbone Dtd object
	//-----------------------------------------------------------
	var Dtd = Backbone.Dtd = function(){
		//fireChain是function数组
		this.fireChain = [];
	};

	_.extend(Dtd.prototype, Events, {
		//定义resolve方法触发done内执行的fireChain的 ctx 为arguments的最后一个参数,如果arguments.length为0或1,则默认ctx为this
		resolve: function(){
			var argLen = arguments.length;
			var ctx = this,
				args = arguments;
			/*if(argLen === 1) {
				args = arguments[0];
			}else */
			if(argLen > 1){
				ctx = arguments[argLen-1];
				args = arguments.slice(argLen-1, argLen);
			}
			for(var i = 0; i< this.fireChain.length; i++){
				this.fireChain[i].apply(ctx, args);
			}
		},
		reject: function(){
			//TODO
		},
		done: function(doneFunc){
			if(_.isFunction(doneFunc)){
				this.fireChain.push(doneFunc);
			}else if(_.isArray(doneFunc)){
				this.fireChain = this.fireChain.concat(doneFunc);
			}
			return this;
		},
		promise: function(){
			//TODO
			return this;
		}
	});

	//Backbone sync
	var sync = Backbone.sync = function(method, model, options){
		var _default = {wait: true};
		options = _.extend({}, options || model || method || {});
		model = model || {};
		//method: post, put, patch, get, delete
		var params = {
			dataType: 'json',
			type: method,
			contentType: 'application/json'
		};
		//例如data; model.fetch({data: {id: 'aaa'}})
		_.extend(params, model.options, options);
		//data 需要另外处理,因为扩展params时使用的是_.extend,不是深度clone
		if(params.type === 'POST' || (params.data && (params.type === 'PATCH' || params.type === 'DELETE'))){
			params.data = JSON.stringify(_.extend({}, model.toJSON(), options.data || {}));
		}
		_.defaults(params, _default);
		params.success = function(res){
			res = res || {};
			if(params.wait) model.set(res, {reset: params.reset || false});
			model.trigger('sync');
		};
		if(!options.url) params.url = _.result(model, 'url') || urlError();
		return Backbone.ajax(params);
	};

	Backbone.ajax = function(){
		return Backbone.$.ajax.apply(Backbone.$, arguments);
	};

	var urlError = function(){
		throw new Error('url needed');
	};
	/*数组根据value的remove方法(使用5个知识点)
	 1: 要求参数中可以有多个要删除的指定的obj
	 2: 删除数组中重复的obj,而不仅仅是第一个
	 3: 0 == false;
	 4: 数组和string的indexOf方法
	 5: 使用splice(index, 1) 来删除指定位置的obj
	 6: 使用splice时需要注意,不要将替换的obj以数组作为参数使用
	 如下: a.splice(index, lengthCount, [a1, a2...]);
	 而应该使用如下写法: a.splice(index, lengthCount, a1, a2...)
	 或者: Array.prototype.splice.apply(context, [index, lengthCount, a1, a2...]);
	 综上所述数组中根据属性obj,在数组中移除obj的方式如下代码如下*/
	Array.prototype.remove = function(){
		var argLen = arguments.length, index;
		while(argLen && this.length){
			var oneRemove = arguments[--argLen];
			while((index = this.indexOf(oneRemove)) !== -1){
				this.splice(index, 1);
			}
		}
	};
	//TODO
	Router.extend = Dtd.extend = View.extend = Collection.extend = Model.extend = extend;

	return Backbone;
});
