var ce_ImageEditorPlugin = {
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
	defaulTitle : "CrossEditor ImageEditor",
	fileTypeTab : -1,
	photoWidth : null,
	photoHeight : null,
	photoFlashVer : 0,

	start : function() {
		//console.log('start plugin')
		//console.log('start plugin')
		//console.log('start plugin')

		t = this;
		t._iCmd = t._oThis.pCmd;
		t._iImg = t._oThis.pBtn;
		t._cAnchor = null;
		t._anchorNode = null;
		t._phWin = null;
		t._phDoc = null;
		namoseSelection = null;

		t.fileTypeTab = -1;
		t.photoWidth = 1024;
		t.photoHeight = 768;
		//t.photoFlashVer = getAdobeFlashVersion().split(',').shift();

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

		//console.log('selected item : ',CE_ItemManager.status.SELECTED_ITEM )
		if(CE_ItemManager.status.SELECTED_ITEM) {
			var item = CE_ItemManager.status.SELECTED_ITEM;
			if (item.type !== 'image') {
				return false;
			} else {
				t._anchorNode = item.dom;
			}
		}

		var divImageinsert = this.create();
		if (!divImageinsert) {
			//console.log('--failed to open popup')
			return null;
		}
		//console.log('--load image editor..')
		t.openImageEditor();

		return divImageinsert;
	},
	openImageEditor: function() {
		t.maskParent();
		var basePath = this._oThis.baseURL + t._oThis.config.AddPluginPath;
		//console.log(basePath);
		var params = t.getEditorSetParameter();
		//window.open('../../plugins/ce_ImageEditor/www/')
		//t._phWin.location.href='../../plugins/ce_ImageEditor/www/?'+params;

		// 디버깅 종료 후 정식 패키징 시는
		// r.js 빌드 실시 후 ㅡ 아래 경로를 www -> dist 로 변경
		//t._phWin.location.href='../../plugins/ce_ImageEditor/dist/index.html';
		//t._phWin.location.href='../../plugins/ce_ImageEditor/www/index.html';
		t._phWin.location.href= basePath + 'ce_ImageEditor/www/index.html';
	},
	maskParent: function() {
		
		var t = this;
		var $ = t._oThis.$;
		var parentDoc = t._oThis.getParentDocument();
		var $mask = $('<div class="__namose_window_mask"></div>');
		$mask.css({
			position: 'absolute',
			zIndex: 999999,
			backgroundColor: 'rgba(0,0,0,0.3)',
			width: '100%',
			height: '100%',
			left: 0,
			top: 0
		}).on('click', function() {
			if(t._phWin.closed) {
				t.unmaskParent();
			}
		});

		$mask.appendTo(parentDoc.body);
	},
	unmaskParent: function() {
		var $ = this._oThis.$;
		$(t._oThis.getParentDocument()).find('.__namose_window_mask').remove();
	},
	create : function() {
		//console.log('create plugin - start')

		var t = this;
		//console.log('create plugin - open popup')
		t._phWin = t._oPlugins.popupOpen(t._oThis.pCmd, t.photoWidth, t.photoHeight, t.defaulTitle);
		var newPluginHolder = t._phDoc = t._oThis.createPopupPluginSpace(t._phWin);
		if (!newPluginHolder) {
			//console.log('create plugin - open popup failed..')
			return null;
		}

		//console.log('create plugin - set up events..')
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
		return true;


	},
	getEditorSetParameter : function () {
		var t = this;

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
			+ "&editImageTitle=" + iTitle
			+ "&editImageWidth=" + iWidth
			+ "&editImageHeight=" + iHeight
			+ "&imageTitle=" + iTitle
			+ "&imageBorder=" + iBorderWidth
			+ "&imageAlign=" + iVerticalAlignVal
			+ "&imageId=" + iId
			+ "&imageClass=" + iClass
			+ "&defaultImageURL=" + iSrc
			+ "&imagemodify=true";
		}

		//console.log(' req params : defaultImageURL - ', iSrc)

		return imageEditorFlashVars;

	},
	getInitialData: function() {
		var t = this;

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


		var result_obj = {};

		result_obj['maxImageNum'] = maxImageNum;
		result_obj['maxImageBytes'] = maxImageBytes;
		result_obj['checkImageTitle'] = checkImageTitle;
		result_obj['mode'] = mode;
		result_obj['locale'] = locale;
		result_obj['savePathURL'] = savePathURL;
		result_obj['imageUPath'] = imageUPath;
		result_obj['imageMaxCount'] = maxImageNum;
		result_obj['maxImageNum'] = maxImageNum;
		result_obj['imageKind'] = imageKind;
		result_obj['imageUNameType'] = imageUNameType;
		result_obj['imageUNameEncode'] = imageUNameEncode;
		result_obj['imageViewerPlay'] = imageViewerPlay;
		result_obj['imageOrgPath'] = t._oThis.config.EditorMediaMimeSupport;
		result_obj['imageSizeLimit'] = imageSizeLimit;
		result_obj['editorFrame'] = editorFrame;
		result_obj['uploadFileSubDir'] = uploadFileSubDir;
		result_obj['checkAlternativeText'] = checkAlternativeText;
		result_obj['PhotoEditorLocale'] = t._oThis.baseLanguage;
		result_obj['imageEditorFlag'] = 'flashPhoto';
		result_obj['__Click'] = 0;

		if (imageMaxWidth > 0){
			result_obj['maxImageWidth'] = maxImageWidth;
			result_obj['imageMaxWidth'] = imageMaxWidth;

		}

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

			result_obj['editImageURL'] = iSrc;
			result_obj['editImageTitle'] = iTitle;
			result_obj['editImageWidth'] = iWidth;
			result_obj['editImageHeight'] = iHeight;
			result_obj['imageTitle'] = iTitle;
			result_obj['imageBorder'] = iBorderWidth;
			result_obj['imageAlign'] = iVerticalAlignVal;
			result_obj['imageId'] = iId;
			result_obj['imageClass'] = iClass;
			result_obj['defaultImageURL'] = iSrc;
			result_obj['imagemodify'] = true;

		}
		// 2017.05.12 add by nkpark (config.xml파일에서 캔버스 크기 설정 획득)
		result_obj['CanvasWidth'] = t._oThis.params.CanvasWidth || 800;
		result_obj['CanvasHeight'] = t._oThis.params.CanvasHeight || 600;
		//console.log(' req params : defaultImageURL - ', iSrc)
		return result_obj;
	},
	upload: function(obj) {
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
		var t = this;
		var $ = this._oThis.$;
		obj = dataURItoBlob(obj);
		var saveFileSizeLimit =  t._oThis.getUploadFileSizeLimit();

		var objType = null;
		if(obj.type && obj.type.indexOf("image") != -1){
			objType = "image";
		}else if(obj.type && obj.type.indexOf("video") != -1){
			objType = "movie";
		}else{
			return false;
		}

		if(objType == "image" && obj.size > saveFileSizeLimit.image){
			setInsertImageFile("invalid_size", saveFileSizeLimit.image);
			return false;
		}else if(objType == "movie" && obj.size > saveFileSizeLimit.movie){
			setInsertImageFile("invalid_size", saveFileSizeLimit.movie);
			return false;
		}

		var imageDomain = (t._oThis.params.UserDomain && t._oThis.params.UserDomain.Trim() != "") ? t._oThis.params.UserDomain : "";
		//var filename = obj[0].name || "";//(obj[0].type.indexOf('/') > 0)?"copyImage." + obj[0].type.substring(obj[0].type.indexOf('/')+1):"copyImage.png";
		var filename = "pasteimage";
		var tempFilename = t._oThis.util.getBase64Encode(filename)
		var saveFileNameType = t._oThis.getUploadFileNameType();
		var nameType = saveFileNameType.nameType;
		var nameEncode = saveFileNameType.nameEncode;
		var savePathURL = t._oThis.getWebSourcePath('ImageUpload');
		var savePathURLExt = t._oThis.params.WebLanguage.toLowerCase();	//나중에 이미지 확장자 필터 필요
		var useExternalServer = "";
		var imageUPath = (t._oThis.params.ImageSavePath == null) ? "" : t._oThis.params.ImageSavePath;
		var defaultUPath = t._oThis.baseURL + t._oThis.config.DefaultSaveImagePath;
		//var fileType = (obj[0].type.indexOf('/') > 0)? obj[0].type.substring(obj[0].type.indexOf('/')+1):"";
		var fileType = (obj.type.indexOf('/') > 0)? obj.type.substring(obj.type.indexOf('/')+1):"";

		// 업로드 서버가 따로 있는 경우 return Url을 담는다.
		if (t._oThis.params.UploadFileExecutePath && t._oThis.params.UploadFileExecutePath.indexOf(t._oThis.baseHOST) != 0) {
			var saveWebLan = (t._oThis.params.WebLanguage.toLowerCase() == "asp.net") ? "aspx" : t._oThis.params.WebLanguage.toLowerCase();
			useExternalServer = t._oThis.baseURL + "websource/" + t._oThis.params.WebLanguage.toLowerCase() + "/ImageUploadExecute." + saveWebLan;

			if (t._oThis.params.UploadFileExecutePath.indexOf(".") != -1) {
				var tempExt = t._oThis.params.UploadFileExecutePath.substring(t._oThis.params.UploadFileExecutePath.lastIndexOf(".") + 1);
				if (["asp", "jsp", "aspx", "php"].InArray(tempExt.toLowerCase()))
					savePathURLExt = tempExt.toLowerCase();
			}
		}

		var formData = new FormData();
		formData.enctype='multipart/form-data';

		formData.append('imageSizeLimit', saveFileSizeLimit.image); //ok
		formData.append('imagemodify', '');	//없음
		formData.append('imageEditorFlag', '');//없음

		//formData.append('uploadFileSubDir', true);//직접입력값
		var uploadFileSubDir = (t._oThis.params.UploadFileSubDir == null) ? "true" : t._oThis.params.UploadFileSubDir;
		formData.append('uploadFileSubDir', uploadFileSubDir);

		formData.append('imageDomain', imageDomain);	//ok
		formData.append('imageInsertFlag1', '1');
//		formData.append('imageFile_Text', 'C:\\fakepath\\' + filename);//test 필요

		var inputFileName = "imageFile";
		if(t._oThis.params.InputFileName){
			inputFileName = t._oThis.params.InputFileName;
		}
		//console.log(obj);
//		if (filename) {
//			formData.append('imageFile_Text', 'C:\\fakepath\\' + filename);//test 필요
//		}


		if(obj.constructor.name == 'DataTransferItem') {
			formData.append(inputFileName, obj.getAsFile());
		} else {
			// 폼 없이 blob 만으로 업로드시 처리
			//
			if(agentInfo.IsIE) {
			}
			//var fileFromBlob = new File([obj[0]], 'upload.png');
//			formData.append(inputFileName, fileFromBlob)
			//
//			obj[0].lastModifiedDate = new Date();
//			obj[0].name = tempFilename +'upload.png';
			formData.append(inputFileName, obj);
			//formData.append(inputFileName, obj[0], tempFilename + 'upload.png');
			formData.append('imageFile_Text', 'C:\\fakepath\\' + 'upload.png');//test 필요
		}
		formData.append('__Click', '0');
		formData.append('imageInputUrl', '');//없음
		formData.append('imageTitle', 'external_image');
		formData.append('imageTitleView', 'external_image');
		formData.append('imageAlt', 'external_image');
		formData.append('imageAltView', 'external_image');
		formData.append('imageWidth', '');
		formData.append('imageWidthUnit', 'px');
		formData.append('imageHeight', '');
		formData.append('imageHeightUnit', 'px');
		formData.append('imageMaginLeft', '');
		formData.append('imageMaginLeftUnit', 'px');
		formData.append('imageMaginRight', '');
		formData.append('imageMaginRightUnit', 'px');
		formData.append('imageMaginTop', '');
		formData.append('imageMaginTopUnit', 'px');
		formData.append('imageMaginBottom', '');
		formData.append('imageMaginBottomUnit', 'px');
		formData.append('imageAlign', 'baseline');
		formData.append('imageBorder', '0');
		formData.append('imageId', '');
		formData.append('imageClass', '');
		formData.append('imageUPath', imageUPath);
		formData.append('defaultUPath', defaultUPath);//test 필요
		formData.append('imageMaxCount', t._oThis.config.ImageFolderMaxCount);
		formData.append('imageKind', 'image');
		formData.append('imageTempFName', tempFilename);
		formData.append('imageUNameType', nameType);
		formData.append('imageUNameEncode', nameEncode);//nameEncode
		formData.append('imageViewerPlay', false);
		formData.append('imageOrgPath', (t._oThis.config.EditorMediaMimeSupport == "True") ? filename : "");//test 필요
		formData.append('editorFrame', t._oThis.editorFrame.id);
		formData.append('useExternalServer', useExternalServer);
		formData.append('checkPlugin', 'false');
		formData.append('fileType', fileType);
		var saveActionParam = "";

		//if (['jsp', 'servlet'].InArray(savePathURLExt)) {
		if(savePathURL.substr(savePathURL.lastIndexOf(".")).toLowerCase() == ".jsp"){
			var paramConnector = t._oThis.getWebSourceConnertor();
			saveActionParam = paramConnector + "imageSizeLimit=" + saveFileSizeLimit.image + "&imageUPath=" + imageUPath + "&defaultUPath=" + defaultUPath + "&imageViewerPlay=false&imageDomain=" + imageDomain + "&uploadFileSubDir=" + uploadFileSubDir + "&useExternalServer=" + useExternalServer + "&checkPlugin=false&fileType=" + fileType;
		}

		var deferred = $.Deferred();
		var xhr = new XMLHttpRequest();
		xhr.open('POST', savePathURL + saveActionParam);	//savePathURL

		xhr.onload = function (res) {
			//console.log(arguments)
		  if (xhr.status === 200) {
			  //console.log('upload result : ' , xhr.responseText)
				try{
					deferred.resolve(xhr.responseText);
					/*
					var param = JSON.parse(xhr.responseText);

					if(param != null) {
						var result, addmsg, addmsg2 = "";
						result = param.result;
						addmsg = JSON.stringify(param.addmsg);
						if(addmsg != null && addmsg.length > 0 ) {
							addmsg2 = addmsg.substring(addmsg.indexOf('[') + 1, addmsg.lastIndexOf(']'));
						}
						deferred.resolve(param);
					}
					*/

				} catch(e) {
					//console.error(e);
					deferred.resolve(xhr.responseText);
				}

			} else {
				deferred.reject(xhr);
			//alert("이미지 업로드 실패하였습니다. 다시 시도해주세요");
			}
		};

		xhr.send(formData);
		return deferred.promise();

	},
	execute : function (data, t) {
		t = t || this;

		var $ = t._oThis.$;
		//console.log('execute plugin')
		//console.log('execute plugin')
		//console.log('execute plugin')
		//imageEditorAction() ;
		//imageEditorAction(t._oThis.getPluginHolderDocument()) ;
		var val = '';
		var ecmd;

		if (agentInfo.IsIE) {
			//try {
				if (t._oThis.getDocument().body.createTextRange().inRange(_selection.range)) {
					_selection.setRangeSelect();
				} else {
					if (_selection.checkRangeInsideEditor())
						_selection.setRangeSelect();
				}
			//} catch(e) {
				//console.error(e);
			//}
		} else {
			_selection.setRangeSelect();
		}

		if(data && data.error){
			if(data.error == "UploadFileExtBlock"){
				alert(NamoSELang.AdminPageUploadFileExtBlockList);
			}
			return;
		}

		var setCmdExecute = function() {
			t._oThis._execCommand(ecmd, val);
		}
		namoseClass = t._oThis;
		if (t._anchorNode != null)
			namoseSelection = t._anchorNode;


		//try{
			var idoc = t._oThis.editorFrame.contentWindow.document;
			var item = CE_ItemManager.status.SELECTED_ITEM;
			if(item && data.mode==='ITEM') {
				//console.log('INSERT_IMAGE with selected item', data)
				var img = item.dom;
				var $img = $(img);
				$img.attr('src', data.src);
				$img.attr('namose_imgsetuptemp', 'True');
				$img.css('width', data.width);
				$img.css('height', data.height);
				if(data.alt) {
					$img.attr('alt', decodeURI(data.alt));
				}
				item.select();
			} else {
				//console.log('INSERT_IMAGE on text', data);
				data.alt = data.alt || '';
				var img = '<img alt="'+decodeURI(data.alt)+'" src="'+data.src+'" style="width:'+data.width+'px;height:'+data.height+'px;" namose_imgsetuptemp="True"/>';
				//var idoc = t._oThis.editorFrame.contentWindow.document;

				if(agentInfo.IsIE) {
					var sel = idoc.selection;
					var range = sel.createRange();
					range.pasteHTML(img);
				} else if(agentInfo.IsIE11 || agentInfo.IsSafari || agentInfo.IsEdge || agentInfo.IsGecko || agentInfo.IsChrome){
					var nodeSelection = t._oThis.getSelection();
					nodeSelection.sel = nodeSelection.getSelection();
					nodeSelection.setInsertHTML(img);
				} else {
					var pNode = _selection.range.commonAncestorContainer;

					if(!pNode.firstChild) {
						$(pNode).html('&nbsp;');
					}
					_selection.sel.collapse(pNode.firstChild, 0);
					//console.log(t)
					idoc.execCommand("InsertHTML", false, img||null);
				}
				CE_ItemManager.insertItem();

				// 2019.09.18 hoha1231 [CROSS4-1987] Chrome > 포토에디터로 이미지를 삽입하는 경우, placeholder가 그대로 출력됨
				if (idoc.body.className.indexOf('modePlaceHolder') >= 0) {
					idoc.body.className = "";
				}

			}

			var insertImg = $(idoc).find("img[namose_imgsetuptemp]").get(0);
			if(insertImg){
				checkInsertImageMaxSize(idoc, insertImg.offsetWidth, insertImg.offsetHeight, "px", "px", insertImg);

				var e = [];
				t._oThis.getImageDeleteInfo(e, insertImg.src);
			}

			if(t._oThis.params.event.CBInsertedImage || t._oThis.params.event.CBInsertedImageEx){
				
				if(insertImg && t._oThis.params.event.CBInsertedImage){
					t._oThis.params.event.CBInsertedImage(insertImg, "0");
				}
				if(insertImg && t._oThis.params.event.CBInsertedImageEx){
					var obj = {};
					obj.element = insertImg;
					obj.type = "0";
					obj.size = data.size;
					obj.path = insertImg.src;
					t._oThis.params.event.CBInsertedImageEx(obj);
				}
			}
		//} catch(e) {
			//console.log(e);
		//}

		t.unmaskParent();

	},
	cancel : function(e, t) {
		t = t || this;
		if (agentInfo.IsIE) {
			var setCancelExecute = function() {
				//try {
					if (t._oThis.getDocument().body.createTextRange().inRange(_selection.range)) {
						_selection.setRangeSelect();
					} else {
						if (_selection.checkRangeInsideEditor())
							_selection.setRangeSelect();
					}
				//} catch(e) {
				//}
			}
			NamoSE.Util.execSetTimeout(setCancelExecute, 10);
		}
		t.unmaskParent();
		t._oThis.namoPlugins.close(t._iCmd, t._iImg);
		//t._phWin.photoEditorCancel();

		//if (t._phWin)
		//	t._phWin.close();
	}
};
