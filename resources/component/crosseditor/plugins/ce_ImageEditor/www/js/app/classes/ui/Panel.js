define([
	'jquery',
	'underscore',
	'app/classes/ui/UIElement',

	'text!resources/tpl/ui/ui-panel.tpl.html'
], function($, _, UIElement, _panel_tpl) {

	var Panel = UIElement.extend({
		classname: 'Panel',
		defaultConfig: {
			template: {
				tpl: _panel_tpl
			}
		},
		setBodyContent: function(body) {
			var templateConfig = this.getTemplateConfig();
			var $body = $(this.dom).find('.ui-panel-body');

			$body.append($(body));
		},
		setContent: function(html) {
			var templateConfig = this.getTemplateConfig();
			html = NHIE.tmpl(html, templateConfig);

			this._super(html);
			var title = this.initConfig.title || 'PanelTitle';
			this.setHeaderContent('<h3>' + title + '</h3>');
			this.setBodyContent(templateConfig.bodyTpl);
			if(templateConfig.footerTpl) {
				this.setFooterContent(templateConfig.footerTpl);
			}
		},
		setHeaderContent: function(html) {
			$(this.dom).find('.ui-panel-header').html('')
			.append(html);
		},
		setFooterContent: function(html) {
			$(this.dom).find('.ui-panel-footer').html('')
			.append(html);
		},
		setBodyContent: function(html) {
			$(this.dom).find('.ui-panel-body').html('')
			.append(html);
		},
		render: function(config) {
			var me = this;
			this._super(config).then(function($dom) {
				$dom.draggable({
					handle: 'h3',
				});

				return $dom;
			});
		},
		loading: function(isloading) {
			var me = this;
			var $dom = $(this.dom);
			NHIE.util.spinner($dom, isLoading);
		}

	});

	return Panel;
});
