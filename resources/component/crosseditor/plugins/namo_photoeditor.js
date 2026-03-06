var namophotoeditorPlugin = {
	_oThis : null,
	_oPlugins : null,
	_iCmd : null,
	_iImg : null,
	_cAnchor : null,
	_anchorNode : null,
	_editAnchor : null,
	_phWin : null,
	_phDoc : null,
	maxSize : 10000,
	maxborder : 10,
	defaultBorder : 0,
	defaultAlign : "baseline",
	defaulTitle : "Namo PhotoEditor",
	fileTypeTab : -1,
	photoWidth : null,
	photoHeight : null,
	photoFlashVer : 0,

	start : function() {
		t = this;
		t._iCmd = t._oThis.pCmd;
		t._iImg = t._oThis.pBtn;
		t._cAnchor = null;
		t._anchorNode = null;
		t._phWin = null;
		t._phDoc = null;
		namoseSelection = null;

		t.fileTypeTab = -1;
		t.photoWidth = 960;
		t.photoHeight = 600;
		t.photoFlashVer = getAdobeFlashVersion().split(',').shift();

		_selection = t._oThis.getSelection();
		var sel = _selection.sel = _selection.getSelection();
		var range = _selection.range = _selection.getRange();

		if (t._editAnchor == null) {
			if (_selection.getType() == "Control") {
				cNode = _selection.getControlSelectedElement();
				if (cNode == null)
					return;

				t._cAnchor = cNode;
				if (cNode.tagName.toLowerCase() == "img") {
					t._anchorNode = cNode;
				}
			}
		} else {
			if (_selection.isFindTagNode(t._editAnchor, "img")) {
				t._anchorNode = t._editAnchor;
			}
		}

		if (agentInfo.IsIE && _selection.getType() == "Control") {
			_selection.setRangeStartEnd(t._cAnchor);
			range = _selection.range = _selection.getRange();
		}

		var divImageinsert = this.create();
		if (!divImageinsert)
			return null;

		if (t.photoFlashVer > 0 && t.photoFlashVer >= 10)
			NamoSE.Util.execSetTimeout( function() {
				t.flashEditorSetParameter();
			}, 10);

		//2016-08-02[3.5.1.04][IE11]이미지를 선택하고 포토에디터를 실행 후 수정없이 확인 버튼 클릭 시 에디터의 이미지가 삭제 되는 현상 수정
		if(agentInfo.IsIE11 && !t._oThis._editorLastRange){
			t._oThis.saveCurrentRange();
		}
		return divImageinsert;
	},
	flashEditorSetParameter : function () {
		var t = this;
		var flashScr = this._oThis.baseURL + t._oThis.config.AddPluginPath + "NamoPhotoEditor/PhotoEditor.swf";

		// 포토에디터에서 요구하는 파라미터
		var maxImageNum = t._oThis.config.ImageFolderMaxCount;
		var maxImageWidth = 0;
		if (t._oThis.params.ImageWidthLimit && String(t._oThis.params.ImageWidthLimit) != "") {
			var tempImageMaxSize = parseInt(t._oThis.params.ImageWidthLimit);
			if (!isNaN(tempImageMaxSize) && tempImageMaxSize > 0)
				maxImageWidth = tempImageMaxSize;
		}
		var maxImageBytes = t._oThis.getUploadFileSizeLimit().image;
		var checkImageTitle = (["enable", "strict"].InArray(t._oThis.getAccessibilityOptionString())) ? "true" : "false";
		var mode = (t._anchorNode == null) ? "new" : "edit_image";
		var locale = "enu";
		switch(t._oThis.baseLanguage) {
			case "ko" :
				locale = "kor";
				break;
			case "en" :
				locale = "enu";
				break;
			case "ja" :
				locale = "jpn";
				break;
			case "zh-cn" :
				locale = "chs";
				break;
			case "zh-tw" :
				locale = "cht";
				break;
			default :
				locale = "enu";
				break;
		}
		var uploadURL = escape(t._oThis.getWebSourcePath("ImageUpload"));

		// 크로스에디터에서 필요한 파라미터
		var imageUPath = (t._oThis.params.ImageSavePath == null) ? "" : t._oThis.params.ImageSavePath;
		var defaultUPath = t._oThis.baseURL + t._oThis.config.DefaultSaveImagePath;
		var imageKind = "image";
		var saveFileNameType = t._oThis.getUploadFileNameType();
		var imageUNameType = saveFileNameType.nameType;
		var imageUNameEncode = saveFileNameType.nameEncode;
		var imageViewerPlay = (t._oThis.params.UploadFileViewer == null) ? "false" : t._oThis.params.UploadFileViewer;
		var imageSizeLimit = maxImageBytes;
		var editorFrame = t._oThis.editorFrame.id;
		var savePathURL = uploadURL;
		var savePathURLExt = t._oThis.params.WebLanguage.toLowerCase();
		var imageDomain = (t._oThis.params.UserDomain && t._oThis.params.UserDomain.Trim() != "") ? t._oThis.params.UserDomain : "";
		var uploadFileSubDir = (t._oThis.params.UploadFileSubDir == null) ? "true" : t._oThis.params.UploadFileSubDir;
		var checkAlternativeText = checkImageTitle;
		var imageMaxWidth = maxImageWidth;

		if (t._oThis.params.UploadFileExecutePath && t._oThis.params.UploadFileExecutePath.indexOf(t._oThis.baseHOST) != 0) {
			if (t._oThis.params.UploadFileExecutePath.indexOf(".") != -1) {
				var tempExt = t._oThis.params.UploadFileExecutePath.substring(t._oThis.params.UploadFileExecutePath.lastIndexOf(".") + 1);
				if (["asp", "jsp", "aspx", "php"].InArray(tempExt.toLowerCase()))
					savePathURLExt = tempExt.toLowerCase();
			}
		}

		var saveActionParam = "";
		if (['jsp', 'servlet'].InArray(savePathURLExt)) {
			var paramConnector = t._oThis.getWebSourceConnertor();
			saveActionParam = paramConnector + "imageEditorFlag=flashPhoto&imageSizeLimit=" + imageSizeLimit + "&imageUPath=" + imageUPath + "&defaultUPath=" + defaultUPath + "&imageViewerPlay=" + imageViewerPlay + "&imageDomain=" + imageDomain + "&uploadFileSubDir=" + uploadFileSubDir;
		}
		savePathURL = savePathURL + escape(saveActionParam);

		var imageEditorFlashVars = "maxImageNum=" + maxImageNum
		+ "&maxImageBytes=" + maxImageBytes
		+ "&checkImageTitle=" + checkImageTitle
		+ "&mode=" + mode
		+ "&locale=" + locale
		+ "&uploadURL=" + savePathURL
		+ "&imageUPath=" + imageUPath
		+ "&defaultUPath=" + defaultUPath
		+ "&imageMaxCount=" + maxImageNum
		+ "&imageKind=" + imageKind
		+ "&imageUNameType=" + imageUNameType
		+ "&imageUNameEncode=" + imageUNameEncode
		+ "&imageViewerPlay=" + imageViewerPlay
		+ "&imageOrgPath=" + t._oThis.config.EditorMediaMimeSupport
		+ "&imageSizeLimit=" + imageSizeLimit
		+ "&editorFrame=" + editorFrame
		+ "&imageDomain=" + imageDomain
		+ "&uploadFileSubDir=" + uploadFileSubDir
		+ "&checkAlternativeText=" + checkAlternativeText
		+ "&PhotoEditorLocale=" + t._oThis.baseLanguage
		+ "&imageEditorFlag=flashPhoto"
		+ "&__Click=0" // for notes system.

		if (imageMaxWidth > 0)
			imageEditorFlashVars +=
			"&maxImageWidth=" + maxImageWidth
			+ "&imageMaxWidth=" + imageMaxWidth;

		if (t._anchorNode != null) {
			var iSrc = t._anchorNode.src;
			iSrc = iSrc.replace(/\'/g, "%27");
			var iTitle ="";

			if( t._anchorNode.title != "" || t._anchorNode.alt != "") {
				if (t._anchorNode.alt != "")
					iTitle = t._anchorNode.alt;
				if (iTitle == "" && t._anchorNode.title != "")
					iTitle = t._anchorNode.title;
			}
			iTitle = encodeURI(iTitle);

			var iBorderWidth = t._anchorNode.style.borderWidth;
			iBorderWidth = iBorderWidth.substring(0, iBorderWidth.indexOf("px"));
			if (isNaN(iBorderWidth))
				iBorderWidth = "";
			if (iBorderWidth == "" && t._anchorNode.border != "")
				iBorderWidth = t._anchorNode.border;
			var iWidth = (t._anchorNode.style.width.replace("px", "") == "") ? t._anchorNode.width : t._anchorNode.style.width.replace("px", "");
			if (isNaN(iWidth))
				iWidth = "";
			var iHeight = (t._anchorNode.style.height.replace("px", "") == "") ? t._anchorNode.height : t._anchorNode.style.height.replace("px", "");
			if (isNaN(iHeight))
				iHeight = "";

			var iId = t._anchorNode.id;
			if (!iId)
				iId = "";
			var iClass = t._anchorNode.className;
			if (!iClass)
				iClass = "";

			var iVerticalAlignVal = "";
			var iFloatStyleVal = (agentInfo.IsIE) ? t._anchorNode.style.styleFloat : t._anchorNode.style.cssFloat;
			if (iFloatStyleVal && iFloatStyleVal != "") {
				iVerticalAlignVal = iFloatStyleVal;
			} else {
				iVerticalAlignVal = (t._anchorNode.style.verticalAlign) ? t._anchorNode.style.verticalAlign : t._anchorNode.align;
			}
			if (!iVerticalAlignVal || iVerticalAlignVal == "")
				iVerticalAlignVal = t.defaultAlign;
			iVerticalAlignVal = iVerticalAlignVal.toLowerCase();
			if (iVerticalAlignVal == "texttop")
				iVerticalAlignVal = "text-top";

			imageEditorFlashVars +=
			"&editImageURL=" + iSrc
			+ "&editImageTitle=" + encodeURI(iTitle)
			+ "&editImageWidth=" + iWidth
			+ "&editImageHeight=" + iHeight
			+ "&imageTitle=" + encodeURI(iTitle)
			+ "&imageBorder=" + iBorderWidth
			+ "&imageAlign=" + iVerticalAlignVal
			+ "&imageId=" + iId
			+ "&imageClass=" + iClass
			+ "&defaultImageURL=" + iSrc
			+ "&imagemodify=true";
		}

		var flashTag = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' codebase='http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0' width='100%' height='" + (t.photoHeight - 44) + "px' id='ImageEditor'>";
		flashTag += "<param name='movie' value='" + flashScr + "'/>";
		flashTag += "<param name='flashVars' value='"+ imageEditorFlashVars + "'/>";
		flashTag += "<param name='allowScriptAccess' value='always'/>";
		flashTag += "<embed";
		flashTag += " name='ImageEditor'";
		flashTag += " allowScriptAccess='always'";
		flashTag += " hspace='0'";
		flashTag += " height='" + (t.photoHeight - 44) + "px'";
		flashTag += " width='100%'";
		flashTag += " vspace='0'";
		flashTag += " border='0'";
		flashTag += " align=''";
		flashTag += " src='" + flashScr + "'";
		flashTag += " flashVars='" + imageEditorFlashVars + "'";
		flashTag += " quality='high'";
		flashTag += " type='application/x-shockwave-flash'";
		flashTag += " pluginspage='http://www.macromedia.com/go/getflashplayer'>";
		flashTag += "</object>";

		t._phDoc.getElementById("flashTd").innerHTML = flashTag;
		if (agentInfo.IsChrome && OSInfo == "Macintosh")
			t.setWindowResizeChange(null, t._phDoc.getElementById(t._oThis.pCmd + "_plugin"));
	},
	create : function() {
		var t = this;
		t._phWin = t._oPlugins.popupOpen(t._oThis.pCmd, t.photoWidth, t.photoHeight, t.defaulTitle);
		var newPluginHolder = t._phDoc = t._oThis.createPopupPluginSpace(t._phWin);
		if (!newPluginHolder)
			return null;

		var newLayer = newPluginHolder.createElement("div");
		newLayer.id = this._oThis.pCmd + "_plugin";
		newLayer.style.width = String(t.photoWidth) + "px";
		newLayer.className = "NamoSE_shadow";
		newLayer.alt = "noClose";
		newLayer.style.zIndex = 10;
		//newLayer.style.position = "absolute";
		newLayer.style.display = "none";

		if (!(t.photoFlashVer > 0 && t.photoFlashVer >= 10)) {
			newLayer.innerHTML = "<div class='NamoSE_shadow_box p6' style='width:100%; height:100%; text-align:center;'><table cellpadding='0' cellspacing='0' class='plugin_photoeditor' style='margin:100px auto;'><tr><td><img alt='photoeditor_msg_title.gif'></td></tr><tr><td id='peditorMsgTitle' class='peditor_title'>"+ NamoSELang.PhotoEditorFlashPlayer10HigherMsg +"<br>(" + this._oThis.config.FlashPlayerUrlPath + ")</td></tr><tr><td><a href='#'><img id='peditorFlashPlayerDownload' alt='flashplayer_download.gif'></a></td></tr></table></div>";
			newPluginHolder.body.appendChild(newLayer);
			var expNewLayer = t.printFlashPlayerDownMsg(newLayer);
			return expNewLayer;
		} else {
			newLayer.innerHTML = "<div class='NamoSE_shadow_box p6' style='padding:0;' alt='noClose'><table cellpadding='0' cellspacing='0' class='plugin_photoeditor' alt='noClose'><tr><td id='flashTd'></td></tr></table><div class='btLine' style='padding-bottom:7px;' alt='noClose'><img name='confirm' alt='btn_plugin_bk_small.gif' class='NamoSE_btn_style_photo NamoSE_btn_small' /> <img name='cancel' alt='btn_plugin_bk_small.gif' class='NamoSE_btn_style_photo NamoSE_btn_small' /></div></div>";
			newPluginHolder.body.appendChild(newLayer);
		}

		var scriptTag = newPluginHolder.getElementsByTagName("head")[0].getElementsByTagName("script");
		var scriptName = "js/namo_connector.js";
		var scriptImageEditorFlag = false;
		for (i = 0; i < scriptTag.length; i++) {
			if (scriptTag[i].src.indexOf(scriptName) != -1) {
				scriptImageEditorFlag = true;
				break;
			}
		}

		if (scriptImageEditorFlag == false) {
			var javascriptTag = newPluginHolder.createElement("script");
			javascriptTag.type = "text/javascript";
			javascriptTag.src = this._oThis.baseURL + scriptName;
			newPluginHolder.getElementsByTagName("head")[0].appendChild(javascriptTag);
		}

		var btLineNode = null;
		var imgConvert = [];
		var inputClass = getTextInputBoxClass();
		var x =  this._oThis.util.getElementNodeList(newLayer, "img");

		for (var i=0; i<x.length; i++) {
			if (x[i].tagName.toLowerCase() == "img") {
				var imgTab = false;
				switch (x[i].name) {
					case 'confirm' :
						x[i].title = NamoSELang.PluginBtnConfirm;
						imgTab = true;
						imgConvert.push({
							'ele':x[i],
							'func':'execute'
						});

						break;
					case 'cancel' :
						x[i].title = NamoSELang.PluginBtnCancel;
						imgTab = true;
						imgConvert.push({
							'ele':x[i],
							'func':'cancel'
						});
						btLineNode = x[i].parentNode;
						break;
				}

				if (imgTab) {
					this._oThis.makeTabElementArea(newPluginHolder, x[i]);
					this._oThis.util.addEvent(x[i].parentNode, agentInfo.IsOpera?'keypress':'keydown', function(e) {
						t.keyDownEnter(e, newLayer)
					});
				}
			}
		}

		for (var i=0; i<imgConvert.length; i++) {
			var imgInfo = imgConvert[i];
			if (imgInfo.ele && imgInfo.ele.parentNode && imgInfo.ele.parentNode.nodeName == "A") {
				if (imgInfo.func) {
					switch (imgInfo.func) {
						case 'execute' :
							this._oThis.util.addEvent(imgInfo.ele.parentNode, 'mousedown', function(evt) {
								t.execute(evt, t)
							});
							break;
						case 'cancel' :
							this._oThis.util.addEvent(imgInfo.ele.parentNode, 'mousedown', function(evt) {
								t.cancel(evt, t)
							});
							break;
					}
				}
				this._oThis.resetButtonImgToText(newPluginHolder, imgInfo.ele, true);
			}
		}
		
		// opera에서는 unload event가 불안정해서 창이 닫히는지를 직접 체크한다.
		var operaCloseFunction = function() {
			if (!t._phWin.closed)
				NamoSE.Util.execSetTimeout(operaCloseFunction, 100);
			else 
				t.deleteDiv();
		};
		
		if (agentInfo.IsOpera)
			operaCloseFunction();
		else
			NamoSE.Util.addEvent(t._phWin, 'unload', function(e) {
				t.deleteDiv(e);
			});
		NamoSE.Util.addEvent(t._phWin, 'resize', function(e) {
			t.setWindowResizeChange(e, newLayer);
		});
		NamoSE.Util.addEvent(t._phDoc, 'contextmenu', function(e) {
			NamoSE.Util.stop(e);
			return false;
		});
		NamoSE.Util.addEvent(t._phDoc, 'keydown', function(e) {
			if (e.keyCode == 116) {
				if (agentInfo.IsIE)
					e.keyCode = 0;
				else
					NamoSE.Util.stop(e);
				return false;
			}
		});
		t._oPlugins.setSkin(t._iCmd, newLayer);
		t.createDiv(t);

		NamoSE.menuEvent.onUnSelectable(newLayer, this._oThis);

		return newLayer;

	},
	execute : function (e, t) {
		//imageEditorAction() ;
		//imageEditorAction(t._oThis.getPluginHolderDocument()) ;
		var val = '';
		var ecmd;

		if (agentInfo.IsIE) {
			try {
				if (t._oThis.getDocument().body.createTextRange().inRange(_selection.range)) {
					_selection.setRangeSelect();
				} else {
					if (_selection.checkRangeInsideEditor())
						_selection.setRangeSelect();
				}
			} catch(e) {
			}
		} else {
			_selection.setRangeSelect();
		}
		
		var setCmdExecute = function() {
			t._oThis._execCommand(ecmd, val);
		}
		namoseClass = t._oThis;
		if (t._anchorNode != null)
			namoseSelection = t._anchorNode;
		
		t._phWin.photoEditorUpload();
		
		/*
		var fphotoReturnValue = t._phWin.photoEditorUpload();
		if (fphotoReturnValue == "true") {
			t._oThis.saveHistoryInventory(false);
			ecmd = t._iCmd;
			//NamoSE.Util.execSetTimeout(setCmdExecute, 50);
		}*/
	},
	cancel : function(e, t) {
		if (agentInfo.IsIE) {
			var setCancelExecute = function() {
				try {
					if (t._oThis.getDocument().body.createTextRange().inRange(_selection.range)) {
						_selection.setRangeSelect();
					} else {
						if (_selection.checkRangeInsideEditor())
							_selection.setRangeSelect();
					}
				} catch(e) {
				}
			}
			NamoSE.Util.execSetTimeout(setCancelExecute, 10);
		}
		
		t._oThis.namoPlugins.close(t._iCmd, t._iImg);
		t._phWin.photoEditorCancel();

		//if (t._phWin)
		//	t._phWin.close();
	},
	createDiv : function(t) {
		var opacityValue = 30;
		var dlayerId = "NamoSE_BackDiv";

		try {
			var pDoc = t._oThis.getParentDocument();
			var delFrameLayer = t.deleteDiv;
			var curScreenSize = NamoSE.Util.getScreenOffset(pDoc);
			var curScrollSize = NamoSE.Util.getScrollOffset(pDoc);
			var xPos = (curScrollSize.x > curScreenSize.x) ? curScrollSize.x : curScreenSize.x;
			var yPos = (curScrollSize.y > curScreenSize.y) ? curScrollSize.y : curScreenSize.y;
			var dlayer = pDoc.createElement("DIV");
			dlayer.id = dlayerId;
			dlayer.style.display = "";
			dlayer.style.position = "absolute";
			dlayer.style.zIndex = 10010;
			dlayer.style.backgroundColor = "#000000";
			dlayer.style.width = xPos + "px";
			dlayer.style.height = yPos + "px";

			dlayer.style.left = 0;
			dlayer.style.top = 0;

			if (agentInfo.IsIE) {
				dlayer.style.filter = "alpha(opacity=" + opacityValue + ")";
			} else {
				dlayer.style.opacity = "0.30";
			}

			pDoc.body.appendChild(dlayer);
			NamoSE.Util.addEvent(dlayer, 'mousedown', function() {
				if (t._phWin.closed == true)
					delFrameLayer();
			});
		} catch(exp) {
		}

		NamoSE.Util.addEvent(parent.window, 'resize', t.setParentWindowResizeChange);

	},
	deleteDiv : function (e) {
		try {
			var pDoc = parent.window.document;
			var delDObj = pDoc.getElementById("NamoSE_BackDiv");
			if (delDObj && delDObj.parentNode) {
				delDObj.parentNode.removeChild(delDObj);
			}

			NamoSE.Util.removeEvent(parent.window, 'resize', t.setParentWindowResizeChange);
		} catch(exp) {
		}

	},
	printFlashPlayerDownMsg : function(newLayer) {
		var x = this._oThis.util.getElementNodeList(newLayer, "img");

		for (var i=0; i<x.length; i++) {
			if (x[i].tagName.toLowerCase() == "img") {
				x[i].src = this._oThis.baseURL + this._oThis.config.ImagePath + x[i].alt;
				x[i].alt= "";
				if (x[i].id == "peditorFlashPlayerDownload" && x[i].parentNode && x[i].parentNode.nodeName == "A") {
					x[i].parentNode.href = this._oThis.config.FlashPlayerUrlPath;
					x[i].alt = x[i].title = "Adobe Flash Player Download";
				}
			}
		}

		var lanClassName = this._oThis.getMutiLanguageClass();
		var pluginLanClass = lanClassName.family + " " +lanClassName.size;
		this._phDoc.getElementById("peditorMsgTitle").className += " " + pluginLanClass;
		newLayer.style.height = this.photoHeight + "px";

		this._oPlugins.setSkin(t._iCmd, newLayer);
		NamoSE.menuEvent.onUnSelectable(newLayer, this._oThis);

		return newLayer;
	},
	setParentWindowResizeChange : function(e) {
		var dlayerId = "NamoSE_BackDiv";
		var pDoc = parent.window.document;
		if (pDoc && pDoc.getElementById(dlayerId)) {
			var curScreenSize = NamoSE.Util.getScreenOffset(pDoc);
			var curScrollSize = NamoSE.Util.getScrollOffset(pDoc);
			var xPos = (curScrollSize.x > curScreenSize.x) ? curScrollSize.x : curScreenSize.x;
			var yPos = (curScrollSize.y > curScreenSize.y) ? curScrollSize.y : curScreenSize.y;
			pDoc.getElementById(dlayerId).style.width  = xPos + "px";
			pDoc.getElementById(dlayerId).style.height = yPos + "px";
		}
	},
	setWindowResizeChange : function(e, newLayer) {
		if (!newLayer)
			return;
		newLayer.style.width = (this._phDoc.documentElement.clientWidth + ((agentInfo.IsIE) ? -1 : -2)) + "px";

		var objectTagName = (agentInfo.IsIE) ? "object" : "embed";
		var objectTarget =  NamoSE.Util.getElementNodeTarget(this._phDoc.body, objectTagName);
		if (objectTarget) {
			objectTarget.height = (this._phDoc.documentElement.clientHeight - 47 + ((agentInfo.IsIE) ? 4 : 0)) + "px";
		}
	}
};