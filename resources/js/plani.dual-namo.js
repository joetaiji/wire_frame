/**
 * 화면Info파라메타
 */
var createType = "";
var actionfrom = "";
var objectId = "";
var formaction = "";
var filePath = "";
var strOldFileInfoArray = [];
var strOldImgFileInfoArray = [];
var fileMaxSize = "";
var extFilterExclude = "";
var extFilterPermit = "";
var fileMaxCount = "";
var fileImgMaxCount = 1;
var cuManagerBoolean = true;
var cuManagerImgBoolean = true;

/**
 * NamoCrossUploader의 Manager 객체
 */
var uploader = null;
var cuManager = null;
var cuManagerImages = null;

// [추가] 여러 업로더 인스턴스를 보관
var cuManagers = {};       // { [containerId]: uploaderInstance }
var activeCuId = null;     // 현재 업로드/콜백 대상 컨테이너 ID

// [추가] 업로더별 독립적인 상태 관리
var uploaderStates = {
    // 슬라이드 업로더 상태
    'uploaderContainerSlide': {
        currentIndex: 0,
        totalFiles: 0,
        uploadedFiles: [],
        monitorTitle: '슬라이드 이미지 업로드',
        isActive: false
    },
    // 첨부파일 업로더 상태
    'uploaderContainerAttach': {
        currentIndex: 0,
        totalFiles: 0,
        uploadedFiles: [],
        monitorTitle: '첨부파일 업로드',
        isActive: false
    }
};

// [추가] 업로드 체이닝 제어
var __uploadOrder = [];          // 예: ["uploaderContainerSlide", "uploaderContainerAttach"]
var __uploadIndex = 0;           // 현재 진행 중 인덱스
var __chainedSubmit = false;     // 체이닝 모드 여부

// [추가] 안전 getter
function getCuManagerById(id) {
    return cuManagers[id] || null;
}

// [추가] 업로더 상태 업데이트
function updateUploaderState(uploaderId, data) {
    if (uploaderStates[uploaderId]) {
        Object.assign(uploaderStates[uploaderId], data);
    } else {
        console.log('Uploader state not found for:', uploaderId);
    }
}

// [추가] 업로더별 모니터 제목 설정
function setMonitorTitle(uploaderId) {
    var state = uploaderStates[uploaderId];
    if (state) {
        // 모니터 제목 요소 찾기 (여러 방법으로 시도)
        var titleElement = null;

        // 방법 1: 모니터 레이어 내의 모든 span 요소 찾기
        var monitorSpans = document.querySelectorAll('.monitorLayer span, .monitorLayer div');

        for (var i = 0; i < monitorSpans.length; i++) {
            var span = monitorSpans[i];

            // 제목으로 보이는 요소 찾기 (첫 번째 span이 보통 제목)
            if (span.textContent && (span.textContent.includes('파일') || span.textContent.includes('업로드'))) {
                titleElement = span;
                break;
            }
        }

        // 방법 2: 특정 클래스나 ID로 찾기
        if (!titleElement) {
            titleElement = document.querySelector('.monitorLayer .titleLabel, .monitorLayer [id*="title"], .monitorLayer [id*="Title"]');
        }

        // 방법 3: jQuery로 찾기
        if (!titleElement && typeof $ !== 'undefined') {
            var $monitor = $('.monitorLayer');
            if ($monitor.length > 0) {
                // 첫 번째 span이나 div를 제목으로 사용
                titleElement = $monitor.find('span:first, div:first')[0];
            }
        }

        // 방법 4: 가장 간단한 방법 - 첫 번째 텍스트가 있는 요소
        if (!titleElement) {
            var allElements = document.querySelectorAll('.monitorLayer *');
            for (var i = 0; i < allElements.length; i++) {
                var elem = allElements[i];
                if (elem.textContent && elem.textContent.trim() &&
                    (elem.textContent.includes('파일') || elem.textContent.includes('업로드'))) {
                    titleElement = elem;
                    break;
                }
            }
        }

        if (titleElement) {
            var titleText = state.monitorTitle + ' - ' + state.totalFiles + '개의 파일 중 ' + (state.currentIndex + 1) + '번째 파일을 업로드하고 있습니다.';

            titleElement.textContent = titleText;

            // jQuery가 있다면 jQuery로도 설정
            if (typeof $ !== 'undefined') {
                $(titleElement).text(titleText);
            }
        } else {
            // 제목 요소를 찾을 수 없으면 새로 생성
            var monitorLayer = document.querySelector('.monitorLayer');
            if (monitorLayer) {
                var newTitle = document.createElement('div');
                newTitle.style.cssText = 'color: white; font-weight: bold; margin: 8px 16px; font-size: 12px;';
                newTitle.textContent = state.monitorTitle + ' - ' + state.totalFiles + '개의 파일 중 ' + (state.currentIndex + 1) + '번째 파일을 업로드하고 있습니다.';

                // 첫 번째 자식으로 삽입
                if (monitorLayer.firstChild) {
                    monitorLayer.insertBefore(newTitle, monitorLayer.firstChild);
                } else {
                    monitorLayer.appendChild(newTitle);
                }
            }
        }
    }
}

