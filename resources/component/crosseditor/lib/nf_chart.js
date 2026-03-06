/*Copyright (c) 2013 NTS Corp. All Rights Reserved.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
/*Developed by Insook Choe (choe.insook@nhn.com), Inho Jung(inho.jung@nhn.com)*/
(function(){
var $= ce$;
var CONST_SVG_URL = 'http://www.w3.org/2000/svg';
var VML_NAME_SPACE = 'urn:schemas-microsoft-com:vml'
var CONST_MAX_RADIUS = 100;
var CONST_DECREMENT = 20;
var CPS_CHART_IMPORT_MODE= (typeof ItemManager==='undefined')?'viewer':ItemManager.importMode;
var CPS_CHART_DATA_URL='http://localhost:8080/CPS/test/chartTest.jsp';
var ARR_DEFAULT_COLORSET = [
	'rgba(81,167,249,1 )', 'rgba(112,191,65,1 )', 'rgba(245,211,40,1 )', 'rgba(243,144,25,1 )', 'rgba(236,93,87,1  )',
	'rgba(179,106,226,1)', 'rgba(3,101,192,1  )', 'rgba(0,136,43,1   )', 'rgba(220,189,35,1 )', 'rgba(222,106,16,1 )',
	'rgba(200,37,6,1   )', 'rgba(119,63,155,1 )', 'rgba(22,79,134,1  )', 'rgba(11,93,24,1   )', 'rgba(195,151,26,1 )',
	'rgba(189,91,12,1  )', 'rgba(134,16,1,1   )', 'rgba(95,50,124,1  )', 'rgba(0,36,82,1    )', 'rgba(5,65,9,1     )',
	'rgba(163,117,18,1 )', 'rgba(146,70,7,1   )', 'rgba(87,7,6,1     )', 'rgba(59,31,78,1   )', 'rgba(250,250,250,1)',
	'rgba(220,222,224,1)', 'rgba(166,170,169,1)', 'rgba(83,88,95,1   )', 'rgba(66,66,70,1   )', 'rgba(0,0,0,1      )'
];
var getChartParentDiv = function(parentDiv){
	if(typeof parentDiv==='string'){
		return document.getElementById(parentDiv);
	} else {
		return parentDiv;
	}
}
// getChartParentDiv(parentDiv);

var DelayedTask = function(fn, scope, args, cancelOnDelay) {
    var me = this,
    delay,
    call = function() {
        clearInterval(me.id);
        me.id = null;
        fn.apply(scope, args || []);
    };

    cancelOnDelay = typeof cancelOnDelay === 'boolean' ? cancelOnDelay : true;
    me.id = null;
    me.delay = function(newDelay, newFn, newScope, newArgs) {
        if (cancelOnDelay) {
            me.cancel();
        }
        if (typeof newDelay === 'number') {
            delay = newDelay;
        }
        fn    = newFn    || fn;
        scope = newScope || scope;
        args  = newArgs  || args;
        if (!me.id) {
            me.id = setInterval(call, delay);
        }
    };
    me.cancel = function() {
        if (me.id) {
            clearInterval(me.id);
            me.id = null;
        }
    };
};


var Nwagon = {

    chart: function(options,callback){
        var isIE_old = false;
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { //test for MSIE x.x;
            var ieversion = new Number(RegExp.$1); // capture x.x portion and store as a number
            if (ieversion <= 8){
/*
                isIE_old = true;
                if(!document.namespaces['v']) {
                   document.namespaces.add('v', VML_NAME_SPACE);
                }
*/
            }

        }
        var chartObj = new Object();
        chartObj.chartType = options['chartType'];
        chartObj.dataset = options['dataset']||{};
        chartObj.legend = options['legend'];
        chartObj.width = options['chartSize']['width'];
        chartObj.height = options['chartSize']['height'];
        chartObj.chart_div = options['chartDiv'];
        chartObj.legendSize = options['legendSize'];


		if(!chartObj.dataset.colorset){
			chartObj.dataset.colorset = [];
		}
		if(!chartObj.dataset.legend){
			chartObj.dataset.legend = {};
		}
		//chartObj.dataset.colorset = chartObj.dataset.colorset.concat(ARR_DEFAULT_COLORSET);
		if (typeof options['maxValue']!=='undefined') chartObj.highest = options['maxValue'];
		if (typeof options['minValue']!=='undefined') chartObj.lowest = options['minValue'];
		if (typeof options['increment']!=='undefined') chartObj.increment = options['increment'];
		var values = chartObj.dataset.values;
		var max = chartObj.highest ? chartObj.highest : Nwagon.getMax(values);
		var min = typeof chartObj.lowest!=='undefined' ? chartObj.lowest : Nwagon.getMin(values);
		if(min===Infinity)min=0;
		var increment = chartObj.increment;

		if(chartObj.chartType=='stacked_column') {
			var max_tmp = 0;
			if(values.length){
				var max_stacked_val = -9999;
				for(var j=0,len=values.length;j<len;j++){
					var value_sub = values[j], tmp_sum = 0;
					for(var i=0,len_sub = value_sub.length;i<len_sub;i++){
						tmp_sum += value_sub[i];
					}

					if(max_stacked_val < tmp_sum) {
						max_stacked_val = tmp_sum;
					}
				}
				max_tmp = max_stacked_val;
			}
			if(max_tmp > max) max = max_tmp;
		}

		if(!chartObj.increment){
			increment = Math.floor((max-min)/6);
			if(increment===0) increment = 1;
			chartObj.increment = increment;
		}

		chartObj.highest = parseFloat(max);
		chartObj.lowest = parseFloat(min);
		chartObj.increment = parseFloat(increment);

        //************ values.length should be equal to names.length **************//
        switch (chartObj.chartType)
        {
            case ('radar') :
                this.radar.drawRadarChart(chartObj);
                break;
            case ('polar') :
            case ('polar_pie') :
                chartObj.core_circle_radius = options['core_circle_radius'];
                chartObj.core_circle_value = options['core_circle_value'];
                this.polar.drawPolarChart(chartObj);
                break;
            case ('donut') :
            case ('pie') :
                chartObj.core_circle_radius = 0;
                if(chartObj.chartType == 'donut'){
                    chartObj.core_circle_radius = options['core_circle_radius'];
                }
                chartObj.donut_width = options['donut_width'];
                this.donut.drawDonutChart(chartObj);
                break;
            case ('line') :
            case ('area') :
            case ('jira') :
                if (options.hasOwnProperty('bottomOffsetValue')) chartObj.bottomOffsetValue = options['bottomOffsetValue'];
                if (options.hasOwnProperty('leftOffsetValue')) chartObj.leftOffsetValue = options['leftOffsetValue'];
                if (options['isGuideLineNeeded']) chartObj.isGuideLineNeeded = options['isGuideLineNeeded'];
                this.line.drawLineChart(chartObj);
                break;
            case ('column'):
            case ('stacked_column') :
            case ('multi_column') :
                if (options.hasOwnProperty('bottomOffsetValue')) chartObj.bottomOffsetValue = options['bottomOffsetValue'];
                if (options.hasOwnProperty('leftOffsetValue')) chartObj.leftOffsetValue = options['leftOffsetValue'];
                if (options.hasOwnProperty('topOffsetValue')) chartObj.topOffsetValue = options['topOffsetValue'];
                if (options.hasOwnProperty('rightOffsetValue')) chartObj.rightOffsetValue = options['rightOffsetValue'];

                this.column.drawColumnChart(chartObj);
                break;
        }
		if(callback && typeof callback ==='function'){
			callback();
		}
    },

    createChartArea: function(parentSVG, chartType, viewbox, width, height){

        var chartDiv = (typeof parentSVG==='string')?document.getElementById(parentSVG):parentSVG;
        var textArea = document.createElement('ul');
        textArea.className = 'accessibility';
        chartDiv.appendChild(textArea);
        var attr = {'version':'1.1', 'width':width, 'height':height, 'viewBox':viewbox, 'class':'Nwagon_' + chartType, xmlns:'http://www.w3.org/2000/svg',style:'overflow:hidden;'};
        var svg = Nwagon.createSvgElem('svg', attr);
        chartDiv.appendChild(svg);

        return svg;
    },

    createSvgElem: function(elem, attr){
        var svgElem = document.createElementNS(CONST_SVG_URL, elem);
        if(elem=='text' || elem =='rect') {
        	elem.textContent = '';
        }
        Nwagon.setAttributes(svgElem, attr);
        return svgElem;
    },
    ellipsisSvgText:function(textObject,maxWidth){
    	maxWidth = maxWidth || 100;
    	try{
        	var textString = textObject.textContent;
    		var strLength = textString.length;
    		var width = textObject.getSubStringLength(0, strLength);

    		if (width >= maxWidth) {
    			textObject.textContent = '...' + textString;
    			strLength += 3;

    			var i = Math.floor(strLength * maxWidth / width) + 1;
    			while (++i < strLength && textObject.getSubStringLength(0, i) < maxWidth);
    			while (--i > 3 && textObject.getSubStringLength(0, i) > maxWidth);

				if(helper.agentInfo.IsGecko){
					if(i<=3){
						i=i+1;
					}
				}
    			textObject.textContent = textString.substring(0, i - 3) + '...';
    			return true;
    		}

    	}catch(e){
            //console.error(e);
            return false;
    	}
    	return false;
    },
    setAttributes: function(svgObj, attributes){
        var keys_arr = Object.keys(attributes);
        var len = keys_arr.length;
        for(var i = 0; i<len; i++){
            svgObj.setAttribute(keys_arr[i], attributes[keys_arr[i]]);
        }
    },
    ellipsisGroupText:function(wrapper, groupName, size, noTooltip){

    	if(wrapper){

            var tooltip = Nwagon.createTooltip('tooltip-'+groupName);
            wrapper.appendChild(tooltip);

    		var $names = $(wrapper).find('text');

    		console.log('ellipsisGroupText ',groupName, size)

    		$names.each(function(i,textObject){
    			//console.log
        		var orgTitle = textObject.textContent;
        		if(orgTitle){
        			var ellipsised = Nwagon.ellipsisSvgText(textObject,size);
        			if(ellipsised && !noTooltip){
        				//textObject.onmouseover = Nwagon.showToolTip(tooltip,textObject.getBBox().x,textObject.getBBox().y,orgTitle,14,7,18);
        				//textObject.onmouseout = Nwagon.hideToolTip(tooltip);

						var tooltip = Nwagon.createSvgElem('title', {});
						tooltip.textContent = orgTitle;
						textObject.appendChild(tooltip);


        			}
        		}
    		});
    	}
    },
    resizeLegend:function(legendEl,opt){
		// 범례 사이즈 조정

		var $comp = $(legendEl).closest('div.ce-object');
		var compHeight = $comp.height();

		var titleHeight = $('h3.cps-chart-title',$comp).height();
		if (!isNaN(titleHeight)){
			compHeight = compHeight - titleHeight - 10;
		}
		opt = opt || {};
		opt.offsetTop = opt.offsetTop || 0;
		opt.ignoreY = !!opt.ignoreY;

		compHeight -= opt.offsetTop;

		var legendHeight = legendEl.getBBox().height;
		var legendPosX = legendEl.getBBox().x;
		var legendPosY = opt.ignoreY ? 0 : legendEl.getBBox().y;

		if(legendHeight) {
			//console.log('resizeLegend : resize fields area - ',compHeight, ' ' , legendHeight)
			if(legendHeight > compHeight * 0.95){
				var scale = (compHeight*0.95) / legendHeight;
				//console.log('resizeLegend : resize fields area - ',compHeight*0.95, ' ' , legendHeight)
				//console.log('resizeLegend : resize fields area - ',scale)
				this.setAttributes(legendEl, {
					transform:'scale('+scale+') ' + 'translate('+((legendPosX/scale) - legendPosX)+' '+((legendPosY/scale) - legendPosY)+') '
				});
			}
		}
    },

    getMax: function(a){
        var maxValue = 0;
        if(a.length){
            for (var j = 0; j < a.length; j++)
            {
                var a_sub = a[j];
                if(a_sub.length){
                    for(var k = 0; k<a_sub.length; k++){
                        if (typeof(a_sub[k]) == 'number' && a_sub[k] > maxValue) maxValue = a_sub[k];
                    }
                }
                else{
                    if (typeof(a[j]) == 'number' && a[j] > maxValue) maxValue = a[j];
                }
            }
        }
        return maxValue;
    },
    getMin: function(a){
        var minValue = Infinity;
        if(a.length){
            for (var j = 0; j < a.length; j++)
            {
                var a_sub = a[j];
                if(a_sub.length){
                    for(var k = 0; k<a_sub.length; k++){
                        if (typeof(a_sub[k]) == 'number' && a_sub[k] < minValue) minValue = a_sub[k];
                    }
                }
                else{
                    if (typeof(a[j]) == 'number' && a[j] < minValue) minValue = a[j];
                }
            }
        }
        return minValue;
    },

    createTooltip: function(addCls){
    	var tooltipClassname = 'tooltip '+((addCls)?addCls:'');
        var tooltip = Nwagon.createSvgElem('g', {'class':tooltipClassname});
        var tooltipbg = Nwagon.createSvgElem('rect', {width:0,height:0});
        tooltip.appendChild(tooltipbg);

        var tooltiptxt = Nwagon.createSvgElem('text', {});
        tooltiptxt.textContent='';
        tooltip.appendChild(tooltiptxt);

        return tooltip;
    },

    showToolTip: function(tooltip, px, py, value, height, ytextOffset, yRectOffset){
        return function(){
            tooltip.style.cssText = "display: block";
            var text_el = tooltip.getElementsByTagName('text')[0];
            text_el.textContent = ' '+value;
            Nwagon.setAttributes(text_el, {'x':px, 'y':py-ytextOffset, 'text-anchor':'middle'});
            var width = text_el.getBBox().width;
            Nwagon.setAttributes(tooltip.getElementsByTagName('rect')[0], {'x':(px-width/2)-5, 'y':py-yRectOffset, 'width':width+10,'height':height});
        }
    },
	__hideTooltipTask:null,
    hideToolTip: function(tooltip){

       return function(){
				tooltip.style.cssText = "display: none";
       }
/*
		if(!Nwagon.__hideTooltipTask){
			Nwagon.__hideTooltipTask = new DelayedTask();
		}

        return function(){
			Nwagon.__hideTooltipTask.cancel();
			Nwagon.__hideTooltipTask.delay(100,function(){
				tooltip.style.cssText = "display: none";
			})

        }
*/
    },

    getAngles: function(arr, angles){

        for(var i=0; i<arr.length; i++){
            arr[i]=parseFloat(arr[i]);
        }

        var total = 0;
        for(var i=0; i<arr.length; i++){
            total+=parseFloat(arr[i]);
        }
        for(i=0; i<arr.length; i++){
            var degree = 360 * (arr[i]/total);
            angles['angles'].push(degree);
            angles['percent'].push(arr[i]/total);
            angles['values'].push(arr[i]);
        }
        return angles;
    },
    getOpacity: function(opa, r, max_r){
                var len  = opa.length;
                var interval = max_r/len;
                var value = Math.ceil(r/interval);
                return opa[value-1];
    },

    line:{
        points:[],
        guide_line: null,

        drawLabels: function(x, y, labelText){
           // var attributes = {'x':x, 'y':y, 'text-anchor':'end'};
            var attributes = {'x':x, 'y':y, 'text-anchor':'end', 'transform':'rotate(315,'+ x +','+ y + ')'};
            var text = Nwagon.createSvgElem('text', attributes);
            text.textContent = labelText;
            return text;
        },
        drawLineChart: function(obj){
            var type = obj.chartType;
            var isAreaChart = (type == 'area'), isJira = (type == 'jira');
            var width = obj.width, height = obj.height;
            var legendSize = (obj.legendSize===0)?0 : (obj.legendSize || 130);
            var values = obj.dataset['values'];

            // 축서식용 여백 확보
            var dataset = obj.dataset;
            var axis_x_info = dataset.xAxis;
			var axis_y_info = dataset.yAxis;
            var leftOffsetForAxisTitle = 0;
            var bottomOffsetForAxitTitle = 0;
			if(axis_x_info && axis_x_info.title && axis_x_info.format && axis_x_info.format.display){
				bottomOffsetForAxitTitle = parseInt(axis_x_info.format.fontSize) || 12;
			}
			if(axis_y_info && axis_y_info.title && axis_y_info.format && axis_y_info.format.display){
				leftOffsetForAxisTitle = parseInt(axis_y_info.format.fontSize) || 12;
			}
			var yvalueWidth = obj.increment.toString().length;
			var yvalue=75;

			if(yvalueWidth>7){
				yvalue = 115;
			}else{
				yvalue = 75;
			}

            var LeftOffsetAbsolute =  obj.hasOwnProperty('leftOffsetValue') ? obj.leftOffsetValue : yvalue;
            var BottomOffsetAbsolute = obj.hasOwnProperty('bottomOffsetValue') ? obj.bottomOffsetValue : 80;
            var TopOffsetAbsolute =  obj.hasOwnProperty('topOffsetValue') ? obj.topOffsetValue : 0;
            var RightOffsetAbsolute = obj.hasOwnProperty('rightOffsetValue') ? obj.rightOffsetValue : 0;
            var names = obj.legend['names'];
            var isGuideNeeded = obj.hasOwnProperty('isGuideLineNeeded') ? obj.isGuideLineNeeded : false;

            LeftOffsetAbsolute += leftOffsetForAxisTitle;
			BottomOffsetAbsolute += bottomOffsetForAxitTitle

            RightOffsetAbsolute = obj.dataset['fields'] ? (legendSize + 15 + RightOffsetAbsolute) : RightOffsetAbsolute;

            var viewbox = (-LeftOffsetAbsolute) + ' ' + (BottomOffsetAbsolute-height) + ' ' + width + ' ' + height;
            var svg =  Nwagon.createChartArea(obj.chart_div, obj.chartType, viewbox, width, height);
            var max = obj.highest ? obj.highest : Nwagon.getMax(values);
            var min = obj.lowest ? obj.lowest : 0;
            this.drawBackground(svg, names.length, obj.dataset, obj.increment, max, min, width-LeftOffsetAbsolute-RightOffsetAbsolute, height-BottomOffsetAbsolute-TopOffsetAbsolute,legendSize,yvalueWidth);
            this.drawLineForeground(obj.chart_div, svg, obj.legend, obj.dataset, obj.increment, max, min, width-LeftOffsetAbsolute-RightOffsetAbsolute, height-BottomOffsetAbsolute-TopOffsetAbsolute, isAreaChart, isJira, isGuideNeeded,dataset);

            // after guide line is drawn, add eventlistener to svg
            if(Nwagon.line.guide_line){
                var line = Nwagon.line.guide_line;
                var interval = Math.floor((width-LeftOffsetAbsolute-RightOffsetAbsolute)/names.length);
                var x_coord_max = line.x1.animVal.value;
                var text_add = '', index = 0;
                var fields = obj.dataset['fields'];
                var _h = fields ?  fields.length * 14 : 14;
                var tool = Nwagon.createTooltip();
                var text_el = tool.getElementsByTagName('text')[0];
                if(text_el){
                    for(var i = 0; i<fields.length; i++){
                        var ts = Nwagon.createSvgElem('tspan', {});
                        text_el.appendChild(ts);
                    }
                }
                svg.appendChild(tool);

                var pt = svg.createSVGPoint();
                function cursorPoint(evt){
                    pt.x = evt.clientX; pt.y = evt.clientY;
                    return pt.matrixTransform(svg.getScreenCTM().inverse());
                }
                svg.addEventListener('mousemove',function(evt){
                    var loc = cursorPoint(evt);
                    var x = loc.x;
                    if(x < 0) x = 0;
                    if(x > x_coord_max) x = x_coord_max;
                    if(loc.y < 0){
                        line.setAttribute('x1', x);
                        line.setAttribute('x2', x);
                        index = Math.floor(x/interval);
                        tool.style.cssText = 'display: block';
                        if(fields &&  values[index]){
                            var ts_group = text_el.getElementsByTagName('tspan');
                            for(var i = 0; i<fields.length; i++){
                                ts_group[i].setAttribute('x', x);
                                if(i>0) ts_group[i].setAttribute('dy', 15);
                                ts_group[i].textContent = names[index] + '('+ fields[i] + '): ' + values[index][i];
                            }
                        }
                        Nwagon.setAttributes(text_el, {'x':x, 'y':loc.y-40, 'text-anchor':'start'});
                        var _width = text_el.getBBox().width;
                        Nwagon.setAttributes(tool.getElementsByTagName('rect')[0], {'x':x-5, 'y':loc.y-50, 'width':_width+10,'height':_h});
                    }
                },false);
                svg.addEventListener('mouseout',function(evt){
                    tool.style.cssText = 'display:none';
                },false);
            }
        },
        drawJiraForeground:function(parentDiv, _points, colors){
            var getSlopeAndAlpha = function(point_1, point_2){
                var values = {};
                var slope;
                if((point_2[1] == point_1[1])){
                    slope = 0;
                }
                else{
                    slope = (point_2[1]-point_1[1])/(point_2[0]-point_1[0]);
                }
                values['alpha'] = point_1[1] - (slope * point_1[0]);
                values['slope'] = slope;
                return values;
            };
            var drawPolygons = function(arr1, arr2){

                if(arr1 && arr2){
                    var color, first, second, px, py;
                    var points_to_draw = '';

                    var i = 0;
                    while ( i < arr1.length){
                        if(arr1[i][1] > arr2[i][1]){
                            first = arr1;
                            second = arr2;
                            color = colors[0];
                            break;
                        }
                        if(arr1[i][1] < arr2[i][1]){
                            first = arr2;
                            second = arr1;
                            color = colors[1];
                            break;
                        }
                        i++;
                    }
                    var j = 0;
                    while(j<first.length){
                        px = first[j][0];
                        py = first[j][1];
                        if(j === 0){
                            points_to_draw += 'M '+px + ' -' + py;
                        }
                        else{
                            points_to_draw += ' L '+px + ' -' + py;
                        }
                        j++;
                    }
                    var k = second.length-1;
                    while(k >=0){
                        px = second[k][0];
                        py = second[k][1];
                        points_to_draw += ' L '+px + ' -' + py;
                        k--;
                    }

                    points_to_draw +=' Z';
                    var unlayered = Nwagon.createSvgElem('path', {'d':points_to_draw, 'fill': color, 'opacity':'0.7'});
                    polygons.appendChild(unlayered);
                }
            };

            var foregrounds = getChartParentDiv(parentDiv).querySelectorAll('.Nwagon_jira g.foreground');
            var foreground = foregrounds[foregrounds.length-1];

            var polygons = Nwagon.createSvgElem('g', {'class':'polygon'});
            foreground.appendChild(polygons);

            var layered_points = [];
            if(_points.length == 2){
                var colorOne = colors[0];
                var colorTwo = colors[1];
                var one = _points[0];
                var two = _points[1];
                var temp_one = [], temp_two = [];

                if(one.length === two.length){
                    var length = one.length;


                    for(var i = 0; i < length; i++){
                        temp_one.push(one[i]);
                        temp_two.push(two[i]);

                        if((one[i][1] > two[i][1])) layered_points.push(two[i]);
                        else layered_points.push(one[i]);

                        if(i !== length-1){
                            if( !((one[i][1] > two[i][1]) && (one[i+1][1] > two[i+1][1])) &&
                                !((one[i][1] < two[i][1]) && (one[i+1][1] < two[i+1][1])) &&
                                !((one[i][1] == two[i][1]) || (one[i+1][1] == two[i+1][1])) )
                            {
                                var points_to_push = [];
                                var equation1 = getSlopeAndAlpha(one[i], one[i+1]);
                                var equation2 = getSlopeAndAlpha(two[i], two[i+1]);
                                var slope1 = equation1['slope'];
                                var slope2 = equation2['slope'];
                                var alpha1 = equation1['alpha'];
                                var alpha2 = equation2['alpha'];

                                var px = (alpha2 - alpha1)/(slope1-slope2);
                                var py = (px * slope1) + alpha1;
                                points_to_push.push(px);
                                points_to_push.push(py);
                                layered_points.push(points_to_push);
                                temp_one.push(points_to_push); // for making splicing easier push the cross _points twice
                                temp_one.push(points_to_push);
                                temp_two.push(points_to_push);
                                temp_two.push(points_to_push);
                            }
                        }
                    }
                }
            }
            // Draw polygon where two areas are stacked up
            if(layered_points.length){

                var points_to_draw = '';
                for (var i = 0; i<layered_points.length; i++){
                    var px = layered_points[i][0];
                    var py = layered_points[i][1];
                    if(i === 0){
                        points_to_draw += 'M '+px + ' -' + py;
                    }
                    else{
                        points_to_draw += ' L '+px + ' -' + py;
                    }
                }
                points_to_draw += ' L '+layered_points[layered_points.length-1][0] + ' -' + 0 + ' L 0 0 Z';
                var layered_line = Nwagon.createSvgElem('path', {'d':points_to_draw, 'class':'layered'});
                polygons.appendChild(layered_line);
            }
            // Draw polygons for non-layered portions
            if(temp_one.length === temp_two.length){
                var i = 0;
                while(i<temp_one.length){
                    if((temp_one[i][1] == temp_two[i][1] ) && (i !=0) || (i == temp_one.length-1)) {
                        var splice_one = temp_one.splice(i+1);
                        var splice_two = temp_two.splice(i+1);
                        drawPolygons(temp_one, temp_two);

                        temp_one = splice_one;
                        temp_two = splice_two;
                        i = 0;
                    }
                    i++;
                }
            }
        },
        draw_vertex_and_tooltip:function(parentSVG, data, guide_needed){
            var circles = Nwagon.createSvgElem('g', {'class':'circles'});
            parentSVG.appendChild(circles);
            if(!guide_needed){
                var tooltip = Nwagon.createTooltip();
                parentSVG.appendChild(tooltip);
            }
            for (var i = 0; i<data.length; i++){
                var vertex = Nwagon.createSvgElem('circle', data[i]['attributes']);
                circles.appendChild(vertex);
                if(!guide_needed){
                    vertex.onmouseover = Nwagon.showToolTip(tooltip, data[i]['tooltip_x'], data[i]['tooltip_y'], data[i]['text'], 14, 7, 18);
                    vertex.onmouseout = Nwagon.hideToolTip(tooltip);
                }
            }
        },
        drawLineForeground: function(parentDiv, parentSVG, legend, dataset, increment, max, min, width, height, isAreaChart, isJira, guide_line_needed, dataset){
            var numOfCols = legend['names'].length;
            var colWidth = (width/numOfCols).toFixed(3);
            var yLimit = (Math.ceil((max-min)/increment)+1) * increment;
            var px = '', cw = '', ch = '';
            var names = legend['names'];
            var data = dataset['values'];
            var colors = dataset['colorset'];
            var fields = dataset['fields'];
            var circle_and_tooltips = [];
            var jira_points = [];

            var foreground = Nwagon.createSvgElem('g', {'class':'foreground'});
            parentSVG.appendChild(foreground);

            var lines = Nwagon.createSvgElem('g', {'class':'lines'});
            foreground.appendChild(lines);

            var labels = Nwagon.createSvgElem('g', {'class':'labels'});
            foreground.appendChild(labels);

            // Draw foreground elements (lines, circles, labels...)
            cw = (3/5*colWidth);
            if(data[0]){
                for (var k = 0; k < data[0].length; k++){
                    var ul = getChartParentDiv(parentDiv).getElementsByTagName('ul')[0];
                    if(ul){
                        var textEl = document.createElement('li');
                        textEl.innerHTML = fields[k];
                        var innerUL = document.createElement('ul');
                        textEl.appendChild(innerUL);
                        ul.appendChild(textEl);
                    }

                    var first_y = 0;
                    var points_to_draw = '';
                    var line_points = [];
                    var start_point = 0;
                    for (var i = 0; i<data.length; i++){
                        var circle_and_tooltip_data = {};
                        var point_pair = [];
                        px =  colWidth*i;

                        var py = ((data[i][k] - min) / yLimit) * height;
                        if(isNaN(py)){
                            start_point++;
                        }
                        else{
                            if(i === start_point){
                                points_to_draw += 'M '+px + ' ' + -py;
                                first_y = py;
                            }
                            else{
                                points_to_draw += ' L '+px + ' ' + -py;
                            }
                            point_pair.push(px);
                            point_pair.push(py);
                            line_points.push(point_pair);

                            var attributes = {'cx':px, 'cy':-py, 'r':2, 'stroke': colors[k], 'fill':colors[k]};
                            var tooltip_text = names[i] + '('+ fields[k] + '): ' + data[i][k].toString();

                            circle_and_tooltip_data['attributes'] = attributes;
                            circle_and_tooltip_data['text'] = tooltip_text;
                            circle_and_tooltip_data['tooltip_x'] =  px+cw/2;
                            circle_and_tooltip_data['tooltip_y'] =  -py;
                            circle_and_tooltips.push(circle_and_tooltip_data);

                            if(innerUL){
                                var innerLI = document.createElement('li');
                                innerLI.innerHTML =  'Label ' + names[i] + ',  Value '+ data[i][k].toString();
                                innerUL.appendChild(innerLI);
                            }
                        }
                        if(k===0){
                            var text = Nwagon.line.drawLabels(px + colWidth/8, 15, names[i], false, 0);
                            labels.appendChild(text);
                        }
                    }

                    var line = Nwagon.createSvgElem('path', {'d':points_to_draw, 'fill': 'none', 'stroke':colors[k]});

                    if (isAreaChart){
                        var polygon_to_draw = points_to_draw +' L '+px+ ' ' + 0 + ' L '+0 + ' ' + 0 + ' L '+0 + ' ' + -(first_y) +' Z';
                        var polygon = Nwagon.createSvgElem('path', {'d':polygon_to_draw, 'fill':colors[k], 'opacity': '0.8'});
                        lines.appendChild(polygon);
                    }
                    lines.appendChild(line);
                    jira_points.push(line_points);
                }
            }
            if(isJira){
                Nwagon.line.drawJiraForeground(parentDiv, jira_points, colors);
            }

            if(guide_line_needed){
                Nwagon.line.guide_line = Nwagon.createSvgElem('line',  {'x1':numOfCols*colWidth, 'y1': 4, 'x2':numOfCols*colWidth, 'y2' : -height, 'class':'guide_line'});
                parentSVG.appendChild(Nwagon.line.guide_line);
            }

            Nwagon.line.draw_vertex_and_tooltip(foreground, circle_and_tooltips, guide_line_needed);

			//setTimeout(function(){
					//console.log(dataset)
	            Nwagon.ellipsisGroupText(labels,'labels',80);
			//},50)

        },

        drawBackground: function(parentSVG, numOfCols, dataset, increment, max, min, width, height,legendSize,yvalueWidth){

            var colWidth = (width/numOfCols).toFixed(3);
            var attributes = {};
            var px = '', yRatio = 1;

            var background = Nwagon.createSvgElem('g', {'class':'background'});
            parentSVG.appendChild(background);

            var numOfRows = Math.ceil((max-min)/increment);
            var rowHeight = height/(numOfRows+1);

            //Vertical lines(Fist line)
            attributes = {'x1':'0', 'y1':'0', 'x2':'0', 'y2':-height + (rowHeight/2), 'class':'v'};
            var line = Nwagon.createSvgElem('line', attributes);
            background.appendChild(line);

            //Vertical lines(x-axis)
            for (var i = 0; i < numOfCols; i++)
            {
                px = i * colWidth;
                attributes = {'x1':px, 'y1': 4, 'x2':px, 'y2':-1 , 'class':'v'};
                line = Nwagon.createSvgElem('line', attributes);
                background.appendChild(line);
            }

            //Horizontal lines
            var count = 0;
            for (i = 0; i<=numOfRows; i++)
            {
                var class_name = (i === 0) ? 'h' : 'h_dash' ;
                attributes = {'x1':'-3', 'y1':'-'+ i*rowHeight, 'x2':(numOfCols*colWidth).toString(), 'y2':-i*rowHeight, 'class':class_name};
                line = Nwagon.createSvgElem('line', attributes);
                background.appendChild(line);

                attributes = {'x':'-6', 'y':-((count*rowHeight)-3), 'text-anchor':'end'};
                var text = Nwagon.createSvgElem('text', attributes);
                text.textContent = ((count*increment) + min).toString();

                background.appendChild(text);
                count++;
            }



			/* */
			// Axis title
			var axis_x_info = dataset.xAxis;
			var axis_y_info = dataset.yAxis;

			if(axis_x_info && axis_x_info.title && axis_x_info.format && axis_x_info.format.display){
				var align = axis_x_info.format.textAlign || 'CT';
				var pos_x = (numOfCols*colWidth)/2;
				var textAnchor = 'middle';
				if(align==='CT'){
					pos_x = (numOfCols*colWidth)/2;
					textAnchor = 'middle';
				}else if (align==='LT'){
					pos_x = 0;
					textAnchor = 'start';
				}else if (align==='RT'){
					pos_x = (numOfCols*colWidth);
					textAnchor = 'end';
				}

				axis_x_elem = Nwagon.createSvgElem('text', {
					y:60 + (parseInt(axis_x_info.format.fontSize) || 12),
					x:pos_x,
					'text-anchor':textAnchor,
					style:helper.convertCssObject2StyleAttr(helper.getFontStyleByFormat(axis_x_info.format,true))
				});
				axis_x_elem.textContent = axis_x_info.title;
				if(axis_x_info.format.fontSize!=""){
					$(axis_x_elem).addClass('axis_infoTxt');
					$(axis_x_elem).addClass('axis_infoTxtX');
				}
				background.appendChild(axis_x_elem);
				//setTimeout(function(){
						var ellipsised = Nwagon.ellipsisSvgText(axis_x_elem,290);
						if(ellipsised){

							var tooltip = Nwagon.createSvgElem('title', {});
							tooltip.textContent = axis_x_info.title;
							axis_x_elem.appendChild(tooltip);

						}
				//},50);
			}

			if(axis_y_info && axis_y_info.title && axis_y_info.format && axis_y_info.format.display){

				var align = axis_y_info.format.textAlign || 'CT';
				var pos_y = -(numOfRows*rowHeight)/2;
				var textAnchor = 'middle';
				var left_y = 29;

				if(parseInt(axis_y_info.format.fontSize)>24){

					if(yvalueWidth>7){

						if(helper.agentInfo.IsGecko){
							left_y = 30;
						}else{
							if(helper.agentInfo.IsIE){
								left_y = 20;
							}else{

								left_y = 29;
							}
						}
					}else{

						if(helper.agentInfo.IsGecko){
							left_y = -15;
						}else{
							if(helper.agentInfo.IsIE){
								left_y = -15;
							}else{

								left_y = -5;
							}
						}
					}
				}else{

					if(yvalueWidth>7){
						if(helper.agentInfo.IsGecko){
							left_y = 30;
						}else{
							left_y = 40;
						}
					}else{
						if(helper.agentInfo.IsGecko){
							left_y = 5;
						}else{
							if(helper.agentInfo.IsIE){
								left_y = -20;
							}else{

								left_y = -5;
							}
						}
					}

				}

				if(align==='CT'){
					pos_y = -(numOfRows*rowHeight)/2;
					textAnchor = 'middle';
				}else if (align==='LT'){
					pos_y = 0;
					textAnchor = 'start';
				}else if (align==='RT'){
					pos_y = -(numOfRows*rowHeight);
					textAnchor = 'end';
				}

				axis_y_elem = Nwagon.createSvgElem('text', {
					x:-50 - (parseInt(axis_y_info.format.fontSize) || 12),
					y:pos_y-left_y,
					'text-anchor':textAnchor
					,'alignment-baseline':'middle'
					,style:helper.convertCssObject2StyleAttr(helper.getFontStyleByFormat(axis_y_info.format,true))
					,transform:'rotate(-90 '+(-50- (parseInt(axis_y_info.format.fontSize) || 12))+' '+pos_y+')'
				});//

				axis_y_elem.textContent = axis_y_info.title;
				if(axis_y_info.format.fontSize!=""){
					$(axis_y_elem).addClass('axis_infoTxt');
					$(axis_y_elem).addClass('axis_infoTxtY');
				}
				background.appendChild(axis_y_elem);
				var agentWidth =0;
				if(helper.agentInfo.IsIE){
					agentWidth = axis_y_elem.scrollWidth;
				}else{
					agentWidth = $(axis_y_elem).width();
				}
				if(agentWidth==0&&parseInt(axis_y_info.format.fontSize)>11){
					var str = parseInt(axis_y_info.format.fontSize) - 18;
					if(str<8){
						str=12;
					}else if(str>=8&&str<10){
						str=12;
					}else if(str>=10&&str<12){
						str=12;
					}else if(str>=12&&str<17){
						str=12;
					}else if(str>=17&&str<23){
						str=14;
					}

					var textString = axis_y_elem.textContent;
					var strLength = textString.length;
					var lastLength = strLength-str;
					if(lastLength<6){
						if(parseInt(axis_y_info.format.fontSize)<18){
							lastLength = 12;
						}else if(parseInt(axis_y_info.format.fontSize)>=18&&parseInt(axis_y_info.format.fontSize)<=26){
							lastLength = 10;
						}else{
							lastLength = 6;
						}
					}
					axis_y_elem.textContent = axis_y_elem.textContent.substring(0,lastLength) + '...';
						if(axis_y_elem){
							var tooltip = Nwagon.createSvgElem('title', {});
							tooltip.textContent = axis_y_info.title;
							axis_y_elem.appendChild(tooltip);
						}

				}else{

					//setTimeout(function(){
						var ellipsised = Nwagon.ellipsisSvgText(axis_y_elem,290);
						if(ellipsised){

							var tooltip = Nwagon.createSvgElem('title', {});
							tooltip.textContent = axis_y_info.title;
							axis_y_elem.appendChild(tooltip);

						}
					//},50);
				}

			}


			/* */





            //Field Names
            if(dataset['fields'])
            {
            	if(dataset.legend && dataset.legend.format && dataset.legend.format.display === false){
            		return;
            	}

                var fields = Nwagon.createSvgElem('g', {'class':'fields'});
                background.appendChild(fields);

                var names = [];

				var numOfFields = dataset['fields'].length;
				var legend_dy = 30;
				var legend_y = 0;

				if(dataset.legend && dataset.legend.format && dataset.legend.format.fontSize){
					var size = (parseInt(dataset.legend.format.fontSize));
					if(!isNaN(size)) {
						legend_dy = size + 10;
					}
				}

                for (i = 0; i<numOfFields; i++)
                {
                    px = width+15;
                    py = (legend_dy*i) - height + rowHeight;

					if(helper.agentInfo.IsGecko || helper.agentInfo.IsEdge){
						if(dataset.legend && dataset.legend.format && dataset.legend.format.fontSize){
								legend_y = -(legend_dy/2)+5;
						}else{
								legend_y = -(legend_dy/2)+9;
						}
					}

                    attributes = {'x':px, 'y':py+legend_y, 'width':20, 'height':15, 'fill':dataset['colorset'][i]};
                    var badge = Nwagon.createSvgElem('rect', attributes);
                    fields.appendChild(badge);

                    attributes = {'x':px+25, 'y':py+7, 'alignment-baseline':'central'};
                    if(helper.agentInfo.IsIE){attributes.dy='0.3em';}
					attributes = helper.getSvgTextAttributes(attributes, dataset.legend.format);

                    var name = Nwagon.createSvgElem('text', attributes);

                    name.textContent = dataset['fields'][i];
                    fields.appendChild(name);

                    //names.push(name);
                }

				setTimeout(function(){
					if($(parentSVG).height()){
						var compHeight = ($(parentSVG).height() - rowHeight) * 0.9;
						var scale = compHeight / (fields.getBBox().height || compHeight ) ;
						scale = (scale>=1)?1:scale;

						Nwagon.resizeLegend(fields, {offsetTop:rowHeight});
						Nwagon.ellipsisGroupText(fields,'legend',(legendSize - 30)/scale);
					}
				},50);

            }
        }
    },

    column:{

        drawColumnChart: function(obj){

            var width = obj.width, height = obj.height;

            var legendSize = (obj.legendSize===0)?0 : (obj.legendSize || 130);

            // 축서식용 여백 확보
            var dataset = obj.dataset;
            var axis_x_info = dataset.xAxis;
			var axis_y_info = dataset.yAxis;
            var leftOffsetForAxisTitle = 0;
            var bottomOffsetForAxitTitle = 0;
			if(axis_x_info && axis_x_info.title && axis_x_info.format && axis_x_info.format.display){
				bottomOffsetForAxitTitle = parseInt(axis_x_info.format.fontSize) || 12;
			}
			if(axis_y_info && axis_y_info.title && axis_y_info.format && axis_y_info.format.display){
				leftOffsetForAxisTitle = parseInt(axis_y_info.format.fontSize) || 12;
			}

			var yvalueWidth = obj.increment.toString().length;
			var yvalue=75;

			if(yvalueWidth>7){
				yvalue = 115;
			}else{
				yvalue = 75;
			}

            var values = obj.dataset['values'];
            var LeftOffsetAbsolute =  obj.hasOwnProperty('leftOffsetValue') ? obj.leftOffsetValue : yvalue;
            var BottomOffsetAbsolute = obj.hasOwnProperty('bottomOffsetValue') ? obj.bottomOffsetValue : 100;
            var TopOffsetAbsolute =  obj.hasOwnProperty('topOffsetValue') ? obj.topOffsetValue : 0;
            var RightOffsetAbsolute = obj.hasOwnProperty('rightOffsetValue') ? obj.rightOffsetValue : 0;

            LeftOffsetAbsolute += leftOffsetForAxisTitle;
			BottomOffsetAbsolute += bottomOffsetForAxitTitle

            RightOffsetAbsolute = obj.dataset['fields'] ? (legendSize + 15 + RightOffsetAbsolute) : RightOffsetAbsolute;

            var viewbox = (-LeftOffsetAbsolute) + ' ' + (BottomOffsetAbsolute -height) + ' ' + width + ' ' + height;
            var svg =  Nwagon.createChartArea(obj.chart_div, obj.chartType, viewbox, width, height);
            var max = obj.highest ? obj.highest : Nwagon.getMax(values);
			var min = obj.lowest ? obj.lowest : Nwagon.getMin(values);
			var increment = obj.increment;

            this.drawBackground(svg, obj.legend['names'].length, obj.dataset, increment, max, width-LeftOffsetAbsolute-RightOffsetAbsolute, height-BottomOffsetAbsolute-TopOffsetAbsolute,legendSize,yvalueWidth);
            this.drawColumnForeground(obj.chart_div, svg, obj.legend, obj.dataset, increment, max, width-LeftOffsetAbsolute-RightOffsetAbsolute, height-BottomOffsetAbsolute-TopOffsetAbsolute, obj.chartType);

        },

        drawColumn: function(parentGroup, width, height){

            var column = Nwagon.createSvgElem('rect', {'x':'0', 'y':-height, 'width':width, 'height':height});
            parentGroup.appendChild(column);

            return column;
        },

        drawLabels: function(x, y, labelText){

            var attributes = {'x':x, 'y':y, 'text-anchor':'end', 'transform':'rotate(315,'+ x +','+ y + ')'};
            var text = Nwagon.createSvgElem('text', attributes);
            text.textContent = labelText;

            return text;
        },

        getColorSetforSingleColumnChart: function(max, values, colorset){
            var numOfColors = colorset.length;
            var interval = max/numOfColors;
            var colors = [];

            for(var index = 0; index < values.length; index++){
                var colorIndex = Math.floor(values[index]/interval);
                if (colorIndex == numOfColors) colorIndex--;
                colors.push(colorset[colorIndex]);
            }
            return colors;
        },

        drawColumnForeground: function(parentDiv, parentSVG, legend, dataset, increment, max, width, height, chartType){

            var names = legend['names'];
            var numOfCols = names.length;
            var colWidth = (width/numOfCols).toFixed(3);
            var yLimit = (Math.ceil(max/increment)+1) * increment;
            var px = '', cw = '', ch = '';
            var data = dataset['values'];
            var chart_title = dataset['title'];
            var fields = dataset['fields'];

            var foreground = Nwagon.createSvgElem('g', {'class':'foreground'});
            parentSVG.appendChild(foreground);

            var columns = Nwagon.createSvgElem('g', {'class':'columns'});
            foreground.appendChild(columns);

            var labels = Nwagon.createSvgElem('g', {'class':'labels'});
            foreground.appendChild(labels);

            var tooltip = Nwagon.createTooltip();
            foreground.appendChild(tooltip);

            var drawColGroups = function(columns, ch, px, color, tooltipText, isStackedColumn, yValue){
                var colgroup  =  Nwagon.createSvgElem('g', {});
                columns.appendChild(colgroup);

                var column = Nwagon.column.drawColumn(colgroup, cw, ch);

                Nwagon.setAttributes(column, {'x':px, 'style':'fill:'+color});
                if(isStackedColumn)
                {
                    var py =  yValue + ch;
                    if ( py > 0 ) Nwagon.setAttributes(column, {'y':-py});
                    ch = py;
                }
                /*
                column.onmouseover = Nwagon.showToolTip(tooltip, px+cw/2, -ch, tooltipText, 14, 7, 18);
                column.onmouseout = Nwagon.hideToolTip(tooltip);
							*/
						var tooltip = Nwagon.createSvgElem('title', {});
						tooltip.textContent = tooltipText;
						column.appendChild(tooltip);

                column = null;  //prevent memory leak (in IE)
            };

            var create_data_list = function(obj){
                var ul = getChartParentDiv(parentDiv).getElementsByTagName('ul')[0];
                if (ul){
                    for (var key in obj){
                        if(obj.hasOwnProperty(key)){
                            var li = document.createElement('li');
                            li.innerHTML = key;
                            var innerUL = document.createElement('ul');
                            li.appendChild(innerUL);
                            ul.appendChild(li);
                            var innerList = obj[key];
                            for (var k = 0; k< innerList.length; k++){
                                var innerLI = document.createElement('li');
                                innerLI.innerHTML = innerList[k];
                                innerUL.appendChild(innerLI);
                            }
                        }
                    }
                }
            };

            if(chartType == 'column')
            {
                var ul = getChartParentDiv(parentDiv).getElementsByTagName('ul')[0];
                if(ul){
                    ul.innerHTML = chart_title;
                }
                cw = (3/5*colWidth);
                var colors = dataset['colorset'];//Nwagon.column.getColorSetforSingleColumnChart(max, data, dataset['colorset']);

                for(var index = 0; index < data.length; index++){
                    px = (colWidth*(index+0.2));// + cw;
                    ch = data[index]/yLimit*height;
                    drawColGroups(columns, ch, px, colors[index], data[index]);

                    var text = Nwagon.column.drawLabels(px + cw/2, 15, names[index], false, 0);
                    labels.appendChild(text);

                    var innerLI = document.createElement('li');
                    innerLI.innerHTML = 'Label ' + names[index] + ', Value  '+ data[index];
                    if(ul){
                        ul.appendChild(innerLI);
                    }
                }
            }
            else if(chartType == 'multi_column')
            {
                var colors = dataset['colorset'];
                cw = (3/5*colWidth)/fields.length;
                var chart_data = {};
                for ( var k = 0; k<fields.length; k++){
                    chart_data[fields[k]] = [];
                }

                for(var i = 0; i < data.length; i++){
                    var one_data = data[i];
                    px = (colWidth*(i+0.2));

                    for(var index = 0; index < one_data.length; index++){
                        var pxx = px+ (index*(cw));
                        ch = one_data[index]/yLimit*height;
                        drawColGroups(columns, ch, pxx, colors[index], one_data[index], false, 0);
                        chart_data[fields[index]].push('Label ' + names[i] + ', Value  '+ one_data[index]);
                    }

                    var text = Nwagon.column.drawLabels(px + cw/2 * fields.length, 15, names[i]);
                    labels.appendChild(text);
                }
                create_data_list(chart_data);
            }
            else if(chartType == 'stacked_column')
            {
                cw = (3/5*colWidth);
                var colors = dataset['colorset'];
                var chart_data = {};
                for ( var k = 0; k<fields.length; k++){
                    chart_data[fields[k]] = [];
                }
                for(var i = 0; i < data.length; i++){
                    var one_data = data[i];
                    var yValue = 0;

                    for(var index = 0; index < one_data.length; index++){
                        px = (colWidth*(i+0.2));// + cw;
                        ch = one_data[index]/yLimit*height;

                        drawColGroups(columns, ch, px, colors[index], one_data[index], true, yValue);
                        chart_data[fields[index]].push('Label ' + names[i] + ', Value  '+ one_data[index]);
                        yValue +=ch;
                    }


                    var text = Nwagon.column.drawLabels(px + cw/2, 15, names[i]);
                    labels.appendChild(text);
                }
                create_data_list(chart_data);
            }

            setTimeout(function(){
                Nwagon.ellipsisGroupText(labels,'labels',80);
            },50)
        },

        drawBackground: function(parentSVG, numOfCols, dataset, increment, max, width, height,legendSize,yvalueWidth){

            var colWidth =(width/numOfCols).toFixed(3);
            var attributes = {};
            var px = '', yRatio = 1;

            var background = Nwagon.createSvgElem('g', {'class':'background'});
            parentSVG.appendChild(background);

            var numOfRows = Math.ceil(max/increment);
            rowHeight = height/(numOfRows+1);

            //Vertical lines
            for (var i = 0; i<=numOfCols; i++)
            {
                px = (i * colWidth).toString();
                attributes = {'x1':px, 'y1':'0', 'x2':px, 'y2':rowHeight-height, 'class':'v'};
                var line = Nwagon.createSvgElem('line', attributes);
                background.appendChild(line);
            }
            //Horizontal lines (draw 1 more extra line to accomodate the max value)
            var count = 0;
            for (var i = 0; i<=numOfRows; i++)
            {
                attributes = {'x1':'0', 'y1':'-'+ i*rowHeight, 'x2':(numOfCols*colWidth).toString(), 'y2':'-'+ i*rowHeight, 'class':'h'};
                var line = Nwagon.createSvgElem('line', attributes);
                background.appendChild(line);

                attributes = {'x':'-6', 'y':-((count*rowHeight)-3), 'text-anchor':'end'};
                var text = Nwagon.createSvgElem('text', attributes);
                text.textContent = (count*increment).toString();

                background.appendChild(text);
                count++;
            }



			/* */
			// Axis title
			var axis_x_info = dataset.xAxis;
			var axis_y_info = dataset.yAxis;

			if(axis_x_info && axis_x_info.title && axis_x_info.format && axis_x_info.format.display){
				var align = axis_x_info.format.textAlign || 'CT';
				var pos_x = (numOfCols*colWidth)/2;
				var textAnchor = 'middle';
				if(align==='CT'){
					pos_x = (numOfCols*colWidth)/2;
					textAnchor = 'middle';
				}else if (align==='LT'){
					pos_x = 0;
					textAnchor = 'start';
				}else if (align==='RT'){
					pos_x = (numOfCols*colWidth);
					textAnchor = 'end';
				}

				axis_x_elem = Nwagon.createSvgElem('text', {
					y:85 + (parseInt(axis_x_info.format.fontSize) || 12),
					x:pos_x,
					'text-anchor':textAnchor,
					style:helper.convertCssObject2StyleAttr(helper.getFontStyleByFormat(axis_x_info.format,true))
				});
				axis_x_elem.textContent = axis_x_info.title;
				if(axis_x_info.format.fontSize!=""){
					$(axis_x_elem).addClass('axis_infoTxt');
					$(axis_x_elem).addClass('axis_infoTxtX');
				}
				background.appendChild(axis_x_elem);
				//setTimeout(function(){
						var ellipsised = Nwagon.ellipsisSvgText(axis_x_elem,290);
						if(ellipsised){

							var tooltip = Nwagon.createSvgElem('title', {});
							tooltip.textContent = axis_x_info.title;
							axis_x_elem.appendChild(tooltip);

						}
				//},50);
			}

			if(axis_y_info && axis_y_info.title && axis_y_info.format && axis_y_info.format.display){

				var align = axis_y_info.format.textAlign || 'CT';
				var pos_y = -(numOfRows*rowHeight)/2;
				var left_y = 29;

				if(parseInt(axis_y_info.format.fontSize)>24){

					if(yvalueWidth>7){

						if(helper.agentInfo.IsGecko){
							left_y = 30;
						}else{
							if(helper.agentInfo.IsIE){
								left_y = 20;
							}else{

								left_y = 29;
							}
						}
					}else{

						if(helper.agentInfo.IsGecko){
							left_y = -15;
						}else{
							if(helper.agentInfo.IsIE){
								left_y = -15;
							}else{

								left_y = -5;
							}
						}
					}
				}else{

					if(yvalueWidth>7){
						if(helper.agentInfo.IsGecko){
							left_y = 30;
						}else{
							left_y = 40;
						}
					}else{
						if(helper.agentInfo.IsGecko){
							left_y = 5;
						}else{
							if(helper.agentInfo.IsIE){
								left_y = -20;
							}else{

								left_y = -5;
							}
						}
					}

				}

				var textAnchor = 'middle';
				if(align==='CT'){
					pos_y = -(numOfRows*rowHeight)/2;
					textAnchor = 'middle';
				}else if (align==='LT'){
					pos_y = 0;
					textAnchor = 'start';
				}else if (align==='RT'){
					pos_y = -(numOfRows*rowHeight);
					textAnchor = 'end';
				}

				axis_y_elem = Nwagon.createSvgElem('text', {
					x:-50 - (parseInt(axis_y_info.format.fontSize) || 12),
					y:pos_y-left_y,
					'text-anchor':textAnchor
					,'alignment-baseline':'middle'
					,style:helper.convertCssObject2StyleAttr(helper.getFontStyleByFormat(axis_y_info.format,true))
					,transform:'rotate(-90 '+(-50- (parseInt(axis_y_info.format.fontSize) || 12))+' '+pos_y+')'
				});//

				axis_y_elem.textContent = axis_y_info.title;
				if(axis_y_info.format.fontSize!=""){
					$(axis_y_elem).addClass('axis_infoTxt');
					$(axis_y_elem).addClass('axis_infoTxtY');
				}
				background.appendChild(axis_y_elem);
				var agentWidth =0;
				if(helper.agentInfo.IsIE){
					agentWidth = axis_y_elem.scrollWidth;
				}else{
					agentWidth = $(axis_y_elem).width();
				}
				if(agentWidth==0&&parseInt(axis_y_info.format.fontSize)>18){
					var str = parseInt(axis_y_info.format.fontSize) - 18;
					if(str<8){
						str=12;
					}else if(str>=8&&str<10){
						str=12;
					}else if(str>=10&&str<12){
						str=12;
					}else if(str>=12&&str<17){
						str=12;
					}else if(str>=17&&str<23){
						str=14;
					}
					var textString = axis_y_elem.textContent;
					var strLength = textString.length;
					var lastLength = strLength-str;
					if(lastLength<6){
						if(parseInt(axis_y_info.format.fontSize)<18){
							lastLength = 12;
						}else if(parseInt(axis_y_info.format.fontSize)>=18&&parseInt(axis_y_info.format.fontSize)<=26){
							lastLength = 10;
						}else{
							lastLength = 6;
						}
					}
					axis_y_elem.textContent = axis_y_elem.textContent.substring(0, lastLength) + '...';
						if(axis_y_elem){
							var tooltip = Nwagon.createSvgElem('title', {});
							tooltip.textContent = axis_y_info.title;
							axis_y_elem.appendChild(tooltip);
						}

				}else{
					//setTimeout(function(){
						var ellipsised = Nwagon.ellipsisSvgText(axis_y_elem,290);
						if(ellipsised){
							var tooltip = Nwagon.createSvgElem('title', {});
							tooltip.textContent = axis_y_info.title;
							axis_y_elem.appendChild(tooltip);

						}
					//},50);
				}

			}

			/* */

            //Field Names
            if(dataset['fields'])
            {
            	if(dataset.legend && dataset.legend.format && dataset.legend.format.display===false){
            		return;
            	}

                var fields = Nwagon.createSvgElem('g', {'class':'fields'});
                background.appendChild(fields);

                var numOfFields = dataset['fields'].length;
				var legend_dy = 30;
				var legend_y = 0;
				if(dataset.legend && dataset.legend.format && dataset.legend.format.fontSize){
					var size = (parseInt(dataset.legend.format.fontSize));
					if(!isNaN(size)) {
						legend_dy = size + 10;
					}
				}

                for (var i = 0; i<numOfFields; i++)
                {
                    px = width+15;
                    py = (legend_dy * i) - height + rowHeight;

					if(helper.agentInfo.IsGecko || helper.agentInfo.IsEdge){
						if(dataset.legend && dataset.legend.format && dataset.legend.format.fontSize){
								legend_y = -(legend_dy/2)+5;
						}else{
								legend_y = -(legend_dy/2)+9;
						}
					}

                    attributes = {'x':px, 'y':py+legend_y, 'width':20, 'height':15, 'fill':dataset['colorset'][i]};
                    var badge = Nwagon.createSvgElem('rect', attributes);
                    fields.appendChild(badge);

                    attributes = {'x':px+25, 'y':py+7, 'alignment-baseline':'central'};
                    if(helper.agentInfo.IsIE){attributes.dy='0.3em';}
					attributes = helper.getSvgTextAttributes(attributes, dataset.legend.format);

					var name = Nwagon.createSvgElem('text', attributes);
                    name.textContent = dataset['fields'][i];
                    fields.appendChild(name);
                    //Nwagon.ellipsisSvgText(name, legendSize - 20);
                }

				setTimeout(function(){
					if($(parentSVG).height()){
						var compHeight = ($(parentSVG).height() - rowHeight) * 0.9;
						var scale = compHeight / (fields.getBBox().height || compHeight ) ;
						scale = (scale>=1)?1:scale;

						Nwagon.resizeLegend(fields, {offsetTop:rowHeight});
						Nwagon.ellipsisGroupText(fields,'legend',(legendSize - 30)/scale);
					}
				},50);
            }
        }
    },

    donut: {

        drawDonutChart: function(obj){
            var width = obj.width, height = obj.height;

            var legendSize = (obj.legendSize===0)?0 : (obj.legendSize || 130);

            //console.log('donut.drawDonutChart - legnedSize : ',legendSize)
            //console.log('donut.drawDonutChart - legnedSize : ',obj)
            //console.log('donut.drawDonutChart - legnedSize : ',obj.legendSize)

			var circle_radius = obj.core_circle_radius || 0 + obj.donut_width;

            var viewbox = '-' + ((width - legendSize)/ 2 ) + ' -' + height/2 + ' ' + width + ' ' + height;
            var svg =  Nwagon.createChartArea(obj.chart_div, obj.chartType, viewbox, width, height);
            var angles = {'angles':[], 'percent':[], 'values':[]};
            var degree_values = obj.dataset['values'];
            if(degree_values){
                angles = Nwagon.getAngles(degree_values, angles);
            }
            this.drawDonut(obj.chart_div, angles, obj.chartType, svg, obj.dataset, obj.core_circle_radius, obj.donut_width);

            if(legendSize){
                if(obj.core_circle_radius == 0){
                    this.drawField(obj.dataset['fields'], obj.dataset, svg, ((width - legendSize)/ 2 ),legendSize);
                }
                else{
                    this.drawField(obj.dataset['fields'], obj.dataset, svg, ((width - legendSize)/ 2 ),legendSize);
                }

            }

        },
        drawDonut: function(parentDiv, angles, chart_type, parentSVG, data, core_radius, donut_width){
            // var core_circle_radius = core_radius;
            var radius = donut_width + core_radius;
            var ul = getChartParentDiv(parentDiv).getElementsByTagName('ul')[0];
            var create_data_li = function(text_to_add){
                if(ul){
                    var li = document.createElement('li');
                    li.innerHTML = text_to_add;
                    ul.appendChild(li);
                }
            };

            var foreground = Nwagon.createSvgElem('g', {'class':'foreground'});
            parentSVG.appendChild(foreground);
            var donuts = Nwagon.createSvgElem('g', {'class':'donuts'});
            foreground.appendChild(donuts);
            var tooltip = Nwagon.createTooltip();
            foreground.appendChild(tooltip);

            var colors = data['colorset'];

            var length = angles['angles'].length;
            var arch_end_x = 0, arch_end_y = 0;
            var points_to_draw = '', text_to_add = '';
            var names = data['fields'];
            var angle_to_rotate = 0;
            var sub_angle = angle_in_int = angle_in_int_accumulate = 0;

			var svg_sectors = [];
            for(var j=0; j<length; j++)
            {
                var path;
                if(angles['percent'][j] < 1){
                    sub_angle = (Math.PI*2) * angles['percent'][j];
                    angle_in_int = angles['angles'][j];
                    if(j > 0){
                        angle_in_int_accumulate+=angles['angles'][j-1];
                    }

                    if(core_radius > 0) {

                        if(sub_angle){

                            arch_end_x = (radius)*Math.sin(sub_angle);
                            arch_end_y = sub_angle ? -(radius*Math.sin(sub_angle)/Math.tan(sub_angle)) : 0;

                            var end_x = core_radius*Math.sin(sub_angle);
                            var end_y = sub_angle ? -(core_radius*Math.sin(sub_angle)/Math.tan(sub_angle)) : 0;

                            if(sub_angle > Math.PI){
                                points_to_draw = 'M0 '+ -core_radius+ ' L0 ' +'-'+radius +' A ' + radius + ' ' + radius + ' 0 1 1 ' + arch_end_x +' '+ arch_end_y +' L '+ end_x +' '+ end_y;
                                points_to_draw+= ' A ' + core_radius + ' ' + core_radius + ' 0 1 0 0 '+ -core_radius + ' Z';
                            }
                            else
                            {
                                points_to_draw = 'M0 '+ -core_radius+ ' L0 ' +'-'+radius +' A ' + radius + ' ' + radius + ' 0 0 1 ' + arch_end_x +' '+ arch_end_y +' L '+ end_x +' '+ end_y;
                                points_to_draw+= ' A ' + core_radius + ' ' + core_radius + ' 0 0 0 0 '+ -core_radius + ' Z';
                            }
                        }
                        else{
                            points_to_draw = 'M0 0 L 0 0 Z';
                        }

                    }
                    else{
                        if(sub_angle){
                            arch_end_x = radius*Math.sin(sub_angle);
                            arch_end_y = sub_angle ? -(radius*Math.sin(sub_angle)/Math.tan(sub_angle)) : 0;
                            if(sub_angle > Math.PI){
                                points_to_draw = 'M0 0 L0 ' +'-'+radius +' A ' + radius + ' ' + radius + ' 0 1 1 ' + arch_end_x +' '+ arch_end_y +' L0 0 Z';
                            }
                            else{
                                points_to_draw = 'M0 0 L0 ' +'-'+radius +' A ' + radius + ' ' + radius + ' 0 0 1 ' + arch_end_x +' '+ arch_end_y +' L0 0 Z';
                            }
                        }
                        else{
                            points_to_draw = 'M0 0 L 0 0 Z';
                        }
                    }
                    path = Nwagon.createSvgElem('path', {'class':'sector','d':points_to_draw, 'fill':colors[j]});
                    donuts.appendChild(path);
                }
                else{

                    var attributes = {'cx':0, 'cy':0, 'r':radius, 'stroke':'transparent', 'fill': colors[j]};
                    path = Nwagon.createSvgElem('circle', attributes);
                    donuts.appendChild(path);
                    if(core_radius > 0){
                        var inner_attributes = {'cx':0, 'cy':0, 'r':core_radius, 'stroke':'transparent', 'fill-opacity': 1, 'fill': 'white'};
                        var inner_circle = Nwagon.createSvgElem('circle', inner_attributes);
                        donuts.appendChild(inner_circle);
                    }
                }

                if(angles['angles'].length){
                    angle_to_rotate = angle_in_int_accumulate;
                }
                else{
                    angle_to_rotate = (angle_in_int*j);
                }

				var sectors = getChartParentDiv(parentDiv).querySelectorAll('.Nwagon_'+chart_type+' .foreground  .sector');
				if(agentInfo.IsSafari){
					sectors = $(parentSVG).find('.foreground').find('.donuts').find('.sector');
				}
				if(sectors.length > 0){
					var sector = sectors[sectors.length-1];
					sector.setAttribute('transform','rotate('+ angle_to_rotate +')');
				}

                var tooltip_angle = (Math.PI * (angle_to_rotate-90))/180;
                var tooltip_y = (radius+core_radius)/2 * Math.sin(tooltip_angle);
                var tooltip_x = (radius+core_radius)/2 * Math.cos(tooltip_angle);// * Math.cos(angle_to_rotate);

                var degree_value = angles['values'][j];
                text_to_add = names[j] ? (names[j]+ '(' +(angles['percent'][j]*100).toFixed(1) +'%) ' + degree_value) : 'undefiend';


                //path.onmouseover = Nwagon.showToolTip(tooltip, tooltip_x, tooltip_y, text_to_add, 14, 7, 18);
                //path.onmouseout = Nwagon.hideToolTip(tooltip);

				svg_sectors.push({
					angle_current:angle_to_rotate,
					tooltip_text:text_to_add,
					radius:(radius+core_radius)/2,
					el:path
				})

                create_data_li(text_to_add);
            }

			// 툴팁 출력 위치 변경, 이벤트 재등록
			for(var i=0;i<svg_sectors.length;i++){
				var sector = svg_sectors[i];
				var path = sector.el;
				var text_to_add = sector.tooltip_text;
				var angle_next = 0;
				var angle_current = sector.angle_current;

				if(i<svg_sectors.length-1){
					angle_next = svg_sectors[i+1].angle_current;
				} else {
					angle_next = 360;
				}

                var tooltip_angle = (Math.PI * ((angle_next + angle_current)/2 -90))/180;
                var tooltip_y = (radius+core_radius)/2 * Math.sin(tooltip_angle);
                var tooltip_x = (radius+core_radius)/2 * Math.cos(tooltip_angle);// * Math.cos(angle_to_rotate);

                //path.onmouseover = Nwagon.showToolTip(tooltip, tooltip_x, tooltip_y, text_to_add, 14, 7, 18);
                //path.onmouseout = Nwagon.hideToolTip(tooltip);

				var tooltip = Nwagon.createSvgElem('title', {});
				tooltip.textContent = text_to_add;
				path.appendChild(tooltip);


				//console.log(angle_current,angle_next);
			}
        },
        drawField: function(fields_names, dataset, parentSVG, width ,legendSize){
			if(fields_names.length)
			{
				var fields = Nwagon.createSvgElem('g', {'class':'fields'});
				parentSVG.appendChild(fields);
				var attributes = {};
				var height = 15;
				var numOfFields = fields_names.length;
				var colorset = dataset['colorset'];
				var legend_dy = 30;
				var legend_y = 0;
				if(dataset.legend && dataset.legend.format && dataset.legend.format.fontSize){
					var size = (parseInt(dataset.legend.format.fontSize));
					if(!isNaN(size)) {
						legend_dy = size + 10;
					}
				}

				for (var i = 0; i<numOfFields; i++)
				{
					var px = width ;
					var py = (legend_dy*i) - (numOfFields * legend_dy / 2); //70 ;
					if(helper.agentInfo.IsGecko || helper.agentInfo.IsEdge){
						if(dataset.legend && dataset.legend.format && dataset.legend.format.fontSize){
								legend_y = -(legend_dy/2)+5;
						}else{
								legend_y = -(legend_dy/2)+9;
						}
					}
					attributes = {'x':px, 'y':py+legend_y, 'width':20, 'height':height, 'fill':colorset[i]};
					var badge = Nwagon.createSvgElem('rect', attributes);
					fields.appendChild(badge);

					attributes = {'x':px+25, 'y':py+7, 'alignment-baseline':'central'};
                    if(helper.agentInfo.IsIE){attributes.dy='0.3em';}
					attributes = helper.getSvgTextAttributes(attributes, dataset.legend.format);

					var name = Nwagon.createSvgElem('text', attributes);
					name.textContent = fields_names[i];
					fields.appendChild(name);
					//Nwagon.ellipsisSvgText(name,legendSize - 20);
				}

				setTimeout(function(){
					if($(parentSVG).height()){
						var compHeight = ($(parentSVG).height()) * 0.9;
						var scale = compHeight / (fields.getBBox().height || compHeight ) ;
						scale = (scale>=1)?1:scale;

						Nwagon.resizeLegend(fields, {ignoreY :true});
						Nwagon.ellipsisGroupText(fields,'legend',(legendSize - 30)/scale);
					}
				},50);
			}
        }
    },

    polar: {
        drawPolarChart: function(obj){

            var BottomOffsetAbsolute = 80;
            var RightOffsetAbsolute = obj.dataset['fields'] ? 150 : 0;

            var width = obj.width, height = obj.height;
            var viewbox = '-' + width/2 + ' -' + height/2 + ' ' + width + ' ' + height;
            var svg =  Nwagon.createChartArea(obj.chart_div, obj.chartType, viewbox, width, height);
            var angles = {'angles':[], 'percent':[], 'values':[]};
            if(obj.chartType == 'polar_pie'){
                var degree_values = obj.dataset['degree_values'];
                if(degree_values){
                    angles = Nwagon.getAngles(degree_values, angles);
                }
            }

            if(svg && obj.legend['names'] &&  obj.dataset){
                this.drawBackground(svg, angles['angles'], obj.chartType, obj.legend['names'], obj.dataset, obj.increment, obj.max, obj.core_circle_radius, (width/2)-RightOffsetAbsolute, (height/2)-BottomOffsetAbsolute);
                this.drawLabels(svg, angles, obj.legend, CONST_MAX_RADIUS, obj.core_circle_radius);
                if(obj.core_circle_radius > 0 && obj.core_circle_value){
                    this.drawCoreCircleValue(svg, obj.core_circle_value, obj.core_circle_radius);
                }
                this.drawForeground(obj.chart_div, angles, obj.chartType, svg, obj.legend, obj.dataset, obj.core_circle_radius, obj.max);
            }
            this.drawCoordinates(svg, obj.increment, obj.max, obj.core_circle_radius);
        },


        drawCoordinates: function(parentSVG, decrement, maxRadius, core_circle_radius){

            var g = Nwagon.createSvgElem('g', {'class':'xAxis'});
            var i = maxRadius, y=0.0, point=0.0;

            while (i > 0)
            {
                point = y+',' + -(i+core_circle_radius);

                var attributes = {'points': point, 'x':y, 'y':-(i+core_circle_radius), 'text-anchor':'middle'};
                var text = Nwagon.createSvgElem('text', attributes);
                text.textContent = i.toString();
                g.appendChild(text);
                i-=decrement;
            }
            parentSVG.appendChild(g);
        },

        drawCoreCircleValue: function(parentSVG, value, core_circle_radius){

            var core = Nwagon.createSvgElem('g', {'class':'core'});
            parentSVG.appendChild(core);
            var attributes = {'x':'0', 'y':core_circle_radius/4, 'text-anchor':'middle', 'class':'core_text'};
            var core_text = Nwagon.createSvgElem('text', attributes);
            core_text.textContent = value;
            core.appendChild(core_text);
        },

        drawLabels: function(parentSVG, angles, legend, maxRadius, core_circle_radius){

            var labels = Nwagon.createSvgElem('g', {'class':'labels'});
            parentSVG.appendChild(labels);
            var names = legend.names;
            var length = names.length;
            var angle = angle_accumulate = 0;

            for(var i = 0; i<length; i++){
                if(angles['percent'].length){
                    angle = (Math.PI*2) * angles['percent'][i];
                    if(i>0){
                        angle_accumulate += (Math.PI*2) * angles['percent'][i-1];
                    }
                }
                else{
                    angle = (Math.PI*2)/length;
                    angle_accumulate = angle*i;
                }
                var sub_names = names[i];
                if(sub_names){
                    var sub_len = sub_names.length;
                    for(var k = 0; k<sub_len; k++){
                        var sub_angle = angle/sub_len;
                        var total_angle = angle_accumulate + (sub_angle * k) + sub_angle/2;
                        var y = -(maxRadius+core_circle_radius+12) * Math.cos(total_angle);
                        var x = (maxRadius+core_circle_radius+12) * Math.sin(total_angle);

                        var align = (x < 0) ? 'end' : 'start';
                        if(x < 1 && x > -1) align = 'middle';

                        var attributes = {'x':x, 'y':y, 'text-anchor':align, 'class':'chart_label'};
                        var text = Nwagon.createSvgElem('text', attributes);
                        text.textContent = sub_names[k];
                        labels.appendChild(text);
                    }
                }
            }
        },

        drawForeground: function(parentDiv, angles, chart_type, parentSVG, legend, data, core_circle_radius, max){

            var ul = getChartParentDiv(parentDiv).getElementsByTagName('ul')[0];
            var create_data_li = function(text_to_add){
                if(ul){
                    var li = document.createElement('li');
                    li.innerHTML = text_to_add;
                    ul.appendChild(li);
                }
            };
            var foreground = Nwagon.createSvgElem('g', {'class':'foreground'});
            parentSVG.appendChild(foreground);
            var pies = Nwagon.createSvgElem('g', {'class':'pies'});
            foreground.appendChild(pies);
            var tooltip = Nwagon.createTooltip();
            foreground.appendChild(tooltip);

            var colors = data['colorset'];
            var dataGroup = data['values'];
            var opacities = data ['opacity'];
            var length = dataGroup.length;
            var arch_end_x = 0, arch_end_y = 0;
            var points_to_draw = '', text_to_add = '';
            var names = legend.names;
            var angle_to_rotate = 0;
            var angle = angle_in_int = angle_in_int_accumulate = 0;
            if(length){
                for(var j=0; j<length; j++)
                {
                    if(angles['angles'].length){
                        angle = (Math.PI*2) * angles['percent'][j];
                        angle_in_int = angles['angles'][j];
                        if(j > 0){
                            angle_in_int_accumulate+=angles['angles'][j-1];
                        }
                    }
                    else{
                        angle = (Math.PI*2)/length;
                        angle_in_int = 360/length;
                    }

                    var sub_data = dataGroup[j];
                    var sub_len = sub_data.length;

                    for (var k = 0; k<sub_len; k++){
                        var radius = sub_data[k];
                        var opacity = 0.8;
                        if(opacities.length){
                            opacity = Nwagon.getOpacity(opacities, radius, max);
                        }

                        var sub_angle = angle/sub_len;
                        var sub_angle_in_int = angle_in_int/sub_len;

                        if(core_circle_radius > 0) {
                            radius = radius+core_circle_radius;
                            arch_end_x = (radius)*Math.sin(sub_angle);
                            arch_end_y = -(radius*Math.sin(sub_angle)/Math.tan(sub_angle));

                            var end_x = core_circle_radius*Math.sin(sub_angle);
                            var end_y = -(core_circle_radius*Math.sin(sub_angle)/Math.tan(sub_angle));
                            if(sub_angle > Math.PI){
                                points_to_draw = 'M0 '+ -core_circle_radius+ ' L0 ' +'-'+radius +' A ' + radius + ' ' + radius + ' 0 1 1 ' + arch_end_x +' '+ arch_end_y +' L '+ end_x +' '+ end_y;
                                points_to_draw+= ' A ' + core_circle_radius + ' ' + core_circle_radius + ' 0 1 0 0 '+ -core_circle_radius + ' Z';
                            }
                            else
                            {
                                points_to_draw = 'M0 '+ -core_circle_radius+ ' L0 ' +'-'+radius +' A ' + radius + ' ' + radius + ' 0 0 1 ' + arch_end_x +' '+ arch_end_y +' L '+ end_x +' '+ end_y;
                                points_to_draw+= ' A ' + core_circle_radius + ' ' + core_circle_radius + ' 0 0 0 0 '+ -core_circle_radius + ' Z';
                            }

                        }
                        else{
                            arch_end_x = radius*Math.sin(sub_angle);
                            arch_end_y = -(radius*Math.sin(sub_angle)/Math.tan(sub_angle));
                            points_to_draw = 'M0 0 L0 ' +'-'+radius +' A ' + radius + ' ' + radius + ' 0 0 1 ' + arch_end_x +' '+ arch_end_y +' L0 0 Z';
                        }

                        var path = Nwagon.createSvgElem('path', {'class':'sector','d':points_to_draw, 'fill':colors[j], 'opacity': opacity});
                        pies.appendChild(path);
                        if(angles['angles'].length){
                            angle_to_rotate = angle_in_int_accumulate + (sub_angle_in_int*k);
                        }
                        else{
                            angle_to_rotate = (angle_in_int*j)+(sub_angle_in_int*k);
                        }

						var sectors = getChartParentDiv(parentDiv).querySelectorAll('.Nwagon_'+chart_type+' .foreground .sector');
						if(sectors.length > 0){
							var sector = sectors[sectors.length-1];
							sector.setAttribute('transform','rotate('+ angle_to_rotate +')');
						}


                        var tooltip_angle = (Math.PI * (angle_to_rotate-90))/180;
                        var tooltip_y = (core_circle_radius+max) * Math.sin(tooltip_angle);
                        var tooltip_x = (core_circle_radius+max) * Math.cos(tooltip_angle);// * Math.cos(angle_to_rotate);

                        if(angles['values'].length){
                            var degree_value = angles['values'][j].toFixed(0);
                            text_to_add = names[j][k] ? (names[j][k] +' (' + degree_value + '), Value: '+ (radius-core_circle_radius).toFixed(1)) : 'undefiend';
                        }
                        else{
                            text_to_add = names[j][k] ? (names[j][k] + ', Value: '+ (radius-core_circle_radius).toFixed(1)) : 'undefiend';
                        }

                        //path.onmouseover = Nwagon.showToolTip(tooltip, tooltip_x, tooltip_y, text_to_add, 14, 7, 18);
                        //path.onmouseout = Nwagon.hideToolTip(tooltip);

						var tooltip = Nwagon.createSvgElem('title', {});
						tooltip.textContent = text_to_add;
						path.appendChild(tooltip);



                        create_data_li(text_to_add);
                    }
                }
            }
        },

        drawBackground: function(parentSVG, angles, chart_type, obj_names, obj_values, decrement, max_radius, core_circle_radius, width, height){
            var background = Nwagon.createSvgElem('g', {'class':'background'});
            parentSVG.appendChild(background);

            var data = obj_values['values'];
            if(data.length)
            {
                var angle = 360/data.length;

                //Draw arch
                var draw_bg_circles = function(radius){
                    var points_to_draw = 'M0 ' + radius + 'A ' + radius + ' ' + radius + ' 0 0 0 0' + ' -'+radius;
                    var path = Nwagon.createSvgElem('path', {'d':points_to_draw});
                    background.appendChild(path);

                    points_to_draw = 'M0 ' + radius + 'A ' + radius + ' ' + radius + ' 0 0 1 0' + ' -'+radius;
                    path = Nwagon.createSvgElem('path', {'d':points_to_draw});
                    background.appendChild(path);
                };

                if(core_circle_radius > 0){
                    draw_bg_circles(core_circle_radius);
                }
                var radius = max_radius + core_circle_radius;
                while (radius > core_circle_radius){
                    draw_bg_circles(radius);
                    radius-= decrement;
                }
                //Draw lines
                var rotate_angle = 0;
                for(var j=0; j<data.length; j++)
                {
                    if(angles.length){
                        rotate_angle+= angles[j];
                    }
                    else{
                        rotate_angle = angle * j;
                    }
                    var attributes = {'x1':'0', 'y1':-core_circle_radius, 'x2':'0', 'y2':-(max_radius+core_circle_radius), 'class':'v'};
                    var bgStraightLine = Nwagon.createSvgElem('line', attributes);
                    background.appendChild(bgStraightLine);

                    bgStraightLine.setAttribute('transform', 'rotate('+ rotate_angle +')');

                    var sub_data = data[j];
                    if(sub_data){
                        var sub_len = sub_data.length;
                        for (var k = 1; k < sub_len; k++)
                        {
                            var inner_rotate_angle = rotate_angle + (angle/sub_len*k);
                            bgStraightLine = Nwagon.createSvgElem('line', attributes);
                            background.appendChild(bgStraightLine);

                            bgStraightLine.setAttribute('transform', 'rotate('+ inner_rotate_angle +')');
                        }
                    }
                }
            }

            var fields_names = obj_values['fields'];
            var colorset = obj_values['colorset'];
            if(fields_names.length)
            {
                var fields = Nwagon.createSvgElem('g', {'class':'fields'});
                background.appendChild(fields);

                var numOfFields = fields_names.length;
                for (var i = 0; i<numOfFields; i++)
                {
                    px = width+20;
                    py = (30*i) - height ;

                    attributes = {'x':px, 'y':py, 'width':20, 'height':15, 'fill':colorset[i]};
                    var badge = Nwagon.createSvgElem('rect', attributes);
                    fields.appendChild(badge);

                    attributes = {'x':px+25, 'y':py+10, 'alignment-baseline':'central'};
                    if(helper.agentInfo.IsIE){attributes.dy='0.3em';}
                    var name = Nwagon.createSvgElem('text', attributes);
                    name.textContent = fields_names[i];
                    fields.appendChild(name);
                }
            }
        }
    },

    radar: {

        drawRadarChart: function(obj){

            var width = obj.width, height = obj.height;
            var viewbox = '-' + width/2 + ' -' + height/2 + ' ' + width + ' ' + height;
            var svg =  Nwagon.createChartArea(obj.chart_div, obj.chartType, viewbox, width, height);

            this.drawBackground(svg, obj.legend['names'].length, obj.dataset['bgColor'], CONST_DECREMENT, CONST_MAX_RADIUS);
            this.drawLabels(svg, obj.legend, CONST_MAX_RADIUS);
            this.drawCoordinates(svg, CONST_DECREMENT, CONST_MAX_RADIUS);
            this.drawPolygonForeground(obj.chart_div, svg, obj.legend, obj.dataset);
        },

        drawCoordinates: function(parentSVG, decrement, maxRadius){

            var g = Nwagon.createSvgElem('g', {'class':'xAxis'});
            var i = maxRadius, y=0.0, point=0.0;

            while (i > 0)
            {
                point = i+',' + y;

                var attributes = {'points': point, 'x':i, 'y':y, 'text-anchor':'middle'};
                var text = Nwagon.createSvgElem('text', attributes);
                text.textContent = i.toString();
                g.appendChild(text);
                i-=decrement;
            }
            parentSVG.appendChild(g);
        },

        drawLabels: function(parentSVG, legend, maxRadius){

            var labels = Nwagon.createSvgElem('g', {'class':'labels'});
            var hrefs = legend['hrefs'], names = legend['names'];
            var numOfRadars = names.length;
            var attributes = {};

            for(var index = 0; index < names.length; index++){
                var angle = (Math.PI*2)/numOfRadars; // (2*PI)/numOfRadars
                var x = 0 + (maxRadius+12) * Math.cos(((Math.PI*2)/numOfRadars) * (index));
                var y = 0 + (maxRadius+12) * Math.sin(((Math.PI*2)/numOfRadars) * (index));
                var align = (x < 0) ? 'end' : 'start';
                if(x < 1 && x > -1) align = 'middle';

                if(hrefs){
                    attributes = {'onclick':'location.href="' + hrefs[index] + '"', 'x':x, 'y':y, 'text-anchor':align, 'class':'chart_label'};
                }else{
                    attributes = {'x':x, 'y':y, 'text-anchor':align, 'class':'chart_label'};
                }
                var text = Nwagon.createSvgElem('text', attributes);
                text.textContent = names[index];

                labels.appendChild(text);
            }
            parentSVG.appendChild(labels);
        },

        drawPie: function(parentGroup, numOfRadars, maxRadius, decrement, bg_color){
            /* Draw outer solid line and then inner dotted lines  */

            var angle = (Math.PI*2)/numOfRadars;
            var p0='', p1='', p2='';
            var attributes = {}, points ='';
            var radius = maxRadius;

            var pie = Nwagon.createSvgElem('g', {'class':'pie'});

            while (radius > 0)
            {
                p0 = radius+',0'; //'100,0';
                p1 = '0,0';
                p2 = (radius*Math.sin(angle)/Math.tan(angle)) + ',' + (-radius*Math.sin(angle));

                if (radius == maxRadius)
                {
                    points = p0 + ' ' + p1 + ' ' + p2;
                    var lr = Nwagon.createSvgElem('polyline', {'points':points, 'fill': bg_color});
                    pie.appendChild(lr);
                }

                points = p0 + ' ' + p2;
                attributes =  {'points':points, 'stroke-dasharray':'2px,2px', 'fill': bg_color};
                var la = Nwagon.createSvgElem('polyline', attributes);

                pie.appendChild(la);
                radius-=decrement;
            }

            parentGroup.appendChild(pie);
            return pie;

        },

        drawBackground: function(parentSVG, numOfRadars, bg_color, decrement, maxRadius){
            var bg = bg_color ?  bg_color : '#F9F9F9';
            var angle = 360/numOfRadars;

            var background = Nwagon.createSvgElem('g', {'class':'background'});
            parentSVG.appendChild(background);

            for(var j=1; j<=numOfRadars; j++)
            {
                var current_pie = this.drawPie(background, numOfRadars, maxRadius, decrement, bg);
                current_pie.setAttribute('transform','rotate('+angle * (j-1)+')');
            }
        },

        dimmedPie: function(parentGroup, index, length)
        {
            var angle = (360/length) * index;
            var last_pie = this.drawPie(parentGroup, length, CONST_MAX_RADIUS, CONST_DECREMENT);
            last_pie.setAttribute('transform','rotate('+angle +')');
            var polylines = last_pie.querySelectorAll('polyline');
            for(var i = 0; i<polylines.length; i++){
                polylines[i].setAttribute('class','dim');
            }

            if (((index+1)%length)== 0)
            {
                this.drawPie(parentGroup, length, CONST_MAX_RADIUS, CONST_DECREMENT);
            }
            else
            {
                angle = (360/length) * (index+1);
                last_pie = this.drawPie(parentGroup, length, CONST_MAX_RADIUS, CONST_DECREMENT);
                last_pie.setAttribute('transform','rotate('+angle +')');
            }

            var polylines = last_pie.querySelectorAll('polyline');
            for(var i = 0; i<polylines.length; i++){
                polylines[i].setAttribute('class','dim');
            }
        },

        drawPolygonForeground: function(parentDiv, parentSVG, legend, data){

            var dataGroup = data['values'];
            var title = data['title'];
            var fg_color = data['fgColor'] ? data['fgColor'] : '#30A1CE';
            var istooltipNeeded = (dataGroup.length == 1) ? true : false;
            var names = legend['names'];

            var ul = getChartParentDiv(parentDiv).getElementsByTagName('ul')[0];
            if(ul){
                ul.innerHTML = title;
            }

            for(var i=0; i<dataGroup.length; i++){
                if(ul)
                {
                    var textEl = document.createElement('li');
                    textEl.innerHTML = 'Data set number ' + (i+1).toString();
                    var innerUL = document.createElement('ul');
                    textEl.appendChild(innerUL);
                    ul.appendChild(textEl);
                }
                var dataset = dataGroup[i];
                var length = dataset.length;
                var coordinate = [];
                var angle = (Math.PI/180)*(360/length);
                var pointValue = 0.0, px=0.0; py=0, attributes = {};
                var vertexes = [], tooltips =[];

                var foreground = Nwagon.createSvgElem('g', {'class':'foreground'});
                parentSVG.appendChild(foreground);

                var polygon = Nwagon.createSvgElem('polyline', {'class':'polygon'});
                foreground.appendChild(polygon);

                var tooltip = {};
                if (istooltipNeeded)
                {
                    tooltip = Nwagon.createTooltip();
                }

                for(var index =0; index < dataset.length; index++){
                    if(innerUL){
                        var innerLI = document.createElement('li');
                        innerLI.innerHTML = names[index] + ': ' + dataset[index];
                        innerUL.appendChild(innerLI);
                    }
                    pointValue = dataset[index];
                    pointDisplay = dataset[index];
                    if (typeof(dataset[index]) != 'number')
                    {
                        Nwagon.radar.dimmedPie(foreground, index, length);
                        pointValue = 0;
                        pointDisplay = dataset[index];
                    }

                    px = (index == 0) ? pointValue : pointValue*Math.sin(angle*index)/Math.tan(angle*index);
                    py = (index == 0) ? 0 : pointValue*Math.sin(angle*index);
                    coordinate.push(px + ',' + py);

                    attributes = {'cx':px, 'cy':py, 'r':3, 'stroke-width':8, 'stroke':'transparent', 'fill': fg_color};
                    var vertex = Nwagon.createSvgElem('circle', attributes);

                    if (istooltipNeeded)
                    {
                        vertex.onmouseover = Nwagon.showToolTip(tooltip, px, py, names[index] + ' : ' +  pointDisplay, 20, 15, 28);
                        vertex.onmouseout = Nwagon.hideToolTip(tooltip);
                    }
                    foreground.appendChild(vertex);
                    vertex = null;
                }

                var coordinates = coordinate.join(' ');
                var attributes = {'points':coordinates, 'class':'polygon', 'fill': fg_color, 'stroke':fg_color};
                Nwagon.setAttributes(polygon, attributes);

                if (istooltipNeeded) foreground.appendChild(tooltip);
            }
        }
    }
};








var helper = {
	agentInfo : (function() {
		var uat = navigator.userAgent.toLowerCase();
		var r ={
				IsIE : /*@cc_on!@*/false,
				IsIE6 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 6),
				IsIE7 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 7),
				IsIE8 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 8),
				IsIE9 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 9),
				IsIE10 : /*@cc_on!@*/false && (parseInt(uat.match(/msie (\d+)/)[1], 10) >= 10),
				IsIE11 : !uat.match(/msie (\d+)/) && ((uat.indexOf('trident') > 0) && (parseInt(uat.match(/trident\/(\d+)/)[1], 10) >= 7)),
				IsEdge : /edge\//.test(uat) && /chrome\//.test(uat),
				IsGecko : /gecko\//.test(uat),
				IsOpera : !!window.opera,
				IsSafari : /applewebkit\//.test(uat) && !/chrome\//.test(uat),
				IsChrome : /applewebkit\//.test(uat) && /chrome\//.test(uat),
				IsMac  : /macintosh/.test(uat),
				IsIOS5 : /(ipad|iphone)/.test(uat) && uat.match(/applewebkit\/(\d*)/)[1] >= 534 && uat.match(/applewebkit\/(\d*)/)[1] < 536,
				IsIOS6 : /(ipad|iphone)/.test(uat) && uat.match(/applewebkit\/(\d*)/)[1] >= 536
			};
		r.IsIE = r.IsIE || r.IsIE11;
		return r;
	})(),
	apply:function(target,data){
		if(data){
			$.each(data, function(name,value){
				if(target[name]){
					if(typeof(target[name])!=='object'){
						target[name]=value;
					} else {
						var val = {};
						if($.isArray(target[name])){
							val = target[name];
						} else {
							var val = {};
							helper.apply(val,target[name]);
							if(typeof value==='object'){
								helper.apply(val, value);
							}else{
								val = value;
							}
						}
						target[name] = val;
					}
				}else{
					target[name]=value;
				}
			});
		}
		return target;
	},
	getFontStyleByFormat : function(format,isSvgTextStyle){
		format = format || {};
		var css = {};
		if(format.fontSize){
			if(format.fontSize=='auto'){
				css.fontSize = '30px';
				css.height = '36px';

			} else {
				var size = parseInt(format.fontSize);
				if(size && !isNaN(size)){
					css.fontSize = format.fontSize;
					css.lineHeight = (size+11) + 'px';
					css.height = (size+11) + 'px';
				}
			}
		}
		if(format.fontFamily){
			css.fontFamily = format.fontFamily;
		}
		if(format.bold===true){
			css.fontWeight = 'bold';
		}else{
			css.fontWeight = 'normal';
		}
		if(format.italic===true){
			css.fontStyle='italic';
		}else{
			css.fontStyle='normal';
		}
		if(format.underLine===true){
			css.textDecoration='underline';
		}else{
			css.textDecoration='none';
		}
		if(format.display===true){
			css.display='block';
		}else if(format.display===false){
			css.display='none';
		}

		if(format.fontColor){
			if(isSvgTextStyle){
				//css.stroke = format.fontColor;
				css.fill = format.fontColor;
			} else {
				css.color = format.fontColor;
			}
		} else {
			if(!isSvgTextStyle){
				css.color = 'auto';
			}
		}

		return css;

	},
	uncarmelcase:function(name){
		if(name) {
			name = name.replace(/([A-Z])/,'-$1').toLowerCase();
		}
		return name;
	},
	convertCssObject2StyleAttr:function(cssObj){
		var result='';
		if(cssObj){
			var arr=[];
			$.each(cssObj,function(key,value){
				arr.push(helper.uncarmelcase(key)+':'+value);
			});
			result = arr.join(';');
		}
		return result;
	},
	getSvgTextAttributes:function(baseAttr,format){
		baseAttr = baseAttr || {};

		var formatCssObj =helper.getFontStyleByFormat(format);
		if(formatCssObj.color && formatCssObj.color!='auto'){
			baseAttr.stroke = formatCssObj.color;
			baseAttr.fill   = formatCssObj.color;
			delete formatCssObj.color;
		}
		baseAttr.style = helper.convertCssObject2StyleAttr(formatCssObj);
		return baseAttr;
	}
};

