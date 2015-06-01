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

	return Backbone;
});
