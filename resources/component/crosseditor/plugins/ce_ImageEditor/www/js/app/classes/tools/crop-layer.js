define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',
	'text!resources/tpl/ui/property/ui-property-item-crop-layer.tpl.html',


], function(_, $, ToolBase, _propertyTpl) {

	var CROP_MENU_MARKUP = '';
	CROP_MENU_MARKUP += '<ul id="nhie-app-menu-crop" style="display:none;">';
	CROP_MENU_MARKUP += '<li data-action="cut">'+NHIE.Lang['PluginImageEditor_crop_action_cut']+'</li>';
	CROP_MENU_MARKUP += '<li data-action="crop">'+NHIE.Lang['PluginImageEditor_crop_action_crop']+'</li>';
	CROP_MENU_MARKUP += '<li data-action="cut_add">'+NHIE.Lang['PluginImageEditor_crop_action_cut_add']+'</li>';
	CROP_MENU_MARKUP += '<li data-action="copy_add">'+NHIE.Lang['PluginImageEditor_crop_action_copy_add']+'</li>';
	CROP_MENU_MARKUP += '</ul>';

	return new ToolBase({
		name: 'crop-layer',
		type: 'toggle',
		iconCls:'fa fa-fw fa-crop',
		propertyTpl: _propertyTpl,

		applyBtnVisible: false,
		restoreBtnTitle: NHIE.Lang['PluginImageEditor_button_cancel'],

		handler: function($button, toggleStatus) {
			var $crop_menu = this.$getCropMenu();
			$crop_menu.hide();
			this.__crop_menu_show = false;
			this.$getCropBox().hide();
		},
		enableStatus: function() {
			return !!(NHIE.workspace.getSelectedLayer() && !NHIE.workspace.getSelectedLayer().empty);
		},
		onShowProperty: function(data) {

			data = data || {
				x:0,y:0,width:0,height:0,left:0,top:0
			};
			NHIE.propertyPanel.setPropertyContent(this.name, data);
		},
		onRenderProperty: function() {

		},
		onApplyProperty: function() {

		},
		onRestoreProperty: function() {
			this.initCropBox();
		},

		initCropBox: function() {
			this.$getCropMenu().hide();
			this.$getCropBox().hide();
			this.__crop_menu_show = false;
			this.box = {left:'', top:'', width:'', height:''};
		},
		onMouseDownWorkspace: function(e) {

			this.initCropBox();
			var data = {};
			var $mousePosOrient = $('.layer-container.clipping-area.layer-foreground');
			var mousePosOffset = $mousePosOrient.offset();
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			data.x = parseInt(e.clientX -mousePosOffset.left) / scale;
			data.y = parseInt(e.clientY -mousePosOffset.top) / scale;

			this.status = {
				mousedown: true,
				x: data.x,
				y: data.y
			};
			if(data.x < 0 || data.y < 0) {

			} else {

			}
		},
		onMouseMoveWorkspace: function(e) {
			var data = {};
			var $mousePosOrient = $('.layer-container.clipping-area.layer-foreground');
			var $windowPosOrient = $('.nhie-body .workspace');
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			var workspace_size = NHIE.workspace.getSize();
			var mousePosOffset = $mousePosOrient.offset();

			data.x = parseInt((e.clientX - mousePosOffset.left) / scale) ;
			data.y = parseInt((e.clientY - mousePosOffset.top) / scale);

			if(this.status) {
				var status = this.status;
				status.moved = true;

				data.left = status.x > 0 ? status.x : 0;
				data.top  = status.y > 0 ? status.y : 0;

				if(data.left > workspace_size.width) {
					data.left = workspace_size.width;
				}
				if(data.top > workspace_size.height) {
					data.top = workspace_size.width;
				}

				data.width = (data.x>0?data.x:0) - data.left;
				data.height = (data.y>0?data.y:0) - data.top;

				var box = _.clone(data);
				if(box.width < 0) {
					box.left = data.left + data.width;
					box.width = -data.width;
				}
				if(box.height < 0) {
					box.top = data.top + data.height;
					box.height = -data.height;
				}

				if(box.left < 0) box.left = 0;
				if(box.top < 0) box.top = 0;
				if(box.left + box.width > workspace_size.width) {
					box.width = workspace_size.width - box.left;
				}
				if(box.top + box.height > workspace_size.height) {
					box.height = workspace_size.height - box.top;
				}

				box = {
					left: parseInt(box.left),
					top: parseInt(box.top),
					width: parseInt(box.width),
					height: parseInt(box.height),
				};
				this.status.box = this.box = box;
				this.showCropBox(box);
				_.extend(data, box);
			} else {
				_.extend(data, this.box);
			}

			NHIE.propertyPanel.setPropertyContent(this.name, data);

		},
		onMouseUpWorkspace: function(e) {
			if(this.status && this.status.moved) {
				var $crop_menu = this.$getCropMenu();
				var me = this;
				var box = _.clone(this.status.box);
				if(box.width && box.height) {
					$crop_menu.show();
					$crop_menu.menu({
						select: function(e, ui) {
							NHIE.app.loading(true);
							me.doCropLayer(ui.item.attr('data-action'), box);
						}
					});

					this.resetCropMenuPosition();
					this.__crop_menu_show = true;
				} else {
					var $tracker_container = $('.layer-tracker-container');
					var $cropBox = $tracker_container.find('.crop-box');
					$cropBox.hide();
				}
			}
			this.status = null;
		},
		resetCropMenuPosition: function() {
			var $crop_menu = this.$getCropMenu();
			var $crop_box = this.$getCropBox();

			if($crop_box.length) {
				var cropBoxOffset = $crop_box.offset();
				var cropBoxStyle = {
					width: parseInt($crop_box.css('width')),
					height: parseInt($crop_box.css('height'))
				};
				var cropMenu_w = $crop_menu.width();
				var cropMenu_h = $crop_menu.height();

				var window_size = {
					width: $('.nhie-body .workspace').width(),
					height: $('.nhie-body .workspace').height()
				};

				var menuPos = {
					left: (cropBoxOffset.left + cropBoxStyle.width),
					top:  (cropBoxOffset.top + cropBoxStyle.height) - 40
				};

				if(menuPos.left + cropMenu_w  > window_size.width - 20) {
					menuPos.left = window_size.width - 20 - cropMenu_w;
				}
				if(menuPos.top + cropMenu_h  > window_size.height - 20) {
					menuPos.top = window_size.height - 20 - cropMenu_h;
				}
				$crop_menu.css(menuPos);
			}
		},
		resetCropBoxSizeByScale: function() {
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			var $crop_box = this.$getCropBox();
			if($crop_box.length) {
				var box = _.clone(this.box);
				var cropBoxStyle = {
					left: parseInt($crop_box.css('left')),
					top: parseInt($crop_box.css('top')),
					width: parseInt($crop_box.css('width')),
					height: parseInt($crop_box.css('height'))
				};
				cropBoxStyle = box;

				cropBoxStyle = {
					left: cropBoxStyle.left * scale,
					top: cropBoxStyle.top * scale,
					width: cropBoxStyle.width * scale,
					height: cropBoxStyle.height * scale
				};
				$crop_box.css(cropBoxStyle);
			}
		},
		onResizeWindow: function() {
			this.resetCropBoxSizeByScale();
			this.resetCropMenuPosition();
		},

		$getCropMenu: function() {
			var $crop_menu = $('#nhie-app-menu-crop');
			if(!$crop_menu.length) {
				$crop_menu = $(CROP_MENU_MARKUP);
				$crop_menu.appendTo($('.nhie-application .workspace'));
			}
			return $crop_menu;
		},
		$getCropBox: function() {
			var $tracker_container = $('.layer-tracker-container');
			var $cropBox = $tracker_container.find('.crop-box');
			console.log('NHIE.lib.useragent.info.IsSafari - ',NHIE.lib.useragent.info.IsSafari, NHIE.lib.useragent.version)
			if($cropBox.length===0) {
				$cropBox = $('<div class="layer-tracker crop-box border-animation"></div>');
				$cropBox.appendTo($tracker_container);
				if(NHIE.lib.useragent.info.IsSafari && parseInt(NHIE.lib.useragent.version)<6 ) {
					console.log(' -- win safari - reset cropbox style..')
					$cropBox.removeClass('border-animation').css({
						border:'1px solid black'
					})
				}
			}
			return $cropBox;
		},
		showCropBox: function(style) {
			var $cropBox = this.$getCropBox();
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;

			$cropBox.css({
				left: style.left * scale,
				top: style.top * scale,
				width: style.width * scale,
				height: style.height * scale,
				position: 'absolute',
				display: 'block'
			});
		},
		doCropLayer: function(action, box) {
			NHIE.app.loading(true);
			var p = NHIE.lib.Promise.resolve();
			var layer = NHIE.workspace.getSelectedLayer();
			var layerStyle = layer.getStyle();
			var canvas = layer.getCanvasElement();
			var context = canvas.getContext('2d');

			layerStyle.right = layerStyle.width + layerStyle.left;
			layerStyle.bottom = layerStyle.height + layerStyle.top;

			box.right = box.width + box.left;
			box.bottom = box.height + box.top;

			var isCropboxOutOfLayer = (
				(box.right < layerStyle.left)
				|| (box.left > layerStyle.right)
				|| (box.bottom < layerStyle.top)
				|| (box.top > layerStyle.bottom)
			);

			var crossingBox = {};
			var crossingBoxRelative = {};

			if(isCropboxOutOfLayer) {
				crossingBox = null;
			} else {
				if(box.left < layerStyle.left) {
					crossingBox.left = layerStyle.left;
				} else {
					crossingBox.left = box.left;
				}
				if(box.top < layerStyle.top) {
					crossingBox.top = layerStyle.top;
				} else {
					crossingBox.top = box.top;
				}

				if(box.right < layerStyle.right) {
					crossingBox.width = box.right - crossingBox.left;
				} else {
					crossingBox.width = layerStyle.right - crossingBox.left;
				}

				if(box.bottom < layerStyle.bottom) {
					crossingBox.height = box.bottom - crossingBox.top;
				} else {
					crossingBox.height = layerStyle.bottom - crossingBox.top;
				}

				crossingBoxRelative = {
					left: crossingBox.left - layerStyle.left,
					top: crossingBox.top  - layerStyle.top,
					width: crossingBox.width,
					height: crossingBox.height
				};
				crossingBoxRelative.right = crossingBoxRelative.left + crossingBoxRelative.width;
				crossingBoxRelative.bottom = crossingBoxRelative.top + crossingBoxRelative.height;

			}

			// workspace 의 변형 상태에 따라 각 crossingBox 들의 영역 위치를 조정해줌

			var fn = {
				// 자르기
				cut: function() {
					layer.clearModifyInformation();
					return p.then(function() {
						if(isCropboxOutOfLayer) {
							// do nothing
						} else {
							var canvas = layer.getCanvasElement();
							var context = canvas.getContext('2d');
							//console.log(NHIE.lib.util.canvasManager.getCanvasModifyData(canvas));
							if(canvas.width == crossingBoxRelative.width
								&& canvas.height == crossingBoxRelative.height) {
								// 영역 전체를 잘라냈다면 레이어를 비워줌.
								layer.setEmpty();
							} else {
								context.clearRect(
									crossingBoxRelative.left,
									crossingBoxRelative.top,
									crossingBoxRelative.width,
									crossingBoxRelative.height
								);

								// 잘라내서 영역이 좁아질 수 있으므로 crop 처리
								var cropOffset = NHIE.lib.util.canvasManager.cropCanvas(layer.getCanvasElement());
								var layerStyle = layer.getStyle();

								layer.setStyle({
									left: layerStyle.left + cropOffset.x,
									top: layerStyle.top + cropOffset.y,
									width: cropOffset.w,
									height: cropOffset.h
								});


							}
							NHIE.util.canvasCache.set(canvas);
						}

					});
				},
				// 오려내기
				crop: function() {
					layer.clearModifyInformation();
					return p.then(function() {
						if(isCropboxOutOfLayer) {
							// 영역이 겹치지 않으면 레이어 내용 비움
							layer.setEmpty();
							NHIE.util.canvasCache.set(canvas);
						} else {
							var $temp_canvas = $('<canvas></canvas>');
							var temp_canvas = $temp_canvas.get(0);
							//context = prepareCanvasModification(context);
							var canvasModifyData = NHIE.lib.util.canvasManager.getCanvasModifyData(canvas);

							var $layer_wrapper = $(layer.getCanvasElement()).parent().parent();

							var scale = {
								x: parseFloat($layer_wrapper.attr('data-scale-x')||'1'),
								y: parseFloat($layer_wrapper.attr('data-scale-y')||'1')
							};

							var applyScale = function(box, scale) {
								box = _.clone(box);
								box.left *= scale.x;
								box.width *= scale.x;
								box.top *= scale.y;
								box.height *= scale.y;

								return box;
							};


							var imgData = context.getImageData(
								crossingBoxRelative.left,
								crossingBoxRelative.top,
								crossingBoxRelative.width,
								crossingBoxRelative.height
							);


							temp_canvas.width = crossingBoxRelative.width;
							temp_canvas.height = crossingBoxRelative.height;
							var temp_context = temp_canvas.getContext('2d');
							temp_context.putImageData(imgData, 0, 0);

							layer.setCanvasContent({
								canvas: temp_canvas,
								style: crossingBox
							});
							layer.clearModifyInformation();

							$temp_canvas.remove();
						}

					});

				},
				cut_add: function() {
					layer.clearModifyInformation();
					return p.then(function() {
						if(isCropboxOutOfLayer) {
							//alert('NO_IMGDATA_TO_ADD')
							// 잘라낸 영역이 빈 영역이므로
							// 원본 레이어는 유지, 빈 레이어만 삽입
							var new_layer = NHIE.workspace.addLayer('image');
							new_layer.setEmpty();
							NHIE.util.canvasCache.set(new_layer.getCanvasElement());
						} else {
							// 선택영역 복사 후 레이어 추가
							var $temp_canvas = $('<canvas></canvas>');
							var temp_canvas = $temp_canvas.get(0);

							var imgData = context.getImageData(
								crossingBoxRelative.left - 1,
								crossingBoxRelative.top - 1,
								crossingBoxRelative.width + 2,
								crossingBoxRelative.height + 2
							);

							temp_canvas.width = crossingBoxRelative.width + 2;
							temp_canvas.height = crossingBoxRelative.height + 2;
							temp_canvas.getContext('2d').putImageData(imgData, 0, 0);

							var new_layer = NHIE.workspace.addLayer('image');
							new_layer.setCanvasContent({
								canvas: temp_canvas,
								style: {
									left: crossingBox.left -1,
									top: crossingBox.top -1,
									width: crossingBox.width +2,
									height: crossingBox.height+2,
								}
							});
							//context.restore();

							// 원본레이어에서 선택영역 삭제
							if(canvas.width == crossingBoxRelative.width
								&& canvas.height == crossingBoxRelative.height) {
								// 영역 전체를 잘라냈다면 레이어를 비워줌
								layer.setEmpty();
							} else {
								context.clearRect(
									crossingBoxRelative.left,
									crossingBoxRelative.top,
									crossingBoxRelative.width,
									crossingBoxRelative.height
								);
								// 잘라내서 영역이 좁아질 수 있으므로 crop 처리
								var cropOffset = NHIE.lib.util.canvasManager.cropCanvas(layer.getCanvasElement());
								var layerStyle = layer.getStyle();

								layer.setStyle({
									left: layerStyle.left + cropOffset.x,
									top: layerStyle.top + cropOffset.y,
									width: cropOffset.w,
									height: cropOffset.h
								});

							}

							NHIE.util.canvasCache.set(canvas);

							new_layer.select();
							$temp_canvas.remove();
						}
					});
				},

				copy_add: function() {
					return p.then(function() {
						if(isCropboxOutOfLayer) {
							//alert('NO_IMGDATA_TO_COPY')
							// 잘라낸 영역이 빈 영역이므로
							// 원본 레이어는 유지, 빈 레이어만 삽입
							var new_layer = NHIE.workspace.addLayer('image');
							new_layer.setEmpty();
							NHIE.util.canvasCache.set(new_layer.getCanvasElement());

						} else {

							var $temp_canvas = $('<canvas></canvas>');
							var temp_canvas = $temp_canvas.get(0);

							var imgData = context.getImageData(
								crossingBoxRelative.left,
								crossingBoxRelative.top,
								crossingBoxRelative.width,
								crossingBoxRelative.height
							);

							temp_canvas.width = crossingBoxRelative.width;
							temp_canvas.height = crossingBoxRelative.height;
							temp_canvas.getContext('2d').putImageData(imgData, 0, 0);

							var new_layer = NHIE.workspace.addLayer('canvas');
							new_layer.setCanvasContent({
								canvas: temp_canvas,
								style: crossingBox
							});
							new_layer.select();
							$temp_canvas.remove();
						}
					});
				}
			};

			var prepareCanvasModification = function(context, reverse) {
				var factor = !!reverse ? -1:1;
				var canvasModifyData = NHIE.lib.util.canvasManager.getCanvasModifyData(canvas);
				context.save();
				var scale = {
					x: canvasModifyData.flip.h ? -1 * factor : 1 * factor,
					y: canvasModifyData.flip.v ? -1 * factor: 1 * factor
				};
				context.scale(scale.x, scale.y);
				context.translate(canvas.width / 2 * scale.x, canvas.height / 2 * scale.y);
				// 상하 / 좌우 반전 후 회전 동작시에도 일반적인 회전과 동일하게 보이도록
				context.rotate(canvasModifyData.rotate / 180 * Math.PI * (scale.x * scale.y) * factor);
				return context;
			};

			if(action && fn[action] && typeof fn[action] ==='function') {

				var me = this;

				return layer.rasterize({
					skipHistoryEvent: true
				}).then(function() {
					//layer.clearModifyInformation();
				}).then(fn[action].bind(this)).then(function() {

					NHIE.app.fireEvent('changecontent');
				}).then(function() {
					NHIE.app.loading(false);
					me.initCropBox();
				}).catch(function(e){
					NHIE.app.loading(false);
					console.error(e);
				});
			} else {
				return p;
			}
		}

	});
});
