define([
	'jquery',
	'underscore',
	'app/classes/ui/workspace/component/UIComponent'
], function($, _, UIComponent) {

	var Sticker = UIComponent.extend({
		classname: 'Sticker',
		getComponentMarkup: function() {
			return '<img style="position:absolute;width:100%;height:100%;" src="'+this.src+'">';
		},
		toCanvas: function() {
			var $component = this.$component;
			return NHIE.lib.util.getImage(this.src).then(function(img) {
				var $temp_canvas = $('<canvas></canvas>');
				var temp_canvas = $temp_canvas.get(0);
				var temp_ctx = temp_canvas.getContext('2d');

				temp_canvas.width = $component.width();
				temp_canvas.height = $component.height();

				temp_ctx.drawImage(img, 0,0, temp_canvas.width, temp_canvas.height);

				return temp_canvas;

			});
		}
	});

	return Sticker;
});
