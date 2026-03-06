define([
	'jquery',
	'underscore',
	'app/classes/ui/workspace/LayerTracker',

	'text!resources/tpl/ui/workspace/ui-layer-tracker.tpl.html'
], function($, _, LayerTracker, _tpl) {
	var WorkspaceResizer = LayerTracker.extend({
		classname: 'WorkspaceResizer',
		events: {
			render: function($dom) {
				$dom.addClass('workspace-resizer border-animation');
				this.syncSize();
				this.initTrackerEvents();
			},

			onresize: function(e, trackerType) {
				e.preventDefault();
				this.target.modified = true;

				var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
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
					width:parseFloat(w + 2*ow),
					height:parseFloat(h + 2*oh)
				};

				// 리사이즈 범위 설정
				var min_width = 50 , max_width = 1600 ;
				var min_height = 50 , max_height = 1600 ;
				if(finalBox.width < min_width) {
					ow = (min_width - w) /2 ;
					finalBox.width = min_width;
				}
				if(finalBox.height < min_height) {
					oh = (min_height - h)/2;
					finalBox.height = min_height;
				}
				if(finalBox.width > max_width) {
					ow = (max_width - w) / 2 ;
					finalBox.width = max_width;
				}
				if(finalBox.height > max_height) {
					oh = (max_height - w) / 2 ;
					finalBox.height = max_height;
				}

				$(this.dom).css({
					left: '50%',
					top:  '50%',
					width: w + 2*ow,
					height: h + 2*oh,
					marginLeft: -(w+2*ow)/2,
					marginTop:  -(h+2*oh)/2
				});
				this.syncSize(true);
				NHIE.app.fireEvent('changeproperty', this.target.getSize());
			}
		},
		
		syncSize: function(byTracker) {
			byTracker = !!byTracker;
			var layerStyle = this.target.style;
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;

			var $dom = $(this.dom);
			if(byTracker) {
				var target = this.target;
				var resultSize = {
					width: parseFloat($dom.css('width')),
					height: parseFloat($dom.css('height'))
				};
				target.setStyle({
					width: resultSize.width,
					height: resultSize.height
				});
				var orgSize = {
					width: parseFloat($(this.dom).attr('data-org-width')),
					height: parseFloat($(this.dom).attr('data-org-height'))
				};
				var scale_workspace = {
					x: resultSize.width / orgSize.width ,
					y: resultSize.height / orgSize.height
				}

				$('.workspace .layer-container.layer-workspace .layer-wrapper').css({
					transform: 'scale(' + scale_workspace.x+','+ scale_workspace.y+')'
				}).attr({
					'data-scale-x':scale_workspace.x,
					'data-scale-y':scale_workspace.y
				});


			} else {
				$dom.css({
					width: scale * layerStyle.width,
					height: scale * layerStyle.height,
					marginLeft: scale * layerStyle.width / -2,
					marginTop: scale * layerStyle.height / -2,
					left: '50%',
					top: '50%'

				});
			}
		},
		resetScale: function() {
			var workspace_size = this.target.getSize();
			$(this.dom).attr({
				'data-org-width':workspace_size.width,
				'data-org-height':workspace_size.height,
			});
			$('.workspace .layer-container.layer-workspace .layer-wrapper').css({
				transform: 'scale(1, 1)'
			}).attr({
				'data-scale-x':1,
				'data-scale-y':1
			});
		}
	});

	return WorkspaceResizer;
});
