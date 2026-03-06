define([
	'jquery',
	'underscore',
	'app/classes/ui/UIElement',

	'text!resources/tpl/ui/workspace/ui-layer-tracker.tpl.html'
], function($, _, UIElement, _tpl) {
	var Tracker = UIElement.extend({
		classname: 'Tracker',
		renderTo: '.layer-tracker-container',
		template: {
			tpl: _tpl
		},
		showPropertyChange: true,
		min_width : 10,
		min_height: 10,
		enable_dragmove: true,
		info: {},
		ignoreScale: true,
		events: {
			render: function($dom) {
				$dom.addClass('layer-resizer');
				$dom.attr('data-target-layer-id', this.target.id);
				this.syncSize();
				this.initTrackerEvents();
			},
			mousedown_tracker: function(e, opt) {

				var tracker = this;
				var tracker_type = '';
				var TRACKER_MAP = ['lt', 'lm', 'lb', 'ct', 'cb', 'rt', 'rm', 'rb'];
				var $target = $(e.target);

				var type = null;
				if($target.hasClass('tracker-handle')) {
					console.log('--mousedown to resize~')
					// resize , rotate
					if($target.hasClass('tracker-rotation')) {
						tracker_type =  'rotation';
					} else {
						_.each(TRACKER_MAP, function(type) {
							if ($target.hasClass('resize-' + type)) {
								tracker_type = type;
								return false;
							}
						});
					}

					if(tracker_type) {
						var type = tracker_type;
						//tracker.fireEvent('mousedown_tracker', e, tracker_type);
						if(type === 'rotation') {
							NHIE.app.status.action = 'rotate';
							this.fireEvent('startrotate', e);
						} else {
							NHIE.app.status.action = 'resize';
							NHIE.app.status.trackerType = type;
							this.fireEvent('startresize', e, type);
						}
					}
				} else if(
						$target.hasClass('layer-tracker') || 
						(NHIE.lib.useragent.info.IsIE10 && $target.hasClass('tracker-body') && $target.closest('.workspace-cropper').length ) ||
						(opt && opt.forceDragMove===true)
					) {
					console.log('--mousedown to move~')
					// move-layer
					if(this.enable_dragmove) {
						NHIE.app.status.action = 'move';
						this.fireEvent('startmove', e);
					}
				}

			},
			startmove: function(e) {
				var me = this;
				var layerStyle = this.target.getStyle();
				var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;

				var info = {
					mode: 'resize-layer',
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

				if(this.ignoreScale) {
					info.origin.width *= scale;
					info.origin.height *= scale;
					info.origin.left *= scale;
					info.origin.top *= scale;
				}
				this.info = info;

			},
			onmove: function(e) {
				this.target.modified = true;
				var info = this.info;
				var scale = info.scale;
				if(this.ignoreScale) {
					scale = 1;
				}
				var offset = {
					x: (e.clientX - info.origin.clientX) / scale,
					y: (e.clientY - info.origin.clientY) / scale
				};

				var style = {
					left: info.origin.left + offset.x,
					top: info.origin.top + offset.y
				};
				this.modified = true;
				$(this.dom).css(style);

				this.syncSize(true);
				if(this.showPropertyChange) {
					NHIE.app.fireEvent('changeproperty', this.target.style);
				}

			},
			endmove: function(e) {

			},
			startresize: function(e, type) {
				console.log('start resize')
				var me = this;
				var layerStyle = this.target.style;
				var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;

				var info = {
					mode: 'resize-layer',
					origin: {
						clientX: e.clientX,
						clientY: e.clientY,

						width: parseFloat(layerStyle.width),
						height: parseFloat(layerStyle.height),
						left: parseFloat(layerStyle.left),
						top: parseFloat(layerStyle.top),
						rotation: layerStyle.rotation
					}
				};

				if(this.ignoreScale) {
					info.origin.width *= scale;
					info.origin.height *= scale;
					info.origin.left *= scale;
					info.origin.top *= scale;
				}

				this.info = info;

				console.log(info)

			},
			onresize: function(e, trackerType) {
				e.preventDefault();
				this.target.modified = true;

				var w = this.info.origin.width;
				var h = this.info.origin.height;
				var xy = {
					left: this.info.origin.left,
					top: this.info.origin.top,
				};

				var resizeOffset = this.getResizeOffset(trackerType, e);
				//console.log('onresize : ', finalBox);
				$(this.dom).css({
					left: xy.left + resizeOffset.ol + resizeOffset.centerOffset.x,
					top:  xy.top + resizeOffset.ot + resizeOffset.centerOffset.y,
					width: w + resizeOffset.ow,
					height: h + resizeOffset.oh
				});

				this.syncSize(true);
				if(this.showPropertyChange) {
					NHIE.app.fireEvent('changeproperty', this.target.style);
				}
				//NHIE.propertyPanel.showProperty('resize-layer', this.target.style);
			},
			endresize: function(e, type) {

				console.log('endresize : ', e);

				this.info = {};
			},

			startrotate: function(e) {
				console.log('start rotate!!')
				var me = this;
				var layerStyle = this.target.style;
				var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;

				var info = {
					mode: 'rotate_layer',
					origin: {
						clientX: e.clientX,
						clientY: e.clientY,

						width: layerStyle.width,
						height: layerStyle.height,
						left: layerStyle.left,
						top: layerStyle.top,
						rotation: layerStyle.rotation,

						centerX: layerStyle.width / 2 + layerStyle.left,
						centerY: layerStyle.height / 2 + layerStyle.top
					}
				}
				this.info = info;


			},
			onrotate: function(e) {
				e.preventDefault();
				this.target.modified = true;
				var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
				var centerPoint = {
					x: this.info.origin.centerX,
					y: this.info.origin.centerY
				};

				var dragOffset = {
					x: (e.clientX - this.info.origin.clientX) / scale,
					y: (e.clientY - this.info.origin.clientY) / scale
				};

				var orgTrackerPosition = {
					x:centerPoint.x,
					y:centerPoint.y - (this.info.origin.height/2) - 20
				};

				var orgDegree = this.info.origin.rotation;
				orgTrackerPosition = NHIE.lib.util.rotatePoint(
						orgDegree,
						orgTrackerPosition.x,
						orgTrackerPosition.y,
						centerPoint.x,
						centerPoint.y
				);
				var currentTrackerPosition = {
					x:orgTrackerPosition.x + dragOffset.x,
					y:orgTrackerPosition.y + dragOffset.y
				};

				var deg = this.getDegreeOfPointsObj(
					orgTrackerPosition,
					currentTrackerPosition,
					centerPoint
				);

				//console.log(deg)

				var $dom = $(this.dom);

				this.target.setCanvasStyle({
					rotation: orgDegree + deg
				});
				//$dom.css('transform', 'rotate('+deg+'deg)');
				//NHIE.propertyPanel.showProperty('resize-layer', this.target.style);

				if(this.showPropertyChange) {
					NHIE.app.fireEvent('changeproperty', this.target.style);
				}

			},
			endrotate: function(e) {

				console.log('endrotate : ', e);
				this.info = {};
			}
		},
		construct: function(config) {
			this._super(config);
			this.target = config.target;
		},
		initTrackerEvents: function() {

		},
		getResizeOffset: function(trackerType, e) {
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			if(this.ignoreScale) {
				scale = 1;
			}

			var dragOffset = {
				x: (e.clientX - this.info.origin.clientX) / scale,
				y: (e.clientY - this.info.origin.clientY) / scale
			};
			var xy = {
				left: this.info.origin.left,
				top: this.info.origin.top,
			};
			var w = this.info.origin.width;
			var h = this.info.origin.height;

			var ol,ot,ow,oh;
			ol = ot = ow = oh = 0;


			if(/l[t|m|b]/i.test(trackerType)){
				ol = dragOffset.x;
				ow = -dragOffset.x;
			}
			if(/r[t|m|b]/i.test(trackerType)){
				ow = dragOffset.x;
			}
			if(/[l|c|r]t/i.test(trackerType)){
				ot = dragOffset.y;
				oh = -dragOffset.y;
			}
			if(/[l|c|r]b/i.test(trackerType)){
				oh = dragOffset.y;
			}

			var finalBox = {
				left:parseFloat(xy.left + ol),
				top:parseFloat(xy.top  + ot),
				width:parseFloat(w + ow),
				height:parseFloat(h + oh)
			};

			// 리사이즈 범위 설정
			var min_width = this.min_width;
			var min_height = this.min_width;
			if(finalBox.width < min_width){
				ow = min_width - w ;
				finalBox.width = min_width;
				if(/l[t|m|b]/i.test(trackerType)){
					ol = w - min_width ;
				}
			}
			if(finalBox.height < min_height){
				oh = min_height - h;
				finalBox.height = min_height;
				if(/[l|c|r]t/i.test(trackerType)){
					ot =  h - min_height ;
				}
			}

			// 회전 관련 : 중심 이동에 따른 위치 보정 처리
			var centerOffset = {x:0,y:0};
			var rotationDeg = this.info.origin.rotation;
			if(rotationDeg){
				var orgBoxCp = {
					x:xy.left + w / 2,
					y:xy.top + h / 2
				};

				var finalBoxCp = {
					x:finalBox.left + finalBox.width / 2,
					y:finalBox.top + finalBox.height / 2
				};

				var expectedBoxCp =  NHIE.lib.util.rotatePoint(rotationDeg, finalBoxCp.x, finalBoxCp.y, orgBoxCp.x,orgBoxCp.y);
				centerOffset = {
					x:expectedBoxCp.x - finalBoxCp.x,
					y:expectedBoxCp.y - finalBoxCp.y
				};
			}

			return {
				ol: ol,
				ot: ot,
				ow: ow,
				oh: oh,
				centerOffset: centerOffset
			};
		},
		syncSize: function(byTracker) {
			byTracker = !!byTracker;
			var layerStyle = this.target.style;
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			//scale =	1;
			//console.log(layerStyle, scale, this.dom, 'rotate('+layerStyle.rotation+')deg');
			var $dom = $(this.dom);
			if(byTracker) {
				var target = this.target;				
				target.setStyle({
					width: parseFloat($dom.css('width')),
					height: parseFloat($dom.css('height')),
					left: parseFloat($dom.css('left')),
					top: parseFloat($dom.css('top')),
				});
			} else {
				var style = {
					width: scale * layerStyle.width,
					height: scale * layerStyle.height,
					left: scale * layerStyle.left,
					top: scale * layerStyle.top,
					transform: 'rotate('+layerStyle.rotation+'deg)'
				};
				$dom.css(style);
				this.style = style;
			}
		},
		getDegreeOfPoints:function(p1x,p1y,p2x,p2y,cx,cy){
			var x1=p1x-cx,x2=p2x-cx,y1=p1y-cy,y2=p2y-cy;

			var r = Math.asin((x1*y2-y1*x2)/(Math.sqrt(x1*x1+y1*y1)*Math.sqrt(x2*x2+y2*y2)));
			var degree = r/Math.PI*180;
			degree = parseInt(degree);

			if(y2<0){
				degree = 180 - degree;
			}
			if(degree>=360) degree-= 360;
			if(degree<0) degree += 360;
			return degree;
		},
		getDegreeOfPointsObj:function(p1,p2,cp){

			var th1 = this.getDegreeOfPoints(cp.x,cp.y-1,p1.x,p1.y,cp.x,cp.y);
			var th2 = this.getDegreeOfPoints(cp.x,cp.y-1,p2.x,p2.y,cp.x,cp.y);

			var result = th1 - th2;
			if(result >=360) result -= 360;
			if(result<0) result += 360;

			return result;

			//return this.getDegreeOfPoints(p1.x,p1.y,p2.x,p2.y,cp.x,cp.y);
		},
		rotatePoint:function(d,x,y,ox,oy){
			var __d2p = function(d){
				return d/180*Math.PI;
			};
			ox=ox||0;oy=oy||0;
			return{
				x:(ox+(x-ox)*Math.cos(__d2p(d))-(y-oy)*Math.sin(__d2p(d))),
				y:(oy+(y-oy)*Math.cos(__d2p(d))+(x-ox)*Math.sin(__d2p(d)))
			};
		},
		getStyle: function() {
			var $dom = $(this.dom);
			return {
				left: $dom.css('left'),
				top: $dom.css('top'),
				width: $dom.css('width'),
				height: $dom.css('height')
			}
		},
		show: function() {
			$(this.dom).removeClass('hidden visible').addClass('visible');
		},
		hide: function() {
			$(this.dom).removeClass('hidden visible').addClass('hidden');
		},
		remove: function() {
			$(this.dom).remove();
		}
	});

	return Tracker;
});
