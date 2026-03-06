define([
	'jquery',
	'underscore',
	'app/classes/Observable',
	'app/classes/ui/workspace/LayerTracker'
], function($, _, Observable, LayerTracker) {
	var LayerCanvas = Observable.extend({
		classname: 'LayerCanvas',
		construct: function(config) {
			this._super(config);
			var $canvas, $layer;

			if(config.dom) {
				$canvas = $(config.dom);
				$layer = $canvas.parent();
				this.style = {
					left: parseFloat($layer.css('left')),
					top: parseFloat($layer.css('top')),
					width: parseFloat($layer.css('width')),
					height: parseFloat($layer.css('height')),
					rotation: parseFloat($layer.attr('data-transform-rotation'))
				}
				if($canvas.attr('data-canvascache-id')==='_CACHE::empty_canvas') {
					this.empty = true;
				}
			} else {
				$canvas = $('<canvas class="layer-canvas" id="'+this.id+'" style="position:absolute;"></canvas>');
				$layer = $('<div class="layer"></div>');
				$layer.append($canvas);

				$('.workspace-contents div.layer-container.layer-workspace .layer-wrapper').append($layer);

				this.style = {
					left: 0,
					top: 0,
					rotation: 0
				};
			}

			this.$canvas = $canvas;
			this.$canvasWrapper = $layer;

			var tracker = new LayerTracker({
				id: 'layer-tracker-' + this.id,
				target: this
			});
			tracker.render();

			this.tracker = tracker;
			if(!config.dom) {
				this.initCanvas();
			} else {
				var _style = {
					left: parseFloat($layer.css('left')),
					top: parseFloat($layer.css('top')),
					width: parseFloat($layer.css('width')),
					height: parseFloat($layer.css('height')),
					rotation: parseFloat($layer.attr('data-transform-rotation'))
				};
				this.setCanvasStyle(_style);
			}

			NHIE.layerPanel.add(this);

		},
		events: {
			mousedown_layer: function(e) {
				console.log('move-layer: mousedown~~')
				this.fireEvent('startmove', e);
			},
			startmove: function(e) {
				var me = this;
				var layerStyle = _.clone(this.style);
				var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;

				var info = {
					mode: 'move-layer',
					scale: scale,
					origin: {
						clientX: e.clientX,
						clientY: e.clientY,

						width: layerStyle.width,
						height: layerStyle.height,
						left: layerStyle.left,
						top: layerStyle.top,
						rotation: layerStyle.rotation
					}
				}
				this.info = info;

			},
			onmove: function(e) {
				var info = this.info;
				var offset = {
					x: (e.clientX - info.origin.clientX) / info.scale,
					y: (e.clientY - info.origin.clientY) / info.scale
				};

				var style = {
					left: info.origin.left + offset.x,
					top: info.origin.top + offset.y
				};
				this.modified = true;
				this.setCanvasStyle(style);
				NHIE.app.fireEvent('changeproperty', style);
			},
			endmove: function(e) {

			}
		},
		initCanvas: function() {
			var info = NHIE.workspace.getSize();
			var style = {
				left: info.width / 2,
				top: info.height / 2,
				width: info.width,
				height: info.height,
				marginLeft: info.width / -2,
				marginTop: info.height / -2
			};

			this.setCanvasStyle({
				left: 0,
				top: 0,
				width: info.width,
				height: info.height
			});
		},
		getCanvasElement: function() {
			return this.$canvas.get(0);
		},
		setEmpty: function() {
			var canvas = this.getCanvasElement();
			var ctx = canvas.getContext('2d');
			canvas.width = 1;
			canvas.height = 1;

			this.empty = true;
		},
		setImage: function(opt) {
			var canvas = this.getCanvasElement();
			var ctx = canvas.getContext('2d');

			var me = this;
			return NHIE.lib.util.getImage(opt.src)
			.then(function(img) {
				var w , h;
				var oversize = false;
				if(opt.style) {
					w = parseInt(opt.style.width);
					h = parseInt(opt.style.height);
				} else {
					w = img.naturalWidth;
					h = img.naturalHeight;
				}
				var MAX_WIDTH = NHIE.util.getConfig('maxImageWidth');
				var MAX_HEIGHT = NHIE.util.getConfig('maxImageHeight');

				if(w > MAX_WIDTH || h > MAX_HEIGHT) {
					oversize = true;
					NHIE.dialog['alert_dialog_bigimage'].show();

					if(w > MAX_WIDTH) {
						h = MAX_WIDTH * h / w;
						w = MAX_WIDTH;
					}
					if (h > MAX_HEIGHT) {
						w = MAX_HEIGHT * w / h;
						h = MAX_HEIGHT;
					}
				}

				canvas.width = w;
				canvas.height = h;

				NHIE.workspace.setSize(w, h);
				ctx.drawImage(img, 0, 0, w, h);

				NHIE.util.canvasCache.set(canvas);
				return {
					img:img,
					size:{
						width: w,
						height: h
					},
					oversize: oversize
				};
			})
			.then(function(result) {
				var imageSize = {};
				if(!opt.style) {
					// 화면 중심으로 canvas 이동, 원본비율 유지
					var workspace_size = NHIE.workspace.getSize();
					var i_w = result.size.width;
					var i_h = result.size.height;
					var c_w = workspace_size.width;
					var c_h = workspace_size.height;

					var img_w = 0;
					var img_h = 0;

					if(i_w < c_w && i_h < c_h) {
						img_w = i_w;
						img_h = i_h;
					} else {
						img_w = (i_w > i_h)? c_w : (c_h * i_w / i_h);
						img_h = (i_h > i_w)? c_h:(c_w * i_h / i_w);
					}

					imageSize = {
						width: img_w,
						height: img_h
					};

				} else {
					console.log(result, opt)
					if(result.oversize) {
						imageSize = {
							width: result.size.width,
							height: result.size.height
						};
					} else {
						imageSize = {
							width: opt.style.width,
							height: opt.style.height
						};
					}
				}
				me.setCanvasStyle(imageSize);
				$(window).resize();
				return imageSize;
			})
			.then(function(imageSize) {
				me.syncLayerpanelThumbnail();
				return imageSize;
			})
			.then(function(imageSize) {
				me.empty = false;
				NHIE.app.fireEvent('changecontent');
				//me.select();
				return imageSize;
			})
			.catch(function(e) {
				console.error(e);
			});
		},
		setCanvasContent: function(opt) {
			var canvas = this.getCanvasElement();
			var data = {};
			if(opt.style) {
				canvas.width = opt.style.width;
				canvas.height = opt.style.height;
			}
			var ctx = canvas.getContext('2d');
			if(opt.canvas) {
				var canvas_new = opt.canvas;
				var ctx_new = canvas_new.getContext('2d');
				data = ctx_new.getImageData(0, 0, canvas_new.width, canvas_new.height);
			} else if (opt.data) {
				data = opt.data;
			}

			var prepareContext = function(canvas, reverse) {
				var factor = !!reverse ? 1:-1;
				var canvasModifyData = NHIE.lib.util.canvasManager.getCanvasModifyData(canvas);

				console.log('--- prepare context: ', factor)
				console.log('--- prepare context: ', canvasModifyData.flip)
				console.log('--- prepare context: ', canvasModifyData.rotate)
				var context = canvas.getContext('2d');
				context.save();
				var scale = {
					x: canvasModifyData.flip.h ? -1 * factor : 1 * factor,
					y: canvasModifyData.flip.v ? -1 * factor: 1 * factor
				};
				context.scale(scale.x, scale.y);
				context.translate(canvas.width / 2 * scale.x, canvas.height / 2 * scale.y);

				context.rotate(canvasModifyData.rotate / 180 * Math.PI * (scale.x * scale.y) * factor);
				return context;
			};
			//ctx = prepareContext(canvas, true);

			ctx.putImageData(data, 0, 0);
			this.empty = false;

			this.setCanvasStyle(opt.style);
			$(window).resize();
			if(!opt.skipCache) {
				NHIE.util.canvasCache.set(canvas);
			}
		},
		selected: false,
		show: function() {
			this.hidden = false;
			this.$canvasWrapper.show();
			NHIE.app.fireEvent('changecontent');
		},
		hide: function() {
			this.hidden = true;
			this.$canvasWrapper.hide();
			NHIE.app.fireEvent('changecontent');
		},

		select: function() {
			console.log('  -- select layer! ', this.id);
			NHIE.workspace.unselectLayers();

			this.tracker.show();
			NHIE.layerPanel.select(this.id);
			this.selected = true;

			this.restore_state = this.getCurrentState();
			NHIE.toolbar.resetButtonStatus();

			NHIE.app.fireEvent('changeproperty', this.style);
		},
		unselect: function() {
			if(this.selected) {
				console.log('  -- unselect layer! ', this.id);
				if(this.modified) {
					this.rasterize();
				}
				this.tracker.hide();
				this.selected = false;
			}
		},
		syncTrackerSize: function() {
			this.tracker.syncSize();
		},
		resizeCanvas: function(w, h) {
			this.$canvasWrapper.css({
				width: w,
				height: h
			});
			this.$canvas.css({
				width: w,
				height: h,
				marginLeft: -w / 2,
				marginTop: -h /2
			});
			this.style.width = w;
			this.style.height = h;

			//this.syncTrackerSize();
		},
		moveCanvas: function(x, y) {
			this.$canvasWrapper.css({
				left: x,
				top: y
			});

			this.style.left = x;
			this.style.top = y;

			//this.syncTrackerSize();
		},
		rotateCanvas: function(deg) {
			deg = parseInt(deg) || 0;
			this.style.rotation = deg;

			this.$canvas.css('transform','rotate('+deg+'deg)');
			this.$canvasWrapper.attr('data-transform-rotation',deg);

			//this.syncTrackerSize();
		},
		modifyCanvas: function(mode, value, skipEvent) {
			console.log('modifyCanvas - ', mode, value)
			var canvas = this.getCanvasElement();
			if (mode === 'rotate') {
				value = value || '0';
				value = parseInt(value);
				this.$canvasWrapper.attr('data-modify-rotate', value);

			} else if (mode === 'flip') {
				value = value || {h:false, v:false};
				this.$canvasWrapper.attr('data-modify-flip', JSON.stringify(value));
			}

			NHIE.util.canvasManager.resetImageData(canvas);
			this.restore_state = this.getCurrentState();
			if(!skipEvent) {
				NHIE.app.fireEvent('changecontent');
			}
		},
		getModifyInformation: function(mode) {
			var attrName = 'data-modify-' + mode;
			return this.$canvasWrapper.attr(attrName);
		},

		setCanvasStyle: function(style) {
			var _style = _.clone(this.style);
			_style = _.extend(_style, style);

			//console.log('setCanvasStyle : ', _style)
			this.moveCanvas(_style.left, _style.top);
			this.resizeCanvas(_style.width, _style.height);
			this.rotateCanvas(_style.rotation);

			this.style = _style;

			this.syncTrackerSize();
		},
		setStyle: function(style) {
			this.setCanvasStyle(style);
		},
		getStyle: function() {
			return _.clone(this.style);
		},
		cropCanvasByContent: function() {
			var canvas = this.getCanvasElement();
			var ctx = canvas.getContext('2d');
			var w = canvas.width,
			h = canvas.height,
			pix = {x:[], y:[]},
			imageData = ctx.getImageData(0,0,canvas.width,canvas.height),
			x, y, index;

			for (y = 0; y < h; y++) {
				for (x = 0; x < w; x++) {
					index = (y * w + x) * 4;
					if (imageData.data[index+3] > 0) {
						pix.x.push(x);
						pix.y.push(y);
					}
				}
			}

			pix.x.sort(function(a,b){return a-b});
			pix.y.sort(function(a,b){return a-b});
			var n = pix.x.length-1;

			w = pix.x[n] - pix.x[0];
			h = pix.y[n] - pix.y[0];
			var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

			canvas.width = w;
			canvas.height = h;
			ctx.putImageData(cut, 0, 0);
		},
		/**
		 * canvas 에 rendering 된 상태를 실제 사이즈 및 회전 등을 고려하여 재설정.
		 * 회전 및 리사이즈가 적용된 상태에서 재설정되므로, 결과물은
		 * 회전각 0 , 사이즈와 실제 pixel 이 1:1 로 매핑되고,
		 * 이 작업의 결과 내용은 캐시 처리 되어 각 작업에 재활용됨.
		 */
		rasterize: function(cfg) {

			console.log('RASTERIZE LAYER!!!')
			var $canvas = this.$canvas;
			var canvas =this.getCanvasElement();
			var rotatedRect = canvas.getBoundingClientRect();
			var orgStyle = this.getStyle();
			var me = this;
			cfg = cfg|| {};
			skipHistoryEvent = !!cfg.skipHistoryEvent;

			var loadImage = NHIE.lib.util.getImage;
			// 사이즈가 조정된 경우의 처리
			//canvas.getContext('2d').drawImage(_img, 0, 0, orgStyle.width, orgStyle.height)
			var promise = loadImage(canvas.toDataURL());
			promise = promise.then(function(_img) {
				canvas.width = orgStyle.width;
				canvas.height = orgStyle.height;

				canvas.getContext('2d').drawImage(_img, 0, 0, canvas.width, canvas.height)
			}).then(function() {
				// 회전이 적용된 canvas 에 대한 처리
				var rotation = me.style.rotation || 0;

				if(rotation) {
					var $_temp_canvas = $('<canvas></canvas>');
					var _temp_canvas = $_temp_canvas.get(0);

					_temp_canvas.width = rotatedRect.width;
					_temp_canvas.height = rotatedRect.height;

					var _temp_ctx = _temp_canvas.getContext('2d');
					_temp_ctx.clearRect(0, 0, rotatedRect.width, rotatedRect.height);

					return loadImage(canvas.toDataURL()).then(function(_img) {
						var w = rotatedRect.width;
						var h = rotatedRect.height;
						var o_w = orgStyle.width;
						var o_h = orgStyle.height;

						_temp_ctx.translate(w / 2, h / 2);
						_temp_ctx.rotate(Math.PI / 180 * rotation);
						_temp_ctx.drawImage(_img, -o_w / 2, -o_h / 2, o_w, o_h);

						var resultImageData = _temp_ctx.getImageData(0, 0, w, h);
						canvas.width = rotatedRect.width;
						canvas.height = rotatedRect.height;

						var ctx = canvas.getContext('2d');
						ctx.putImageData(resultImageData, 0, 0);

						// 회전후 발생 가능성이 있는 공백 영역 제거
						NHIE.lib.util.canvasManager.cropCanvas(me.getCanvasElement());

						w = me.getCanvasElement().width;
						h = me.getCanvasElement().height;

						var offset_left = (orgStyle.width - w) / 2;
						var offset_top  = (orgStyle.height - h) / 2;

						me.moveCanvas(orgStyle.left + offset_left, orgStyle.top +  offset_top);
						me.resizeCanvas(w, h);

						$_temp_canvas.remove();
						me.rotateCanvas(0);
					});
				}
			}).then(function() {

				if(me.modified) {
					// cache 에 세팅, 회전 / filp 정보는 초기화 함.
					NHIE.util.canvasCache.set(me.getCanvasElement());
					$(me.getCanvasElement()).parent()
					.attr('data-modify-rotate','')
					.attr('data-modify-flip','')
				}
			}).then(function() {
				me.syncTrackerSize();
				me.modified = false;
				if(!skipHistoryEvent) {
					NHIE.app.fireEvent('changecontent');
				}

			}).catch(function(e) {
				console.error(e);
			});


			return promise;
		},
		clearModifyInformation: function() {
			$(this.getCanvasElement()).parent()
			.attr('data-modify-rotate','')
			.attr('data-modify-flip','')
		},
		getCurrentState: function() {
			return {
				style: _.clone(this.style)
			};
		},
		syncLayerpanelThumbnail: function() {
			NHIE.layerPanel.drawThumbnail(this.id);
		},
		getCanvasImageData: function() {
			var canvas = this.getCanvasElement();
			return {
				data: canvas.getContext('2d').getImageData(0,0, canvas.width, canvas.height),
				style: _.clone(this.style)
			}
		}

	});

	return LayerCanvas;
});
