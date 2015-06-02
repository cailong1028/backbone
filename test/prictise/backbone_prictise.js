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
	var previousBackbone = root.Backbone;
	Backbone.$ = $;
	Backbone.noconflict = function(){
		root.Backbone = perviousBackbone;
		return this;
	};

	//noConflict
	Backbone.noConflict = function(){
		root.Backbone = previousBackbone;
		return this;
	};

	//Events
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
				registeEvents(this, names[i], callback, context);
			}
		}else{
			registeEvents(this, name, callback, context);
		}
	};

	var registeEvents = function(ctx, eventName, callback, context){
		var event, _events = ctx._events = ctx._events || {};
		event = _events[eventName] = _events[eventName] || [];
		event.push({
			callback: callback,
			context: context,
			ctx: ctx
		});
	};

	Events.trigger = function(name){
		var args = arguments;
		if(args.length < 1){
			throw new Error('argments of Backbone Events:trigger are {name, [argument1, argument2...]}');
		}
		var event, _events = this._events, args = arguments, event_args = Array.prototype.slice.call(arguments, 1);
		if(!_events) return;
		event = _events[name];
		if(!event) return;
		for(var i = 0; i < event.length; i++){
			var eventChild = event[i];
			eventChild.callback.apply(eventChild.context || eventChild.ctx, event_args);
		}
	};

	//Backbone Model
	//----------------------------------
	var Model = Backbone.Model = function(attributes, options){
		attributes = attributes || {};
		options = options || {};
		this.attributes = this.attributes || {};
		this.cid = _.uniqueId(this.cidPrefix);
		this.set(attributes, options);
		this.changed = {};
		this.initialize.apply(this, arguments);
	};

	_.extend(Model.prototype, Events, {
		cidPrefix: 'c',
		initialize:function(){
		},
		get: function(name){
			return this.attributes[name];
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
			if(!this._validate(attrs)) return false;
			this.changed = {};
			prevAttrs = this.attributes;
			this.attributes = currAttrs = attrs;
			for(var key in currAttrs){
				if(currAttrs[key] !== prevAttrs[key]){
					this.changed[key] = currAttrs[key];
				}
			}
			this.trigger('change', this.changed);
			return this;
		},
		fetch: function(){},
		save: function(){},
		destroy: function(){},
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

	//Collection, Model, Router, View extend
	//------------------------------------------------------
	var extend = function(protoProps){
		protoProps = protoProps || {};
		var parent = this;
		var child = function(){
			parent.apply(this, arguments);
		};
		child.prototype = parent.prototype;
		_.extend(child.prototype, protoProps);
		return child;
	};

	Model.extend = extend;

	Backbone.ajax = function(params){
		Backbone.$.ajax.apply(this, params);
	};
	return Backbone;
});
