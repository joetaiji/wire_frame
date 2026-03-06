define([
	'jquery',
	'underscore',
	'app/classes/ui/workspace/component/UIComponent'
], function($, _, UIComponent) {

	var TextBox = UIComponent.extend({
		classname: 'TextBox',
		min_width: 40,
		min_height: 40,
		getComponentMarkup: function() {
			var style = this.style;
			var w = this.style.width;
			var h = this.style.height;

			var markup = '';
			markup += '<div style="position:absolute;width:100%;height:100%;" class="dummy">';
			markup += '</div>';

			return markup;
		},
		afterRenderTracker: function($trackerDom) {
			var style = this.initConfig.style;
			var w = style.width;
			var h = style.height;
			var markup = '';
			markup += '<div contentEditable="true" class="tracker-content text-editing-area" style="pointer-events:all;position:absolute;';
			markup += 'left:0;'
			markup += 'top:0;'
			markup += 'width:100%;'
			markup += 'height:100%';
			markup += '"></div>';

			var $textEditingArea = $(markup);
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			$textEditingArea.css('zoom', scale);

			$trackerDom.append($textEditingArea);
			this.$textEditingArea = $textEditingArea;

			//$textEditingArea.on('keyup')
			$textEditingArea.focus();
		},

		toCanvas: function() {
			var $component = this.$component;
			var component = this;

			return NHIE.lib.Promise.resolve().then(function() {
				var textTool = NHIE.app.getCurrentTool();
				return textTool.renderTextComponentOnCanvas(component,0,0,$component.width(), $component.height());
			});
		}
	});

	return TextBox;
});
