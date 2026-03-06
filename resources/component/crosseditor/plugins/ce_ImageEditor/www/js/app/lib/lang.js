define([
	'jquery',
	'underscore',
	'app/lib/cache',
	'app/lib/promise'
], function($, _, _cache, CPS_Promise) {

	var ATTR_LANGUAGE_CODE = 'cps-lang';
	var ATTR_LANGUAGE_ORG  = 'cps-lang-org';
	var ATTR_LANGUAGE_TYPE = 'cps-lang-type';
	var ATTR_DATA_PREFIX   = 'data-';

	var LanguageManager = function() {
		// do nothing
	};
	LanguageManager.prototype = {
		__language_data__: {},
		defaultLang: 'ko',
		currentLang: 'ko',
		load: function(url) {

		},

		reset: function(langCode) {
			var me = this;
			langCode = langCode || this.currentLang;
			// me.init({
			// 	langCode: langCode
			// }, function() {
			// 	me.apply();
			// });
			me.init({
				langCode: langCode
			}).then(function() {
				me.apply();
			});
		},
		apply: function(selector) {
			selector = selector || '';
			var me = this;
			var fn = (function(selector) {
				return function() {
					$(selector + ' [' + ATTR_DATA_PREFIX + ATTR_LANGUAGE_CODE + ']').css('visibility', 'hidden');
					$(selector + ' [' + ATTR_DATA_PREFIX + ATTR_LANGUAGE_CODE + ']').each(function(i, el) {
						var $item = $(this);
						if (!$item.data(ATTR_LANGUAGE_ORG)) {
							var orgData = $item.text();
							if (el.nodeName == 'INPUT') {
								if (el.type == 'button') {
									orgData = $item.attr('value');
								}
							}
							$item.data(ATTR_LANGUAGE_ORG, orgData);
						}

						var code = $item.data(ATTR_LANGUAGE_CODE);
						var text = me.get(code);
						if (typeof text !== 'string') {
							text = '';
						}
						text = text || $item.data(ATTR_LANGUAGE_ORG);
						var applyType = $item.data(ATTR_LANGUAGE_TYPE) || 'text';
						var applyTypeArr = applyType.split(',');
						if (text) {

							_.each(applyTypeArr, function(type) {
								if (typeof me.applyTypeDefinitions[type] === 'function') {
									me.applyTypeDefinitions[type]($item, text);
								}
							});
							/*
							if (el.nodeName == 'INPUT') {
								if (el.type == 'button') {
									$item.attr('value', text);
									$item.attr('title', text);
								}
							} else {
								$item.text(text);
								$item.attr('title', text);
							}*/
						}
					});

					$(selector + ' [' + ATTR_DATA_PREFIX + ATTR_LANGUAGE_CODE + ']').css('visibility', 'visible');
				};

			})(selector);

			setTimeout(function() {fn();}, 0);
		},
		applyTypeDefinitions: {
			'text': function($el, text) {
				return $el.text(text);
			},
			'title': function($el, text) {
				return $el.attr('title', text);
			},
			'alt': function($el, text) {
				return $el.attr('alt', text);
			}
		},
		init: function(opt, callback) {
			$('style[data-cps-style-lang]').remove();
			var $style = $('<style type="text/css" data-cps-style-lang="true"></style>');
			$('head').append($style);

			opt = opt || {};
			var langCode = opt.langCode || this.defaultLang;
			this.currentLang = langCode;
			var me = this;

			$(' [data-' + ATTR_LANGUAGE_CODE + ']').css('visibility', 'hidden');
			if (!me.__language_data__[langCode]) {
				var pr = NHIE.lib.requirePromise(['resources/lang/lang-' + langCode + '.js']);
				pr.then(function() {
					return NHIE.lib.requirePromise(['text!resources/lang/css/style-' + langCode + '.css']);
				}).then(function(arr) {
					var css = arr[0];
					$style.get(0).textContent = css;
				});

				return pr;
				// require(['resources/lang/lang-' + langCode + '.js'], function() {
				// 	require(['text!resources/lang/css/style-' + langCode + '.css'], function(css) {
				// 		$style.get(0).textContent = css;
				// 		if (typeof callback === 'function') {
				// 			callback();
				// 		}
				// 	});
				// });

			} else {
				//console.log('----skip load lang data')
				return CPS_Promise.resolve(true);
				// if (typeof callback === 'function') {
				// 	callback();
				// }
			}
		},
		get: function(expression) {
			if (!expression) {
				return;
			}
			var langCode = this.currentLang || this.defaultLang;
			var id = expression.split('|')[0];
			var languageSet = this.__language_data__[langCode];

			if (languageSet) {

				if (!_cache.get('lang_' + langCode, id)) {
					var value = languageSet;
					var arr = id.split('.');

					for (var i = 0, len = arr.length; i < len; i++) {
						if (value[arr[i]]) {
							value = value[arr[i]];
						} else {
							return null;
						}
					}

					if (value) {
						_cache.set('lang_' + langCode, id, value);
					} else {
						return null;
					}
				}
				return _cache.get('lang_' + langCode, id);
			} else {

			}

		},
		setData: function(langCode, data) {
			this.__language_data__[langCode] = this.__language_data__[langCode] || {};
			_.extend(this.__language_data__[langCode], data);
		}
	};

	return new LanguageManager();

});
