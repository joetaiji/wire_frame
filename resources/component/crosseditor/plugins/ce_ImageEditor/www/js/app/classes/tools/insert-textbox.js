define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',
	'app/classes/ui/workspace/component/TextBox',

	'text!resources/tpl/ui/property/ui-property-item-insert-textbox.tpl.html',
	'text!resources/tpl/ui/property/ui-property-item.common.text-attributes.tpl.html',
	'app/plugins/jquery-ui'
], function(_, $, ToolBase, TextBox, _propertyTpl, _textAttrTpl) {
	return new ToolBase({
		name: 'insert-textbox',
		type: 'toggle',
		iconCls:'fa fa-fw fa-font',
		propertyTpl: _propertyTpl,
		restoreBtnTitle: NHIE.Lang['PluginImageEditor_button_cancel'],

		handler: function($button, toggleStatus) {
			if(toggleStatus === false) {
				this.onApplyProperty();
			}
		},
		enableStatus: function() {
			return true;
		},
		onRenderProperty: function($property) {

			var $text_attrs = this.initTextAttributeForm($property);
			$property.find('.property-item').append($text_attrs);
			this.bindTextAttributeEvents($text_attrs);

		},
		onShowProperty: function(data) {
			var data = {};
			NHIE.propertyPanel.setPropertyContent(this.name, data);

			this.insertTextBox();
		},
		onApplyProperty: function() {
			if(this.component) {
				var makeCanvas = this.component.toCanvas();
				var $el = this.component.$component;
				var me = this;
				makeCanvas.then(function(canvas) {

					var cropOffset = NHIE.lib.util.canvasManager.cropCanvas(canvas);
					// 아무 입력도 없는 경우는 처리하지 않음
					if(isNaN(cropOffset.w) ||isNaN(cropOffset.h) ||isNaN(cropOffset.x) ||isNaN(cropOffset.y)) {
						me.component.remove();
						me.component = null;
						return {};
					}

					var layer = NHIE.workspace.addLayer('canvas');
					layer.setCanvasContent({
						canvas: canvas,
						style: {
							left: parseInt($el.css('left')) + cropOffset.x,
							top: parseInt($el.css('top')) + cropOffset.y,
							width: cropOffset.w,
							height:cropOffset.h
						}
					});
					layer.select();
					me.component.remove();
					me.component = null;
					NHIE.workspace.$clipping_area.removeClass('insert-component');

					NHIE.app.fireEvent('changecontent');

				}).then(function() {
					if(me.toggled) {
						me.fireEvent('toggle', false);
					}
				}).catch(function(e) {
					console.error(e);
					me.component.remove();
					me.component = null;
				});
			}
		},
		onRestoreProperty: function() {
			if(this.component) {
				this.component.remove();
				this.component = null;
			}
			NHIE.workspace.$clipping_area.removeClass('insert-component');

			this.fireEvent('toggle', false);
		},
		default_width: 200,
		default_height: 100,

		insertTextBox : function() {
			var me = this;
			NHIE.workspace.$clipping_area.addClass('insert-component');
			var component = new TextBox({
				item_id: 'textbox',
				id: 'nhie-component-textbox_'+0,
				style:{
					width: me.default_width,
					height: me.default_height
				}
			});

			this.component = component;
		}
	});
});
