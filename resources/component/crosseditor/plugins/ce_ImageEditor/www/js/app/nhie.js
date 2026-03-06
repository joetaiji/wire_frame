define([
	'jquery',
	'underscore',
	'app/lib',
	'app/classes/Base',
	'app/classes/Application',
	'app/classes/History',
	'app/classes/ui/Toolbar',
	'app/classes/ui/Navigator',
	'app/classes/ui/Workspace',
	'app/classes/ui/LayerPanel',
	'app/classes/ui/PropertyPanel',
	'app/classes/ui/Dialog',

	'text!resources/tpl/nhie-editor.tpl.html',

	'app/plugins/font-awesome',
	'app/plugins/jquery-ui',
	'app/plugins/scrollbar',

], function($, _, lib, Base,
	Application, NHIE_History,
	NHIE_Toolbar, NHIE_Navigator, NHIE_Workspace,
	NHIE_LayerPanel, NHIE_PropertyPanel, Dialog,
	_tpl) {
	/*
	window.console = {
		log: function(){}
	};
	*/

	var NHIE = window.NHIE || {};
	_.extend(NHIE, {
		config: {},
		lib: lib,
		history: new NHIE_History({}),
		cls: Base,

		init: function(config) {
			_.extend_deeper(NHIE.config, config);
		},
		launch: function() {
			console.log('LAUNCH NHIE!!!', NHIE.lib.useragent.info, NHIE.lib.useragent.version);
			console.log('LAUNCH NHIE!!!', NHIE.lib.useragent.info.IsIE);

			var launchable = true;
			if (NHIE.lib.useragent.info.IsIE) {
				if(parseInt(NHIE.lib.useragent.version) < 10) {
					launchable = false;
				}
			}
			console.log('LAUNCH NHIE!!!', launchable);

			if(!launchable) {
				$('.NHIE-loading-prepare-mask').hide();
				var cannot_launch = new Dialog({
					title: 'Image Editor',
					renderTo: 'body',
					type: 'alert',
					content: "<p>" + NHIE.Lang['PluginImageEditor_not_supported_browser'] + "</p>",
					width: 400,
					modal: true,
					onClose: function() {
						window.close();
					}
				});
				cannot_launch.show();
			} else {
				NHIE.app.launch();
			}

		}
	});

	NHIE.app = new Application({
		id: 'nhie-app',
		ui: {
			id: 'nhie-app-body',
			renderTo: '.nhie-application',
			template: {
				tpl: _tpl
			}
		},
		status: {},
		events: {
			render: function(ui) {
				var me = this;
				// 2017.05.12 add by nkpark (config.xml값에서 획득한 값을 설정)
				var initialData = NHIE.adapter.getInitialData();
				this.data('canvas-width', initialData.CanvasWidth || 800);
				this.data('canvas-height', initialData.CanvasHeight || 600);
				// NHIE.config['maxImageHeight'] = initialData.CanvasHeight || 600;
				// NHIE.config['maxImageWidth'] = initialData.CanvasWidth || 600;

				this.initUI().then(function() {
					NHIE.navigator.update();
					NHIE.navigator.resetScroller();
				}).then(function() {
					NHIE.app.fireEvent('focuswindow');
					me.fireEvent('initcomplete');
				}).catch(function(e) {
					console.error(e);
				});
			},
			initcomplete: function() {
				//var req = NHIE.lib.util.parseRequest();
				/*
				_.each(req, function(val,key) {
					console.log(key,'-',val)
				});
				*/
				var initialData = NHIE.adapter.getInitialData();
				console.log(initialData)
				$('.NHIE-loading-prepare-mask').hide();
				NHIE.app.loading(true);

				if(initialData.src) {
					var layer = NHIE.workspace.addLayer('image');
					layer.setImage({
						src: initialData.src,
						style: {
							width: initialData.width,
							height: initialData.height
						}
					}).then(function(imageSize) {
						layer.select();
						NHIE.workspace.setSize(imageSize.width, imageSize.height, true);
					}).then(function() {
						NHIE.app.loading(false);
					}).catch(function(e){
						console.error(e);
					});
				} else {
					NHIE.workspace.setSize(initialData.CanvasWidth || 800,initialData.CanvasHeight || 600, true);
					//NHIE.history.saveHistory();
					NHIE.toolbar.resetButtonStatus();
					NHIE.app.loading(false);
				}

			},
			changenavigatorzoom: function(zoom) {
				console.log('navigator zoom change!! ', zoom);
				this.data('navigator-zoom', zoom);

				this.fireEvent('resizewindow');

				var width = NHIE.app.data('canvas-width') || 600;
				var height = NHIE.app.data('canvas-height') || 400;

				NHIE.workspace.setSize(width, height);
				NHIE.workspace.syncResizerSize();
				NHIE.workspace.syncCropperSize();
				_.each(NHIE.workspace.getAllLayers(), function(layer) {
					layer.syncTrackerSize();
				});

				var scale = zoom / 100;

				$('.layer-container .component-container').css({
					transform: 'scale('+scale+', ' + scale + ')',
					width: width,
					height: height
				});

				var arr = ['left', 'top', 'width', 'height'];

				// 글상자, 말풍선 , 스티커 리사이즈
				var tool = NHIE.toolbar.tools[this.mode];
				if(tool) {
					if(tool.component) {
						var component = tool.component;
						var style = component.getStyle();
						$(component.tracker.dom).each(function(i,el) {
							var $el = $(el);
							_.each(arr, function(attr) {
								$el.css(attr, style[attr] * scale);
							});
							$el.find('.text-editing-area').css('zoom',scale);
						});
					}

					tool.onResizeWindow.apply(tool);
				}

			},
			resizewindow: function() {
				console.log('window size change!! ');

				var $workspace = $('.nhie-body .workspace');
				var $toolbar_top = $('.nhie-body .toolbar-top');
				var $footer = $('.nhie-body .footer');

				$workspace.css({
					top: $toolbar_top.height(),
					height: $(window).height() - $toolbar_top.height() - $footer.height()
				});

				NHIE.navigator.resetScroller();
			},
			moveworkspace: function() {
				var scale = (NHIE.app.data('navigator-zoom') || 100) / 100;
				var arr = ['left', 'top', 'width', 'height'];
				var tool = NHIE.toolbar.tools[this.mode];
				if(tool) {
					if(tool.component) {
						var component = tool.component;
						var style = component.getStyle();
						$(component.tracker.dom).each(function(i,el) {
							var $el = $(el);
							_.each(arr, function(attr) {
								$el.css(attr, style[attr] * scale);
							});
							$el.find('.text-editing-area').css('zoom',scale);
						});
					}

					if(typeof tool.onResizeWindow === 'function') {
						tool.onResizeWindow.apply(tool);
					}
				}
			},
			focuswindow: function() {
				$(this.panel.dom).removeClass('window-focus window-blur')
				.addClass('window-focus');
			},
			blurwindow: function() {
				$(this.panel.dom).removeClass('window-focus window-blur')
				.addClass('window-blur');
			},
			changemode: function() {
				var mode = NHIE.app.mode;
				console.log('[NHIE.app] change mode : ', mode)
				NHIE.propertyPanel.showProperty(mode)
			},
			changeproperty: function(data) {
				NHIE.propertyPanel.setPropertyData(data);
			},
			changecontent: function(skipHistoryEvent) {
				NHIE.layerPanel.resetThumbnails();
				NHIE.navigator.update();

				var workspace_size = NHIE.workspace.getSize();
				NHIE.toolbar.updateCanvasSize(workspace_size.width, workspace_size.height);

				if(!skipHistoryEvent) {
					NHIE.history.saveHistory();
				}
				NHIE.toolbar.resetButtonStatus();
				NHIE.navigator.resetScroller();

			},
			changecanvassize: function() {

			},
			selectlayer: function(layer) {

			},

			mousedown_workspace: function(e) {
				//console.log('mousedown workspace : current mode - ', NHIE.app.mode);
				var mode = NHIE.app.mode;
				var $target = $(e.target);
				NHIE.app.status.mode = mode;
				switch(mode) {
					case 'insert-sticker':
					case 'insert-textbox':
						if($target.hasClass('tracker-handle') || $target.hasClass('layer-tracker')) {
							var component = NHIE.toolbar.tools[mode].component;
							if(component && component.tracker) {
								NHIE.app.status.tracker = component.tracker;
								NHIE.app.status.tracker.fireEvent('mousedown_tracker', e);
							}
						}
						break;

					case 'insert-textballoon':
						console.log($target[0].outerHTML)
						if($target.hasClass('tracker-handle') || $target.hasClass('layer-tracker')) {
							var component = NHIE.toolbar.tools[mode].component;
							if(component && component.tracker) {
								NHIE.app.status.tracker = component.tracker;
								NHIE.app.status.tracker.fireEvent('mousedown_tracker', e);
							}
						} else if ($target.closest('.component').length) {

							if($target.hasClass('text-editing-area') || $target.closest('.text-editing-area')>0) {

							} else {
								// 컴포넌트 드래그 이동 - 텍스트 편집영역 이외의 부분을 드래그하여
								// 컴포넌트를 드래그 한다.
								var component = NHIE.toolbar.tools[mode].component;
								if(component && component.tracker) {
									NHIE.app.status.tracker = component.tracker;
									NHIE.app.status.tracker.fireEvent('mousedown_tracker', e, {
										forceDragMove: true
									});
								}
								e.preventDefault();
							}
						}
						break;
					case 'resize-layer':
						if($target.hasClass('tracker-handle') || $target.hasClass('layer-tracker')) {
							var targetLayer = NHIE.lib.util.getEventTargetLayer(e);
							if(targetLayer && targetLayer.tracker) {
								NHIE.app.status.tracker = targetLayer.tracker;
								NHIE.app.status.tracker.fireEvent('mousedown_tracker', e);
							}
						}
						break;
					case 'resize-workspace':
						if($target.hasClass('tracker-handle') || $target.hasClass('layer-tracker')) {
							NHIE.app.status.tracker = NHIE.workspace.workspace_resizer;
							NHIE.app.status.tracker.fireEvent('mousedown_tracker', e);
						}
					break;
					case 'crop-workspace':
						if(
							$target.hasClass('tracker-handle') || 
							$target.hasClass('layer-tracker') ||
							(NHIE.lib.useragent.info.IsIE10 && $target.hasClass('tracker-body') && $target.closest('.workspace-cropper').length )
						) {
							NHIE.app.status.tracker = NHIE.workspace.workspace_cropper;
							NHIE.app.status.tracker.fireEvent('mousedown_tracker', e);
						}
					break;
					case 'move-layer':
						console.log($target)
						var layer = NHIE.workspace.getSelectedLayer();
						if(layer) {
							NHIE.app.status.layer = layer;
							layer.fireEvent('mousedown_layer', e);
						}
						break;
					case 'crop-layer':
						if($target.closest('#nhie-app-menu-crop').length) {
							NHIE.app.status.mode = null;
							return;
						}
						var layer = NHIE.workspace.getSelectedLayer();
						if(layer) {
							NHIE.app.status.layer = layer;
							var tool = NHIE.toolbar.tools['crop-layer'];
							tool.onMouseDownWorkspace.apply(tool, [e]);
						}

						break;
				}
			},
			mousemove_workspace: function(e) {
				//console.log('mousedown_workspace', NHIE.app.status.mode,  NHIE.app.status.action);
				var tracker = NHIE.app.status.tracker;
				switch(NHIE.app.status.mode) {
					case 'insert-sticker':
					case 'insert-textbox':
					case 'insert-textballoon':
					case 'resize-workspace':
					case 'crop-workspace':
					case 'resize-layer':
						if(tracker) {
							var action = NHIE.app.status.action;
							if(action === 'rotate') {
								tracker.fireEvent('onrotate', e);
							} else if (action === 'resize') {
								tracker.fireEvent('onresize', e, NHIE.app.status.trackerType);
							} else if (action === 'move') {
								tracker.fireEvent('onmove', e);
							}
						}
						break;

					case 'move-layer':
						var targetLayer = NHIE.app.status.layer;
						if(targetLayer) {
							targetLayer.fireEvent('onmove', e);
						}
						break;
					case 'crop-layer':
						break;
				}
				if(NHIE.app.mode ==='crop-layer') {
					var layer = NHIE.workspace.getSelectedLayer();
					if(layer) {
						var tool = NHIE.toolbar.tools['crop-layer'];
						tool.onMouseMoveWorkspace.apply(tool, [e]);
					}
				}
			},
			mouseup_workspace: function(e) {
				switch(NHIE.app.status.mode) {
					case 'insert-sticker':
					case 'insert-textbox':
					case 'insert-textballoon':
					case 'resize-workspace':
					case 'crop-workspace':
					case 'resize-layer':
						if(tracker) {
							var tracker = NHIE.app.status.tracker;
							var action = NHIE.app.status.action;
							if(action === 'rotate') {
								tracker.fireEvent('endrotate', e);
							} else if (action === 'resize') {
								tracker.fireEvent('endresize', e);
							}
						}
						break;

					case 'move-layer':
						var layer = NHIE.app.status.layer;
						if(layer) {
							layer.fireEvent('endmove', e);
						}
						break;

					case 'crop-layer':
						var layer = NHIE.workspace.getSelectedLayer();
						if(layer) {
							var tool = NHIE.toolbar.tools['crop-layer'];
							tool.onMouseUpWorkspace.apply(tool, [e]);
						}
						break;

				}
				if(NHIE.app.mode ==='crop-layer') {
					// var layer = NHIE.workspace.getSelectedLayer();
					// if(layer) {
					// 	var tool = NHIE.toolbar.tools['crop-layer'];
					// 	tool.onMouseUpWorkspace.apply(tool, [e]);
					// }
				}


				NHIE.app.status.mode = '';
				NHIE.app.status = {};
			}
		},
		_modenames:[],
		setMode: function(mode) {
			NHIE.app.mode = mode || 'empty';
			var $nhie_body = $(this.panel.dom);
			var _removeClassNames = '';
			_.each(this._modenames, function(modename) {
				_removeClassNames += ' mode-'+modename;
			});
			$nhie_body.removeClass(_removeClassNames);
			$nhie_body.addClass('mode-'+mode);
		},
		getCurrentTool: function() {
			var mode = NHIE.app.mode || 'empty';
			return NHIE.toolbar.tools[mode];
		},
		initUI: function() {
			var app = this;
			var $dom = $(this.panel.dom);
			var RENDER_TASKS = [];

			// 1. toolbar
			var toolbar = new NHIE_Toolbar({
				id: 'nhie-toolbar'
			});
			RENDER_TASKS.push(toolbar.render());
			NHIE.toolbar = toolbar;
			// 2. navigator;
			var nhie_navigator = new NHIE_Navigator({
				id: 'nhie-navigator'
			});
			RENDER_TASKS.push(nhie_navigator.render());
			NHIE.navigator = nhie_navigator;
			// 3. property panel
			var propertyPanel = new NHIE_PropertyPanel({
				id: 'nhie-propertypanel',
				title: '<span>'+NHIE.Lang.PluginImageEditor_panel_property_title+'</span>'
			});
			RENDER_TASKS.push(propertyPanel.render());
			NHIE.propertyPanel = propertyPanel;

			// 4. layer panel
			var layerPanel = new NHIE_LayerPanel({
				id: 'nhie-layerpanel',
				title: '<span>'+NHIE.Lang.PluginImageEditor_panel_layer_title+'</span>'
			});
			RENDER_TASKS.push(layerPanel.render());
			NHIE.layerPanel = layerPanel;
			// 5. workspace
			var nhie_workspace = new NHIE_Workspace({
				id: 'nhie-workspace'
			});
			NHIE.workspace = nhie_workspace;
			RENDER_TASKS.push(nhie_workspace.render());

			$('button[data-action=NHIE-apply]>span').text( NHIE.Lang['PluginImageEditor_button_confirm']);
			$('button[data-action=NHIE-cancel]>span').text(NHIE.Lang['PluginImageEditor_button_cancel']);

			$('button[data-action=NHIE-apply]').click(function() {
				NHIE.app.loading(true);
				var layers = NHIE.workspace.getAllLayers();

				// 작업한 내용이 없으면 그냥 닫음.
				if(!layers || layers.length === 0) {
					console.log('no image set.. just close');
					$('button[data-action=NHIE-cancel]').click();
					return;
				}
				NHIE.adapter.onApply();
			});
			$('button[data-action=NHIE-cancel]').click(function() {
				NHIE.adapter.onCancel();
				window.close();
			});

			NHIE.dialog = {
				alert_dialog_wrongimage: new Dialog({
					title: 'Image Editor',
					type: 'alert',
					content: "<p><%=NHIE_Lang['PluginImageEditor_msg_wrong_image']%></p>",
					width: 400,
					modal: true,
				}),
				alert_dialog_imagesizeinvalid: new Dialog({
					title: 'Image Editor',
					type: 'alert',
					content: "<p><%=NHIE_Lang['PluginImageSizeInvalid']%> (" + opener.ce_ImageEditorPlugin._oThis.getUploadFileSizeLimit().image + "bytes " + NHIE.Lang.SupportLowVersion + ")</p>",
					width: 400,
					modal: true,
				}),
				alert_dialog_bigimage: new Dialog({
					title: 'Image Editor',
					type: 'alert',
					content: "<p>" + NHIE.Lang['PluginImageEditor_msg_big_image'] + "</p>",
					contentData: {
						width: lib.util.getConfig('maxImageWidth'),
						height: lib.util.getConfig('maxImageHeight'),
					},
					width: 400,
					modal: true,
				})
			};

			return NHIE.lib.Promise.all(RENDER_TASKS);
		},
		loading: function(isLoading) {
			NHIE.lib.util.spinner($('.nhie-body'), isLoading, {
				color: 'white'
			});
		}

	});
	_.extend(NHIE, lib);

	$(function() {
		$(window).on('resize', function() {
			NHIE.app.fireEvent('resizewindow');
		}).on('focus', function() {
			NHIE.app.fireEvent('focuswindow');
		}).on('blur', function() {
			NHIE.app.fireEvent('blurwindow');
		}).on('unload', function() {
			NHIE.adapter.onUnload();
		});
		/*
		$(document.body).on('selectstart', function(e) {
			// 사파리는 selectstart 가 안되면 contenteditable 도 동작하지 않음.
			if(lib.useragent.info.IsSafari) {

			} else {
				e.preventDefault();
				return false;
			}
		})
		*/
		$(document.body).on('mousedown', function(e) {
			var $target = $(e.target);
			if($target.closest('.workspace').length > 0) {
				NHIE.app.status = NHIE.app.status || {};
				NHIE.app.status.mousedown = true;
				NHIE.app.fireEvent('mousedown_workspace', e);
			}
		}).on('mousemove', function(e) {
			NHIE.app.fireEvent('mousemove_workspace', e);
		}).on('mouseup', function(e) {
			NHIE.app.fireEvent('mouseup_workspace', e);
		});
	});
	window.NHIE = NHIE;

	return NHIE;
});
