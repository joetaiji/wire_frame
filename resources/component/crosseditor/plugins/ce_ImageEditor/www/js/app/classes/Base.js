define([
	'underscore'
], function(_) {
	var initializing = false,
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/;
	var Class = function() {};
	var __classes__ = {
		hash: {},
		parentmap: {},
	};

	Class.extend = function(prop, to) {
		if (!to) {
			if (!prop.classname) {
				prop.classname = 'Class';
			}
			var _super = this.prototype;
			initializing = true;
			var prototype = new this();
			initializing = false;
			for (var name in prop) {
				prototype[name] = typeof prop[name] == 'function' && typeof _super[name] == 'function' && fnTest.test(prop[name]) ?
					(function(name, fn) {
						return function() {
							var tmp = this._super;
							this._super = _super[name];
							var ret = fn.apply(this, arguments);
							this._super = tmp;
							return ret;
						};
					})(name, prop[name]) : prop[name];
			}
			var str = 'function {{Class}}() {if(!initializing && this.construct )this.construct.apply(this, arguments);}{{Class}}.prototype = prototype;{{Class}}.prototype.constructor = {{Class}};{{Class}}.extend = arguments.callee;var tmp = {{Class}};';
			str = str.replace(/{{Class}}/g, prop.classname);
			eval(str);

			__classes__.hash[prop.classname] = tmp.prototype;
			__classes__.parentmap[prop.classname] = this.prototype;

			return tmp;
		} else {
			var from = prop;
			var result = from.extend(to);
			if (to.classname) {
				__classes__.hash[to.classname] = result.prototype;
				__classes__.parentmap[to.classname] = from.prototype;
			}

			return result;
		}
	};

	var ClassManager = Class.extend({
		__classes_hash: __classes__.hash,
		__classes_parentmap: __classes__.parentmap,
		getClass: function(name) {
			return this.__classes_hash[name];
		},
		getSuperclass: function(name) {
			if (this.getClass(name)) {
				return this.__classes_parentmap[name];
			}
		}
	});

	Class.classManager = new ClassManager();
	Class.define = function(classname, config) {
		config.classname = classname;
		var fromClass = this.classManager.getClass(config.extend);
		delete config.extend;
		return fromClass.extend(config);
	};

	var level = 0;
	var indent = function() {
		var s = '';
		for(var i=0;i<level;i++) s+= '   ';
		return s+level;
	};
	var extend_deeper = function obj_extender(target, data) {
		//level++;
		if (data) {
			_.each(data, function(value, key) {
				//console.log(indent() , '  --- ', typeof target[key], key, value)
				if (typeof target[key] !== 'undefined') {
					if (typeof(target[key]) !== 'object') {
						//console.log(indent() , '  ---  -> ASSIGN VALUE!! : ', value)
						target[key] = value;
					} else {
						//console.log(indent() , '  --- EXTEND OBJECT!! : ', key)
						var val = {};
						obj_extender(val, target[key]);
						if (typeof value === 'object') {
							val = obj_extender(val, value);
						} else {
							val = value;
						}
						target[key] = val;
					}
				} else {
					target[key] = value;
				}
			});
		}
		//console.log(indent() , '  --- EXTEND RESULT : ', JSON.stringify(target))
		//level--;
		return target;
	};
	_.extend_deeper = extend_deeper;
	var cls_uid = 0;
	var Base = Class.extend({
		classname: 'Base',
		construct: function(config) {
			//console.log('init config : ',this.classname,  JSON.stringify(config))
			this.initConfig = {};
			_.extend(this, config);
			_.extend_deeper(this.initConfig, config);
			this.id = config.id || this.classname + '_'+ (cls_uid++);
		},
		getConfig: function() {
			return this.initConfig;
		},
		superclass: function() {
			return Class.classManager.getSuperclass(this.classname);
		},
		getAllProps: function(name) {
			var super_class = this;
			var arr_supers = [];
			while (super_class && super_class.classname) {
				arr_supers.push(super_class);
				super_class = super_class.superclass();
			};
			arr_supers.reverse();
			var o = {};
			_.each(arr_supers, function(cls) {
				//(name=='events') && console.log('    ',cls.classname, name, ' : ', cls[name]);
				o = _.extend_deeper(o, cls[name]);
				//(name=='events') && console.log('    ->  : ', JSON.stringify(o));
			});
			//(name!='events') && console.log('  -> extend result : ', o);
			if (!_.isEmpty(o)) {
				return o;
			}
		},
		init: function() {},
		destroy: function() {
			console.log('destroy!!!!!', this)
		}
	});
	Base.classes = Class.classManager;
	return Base;

});
