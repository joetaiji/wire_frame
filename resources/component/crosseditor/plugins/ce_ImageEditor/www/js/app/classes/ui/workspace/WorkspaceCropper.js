define([
	'jquery',
	'underscore',
	'app/classes/ui/workspace/Tracker',
  'app/classes/ui/UIElement',
	'text!resources/tpl/ui/workspace/ui-layer-tracker.tpl.html'
], function($, _, Tracker,UIElement, _tpl) {

  var DummyCropperTarget = UIElement.extend({
    id: 'nhie-dummy-cropper-target',
    classname: 'DummyCropperTarget',
    renderTo: '.layer-tracker-container',
    template: {
			tpl: '<div class="cropper-dummy"></div>'
    },
    events: {
      render: function() {
				this.$dom = $(this.dom);
				this.style = {};
      }
    },
    getStyle: function() {
			return _.clone(this.style);
		},
		setStyle: function(style) {
			// console.log('====component setStyle org : ', style)
			style = style || {};
			style = _.clone(style);
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			_.each(['left', 'top', 'width', 'height', 'marginLeft', 'marginTop'], function(attr) {
				typeof style[attr] !== 'undefined' && (style[attr] /= scale);
			});

			var _style = _.clone(this.style);
			_style = _.extend(_style, style);

			this.style = {
				left: _style.left,
				top: _style.top,
				width: _style.width,
				height: _style.height,
				marginLeft: _style.marginLeft || 0,
				marginTop: _style.marginTop || 0
			};

			//console.log('=====component setStyle ', this.style)
			this.$dom.css({
				left: _style.left * scale,
				top: _style.top * scale,
				width: _style.width  * scale,
				height: _style.height * scale,
				marginLeft: (_style.marginLeft || 0) * scale,
				marginTop: (_style.marginTop || 0) * scale
			});
		},
		getSize: function() {

		}
  });

	var WorkspaceCropper = Tracker.extend({
    classname: 'WorkspaceCropper',
    enable_dragmove: true,
    ignoreScale: true,
		events: {
			render: function($dom) {
				$dom.addClass('workspace-cropper border-animation');
				this.syncSize();
        this.initTrackerEvents();
        
        this.target = new DummyCropperTarget();
        this.target.render();
			}
		},
		
		syncSize: function(byTracker) {
			byTracker = !!byTracker;
			var dummyStyle = this.target.style;
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;

			var $dom = $(this.dom);
			if(byTracker) {
				var dummy = this.target;
				dummy.setStyle({
					width: parseFloat($dom.css('width')),
					height: parseFloat($dom.css('height')),
					left: parseFloat($dom.css('left')),
					top: parseFloat($dom.css('top')),
				});

			} else {
				$dom.css({
					width: scale * dummyStyle.width,
					height: scale * dummyStyle.height,
					marginLeft: scale * dummyStyle.width / -2,
					marginTop: scale * dummyStyle.height / -2,
					left: '50%',
					top: '50%'

				});
			}
		},
		resetCropper: function(preserveSize) {
			// console.warn('-----------------reset cropper!!------------------', preserveSize)
			var cropperSize = this.getDefaultCropperSize();
			var workspace_size = NHIE.workspace.getSize();

			// cropper 트래커 크기를 workspace 크기와 동기 처리
			// -> target 스타일을 초기화하여 기본 크기로 변경해 줌.
			this.target.style = {};
			if(preserveSize) {
				// cropper 크기를 리셋할 때, 작업영역 크기와 동기화.
				if(preserveSize === true) {
					cropperSize = workspace_size;
					this.target.style = {
						width: workspace_size.width,
						height: workspace_size.height,
						left: workspace_size.width / 2,
						top: workspace_size.height / 2,
						marginLeft: workspace_size.width / -2,
						marginTop: workspace_size.height / -2
					}
				} else {
					// cropper 크기를 리셋할 때, 지정된 크기로 맞춰 줌.
					this.target.style = preserveSize;
				}
			}
			NHIE.workspace.syncCropperSize();
			
			// 속성패널 값을 0으로 맞춰 줌

			// console.log(cropperSize, workspace_size)

			var tool = NHIE.toolbar.tools['crop-workspace'];
			tool.setPropertyValues({
				width: cropperSize.width,
				height: cropperSize.height,
				left: workspace_size.width - cropperSize.width / 2,
				top: workspace_size.height - cropperSize.height / 2
			}, true);
			this.markCurrentCropperStatus();

		},
		markCurrentCropperStatus: function() {
			var $workspace_cropper = NHIE.workspace.$getCropper();
			var cropper_size = this.target.getStyle();
			_.each(['left','top','width','height'], function(name) {
				$workspace_cropper.attr('data-org-'+name, cropper_size[name]);
			});
			NHIE.workspace.restore_state_crop = cropper_size;
		},
		clearCropperStatus: function() {
			var $workspace_cropper = NHIE.workspace.$getCropper();
			_.each(['left','top','width','height'], function(name) {
				$workspace_cropper.attr('data-org-'+name, '');
			});
			NHIE.workspace.restore_state_crop = null;
		},
		getDefaultCropperSize: function() {
			var config = NHIE.config.cropWorkspace;
			var workspace_size = NHIE.workspace.getSize();
			var defaultCropperSize = {
				width: config.defaultWidth || workspace_size.width,
				height: config.defaultHeight || workspace_size.height
			};

			if(typeof defaultCropperSize.width !== 'number') {
				defaultCropperSize.width = workspace_size.width;
			}
			if(typeof defaultCropperSize.height !== 'number') {
				defaultCropperSize.height = workspace_size.height;
			}

			return defaultCropperSize;
		}
	});

	return WorkspaceCropper;
});
