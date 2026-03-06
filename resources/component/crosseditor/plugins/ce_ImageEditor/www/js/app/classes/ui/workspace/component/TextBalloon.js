define([
	'jquery',
	'underscore',
	'app/classes/ui/workspace/component/UIComponent'
], function($, _, UIComponent) {

	var TextBalloon = UIComponent.extend({
		classname: 'TextBalloon',
		min_width: 40,
		min_height: 40,
		getComponentMarkup: function() {
			var style = this.style;
			var w = this.style.width;
			var h = this.style.height;

			var markup = '';
			markup += '<div style="position:absolute;width:100%;height:100%;">';
			markup += '<img style="position:absolute;width:100%;height:100%;" src="'+this.src+'">';

			markup += '</div>';

			return markup;
		},
		afterRenderTracker: function($trackerDom) {
			var style = this.initConfig.style;
			var w = style.width;
			var h = style.height;
			var markup = '';
			markup += '<div contentEditable="true" class="tracker-content text-editing-area" style="pointer-events:all;position:absolute;';
			markup += 'left:'+(this.textPos.x / w * 100) + '%;'
			markup += 'top:'+(this.textPos.y / h * 100) + '%;'
			markup += 'width:'+(this.textPos.width / w * 100) + '%;'
			markup += 'height:'+(this.textPos.height / h * 100) + '%;'
			markup += '"></div>';

			var $textEditingArea = $(markup);
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			$textEditingArea.css('zoom', scale);

			$trackerDom.append($textEditingArea);

			if(this.content) {
				var tool = NHIE.app.getCurrentTool();
				var textStyle = tool.getTextAttributes();
				tool.setTextAttrOnEl($textEditingArea, textStyle);
				$textEditingArea.html(this.content);
			}

			this.$textEditingArea = $textEditingArea;
			$textEditingArea.focus();

		},
		toCanvas: function() {
			var $component = this.$component;
			var textPos = this.textPos;
			var component = this;
			var initial_style = component.initConfig.style;

			var x = textPos.x / initial_style.width * $component.width();
			var y = textPos.y / initial_style.height * $component.height();
			var w = textPos.width / initial_style.width * $component.width();
			var h = textPos.height / initial_style.height * $component.height();

			return NHIE.lib.util.getImage(this.src).then(function(img) {
				// 말풍선 이미지 먼저 canvas 에 채움.
				var $img_canvas = $('<canvas></canvas>');
				var img_canvas = $img_canvas.get(0);
				var temp_ctx = img_canvas.getContext('2d');

				img_canvas.width = $component.width();
				img_canvas.height = $component.height();

				temp_ctx.drawImage(img, 0,0, img_canvas.width, img_canvas.height);

				return img_canvas;

			}).then(function(img_canvas) {

				var textTool = NHIE.app.getCurrentTool();
				var text_canvas = textTool.renderTextComponentOnCanvas(component,x,y,w,h);
				var ctx = text_canvas.getContext('2d');

				// canvas 를 clipping 함.
				ctx.clearRect(0,0,text_canvas.width,y);
				ctx.clearRect(0,y+h,text_canvas.width,text_canvas.height);
				ctx.clearRect(0,y,x,y+h);
				ctx.clearRect(x+w, y,text_canvas.width,text_canvas.height)

				return [img_canvas, text_canvas];

			}).then(function(canvas_arr) {
				var img_canvas = canvas_arr[0];
				var text_canvas = canvas_arr[1];

				// 말풍선 이미지를 먼저 그려준 후 텍스트 canvas 를 덮어씌워줌
				var $temp_canvas = $('<canvas></canvas>');
				var temp_canvas = $temp_canvas.get(0);
				var temp_ctx = temp_canvas.getContext('2d');

				temp_canvas.width = $component.width();
				temp_canvas.height = $component.height();

				temp_ctx.drawImage(img_canvas, 0,0, temp_canvas.width, temp_canvas.height);
				temp_ctx.drawImage(text_canvas, 0,0, temp_canvas.width, temp_canvas.height);

				return temp_canvas;
			});
		}
	});

	return TextBalloon;
});
