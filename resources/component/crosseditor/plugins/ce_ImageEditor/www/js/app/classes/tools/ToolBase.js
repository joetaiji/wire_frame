define([
	'underscore',
	'jquery',
	'app/classes/Observable',
	'text!resources/tpl/ui/ui-toolbar-button.tpl.html',
	'text!resources/tpl/ui/property/ui-property-item.common.text-attributes.tpl.html',

	'app/plugins/colorpicker'

],function(_, $, Observable, _button_tpl, _textAttrTpl) {
	var NHIE_Tool = Observable.extend({
		classname: 'ToolBase',
		cls: 'button',
		type: 'normal',

		events: {
			'click': function() {
				var me = this;
				if(this.type === 'normal') {
					NHIE.toolbar.resetToggle();
					NHIE.app.setMode('empty');
					this.handle();
				} else if(this.type === 'toggle') {
					var onoff = !this.$button.hasClass('on');
					if(onoff) {
						NHIE.toolbar.resetToggle().then(function() {
							me.fireEvent('toggle', onoff);
						}).catch(function(e){
							console.error(e);
						});
					} else {
						// me.fireEvent('toggle', onoff);
						NHIE.app.getCurrentTool().onRestoreProperty();
						NHIE.toolbar.resetToggle();
						NHIE.app.setMode('empty');
					}
				}
				NHIE.toolbar.resetButtonStatus();
			},
			'toggle': function(onoff, skipEvent) {
				var changedMode = 'empty';
				var action = this.name;
				if(onoff) {
					changedMode = action;
				}
				this.$button.removeClass('on off').addClass(onoff?'on':'off');
				this.toggled = onoff;
				if(!skipEvent) {
					NHIE.app.setMode(changedMode);
					NHIE.app.fireEvent('changemode');
				}
				return this.handle(this.$button, onoff);
			}
		},
		onResizeWindow: function() {},
		getToggleStatus: function() {
			if(this.type === 'toggle') {
				return this.$button.hasClass('on');
			}
		},
		handle: function($button, onoff) {
			console.log('handle tool action : ', this.name, this.type,onoff)
			return this.handler($button, onoff);
		},
		render: function($target) {
			var title_name = this.name.replace(/\-/g, '_');
			var render_data = {
				action: this.name,
				type: this.type,
				cls: this.cls,
				iconCls: this.iconCls,
				title: NHIE.Lang['PluginImageEditor_tool_title_' + title_name]
			};
			var html = NHIE.tmpl(_button_tpl, {
				data: render_data
			});
			var $button = $(html);
			this.$button = $button;
			$target.append($button);

			var tool = this;
			if(this.type === 'toggle') {
				$button.addClass('off');
				this.toggled = false;
			}
			$button.on('click', function() {
				//console.log('click button - ', tool.name, !$button.hasClass('disabled'))
				if(!$button.hasClass('disabled')) {
					tool.fireEvent('click');
				}
			});
		},
		resetButtonStatus: function() {
			var enabled = this.enableStatus() && NHIE.workspace.getAllLayers().length;
			var $button =  this.$button;
			if(enabled) {
				$button.removeAttr('disabled');
				$button.removeClass('enabled disabled').addClass('enabled');
			} else {
				$button.attr('disabled','disabled');
				$button.removeClass('enabled disabled').addClass('disabled');

				if(this.type === 'toggle' && this.toggled === true) {
					this.fireEvent('toggle', false);
				}
			}
		},
		initTextAttributeForm: function($property) {
			var me = this;
			var fontFamilyArr = _.map(NHIE.Lang.defaultfont, function(name,value){
				return {
					title: name,
					value: value
				};
			});
			var data = {
				fontFamilyList: fontFamilyArr,
				fontSizeList: NHIE.util.getConfig('resources.font-size'),
				fontSizeUnit: NHIE.util.getConfig('resources.font-size-unit')
			};
			var html = NHIE.tmpl(_textAttrTpl, {data:data});
			var $text_attrs = $(html);
			this.$text_attrs = $text_attrs;
			return $text_attrs;
		},
		bindTextAttributeEvents: function() {
			var me = this;
			var $text_attrs = this.$text_attrs;

			var $getTextEditingArea = function() {
				return me.component.$textEditingArea;
			};

			var initToggle = function() {
				var $button = $(this);
				$button.on('click', function(e) {
					if($(this).hasClass('disabled')) {
						e.preventDefault();
						return false;
					}
					var onoff = !$button.hasClass('on');

					var toggle_group = $button.data('toggle-group');
					if(toggle_group) {
						var $btn_same_group = $text_attrs.find('button[data-toggle-group='+toggle_group+']');
						if(onoff) {
							if($text_attrs.find('button.on[data-toggle-group='+toggle_group+']').length > 0) {
								$text_attrs.find('button.on[data-toggle-group='+toggle_group+']').trigger('toggle', false);
							}
						} else {
							return;
						}
					}

					$button.trigger('toggle', onoff);
				}).on('toggle', function(e, onoff) {
					$button.removeClass('on off').addClass(onoff?'on':'off');
				});
			};

			$('button[data-btn-type=toggle]', $text_attrs).each(initToggle);


			$('button[data-action=bold]', $text_attrs).on('toggle', function(e, onoff) {
				$getTextEditingArea().css('font-weight', onoff?'bold':'normal');
			});

			$('button[data-action=underline]', $text_attrs).on('toggle', function(e, onoff) {
				$getTextEditingArea().css('text-decoration', onoff?'underline':'none');
			});

			$('button[data-action=italic]', $text_attrs).on('toggle', function(e, onoff) {
				$getTextEditingArea().css('font-style', onoff?'italic':'normal');
			});

			$('button[data-action=align-left]', $text_attrs).on('toggle', function(e, onoff) {
				$getTextEditingArea().css('text-align', onoff?'left':'initial');
			});
			$('button[data-action=align-center]', $text_attrs).on('toggle', function(e, onoff) {
				$getTextEditingArea().css('text-align', onoff?'center':'initial');
			});
			$('button[data-action=align-right]', $text_attrs).on('toggle', function(e, onoff) {
				$getTextEditingArea().css('text-align', onoff?'right':'initial');
			});
			$('button[data-action=align-justify]', $text_attrs).on('toggle', function(e, onoff) {
				$getTextEditingArea().css('text-align', onoff?'justify':'initial');
			});

			$('.sp-container').remove();
			$('button[data-action=color]', $text_attrs).spectrum('destroy').spectrum({
				showAlpha: true,
				flat: false,
				showInput: true,
				preferredFormat: "rgb",
				showPalette: false,
				showPaletteOnly: false,
				chooseText : "Ok",
				cancelText : "Cancel",
				showInitial : true,
				change : function (cp) {
					var val = $(this).spectrum("get");
					$(this).find('span.color').css('background-color', val.toRgbString());

					var $textEditingArea = $getTextEditingArea();
					if($textEditingArea) {
						$textEditingArea.css('color', val.toRgbString());
					}
				},
				show : function(cp) {
					// var selectedColor = $(this).find('span.cp-chart-field-color').css('background-color');
					// $(this).spectrum("set", t.rgb2hex(selectedColor));
				}
			});
			var defaultFontConfig = NHIE.util.getConfig('defaultFontConfig');
			console.log(defaultFontConfig)
			$text_attrs.find('select[name=font-family]').find('option[value="'+defaultFontConfig.fontFamily+'"]').attr('selected','selected');
			$text_attrs.find('select[name=font-family]').customselectmenu({
				maxHeight: 200,
				select: function(e, ui) {
					var $textEditingArea = $getTextEditingArea();
					if($textEditingArea) {
						var val = ui.item.value;
						$textEditingArea.find('span').css('font-family','inherit');
						$textEditingArea.css('font-family', val);
					}
				}
			}).customselectmenu('menuWidget').css({height:200});
			$text_attrs.find('select[name=font-size]').val(defaultFontConfig.fontSize);
			$text_attrs.find('select[name=font-size]').customselectmenu({
				maxHeight: 200,
				select: function(e, ui) {
					var $textEditingArea = $getTextEditingArea();
					if($textEditingArea) {
						var val = ui.item.value;
						$textEditingArea.find('span').css('font-size','inherit');
						$textEditingArea.css('font-size', val);
					}
				}
			}).customselectmenu('menuWidget').css({height:200});
			//.val(defaultFontConfig.fontSize)
			//.customselectmenu('refresh');


		},
		enableTextAttributes: function(enable) {
			var $text_attrs = this.$text_attrs;
			if($text_attrs) {
				if(typeof enable === 'undefined') {
					enable = true;
				} else {
					enable = !!enable;
				}

				if(enable) {
					$text_attrs.find('button').removeClass('disabled');
					$text_attrs.find('select').customselectmenu('enable');
				} else {
					$text_attrs.find('button').addClass('disabled');
					$text_attrs.find('select').customselectmenu('disable');
				}
			}
		},
		getTextAttributes: function() {
			var $text_attrs = this.$text_attrs;
			if($text_attrs) {
				return {
					fontSize: $('select[name=font-size]',$text_attrs).val(),
					fontFamily: $('select[name=font-family]',$text_attrs).val(),
					bold: $('button[data-action=bold]',$text_attrs).hasClass('on'),
					italic: $('button[data-action=italic]',$text_attrs).hasClass('on'),
					underline: $('button[data-action=underline]',$text_attrs).hasClass('on'),

					alignLeft: $('button[data-action=align-left]',$text_attrs).hasClass('on'),
					alignCenter: $('button[data-action=align-center]',$text_attrs).hasClass('on'),
					alignRight: $('button[data-action=align-right]',$text_attrs).hasClass('on'),
					alignJustify: $('button[data-action=align-justify]',$text_attrs).hasClass('on'),

					color: $('button[data-action=color]',$text_attrs).spectrum('get').toRgbString()
				};
			} else {
				return {};
			}
		},
		setTextAttrOnEl: function($target, style) {
			style = style || this.getTextAttributes();

			$target.css('font-weight', style.bold?'bold':'normal');
			$target.css('font-style', style.italic?'italic':'normal');
			$target.css('text-decoration', style.underline?'underline':'none');
			var text_align = 'left';
			if(style.alignLeft) {
				text_align = 'left';
			} else if(style.alignCenter) {
				text_align = 'center';
			} else if(style.alignRight) {
				text_align = 'right';
			} else if(style.alignJustify) {
				text_align = 'justify';
			}
			$target.css('text-align', text_align);
			$target.css('color', style.color || '');

		},
		renderTextComponentOnCanvas: function(component, x, y, w, h) {

			var defaultFontConfig = NHIE.util.getConfig('defaultFontConfig');

			var renderLine = function(context, x0, y0, x2, y2, color) {
				context.save();

				context.strokeStyle = color;
				context.beginPath();
				context.moveTo(x0, parseInt(y0)+0.5);
				context.lineTo(x2, parseInt(y2)+0.5);
				context.stroke();
				context.restore();
			};

			var renderUnderline = function(context, x, y, width, maxWidth, config) {
				//console.log('renderUnderline at ', x, y, width, maxWidth)

				var x0 = x;
				var x1 = x;
				var lineY = y;
				var fontSize = parseInt(config.fontSize || defaultFontConfig.fontSize) ;

				//lineY += fontSize;
				lineY += 1 + (NHIE.lib.useragent.info.IsGecko)?2:0;
				if (config.alignLeft) {
					x0 = x;
					x1 = x + width;
				} else if (config.alignCenter) {
					//var center = x + maxWidth / 2;
					x0 = x - width / 2;
					x1 = x + width / 2;
				} else if (config.alignRight) {
					x0 = x - width;
					x1 = x;
				}

				renderLine(context, x0, lineY, x1, lineY, config.color);
			};

			// firefox 는 canvas 의 italic 을 지원하지 않음
			var skew_offset_x_amount = function(y, config) {
				if(!NHIE.lib.useragent.info.IsGecko || !config.italic) {
					return 0;
				}
				var r = (y - 50) / 5 + 11 ;
				//console.log('skew amount : ', r);
				return r;
			};

			var wrapText = function (context, text, x, y, maxWidth, lineHeight, cfg) {

				var textOutX = x;
				var textOutY = y;


				if (cfg.alignLeft) {
					context.textAlign = 'left';
				} else if (cfg.alignCenter) {
					context.textAlign = 'center';
					textOutX = x + maxWidth / 2;
				} else if (cfg.alignRight) {
					textOutX = x + maxWidth;
					context.textAlign = 'right';
				}
				var isUnderline = !!cfg.underline;
				//console.log(text);
				var cars = text.split("\\n");

				for (var ii = 0; ii < cars.length; ii++) {
					var line = "";
					var lineWidth = 0;
					var words = cars[ii].split(" ");
					//console.log(words);
					var nbsp = ' ';
					if(words.length === 1){
						words = words[0];
						nbsp = '';
						if(words ===' ') {
							nbsp = ' ';
						}
					}
					for (var n = 0; n < words.length; n++) {
						var testLine = line + words[n] + nbsp;
						//console.log(testLine)
						var metrics = context.measureText(testLine);
						var testWidth = metrics.width;
						if (testWidth > maxWidth) {
							console.log(line, lineWidth)

							context.fillText(line, textOutX +skew_offset_x_amount(textOutY, cfg), textOutY);
							if(isUnderline) {
								renderUnderline(context, textOutX +skew_offset_x_amount(textOutY, cfg), textOutY, lineWidth, maxWidth, cfg);
							}

							line = words[n] + nbsp;
							textOutY += lineHeight;

						}
						else {
							line = testLine;
							lineWidth = testWidth;
						}
					}

					lineWidth = context.measureText(line).width;
					//console.log(line, lineWidth);
					context.fillText(line, textOutX +skew_offset_x_amount(textOutY, cfg), textOutY);
					if(isUnderline) {
						renderUnderline(context, textOutX +skew_offset_x_amount(textOutY, cfg), textOutY, lineWidth, maxWidth, cfg);
					}
					//renderLine(context, x,y,x+lineWidth, y);
					lineWidth = 0;
					textOutY += lineHeight;
				}
			};
			var $component = component.$component;

			var $text_canvas = $('<canvas></canvas>');
			var text_canvas = $text_canvas.get(0);
			var temp_ctx = text_canvas.getContext('2d');

			text_canvas.width = $component.width();
			text_canvas.height = $component.height();

			var $textEditingArea = $(component.tracker.dom).find('.text-editing-area');
			var textHtml = $textEditingArea.html();

			console.log('original markup : ', textHtml)
			// 불필요한 마크업 정리
			textHtml = textHtml.replace(/<span [^>]*>/gm, '');
			textHtml = textHtml.replace(/<\/span>/gm, '');
			textHtml = textHtml.replace(/<b [^>]*>/gm, '');
			textHtml = textHtml.replace(/<\/b>/gm, '');
			textHtml = textHtml.replace(/<div><br><\/div>/gm, '\\n');
			textHtml = textHtml.replace(/<div><br\/><\/div>/gm, '\\n');
			textHtml = textHtml.replace(/<p>&nbsp;<\/p>/gm, '\\n');
			textHtml = textHtml.replace(/^<div>/gm, '');
			textHtml = textHtml.replace(/<div>/gm, '\\n');
			textHtml = textHtml.replace(/^<p>/gm, '');
			textHtml = textHtml.replace(/<p>/gm, '\\n');
			textHtml = textHtml.replace(/<br>/gm, '\\n');
			textHtml = textHtml.replace(/<br\/>/gm, '\\n');
			textHtml = textHtml.replace(/<\/p>/gm, '');
			textHtml = textHtml.replace(/<\/div>/gm, '');
			textHtml = textHtml.replace(/&nbsp;/gm, ' ');

			// 폰트 속성 설정
			//
			//
			var text_attr = this.getTextAttributes();
			console.log(text_attr);
			var fontFamily = text_attr.fontFamily || 'gulim';
			var lineHeight = $textEditingArea.css('line-height');
			var fontSize = text_attr.fontSize;
			var fontWeight = text_attr.bold?'bold':'normal';
			var fontStyle = text_attr.italic?'italic':'normal';

			if(lineHeight ==='normal') {
				lineHeight = parseInt(fontSize) * 1.3 + 'px';
			}
			var fontConfig =fontStyle +' '+ fontWeight + ' ' + fontSize + ' ' + fontFamily;

			if(NHIE.lib.useragent.info.IsGecko && text_attr.italic) {
				// FireFox 는 itatic 을 내장하지 않은 font 는 normal 로 그냥 출력하는 문제가 있어 강제로 구현
				fontConfig = fontConfig.replace('italic', 'normal');
				temp_ctx.transform(0.99,0,-0.2,1,0,0);
			}

			temp_ctx.font = fontConfig;
			//temp_ctx.textBaseline='top';
			temp_ctx.fillStyle = text_attr.color || '';

			console.log(fontConfig)
			wrapText (temp_ctx, textHtml, x, y + parseInt(fontSize), w, parseInt(lineHeight), text_attr);

			return text_canvas;
		},
		handler: function($button, toggleStatus) {
			return NHIE.lib.Promise.resolve(true);
		},
		onRenderPropertyBase: function($property) {
			//console.log('onRenderPropertyBase',$property)

			var applyBtnTitle = this.applyBtnTitle || NHIE.Lang['PluginImageEditor_button_apply'];
			var restoreBtnTitle = this.restoreBtnTitle || NHIE.Lang['PluginImageEditor_button_restore'];
			var applyBtnVisible = this.applyBtnVisible === false ? false:true;
			var restoreBtnVisible = this.restoreBtnVisible === false ? false:true;

			var $property_panel_footer = $property.parent().find('.ui-panel-footer');

			var $btn_apply = $property_panel_footer.find('button[data-action=apply]');
			var $btn_restore = $property_panel_footer.find('button[data-action=restore]');

			$btn_apply.text(applyBtnTitle);
			$btn_restore.text(restoreBtnTitle);

			if(applyBtnVisible){
				$btn_apply.show();
			} else {
				$btn_apply.hide();
			}

			if(restoreBtnVisible){
				$btn_restore.show();
			} else {
				$btn_restore.hide();
			}


			this.onRenderProperty($property);
		},
		onRenderProperty: function() {

		},
		enableStatus: function() {
			return true;
		},
		onShowProperty: function(data) {
			NHIE.propertyPanel.setPropertyContent(this.name, data);
		},
		onApplyProperty: function() {

		},
		onRestoreProperty: function() {

		}
	});
	return NHIE_Tool;
});
