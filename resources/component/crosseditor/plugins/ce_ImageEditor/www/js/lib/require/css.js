define(['module'], function(module) {
	if(typeof window ==='undefined') return {
		load: function(name, req, onLoad, config){
			onLoad();
			return;
		}
	};
	var doc = window.document,
		docBody = doc.body || {},
		createLink = function(src) {
			var link = doc.createElement('link');
			link.type = 'text/css';
			link.rel = 'stylesheet';
			link.href = src;
			link.className = resolveClassName(src);
			return link;
		},
		resolveClassName = function(moduleName) {
			var parts = moduleName.split('/');
			var classname =  parts[parts.length - 1].replace(/\./g, '-') + '-loaded';
			return classname;
		};

	var loadedCss = {};

	return {
		load: function(name, req, load) {
			var head = doc.getElementsByTagName('head')[0],
				test,
				interval,
				link;

			test = doc.createElement('div');
			test.className = resolveClassName(name);
			test.style.cssText = 'position: absolute;left:-9999px;top:-9999px;';
			docBody.appendChild(test);

			if (!loadedCss[name]) {
				//console.log('css: load css..', name)
				link = createLink(name);
				link.onload = function() {
					//console.log(document.styleSheets)
					load();
				};
				if (doc.getElementsByTagName('link')) {
					head.insertBefore(link, doc.getElementsByTagName('link')[0]);
				} else {
					head.appendChild(link);
				}
				loadedCss[name] = true;

				var linkClassName = resolveClassName(name);
				var interval = setInterval(function() {
					var arr = doc.styleSheets;
					//console.log('lookup..', linkClassName);
					for (var i = 0, len = arr.length; i < len; i++) {
						var sheet = arr[i];
						if (sheet.ownerNode.className == linkClassName) {
							//try{
								if(sheet.addRule) {
									sheet.addRule('.' + linkClassName, 'height:10px');
								} else if(sheet.insertRule) {
									sheet.insertRule('.' + linkClassName, 'height:10px');
								}
								if (test.offsetHeight > 0) {
									docBody.removeChild(test);
									clearInterval(interval);
									load();
								}
							//}catch(e){
							//}
						}
					}
				}, 50);

			} else {
				//console.log('css: already loaded..', name)
				load();
			}

		}
	}
});
