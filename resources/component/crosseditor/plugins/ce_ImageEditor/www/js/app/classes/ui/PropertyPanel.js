define([
	'jquery',
	'underscore',
	'app/classes/ui/Panel',

	'text!resources/tpl/ui/property/ui-property-body.tpl.html',
	'text!resources/tpl/ui/property/ui-property-footer.tpl.html'

], function($, _, Panel, _body_tpl, _footer_tpl) {
	var PropertyPanel = Panel.extend({
		classname: 'PropertyPanel',
		renderTo: '.panels',
		defaultConfig: {
			template: {
				cls: 'ui-propertypanel',
				bodyTpl: _body_tpl,
				footerTpl: _footer_tpl
			}
		},
		events: {
			render: function() {
				var me = this;
				$(this.dom).find('button[data-action=apply]').off('click')
				.on('click',function(){
					var type = me.currentPropertyType;
					var handler = me.applyHandler[type] || function(){};
					(handler.bind(me))();
				});
				$(this.dom).find('button[data-action=restore]').off('click')
				.on('click',function(){
					var type = me.currentPropertyType;
					var handler = me.restoreHandler[type] || function(){};
					(handler.bind(me))();
				});
			}
		},
		registerHandler: function(name, config) {
			NHIE.app._modenames.push(name);
			var tpl = config.tpl || ' not implemented..';
			var showHandler = config.show || (function(type) {
				return function(data) {
					this.setPropertyContent(type,data)
				};
			}.bind(this))(name);
			var applyHandler = config.apply || function() {};
			var restoreHandler = config.restore || function() {};
			var renderHandler = config.render || function() {};
			this.propertyItemTpl[name] = tpl;
			this.showHandler[name] = showHandler;
			this.applyHandler[name] = applyHandler;
			this.restoreHandler[name] = restoreHandler;
			this.renderHandler[name] = renderHandler;

		},
		construct: function(config) {
			this._super(config);
			var me = this;
			this.propertyItemTpl = {};
			this.registerHandler('empty', {
				tpl: ' ',
				show: function(data) {
					//console.log(this);
					$(this.dom).find('.ui-panel-footer').hide();
					this.setBodyContent('');
				}
			});
			_.each(NHIE.toolbar.tools, function(tool, name){
				//console.log(name, tool);
				me.registerHandler(name, {
					tpl: tool.propertyTpl,
					render: tool.onRenderPropertyBase.bind(tool),
					show: tool.onShowProperty.bind(tool),
					apply: tool.onApplyProperty.bind(tool),
					restore: tool.onRestoreProperty.bind(tool)
				});
			});

		},

		showProperty: function(type, data) {
			data = data || {};
			this.currentPropertyType = type;
			var showHandler = this.showHandler[type];

			if(showHandler) {
				(showHandler.bind(this))(data);
			} else {
				this.setPropertyContent(type, data);
			}
		},
		setPropertyData: function(data) {
			var type = NHIE.app.mode || 'empty';
			this.showProperty(type, data);
		},
		setPropertyContent: function(type, data) {
			var tpl = this.propertyItemTpl[type] || 'not implemented yet';
			if(tpl) {
				$(this.dom).find('.ui-panel-footer').show();
				this.setBodyContent(NHIE.tmpl(tpl, {
					data:data
				}));
				if(this.renderHandler[type]) {
					var renderHandler = this.renderHandler[type];
					renderHandler($(this.dom).find('.ui-panel-body'));
				}
			} else {
				console.log('no tpl defined for',type);
			}
		},
		renderHandler: {},
		showHandler: {},
		applyHandler: {},
		restoreHandler: {}
	});

	return PropertyPanel;
});
