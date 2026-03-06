define([
	'jquery',
	'underscore',
	'app/classes/Observable',
	'app/classes/ui/UIElement'
], function($, _, Observable, UIElement) {
	var Application = Observable.extend({
		classname: 'Application',
		construct: function(config) {
			if (config.ui) {
				this.panel = new UIElement(config.ui);
			}
			this._super(config);
		},
		render: function() {
			var me = this;
			return this.panel.render().then(function() {
				me.fireEvent('render', me.panel);
				return me.panel;
			});
		},
		launch: function() {
			$(function(){
				$('.NHIE-loading-prepare-mask .message p').html('Rendering UI..');
			});

			this.render();
		},
		__data__: {},
		data: function(key, value)  {
			var _data = this.__data__;
			if (typeof value !== 'undefined') {
				_data[key] = value;
			} else {
				return _data[key];
			}
		}
	});

	return Application;
});
