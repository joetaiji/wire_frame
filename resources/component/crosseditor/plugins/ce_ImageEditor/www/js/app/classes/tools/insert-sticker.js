define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',
	'app/classes/ui/workspace/component/Sticker',

	'text!resources/tpl/ui/property/ui-property-item-insert-sticker.tpl.html',

	'app/plugins/scrollbar'
], function(_, $, ToolBase, Sticker, _propertyTpl) {

	return new ToolBase({
		name: 'insert-sticker',
		type: 'toggle',
		iconCls:'fa fa-fw fa-star',
		propertyTpl: _propertyTpl,

		restoreBtnTitle: NHIE.Lang['PluginImageEditor_button_cancel'],

		handler: function($button, toggleStatus) {
			if(toggleStatus === false) {
				var layer = NHIE.workspace.getSelectedLayer();
				if(layer) {
					this.onApplyProperty();
				}
			}
		},
		enableStatus: function() {
			return true;
		},
		onRenderProperty: function($property) {
			var me = this;
			var $list = $property.find('ul.list-items');
			$list.mCustomScrollbar();
			$list.find('li.list-item').on('mouseenter', function() {
				$list.find('li.list-item').removeClass('hover');
				$(this).addClass('hover');
			}).on('mouseleave',function(){
				$list.find('li.list-item').removeClass('hover');
			}).on('click',function(){
				$list.find('li.list-item').removeClass('selected');
				$(this).addClass('selected');
				var id = $(this).attr('data-item-id');
				me.selectSticker(id);
			});
		},
		onShowProperty: function(data) {
			var data = {};
			data.items = NHIE.util.getConfig('assets.stickers');
			NHIE.propertyPanel.setPropertyContent('insert-sticker', data);
		},
		onApplyProperty: function() {
			if(this.component) {

				var makeCanvas = this.component.toCanvas();
				var $el = this.component.$component;
				var me = this;
				makeCanvas.then(function(canvas) {
					var layer = NHIE.workspace.addLayer('canvas');
					layer.setCanvasContent({
						canvas: canvas,
						style: {
							left: parseInt($el.css('left')),
							top: parseInt($el.css('top')),
							width: $el.width(),
							height: $el.height()
						}
					});
					layer.select();
					me.component.remove();
					me.component = null;
					NHIE.workspace.$clipping_area.removeClass('insert-component');

					NHIE.app.fireEvent('changecontent');
				}).catch(function(e){
					console.error(e);
				});

			}
		},
		onRestoreProperty: function() {
			if(this.component) {
				this.component.remove();
				this.component = null;
			}
			NHIE.workspace.$clipping_area.removeClass('insert-component');
		},
		getSelectedItem: function(id) {
			var items = NHIE.util.getConfig('assets.stickers');
			var index = _.findIndex(items, {id:id});
			if(index>-1) {
				return items[index];
			}
		},
		selectSticker: function(id) {
			//console.log(this.component, id)
			if(this.component) {
				this.component.remove();
			}

			var stickers = NHIE.util.getConfig('assets.stickers');
			var index = _.findIndex(stickers, {id:id});

			if (index > -1) {
				NHIE.workspace.$clipping_area.addClass('insert-component');
				var selected_sticker = stickers[index];
				var component = new Sticker({
					item_id: id,
					src: selected_sticker.src,
					id: 'nhie-component-sticker_'+selected_sticker.id,
					style:{
						width: selected_sticker.width,
						height: selected_sticker.height
					}
				});

				this.component = component;
			}

		}
	});
});