//HTML의 onload 이벤트 핸들러
var onInitNamoUploader = function (type) {
    /**
     * NamoCrossUploader 객체를 생성합니다.
     * 객체의 크기 변경, Javascript로 전송하는 이벤트 이름 변경 및 기타 설정은 함수 내부를 참조해 주십시오.
     * createNamoCrossUploader 함수는 namocrossuploader.js 파일에 구현되어 있습니다.
     * 각각의 Id는 변경 가능합니다.
     */

    /*if(type.indexOf('BASE') > -1){
        createNamoCrossUploader(
            "crossUploadManager",   // NamoCrossUploader의 Manager 객체 Id
            "crossUploadMonitor",   // NamoCrossUploader의 Monitor 객체 Id
            "flashContentManager",  // NamoCrossUploader의 Manager 객체가 위치할 HTML Id (body 태크 내에 선언된 Id와 동일해야 함)
            "flashContentMonitor"   // NamoCrossUploader의 Monitor 객체가 위치할 HTML Id (body 태크 내에 선언된 Id와 동일해야 함)
        );
    }
    if(type.indexOf('IMG') > -1){
        createImagesNamoCrossUploader(
            "crossUploadManagerImages",     // NamoCrossUploader의 Manager 객체 Id
            "flashContentManagerImages"  	// NamoCrossUploader의 Manager 객체가 위치할 HTML Id (body 태크 내에 선언된 Id와 동일해야 함)
        );
    }*/
    createType = type;

    if (cuManagerBoolean) {
        if (createType.indexOf('BASE') > -1) {
            var containerId = (createType.split('&').length > 1 ? objectId.split('||')[0] : objectId);

            // ★ 이미 만들어진 업로더가 없을 때만 생성
            if (!cuManagers[containerId]) {
                var managerProperties = {};
                managerProperties.width = '900';
                managerProperties.height = '320';
                managerProperties.containerId = containerId;
                managerProperties.uploadUrl = filePath;
                managerProperties.uploadButtonVisible = false;
                managerProperties.uploadButtonDisplayStyle = 'none';

                var monitorProperties = {};
                monitorProperties.monitorLayerClass = 'monitorLayer';
                monitorProperties.monitorBgLayerClass = 'monitorBgLayer';
                monitorProperties.closeMonitorCheckBoxChecked = true;

                cuManager = namoCrossUploader.createUploader(
                    JSON.stringify(managerProperties),
                    JSON.stringify(monitorProperties),
                    JSON.stringify(window.namoCrossUploaderConfig.eventNames)
                );

                __patchUploaderInstance(cuManager);

                // 여기서 바로 감싸기
                (function (mgr) {
                    if (!mgr || mgr.__guard_patched) return;

                    // 1) progress 업데이트 가드 (manager + monitor 모두 체크)
                    var _origUpdate = mgr.updateProgressStatus;
                    if (typeof _origUpdate === 'function') {
                        mgr.updateProgressStatus = function (status, loaded, isFolder) {
                            try {
                                var curIdx = this.currentUploadItemIndex;
                                var fi = (this.getFileInfoFromMap) ? this.getFileInfoFromMap(curIdx) : null;
                                if (!fi) return; // 아직 파일 선택/row 미생성

                                // manager grid row 존재 확인
                                if (!this.dataGrid || typeof this.dataGrid.getDataItem !== 'function') return;
                                var row = this.dataGrid.getDataItem(curIdx);
                                if (!row) return;

                                // monitor grid row 존재 확인 (없으면 벤더 호출 스킵)
                                var mon = (parent && parent.fileUploadMonitor) ? parent.fileUploadMonitor : null;
                                if (mon && mon.dataGrid && typeof mon.dataGrid.getDataItem === 'function') {
                                    var monRow = mon.dataGrid.getDataItem(
                                        (this.currentMonitorUploadItemIndex != null) ? this.currentMonitorUploadItemIndex : curIdx
                                    );
                                    if (!monRow) return;
                                }
                            } catch (e) {
                                return;
                            }
                            return _origUpdate.apply(this, arguments);
                        };
                    }

                    // 2) timer 가드 (fileInfo 없을 때 조용히 리턴)
                    var _origTimer = mgr.startProgressTimer;
                    if (typeof _origTimer === 'function') {
                        mgr.startProgressTimer = function () {
                            try {
                                var fi = (this.getFileInfoFromMap) ? this.getFileInfoFromMap(this.currentUploadItemIndex) : null;
                                if (!fi) return;
                            } catch (e) {
                                return;
                            }
                            return _origTimer.apply(this, arguments);
                        };
                    }

                    mgr.__guard_patched = true;
                })(cuManager);

                if (extFilterPermit != "") cuManager.setFileFilter([extFilterPermit]);
                cuManager.setMaxTotalFileSize(fileMaxSize);
                cuManager.setAllowedFileExtension(extFilterExclude, "REVERSE");
                cuManager.setMaxFileCount(fileMaxCount);

                for (var i = 0; i < strOldFileInfoArray.length; i++) {
                    cuManager.addUploadedFile(JSON.stringify(strOldFileInfoArray[i]));
                }

                // ★ 컨테이너별로 보관
                cuManagers[containerId] = cuManager;

                // [추가] 업로더 상태 초기화
                updateUploaderState(containerId, {
                    totalFiles: cuManager.getTotalFileCount(),
                    isActive: false
                });
            }
        }

        if (cuManagerImgBoolean) {
            if (createType.indexOf('IMG') > -1) {
                var imgContainerId = (createType.split('&').length > 1 ? objectId.split('||')[1] : objectId);

                if (!cuManagers[imgContainerId]) {
                    var managerImgProperties = {};
                    managerImgProperties.width = '900';
                    managerImgProperties.height = '320';
                    managerImgProperties.containerId = imgContainerId;
                    managerImgProperties.uploadUrl = filePath;
                    managerImgProperties.uploadButtonVisible = false;
                    managerImgProperties.uploadButtonDisplayStyle = 'none';

                    var monitorImgProperties = {};
                    monitorImgProperties.monitorLayerClass = 'monitorLayer';
                    monitorImgProperties.monitorBgLayerClass = 'monitorBgLayer';
                    monitorImgProperties.closeMonitorCheckBoxChecked = true;

                    cuManagerImages = namoCrossUploader.createUploader(
                        JSON.stringify(managerImgProperties),
                        JSON.stringify(monitorImgProperties),
                        JSON.stringify(window.namoCrossUploaderConfig.eventNames)
                    );

                    var imageFilter = {"desc": "이미지 파일(jpg, jpeg)", "ext": "*.jpg;*.jpeg;*.png;*.gif;*.bmp"};
                    cuManagerImages.setFileFilter([imageFilter]);
                    cuManagerImages.setMaxTotalFileSize(fileMaxSize);
                    cuManagerImages.setAllowedFileExtension(extFilterExclude, "REVERSE");
                    cuManagerImages.setMaxFileCount(fileImgMaxCount);

                    for (var i = 0; i < strOldImgFileInfoArray.length; i++) {
                        cuManagerImages.addUploadedFile(JSON.stringify(strOldImgFileInfoArray[i]));
                    }

                    // 필요시 IMG도 맵에 보관 (키를 imgContainerId로)
                    cuManagers[imgContainerId] = cuManagerImages;

                    // [추가] 업로더 상태 초기화
                    updateUploaderState(imgContainerId, {
                        totalFiles: cuManagerImages.getTotalFileCount(),
                        isActive: false
                    });
                }
            }
        }
    }
}

