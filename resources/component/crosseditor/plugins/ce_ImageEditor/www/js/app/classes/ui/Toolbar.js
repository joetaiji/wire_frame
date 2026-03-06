define([
	'jquery',
	'underscore',
	'app/classes/ui/UIElement',
	'app/lib',

	'text!resources/tpl/ui/ui-toolbar.tpl.html',

	'app/classes/tools/history-reset',
	'app/classes/tools/history-undo',
	'app/classes/tools/history-redo',
	'app/classes/tools/resize-workspace',
	'app/classes/tools/crop-workspace',
	'app/classes/tools/move-layer',
	'app/classes/tools/rotate-left',
	'app/classes/tools/rotate-right',
	'app/classes/tools/inverse-h',
	'app/classes/tools/inverse-v',
	'app/classes/tools/crop-layer',
	'app/classes/tools/resize-layer',
	'app/classes/tools/insert-textbox',
	'app/classes/tools/insert-textballoon',
	'app/classes/tools/insert-sticker',
	'app/classes/tools/adjust-color',
	'app/classes/tools/apply-filter',

	//'lib/swfobject/swfobject'

], function($, _, UIElement,  lib,  _tpl,


tools_history_reset,
tools_history_undo,
tools_history_redo,

tools_resize_workspace,
tools_crop_workspace,
tools_move_layer,

tools_rotate_left,
tools_rotate_right,
tools_inverse_h,
tools_inverse_v,

tools_crop_layer,
tools_resize_layer,

tools_insert_textbox,
tools_insert_textballoon,
tools_insert_sticker,

tools_adjust_color,
tools_apply_filter

//,swfobject

) {

	var NHIE_TOOLS = {
		'history-reset': tools_history_reset,
		'history-undo': tools_history_undo,
		'history-redo': tools_history_redo,

		'resize-workspace': tools_resize_workspace,
		'crop-workspace': tools_crop_workspace,

		'move-layer': tools_move_layer,
		'rotate-left': tools_rotate_left,
		'rotate-right': tools_rotate_right,
		'inverse-h': tools_inverse_h,
		'inverse-v': tools_inverse_v,

		'crop-layer': tools_crop_layer,
		'resize-layer': tools_resize_layer,

		'insert-sticker': tools_insert_sticker,
		'insert-textballoon': tools_insert_textballoon,
		'insert-textbox': tools_insert_textbox,

		'adjust-color': tools_adjust_color,
		'apply-filter': tools_apply_filter,
	};

	var ERROR_NO_FILE_SELECTED = "ERROR_NO_FILE_SELECTED";
	var ERROR_IMAGE_SIZE_INVALID = "ERROR_IMAGE_SIZE_INVALID";



	var NHIE_Toolbar = UIElement.extend({
		classname: 'toolbar',
		renderTo: '.toolbar-top',
		defaultConfig: {
			template: {
				tpl: lib.tmpl(_tpl,{})
			}
		},
		tools: {},
		events: {
			render: function($dom) {
				this.initToolbar();
			}
		},
		initToolbar: function() {
			var toolbar = this;

			var $render_target_base = $('.tools-main',this.dom);
			var _HTML_SEPARATOR = '<div class="toolbar-separator"></div>';
			var _HTML_BTN_GROUP = '<div class="button-group"></div>';

			var toolsConfig = NHIE.util.getConfig('ui.toolbar') || [];
			_.each(toolsConfig, function(info) {
				if(info === '|') {
					$render_target_base.append(_HTML_SEPARATOR);
				} else {
					if(_.isArray(info)) {
						var $render_base = $(_HTML_BTN_GROUP);
						$render_target_base.append($render_base);
						_.each(info, function(tool) {
							var toolItem = NHIE_TOOLS[tool];
							if(toolItem) {
								toolbar.tools[tool] = toolItem;
								toolItem.render($render_base);
							}
						});
					}
				}
			});

			var $input = $('input.file-input-add-photo');
			var orgMarkup = $input.get(0).outerHTML;
			var $inputWrapper = $input.parent();
			$('#file-object').hide();
			// $input.remove();
			//
			// if(lib.useragent.info.IsSafari && parseInt(lib.useragent.version) < 6) {
			// 	$('#file-object').hide();
			// 	$inputWrapper.append(orgMarkup);
			// } else {
			// 	$('#file-object').hide();
			// 	$inputWrapper.append(orgMarkup);
			// }

			// 업로드 버튼 클릭시 활성화된 tool 초기화
			$input = $('input.file-input-add-photo');
			$input.on('mousedown', function() {
				var tool = NHIE.app.getCurrentTool();
				if(tool && tool.toggled) {
					tool.fireEvent('toggle', false);
				}
				console.log('input form clicked...before ',$input.parent().get(0))
				$(this).parent().get(0).reset();
				$(this).parent().find('button').trigger('click');
				$(this).val('');
				//$(this).replaceWith($(this).clone(true));

				console.log('input form clicked...after ',$(this).val())
			});
			// event for "add-photo"
			//

			$input.change(function(e) {
				console.log('input form changed...',$(this).val())
				if(!$(this).val()) return;
				var input = this;
				var p;
				//

				if((typeof window.FileReader === 'function' || typeof window.FileReader === 'object' )
				&& input && input.files) {
					NHIE.app.loading(true);
					p = new NHIE.lib.Promise(function(resolve, reject) {
						try{

							var file = input.files[0];
							if(!file) {
								throw ERROR_NO_FILE_SELECTED;
							}

							if(opener && opener.ce_ImageEditorPlugin && opener.ce_ImageEditorPlugin._oThis){
								var saveFileSizeLimit = opener.ce_ImageEditorPlugin._oThis.getUploadFileSizeLimit();
								if(file.size > saveFileSizeLimit.image){
									throw ERROR_IMAGE_SIZE_INVALID;
								}
							}

							var fileReader = new FileReader();
							fileReader.onload = function(result) {
								resolve(fileReader);
							};
							fileReader.onerror = function(error) {
								reject(e);
							};
							var result = fileReader.readAsDataURL(file);
						} catch(e) {
							//console.error(e);
							reject(e);
						}
					});

					p = p.then(function(fileReader) {
						console.log(fileReader);
						var src = fileReader.result;
						return NHIE.lib.util.getImage(src);
					});

					//console.log(result.length)
				} else if(input && e.target.files && e.target.files[0]) {

					p = NHIE.adapter.upload({
						type: 'form',
						data: input.files
					}).then(function(result) {
						console.log(result);
						console.log(result);
						console.log(result);
						console.log(result);
						if(result.success) {
							var src = result.src;
							return NHIE.lib.util.getImage(src);
						} else {
							throw result.message;
						}
					});
					//throw 'error';
				}
				p = p.then(function(img) {
					// 정상 이미지 판단을 위한 로직

					var canvas = $('<canvas></canvas>').get(0);
					canvas.width = 100;
					canvas.height = 100;
					var ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0, 100,100);
					var imageData = ctx.getImageData(0,0, 100, 100);
					// 문제 없으면 진행, 문제 발생시 오류처리
					return img;
				}).then(function(img) {
					var layer = NHIE.workspace.addLayer('image');
					var canvas = layer.getCanvasElement();
					var ctx = canvas.getContext('2d');

					var w = img.naturalWidth;
					var h = img.naturalHeight;

					var MAX_WIDTH = NHIE.util.getConfig('maxImageWidth');
					var MAX_HEIGHT = NHIE.util.getConfig('maxImageHeight');

					// 업로드 이미지 최대크기 적용
					if(w > MAX_WIDTH || h > MAX_HEIGHT) {
						NHIE.dialog['alert_dialog_bigimage'].show();

						if(w > MAX_WIDTH) {
							h = MAX_WIDTH * h / w;
							w = MAX_WIDTH;
						}
						if (h > MAX_HEIGHT) {
							w = MAX_HEIGHT * w / h;
							h = MAX_HEIGHT;
						}
					}

					canvas.width = w;
					canvas.height = h;

					ctx.drawImage(img, 0, 0, w, h);
					NHIE.util.canvasCache.set(canvas);

					var workspace_size = NHIE.workspace.getSize();
					var i_w = w;
					var i_h = h;
					var c_w = workspace_size.width;
					var c_h = workspace_size.height;

					var img_w = i_w;
					var img_h = i_h;

					layer.setCanvasStyle({
						width: parseInt(img_w),
						height: parseInt(img_h),
						left: parseInt((c_w - img_w) / 2),
						top: parseInt((c_h - img_h) / 2)
					});

					layer.select();
					layer.empty = false;
					NHIE.app.loading(false);
					NHIE.app.fireEvent('changecontent');

				}).catch(function(e) {
					console.error(e);
					NHIE.app.loading(false);
					if(e===ERROR_NO_FILE_SELECTED) {
						// no file selected
						console.log('skip proc by ERROR_NO_FILE_SELECTED')
					}else if(e===ERROR_IMAGE_SIZE_INVALID) {
						/*
						var error_dialog_config = {
							title: 'Image Editor',
							type: 'alert',
							width: 400,
							modal: true,
							destroyWhenClose: true
						};
						
						var addMsg = "";
						if(opener && opener.ce_ImageEditorPlugin && opener.ce_ImageEditorPlugin._oThis){
							var saveFileSizeLimit = opener.ce_ImageEditorPlugin._oThis.getUploadFileSizeLimit();
							if(saveFileSizeLimit.image){
								addMsg = " (" + saveFileSizeLimit.image + " " + NHIE.Lang.SupportLowVersion + ")";
							}
						}

						error_dialog_config.content = '<p>'+NHIE.Lang.PluginImageSizeInvalid + addMsg +'</p>';
						var error_dialog = new Dialog(error_dialog_config);
						error_dialog.show();
						*/
						NHIE.dialog['alert_dialog_imagesizeinvalid'].show();
					} else {
						console.log('e.NHIE_ERROR - ',e.NHIE_ERROR)
						if(e.NHIE_ERROR === 'ERROR') {

							var error_dialog_config = {
								title: 'Image Editor',
								type: 'alert',
								width: 400,
								modal: true,
								destroyWhenClose: true
							};

							error_dialog_config.content = '<p>'+NHIE.Lang.PluginImageUploadFail+ '</p>';
							switch(e.TYPE) {
								case 'invalid_size':
									error_dialog_config.content = '<p>'+NHIE.Lang.PluginImageSizeInvalid+'</p>';
									break;
							}
							var error_dialog = new Dialog(error_dialog_config);
							error_dialog.show();

						} else {
							NHIE.dialog['alert_dialog_wrongimage'].show();
						}
					}
				});
			});

		},
		resetToggle: function() {
			var PROMISE_ARR = [];
			_.each(this.tools, function(tool, action) {
				if(tool.type === 'toggle') {
					if(tool.getToggleStatus() === true) {
						var p = tool.fireEvent('toggle', false, true);
						if(typeof p !== 'undefined' && p.then) {
							PROMISE_ARR.push(p);
						}
					}
				}
			});
			//console.log('reset-toggle')
			if(PROMISE_ARR.length) {
				return NHIE.lib.Promise.all(PROMISE_ARR).then(function() {
					NHIE.propertyPanel.showProperty('empty');
				});
			} else {
				return NHIE.lib.Promise.resolve(true).then(function() {
					NHIE.propertyPanel.showProperty('empty');
				});
			}
		},
		resetButtonStatus: function() {
			_.each(this.tools, function(tool, action) {
				tool.resetButtonStatus();
			});
		},
		getToolbarButton: function(action) {
			return $(this.dom).find('[data-action=' + action + ']');
		},
		updateCanvasSize: function(w, h) {
			var $sizeInfo = $(this.dom).find('.info.info-workspace-size span.content');
			var sizeTpl = 'W: <%=size.width%>, H:<%=size.height%>';
			var info = NHIE.tmpl(sizeTpl, {
				size:{
					width: parseInt(w),
					height: parseInt(h)
				}
			});
			$sizeInfo.html(info);
		}
	});

	return NHIE_Toolbar;
});