var CPSChart = {

	init:function(dom,config){


	},
	convertConfig:function(config_raw,$comp){


		var config = {};

		config.legend = config_raw.header;
		config.dataset = config_raw.dataset;
		config.maxValue = config_raw.maxValue;
		config.minValue = config_raw.minValue;
		config.increment = config_raw.increment;

		config.legendSize = 130;
		if(config_raw.dataset && config_raw.dataset.legend && config_raw.dataset.legend.format){
			if(config_raw.dataset.legend.format.display===false){
				config.legendSize=0;
			}
		}

		var titleFontSize = 30;
		if(config.dataset && config.dataset.titleFormat && config.dataset.titleFormat.display===true ){
			var size = parseInt(config.dataset.titleFormat.fontSize);
			if (!isNaN(size)){
				titleFontSize = size;
			}
		}
		//var circle_width = ($comp.width() - 150) / 2 * 2 / 3);
		var circle_width = ($comp.width() - (config.legendSize + 20)) ;
		var circle_height = $comp.height() - (titleFontSize + 30);

		circle_radius = (circle_width > circle_height)?circle_height:circle_width;
		circle_radius = parseInt(circle_radius / 2);


		switch(config_raw.chartType){

			case '00': // single column type
				config.chartType = 'column';
				break;

			case '01': // Stacked column
				config.chartType = 'stacked_column';
				break;

			case '02': // Stacked column
				config.chartType = 'multi_column';
				break;

			case '10':
				config.chartType = 'line';
				config.isGuideLineNeeded = !!config_raw.isGuideLineNeeded;
				break;
			case '20':
				config.chartType = 'donut';
				config.donut_width = parseInt(circle_radius*0.4);
				config.core_circle_radius=parseInt(circle_radius*0.6);

				break;
			case '21':
				config.chartType = 'pie';
				config.donut_width =circle_radius;
				config.core_circle_radius=0;

				break;

		}

		/*


		{
			'header': {
				names: ['EunJeong','HanSol','InSook','Eom','Pearl','SeungMin','TJ','Taegyu','YongYong'],
			},
			'dataset': {
				title: 'Playing time per day',
				posTitle: '',
				values: [5,7,2,4,6,3,5,2,10],
				colorset: ['#DC143C', '#FF8C00', "#30a1ce"]
			},
			'chartType': '00',
			'maxValue': 10,
			'increment': 1
		}

		 */

		//console.log('chart config converted : ',config)
		return config;

	},
	storage:(function(){
		var __CPS_CHART_DATA = {};

		try{
			var lsData = localStorage.getItem('CPS-CHART-DATA');
			if(!lsData) lsData='{}';
			__CPS_CHART_DATA = JSON.parse(lsData);
			//console.log('==get localstorage data',lsData);
		}catch(e){
			console.error('cannot use local storate!!',e);
		}

		return {
			save:function(id,obj){
				 __CPS_CHART_DATA[id]=obj;
				//console.log('== ls save call!', arguments)
				localStorage.setItem('CPS-CHART-DATA',JSON.stringify(__CPS_CHART_DATA));
			},
			load:function(id){
				return __CPS_CHART_DATA[id];
			}
		}
	})(),
	mask:function(uuid){
		var $chart_comp = $('[data-cps-chart-uuid="'+uuid+'"]');
		if($chart_comp.length>0){
			$chart_comp.find('div.cps-chart-mask').remove();
			var $mask=$('<div class="cps-chart-mask" style="position:absolute;left:0px;top:0px;width:100%;height:100%;background-color:rgba(255,255,255,0);z-index:9999;"></div>');
			$chart_comp.append($mask);
		}
	},
	unmask:function(uuid){
		var $chart_comp = $('[data-cps-chart-uuid="'+uuid+'"]');
		if($chart_comp.length>0){
			$chart_comp.find('div.cps-chart-mask').remove();
		}

	},
	dialog:function(uuid,opt){
		var $chart_comp = $('[data-cps-chart-uuid="'+uuid+'"]');
		var me = this;
		if($chart_comp.length>0){
			$('div.cps-chart-dialog',$chart_comp).remove();
			var $dialogBody=$('<div class="cps-chart-dialog" style="z-index:9999999;position:absolute;box-shadow: 3px 3px 5px #888888;background-color:rgb(200,200,255);border:3px solid rgba(0,0,255,0.9);border-radius:5px;right:10px;bottom:10px;width:200px;height: 30px;padding:10px;opacity:0.6; "></div>');
			var dialogText = opt.text || 'Dialog content : lorem ipsum quick squirrels fox testlorem ipsum quick squirrels fox testlorem ipsum quick squirrels fox test.';
			//$dialogBody.append('<h4>Error : </h4>');
			$dialogBody.append('<p>'+dialogText+'</p>');
			this.mask(uuid);
			$chart_comp.append($dialogBody);
			var $closeBtn = $('<div class="close"><span>x</span></div>');
			$closeBtn.click(function(){
				$dialogBody.remove();
				me.unmask(uuid);
			})
			$dialogBody.append($closeBtn);
		}

	},
	loading:function(uuid,flag){
		var $chart_comp = $('[data-cps-chart-uuid="'+uuid+'"]');
		if($chart_comp.length>0){
			$('div.cps-chart-dialog',$chart_comp).remove();
			$('div.spinner-wrap',$chart_comp).remove();
			if(!!flag){
				var $spinner=$('<div class="spinner-wrap cps-chart-dialog cps-chart-dialog-loading" style="z-index:9999999;"><p><div class="spinner"><div class="bar1"></div><div class="bar2"></div><div class="bar3"></div><div class="bar4"></div><div class="bar5"></div><div class="bar6"></div><div class="bar7"></div><div class="bar8"></div><div class="bar9"></div><div class="bar10"></div><div class="bar11"></div><div class="bar12"></div></div>Loading...</p></div>');
				this.mask(uuid);
				$chart_comp.append($spinner);
			} else{
				this.unmask(uuid);
			}
		}
	},
	load:function(uuid,url,callback){
		var me = this;
		var $chart_comp = $('[data-cps-chart-uuid="'+uuid+'"]');
		if($chart_comp.length>0){
			this.loading(uuid, true);

			callback = callback || function(uuid,config){
				CPSChart.renderChart($chart_comp.get(0),config);
			}

			var userId =$('meta[name=USER_INFO]').attr('content');

			var orgConfig = CPSChart.getChartConfig(uuid);

			$.ajax({
				type: "GET",
				async : true,

				url:CPS_CHART_DATA_URL,
				dataType:'jsonp',
				data: {
					userId:userId,
					id:orgConfig.dataId
				},
				jsonp : "callback",
				contentType : "application/javascript",
				success:function(response){

					//console.log('jsonp communication ok : ',response)

					if(!response.errorCode){
						if(response.result){
							var chartConfig = response.result;
							chartConfig.dataId = orgConfig.dataId;
							chartConfig.dataTitle = orgConfig.dataTitle;
							chartConfig.dataRefreshYN = orgConfig.dataRefreshYN;
							chartConfig.dataRefreshInterval = orgConfig.dataRefreshInterval;

							CPSChart.storage.save(uuid,chartConfig);
							//console.log(JSON.stringify(chartConfig));
							$chart_comp.find('div.cps-chart-configuration')[0].innerHTML = (JSON.stringify(chartConfig));
							CPSChart.renderChart($chart_comp.get(0),chartConfig);

							CPSChart.loading(uuid,false);
						}
					} else {
						// 오류코드 넘어온 경우
						CPSChart.loading(uuid,false);
						CPSChart.renderChart($chart_comp.get(0),orgConfig);
						CPSChart.dialog(uuid,{
							text:'ErrorCode : '+response.errorCode
						});
					}
				},
				error:function(){
					// 통신실패 or 500 err
					CPSChart.loading(uuid,false);
					CPSChart.renderChart($chart_comp.get(0),orgConfig);

					CPSChart.dialog(uuid,{
						text:'connection failed'
					});

				}


			});

		}

	},
	getChartConfig:function(uuid){
		var $chart_comp = $('[data-cps-chart-uuid="'+uuid+'"]');
		var $conf = $('.cps-chart-configuration',$chart_comp);
		var conf = {};
		//try{
            if($conf.length > 0){
                conf = JSON.parse($conf.get(0).textContent);
            }
        //}catch(e){}
		return conf;
	},
	renderChart:function(dom,config){
		var $chart_comp = $(dom);
		var $conf = $('.cps-chart-configuration',$chart_comp);
		var $draw_target = $('.cps-chart-content-body',$chart_comp);
		var USE_LOCAL_STORAGE = true;
		var CURRENT_SCREEN_MODE = 'preview';
		/*if(parent && parent.parent){
			if(window.frameElement) console.log(window.frameElement.className);
			if(window.frameElement && window.frameElement.className!=='NamoSE_preview_frame') {
				console.log('skip CPSChart.renderChart() : editing mode');
				CURRENT_SCREEN_MODE = 'cps-edit';
			} else if(window.frameElement && window.frameElement.className=='NamoSE_preview_frame'){
				// preview mode : disable local storage options
				CURRENT_SCREEN_MODE = 'cps-preview';
				USE_LOCAL_STORAGE = false;
			}
		}

		console.log('------ CPSChart:importMode - CPS_CHART_IMPORT_MODE : ',CPS_CHART_IMPORT_MODE);
		console.log('------ CPSChart:importMode - CURRENT_SCREEN_MODE : ', CURRENT_SCREEN_MODE);

		if(CPS_CHART_IMPORT_MODE=='viewer' && CURRENT_SCREEN_MODE =='cps-edit') {
			return; // skip rendering while editing mode
		}

		if(CPS_CHART_IMPORT_MODE=='editor'){
			console.log('run CPSChart.renderChart() : show dummy to prevent mouse events')
			$chart_comp.find('div.dummy').show();
		} else {
			console.log('run CPSChart.renderChart() : hide dummy to recieve mouse events')
			$chart_comp.find('div.dummy').hide();
		}
		*/
		//console.log('run CPSChart.renderChart() : preview/viewer mode',USE_LOCAL_STORAGE)


		if($conf.length && $draw_target.length){
			//console.log($conf.get(0).textContent)
			//console.log($conf.html());

			var chart_uuid = $chart_comp.data('cps-chart-uuid');

			var conf = $conf.get(0).textContent;
			try{
				conf = JSON.parse(conf);
			}catch(e){
				conf = {};
			}

			if(USE_LOCAL_STORAGE && CPS_CHART_IMPORT_MODE=='viewer'){
				// 편집모드/일반 차트에서는 로컬스토리지 데이터를 불러오지 않음.
				if(chart_uuid && conf.dataRefreshYN===true && conf.dataRefreshInterval){
					//console.log('----- CPSChart: render chart by localstorage data')
					var prevConf = this.storage.load(chart_uuid);
					if(prevConf){
						config = helper.apply({},prevConf);
						conf={};
					}
				} else {
					//console.log('----- CPSChart: render chart by chart config')

				}
			}else {
				//console.log('----- CPSChart: render chart by chart config, no local storage');
			}

			conf = helper.apply(conf,config);

			//console.log('->final conf mixed ls : ',chart_uuid,JSON.stringify(conf))
			//console.log('after apply : ',chart_uuid,conf)

			// 차트 설정 저장
			$conf.get(0).innerHTML = JSON.stringify(conf);

			/*if(USE_LOCAL_STORAGE && CPS_CHART_IMPORT_MODE=='viewer'){
				// 편집모드에서는 로컬스토리지에 데이터를 저장하지 않음.
				if(chart_uuid && conf.dataRefreshYN===true && conf.dataRefreshInterval){
					this.storage.save(chart_uuid,conf);
				}
			}*/

			conf = CPSChart.convertConfig(conf,$chart_comp);


			// 차트 제목 표시
			if(conf.dataset && conf.dataset.title) {
				$chart_comp.find('h3.cps-chart-title').html(conf.dataset.title).css({height:'auto'});
				$chart_comp.find('h3.cps-chart-title').attr('title',conf.dataset.title);
			}else{
				if(helper.agentInfo.IsGecko){
					$chart_comp.find('h3.cps-chart-title').html('').css({height:'auto'});
					$chart_comp.find('h3.cps-chart-title').attr('title','');
					conf.dataset.title ='&nbsp;';
				}else{
					$chart_comp.find('h3.cps-chart-title').html('').css({height:'auto'});
					$chart_comp.find('h3.cps-chart-title').attr('title','');
				}
			}
			var titleCss = {
				fontSize:'auto',
				fontWeight:'auto',
				fontStyle:'inherit',
				textDecoration:'inherit'
			};
			// 추가 css 정의 2016.07.26
			var contentCss = {
				width:'100%',
				margin:'0px',
				position:'absolute',
				display:'block'
			};
			var contentBodyCss = {
				width:'100%',
				height:'100%',
				position:'relative'
			};
			var contentBodySvgCss = {
				outline:'none !important'
			};
			var contentDesCss = {
				position:'absolute',
				top:'0px',
				visibility:'hidden'
			};
			var contentAccsiCss = {
				margin:'0px',
				height:'1px',
				overflow:'hidden',
				width:'1px'
			}
			if(conf.dataset.titleFormat){
				titleCss = helper.getFontStyleByFormat(conf.dataset.titleFormat);
			}
			$chart_comp.find('h3.cps-chart-title').css(titleCss);



			var titleHeight = $chart_comp.find('h3.cps-chart-title').height()+15;
			$chart_comp.find('h3.cps-chart-title').html(conf.dataset.title).css({height:titleHeight+"px"})
			// 차트 제목 위치 설정
			conf.dataset.posTitle = conf.dataset.posTitle || 'CT';
			if(conf.dataset.posTitle!==''){
				if(conf.dataset.titleFormat && conf.dataset.titleFormat.display===true){
					$chart_comp.find('h3.cps-chart-title').css('display','block');
					var posTitle = conf.dataset.posTitle;
					$chart_comp.removeClass('title-top title-bottom title-left title-center title-right');

					switch(posTitle){
					case 'LT':
						$chart_comp.addClass('title-left');
						$chart_comp.addClass('title-top');
						$chart_comp.css('text-align','left');
						$chart_comp.css('top',0);
						break;
					case 'CT':
						$chart_comp.addClass('title-center');
						$chart_comp.addClass('title-top');
						$chart_comp.css('text-align','center');
						$chart_comp.css('top',0);
						break;
					case 'RT':
						$chart_comp.addClass('title-right');
						$chart_comp.addClass('title-top');
						$chart_comp.css('text-align','right');
						$chart_comp.css('top',0);
						break;
					case 'LB':
						$chart_comp.addClass('title-left');
						$chart_comp.addClass('title-bottom');
						$chart_comp.css('text-align','left');
						$chart_comp.css('bottom',0);
						break;
					case 'CB':
						$chart_comp.addClass('title-center');
						$chart_comp.addClass('title-bottom');
						$chart_comp.css('text-align','center');
						$chart_comp.css('bottom',0);
						break;
					case 'RB':
						$chart_comp.addClass('title-right');
						$chart_comp.addClass('title-bottom');
						$chart_comp.css('text-align','right');
						$chart_comp.css('bottom',0);
						break;
					default:
						$chart_comp.addClass('title-center');
						$chart_comp.addClass('title-top');
						$chart_comp.css('text-align','center');
						$chart_comp.css('top',0);
						break;
					}

				} else {
					titleHeight=0;
					$chart_comp.find('h3.cps-chart-title').css('display','none');
				}

			} else {
				titleHeight=0;
				$chart_comp.find('h3.cps-chart-title').css('display','none');
			}

			var $chart_body = $('div.cps-chart-content',$chart_comp);
			if($chart_comp.hasClass('title-top')){
				$chart_body.css({top:titleHeight,bottom:'auto'});
			} else if($chart_comp.hasClass('title-bottom')){
				$chart_body.css({top:'auto',bottom:titleHeight});
			}
			conf.chartSize = {
				width:$chart_comp.width(),
				height:$chart_comp.height()-(titleHeight)
			};

			// 추가 css 정의 2016.07.26
			$chart_comp.find('div.cps-chart-content').css(contentCss);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').css(contentBodyCss);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body svg').css(contentBodyCss);
			//$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-description').css(contentDesCss);
			$chart_comp.find('div.cps-chart-content').find('ul.accessibility').css(contentAccsiCss).css('font-size','1px').css('line-height','1px');

			conf.chartDiv = $chart_comp.find('.cps-chart-content-body').get(0);//draw_target_id;

			// 기존 그려져 있던 차트 제거
			$draw_target.html('');

			Nwagon.chart(conf,function(){
				var caption = $chart_comp.find('ul.accessibility').get(0).outerHTML;
				$chart_comp.find('ul.accessibility').remove();
				$chart_comp.find('div.cps-chart-content-description').html(caption);

				CPSChart.loading(chart_uuid,false);
				//$chart_comp.find('.cps-chart-configuration').html(JSON.stringify(conf));

				var chartConfig = CPSChart.getChartConfig(chart_uuid);

				//console.log('-- rendered chart config : ', chartConfig)
				if(chartConfig.dataRefreshYN==true && chartConfig.dataRefreshInterval){
					var refreshTime = chartConfig.dataRefreshInterval || 30;
					setTimeout(function(){
						CPSChart.load(chart_uuid);
					},refreshTime * 1000);

				}
			});
			// 추가 css 정의 2016.07.26
			var $except = $chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.axis_infoTxt');
			/*common*/
			var commonBgtxt = {
				fontSize:'11px',
				fontFamily:'Dotum',
				fill:'#666'
			};
			var commonTooltiptxt = {
				fontSize:'11px',
				fontFamily:'Dotum',
				fill:'#777'
			};
			var commonTooltiprect = {
				fontSize:'11px',
				fontFamily:'Dotum',
				fill:'rgba(255,255,255,0.9)',
				stroke:'#ccc',
				strokeWidth:'0.5'
			};
			var commonGuideline = {
				stroke:'#4010ad',
				strokeWidth:'1'
			};
			/*$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.background text').not($except).css(commonBgtxt);
			/*$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.background .fields text').not($except).css(commonBgtxt);*/
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.foreground .labels text').not($except).css(commonBgtxt);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.tooltip text').not($except).css(commonTooltiptxt);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.tooltip rect').css(commonTooltiprect);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.guide_line').css(commonGuideline);

			/* Column Type , stacked_column , multi_column*/
			var cssChartType;
			switch(config.chartType){

				case '00': // single column type
					cssChartType = 'column';
					break;

				case '01': // Stacked column
					cssChartType = 'stacked_column';
					break;

				case '02': // Stacked column
					cssChartType = 'multi_column';
					break;
			}
			var NwagonColumnBgLh = {
				stroke:'#000',
				strokeWidth:'0.2'
			};
			var NwagonColumnBgLv = {
				stroke:'#000',
				strokeWidth:'0.1'
			};

			var NwagonColumnFgcgRect = {
				fillOpacity:'0.7',
				cursor:'pointer'
			};

			var NwagonColumnTiptxt = {
				fontSize:'9px',
				fontFamily:'Dotum',
				fill:'#777'
			};

			var NwagonColumnTiprect = {
				stroke:'#ccc',
				strokeWidth:'0.5',
				fill:'rgba(255,255,255,0.9)'
			};

			var NwagonLtxt = {
				fontSize:'11px',
				fontFamily:'Dotum',
				fill:'#666'
			};
			var NwagonBgtxt = {
				fontSize:'11px',
				fontFamily:'Dotum',
				fill:'#666'
			};
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_'+cssChartType+' .background line.h').css(NwagonColumnBgLh);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_'+cssChartType+' .background line.v').css(NwagonColumnBgLv);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_'+cssChartType+' .labels text').not($except).css(NwagonLtxt);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_'+cssChartType+' .foreground .columns g rect').css(NwagonColumnFgcgRect);
			/*$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_'+cssChartType+' .background text').not($except).css(NwagonLtxt);*/
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_'+cssChartType+' .foreground .tooltip text').not($except).css(NwagonColumnTiptxt);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_'+cssChartType+' .foreground .tooltip rect').css(NwagonColumnTiprect);
			/* Line , Area , Jira*/
			var NwagonLineBgLh = {
				stroke:'#999',
				strokeWidth:'1'
			};
			var NwagonLineBgLhd = {
				stroke:'#000',
				strokeWidth:'0.3',
				strokedashArray:'3px 1px'
			};
			var NwagonLineBgLv = {
				stroke:'#999',
				strokeWidth:'1'
			};
			var NwagonLineFglgRect = {
				fillOpacity:'0.7',
				cursor:'pointer'
			};
			var NwagonLineFgcgRect = {
				fillOpacity:'0.7',
				cursor:'pointer'
			};
			var NwagonLineFgcgCircle = {
				strokeWidth:'2px',
				cursor:'pointer'
			};
			var NwagonLinePath = {
				strokeWidth:'2px',
				fill:'none'
			};
			var NwagonLineLbtxt = {
				fontSize:'11px',
				fontFamily:'Dotum',
				fill:'#666'
			};
			var NwagonLineBgtxt = {
				fontSize:'11px',
				fontFamily:'Dotum',
				fill:'#666'
			};

			if(agentInfo.IsSafari){
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.background line.h').css(NwagonLineBgLh);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.background line.h_dash').css(NwagonLineBgLhd);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.background line.v').css(NwagonLineBgLv);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.foreground .line g rect').css(NwagonLineFglgRect);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.foreground .circles g rect').css(NwagonLineFgcgRect);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.foreground .circles circle').css(NwagonLineFgcgCircle);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.foreground .line path').css(NwagonLinePath);
			}else{
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_line .background line.h').css(NwagonLineBgLh);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_line .background line.h_dash').css(NwagonLineBgLhd);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_line .background line.v').css(NwagonLineBgLv);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_line .foreground .line g rect').css(NwagonLineFglgRect);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_line .foreground .circles g rect').css(NwagonLineFgcgRect);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_line .foreground .circles circle').css(NwagonLineFgcgCircle);
				$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_line .foreground .line path').css(NwagonLinePath);
			}
			/*$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_line .label text').not($except).css(NwagonLineLbtxt);
			$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_line .background text').not($except).css(NwagonLineBgtxt);*/

		/* pie & donut */
			var NwagonPieDn = {
				stroke:'#fff',
				strokeWidth:'1',
				cursor:'pointer'
			};
			//$chart_comp.find('div.cps-chart-content').find('div.cps-chart-content-body').find('.Nwagon_donut .foreground .donuts .sector').css(NwagonLineBgtxt);
			$chart_comp.find('div.psInner').css('width','100%').css('height','100%');
			return $chart_comp[0].outerHTML;


		}else {
			$chart_comp.html('<p>Invalid chart configuration..</p>');
		}

	},

	getDefaultColorSet : function() {
		return ARR_DEFAULT_COLORSET;
	}

}
window.CPSChart = CPSChart;
})();