/**
 * NamoCrossDownloader의 Manager 객체
 */
var cdManager = null;

/**
 * NamoCrossUploader의 Monitor 객체 생성 완료 시 호출됩니다.
 */
var onCreationCompleteMntCu = function () {
    //cuManager.setMonitorResources(document.getElementById("crossUploadMonitor").getMonitorResources());
}

/**
 * 전송창이 열릴 때 호출됩니다.
 */
var onOpenMonitorWindowCu = function () {
    window.focus();
    //document.getElementById("monitorBgLayer").style.display = "block";
    //document.getElementById("monitorLayer").style.display = "block";
}

/**
 * 예외 발생 시 호출됩니다.
 */
/*var onExceptionCu = function (params) {
    // 300~ : 일반적 예외
    // 400~ : 시스템 예외
    // 500~ : 서측에서 발생한 예외
    // 필요한 예외정보만 고객에서 보여주십시오.

    var obj = jQuery.parseJSON(params);
    alertTimeout("[예외 정보]\n" + "code : " + obj.code + "\n" + "message : " + obj.message + "\n" + "detailMessage : " + obj.detailMessage);
}*/

var onExceptionCu = function () {
    // 300~ : 일반적 예외
    // 400~ : 시스템 예외
    // 500~ : 서측에서 발생한 예외
    // 필요한 예외정보만 고객에서 보여주십시오.
    var mgr = (activeCuId && getCuManagerById(activeCuId)) ? getCuManagerById(activeCuId) : cuManager;
    var exceptionInfo = (createType.indexOf('IMG') > -1 && cuManagerImages) ? cuManagerImages.getLastExceptionInfo() : mgr.getLastExceptionInfo();
    var obj = jQuery.parseJSON(exceptionInfo);
    alert('[예외 정보]\n' + 'code : ' + obj.code + '\n' + 'message : ' + obj.message + '\n' + 'detailMessage : ' + obj.detailMessage);

    /*if (parseInt(obj.code, 10) > 400000) {
        var uploadedFilesInfo = uploader.getUploadedFilesInfo();
        document.dataForm.uploadedFilesInfo.value = uploadedFilesInfo;
        document.dataForm.action = "ErrorProcess.jsp";
        document.dataForm.submit();
    }*/
}

