define([
	'jquery',
	'underscore',
	'app/lib',
	'app/classes/ui/Dialog',

], function($, _, lib, Dialog) {
	var Promise = lib.Promise;
	var langCode = 'kr';
	//try{
		//langCode = opener.NamoSE.DefaultConfig.EditorBaseLanguage || 'kr';
		if (opener.NamoSELang.LangCode == 'ko') {
			langCode = 'kr';
		} else {
			langCode = opener.NamoSELang.LangCode || 'kr';
		}
	//} catch(e) {
	//}

	var getOpenerPlugin = function() {
		var opener_plugin = {};
		try{
			opener_plugin = opener.ce_ImageEditorPlugin;
		}catch(e){
			console.error('error : opener is missing', e)
		}
		return opener_plugin;
	}

	return {
		localeCode : langCode,
		localeResource : {
			url: '../../../../js/lang/'+langCode,
			shim: 'NamoSELang'
		},
		getInitialData: function() {
			var data = getOpenerPlugin().getInitialData();
			this._initialData = data;
			var result = {};

			result.checkImageTitle = data.checkImageTitle;
			if(data.editImageURL) {
				result.src = data.editImageURL;
				result.width = data.editImageWidth;
				result.height = data.editImageHeight;

				if(result.src.indexOf('data:image/')===0) {
					result.type='datasrc';
				} else {
					result.type='url';
				}
				result.title = data.imageTitle;
			} else {
				result.type = 'none';
			}
			// 2017.05.12 add by nkpark (config.xml파일의 캔버스 크기 설정 획득)
			result.CanvasWidth = data.CanvasWidth || 800;
			result.CanvasHeight = data.CanvasHeight || 600;

			return result;
		},
		upload: function(cfg) {
			var p;
			cfg = cfg || {};
			cfg.type = (cfg.type || '').toLowerCase();
			if(cfg.type==='form') {
				return Promise.resolve(getOpenerPlugin().upload(cfg.data))
				.then(function(responseText){
					console.log(responseText)
					var result = {}
					try {
						var res = JSON.parse(responseText);
						console.log(res)
						if(res.result === 'success') {
							var info = res.addmsg[0];
							var src = info.imageURL;
							if(src) {
								result.success = true;
								result.src = src;
								result.width = info.imageOrgWidth;
								result.height = info.imageOrgHeight;
								result.size = info.imageSize;
							} else {
								result.success = false;
								result.message = lib.err.ERR_NO_IMAGE; //
							}
						} else {
							result.success = false;
							switch(res.result) {
								case 'invalid_size':
									result.message = lib.err.ERR_FILE_SIZE_LIMIT;
									break;
								case 'UploadFileExtBlock':
									result.message = res.result;
									break;
								case '':
									result.message = '';
							}
						}
					} catch(e) {
						console.error(e);
						result.message = lib.err.ERR_NO_IMAGE;
					}
					return result;
				});
			}
			return Promise.resolve();
		},
		onApply: function() {

			var workspace_size = NHIE.workspace.getSize();
			//var canvas = NHIE.workspace.mergeLayers();
			var initialData = NHIE.adapter.getInitialData();
			var run_mode = initialData.type==='none'?'TEXT':'ITEM';
			var img_alttext = '';

			lib.Promise.resolve().then(function() {
				// 접근성 검사 설정시 dialog 출력하도록 추가
				var promise_alttext_dialog = lib.Promise.resolve(initialData.title);
				if(initialData.checkImageTitle ==='true' && !initialData.title) {
					var DIALOG_CONTENT = '<p>'+ NHIE.Lang['PluginImageEditor_msg_accessibility']+'</p>'
					+'<div><input type="text" style="width:100%;"/></div>';

					promise_alttext_dialog = new lib.Promise(function(resolve, reject) {
						var CHECK_DIALOG = new Dialog({
							title: 'Image Editor',
							type: 'dialog',
							width: 400,
							content: DIALOG_CONTENT,
							modal: true,
							button_config:[{
								name: NHIE.Lang['PluginImageEditor_button_confirm'],
								action: function() {
									var $dialog = $(this);
									var $alt = $dialog.find('input');
									var text = $alt.val();

									if(text) {
										resolve(text);
										$(this).dialog('close');
									} else {

									}
								}
							}],
							onRenderDialog: function($dialog) {
								var $button = $dialog.parent().find('button');
								var $input = $dialog.find('input');
								$button.addClass('ui-state-disabled').attr('disabled', 'disabled');
								$input.off('keydown').on('keydown', function() {
									var text = ($input.val()||'').trim();
									if(text) {
										$button.removeClass('ui-state-disabled').removeAttr('disabled')
									} else {
										$button.addClass('ui-state-disabled').attr('disabled','disabled');
									}
								});
								$input.focus();
							}
						});
						NHIE.app.loading(false);
						CHECK_DIALOG.show();
					});
				}
				return promise_alttext_dialog;
			}).then(function(text) {
				NHIE.app.__imageTitle = text || initialData.title;
				NHIE.app.loading(true);
				return NHIE.workspace.mergeLayers();
			}).then(function(canvas) {
				var dataSrc = canvas.toDataURL();
				//alert(dataSrc.substring(0,200))
			
				function dataURLtoBlob(dataurl) {
					var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
						bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
					while(n--){
						u8arr[n] = bstr.charCodeAt(n);
					}
					return new Blob([u8arr], {type:mime});
				}
				var dataURItoBlob = function(dataURI) {
					// convert base64/URLEncoded data component to raw binary data held in a string
					var byteString;
					if (dataURI.split(',')[0].indexOf('base64') >= 0)
						byteString = atob(dataURI.split(',')[1]);
					else
						byteString = unescape(dataURI.split(',')[1]);

					// separate out the mime component
					var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

					// write the bytes of the string to a typed array
					var ia = new Uint8Array(byteString.length);
					for (var i = 0; i < byteString.length; i++) {
						ia[i] = byteString.charCodeAt(i);
					}

					return new Blob([ia], {type:mimeString});
				}
				var data = null;
				if (lib.useragent.info.IsIE10 || lib.useragent.info.IsIE11 || lib.useragent.info.IsEdge) {
					data = dataSrc;//dataURItoBlob(dataSrc);
				} else {
					data = dataSrc;//dataURItoBlob(dataSrc);
				}
				var obj = data;
				console.log(obj)

				return NHIE.adapter.upload({
					type: 'form',
					data: obj
				}).then(function(result) {
					console.log(result)
					if(result.success) {
						var src = result.src;
						var size = result.size;
						getOpenerPlugin().execute({
							src: src,
							size: size,
							//src: dataSrc,
							alt: NHIE.app.__imageTitle,
							width: canvas.width,
							height: canvas.height,
							mode:run_mode
						});
					}else if(result.message){
						getOpenerPlugin().execute({
							error : result.message
						});
					}
					window.close();
				}).catch(function(e){
					console.error(e);
				});

				//getOpenerPlugin().upload(input.files);
			}).catch(function(e) {
				console.error(e);
			}).then(function() {
				NHIE.app.loading(false);
				//window.close();
			})
		},
		onCancel: function() {
			console.log('close NHIE window');
			//try{
				getOpenerPlugin().unmaskParent();
				getOpenerPlugin().cancel();
			//}catch(e){
			//}

		},
		onUnload: function() {
			getOpenerPlugin().unmaskParent();
		}

	};
});
