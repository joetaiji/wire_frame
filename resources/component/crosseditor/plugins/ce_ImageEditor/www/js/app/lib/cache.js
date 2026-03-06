define(['underscore'], function(_) {

	var CacheManager = function() {
		this.init();
	};

	CacheManager.prototype = {
		init: function() {
			this.__data__ = {};
		},
		clear: function() {
			this.init();
		},
		get: function(group, key) {
			if (this.__data__[group]) {
				return this.__data__[group][key];
			}
		},

		set: function(group, key, value) {
			if (group && key && value) {
				this.__data__[group] = this.__data__[group] || {};
				var c = {};
				c[key] = value;
				_.extend(this.__data__[group], c);
			}
		}
	};

	return new CacheManager();
});