/**
 * 업로드 시작 시 호출됩니다.
 */
var onStartUploadCu = function () {
    //alertTimeout("업로드가 시작됐습니다.");
    // [추가] 현재 활성화된 업로더 상태 업데이트
    if (activeCuId && uploaderStates[activeCuId]) {
        var mgr = getCuManagerById(activeCuId);
        var totalFiles = mgr ? mgr.getTotalFileCount() : 0;

        updateUploaderState(activeCuId, {
            isActive: true,
            currentIndex: 0,
            totalFiles: totalFiles
        });

        // 모니터 제목 설정 (약간의 지연 후)
        setTimeout(function () {
            setMonitorTitle(activeCuId);
        }, 100);
    } else {
        console.log('No active uploader or state not found');
    }
}

/**
 * 개별 파일에 대한 업로드 시작 시 호출됩니다.
 * 필요할 경우, 주석을 풀고 사용해 주십시오.
 */
var onStartUploadItemCu = function (params) {
    /*
    var obj = jQuery.parseJSON(params);
    alertTimeout("[개별 파일에 대한 업로드 시작 정보]\n" +
        "FileName : "				+ obj.fileName + "\n" +
        "FileSize : "				+ obj.fileSize + "\n"
    );
    */

    // [추가] 현재 업로더의 인덱스 업데이트
    if (activeCuId && uploaderStates[activeCuId]) {
        var currentIndex = uploaderStates[activeCuId].currentIndex;
        updateUploaderState(activeCuId, {currentIndex: currentIndex});

        // 모니터 제목 업데이트
        setMonitorTitle(activeCuId);
    }
}

/**
 * 개별 파일에 대한 업로드 완료 시 호출됩니다.
 * 인자로 넘어온 데이터는 서버측(UploadProcess.jsp)에서 조합한 형태의 문자열입니다.
 * 샘플에서는 JSON 타입으로 넘겨주고 있습니다.
 * 필요할 경우, 주석을 풀고 사용해 주십시오.
 */
var onEndUploadItemCu = function (params) {
    /*
    var obj = jQuery.parseJSON(params);
    alertTimeout("[개별 파일에 대한 업로드 결과 정보]\n" +
        "Name : "					+ obj.name + "\n" +
        "FileName : "				+ obj.fileName + "\n" +
        "LastSavedDirectoryPath : " + obj.lastSavedDirectoryPath + "\n" +
        "LastSavedFilePathNm : "		+ obj.lastSavedFilePathNm + "\n" +
        "LastSavedFileName : "		+ obj.lastSavedFileName + "\n" +
        "FileSize : "				+ obj.fileSize + "\n" +
        "FileNameWithoutFileExt : " + obj.fileNameWithoutFileExt + "\n" +
        "FileExtension : "			+ obj.fileExtension + "\n" +
        "ContentType : "			+ obj.contentType + "\n" +
        "IsSaved : "				+ obj.isSaved + "\n" +
        "IsEmptyFile : "			+ obj.isEmptyFile
    );
    */

    // [추가] 현재 업로더의 인덱스 증가
    if (activeCuId && uploaderStates[activeCuId]) {
        var currentIndex = uploaderStates[activeCuId].currentIndex + 1;
        updateUploaderState(activeCuId, {currentIndex: currentIndex});

        // 모니터 제목 업데이트
        setMonitorTitle(activeCuId);
    }
}

/**
 * 개별 파일에 대한 업로드 취소 시 호출됩니다.
 * 필요할 경우, 주석을 풀고 사용해 주십시오.
 */
var onCancelUploadItemCu = function (params) {
    /*
    var obj = jQuery.parseJSON(params);
    alertTimeout("[개별 파일에 대한 업로드 취소 정보]\n" +
        "FileName : "				+ obj.fileName + "\n" +
        "FileSize : "				+ obj.fileSize + "\n"
    );
    */
}

/**
 * Flash로부터 호출되는 Javascript 콜백함수 내에서 alert 창을 띄우기 위한 처리로 Chrome, Firefox, Safari 브라우저의 일부 버전에 해당됩니다.
 */
var alertTimeout = function (params) {
    window.focus();
    setTimeout(function () {
        alert(params)
    }, 100);
}

/**
 * NamoCrossUploader의 Manager 객체 생성 완료 시 호출됩니다.
 */
