define([
	'jquery',
	'underscore',

	'app/lib/cache',
	'app/lib/lang',
	'app/lib/promise',

	'text!app/app.config.json',

], function($, _, _cache, lang, Promise, _cfgText) {

	var tmplFn = function(name) {
		if (!_cache.get('template', name)) {
			_cache.set('template', name, _.template(name));
		}
		return _cache.get('template', name);
	};
	var tmpl = function(name, data) {
		if (typeof data.lang === 'undefined') {
			data.NHIE_Lang = NHIE.Lang;
		}
		return (tmplFn(name))(data);
	};

	var requirePromise = function(arr) {
		var p = new Promise(function(resolve, reject) {
			try {
				require(arr, function() {
					var result = [];
					_.each(arguments, function(value) {
						result.push(value);
					});
					resolve(result);
				});
			} catch (e) {
				reject(e);
			}
		});
		return p;
	};

	var CANVAS_CACHE_GROUP_ID = 'canvas_cache';
	var util = {
		parseRequest: function() {
			var match,
				pl     = /\+/g,  // Regex for replacing addition symbol with a space
				search = /([^&=]+)=?([^&]*)/g,
				decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
				query  = window.location.search.substring(1);

				urlParams = {};
				while (match = search.exec(query))
				urlParams[decode(match[1])] = decode(match[2]);

			return urlParams;
		},
		getImage: function(src) {
			var loadImgPromise = new Promise(function(resolve, reject) {
				var $img = $('<img style="width:30px;height:30px; crossorigin="anonymous"/>');
				$img.on('load', function() {
					resolve($img.get(0));
				}).on('error', function(e) {
					NHIE.app.loading(false);
					console.error(e);
					reject(e);
				});
				$img.attr('src', src);
			});
			return loadImgPromise;
		},

		canvasCache: {
			set: function(canvas) {
				var layer_id = canvas.id;
				var layer = NHIE.workspace.getLayerById(layer_id);
				var _idx = 0, id= '';
				if(layer.empty) {
					id = '_CACHE::empty_canvas';
				} else {
					do {
						id = '_CACHE::' + layer_id + '$' + (_idx++);
					} while(_cache.get(CANVAS_CACHE_GROUP_ID, id));
				}

				var ctx = canvas.getContext('2d');
				_cache.set(CANVAS_CACHE_GROUP_ID, id, {
					width: canvas.width,
					height: canvas.height,
					data: ctx.getImageData(0,0,canvas.width, canvas.height)
				});
				$(canvas).attr('data-canvascache-id', id)
			},
			get: function(id) {
				return _cache.get(CANVAS_CACHE_GROUP_ID, id);
			}
		},
		canvasManager: {
			resetImageData: function(canvas) {
				var $canvas = $(canvas);
				var canvascache_id = $canvas.attr('data-canvascache-id');
				if(canvascache_id && util.canvasCache.get(canvascache_id)) {

					// 이미지 데이터를 임시 canvas 에 세팅
					var cachedData = util.canvasCache.get(canvascache_id);
					var $tempCanvas = $('<canvas></canvas>');
					var _canvas = $tempCanvas.get(0);
					_canvas.width = cachedData.width;
					_canvas.height = cachedData.height;
					var _ctx = _canvas.getContext('2d');
					_ctx.putImageData(cachedData.data, 0, 0);

					var canvasModifyData = NHIE.lib.util.canvasManager.getCanvasModifyData(canvas);
					var scale = {
						x: canvasModifyData.flip.h ? -1: 1,
						y: canvasModifyData.flip.v ? -1: 1
					};
					var newCanvasSize = {
						width: cachedData.width,
						height: cachedData.height
					};

					if(canvasModifyData.rotate % 180) {
						newCanvasSize = {
							width: cachedData.height,
							height: cachedData.width
						};
					}
					canvas.height = newCanvasSize.height;
					canvas.width = newCanvasSize.width;

					var ctx = canvas.getContext('2d');
					ctx.save();
					ctx.scale(scale.x, scale.y);
					ctx.translate(canvas.width / 2 * scale.x, canvas.height / 2 * scale.y);
					// 상하 / 좌우 반전 후 회전 동작시에도 일반적인 회전과 동일하게 보이도록
					ctx.rotate(canvasModifyData.rotate / 180 * Math.PI * (scale.x * scale.y));
					ctx.drawImage(
						_canvas,
						_canvas.width / -2 * scale.x,
						_canvas.height / -2 * scale.y,
						_canvas.width * scale.x,
						_canvas.height * scale.y
					);
					ctx.restore();
					$tempCanvas.remove();
				}
			},
			getCanvasModifyData: function(canvas) {
				var $canvas = $(canvas);
				var $canvasWrapper = $(canvas).parent();
				return {
					rotate: parseInt($canvasWrapper.attr('data-modify-rotate') || '0'),
					flip: JSON.parse($canvasWrapper.attr('data-modify-flip') || '{"h":false,"v":false}')
				};
			},
			cropCanvas: function(canvas) {
				var ctx = canvas.getContext('2d');
				var w = canvas.width,
				h = canvas.height,
				pix = {x:[], y:[]},
				imageData = ctx.getImageData(0,0,canvas.width,canvas.height),
				x, y, index;

				console.log(w,h)
				if (!w || !h) {
					return {};
				}

				var pix_x = [], pix_y = [];
				for (y = 0; y < h; y++) {
					for (x = 0; x < w; x++) {
						index = (y * w + x) * 4;
						if (imageData.data[index+3] > 0) {
							pix_x.push(x);
							pix_y.push(y);
						}
					}
				}

				pix_x.sort(function(a,b){return a-b});
				pix_y.sort(function(a,b){return a-b});
				var n = pix_x.length-1;

				w = pix_x[n] - pix_x[0];
				h = pix_y[n] - pix_y[0];

				var cropOffset = {
					x:pix_x[0] -1,
					y:pix_y[0] -1,
					w: w +2,
					h: h +2
				};
				if(isNaN(cropOffset.w) ||isNaN(cropOffset.h) ||isNaN(cropOffset.x) ||isNaN(cropOffset.y)) {
					return {};
				}
				var cut = ctx.getImageData(cropOffset.x, cropOffset.y, cropOffset.w, cropOffset.h);

				canvas.width = cropOffset.w;
				canvas.height = cropOffset.h;
				ctx.putImageData(cut, 0, 0);

				return cropOffset;
			}

		},
		getConfig: function(key) {
			key = key || '';
			var CONFIG_BASE = {};
			if(typeof NHIE !== 'undefined') {
				CONFIG_BASE = NHIE.config;
			} else {
				try{
					CONFIG_BASE = JSON.parse(_cfgText);
				} catch(e) {
				}
			}

			var arr = key.split('.');
			var value = null;
			if (arr && arr.length) {
				try{
					value = CONFIG_BASE;
					for(var i = 0, len = arr.length; i < len; i++) {
						if (typeof value[arr[i]] !== 'undefined') {
							value = value[arr[i]];
						} else {
							return null;
						}
					}
				} catch(e) {
					return null;
				}
				if(typeof value !== 'undefined') {
					return value;
				}
			}
		},
		rotatePoint: function(d,x,y,ox,oy){
			var __d2p = function(d){
				return d/180*Math.PI;
			};
			ox=ox||0;oy=oy||0;
			return{
				x:(ox+(x-ox)*Math.cos(__d2p(d))-(y-oy)*Math.sin(__d2p(d))),
				y:(oy+(y-oy)*Math.cos(__d2p(d))+(x-ox)*Math.sin(__d2p(d)))
			};
		},

		getEventTargetLayer : function(e) {
			var $target = $(e.target);
			var targetLayer = null;
			var layer_id = null;
			if($target.hasClass('tracker-handle')) {
				var $tracker = $target.parent();
				layer_id = $tracker.attr('data-target-layer-id');
			} else if($target.hasClass('layer-resizer')) {
				layer_id = $target.attr('data-target-layer-id');
			} else if($target.hasClass('layer-canvas')) {
				layer_id = $target.attr('id');
			} else if($target.hasClass('layer')) {
				layer_id = $target.find('canvas').attr('id');
			}
			return NHIE.workspace.getLayerById(layer_id);
		},
		spinner: function($dom, isloading, cfg) {
			if(isloading!==false) {
				cfg = cfg || {};
				cfg.color = cfg.color || '#000';
				cfg.size = cfg.size || 'small';

				if(!$dom.find('.ui-panel-mask').length) {
					var $mask = $('<div class="ui-spinner-mask"></div>');
					var $spinner = $('<div class="spinner spinner-'+ cfg.size + '"></div>');
					for(var i=0;i < 12;i++) {
						var $spinner_stick = $('<div class="spinner-stick spinner-stick-'+i+'"></div>');
						$spinner_stick.css({
							transform: 'rotate('+(30*i)+'deg)',
							animationDelay: (-1.2+0.1*i)+'s',
							backgroundColor: cfg.color
						})
						$spinner.append($spinner_stick);
					}
					$spinner.css({
						width: 40,
						height: 40,
						marginLeft: -20,
						marginTop: -20
					});
					$mask.append($spinner);
					$dom.append($mask);
				}

			} else {
				$dom.find('.ui-spinner-mask').remove();
			}

		}
	};

	var agentInfo = (function() {
		var uat = navigator.userAgent.toLowerCase();

		//ie11체크 때문에 추가
		var re  = new RegExp("trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
	    if (re.exec(uat) != null)
	    var rv = parseFloat( RegExp.$1 );

		return {
			IsIE : /*@cc_on!@*/false,
			IsIE6 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 6),
			IsIE7 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 7),
			IsIE8 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 8),
			IsIE9 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 9),
			IsIE10 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 10),
			IsIE11 : (!uat.match(/msie (\d+)/) && ((uat.indexOf('trident') > 0) && (parseInt(uat.match(/trident\/(\d+)/)[1], 10) >= 7))) || rv == 11,
			IsGecko : /gecko\//.test(uat),
			IsOpera : !!window.opera,
			IsSafari : /applewebkit\//.test(uat) && !/chrome\//.test(uat),
			IsChrome : /applewebkit\//.test(uat) && /chrome\//.test(uat),
			IsEdge : /applewebkit\//.test(uat) && /chrome\//.test(uat) && /edge\//.test(uat),
			IsMac  : /macintosh/.test(uat),
			IsIOS5 : /(ipad|iphone)/.test(uat) && uat.match(/applewebkit\/(\d*)/)[1] >= 534 && uat.match(/applewebkit\/(\d*)/)[1] < 536,
			IsIOS6 : /(ipad|iphone)/.test(uat) && uat.match(/applewebkit\/(\d*)/)[1] >= 536
		};
	})();

	var agentVersion = (function() {
		var uat = navigator.userAgent.toLowerCase();
		var uat_version = "";

		// String.prototype.Trim
		var trimString = function(str) {
			return str.replace(/(^\s*)|(\s*$)/g, '');
		};

		if (agentInfo.IsIE) {
			uat_version = parseInt(uat.match(/msie (\d+)/)[1], 10);
			if (uat_version >= 9 && parent.document.compatMode != "CSS1Compat")
				uat_version = 8;
		} else if (agentInfo.IsGecko) {
			uat_version = uat.substring(uat.indexOf("firefox/") + 8);
		} else if (agentInfo.IsOpera) {
			if (uat.indexOf("version/") != -1) {
				uat_version = trimString(uat.substring(uat.indexOf("version/") + 8));
			} else {
				uat_version = trimString(uat.substring(0, uat.indexOf("(")).replace("opera/", ""));
			}
		} else if (agentInfo.IsIOS5) {
			uat_version = uat.match(/applewebkit\/(\d*)/)[1];
		} else if (agentInfo.IsSafari) {
			uat_version = uat.match(/version\/([\d|.]*)/i)[1];
		} else if (agentInfo.IsChrome) {
			uat_version = parseInt(uat.substring(uat.indexOf("safari/") + 7));
		}

		return String(uat_version);
	})();

	var OSInfo = (function() {
		var uat = navigator.userAgent.toLowerCase();

		if(uat.indexOf("linux") != -1)
			return "Linux";
		else if(agentInfo.IsIOS5)
			return "IOS5";
		else if(uat.indexOf("macintosh") != -1)
			return "Macintosh";
		else if(uat.indexOf("nt 6.0") != -1)
			return "Windows Vista/Server 2008";
		else if(uat.indexOf("nt 5.2") != -1)
			return "Windows Server 2003";
		else if(uat.indexOf("nt 5.1") != -1)
			return "Windows XP";
		else if(uat.indexOf("nt 5.0") != -1)
			return "Windows 2000";
		else if(uat.indexOf("nt") != -1)
			return "Windows NT";
		else if(uat.indexOf("9x 4.90") != -1)
			return "Windows Me";
		else if(uat.indexOf("98") != -1)
			return "Windows 98";
		else if(uat.indexOf("95") != -1)
			return "Windows 95";
		else if(uat.indexOf("win16") != -1)
			return "Windows 3.x";
		else if(uat.indexOf("windows") != -1)
			return "Windows";
		else
			return "";
	})();

	var err = {
		ERR_NO_IMAGE: 'ERR_NO_IMAGE',
		ERR_FILE_SIZE_LIMIT: 'ERR_FILE_SIZE_LIMIT',
		ERR_NO_FILE_SELECTED: 'ERR_NO_FILE_SELECTED'
	};

	return {
		err: err,
		useragent:{
			info: agentInfo,
			version: agentVersion,
			os: OSInfo
		},
		cache: _cache,
		requirePromise: requirePromise,
		lang: lang,
		tmpl: tmpl,
		Promise: Promise,
		util: util
	};
});
