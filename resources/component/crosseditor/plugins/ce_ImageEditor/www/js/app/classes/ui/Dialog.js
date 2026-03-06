define([
	'jquery',
	'underscore',
	'app/classes/ui/UIElement',
], function($, _, UIElement) {

	var Dialog = UIElement.extend({
		classname: 'Dialog',
		renderTo: '.nhie-body',
		template: {
			tpl: '<div class="dialog"></div>'
		},
		events: {
			render: function(dom) {
				console.log(this)
				var me = this;
				var $dialog = $(me.dom);
				var contentData = me.contentData || {};
				me.content = NHIE.tmpl(me.content, contentData);
				me.type = me.type || 'alert';
				if(me.type==='alert') {
					me.buttons = {};
					me.buttons[NHIE.Lang['PluginImageEditor_button_confirm']] = function() {
						$(this).dialog('close');
					}
				} else {
					if(me.button_config && me.button_config.length) {
						me.buttons = {};
						_.each(me.button_config, function(btn_config) {
							me.buttons[btn_config.name] = btn_config.action;
						});
					}
				}

				var dialogConfig = {
					title: me.title,
					draggable: false,
					width: me.width || 300,
					modal: !!me.modal,
					resizable: !!me.resizable,
					buttons: me.buttons || {},
				};

				if(me.destroyWhenClose) {
					dialogConfig.close = function() {
						$(this).dialog('close').remove();
						if(typeof me.onClose === 'function') {
							me.onClose.apply(this);
						}
					}
				} else {
					if(typeof me.onClose === 'function') {
						dialogConfig.close = me.onClose;
					}
				}

				$dialog.html(me.content);
				$dialog.dialog(dialogConfig);
				//$dialog.hide();
				me.onRenderDialog($dialog)
			}
		},
		construct: function(config) {
			this._super(config);
			var me = this;
		},
		show: function(msg) {
			return this.render();
		},
		hide: function() {

		},
		onRenderDialog: function($dialog) {

		}

	});

	return Dialog;
});