var onCreationCompleteCu = function () {
    /*var fileUploadURL = filePathNm;
    // UI 프로퍼티를 설정합니다.
    var uiProperties = {"visibleUploadButton": false};

    // 최초 생성시 cuManager
    if(cuManagerBoolean){
        if(createType.indexOf('BASE') > -1){
            cuManager = document.getElementById("crossUploadManager");
            // upload url 설정
            cuManager.setUploadURL(fileUploadURL);
            //기존에 업로드된 파일을 추가
            for(var i=0; i<strOldFileInfoArray.length; i++){
                cuManager.addUploadedFile(strOldFileInfoArray[i]);
            }
            cuManager.setUIProperties(uiProperties);
            // 옵션 설정
            if(extFilterPermit != "") cuManager.setFileFilter([extFilterPermit]);
            // 전체 파일 크기를 제한
            cuManager.setMaxTotalFileSize(maxAtchFileSz);
            // 허용하지 않을 파일 확장자 기준으로 File Extension을 설정하시려면 setAllowedFileExtension 메소드의 두번째 파라미터에 true를 입력해 주십시오.
            cuManager.setAllowedFileExtension(extFilterExclude, true);
            // 파일 개수 제한
            cuManager.setMaxFileCount(atchPsbltyFileCnt);

            cuManagerBoolean = false;
        }
    }

    // 최초 생성시 cuManagerImgaes
    if(cuManagerImgBoolean){
        if(createType.indexOf('IMG') > -1){
            cuManagerImages = document.getElementById("crossUploadManagerImages");
            // upload url 설정
            cuManagerImages.setUploadURL(fileUploadURL);
            //기존에 업로드된 파일을 추가
            for(var i=0; i<strOldImgFileInfoArray.length; i++){
                cuManagerImages.addUploadedFile(strOldImgFileInfoArray[i]);
            }
            cuManagerImages.setUIProperties(uiProperties);
            // 옵션 설정
            // 파일 필터 설정
            var imageFilter = { "desc": "이미지 파일(jpg, jpeg)", "ext": "*.jpg;*.jpeg;*.png;*.gif;*.bmp" };
            cuManagerImages.setFileFilter([imageFilter]);
            cuManagerImages.setMaxTotalFileSize(maxAtchFileSz);
            // 실제 허용할 파일의 확장자를 설정 (filter에서는 모든 파일을 등록 했지만, 실제 업로드 할 수 있는 확장자는 아래와 같이 제한)
            cuManagerImages.setAllowedFileExtension(extFilterExclude, true);
            // 파일 개수 제한
            cuManagerImages.setMaxFileCount(fileImgMaxCount);

            cuManagerImgBoolean = false;
        }
    }*/
}

/**
 * 전송창이 닫힐 때 호출됩니다.
 */
var onCloseMonitorWindowCu = function () {
    window.focus();

    var mgr = (activeCuId && getCuManagerById(activeCuId)) ? getCuManagerById(activeCuId) : cuManager;

    // 데이터 처리 페이지로 업로드 결과를 전송합니다.
    // onEndUploadCu 나 onCloseMonitorWindowCu 이벤트 시점에 처리하시면 되며, onCloseMonitorWindowCu 시에는 getUploadStatus()를 사용하여 업로드 상태를 체크해 주십시오.
    if (mgr != null && mgr.getUploadStatus() == "COMPLETION") {
        /**
         * 업로드된 전체 파일의 정보를 가져옵니다.
         * 서버측에서 JSON 타입으로 반환했을 경우는 JSON 타입으로 가져오는 것을 권장하며, 그 외의 경우는 개별 파일 정보를 조합할 delimiter 문자(또는 문자열)를 입력해 주십시오.
         */
        var uploadedFilesInfo = mgr.getUploadedFilesInfo();
        /**
         * addUploadedFile로 추가한 전체 파일 정보를 가져옵니다.
         */
        var modifiedFilesInfo = mgr.getModifiedFilesInfo();

        // 데이터 처리 페이지로 업로드 결과를 전송합니다.
        $("#uploadedFilesInfo").val(uploadedFilesInfo);
        $("#modifiedFilesInfo").val(modifiedFilesInfo);

        // 새로운 업로더별 파일 정보 저장 로직 추가
        if (activeCuId && activeCuId.includes("Slide")) {
            $("#uploadedFilesInfoSlide").val(uploadedFilesInfo);
            $("#modifiedFilesInfoSlide").val(modifiedFilesInfo);
        } else if (activeCuId && activeCuId.includes("Attach")) {
            $("#uploadedFilesInfoAttach").val(uploadedFilesInfo);
            $("#modifiedFilesInfoAttach").val(modifiedFilesInfo);
        }

        if ($('#dialog').length > 0) {
            // 썸네일형 이미지 설명
            var idx = mgr.getTotalFileCount();
            var objUpload = jQuery.parseJSON(uploadedFilesInfo);
            if (objUpload != "") {
                for (var i = 0; i < objUpload.length; i++) {
                    $('#dialog').append('<p>' + objUpload[i].origfileName + ' 정보</p>');
                    $('#dialog').append('<input type="text" name="sbstCn" class="input_long">');
                }
            }

            //modifiedFilesInfo = modifiedFilesInfo.replace(/\"isDeleted/gi, ",\"isDeleted").replace(/\n/g, "\\n");
            var objModified = jQuery.parseJSON(modifiedFilesInfo);
            if (objModified != "") {
                for (var i = 0; i < objModified.length; i++) {
                    if (objModified[i].isDeleted == "true") {
                        $("#dialog p").each(function (j) {
                            if ($(this).text().split(" ")[0] == objModified[i].fileName) {
                                $("#dialog p").eq(j).remove();
                                $("#dialog input").eq(j).remove();
                            }
                        });
                    }
                }
            }

            // 썸네일형 이미지 설명 넣기
            fnFileSbstCnSave(idx);
        } else {
            if (__chainedSubmit) {
                __uploadIndex++;
                __startNextUpload();
            } else {
                actionfrom.attr('action', formaction);
                actionfrom.submit();
            }
        }

        // [추가] 업로더 상태 업데이트 - 업로드 완료
        if (activeCuId && uploaderStates[activeCuId]) {
            updateUploaderState(activeCuId, {
                isActive: false,
                currentIndex: 0
            });
        }
    }
};

