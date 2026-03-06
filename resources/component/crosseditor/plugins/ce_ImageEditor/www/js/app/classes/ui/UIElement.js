define([
	'jquery',
	'underscore',
	'app/lib/promise',
	'app/classes/Observable'
], function($, _, _Promise, Observable) {
	//
	var _uid = 0;

	var UIElement = Observable.extend({
		classname: 'UIElement',
		defaultConfig: {
			renderTo: 'body',
			template: {
				cls: 'ui-element',
				tpl: ''
			}
		},
		events: {
			render: function() {
				//console.log('UIElement:render - ',this.id);
			}
		},
		construct: function(config) {
			config = config || {};
			config.renderTo = config.renderTo ||
				this.renderTo ||
				this.defaultConfig.renderTo;


			var defaultConfig = JSON.parse(JSON.stringify(this.getAllProps('defaultConfig') || {}));
			config = _.extend_deeper(defaultConfig, config);
			var template = this.template || {};
			template = _.extend_deeper(defaultConfig.template , template);
			template = _.extend_deeper(template , config.template);
			config.template = template;

			var idPrefix = 'ui-elements-';

			if (!config.id && !this.id) {
				var _id = 0;
				_id = _uid++; // 테스트용
				while (document.getElementById(idPrefix + (++_id))) {};
				config.id = idPrefix + (++_id);
			}
			/*
			// 이벤트 정의
			config.events = config.events || {};
			var events = _.defaults(config.events, this.events);
			this.events = events;
			*/
			this.rendered = false;
			var clearWrapper = !!config.clearWrapper;
			if (clearWrapper) {
				$(config.renderTo).html('');
			}
			this._super(config);
			this.fireEvent('construct', this);
			//console.log('UIElement constructed : ', this.id, this);
		},
		init: function(config) {
			this._super(config);
			var dom = document.getElementById(this.id);
			if (dom) {
				//console.log(' skip render - ')
				this.dom = dom;
				this.rendered = true;
			} else {
				//console.log(' do render ', this.container)
				this.rendered = false;
				if (this.container) {
					this.render();
				}
			}
		},
		getDom: function() {
			return this.dom;
		},

		getBody: function() {
			var $dom = $(this.dom);
			var $body = $(this.dom).find('>.' + this.template.bodyCls);
			if ($body.length == 1) {
				return $body.get(0);
			} else {
				return $dom.get(0);
			}
		},
		setContent: function(html) {
			var config = this.initConfig;
			var $renderTarget = config.renderTo;
			if (typeof $renderTarget === 'string') {
				$renderTarget = $($renderTarget);
			} else if ($renderTarget instanceof UIElement) {
				$renderTarget = $(renderTarget.getBody());
			}

			if ($renderTarget.length) {
				var el = html;
				if (typeof el === 'string') {
					el = $(html).get(0);
				}
				el.id = this.id;
				$renderTarget.get(0).appendChild(el);
				this.dom = el;
			}
		},
		getTemplateConfig: function() {
			return this.initConfig.template;
		},

		render: function(config) {
			//console.log('do render UIElement! ', this.id)
			config = config || this.initConfig;

			if (this.rendered && this.dom) {
				this.fireEvent('render', $(this.com));//
				return _Promise.resolve($(this.com));
			} else {
				if (!this.dom) {
					this.rendered = false;
				}
				return new _Promise(function(resolve, reject) {
					if (!this.rendered) {
						this.setContent(config.template.tpl);
						this.rendered = true;
						var $dom = $(this.dom);

						// _.each(['width', 'height', 'left', 'top'], function(prop) {
						// 	console.log(prop, config[prop])
						// 	if (typeof config[prop] !== undefined) {
						// 		$dom.css(prop, config[prop]);
						// 	}
						// });

						this.fireEvent('render', $dom);
						resolve($dom);
					} else {
						//
						this.fireEvent('render', $dom);//
					}
				}.bind(this));
			}
		},
		setApplication: function(app) {
			this._app = app;
		},
		getApplication: function() {
			return this._app;
		},
		destroy: function() {
			$(this.dom).remove();
			this.dom = null;
		}
	});

	return UIElement;
});
