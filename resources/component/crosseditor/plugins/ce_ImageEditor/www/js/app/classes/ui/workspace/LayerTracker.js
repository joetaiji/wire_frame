define([
	'jquery',
	'underscore',
	'app/classes/ui/workspace/Tracker'
], function($, _, Tracker) {
	var LayerTracker = Tracker.extend({
		classname: 'LayerTracker',
		renderTo: '.layer-tracker-container',
		enable_dragmove: false,
		ignoreScale: false,
		events: {
			render: function($dom) {
				$dom.addClass('layer-resizer');
				$dom.attr('data-target-layer-id', this.target.id);
				this.syncSize();
				this.initTrackerEvents();
			}
		},
		syncSize: function(byTracker) {
			byTracker = !!byTracker;
			var layerStyle = this.target.style;
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;

			//console.log(layerStyle, scale, this.dom, 'rotate('+layerStyle.rotation+')deg');
			var $dom = $(this.dom);
			if(byTracker) {
				var layer = this.target;
				layer.setStyle({
					width: parseFloat($dom.css('width')),
					height: parseFloat($dom.css('height')),
					left: parseFloat($dom.css('left')),
					top: parseFloat($dom.css('top')),
				});
			} else {
				$dom.css({
					width: scale * layerStyle.width,
					height: scale * layerStyle.height,
					left: scale * layerStyle.left,
					top: scale * layerStyle.top,
					transform: 'rotate('+layerStyle.rotation+'deg)'
				});
			}
		}
	});

	return LayerTracker;
});