/**
 * 업로드 완료 시 호출됩니다.
 */
var onEndUploadCu = function () {
    var mgr = (activeCuId && getCuManagerById(activeCuId)) ? getCuManagerById(activeCuId) : cuManager;

    if (createType.indexOf('BASE') > -1) {
        var uploadedFilesInfo = mgr.getUploadedFilesInfo();
        var modifiedFilesInfo = mgr.getModifiedFilesInfo();

        // 데이터 처리 페이지로 업로드 결과를 전송합니다.
        $("#uploadedFilesInfo").val(uploadedFilesInfo);
        $("#modifiedFilesInfo").val(modifiedFilesInfo);

        // 새로운 업로더별 파일 정보 저장 로직 추가
        if (activeCuId && activeCuId.includes("Slide")) {
            $("#uploadedFilesInfoSlide").val(uploadedFilesInfo);
            $("#modifiedFilesInfoSlide").val(modifiedFilesInfo);
        } else if (activeCuId && activeCuId.includes("Attach")) {
            $("#uploadedFilesInfoAttach").val(uploadedFilesInfo);
            $("#modifiedFilesInfoAttach").val(modifiedFilesInfo);
        }
    }

    if (createType.indexOf('IMG') > -1) {
        var uploadedFilesInfoImages = cuManagerImages.getUploadedFilesInfo();
        var modifiedFilesInfoImages = cuManagerImages.getModifiedFilesInfo();

        // 데이터 처리 페이지로 업로드 결과를 전송합니다.
        $("#uploadedFilesInfoImages").val(uploadedFilesInfoImages);
        $("#modifiedFilesInfoImages").val(modifiedFilesInfoImages);
    }

    if (!__chainedSubmit) {
        if (createType.indexOf('BASE') > -1 && createType.indexOf('IMG') > -1) {
            if (mgr.getTotalFileCount() == 0) {
                actionfrom.attr('action', formaction);
                actionfrom.submit();
            }
        } else if (createType.indexOf('IMG') > -1) {
            actionfrom.attr('action', formaction);
            actionfrom.submit();
        }
    } else {
        __uploadIndex++;
        __startNextUpload();
    }

    // [추가] 업로더 상태 업데이트 - 업로드 완료
    if (activeCuId && uploaderStates[activeCuId]) {
        updateUploaderState(activeCuId, {
            isActive: false,
            currentIndex: 0
        });
    }
};

/*
 * 이미지 업로드 시 설명넣기
 */
function fnFileSbstCnSave(totalFileCnt) {
    // 파일 설명 없이 바로 저장 (폼 전송만 수행)
    try {
        $('#sbstCnFirst').val('');  // 필요하다면 초기화
        $('#sbstCnArr').val('');
        actionfrom.attr('action', formaction);
        actionfrom.submit();
    } catch (e) {
        alert("File.InsertTagSelectedItems: " + e);
    }

    /*try {
        $("#dialog").dialog({
            width: 500,
            height: 400,
            resizable: false,
            modal: true,
            title: "파일 설명 넣기",
            buttons: {
                "OK": function () {

                    var sbstCnStr = "";
                    for (var i = 0; i < totalFileCnt; i++) {
                        if ($("#dialog input:eq(" + i + ")").val() == null || $("#dialog input:eq(" + i + ")").val() == "") {
                            alert("모든 첨부파일에 설명을 넣어주세요");
                            $("#dialog input:eq(" + i + ")").focus();
                            return;
                        }
                        sbstCnStr += $("#dialog input:eq(" + i + ")").val();

                        if (i != (totalFileCnt - 1)) {
                            sbstCnStr += "#";
                        }
                    }

                    $('#sbstCnFirst').val($("#dialog input:eq(0)").val());
                    $('#sbstCnArr').val(sbstCnStr);

                    actionfrom.attr('action', formaction);
                    actionfrom.submit();

                    $(this).dialog("close");

                }
            },
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
            }
        });

    } catch (e) {
        alert("File.InsertTagSelectedItems: " + e);
    }*/
}

