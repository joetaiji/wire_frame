define([
	'underscore',
	'app/classes/Base'

], function(_, Base) {
	var Observable = Base.extend({
		classname: 'Observable',
		construct: function(config) {
			this._super(config);
			this._events = {};
			this._suspendedEvents = {};

			this.init();
		},
		init: function(config) {
			this.initEvents();
		},

		addEventListener: function(name, fn, scope) {
			var me = this;
			if (!me._events[name]) {
				me._events[name] = [];
			}

			me._events[name].push({
				scope: scope,
				handler: fn
			});
		},
		on: function(name, fn, scope) {
			this.addEventListener(name, fn, scope);
		},
		// removeEventListener: function(name, fn, scope) {
		// 	eventManager.removeEventListener(name, fn, scope);
		// },
		fireEvent: function(name) {
			var me = this;
			var result;

			if (me._events[name] && me._events[name].length > 0) {
				for (var i = 0; i < me._events[name].length; i++) {
					// synchronous event handle
					var eventHandler = me._events[name][i];

					var _runHandler = false;

					//setTimeout(function(){

					if (!me._suspendedEvents[name]) {
						_runHandler = true;
					}
					/*
					if(eventHandler.scope && eventHandler.scope.events){
						if(eventHandler.scope.events._suspended && eventHandler.scope.events._suspended[name]){
							//logger.debug('event suspended for specific scope',name);
							_runHandler = false;
						}else{
							//logger.debug('event handler run!!',name);
							_runHandler = true;
						}
					}
					*/
					if (_runHandler && typeof eventHandler.handler === 'function') {
						var args = [];
						for (var i = 0; i < arguments.length; i++) {
							args.push(arguments[i]);
						}
						args.shift();
						result = eventHandler.handler.apply(eventHandler.scope || this, args);

					} else {
						//logger.debug('... event is suspended.. skip - ', name)
					}

					//},0);
				}
			}
			return result;
			//console.log(':::EVENT handle done !! ',name,args)
		},
		suspendEvent: function(name) {
			var me = this;
			if (me.classname == AppConstants.classname.Application) {
				me._suspendedEvents[name] = true;
			} else {
				me._suspendedEvents[name] = true;
				if (me.events) {
					if (!me.events._suspended) {
						me.events._suspended = {};
					}
					me.events._suspended[name] = true;
				}
			}
		},
		resumeEvent: function(name) {
			var me = this;
			if (me.classname == AppConstants.classname.Application) {
				me._suspendedEvents[name] = null;
				delete me._suspendedEvents[name];
			} else {
				me._suspendedEvents[name] = null;
				if (me.events) {
					if (!me.events._suspended) {
						me.events._suspended = {};
					}
					me.events._suspended[name] = null;
					delete me.events._suspended[name];
				}
			}
		},
		getTarget: function() {
			return this.dom || null;
		},
		initEvents: function() {
			var me = this;
			var events = this.getAllProps('events');
			me.events = events;
			me.events && $.each(me.events, function(key, handler) {
				me.addEventListener(key, handler, me);
			});
		}

	});

	return Observable;
});
