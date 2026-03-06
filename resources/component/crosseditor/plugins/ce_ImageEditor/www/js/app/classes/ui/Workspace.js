define([
	'jquery', 'underscore',
	'app/classes/ui/UIElement',
	'app/classes/ui/workspace/LayerCanvas',
	'app/classes/ui/workspace/WorkspaceResizer',
	'app/classes/ui/workspace/WorkspaceCropper',

	'text!resources/tpl/ui/ui-workspace.tpl.html'
], function($, _, UIElement, LayerCanvas, WorkspaceResizer, WorkspaceCropper, _tpl) {
	var Workspace = UIElement.extend({
		defaultConfig: {
			renderTo: '.nhie-body .workspace',
			template: {
				tpl: _tpl
			}
		},
		style: {},
		layers: [],
		layersHash: {},

		events: {
			render: function(e) {
				this.initResizer();
				this.initCropper();
				this.$clipping_area = $('.layer-container.layer-foreground.clipping-area');
			}
		},
		initResizer: function() {
			var workspace_resizer = new WorkspaceResizer({
				id: 'workspace-resizer',
				target : this
			});
			workspace_resizer.render();
			this.workspace_resizer = workspace_resizer;
		},
		initCropper: function() {
			var workspace_cropper = new WorkspaceCropper({
				id: 'workspace-cropper',
				target : this
			});
			//workspace_cropper.target = workspace_cropper;
			workspace_cropper.render();
			this.workspace_cropper = workspace_cropper;

		},
		getSize: function() {
			return {
				width: NHIE.app.data('canvas-width') || 600,
				height: NHIE.app.data('canvas-height') || 400,
				scale: NHIE.app.data('navigator-zoom') || 100
			};
		},
		setSize: function(width, height, showSize) {
			width = width || 640;
			height = height || 480;
			NHIE.app.data('canvas-width', width);
			NHIE.app.data('canvas-height', height);
			this.style = {
				width: width,
				height: height
			};
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;

			$('.workspace .layer-container.layer-workspace').css({
				width: width,
				height: height,
				marginLeft: width / -2,
				marginTop: height / -2,
				transform: 'scale('+scale+')',
			});

			var $layer_container = $('.workspace .layer-workspace');
			var descaledStyles = {
				width: $layer_container.width() * scale,
				height: $layer_container.height() * scale,
				marginLeft: $layer_container.width() * scale / -2,
				marginTop: $layer_container.height() * scale / -2,

				left: '50%',
				top: '50%',
			}

			$('.layer-tracker-container').css(descaledStyles);
			$('.clipping-area').css(descaledStyles);

			this.workspace_resizer.syncSize();
			if(showSize) {
				NHIE.toolbar.updateCanvasSize(width, height);
			}
			$(window).resize();
		},
		setStyle: function(style) {
			var orgStyle = this.getSize();
			this.setSize(style.width || orgStyle.width, style.height || orgStyle.height);
		},
		addLayer: function(config) {
			var opt = {};
			if(config && config.id) {
				opt.id = config.id;
				opt.dom = config.dom;
			} else {
				var layer_id = this.layers.length;
				while (this.layers[layer_id]) {
					layer_id++;
				}
				opt.id = 'nhie-layercanvas-' + layer_id
			}

			var layer = new LayerCanvas(opt);
			this.layers.push(layer);
			this.layersHash[layer.id] = layer;

			return layer;
		},
		clear: function() {
			this.layers = [];
			this.layersHash = {};
			$('.workspace-contents .workspace-contents-wrapper .layer-wrapper').html('');
			$('.workspace-contents .workspace-contents-wrapper .layer-tracker-container').html('');

			NHIE.layerPanel.clear();
			NHIE.navigator.clear();
		},
		getAllLayers: function() {
			return this.layers || [];
		},
		getLayer: function(idx) {
			return this.layers[idx];
		},
		getLayerById: function(id) {
			return this.layersHash[id];
		},
		selectLayer: function(idx) {
			if(this.layers[idx]) {
				this.layers[idx].select();
			}
		},
		unselectLayers: function() {
			_.each(this.layers, function(layer) {
				layer.unselect();
			});
		},
		getSelectedLayer: function() {
			var selectedLayer = null;
			_.each(this.layers, function(layer) {
				if (layer.selected) {
					selectedLayer = layer;
					return false;
				}
			});
			return selectedLayer;
		},

		$getResizer: function() {
			var $workspace_resizer = $(this.dom).find('.layer-tracker-container .workspace-resizer');
			if (!$workspace_resizer.length) {
				this.initResizer();
				$workspace_resizer = $(this.dom).find('.layer-tracker-container .workspace-resizer');
			}
			return $workspace_resizer;
		},
		activateResizer: function(enable) {
			var $workspace_resizer = this.$getResizer();
			if (enable) {
				$workspace_resizer.show();
				/* */
				_.each(this.layers, function(layer) {
					layer.tracker.hide();
				});
				/* */
				var workspace_size = this.getSize();
				$workspace_resizer.attr({
					'data-org-width':workspace_size.width,
					'data-org-height':workspace_size.height,
				});
				NHIE.workspace.restore_state_resize = workspace_size;
				this.syncResizerSize();

			} else {
				$workspace_resizer.hide();
				$workspace_resizer.attr({
					'data-org-width': '',
					'data-org-height': '',
				});
			}
		},
		$getCropper: function() {
			var $workspace_cropper = $(this.dom).find('.layer-tracker-container .workspace-cropper');
			if (!$workspace_cropper.length) {
				this.initCropper();
				$workspace_cropper = $(this.dom).find('.layer-tracker-container .workspace-cropper');
			}
			return $workspace_cropper;
		},
		activateCropper: function(enable) {
			var $workspace_cropper = this.$getCropper();
			if (enable) {
				$workspace_cropper.show();
				_.each(this.layers, function(layer) {
					layer.tracker.hide();
				});
				// console.log('cropper activated!')
				this.syncCropperSize();
				this.workspace_cropper.markCurrentCropperStatus();
			} else {
				$workspace_cropper.hide();
				//this.workspace_cropper.clearCropperStatus();
			}			
		},
		/**
		 * workspace 크기와 리사이즈 트래커의 크기를 동기화
		 * @param  {boolean} fromTracker 동기화 기준이 tracker 인지 여부
		 */
		syncResizerSize: function(fromTracker) {
			if(!fromTracker) {
				// sync current size
				var workspace_size = this.getSize();
				var zoom = (NHIE.app.data('navigator-zoom') || 100)/100;
				var $workspace_resizer = this.$getResizer();

				var resizer_style = {
					width: workspace_size.width * zoom ,
					height: workspace_size.height * zoom,
					marginLeft: workspace_size.width * zoom /-2,
					marginTop: workspace_size.height * zoom /-2
				};

				console.log('resizer_style : ',resizer_style)
				$workspace_resizer.css(resizer_style);

			} else {
				var $workspace_wrapper = $('.workspace .layer-container.layer-workspace .layer-wrapper');

				var scale = {
					x: parseFloat($workspace_wrapper.attr('data-scale-x') || 1),
					y: parseFloat($workspace_wrapper.attr('data-scale-y') || 1)
				};

				_.each(this.layers, function(layer) {
					var style = _.clone(layer.style);
					style = _.extend(style, {
						left: style.left * scale.x,
						top: style.top * scale.y,
						width: style.width * scale.x,
						height: style.height * scale.y
					});
					layer.setCanvasStyle(style);
				});

				NHIE.app.fireEvent('changecontent');

			}
		},
		/**
		 * workspace 크기와 리사이즈 트래커의 크기를 동기화
		 * @param  {boolean} fromTracker 동기화 기준이 tracker 인지 여부
		 */
		syncCropperSize: function(fromTracker) {
			// console.log('------ call syncCropperSize()', arguments)
			var zoom = (NHIE.app.data('navigator-zoom') || 100)/100;
			// 현재 설정되어 있는 더미 영역에 맞도록 cropper 트래의 크기를 적절히 변경
			if(!fromTracker) {
				// sync current size
				var workspace_size = this.getSize();
				var $workspace_cropper = this.$getCropper();

				var resizer_style = {};
				var style_before = this.workspace_cropper.target.getStyle();

				if(!style_before.width) {
					// 기본 사이즈로 변경
					var cropperSize = this.workspace_cropper.getDefaultCropperSize();

					resizer_style = {
						width: cropperSize.width * zoom ,
						height: cropperSize.height * zoom,
						left: workspace_size.width * zoom / 2,
						top: workspace_size.height * zoom / 2,
						marginLeft: cropperSize.width * zoom /-2,
						marginTop: cropperSize.height * zoom /-2
					};

				} else {
					resizer_style = {
						width: style_before.width * zoom ,
						height: style_before.height * zoom,
						left:style_before.left * zoom,
						top:style_before.top * zoom,
						marginLeft: style_before.marginLeft * zoom,
						marginTop: style_before.marginTop * zoom
					}
				}
				
				this.workspace_cropper.target.setStyle(resizer_style);
				$workspace_cropper.css(resizer_style);
				
			} else {
				// 설정되어있는 cropper 크기에 맞도록 작업영역 크기 변경

				// var $workspace_wrapper = $('.workspace .layer-container.layer-workspace .layer-wrapper');

				// var scale = {
				// 	x: parseFloat($workspace_wrapper.attr('data-scale-x') || 1),
				// 	y: parseFloat($workspace_wrapper.attr('data-scale-y') || 1)
				// };

				var cropperStyle = this.workspace_cropper.target.getStyle();
				var offset = {
					left: cropperStyle.left + (parseFloat(this.workspace_cropper.target.$dom.css('margin-left')||0))/zoom,
					top: cropperStyle.top + (parseFloat(this.workspace_cropper.target.$dom.css('margin-top')||0))/zoom
				};

				_.each(this.layers, function(layer) {
					var style = _.clone(layer.style);
					style = _.extend(style, {
						left: (style.left - offset.left),
						top: (style.top - offset.top),
					});
					layer.setCanvasStyle(style);
				});

				NHIE.workspace.setSize(cropperStyle.width, cropperStyle.height);

				// 작업 영역 크기가 변경되었으므로 cropper 크기도 다시 조정
				this.syncCropperSize();
				NHIE.app.fireEvent('changecontent');

			}
		},		
		/**
		 * 좌 /우측 90도 회전 수행
		 * @param  {string} direction 회전 방향 ("left" / "right")
		 */
		rotateWorkspace: function(direction) {
			var amount = 90 * (direction === 'left' ? -1:1);
			var workspace_size = this.getSize();

			NHIE.workspace.setSize(workspace_size.height, workspace_size.width);
			_.each(this.layers, function(layer) {
				var rotationDeg = parseInt(layer.getModifyInformation('rotate') || '0');
				rotationDeg = (rotationDeg + amount + 360) % 360;
				var style = layer.style;
				var canvas = layer.getCanvasElement();

				// 회전 적용시, 좌표의 기준점에 따라 layer 의 위치 변경
				var targetPoint = {};
				if(direction === 'left') {
					targetPoint.left = style.top;
					targetPoint.top = workspace_size.width - style.left - style.width;
				} else if(direction ==='right') {
					targetPoint.left = workspace_size.height - style.top - style.height;
					targetPoint.top = style.left;
				}

				layer.setCanvasStyle({
					width: style.height,
					height: style.width,
					left: targetPoint.left,
					top: targetPoint.top
				});

				canvas.width = style.height;
				canvas.height = style.width;

				layer.modifyCanvas('rotate', rotationDeg, true);
			});
			NHIE.app.fireEvent('changecontent');
		},
		/**
		 * 상하 / 좌우 반전 수행
		 * @param  {string} direction 반전 방향 ("h" / "v")
		 */
		flipWorkspace: function(direction) {
			_.each(this.layers, function(layer) {
				var flipValue = JSON.parse(layer.getModifyInformation('flip') || '{"h":false,"v":false}');
				flipValue.h = (direction === 'h') !== flipValue.h ;
				flipValue.v = (direction === 'v') !== flipValue.v ;

				var workspace_size = NHIE.workspace.getSize();
				var style = _.clone(layer.style);

				if (direction === 'h') {
					// 가로 방향 flip 시 left 다시 계산
					style.left = workspace_size.width - style.width - style.left;
				}
				if (direction === 'v') {
					// 세로 방향 flip 시 top 다시 계산
					style.top = workspace_size.height - style.height - style.top;
				}
				layer.setCanvasStyle(style);
				layer.modifyCanvas('flip', flipValue, true);
			});
			NHIE.app.fireEvent('changecontent');
		},
		reload: function(opt) {
			NHIE.app.setMode('empty');
			opt = opt || {};
			var $workspace = $('.workspace-contents .workspace-contents-wrapper .layer-wrapper');
			var content = opt.content || '' ; //|| $workspace.html();
			var workspace_size = opt.size || NHIE.workspace.getSize();

			if (opt.id_arr && opt.id_arr.length) {
				content = '';
				for(var i=0;i<opt.id_arr.length;i++) {
					var layer = NHIE.workspace.getLayerById(opt.id_arr[i]);
					if(layer) {
						content += layer.$canvasWrapper.get(0).outerHTML;
					}
				}
			}

			NHIE.workspace.clear();

			NHIE.workspace.setSize(workspace_size.width, workspace_size.height);
			$workspace.html(content);

			$workspace.find('canvas').each(function(i, canvas) {
				var layer = NHIE.workspace.addLayer({
					id: canvas.id,
					dom: canvas
				});
				NHIE.lib.util.canvasManager.resetImageData(canvas);
			});

			var layers = NHIE.workspace.getAllLayers();
			if(layers && layers.length) {
				var top_layer = layers[layers.length - 1];
				if(top_layer) {
					top_layer.select();
				}
			}

			var skipEvent = (opt.skipEvent!==false);
			NHIE.app.fireEvent('changecontent', skipEvent);
		},
		mergeLayers : function() {
			var $temp_canvas = $('<canvas></canvas>');
			var canvas = $temp_canvas.get(0);
			var ctx = canvas.getContext('2d');
			var workspace_size = NHIE.workspace.getSize();

			canvas.width = workspace_size.width;
			canvas.height = workspace_size.height;

			var layers = this.getAllLayers();
			var p_arr = [];

			_.each(layers, function(layer) {
				p_arr.push(layer.rasterize());
			});
			return NHIE.lib.Promise.all(p_arr).then(function() {
				_.each(layers, function(layer) {
					if(!layer.hidden) {
						var style = layer.getStyle();
						var layerCanvas = layer.getCanvasElement();
						ctx.drawImage(layerCanvas, style.left, style.top);
					}
				});
				return canvas;
			});

			//return canvas;
		}
	});

	return Workspace;
});