// [교체] 다음 업로더 시작
function __startNextUpload() {
    if (__uploadIndex >= __uploadOrder.length) {
        __chainedSubmit = false;
        actionfrom.attr('action', formaction);
        actionfrom.submit();
        return;
    }

    var id = __uploadOrder[__uploadIndex];
    var mgr = getCuManagerById(id);

    if (!mgr || typeof mgr.getTotalFileCount !== 'function' || typeof mgr.startUpload !== 'function') {
        __uploadIndex++;
        __startNextUpload();
        return;
    }

    // 활성화/상태
    activeCuId = id;
    createType = 'BASE';

    // 현재 업로더를 전역 변수에 저장 (기존 업로더 보존)
    var prevManager = window.cuManager;
    window.cuManager = mgr;

    // 업로드 완료 후 이전 업로더 복원을 위한 함수
    var restorePrevManager = function () {
        window.cuManager = prevManager;
    };

    if (uploaderStates[id]) {
        var totalFiles = mgr.getTotalFileCount();
        updateUploaderState(id, {isActive: true, currentIndex: 0, totalFiles: totalFiles});
        setTimeout(function () {
            setMonitorTitle(id);
        }, 100);
    }

    // 데이터 그리드 준비 대기 (최대 2.5s)
    var tries = 0;

    function isGridReady() {
        try {
            var dg = mgr.dataGrid;
            if (!dg || typeof dg.getDataItem !== 'function') return false;

            // 0번째만 보지 말고, 현재 업로드 인덱스 기준으로 체크
            var idx = (mgr.currentUploadItemIndex != null) ? mgr.currentUploadItemIndex : 0;
            if (!dg.getDataItem(idx)) return false;

            // 모니터도 있으면 체크
            var mon = (parent && parent.fileUploadMonitor) ? parent.fileUploadMonitor : null;
            if (mon && mon.dataGrid && typeof mon.dataGrid.getDataItem === 'function') {
                var midx = (mgr.currentMonitorUploadItemIndex != null) ? mgr.currentMonitorUploadItemIndex : idx;
                if (!mon.dataGrid.getDataItem(midx)) return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    function waitReady(cb) {
        if (isGridReady() || tries++ > 50) return cb(); // 50 * 50ms ~= 2.5s
        setTimeout(function () {
            waitReady(cb);
        }, 50);
    }

    // 파일 개수/수정정보 파악
    var fileCount = 0;
    var modifiedRaw = '';
    var modifiedArr = [];

    try {
        fileCount = (typeof mgr.getTotalFileCount === 'function') ? mgr.getTotalFileCount() : 0;
    } catch (e) {
        fileCount = 0;
    }

    try {
        modifiedRaw = (typeof mgr.getModifiedFilesInfo === 'function') ? mgr.getModifiedFilesInfo() : '';
        modifiedArr = modifiedRaw ? JSON.parse(modifiedRaw) : [];
    } catch (e) {
        modifiedArr = [];
    }

    // 신규 업로드 대기 파일 수 계산 (fileInfoMap에서 NORMAL + WAIT/빈 상태만 집계)
    var pendingNewCount = 0;
    try {
        if (mgr.fileInfoMap && typeof mgr.fileInfoMap.forEach === 'function') {
            mgr.fileInfoMap.forEach(function (fi) {
                if (!fi) return;
                var isNormal = (fi.fileType === 'NORMAL' || fi.fileType == null);
                var isWaiting = (fi.status === 'WAIT' || fi.status === '' || fi.status == null);
                if (isNormal && isWaiting) pendingNewCount++;
            });
        }
    } catch (e) {
        pendingNewCount = 0;
    }

    // ===== 분기 규칙 (단순화) =====
    // pendingNewCount > 0 → 업로드 수행
    // pendingNewCount == 0 → 업로드 스킵(삭제/수정만 폼으로 전송)
    // =============================
    if (pendingNewCount > 0) {
        __patchUploaderInstance(mgr);
        waitReady(function () {
            setTimeout(function () {
                try {
                    mgr.startUpload();
                    // (이후 기존 완료/체이닝 로직 그대로 유지)
                } catch (e) {
                    // 업로드 실패 시에도 다음 단계 진행 or 에러 처리 (기존 로직대로)
                    console.warn('[plani.dual-namo] 업로드 시작 중 오류 발생:', e.message);
                }
            }, 120);
        });

    } else {
        // ▶ 업로드 없이 히든만 채운 뒤 다음 업로더/최종 제출

        try {
            // 공통 히든(혹시 서버가 공통 필드도 읽는 경우 대비)
            $("#modifiedFilesInfo").val(modifiedRaw || "[]");

            // 업로더 구분에 맞춰 히든 주입 (프로젝트 네이밍에 맞게 분기 유지)
            if (id && id.indexOf('Slide') > -1) {
                $("#uploadedFilesInfoSlide").val("[]");
                $("#modifiedFilesInfoSlide").val(modifiedRaw || "[]");
            } else if (id && id.indexOf('Attach') > -1) {
                $("#uploadedFilesInfoAttach").val("[]");
                $("#modifiedFilesInfoAttach").val(modifiedRaw || "[]");
            } else {
                $("#uploadedFilesInfo").val("[]");
                $("#modifiedFilesInfo").val(modifiedRaw || "[]");
            }
        } catch (e) {
            // 히든 필드 설정 중 오류 발생 시 로그 기록
            console.warn('[plani.dual-namo] 히든 필드 설정 중 오류 발생:', e.message);
        }

        // 체이닝 계속
        __uploadIndex++;
        __startNextUpload();
        return;
    }

}

/* ===== Namo 전역 가드 (프로토타입 레벨) : 파일 맨 아래에 추가 ===== */
(function () {
    try {
        var P = (window._FileuploadManager && window._FileuploadManager.prototype)
            ? window._FileuploadManager.prototype : null;
        if (!P || P.__patched_global_guard) return;

        // progress 업데이트 가드
        var _origUpdate = P.updateProgressStatus;
        if (typeof _origUpdate === 'function') {
            P.updateProgressStatus = function (status, loaded, isFolder) {
                try {
                    var dg = this && this.dataGrid;
                    if (!dg || typeof dg.getDataItem !== 'function') return;
                    var idx = (this.currentUploadItemIndex != null) ? this.currentUploadItemIndex : 0;
                    var item = dg.getDataItem(idx);
                    if (!item) return;

                    // 모니터도 있으면 체크
                    var mon = (parent && parent.fileUploadMonitor) ? parent.fileUploadMonitor : null;
                    if (mon && mon.dataGrid && typeof mon.dataGrid.getDataItem === 'function') {
                        var midx = (this.currentMonitorUploadItemIndex != null)
                            ? this.currentMonitorUploadItemIndex : idx;
                        var mrow = mon.dataGrid.getDataItem(midx);
                        if (!mrow) return;
                    }
                } catch (e) {
                    return;
                }
                try {
                    return _origUpdate.apply(this, arguments);
                } catch (e) {
                    return;
                }
            };
        }

        // 타이머 가드
        var _origTimer = P.startProgressTimer;
        if (typeof _origTimer === 'function') {
            P.startProgressTimer = function () {
                try {
                    var dg = this && this.dataGrid;
                    if (!dg || typeof dg.getDataItem !== 'function') return;
                    var idx = (this.currentUploadItemIndex != null) ? this.currentUploadItemIndex : 0;
                    if (!dg.getDataItem(idx)) return;
                } catch (e) {
                    return;
                }
                try {
                    return _origTimer.apply(this, arguments);
                } catch (e) {
                    return;
                }
            };
        }

        P.__patched_global_guard = true;
    } catch (e) {
        // 전역 가드 패치 적용 실패 시 로그 기록
        console.warn('[plani.dual-namo] 전역 가드 패치 적용 중 오류 발생:', e.message);
    }
})();

/* ===== per-instance guard : 업로더 인스턴스 메서드 안전 래핑 ===== */
function __patchUploaderInstance(mgr) {
    try {
        if (!mgr || mgr.__cu_patched) return;

        // updateProgressStatus 가드
        var __origUpdate = mgr.updateProgressStatus;
        if (typeof __origUpdate === 'function') {
            mgr.updateProgressStatus = function (status, loaded, isFolder) {
                try {
                    // 최소 안전 체크
                    var idx = (this.currentUploadItemIndex != null) ? this.currentUploadItemIndex : 0;
                    if (!this.dataGrid || typeof this.dataGrid.getDataItem !== 'function') return;
                    var row = this.dataGrid.getDataItem(idx);
                    if (!row) return;

                    // 모니터 그리드도 있으면 체크
                    var mon = (parent && parent.fileUploadMonitor) ? parent.fileUploadMonitor : null;
                    if (mon && mon.dataGrid && typeof mon.dataGrid.getDataItem === 'function') {
                        var midx = (this.currentMonitorUploadItemIndex != null) ? this.currentMonitorUploadItemIndex : idx;
                        if (!mon.dataGrid.getDataItem(midx)) return;
                    }
                } catch (e) {
                    return; // 사전 체크에서 뭔가 이상하면 조용히 빠짐
                }

                // 벤더 내부에서 예외 터져도 절대 밖으로 안 새게 try/catch
                try {
                    return __origUpdate.apply(this, arguments);
                } catch (e) {
                    // 진행률 표시는 포기, 업로드는 계속
                    // console.warn('[guard] updateProgressStatus swallowed:', e);
                    return;
                }
            };
        }

        // startProgressTimer 가드
        var __origTimer = mgr.startProgressTimer;
        if (typeof __origTimer === 'function') {
            mgr.startProgressTimer = function () {
                try {
                    var idx = (this.currentUploadItemIndex != null) ? this.currentUploadItemIndex : 0;
                    if (!this.dataGrid || typeof this.dataGrid.getDataItem !== 'function') return;
                    if (!this.dataGrid.getDataItem(idx)) return;
                } catch (e) {
                    return;
                }
                try {
                    return __origTimer.apply(this, arguments);
                } catch (e) {
                    return;
                }
            };
        }

        mgr.__cu_patched = true;
    } catch (e) {
        // 패치 적용 실패 시 로그 기록
        console.warn('[plani.dual-namo] 패치 적용 중 오류 발생:', e.message);
    }
}
