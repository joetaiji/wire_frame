define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',

	'text!resources/tpl/ui/property/ui-property-item-adjust-color.tpl.html'

], function(_, $, ToolBase, _propertyTpl) {

	var ATTR_ARR = ['color-r', 'color-g', 'color-b', 'brightness', 'contrast', 'hue', 'saturation'];

	/*
	 *	Fast HSL2RGB version 0.1
	 *
	 *	By Ken Fyrstenberg Nilsen
	 *	Abdias Software (C) 2013
	 *	http://abdiassoftware.com/
	 *
	 *	License: GPL-3.0
	*/
	function FastHSL2RGB(n){n=typeof n==="boolean"?n:!1;var m=this,p,d=n?2:4,e=1/d,j=360/d,l=256/d,k=l,b=new Array(j),q="onmessage=function(d){function k(x,D,z){var C,o,e,B,A;x/=360;if(D===0){C=o=e=z}else{function y(h,s,E){E%=1;if(E<0.1666667){return h+(s-h)*E*6}if(E<0.5){return s}if(E<0.6666667){return h+(s-h)*(0.6666667-E)*6}return h}B=z<0.5?z*(1+D):z+D-z*D;A=2*z-B;C=y(A,B,x+0.3333333);o=y(A,B,x);e=y(A,B,x-0.3333333)}b[a++]=C*255;b[a++]=o*255;b[a++]=e*255}var w=new Date().getTime(),f=parseInt(d.data,10),g=1/f,p=360/f,r=256/f,q=r,c=new ArrayBuffer(p*r*q*3),b=new Uint8ClampedArray(c),a=0,j=0,v,m,i,u,n=1/r,l=1/q;for(;j<p;j++){i=j*f;for(v=0;v<r;v++){u=v*n;for(m=0;m<q;m++){k(i,u,m*l)}}}var t={cube:c,time:(new Date().getTime()-w)};postMessage(t,[t.cube])};",o;m.time=-1;this.hsl2rgb=this.hsl2rgbHQ=i;if(typeof window.Array!=="undefined"&&typeof window.Worker!=="undefined"){try{p=new Worker(h());p.onmessage=function(u){clearTimeout(o);m.time=u.data.time;var t=new Uint8Array(u.data.cube),r=0;for(var w=0,v,x=1/k;w<j;w++){b[w]=new Array(l);for(var A=0,z;A<l;A++){b[w][A]=new Array(k);for(var y=0;y<k;y++){b[w][A][y]={r:t[r],g:t[r+1],b:t[r+2]};r+=3}}}m.hsl2rgb=g};o=setTimeout(f,d===2?8000:2000);p.postMessage(d);function f(){p.terminate();a()}}catch(c){a()}}else{a();m.hsl2rgb=g;m.time=0}function h(){var r=new Blob([q],{type:"text/javascript"});return window.URL.createObjectURL(r)}function g(r,u,t){r=((r%360)*e)|0;u=(63*u)|0%l;t=(63*t)|0%k;return b[r][u][t]}function i(v,B,x){var A,u,t,z,y;v/=360;if(B===0){A=u=t=x}else{function w(r,s,C){C%=1;if(C<0.1666667){return r+(s-r)*C*6}if(C<0.5){return s}if(C<0.6666667){return r+(s-r)*(0.6666667-C)*6}return r}z=x<0.5?x*(1+B):x+B-x*B;y=2*x-z;A=w(y,z,v+0.3333333);u=w(y,z,v);t=w(y,z,v-0.3333333)}return{r:(A*255+0.5)|0,g:(u*255+0.5)|0,b:(t*255+0.5)|0}}function a(){for(var t=0,r,u=1/k;t<j;t++){r=t*d;b[t]=new Array(l);for(var x=0,w;x<l;x++){w=x/l;b[t][x]=new Array(k);for(var v=0;v<k;v++){b[t][x][v]=i(r,w,v*u)}}}m.hsl2rgb=g;m.time=0}};
	var hsl_convert = new FastHSL2RGB(false, true);

	/**
	 * Converts an RGB color value to HSL. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and l in the set [0, 1].
	 *
	 * @param   Number  r       The red color value
	 * @param   Number  g       The green color value
	 * @param   Number  b       The blue color value
	 * @return  Array           The HSL representation
	 */
	function rgbToHsl(r, g, b){
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if(max == min){
			h = s = 0; // achromatic
		}else{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return {
			h:h,
			s:s,
			l:l
		};
	}

	/**
	 * Converts an HSL color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes h, s, and l are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 *
	 * @param   Number  h       The hue
	 * @param   Number  s       The saturation
	 * @param   Number  l       The lightness
	 * @return  Array           The RGB representation
	 */
	function hslToRgb(h, s, l){
		var r, g, b;

		if(s == 0){
			r = g = b = l; // achromatic
		}else{
			function hue2rgb(p, q, t){
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return {
			r:r*255,
			g:g*255,
			b:b*255
		};
	}



	return new ToolBase({
		name: 'adjust-color',
		type: 'toggle',
		iconCls:'fa fa-fw fa-adjust',
		propertyTpl: _propertyTpl,
		restoreBtnTitle: NHIE.Lang['PluginImageEditor_button_cancel'],

		handler: function($button, toggleStatus) {

		},
		enableStatus: function() {
			return !!(NHIE.workspace.getSelectedLayer() && !NHIE.workspace.getSelectedLayer().empty);
		},
		onRenderProperty: function($property) {
			this.$property = $property;
			var me = this;
			$('div[data-form-type=slider]', $property).slider({
				min: -100,
				max: 100,
				value: 0,
				step: 5,
				slide: function(e, ui) {
					var value = ui.value;
					var name = $(this).attr('data-name');
					$(this).parent().find('span.slider-value').text(value);
					me.color_info.values[name] = value;
				},
				stop: function(e, ui) {
					var value = ui.value;
					var name = $(this).attr('data-name');
					$(this).parent().find('span.slider-value').text(value);
					me.color_info.values[name] = value;
					me.adjustColor(name);
				}
			});
		},
		onShowProperty: function(data) {
			if(this.color_info) {
				this.onApplyProperty();
			}
			// 복구 정보 세팅
			if(NHIE.workspace.getSelectedLayer()) {
				var layer = NHIE.workspace.getSelectedLayer();
				this.color_info = {
					id: layer.id,
					data: layer.getCanvasImageData(),
					values:{}
				};
			}
			NHIE.propertyPanel.setPropertyContent('adjust-color', {});
		},
		onApplyProperty: function() {
			if(this.color_info) {
				var layer = NHIE.workspace.getLayerById(this.color_info.id);
				if(layer) {
					var apply_data = this.color_info.data;
					apply_data.data = layer.getCanvasImageData().data;
					layer.setCanvasContent(apply_data);
					NHIE.app.fireEvent('changecontent');

					this.color_info.data = layer.getCanvasImageData();
					this.color_info.values = {};
				}
				this.resetSliderValues();
			}
		},
		onRestoreProperty: function() {
			if(this.color_info) {
				var layer = NHIE.workspace.getLayerById(this.color_info.id);
				if(layer) {
					layer.setCanvasContent(this.color_info.data);
				}
				this.color_info.values = {};
				this.resetSliderValues();
			}
		},
		resetSliderValues: function() {
			$('div[data-form-type=slider]', this.$property).slider('value', 0);
			$('span.slider-value', this.$property).html('0');
		},
		adjustColor: function(name) {
			var color_info = this.color_info;

			_.each(ATTR_ARR, function(attr) {
				if(typeof color_info.values[attr] ==='undefined') {
					color_info.values[attr] = 0;
				}
				color_info.values[attr] = parseInt(color_info.values[attr]);
			});
			var val = function(name) {
				return color_info.values[name];
			};

			var layer = NHIE.workspace.getLayerById(color_info.id);
			if(layer) {

				console.log('adjust color : ', color_info)
				console.log('adjust color - hue: ', val('hue'))
				console.log('adjust color - saturation : ', val('saturation'))


				var $tmpCanvas = $('<canvas></canvas>');
				var tmpCanvas = $tmpCanvas.get(0);
				var canvas = layer.getCanvasElement();
				tmpCanvas.width = canvas.width;
				tmpCanvas.height = canvas.height;

				var targetImageData = tmpCanvas.getContext('2d').getImageData(0,0,canvas.width, canvas.height);
				var orgImageData = color_info.data.data;
				var org_data = orgImageData.data;
				var shown = false;
				for(var i = 0, len = org_data.length; i < len; i += 4) {
					var r = org_data[i + 0];
					var g = org_data[i + 1];
					var b = org_data[i + 2];
					var a = org_data[i + 3];

					// r/g/b 색상 조정
					r = val('color-r') / 100 * r + r;
					g = val('color-g') / 100 * g + g;
					b = val('color-b') / 100 * b + b;

					//  brightness 조정
					r = r + val('brightness');
					g = g + val('brightness');
					b = b + val('brightness');

					// contrast 조정
					var contrast = val('contrast') * 2.55;
					var factor = (255 + contrast) / (255.01 - contrast);
					r = factor * (r - 128) + 128;
					g = factor * (g - 128) + 128;
					b = factor * (b - 128) + 128;

					var color_HSL = rgbToHsl(r,g,b);
					//hue 조정
					color_HSL.h -= val('hue') / 360;
					if(color_HSL.h>1) color_HSL.h=1;
					if(color_HSL.h<-1) color_HSL.h=-1;
					//saturation 조정
					color_HSL.s += val('saturation') / 200;
					if(color_HSL.s>1) color_HSL.s=1;
					if(color_HSL.s<0) color_HSL.s=0;

					var color_RGB = hslToRgb(color_HSL.h, color_HSL.s, color_HSL.l);

					r = color_RGB.r;
					g = color_RGB.g;
					b = color_RGB.b;

					// 최종 결과물 세팅
					targetImageData.data[i + 0] = r;
					targetImageData.data[i + 1] = g;
					targetImageData.data[i + 2] = b;
					targetImageData.data[i + 3] = a;
				}

 				layer.setCanvasContent({
					data: targetImageData,
					style: color_info.data.style,
					skipCache: true
				});

				$tmpCanvas.remove();
			}
		}
	});
});
