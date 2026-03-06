define([
	'jquery',
	'underscore',
	'app/classes/Observable',
	'app/classes/ui/workspace/Tracker',


],function($, _, Observable, Tracker) {
	var UIComponent = Observable.extend({
		classname: 'UIComponent',
		construct: function(config) {
			this._super(config);
			var style = config.style || {};
			style = _.clone(style);
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			_.each(['left', 'top', 'width', 'height'], function(attr) {
				typeof style[attr] !== 'undefined' && (style[attr] *= scale);
			});

			var $component;

			$component = $('<div class="component"></div>');
			$component.addClass(this.type || '');
			if(this.getComponentMarkup()) {
				$component.append(this.getComponentMarkup());
			}

			this.$component = $component;

			$('.layer-foreground.layer-container.clipping-area .component-container').append($component);

			var tracker = new Tracker({
				id: 'component-resizer_'+this.id,
				min_width: this.min_width || 10,
				min_height: this.min_height || 10,
				showPropertyChange: false,
				target: this
			});
			this.tracker = tracker;
			tracker.render().then(function($dom) {
				$dom.addClass('component-tracker');
				return $dom;
			}).then(this.afterRenderTracker.bind(this));

			if(style) {

				$component.css(style);
				var $wrapper = $component.parent().parent();
				_.extend(style, {
					left: $wrapper.width() / 2 - $component.width() / 2,
					top: $wrapper.height() / 2 - $component.height() / 2
				});
				this.setStyle(style);

			}

		},
		afterRenderTracker: function($trackerDom) {
			console.log('afterRenderTracker~~')
		},
		getStyle: function() {
			return _.clone(this.style);
		},
		setStyle: function(style) {
			//console.log('====component setStyle org : ', style)
			var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
			_.each(['left', 'top', 'width', 'height'], function(attr) {
				typeof style[attr] !== 'undefined' && (style[attr] /= scale);
			});

			var _style = _.clone(this.style);
			_style = _.extend(_style, style);

			this.style = {
				left: _style.left,
				top: _style.top,
				width: _style.width,
				height: _style.height
			};
			//console.log('=====component setStyle ', this.style)
			this.$component.css({
				left: _style.left * scale,
				top: _style.top * scale,
				width: _style.width  * scale,
				height: _style.height * scale,
			});
			this.$component.css(_style);

			this.tracker.syncSize();

		},
		getComponentMarkup: function() {

		},

		apply: function() {

		},
		/*
		toCanvas: function() {
			var $el = this.$component;
			if($el && $el.length) {

				return html2canvas($el.get(0), {
					// width: 1600,
					// height: 1600
				}).then(function(canvas) {

					return canvas;
				});
			}
		},
		*/
		restore: function() {

		},
		remove: function() {
			this.$component.remove();
			this.tracker.remove();
		}

	});

	return UIComponent;
});
