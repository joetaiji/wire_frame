define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',
	'app/classes/ui/workspace/component/TextBalloon',
	'app/lib',

	'text!resources/tpl/ui/property/ui-property-item-insert-textballoon.tpl.html'

], function(_, $, ToolBase, TextBalloon, lib, _propertyTpl) {

	//var TEXT_BALLOON_ITEMS = NHIE.util.getConfig('assets.textballoons');
	return new ToolBase({
		name: 'insert-textballoon',
		type: 'toggle',
		iconCls:'fa fa-fw fa-comment-o',
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
			var me = this;
			var $list = $property.find('ul.list-items');
			$list.mCustomScrollbar();
			$list.find('li.list-item').on('mouseenter', function() {
				$list.find('li.list-item').removeClass('hover');
				$(this).addClass('hover');
			}).on('mouseleave',function() {
				$list.find('li.list-item').removeClass('hover');
			}).on('click',function() {
				$list.find('li.list-item').removeClass('selected');
				$(this).addClass('selected');
				var id = $(this).attr('data-item-id');
				me.selectTextballoon(id);
				console.log(me.component.$textEditingArea);
			});

			var $text_attrs = this.initTextAttributeForm($property);
			$list.after($text_attrs);
			this.bindTextAttributeEvents();
			this.enableTextAttributes(false);

			$list.find('li.list-item').eq(0).mouseenter().click();
			//console.log('onRenderProperty')

		},

		onShowProperty: function(data) {
			var data = {};
			data.items = NHIE.util.getConfig('assets.textballoons');;
			NHIE.propertyPanel.setPropertyContent('insert-textballoon', data);
			//console.log('onShowProperty')
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
				}).then(function() {
					if(me.toggled) {
						me.fireEvent('toggle', false);
					}
				}).catch(function(e) {
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
			var items = NHIE.util.getConfig('assets.textballoons');
			var index = _.findIndex(items, {id:id});
			if(index>-1) {
				return items[index];
			}
		},
		selectTextballoon: function(id) {
			var prevTextContent = null;
			if(this.component) {
				prevTextContent = $(this.component.tracker.dom).find('.text-editing-area').html();
				this.component.remove();
			}
			console.log('textballoon selected~ ', id, prevTextContent)
			var textballoon = this.getSelectedItem(id);
			if (textballoon) {
				NHIE.workspace.$clipping_area.addClass('insert-component');
				var component = new TextBalloon({
					item_id: id,
					src: textballoon.src,
					id: 'nhie-component-textballoon_'+textballoon.id,
					style:{
						width: textballoon.width,
						height: textballoon.height
					},
					textPos: textballoon.textPos,
					content: prevTextContent
				});
				this.component = component;
				this.enableTextAttributes(true);
			}
		}

	});
});
