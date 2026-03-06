define([
	'jquery',
	'underscore',
	'app/classes/ui/UIElement',

	'text!resources/tpl/ui/ui-navigator.tpl.html'
], function($, _, UIElement, _tpl) {
	/**
	 * class: Navigator
	 * 화면 좌측 하단의 navigator 영역의 처리 관련
	 */
	var NHIE_Navigator = UIElement.extend({
		classname: 'Navigator',
		renderTo: '.nhie-body',
		defaultConfig: {
			template: {
				tpl: _tpl
			}
		},
		zoom: 100,
		events: {
			/**
			 * event: render
			 * Navigator 가 화면상에 렌더링 된 후 처리
			 * @param  {jquery} $dom 렌더링 된 navigator의 jquery 객체
			 */
			render: function($dom) {
				var nhie_navigator = this;
				// zoom slider 동작 설정
				var ZOOM_STEPS = NHIE.util.getConfig('ui.navigator.zoom_steps');
				$('div[data-form-type=slider]', $dom).slider({
					min: 0,
					max: ZOOM_STEPS.length - 1,
					value: 5,
					step: 1,
					slide: function(e, ui) {
						var value = ui.value;
						$('.navigator-controller-zoom-value', $dom)
						.text(ZOOM_STEPS[value] + '%');

						nhie_navigator.fireEvent('changezoom', ZOOM_STEPS[value]);
					}
				});

				// expander 동작 설정
				$('.navigator-expander', $dom).on('click', function() {
					$dom.toggleClass('expanded');
					var expanded = $dom.hasClass('expanded');
					var eventName = 'on' + (expanded ? 'expanded':'closed');
					console.log('---', eventName)
					nhie_navigator.fireEvent(eventName);
				});
				var $preview_wrapper = $('.preview-wrapper',$dom);
				var $preview_base =  $('.navigator-preview',$dom);

				$('.preview-scroller',$dom).draggable({
					drag: function(e, ui) {
						// 드래깅 영역을 navigator 내부로 제한
						var preview_offset = $preview_base.offset();
						var base_offset = $preview_wrapper.offset();
						var base_width  = $preview_wrapper.width();
						var base_height = $preview_wrapper.height();
						var scroller_w = $(this).width();
						var scroller_h = $(this).height();

						var position_offset = {
							left: base_offset.left - preview_offset.left,
							top:  base_offset.top - preview_offset.top
						};

						if(ui.position.top - position_offset.top < 0) {
							ui.position.top = position_offset.top + 0;
						}
						if(ui.position.top - position_offset.top + scroller_h > base_height) {
							ui.position.top = position_offset.top + base_height - scroller_h;
						}
						if(ui.position.left - position_offset.left < 0) {
							ui.position.left = position_offset.left + 0;
						}
						if(ui.position.left - position_offset.left + scroller_w > base_width) {
							ui.position.left = position_offset.left + base_width - scroller_w;
						}

						// 편집화면 위치 수정
						var coord = {
							left: (ui.position.left - position_offset.left),
							top: ui.position.top - position_offset.top
						};
						nhie_navigator.setWorkspacePositionByScroller(coord.left, coord.top);

						//console.log(win_coord)
					}
				});
			},
			changezoom: function(value) {
				this.zoom = value;
				NHIE.app.fireEvent('changenavigatorzoom', value);


				NHIE.navigator.resetScroller();

			},
			onclosed: function() {
				console.log('navigator closed!!');
				$(this.dom).find('.navigator-preview').hide();
			},
			onexpanded: function() {
				console.log('navigator expanded!!')
				$(this.dom).find('.navigator-preview').show();
				this.update();
				this.resetScroller();
			}
		},
		/**
		 * workspace 의 변경내역을 navigator 화면에 반영
		 */
		update: function() {
			var $preview_wrapper = $(this.dom).find('.navigator-preview .preview-wrapper');
			$preview_wrapper.html('');
			var $layers = $('.workspace .layer-container.layer-workspace').clone();
			$preview_wrapper.append($layers);

			var $preview_area = $(this.dom).find('.navigator-preview');
			$preview_area.find('.layer-wrapper').css({
				transform: 'scale(1,1)'
			});
			var navigator_box = {
				width: $preview_area.width(),
				height: $preview_area.height()
			};

			// canvas 내용 복제
			$layers.find('canvas').each(function(idx, canvas) {
				NHIE.util.canvasManager.resetImageData(canvas);
			});

			var nav_zoom = 1;
			var workspace_size = NHIE.workspace.getSize();
			if(workspace_size.width > workspace_size.height) {
				nav_zoom = navigator_box.width / workspace_size.width;
				if (nav_zoom * workspace_size.height > navigator_box.height) {
					nav_zoom = navigator_box.height / workspace_size.height;
				}
			} else {
				nav_zoom = navigator_box.height / workspace_size.height;
				if (nav_zoom * workspace_size.width > navigator_box.width) {
					nav_zoom = navigator_box.width / workspace_size.width;
				}
			}
			this.nav_zoom = nav_zoom;
			$preview_wrapper.css({
				width: nav_zoom * workspace_size.width,
				height: nav_zoom * workspace_size.height,
				marginLeft: nav_zoom * workspace_size.width / -2,
				marginTop: nav_zoom * workspace_size.height / -2
			});
			$layers.css({
				position: 'absolute', left:'50%', top:'50%', zoom: 1
			});
			$layers.css('transform','scale(' + nav_zoom + ')');

		},
		/**
		 * 화면 크기에 따라 navigator 의 dragging 영역 수정
		 */
		resetScroller: function() {
			var window_size = {
				width: $('.nhie-body .workspace').width(),
				height: $('.nhie-body .workspace').height()
			};

			var w_width = window_size.width;
			var w_height = window_size.height;
			var workspace_size = NHIE.workspace.getSize();
			var zoom = this.zoom || 100;

			var $preview_area = $('.navigator-preview .preview-wrapper');
			var navigator_box = {
				width: $preview_area.width(),
				height: $preview_area.height()
			};

			var $preview_scroller = $(this.dom).find('.preview-scroller');

			var nav_zoom = 1;

			var $workspace = $('.workspace .layer-container');

			var offset_navigator = $('.navigator-preview').offset();
			var offset_preview = $('.navigator-preview .preview-wrapper').offset();

			var scroller_offset = {
				left: offset_preview.left - offset_navigator.left,
				top: offset_preview.top - offset_navigator.top
			};

			if (workspace_size.width * zoom / 100 > w_width) {
				$preview_scroller.show();
				this.scrollerEnabled = true;
				nav_zoom = navigator_box.width / workspace_size.width / (zoom / 100);
				if(w_height > workspace_size.height * zoom / 100) {
					w_height = workspace_size.height * zoom / 100
				}
				var scroller_style = {
					width: w_width * nav_zoom,
					height: w_height * nav_zoom
				};
				scroller_style.left = scroller_offset.left;
				scroller_style.top = scroller_offset.top;

				$preview_scroller.css(scroller_style);

				//this.setWorkspacePositionByScroller(scroller_style.left, scroller_style.top)
				this.setWorkspacePositionByScroller(
					$preview_scroller.offset().left - $preview_area.offset().left,
					$preview_scroller.offset().top - $preview_area.offset().top
				);

			} else if (workspace_size.height * zoom / 100 > w_height) {
				$preview_scroller.show();
				this.scrollerEnabled = true;
				nav_zoom = navigator_box.height / workspace_size.height / (zoom / 100);
				var scroller_style = {
					width: w_width * nav_zoom,
					height: w_height * nav_zoom
				};
				if(scroller_style.width > navigator_box.width ) {
					scroller_style.width = navigator_box.width;
				}

				scroller_style.left = scroller_offset.left;
				scroller_style.top = scroller_offset.top;

				$preview_scroller.css(scroller_style);

				//this.setWorkspacePositionByScroller(scroller_style.left, scroller_style.top)
				this.setWorkspacePositionByScroller(
					$preview_scroller.offset().left - $preview_area.offset().left,
					$preview_scroller.offset().top - $preview_area.offset().top
				);

			} else {
				this.setWorkspacePositionByScroller(0, 0);
				$preview_scroller.hide();
				this.scrollerEnabled = false;
			}
		},
		/**
		 * Navigator 에서 드래그 할 때의 좌표를 이용해 workspace 영역을 이동
		 * @param  {number} left 드래깅 영역의 left 좌표
		 * @param  {number} top  드래깅 영역의 top 좌표
		 */
		setWorkspacePositionByScroller: function(left, top) {
			var $dom = $(this.dom);
			var $preview_wrapper = $('.preview-wrapper',$dom)
			var $preview_base =  $('.navigator-preview',$dom)
			var base_width  = $preview_wrapper.width();
			var base_height = $preview_wrapper.height();

			var workspace_size = NHIE.workspace.getSize();
			var scale = (workspace_size.scale / 100);
			var actual_workspace_size = {
				width: workspace_size.width * scale,
				height: workspace_size.height * scale
			};
			var nav_scale = actual_workspace_size.width / base_width;
			var win_coord = {
				left: left * nav_scale,
				top: top * nav_scale
			};
			var window_size = {
				width: $('.nhie-body .workspace').width(),
				height: $('.nhie-body .workspace').height()
			};

			var base_coord_offset = {
				left: (window_size.width - actual_workspace_size.width) / 2,
				top:  (window_size.height - actual_workspace_size.height) / 2
			};
			var workspace_position = {
				left: 0,
				top: 0
			};
			if (window_size.width < actual_workspace_size.width) {
				workspace_position.left = -win_coord.left - base_coord_offset.left;
			}
			if (window_size.height < actual_workspace_size.height) {
				workspace_position.top = -win_coord.top - base_coord_offset.top;
			}

			$('.workspace-contents-wrapper').css(workspace_position);
			NHIE.app.fireEvent('moveworkspace');
		},
		clear: function() {
			var $preview_wrapper = $(this.dom).find('.navigator-preview .preview-wrapper');
			$preview_wrapper.html('');
		}
	});

	return NHIE_Navigator;
});
