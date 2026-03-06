define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',

	'text!resources/tpl/ui/property/ui-property-item-apply-filter.tpl.html'

], function(_, $, ToolBase, _propertyTpl) {



	var NHIE_FILTERS = [{
		id: 'filter-original',
		name: 'original',
		src: 'resources/images/filters/filter-original.png',
		doFilter: function() {
			this.onRestoreProperty();
		}
	},{
		id: 'filter-beautify',
		name: 'beautify',
		src: 'resources/images/filters/filter-beautify.png',
		fn: function(r, g, b, a, factor, i) {

			var brightness = 10;
			r = r + brightness;
			g = g + brightness;
			b = b + brightness;

			var contrast = 10 * 2.55;
			var factor = (255 + contrast) / (255.01 - contrast);
			r = factor * (r - 128) + 128;
			g = factor * (g - 128) + 128;
			b = factor * (b - 128) + 128;

			return [r, g, b, a];
		},

		doFilter: function(input) {
			var org_data = input.data;
			for(var i = 0, len = org_data.length; i < len; i += 4) {
				var r = org_data[i + 0];
				var g = org_data[i + 1];
				var b = org_data[i + 2];
				var a = org_data[i + 3];
			}
		}
	},{
		id: 'filter-grayscale',
		name: 'grayscale',
		src: 'resources/images/filters/filter-grayscale.png',
		fn: function(r, g, b, a, factor, i) {
			var avg = 0.3 * r + 0.59 * g + 0.11 * b;
			return [avg, avg, avg];
		}
	},{
		id: 'filter-sepia',
		name: 'sepia',
		src: 'resources/images/filters/filter-sepia.png',
		fn: function(r, g, b, a, factor, i) {
			var avg = 0.3 * r + 0.59 * g + 0.11 * b;
			return [avg+100, avg+50, avg];
		}
	},{
		id: 'filter-blur',
		name: 'blur',
		src: 'resources/images/filters/filter-blur.png',
		matrix: [
			1/9, 1/9, 1/9,
			1/9, 1/9, 1/9,
			1/9, 1/9, 1/9
		]
	},{
		id: 'filter-sharpen',
		name: 'sharpen',
		src: 'resources/images/filters/filter-sharpen.png',
		matrix: [
			0, -1,  0,
			-1,  5, -1,
			0, -1,  0
		]
	},{
		id: 'filter-edge',
		name: 'edge',
		src: 'resources/images/filters/filter-outline.png',
		matrix: [
			1, 1, 1,
			1,-7, 1,
			1, 1, 1
		]
	},{
		id: 'filter-bevel',
		name: 'bevel',
		src: 'resources/images/filters/filter-bevel.png',
		//matrix: []
		doFilter: function(input) {
			var matrixH = [-1,-2,-1,
				0, 0, 0,
				1, 2, 1];
			var matrixV = [-1, 0, 1,
				-2, 0, 2,
				-1, 0, 1];

			var width = input.width, height = input.height;
			var inputData = input.data;
			var outputData = [];
			for (var y = 0; y < height; y++) {
				for (var x = 0; x < width; x++) {
					var pixel = (y*width + x)*4;
					var rh = 0; gh = 0; bh = 0;
					var rv = 0; gv = 0; bv = 0;
					for(var row = -1; row <= 1; row++){
						var iy = y+row;
						var ioffset;
						if(iy >= 0 && iy < height){
							ioffset = iy*width*4;
						} else {
							ioffset = y*width*4;
						}
						var moffset = 3*(row+1)+1;
						for(var col = -1; col <= 1; col++){
							var ix = x+col;
							if(!(ix >= 0 && ix < width)){
								ix = x;
							}
							ix *= 4	;
							var r = inputData[ioffset+ix];
							var g = inputData[ioffset+ix+1];
							var b = inputData[ioffset+ix+2];
							var h = matrixH[moffset+col];
							var v = matrixV[moffset+col];
							rh += parseInt(h*r);
							bh += parseInt(h*g);
							gh += parseInt(h*b);
							rv += parseInt(v*r);
							gv += parseInt(v*g);
							bv += parseInt(v*b);
						}
					}
					r = parseInt(Math.sqrt(rh*rh + rv*rv) / 1.8);
					g = parseInt(Math.sqrt(gh*gh + gv*gv) / 1.8);
					b = parseInt(Math.sqrt(bh*bh + bv*bv) / 1.8);

					outputData[pixel] = r;
					outputData[pixel+1] = g;
					outputData[pixel+2] = b;
					outputData[pixel+3] = inputData[pixel+3];
				}
			}
			for(var k = 0; k < outputData.length; k++){
				inputData[k] = outputData[k];
			}

			return input;
		}
	},{
		id: 'filter-emboss',
		name: 'emboss',
		src: 'resources/images/filters/filter-emboss.png',
		matrix: [
			3, 0, 0,
			0,-1, 0,
			0, 0,-1
		]
	},{
		id: 'filter-fog_glass',
		name: 'fog_glass',
		src: 'resources/images/filters/filter-fog_glass.png',
		doFilter:function(imageData, cfg) {
			var radius = cfg.radius || 3 ;

			var scale = 10;

			var sinTable = [];
			var cosTable = [];
			for(var i = 0; i < 256; i++){
				var angle = Math.PI*2*i/256;
				sinTable[i] = scale*Math.sin(angle);
				cosTable[i] = scale*Math.cos(angle);
			}
			transInverse = function (x,y,out){
				var angle = parseInt(Math.random() * 255);
				var distance = Math.random();
				out[0] = x + distance * sinTable[angle];
				out[1] = y + distance * cosTable[angle];
		  	}

			doFilterFn(imageData, transInverse);

			return imageData ;
		}
	}

/*

	,{
		id: 'filter-waterly',
		name: 'waterly',
		src: 'resources/images/filters/filter-waterly.png',
		matrix:[],
		doFilter: function(imgData, cfg) {
			var width = imgData.width;
			var height = imgData.height;
			var outputData = [];
			var inputData = imgData.data;

			var density = cfg.density || 0.7;
			var size = cfg.size || 6;
			var mix = cfg.mix || 0.5;
			var radius = size+1;
			var radius2 = radius*radius;
			var numShapes = parseInt(2*density/30*width*height / 2);

			var linearInterpolate = function(t,a,b){
				return a + t * (b-a);
			};
			var mixColors = function(t, rgb1, rgb2){
				var r = linearInterpolate(t,rgb1[0],rgb2[0]);
				var g = linearInterpolate(t,rgb1[1],rgb2[1]);
				var b = linearInterpolate(t,rgb1[2],rgb2[2]);
				var a = linearInterpolate(t,rgb1[3],rgb2[3]);
				return [r,g,b,a];
			};

			for(var i = 0; i < numShapes; i++){
				var sx = (Math.random()*Math.pow(2,32) & 0x7fffffff) % width;
				var sy = (Math.random()*Math.pow(2,32) & 0x7fffffff) % height;
				var rgb2 = [inputData[(sy*width+sx)*4],inputData[(sy*width+sx)*4+1],inputData[(sy*width+sx)*4+2],inputData[(sy*width+sx)*4+3]];
				for(var x = sx - radius; x < sx + radius + 1; x++){
					for(var y = sy - radius; y < sy + radius + 1; y++){
						var f = (x - sx) * (x - sx) + (y - sy) * (y - sy);
						if (x >= 0 && x < width && y >= 0 && y < height && f <= radius2) {
							var rgb1 = [outputData[(y*width+x)*4],outputData[(y*width+x)*4+1],outputData[(y*width+x)*4+2],outputData[(y*width+x)*4+3]];
							var mixedRGB = mixColors(mix,rgb1,rgb2)
							for(var k = 0; k < 3; k++){
								outputData[(y*width+x)*4+k] = mixedRGB[k];
							}
						}
					}
				}
			}
			for(var i=0; i<outputData.length; i++) {
				imgData.data[i] = outputData[i];
			}

			return imgData ;

		}
	},{
		id: 'filter-diffuse',
		name: 'diffuse',
		src: 'resources/images/filters/filter-diffuse.png',
		matrix: []

	}

*/
];

	var doFilterFn = function(imgData, transformfn) {
		var temp_canvas= $('<canvas></canvas>').get(0);
		var width = temp_canvas.width = imgData.width;
		var height = temp_canvas.height = imgData.height;
		var inputData = imgData.data;
		var out = [];
		temp_canvas.getContext('2d').putImageData(imgData, 0, 0);


		var getPixel = function (pixels,x,y,width,height){
			var pix = (y*width + x)*4;
			if (x < 0 || x >= width || y < 0 || y >= height) {
				return [pixels[((clampPixel(y, 0, height-1) * width) + clampPixel(x, 0, width-1))*4],
				pixels[((clampPixel(y, 0, height-1) * width) + clampPixel(x, 0, width-1))*4 + 1],
				pixels[((clampPixel(y, 0, height-1) * width) + clampPixel(x, 0, width-1))*4 + 2],
				pixels[((clampPixel(y, 0, height-1) * width) + clampPixel(x, 0, width-1))*4 + 3]];
			}
			return [pixels[pix],pixels[pix+1],pixels[pix+2],pixels[pix+3]];
		};
		var clampPixel = function (x,a,b){
			return (x < a) ? a : (x > b) ? b : x;
		}

		var bilinearInterpolate = function (x,y,nw,ne,sw,se){
			var m0, m1;
			var r0 = nw[0]; var g0 = nw[1]; var b0 = nw[2]; var a0 = nw[3];
			var r1 = ne[0]; var g1 = ne[1]; var b1 = ne[2]; var a1 = ne[3];
			var r2 = sw[0]; var g2 = sw[1]; var b2 = sw[2]; var a2 = sw[3];
			var r3 = se[0]; var g3 = se[1]; var b3 = se[2]; var a3 = se[3];
			var cx = 1.0 - x; var cy = 1.0 - y;

			m0 = cx * a0 + x * a1;
			m1 = cx * a2 + x * a3;
			var a = cy * m0 + y * m1;

			m0 = cx * r0 + x * r1;
			m1 = cx * r2 + x * r3;
			var r = cy * m0 + y * m1;

			m0 = cx * g0 + x * g1;
			m1 = cx * g2 + x * g3;
			var g = cy * m0 + y * m1;

			m0 = cx * b0 + x * b1;
			m1 = cx * b2 + x * b3;
			var b =cy * m0 + y * m1;
			return [r,g,b,a];
		};

		var outputData = temp_canvas.getContext('2d').getImageData(0,0, width, height).data;

		for(var y=0;y<height; y++) {
			for(var x=0;x<width;x++) {
				var pixel = (y * width + x) * 4;
				transformfn(x, y, out);

				var srcX = Math.floor(out[0]);
				var srcY = Math.floor(out[1]);

				var xWeight = out[0] - srcX;
				var yWeight = out[1] - srcY;

				var nw, ne, sw, se;

				if(srcX >= 0 && srcX < width-1 && srcY >= 0 && srcY < height-1){
					var i = (width*srcY + srcX)*4;
					nw = [inputData[i],inputData[i+1],inputData[i+2],inputData[i+3]];
					ne = [inputData[i+4],inputData[i+5],inputData[i+6],inputData[i+7]];
					sw = [inputData[i+width*4],inputData[i+width*4+1],inputData[i+width*4+2],inputData[i+width*4+3]];
					se = [inputData[i+(width + 1)*4],inputData[i+(width + 1)*4+1],inputData[i+(width + 1)*4+2],inputData[i+(width + 1)*4+3]];
				} else {
					nw = getPixel( inputData, srcX, srcY, width, height );
					ne = getPixel( inputData, srcX+1, srcY, width, height );
					sw = getPixel( inputData, srcX, srcY+1, width, height );
					se = getPixel( inputData, srcX+1, srcY+1, width, height );
				}

				var rgba = bilinearInterpolate(xWeight,yWeight,nw,ne,sw,se);
				outputData[pixel] = rgba[0];
				outputData[pixel + 1] = rgba[1];
				outputData[pixel + 2] = rgba[2];
				outputData[pixel + 3] = rgba[3];
			}
		}
		for(var i=0; i<outputData.length; i++) {
			imgData.data[i] = outputData[i];
		}
	};

	var transform = function(layer, fn, factor) {
		var canvas = layer.getCanvasElement();
		var ctx = canvas.getContext('2d');
		var imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
		var data = imgData.data;
		var res = [];
		var len = data.length;

		for(var i = 0; i < len; i += 4) {
			res = fn.call(this,  data[i], data[i + 1], data[i + 2], data[i + 3], factor, i);

			data[i]     = res[0]; // red
			data[i + 1] = res[1]; // green
			data[i + 2] = res[2]; // blue
			if(typeof res[3] !== 'undefined') {
				data[i + 3] = res[3]; // alpha
			}
		}

		ctx.putImageData(imgData, 0, 0);
		return imgData;

	} ;

	var convolute = function(layer, weights, opaque) {

		var side = Math.round(Math.sqrt(weights.length));
		var halfSide = Math.floor(side/2);

		var canvas = layer.getCanvasElement();
		var ctx = canvas.getContext('2d');
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		var src = imageData.data;
		var sw = imageData.width;
		var sh = imageData.height;
		// pad output by the convolution matrix
		var w = sw;
		var h = sh;

		var tmpCanvas = document.createElement('canvas');
		var tmpCtx = tmpCanvas.getContext('2d');
		tmpCtx.clearRect( 0, 0, w, h );
		var output = tmpCtx.createImageData(w, h);

		var dst = output.data;
		// go through the destination image pixels
		var alphaFac = opaque ? 1 : 0;
		for (var y=0; y<h; y++) {
			for (var x=0; x<w; x++) {
				var sy = y;
				var sx = x;
				var dstOff = (y*w+x)*4;
				// calculate the weighed sum of the source image pixels that
				// fall under the convolution matrix
				var r=0, g=0, b=0, a=0;
				for (var cy=0; cy<side; cy++) {
					for (var cx=0; cx<side; cx++) {
						var scy = sy + cy - halfSide;
						var scx = sx + cx - halfSide;
						if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
							var srcOff = (scy*sw+scx)*4;
							var wt = weights[cy*side+cx];
							r += src[srcOff] * wt;
							g += src[srcOff+1] * wt;
							b += src[srcOff+2] * wt;
							a += src[srcOff+3] * wt;
						}
					}
				}
				dst[dstOff] = r;
				dst[dstOff+1] = g;
				dst[dstOff+2] = b;
				dst[dstOff+3] = a + alphaFac*(255-a);
			}
		}
		ctx.putImageData(output,0,0);
	}

	return new ToolBase({
		name: 'apply-filter',
		type: 'toggle',
		iconCls:'fa fa-fw fa-image',
		propertyTpl: _propertyTpl,
		restoreBtnTitle: NHIE.Lang['PluginImageEditor_button_cancel'],

		handler: function($button, toggleStatus) {
			//console.log('handle - filter', $button, toggleStatus, this.filter_info)
			if(toggleStatus === false) {
				var layer = NHIE.workspace.getSelectedLayer();
				if(layer && this.filter_info && this.filter_info.modified) {
					this.onApplyProperty();
				}
			}
		},
		enableStatus: function() {
			return !!(NHIE.workspace.getSelectedLayer() && !NHIE.workspace.getSelectedLayer().empty);
		},
		onShowProperty: function(data) {
			if(this.filter_info) {
				//this.onApplyProperty();
			}

			// 복구 정보 세팅
			if(NHIE.workspace.getSelectedLayer()) {
				var layer = NHIE.workspace.getSelectedLayer();
				this.filter_info = {
					id: layer.id,
					data: layer.getCanvasImageData()
				};
			}

			var data = {};
			data.items = NHIE_FILTERS;
			NHIE.propertyPanel.setPropertyContent(this.name, data);
		},
		onRenderProperty: function($property) {
			var me = this;
			var $list = $property.find('ul.list-items');
			$list.mCustomScrollbar();
			$list.find('li.list-item').on('mouseenter', function() {
				$list.find('li.list-item').removeClass('hover');
				$(this).addClass('hover');
			}).on('mouseleave',function(){
				$list.find('li.list-item').removeClass('hover');
			}).on('click',function(){
				$list.find('li.list-item').removeClass('selected');
				$(this).addClass('selected');
				var id = $(this).attr('data-item-id');
				me.applyFilter(id);
			});

		},
		onApplyProperty: function() {
			if(this.filter_info) {
				var layer = NHIE.workspace.getLayerById(this.filter_info.id);
				if(layer) {
					var apply_data = this.filter_info.data;
					apply_data.data = layer.getCanvasImageData().data;
					layer.setCanvasContent(apply_data);
					NHIE.app.fireEvent('changecontent');

					this.filter_info.data = apply_data;
				}
			}
		},

		onRestoreProperty: function() {
			if(this.filter_info) {
				var layer = NHIE.workspace.getLayerById(this.filter_info.id);
				if(layer) {
					layer.setCanvasContent(this.filter_info.data);
				}
			}
		},

		getSelectedItem: function(id) {
			var items = NHIE_FILTERS;
			var index = _.findIndex(items, {id:id});
			if(index>-1) {
				return items[index];
			}
		},
		applyFilter: function(id) {
			NHIE.app.loading(true)

			if(id!=='filter-original') {
				this.filter_info.modified = true;
			} else {
				this.filter_info.modified = false;
			}
			var filter = this.getSelectedItem(id);
			if(filter &&  NHIE.workspace.getSelectedLayer()) {
				var layer = NHIE.workspace.getSelectedLayer();
				if (typeof filter.fn === 'function') {
					transform(layer, filter.fn);
				} else if (typeof filter.matrix !== 'undefined' && filter.matrix.length) {
					convolute(layer, filter.matrix);
				} else if (typeof filter.doFilter === 'function') {
					var canvas =  layer.getCanvasElement();
					var context = canvas.getContext('2d');
					var imgData = context.getImageData(0,0,canvas.width, canvas.height);
					var newImgData = filter.doFilter.apply(this, [imgData, {}]);
					if(newImgData) {
						context.putImageData(newImgData, 0, 0);
					}
				}
			}
			NHIE.app.loading(false)

		}
	});
});
