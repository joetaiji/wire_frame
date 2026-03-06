define([
	'jquery',
	'underscore',
	'app/classes/ui/Panel',

	'text!resources/tpl/ui/layerpanel/ui-layerpanel.body.tpl.html',
	'text!resources/tpl/ui/layerpanel/ui-layerpanel.item.tpl.html',

	'app/plugins/jquery-ui'
], function($, _, Panel, _body_tpl, _item_tpl) {
	var LayerPanel = Panel.extend({
		classname: 'LayerPanel',
		renderTo: '.panels',
		defaultConfig: {
			template: {
				cls: 'ui-layerpanel',
				bodyTpl: _body_tpl
			}
		},
		events: {
			render: function() {
				var me = this;
				$(this.dom).find('ul').off('click')
				.on('mouseenter', 'li[data-layer-id]', function() {
					$(this).parent().find('li').removeClass('hover');
					$(this).addClass('hover');
				})
				.on('mouseleave', 'li[data-layer-id]', function() {
					$(this).removeClass('hover');
				})
				.on('click', 'li', function(e) {
					var layerId = $(this).attr('data-layer-id');
					var layer = NHIE.workspace.getLayerById(layerId);
					layer && layer.select();
				}).on('click', 'button.btn-visibility', function(e) {
					e.preventDefault();
					e.stopPropagation();
					var $li = $(this).closest('li[data-layer-id]');
					var layerId = $li.attr('data-layer-id');
					var layer = NHIE.workspace.getLayerById(layerId);

					if($(this).hasClass('layer-visible')) {
						me.setItemVisibility(layerId, false);
						layer.hide();
					} else {
						me.setItemVisibility(layerId, true);
						layer.show();
					}

				}).on('click','button.btn-remove', function(e) {
					e.preventDefault();
					e.stopPropagation();

					var $li = $(this).closest('li[data-layer-id]');
					var layerId = $li.attr('data-layer-id');
					var layer = NHIE.workspace.getLayerById(layerId);
					var id_arr = [];
					$li.parent().find('li[data-layer-id]').each(function(i,el) {
						var id = $(el).attr('data-layer-id');
						if(id!==layerId) id_arr.push(id);
					});

					id_arr = id_arr.reverse();
					if(id_arr.length) {
						NHIE.workspace.reload({
							id_arr: id_arr,
							skipEvent: false
						});
					} else {
						//alert('need at least 1 layer to edit')
						$li.parent().find('button.btn-remove').hide();
					}
					NHIE.app.setMode('empty');
					NHIE.toolbar.resetButtonStatus();
					// 2017.05.16 add by nkpark (레이어 삭제시 툴바 reset(토글초기화))
					NHIE.toolbar.resetToggle();

				});
				var $panel_body = $(this.dom).find('.layer-panel-body-content');
				var scrollTop = 0;
				var $layer_list = $(this.dom).find('ul');
				$layer_list.sortable({
					axis: 'y',
					start: function(event, ui) {
						var $ul = ui.item.parent();
						$layer_list.addClass('sorting');
						$layer_list.find('li').removeClass('hover');
						if($ul.find('li[data-layer-id]').length <= 1) {
							e.preventDefault();
						}
						scrollTop = -1 * parseInt($panel_body.find('.mCSB_container').css('top'));
					},
					update: function(event, ui) {
						console.log(event, ui);
						var movingLayerId = ui.item.attr('data-layer-id');
						var $arr = ui.item.parent().find('li[data-layer-id]');
						var idarr = [];
						$arr.each(function(i, el){
							idarr.push($(this).attr('data-layer-id'));
						});
						idarr = idarr.reverse();
						NHIE.workspace.reload({
							id_arr: idarr,
							skipEvent: false
						});
						var movingLayer = NHIE.workspace.getLayerById(movingLayerId);
						movingLayer.select();
						if(scrollTop) {
							$panel_body.mCustomScrollbar('scrollTo', scrollTop, {
								scrollInertia: 0
							});
							scrollTop = 0;
						}
						setTimeout(function() {
							$layer_list.removeClass('sorting');
							$layer_list.find('li[data-layer-id='+movingLayerId+']').trigger('mouseenter');
						},50);
					}
				});

				$panel_body.mCustomScrollbar();
			}
		},
		items: [],
		setItemVisibility: function(layer_id, visibility, procPanelItemOnly) {
			var $li = $(this.dom).find('.layer-item[data-layer-id='+layer_id+']');
			var $button = $li.find('button');
			var layer = NHIE.workspace.getLayerById(layer_id);
			if (layer) {
				var STYLE_VISIBLE_CLASS = 'layer-visible fa-eye';
				var STYLE_HIDDEN_CLASS =  'layer-hidden fa-eye-slash';
				if(!visibility) {
					$button.removeClass(STYLE_VISIBLE_CLASS).addClass(STYLE_HIDDEN_CLASS);
				} else {
					$button.removeClass(STYLE_HIDDEN_CLASS).addClass(STYLE_VISIBLE_CLASS);
				}
			}
		},
		add: function(layer) {
			//this.items.push(layer);

			var panel_item = NHIE.tmpl(_item_tpl, {
				layer_id: layer.id
			});
			var $item = $(panel_item);
			$(this.dom).find('ul.layer-items').prepend($item);
			if($(this.dom).find('ul.layer-items button.btn-remove').length > 1){
				$(this.dom).find('ul.layer-items button.btn-remove').show();
			} else {
				$(this.dom).find('ul.layer-items button.btn-remove').hide();
			}

			$(this.dom).find('.layer-panel-body-content').mCustomScrollbar('update');
		},
		clear: function() {
			$(this.dom).find('ul.layer-items').html('');
		},
		select: function(id) {
			var selectedLayer = NHIE.workspace.getLayerById(id);
			if(selectedLayer) {
				$(this.dom).find('li.layer-item').removeClass('selected');
				$(this.dom).find('li.layer-item[data-layer-id=' + id + ']').addClass('selected');
			}
		},
		resetThumbnails: function() {
			var me = this;
			_.each(NHIE.workspace.getAllLayers(), function(layer) {
				me.drawThumbnail(layer.id);
				var visible = layer.$canvasWrapper.is(':hidden');
				me.setItemVisibility(layer.id, !visible);
			});
		},
		drawThumbnail: function(id) {
			var layer = NHIE.workspace.getLayerById(id);
			if (layer) {
				var $thumbnail_container = $('li.layer-item[data-layer-id='+id+'] div.layer-thumbnail .layer-thumbnail-container');

				var $thm_wrap = $('<div class="layer-container"></div>');
				var $thm_canvas = layer.$canvasWrapper.clone();
				// hidden 되어 있어도 일단 이쪽에서는 보이도록 처리.
				$thm_canvas.show();
				$thm_wrap.append($thm_canvas);
				$thumbnail_container.html('').append($thm_wrap);

				// 이미지 내용 복구
				var _inner_canvas = $thumbnail_container.find('canvas').get(0);
				NHIE.util.canvasManager.resetImageData(_inner_canvas);

				// thumbnail 크기 맞춤
				var workspace_size = NHIE.workspace.getSize();
				$thm_wrap.css({
					width: workspace_size.width,
					height: workspace_size.height
				});

				var MAX_THUMBNAIL_WIDTH  = 40;
				var MAX_THUMBNAIL_HEIGHT = 40;

				var thm_box = {
					width: MAX_THUMBNAIL_WIDTH,
					height: MAX_THUMBNAIL_HEIGHT,
				};
				var thm_zoom = 1;
				if(workspace_size.width > workspace_size.height) {
					thm_box.height = MAX_THUMBNAIL_HEIGHT / workspace_size.width * workspace_size.height;
					thm_zoom = MAX_THUMBNAIL_WIDTH / workspace_size.width;

					if(thm_box.height > MAX_THUMBNAIL_HEIGHT) {
						var ratio = thm_box.height / MAX_THUMBNAIL_HEIGHT;
						thm_box.height = MAX_THUMBNAIL_HEIGHT;
						thm_box.width /= ratio;
						thm_zoom /= ratio;
					}
				} else {
					thm_box.width = MAX_THUMBNAIL_WIDTH / workspace_size.height * workspace_size.width;
					thm_zoom = MAX_THUMBNAIL_HEIGHT / workspace_size.height;
					if(thm_box.width > MAX_THUMBNAIL_WIDTH) {
						var ratio = thm_box.width / MAX_THUMBNAIL_WIDTH;
						thm_box.width = MAX_THUMBNAIL_WIDTH;
						thm_box.height /= ratio;
						thm_zoom /= ratio;
					}
				};
				thm_box.marginLeft = thm_box.width / -2;
				thm_box.marginTop = thm_box.height / -2;

				console.log('drawThumbnail - ', thm_zoom)

				$thumbnail_container.css(thm_box);
				$thm_wrap.css({
					//zoom: thm_zoom,
					transform: 'scale('+thm_zoom+')',
					transformOrigin: '0px 0px',
					position:'absolute',
				});

			}

		}

	});

	return LayerPanel;
});
