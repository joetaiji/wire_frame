/*
 * NamoCrossUploader program file.
 * Copyright NAMO Interactive Inc.
 */
var __NamoCrossUploaderUtils = function () {
    this.s4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    this.getGuid = function () {
        var guid = (this.s4() + this.s4() + "-" + this.s4() + "-4" + this.s4().substr(0, 3) + "-" + this.s4() + "-" + this.s4() + this.s4() + this.s4()).toLowerCase();
        return guid;
    };

    this.stringFormat = function () {
        var expression = arguments[0];
        for (var i = 1; i < arguments.length; i++) {
            var pattern = "{" + (i - 1) + "}";
            expression = expression.replace(pattern, arguments[i]);
        }
        return expression;
    };

    this.convertByteUnit = function (number) {
        var unitLevel = 0;
        var unit = "";
        var resultString = "";

        if (number / 1000.0 / 1000.0 / 1000.0 > 1) {
            unit = "GB";
            unitLevel = 3;
        } else if (number / 1000.0 / 1000.0 > 1) {
            unit = "MB";
            unitLevel = 2;
        } else if (number / 1000.0 > 1) {
            unit = "KB";
            unitLevel = 1;
        } else {
            //unit = "Bytes"; 
            unit = "B";
            unitLevel = 0;
        }
        resultString = this.convertByteUnitWithLevel(number, unitLevel);
        resultString += unit;
        return resultString;
    };

    this.convertByteUnitWithLevel = function (number, unitLevel) {
        var resultString = "";
        var calculatedNumber = 0;

        if (unitLevel == 3)
            calculatedNumber = number / 1024.0 / 1024.0 / 1024.0;
        else if (unitLevel == 2)
            calculatedNumber = number / 1024.0 / 1024.0;
        else if (unitLevel == 1)
            calculatedNumber = number / 1024.0;
        else
            calculatedNumber = Number(number);

        resultString = this.numberFormat(calculatedNumber);
        return resultString;
    };

    this.numberFormat = function (number, precision) {
        if (precision == undefined)
            precision = 2;

        number = number.toFixed(precision);
        var parts = number.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    };


    this.getJsonString = function (keys, values) {
        if (keys == undefined || keys.length == 0)
            return '{}';

        var json = '';
        for (var i = 0; i < keys.length; i++) {
            json += ('"' + keys[i].toString() + '":');
            json += ('"' + values[i].toString() + '",');
        }
        if (json.length > 0)
            json = '{' + json.substring(0, json.length - 1) + '}';

        return json;
    };

    this.getPxFromPercent = function (parentId, wh) {
        if (parentId == undefined || parentId.length == 0)
            return 0;

        var pxSize = wh == "WIDTH" ? $("#" + parentId).width() : $("#" + parentId).height();
        if (pxSize == null)
            return 0;
        else
            return pxSize;
    };

    this.getDigitString = function (data) {
        if (data == undefined || data.trim() == "")
            return "";

        var minus = "";
        if (data.trim().substring(0, 1) == "-")
            minus = "-";

        var regExp = /[^0-9]/g;
        return (minus + data.replace(regExp, ""));
    }
    this.getFileExtension = function (fileName) {
        var pos = fileName.lastIndexOf(".");
        if (pos != -1)
            return fileName.substring(pos + 1).toLowerCase();
        else
            return "";
    }
};

var __UploadFileInfo = function () {
    this.id = '';
    this.fileType = 'NORMAL'; // NORMAL, UPLOADED, FOLDER
    this.folderId = '';     // 폴더 추가시 파일 리스트를 관리하는 폴더 아이디
    this.fileId = '';       // 게시판 수정모드를 위한 사용
    this.file;
    this.fileDirPath = '';
    this.fileName = '';
    this.fileSize = 0;
    this.status = 'WAIT'; // WAIT, COMPLETION, CANCELLATION
    this.isDeleted = false;
    this.transferedSize = 0;
    this.xmlHttpRequest = null;

    // resume
    this.fileGroupId = '';
    this.fileNameKey = '';
    this.tempFileSize = 0;
    this.tempFileUpdatedDate;
    this.isExistedFile = false;
};

var __DownloadFileInfo = function () {
    this.id = '';
    this.fileId = '';
    this.fileName = '';
    this.fileSize = 0;
    this.fileUrl = '';
};

var __Global = function () {


    // Max file size
    this.MAX_FILE_SIZE = 2147483647; // (1024*1024*1024*2)-1

    // 일반적 예외 코드 정의 
    this.ALLOWED_EXTENSION_ERROR = "300101";
    this.MAX_FILE_COUNT_ERROR = "300102";
    this.MAX_FILE_SIZE_ERROR = "300103";
    this.MAX_TOTAL_FILE_SIZE_ERROR = "300104";
    //this.EMPTY_FILES_TO_TRANSFER_ERROR = "300105";

    // 서버측 예외 코드 정의
    this.HTTP_STATUS_ERROR = "500501";
}


var __FileUploadManager = function (_parent) {
    var self = this;
    var parent = _parent;
    this.utils = new __NamoCrossUploaderUtils();
    this.global = new __Global();
    this.containerId = "";

    this.mainPanel = this.utils.getGuid();

    this.buttonPanel = this.utils.getGuid();
    this.addFilesButton = this.utils.getGuid();
    this.addFolderButton = this.utils.getGuid();
    this.fileButton = this.utils.getGuid();
    this.folderButton = this.utils.getGuid();
    this.uploadButton = this.utils.getGuid();

    this.downloadButton = this.utils.getGuid();
    this.downloadLink = this.utils.getGuid();
    this.downloadButtonOnStatus = this.utils.getGuid();
    this.downloadAllButtonOnStatus = this.utils.getGuid();

    this.topSplitLine = this.utils.getGuid();

    this.managerDataGrid = this.utils.getGuid();

    this.statusPanel = this.utils.getGuid();
    this.deleteFileButton = this.utils.getGuid();
    this.addFilesButtonOnStatus = this.utils.getGuid();
    this.statusLabel = this.utils.getGuid();

    this.imagePreviewBgPanel = this.utils.getGuid();
    this.imagePreviewPanel = this.utils.getGuid();
    this.previewImage = this.utils.getGuid();
    this.imagePreviewLayerClass = "";
    this.imagePreviewBgLayerClass = "";


    this.width = 0;
    this.height = 0;
    this.buttonPanelHeight = 40;
    this.buttonWidth = 92;
    this.buttonHeight = 30;
    this.topSplitLineHeight = 1;
    this.statusPanelHeight = 28;
    this.statusHeight = 20;
    this.deleteFileButtonHeight = 20;
    this.deleteFileButtonWidth = 60;
    this.addFilesButtonHeightOnStatus = 20;
    this.addFilesButtonWidthOnStatus = 60;
    this.statusLabelHeight = 20;

    this.uploadButtonVisible = true;

    this.defaultMargin = 4;
    this.leftMargin = 10;
    this.rightMargin = 10;
    this.topMargin = 5;

    this.fileInfoMap = new Map();
    this.childFileInfoList = [];
    this.folderInfoMap = new Map();
    this.totalFileSize = 0;
    this.totalUploadedFileSize = 0;
    this.totalUploadedFileSizeForFolder = 0;
    this.currentUploadItemIndex = 0;
    this.currentUploadItemIndexForFolder = 0;
    this.uploadUrl = "";
    this.configUrl = "";
    this.uploadedFileInfoList = [];
    this.modifiedFilesInfoList = [];

    this.dataGrid;

    this.fontFamily = "Malgun Gothic";

    // event
    this.onStartUpload = "";
    this.onStartUploadItem = "";
    this.onEndUploadItem = "";
    this.onEndUpload = "";
    this.onCloseMonitorWindow = "";
    this.onCancelUploadItem = "";
    this.onException = "";
    this.onDblClickGridRow = "";

    this.uploadStatus = "WAIT";

    this.progressTimer;
    this.startTime = 0; // for checking speed
    this.lastExceptionInfo = '';

    this.allowedFileExtensionList = [];
    this.fileExtensionCheckMode = "NORMAL"; // NORMAL, REVERSE
    this.maxFileCount = -1;
    this.maxTotalFileSize = -1;
    this.maxFileSize = this.global.MAX_FILE_SIZE;
    this.uploadMode = "BASIC"; // BASIC, LARGE, RESUME
    this.fileGroupId = "";

    this.selectedResumeMode = "NEW"; // NEW, RESUME

    this.isAsc = true;
    this.currentSortCol = "";
    this.create = function (properties, eventNames) {
        this.setEvnetNames(eventNames);
        this.setProperties(properties);
        //this.createControls();
        this.setEventHandler();
        this.setUploadStatus("WAIT");
        this.setLastExceptionInfo('');
    };

    this.setProperties = function (properties) {
        /*
        var obj = jQuery.parseJSON(properties);

        if (obj.width.lastIndexOf("%") != -1)
            this.width = Math.round(this.utils.getPxFromPercent(obj.containerId, "WIDTH") / 100 * this.utils.getDigitString(obj.width));
        else
            this.width = this.utils.getDigitString(obj.width);

        if (obj.height.lastIndexOf("%") != -1)
            this.height = Math.round(this.utils.getPxFromPercent(obj.containerId, "HEIGHT") / 100 * this.utils.getDigitString(obj.height));
        else
            this.height = this.utils.getDigitString(obj.height);

        this.containerId = obj.containerId;
        this.uploadUrl = obj.uploadUrl;
        this.configUrl = obj.configUrl != undefined ? obj.configUrl : "";

        this.uploadButtonVisible = obj.uploadButtonVisible == undefined ? true : false;


        if (obj.configUrl != undefined)
            this.configUrl = obj.configUrl;
        if (obj.uploadMode != undefined)
            this.uploadMode = obj.uploadMode;
        if (obj.fileGroupId != undefined)
            this.fileGroupId = obj.fileGroupId;

        if (obj.maxFileCount != undefined)
            this.setMaxFileCount(obj.maxFileCount);
        if (obj.maxFileSize != undefined)
            this.setMaxFileSize(obj.maxFileSize);
        if (obj.maxTotalFileSize != undefined)
            this.setMaxTotalFileSize(obj.maxTotalFileSize);
        */

        if (properties == undefined)
            return;

        var obj = jQuery.parseJSON(properties);

        // if(obj.uploadMode == "LARGE" || obj.uploadMode == "RESUME"){
        //     obj.download = false;
        //     obj.downloadUrl = "";
        // }

        this.containerId = obj.containerId;

        this.createControls(obj);
        this.resetProperties(properties);
        this.createImagePreview();
    };

    this.resetProperties = function (properties) {
        if (properties == undefined)
            return;

        var obj = jQuery.parseJSON(properties);

        // if(obj.uploadMode == "LARGE" || obj.uploadMode == "RESUME"){
        //     obj.download = false;
        //     obj.downloadUrl = "";
        // }

        // sort
        var data = this.dataGrid.getColumns();
        data[1].sortable = obj.sortable == undefined ? false : obj.sortable;
        data[2].sortable = obj.sortable == undefined ? false : obj.sortable;
        data[3].sortable = obj.sortable == undefined ? false : obj.sortable;
        this.dataGrid.setColumns(data)

        this.uploadUrl = obj.uploadUrl;
        this.configUrl = obj.configUrl != undefined ? obj.configUrl : "";

        this.downloadUrl = obj.downloadUrl;

        // 하위 호환성을 위해 남겨둔 프로퍼티
        this.uploadButtonVisible = obj.uploadButtonVisible == undefined ? true : false;

        if (obj.width != undefined) {
            if (obj.width.lastIndexOf("%") != -1)
                this.width = Math.round(this.utils.getPxFromPercent(this.containerId, "WIDTH") / 100 * this.utils.getDigitString(obj.width));
            else
                this.width = this.utils.getDigitString(obj.width);
            $('#' + this.mainPanel).css('width', this.width + 'px');
        }
        if (obj.height != undefined) {

            if (obj.height.lastIndexOf("%") != -1)
                this.height = Math.round(this.utils.getPxFromPercent(this.containerId, "HEIGHT") / 100 * this.utils.getDigitString(obj.height));
            else
                this.height = this.utils.getDigitString(obj.height);
            $('#' + this.mainPanel).css('height', this.height + 'px');
        }
        if (obj.borderColor != undefined) {
            $('#' + this.mainPanel).css('border-color', obj.borderColor);
        }
        if (obj.topPanelDisplayStyle != undefined) {
            $('#' + this.buttonPanel).css('display', obj.topPanelDisplayStyle);
            $('#' + this.topSplitLine).css('display', obj.topPanelDisplayStyle);
        }

        // 파일 선택 버튼 설정
        if (obj.selectFilesButtonDisplayStyle != undefined)
            obj.selectFilesButtonDisplayStyle == 'block' ? $('#' + this.addFilesButton).show() : $('#' + this.addFilesButton).hide();
        if (obj.selectFilesButtonDisabledStyle != undefined)
            $('#' + this.addFilesButton).prop('disabled', obj.selectFilesButtonDisabledStyle);

        // 폴더 선택 버튼 설정
        if (obj.selectFolderButtonDisplayStyle != undefined)
            obj.selectFolderButtonDisplayStyle == 'block' ? $('#' + this.addFolderButton).show() : $('#' + this.addFolderButton).hide();
        if (obj.selectFolderButtonDisabledStyle != undefined)
            $('#' + this.addFolderButton).prop('disabled', obj.selectFolderButtonDisabledStyle);

        // 업로드 버튼 설정
        if (obj.uploadButtonDisplayStyle != undefined)
            $('#' + this.uploadButton).css('display', obj.uploadButtonDisplayStyle);
        if (obj.uploadButtonDisabledStyle != undefined)
            $('#' + this.uploadButton).prop('disabled', obj.uploadButtonDisabledStyle);

        //다운로드 버튼 설정
        if (obj.downloadButtonDisplayStyle != undefined)
            obj.downloadButtonDisplayStyle == 'block' ? $('#' + this.downloadButton).show() : $('#' + this.downloadButton).hide();
        if (obj.downloadButtonDisabledStyle != undefined)
            $('#' + this.downloadButton).prop('disabled', obj.downloadButtonDisabledStyle);

        if (obj.downloadButtonDisplayStyle != undefined && obj.downloadButtonDisplayStyle == 'none')
            $('#' + this.downloadButton).css('display', 'none');

        if (obj.downloadButtonDisplayStyleOnStatus != undefined)
            obj.downloadButtonDisplayStyleOnStatus == 'block' ? $('#' + this.downloadButtonOnStatus).show() : $('#' + this.downloadButtonOnStatus).hide();

        if (obj.downloadAllButtonDisplayStyleOnStatus != undefined)
            obj.downloadAllButtonDisplayStyleOnStatus == 'block' ? $('#' + this.downloadAllButtonOnStatus).show() : $('#' + this.downloadAllButtonOnStatus).hide();

        // 버튼 패널 설정
        if (obj.selectFilesButtonDisplayStyle != undefined && obj.selectFilesButtonDisplayStyle == 'none' &&
            obj.selectFolderButtonDisplayStyle != undefined && obj.selectFolderButtonDisplayStyle == 'none' &&
            obj.uploadButtonDisplayStyle != undefined && obj.uploadButtonDisplayStyle == 'none') {
            $('#' + this.buttonPanel).css('display', 'none');
            $('#' + this.topSplitLine).css('display', 'none');
        }

        if (obj.selectFilesButtonDisplayStyleOnStatus != undefined)
            obj.selectFilesButtonDisplayStyleOnStatus == 'block' ? $('#' + this.addFilesButtonOnStatus).show() : $('#' + this.addFilesButtonOnStatus).hide();

        // 크기, 위치 변경
        $('#' + this.buttonPanel).css('width', this.width + 'px');
        $('#' + this.topSplitLine).css('width', this.width + 'px');

        var dataGridWidth = this.width - (this.leftMargin + this.rightMargin);
        var dataGridHeight = 0;
        if ($('#' + this.buttonPanel).css('display') == 'block') {
            dataGridHeight = this.height - (this.buttonPanelHeight + this.topSplitLineHeight + this.statusPanelHeight + (this.topMargin * 3));
            $('#' + this.managerDataGrid).css('margin-top', this.topMargin + 'px');
        }
        if ($('#' + this.buttonPanel).css('display') == 'none') {
            dataGridHeight = this.height - (this.statusPanelHeight + (this.topMargin * 4));
            $('#' + this.managerDataGrid).css('margin-top', (this.topMargin * 2) + 'px');
        }
        $('#' + this.managerDataGrid).css('width', dataGridWidth + 'px');
        $('#' + this.managerDataGrid).css('height', dataGridHeight + 'px');
        self.dataGrid.width = dataGridWidth;
        self.dataGrid.height = dataGridHeight;
        var columns = self.dataGrid.getColumns();
        columns[1].width = dataGridWidth - 200;
        columns[2].width = 100;
        columns[3].width = 100;
        self.dataGrid.setColumns(columns);

        $('#' + this.statusPanel).css('width', dataGridWidth + 'px');
        if (obj.configUrl != undefined)
            this.configUrl = obj.configUrl;
        if (obj.uploadMode != undefined)
            this.uploadMode = obj.uploadMode;
        if (obj.fileGroupId != undefined)
            this.fileGroupId = obj.fileGroupId;
        if (obj.maxFileCount != undefined)
            this.setMaxFileCount(obj.maxFileCount);
        if (obj.maxFileSize != undefined)
            this.setMaxFileSize(obj.maxFileSize);
        if (obj.maxTotalFileSize != undefined)
            this.setMaxTotalFileSize(obj.maxTotalFileSize);

        if (obj.imagePreviewLayerClass != undefined)
            this.imagePreviewLayerClass = obj.imagePreviewLayerClass;

        if (obj.imagePreviewBgLayerClass != undefined)
            this.imagePreviewBgLayerClass = obj.imagePreviewBgLayerClass;
    };


    this.createControls = function (obj) {
        // Main panel
        $('#' + this.containerId).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;background:#EEEEEE;border:solid 1px #EEEEEE;"></div>',
            this.mainPanel, this.width, this.height));

        // Button panel
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;"></div>',
            this.buttonPanel, this.width, this.buttonPanelHeight));
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="file" id="{0}" style="display:none;" multiple/>', this.fileButton));
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="파일선택" ' +
            'style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px; ' +
            'background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;"/>',
            this.addFilesButton, this.buttonWidth, this.buttonHeight, this.leftMargin, this.topMargin, this.fontFamily));
        //'background-image:url(../../app/image/select-file.png);background-repeat: no-repeat;background-position:left;padding-left:18px;" />',
        // Folder button
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="file" id="{0}" style="display:none;" webkitdirectory mozdirectory msdirectory odirectory directory multiple/>', this.folderButton));
        // Add folder button
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="폴더선택" ' +
            'style="display:none;width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px; ' +
            'background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;"/>',
            this.addFolderButton, this.buttonWidth, this.buttonHeight, this.leftMargin, this.topMargin, this.fontFamily));

        // download button
        if (obj.download) {
            // Download a tag
            $('#' + this.mainPanel).append(this.utils.stringFormat('<a id="{0}" href="#" download="#" style="display:none;"></a>', this.downloadLink));

            $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="다운로드" ' +
                'style="width:{1}px;height:{2}px;float:right;margin-right:{3}px;margin-top:{4}px; ' +
                'font-family:{5};font-size:12px;background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;"/>',
                this.downloadButton, this.buttonWidth, this.buttonHeight, this.rightMargin, 5, this.fontFamily));
        }

        // Upload button
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="업로드" ' +
            'style="width:{1}px;height:{2}px;float:right;margin-right:{3}px;margin-top:{4}px; ' +
            'font-family:{5};font-size:12px;background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;display:{6};"/>',
            this.uploadButton, this.buttonWidth, this.buttonHeight, this.rightMargin, 5, this.fontFamily, this.uploadButtonVisible ? 'block' : 'none'));

        // Top split line
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;background:#4072CB;"></div>',
            this.topSplitLine, this.width, this.topSplitLineHeight));

        // DataGrid
        var dataGridWidth = this.width - (this.leftMargin + this.rightMargin);
        var dataGridHeight = this.height - (this.buttonPanelHeight + this.topSplitLineHeight + this.statusPanelHeight + (this.topMargin * 3));
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;background:#FFFFFF;"></div>',
            this.managerDataGrid, dataGridWidth, dataGridHeight, this.leftMargin, this.topMargin));

        var checkboxSelector = new Slick.CheckboxSelectColumn({
            cssClass: "slick-cell-checkboxsel",
            toolTip: "전체선택/전체해제"
        });

        var gridWidth = this.width - (this.leftMargin + this.rightMargin);
        var fieldWidth = 100;
        var grid;
        var columns = [
            checkboxSelector.getColumnDefinition(),
            {
                id: "title", name: "파일이름", field: "title", width: gridWidth - (fieldWidth * 2), sortable: false, sorter: this.numericSorter,
                formatter: function (args) {
                    //return "<img src ='" + data[args].src + "'> </img><span>" + data[args].title + "</span>"
                    return "<img src ='" + data[args].src + "' onerror=\"this.src='" + window.namoCrossUploaderConfig.productImagePath + "/app/image/file_icon/etc.png\'\"></img><span> " + data[args].title + "</span>"
                }
            },
            {id: "size", name: "크기", field: "size", width: fieldWidth, cssClass: "slick-grid-filesize", sortable: false, sorter: this.sizeSorter},
            {id: "status", name: "상태", field: "status", width: fieldWidth, cssClass: "slick-grid-transfer-status", sortable: false, sorter: this.numericSorter}
        ];

        var options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            editable: true,
            enableCellNavigation: true,
            forceFitColumns: true,
            autoEdit: false
        };


        var data = [];
        //self.dataGrid = new Slick.Grid("#" + self.managerDataGrid, data, columns, options);

        var dataView = new Slick.Data.DataView();
        dataView.setItems(data);
        self.dataGrid = new Slick.Grid("#" + self.managerDataGrid, dataView.getItems(), columns, options);


        self.dataGrid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));
        self.dataGrid.registerPlugin(checkboxSelector);
        self.dataGrid.onSort.subscribe(function (e, args) {
            self.dataGrid.setSelectedRows([]);
            self.dataGrid.resetActiveCell();

            self.currentSortCol = args.sortCol.field;
            self.isAsc = args.sortAsc ? 1 : -1;

            dataView.sort(args.sortCol.sorter, self.isAsc);
            args.grid.invalidateAllRows();
            args.grid.render();
        });

        self.dataGrid.onDblClick.subscribe(this.onDblClickGridRowHandler);


        //$(function () {
        //});

        // Status panel
        var statusPanelWidth = dataGridWidth;
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;background-color:#737373;margin-left:{3}px;"></div>',
            this.statusPanel, statusPanelWidth, this.statusPanelHeight, this.leftMargin));

        /*
        $('#' + this.statusPanel).append(this.utils.stringFormat('<span align="left" style="width:{0}px;height:{1}px;"> ' +
            '<a id={2} href="#" style="display: inline-block;text-decoration: none !important; ' + 
            'margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px;color:white;">X 삭제</a></span>',
             this.deleteFileButtonWidth, this.deleteFileButtonHeight, this.deleteFileButton, this.defaultMargin, 6, this.fontFamily));
             */

        $('#' + this.statusPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="x 삭제" ' +
            'style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px; ' +
            'background:none;border:none;color:white;button:focus {outline:none;};"/>',
            this.deleteFileButton, this.deleteFileButtonWidth, this.deleteFileButtonHeight, 0, this.defaultMargin, this.fontFamily));

        $('#' + this.statusPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="파일선택" ' +
            'style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px; ' +
            'background:none;border:none;color:white;button:focus {outline:none;};display:none;"/>',
            this.addFilesButtonOnStatus, this.addFilesButtonWidthOnStatus, this.addFilesButtonHeightOnStatus, 0, this.defaultMargin, this.fontFamily));

        if (obj.download) {
            $('#' + this.statusPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="다운로드" ' +
                'style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px; ' +
                'background:none;border:none;color:white;button:focus {outline:none;};display:none;"/>',
                this.downloadButtonOnStatus, this.downloadButtonWidthOnStatus, this.downloadButtonHeightOnStatus, 0, this.defaultMargin, this.fontFamily));

            $('#' + this.statusPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="전체 다운로드" ' +
                'style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px; ' +
                'background:none;border:none;color:white;button:focus {outline:none;};display:none;"/>',
                this.downloadAllButtonOnStatus, this.downloadButtonWidthOnStatus + 25, this.downloadButtonHeightOnStatus, 0, this.defaultMargin, this.fontFamily));

            $('#' + this.downloadButtonOnStatus).on("mouseover", function () {
                $(this).css("color", "#E0E0E0");
                $(this).css("outline", "none");
            }).on("mouseout", function () {
                $(this).css("color", "white");
            });

            $('#' + this.downloadAllButtonOnStatus).on("mouseover", function () {
                $(this).css("color", "#E0E0E0");
                $(this).css("outline", "none");
            }).on("mouseout", function () {
                $(this).css("color", "white");
            });
        }

        $('#' + this.deleteFileButton).on("mouseover", function () {
            $(this).css("color", "#E0E0E0");
            $(this).css("outline", "none");
        }).on("mouseout", function () {
            $(this).css("color", "white");
        });

        $('#' + this.addFilesButtonOnStatus).on("mouseover", function () {
            $(this).css("color", "#E0E0E0");
            $(this).css("outline", "none");
        }).on("mouseout", function () {
            $(this).css("color", "white");
        });

        $('#' + this.statusPanel).append(this.utils.stringFormat('<span id="{0}" ' +
            'style="height:{1}px;float:right;text-align:right;margin-right:{2}px;margin-top:{3}px;font-family:{5};font-size:12px;color:white;">0개의 파일 : 0.00B</span>',
            this.statusLabel, this.statusLabelHeight, this.rightMargin, 6, this.fontFamily));

        if (obj.downloadUrl) {
            $.contextMenu({
                selector: '#' + this.mainPanel,
                callback: function (key, options) {
                    if (key == "addFiles")
                        self.onClickAddFilesButton();
                    else if (key == "deleteFiles")
                        self.onClickDeleteFileButton();
                    else if (key == "deleteAllFiles")
                        self.deleteAllFiles();
                },
                items: {
                    "addFiles": {name: "파일선택"},
                    "deleteFiles": {name: "파일삭제"},
                    "deleteAllFiles": {name: "전체파일삭제"},
                }
            });
        } else {
            $.contextMenu({
                selector: '#' + this.mainPanel,
                callback: function (key, options) {
                    if (key == "addFiles")
                        self.onClickAddFilesButton();
                    if (key == "addFolder")
                        self.onClickAddFolderButton();
                    else if (key == "deleteFiles")
                        self.onClickDeleteFileButton();
                    else if (key == "deleteAllFiles")
                        self.deleteAllFiles();
                },
                items: {
                    /*
                    "edit": { name: "Edit", icon: "edit" },
                    "cut": { name: "Cut", icon: "cut" },
                    copy: { name: "Copy", icon: "copy" },
                    "paste": { name: "Paste", icon: "paste" },
                    "delete": { name: "Delete", icon: "delete" },
                    "sep1": "---------",
                    "quit": {
                        name: "Quit", icon: function ()
                        {
                            return 'context-menu-icon context-menu-icon-quit';
                        }
                    }
                    */
                    "addFiles": {name: "파일선택"},
                    "addFolder": {name: "폴더선택"},
                    "deleteFiles": {name: "파일삭제"},
                    "deleteAllFiles": {name: "전체파일삭제"},
                }
            });
        }


    };

    this.createImagePreview = function () {
        if (this.imagePreviewBgLayerClass == undefined || this.imagePreviewBgLayerClass == "" ||
            this.imagePreviewLayerClass == undefined || this.imagePreviewLayerClass == "")
            return;

        $('body').append(this.utils.stringFormat('<div id="{0}" class="{1}" style="display:none;"></div>',
            this.imagePreviewBgPanel, this.imagePreviewBgLayerClass));

        $('body').append(this.utils.stringFormat('<div id="{0}" class="{1}" style="display:none;"></div>',
            this.imagePreviewPanel, this.imagePreviewLayerClass));

        $('#' + this.imagePreviewPanel).append(this.utils.stringFormat('<img id="{0}" src="#" />',
            this.previewImage));

        $('#' + this.imagePreviewPanel).append('<span></span>');

    }

    this.onClosePreviewImage = function () {
        var imagePreviewBgPanel = document.getElementById(self.imagePreviewBgPanel);
        var imagePreviewPanel = document.getElementById(self.imagePreviewPanel);

        imagePreviewBgPanel.style.display = "none";
        imagePreviewPanel.style.display = "none";
    }

    this.onDblClickGridRowHandler = function (e, args) {
        var manager = self;
        manager.dispatchEvent(manager.onDblClickGridRow, args.row);
    }

    this.openPreviewIamge = function (index) {
        if (!(File && Image)) {
            //alert("Not supoorted browser");
            return;
        }

        var fileInfo = self.getFileInfoFromMap(index);
        if (fileInfo.fileType == "NORMAL" && this.getAcceptedImageForPreview(fileInfo.fileName)) {
            var image = new Image();
            image.onload = function (e) {
                var previewImageObj = document.getElementById(self.previewImage);

                if (previewImageObj && previewImageObj.style) {
                    var browserSize = {
                        width: window.innerWidth || document.body.clientWidth,
                        height: window.innerHeight || document.body.clientHeight
                    }

                    var imageBoxSize = {width: browserSize.width / 100 * 60, height: browserSize.height / 100 * 80};

                    if (image.width > imageBoxSize.width || image.height > imageBoxSize.height) {
                        if (image.width > image.height) {
                            previewImageObj.style.width = imageBoxSize.width + 'px';
                            previewImageObj.style.height = 'auto';
                        } else {
                            previewImageObj.style.width = 'auto';
                            previewImageObj.style.height = imageBoxSize.height + 'px';
                        }
                    } else {
                        previewImageObj.style.width = image.width + 'px';
                        previewImageObj.style.height = image.height + 'px';
                    }
                }

                previewImageObj.setAttribute('src', image.src);
                document.getElementById(self.imagePreviewBgPanel).style.display = "block";
                ;
                document.getElementById(self.imagePreviewPanel).style.display = "block";
                ;
            };
            image.src = window.URL.createObjectURL(fileInfo.file);
        }

    }

    this.getAcceptedImageForPreview = function (fileName) {
        var extension = "";
        var extensionArray = ["png", "jpg", "jpeg", "ico", "gif", "bmp"];

        var index = fileName.lastIndexOf('.');
        if (index != -1) {
            extension = fileName.substring(index + 1);
            extension = extension.toLowerCase();
        } else {
            return false;
        }

        for (var i = 0; i < extensionArray.length; i++) {
            if (extension == extensionArray[i])
                return true;
        }
        return false;
    }

    this.getItem = function (index) {
        return this.isAsc ? data[indices[currentSortCol.id][index]] : data[indices[currentSortCol.id][(data.length - 1) - index]];
        return this.isAsc ? this.dataGrid.getDataItem(index) : this.dataGrid.getDataItem(index)
    }
    this.getLength = function () {
        return data.length;
    }


    this.onClickAddFilesButton = function () {
        self.selectFiles();
    };

    this.selectFiles = function () {
        $('#' + self.fileButton).click();
    }

    ////

    this.onClickAddFolderButton = function () {
        self.selectFolder();
    };


    this.selectFolder = function () {
        $('#' + self.folderButton).click();
    }

    ////
    // 선택한 모든 데이터가 삭제되도록 수정
    // 20170516
    /*
    this.onClickDeleteFileButton = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        if (grid.getActiveCell()) {
            var currentRow = grid.getActiveCell().row;
            self.deleteFiles(currentRow);

            dataList.splice(currentRow, 1);
            var r = currentRow;
            while (r < dataList.length) {
                grid.invalidateRow(r);
                r++;
            }
            grid.updateRowCount();
            grid.render();
            grid.scrollRowIntoView(currentRow - 1)
        }
    };
    */
    this.onClickDeleteFileButton = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        //var rowsToDelete = grid.getSelectedRows().sort().reverse();
        // 업로더 매니저 파일아이템 삭제 시 id값 수정(sorting 숫자를 문자열로 인식하는 문제) 2021.09.03
        var rowsToDelete = grid.getSelectedRows().sort(function (a, b) {
            return a - b;
        }).reverse();

        for (var i = 0; i < rowsToDelete.length; i++) {
            self.deleteFiles(rowsToDelete[i]);
            dataList.splice(rowsToDelete[i], 1);

            grid.scrollRowIntoView(rowsToDelete[i] - 1)
        }

        grid.invalidate();
        grid.setSelectedRows([]);
        grid.resetActiveCell();
    };
    ////

    this.onClickAddFilesButtonOnStatus = function () {
        self.selectFiles();
    };

    this.deleteFiles = function (currentRow) {
        var fileInfo = this.getFileInfoFromMap(currentRow);

        if (fileInfo.fileType == 'UPLOADED') {
            for (var i = 0; i < this.modifiedFilesInfoList.length; i++) {
                if (fileInfo.id == this.modifiedFilesInfoList[i].id) {
                    this.modifiedFilesInfoList[i].isDeleted = true;
                    break;
                }
            }
        } else if (fileInfo.fileType == 'FOLDER') {
            this.folderInfoMap.delete(fileInfo.folderId);
        }

        this.totalFileSize -= fileInfo.fileSize;
        this.deleteFileInfoFromMap(currentRow);
        this.updateStatus();
    };

    this.deleteAllFiles = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        //var rowsToDelete = grid.getSelectedRows().sort().reverse();

        while (0 < dataList.length) {
            self.deleteFiles(0);
            dataList.splice(0, 1);

            grid.scrollRowIntoView(0 - 1)
        }

        grid.invalidate();
        grid.setSelectedRows([]);
        grid.resetActiveCell();
    }

    ////
    // private
    this.startDownloadAll = function () {
        self.selectAll();
        self.startDownload();
    };
    this.onClickDownloadButton = function () {
        self.startDownload();
    };
    this.onClickDownloadButtonOnStatus = function () {
        self.startDownload();
    };

    this.onClickDownloadAllButtonOnStatus = function () {
        self.startDownloadAll();
    };
    this.selectAll = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var itemArray = [];
        for (var i = 0; i < dataList.length; i++)
            itemArray.push(i);

        grid.setSelectedRows(itemArray);
    }

    this.startDownload = function () {
        var fileInfoMap = self.fileInfoMap;
        var downloadLink = self.downloadLink;
        var utils = self.utils;
        var dataGrid = self.dataGrid;

        var selectedRows = dataGrid.getSelectedRows();
        if (selectedRows.length == 0) {
            alert("다운로드할 파일을 선택해주세요.");
            return;
        }

        var formData = '';
        var index = 0;
        var uploadFlag = true;
        for (var i = 0; i < selectedRows.length; i++) {
            index = selectedRows[i];
            var fileInfo = self.getFileInfoFromMap(index);

            if (fileInfo.status != "COMPLETION") {
                uploadFlag = false;
                break;
            }

            var obj = new Object();
            obj.fileId = fileInfo.fileId;
            obj.fileName = self.dataGrid.getDataItem(index).title;
            obj.fileSize = fileInfo.fileSize;
            obj.fileUrl = fileInfo.fileUrl;

            formData += (JSON.stringify(obj) + ',');
        }
        if (!uploadFlag) {
            alert("업로드 완료된 파일만 다운로드 할 수 있습니다.");
            return;
        }
        if (formData.length > 0) {
            formData = '[' + formData.substring(0, formData.length - 1) + ']';
        }

        var href = utils.stringFormat('{0}?CD_DOWNLOAD_FILE_INFO={1}', self.downloadUrl, formData);
        $('#' + downloadLink).prop('href', encodeURI(href));
        if (selectedRows.length > 1)
            $('#' + downloadLink).prop('download', 'zipFileDownload');
        else
            $('#' + downloadLink).prop('download', fileInfo.fileName);
        $('#' + downloadLink)[0].click();
    };

    this.addFile = function (fileInfo) {
        var obj = jQuery.parseJSON(fileInfo);
        //var fileId = obj.fileId;
        var fileName = obj.fileName;
        var fileSize = obj.fileSize;
        var fileUrl = obj.fileUrl;

        var fileInfo = new __DownloadFileInfo();
        fileInfo.id = this.utils.getGuid();
        //fileInfo.fileId = obj.fileId;
        fileInfo.fileDirPath = '';
        fileInfo.fileName = obj.fileName;
        fileInfo.fileSize = parseInt(obj.fileSize);
        fileInfo.fileUrl = obj.fileUrl;
        fileInfo.status = "COMPLETION";
        var statusLabel = "완료";

        this.fileInfoMap.set(fileInfo.id, fileInfo);

        var dataGrid = this.dataGrid;
        var datas = dataGrid.getData();
        datas.splice(datas.length, 0, {
            'src': window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/' + this.utils.getFileExtension(fileInfo.fileName) + '.png',
            'title': fileName,
            'size': this.utils.convertByteUnit(fileSize),
            'status': statusLabel,
            'realSize': fileSize,
            'id': fileInfo.id
        });
        dataGrid.invalidateRow(datas.length);
        dataGrid.updateRowCount();
        dataGrid.render();
        dataGrid.scrollRowIntoView(datas.length - 1)

        this.totalFileSize += fileInfo.fileSize;

        this.updateStatus();
    }

    this.scrollRow = function (row) {
        var isNumberType = (typeof row === 'number');

        if (isNumberType == false) {
            row = this.utils.getDigitString(row);
            if (row == "")
                row = 0;
        }

        var grid = self.dataGrid;
        if (grid.length - 1 > row)
            row = grid.length - 1;
        else if (row < 0)
            row = 0;

        grid.scrollRowIntoView(row);
    }

    this.onClickUploadFileButton = function () {
        if (self.uploadMode == "BASIC")
            self.startUpload();
        else
            self.startLargeUpload();
    };


    this.startUpload = function () {
        var manager = self;
        var monitor = parent.fileUploadMonitor;

        //업로드 파일만 처리
        var realUploadItemIndex = 0;
        if (manager.downloadUrl) {
            manager.currentTotalFileSize = 0;
            manager.currentFileInfoMap = new Map(manager.fileInfoMap);
            manager.currentFileInfoMap.forEach((value, key) => {
                if (!(value.status == "WAIT")) {
                    manager.currentFileInfoMap.delete(key);
                    realUploadItemIndex++;
                } else {
                    manager.currentTotalFileSize += value.fileSize;
                }
            });
            if (manager.currentFileInfoMap.size == 0) {
                alert("업로드 할 파일이 없습니다.");
                return;
            }
        }

        if (manager.fileInfoMap.size == 0) {
            alert("업로드 할 파일을 선택해 주십시오.");
            return;
        }

        manager.currentUploadItemIndex = realUploadItemIndex;
        manager.currentMonitorUploadItemIndex = 0;
        manager.currentUploadItemIndexForFolder = 0;

        // 업로드 모니터에 데이터 전달
        monitor.clear();
        monitor.addFiles();
        monitor.open();
        monitor.dataGrid.scrollRowToTop(0); //2023.02.21 monitor render
        manager.startTime = new Date().getTime();
        manager.progressTimer = setInterval(manager.startProgressTimer, 500);

        manager.totalUploadedFileSize = 0;
        manager.totalUploadedFileSizeForFolder = 0;

        manager.setUploadStatus("TRANSFERRING");
        monitor.resetButtonStatus();
        manager.dispatchEvent(manager.onStartUpload);
        manager.sendFormData();
    };

    this.startLargeUpload = function () {
        var manager = self;
        var monitor = parent.fileUploadMonitor;

        //업로드 파일만 처리
        var realUploadItemIndex = 0;
        if (manager.downloadUrl) {
            manager.currentTotalFileSize = 0;
            manager.currentFileInfoMap = new Map(manager.fileInfoMap);
            manager.currentFileInfoMap.forEach((value, key) => {
                if (!(value.status == "WAIT")) {
                    manager.currentFileInfoMap.delete(key);
                    realUploadItemIndex++;
                } else {
                    manager.currentTotalFileSize += value.fileSize;
                }
            });
            if (manager.currentFileInfoMap.size == 0) {
                alert("업로드 할 파일이 없습니다.");
                return;
            }
        }

        if (manager.fileInfoMap.size == 0) {
            alert("업로드 할 파일을 선택해 주십시오.");
            return;
        }

        manager.currentUploadItemIndex = realUploadItemIndex;
        manager.currentMonitorUploadItemIndex = 0;
        manager.currentUploadItemIndexForFolder = 0;

        // 업로드 모니터에 데이터 전달
        monitor.clear();
        monitor.addFiles();
        monitor.open();
        monitor.dataGrid.scrollRowToTop(0); //2023.02.21 monitor render

        manager.startTime = new Date().getTime();
        manager.progressTimer = setInterval(manager.startProgressTimer, 500);

        manager.totalUploadedFileSize = 0;
        manager.totalUploadedFileSizeForFolder = 0;

        manager.setUploadStatus("TRANSFERRING");
        monitor.resetButtonStatus();
        manager.dispatchEvent(manager.onStartUpload);
        manager.sendLargeFormData();
    };
    this.startProgressTimer = function () {
        var manager = self;
        var fileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);
        manager.updateProgressStatus(fileInfo.status, fileInfo.transferedSize);
    };

    this.setEventHandler = function () {
        $('#' + this.addFilesButton).bind("click", this.onClickAddFilesButton);
        $('#' + this.addFolderButton).bind("click", this.onClickAddFolderButton);
        $('#' + this.deleteFileButton).bind("click", this.onClickDeleteFileButton);
        $('#' + this.addFilesButtonOnStatus).bind("click", this.onClickAddFilesButtonOnStatus);
        $('#' + this.uploadButton).bind("click", this.onClickUploadFileButton);
        $('#' + this.imagePreviewPanel).bind("click", this.onClosePreviewImage);

        if ($('#' + this.downloadButton).length > 0) {
            $('#' + this.downloadButton).bind("click", this.onClickDownloadButton);
        }
        $('#' + this.downloadButtonOnStatus).bind("click", this.onClickDownloadButtonOnStatus);
        $('#' + this.downloadAllButtonOnStatus).bind("click", this.onClickDownloadAllButtonOnStatus);

        /*
        $('#' + this.fileButton).bind("change", this.onFileSelect);
        $('#' + this.managerDataGrid).bind("dragover", this.onDragOver);
        $('#' + this.managerDataGrid).bind("drop", this.onDrop)n
        */

        document.getElementById(this.fileButton).addEventListener("change", this.onFileSelect, false);
        document.getElementById(this.folderButton).addEventListener("change", this.onFolderSelect, false);
        document.getElementById(this.managerDataGrid).addEventListener("dragover", this.onDragOver, false);
        document.getElementById(this.managerDataGrid).addEventListener("drop", this.onDrop, false);

    };

    this.updateStatus = function () {
        if (this.folderInfoMap.size > 0) {
            var status = this.utils.stringFormat('{0}개의 폴더, {1}개의 파일 : {2}',
                this.folderInfoMap.size,
                this.fileInfoMap.size - this.folderInfoMap.size,
                this.utils.convertByteUnit(this.totalFileSize));
        } else {
            var status = this.utils.stringFormat('{0}개의 파일 : {1}',
                this.fileInfoMap.size,
                this.utils.convertByteUnit(this.totalFileSize));
        }

        $('#' + this.statusLabel).text(status);
    }

    this.updateProgressStatus = function (status, loaded, isFolder) {
        var manager = self;
        var monitor = parent.fileUploadMonitor;

        fileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);
        fileInfo.status = status;

        if (isFolder == true && status == "COMPLETION") {
            var childFileInfo = manager.childFileInfoList[manager.currentUploadItemIndexForFolder];
            manager.totalUploadedFileSizeForFolder += childFileInfo.fileSize;
            fileInfo.transferedSize = manager.totalUploadedFileSizeForFolder;
            fileInfo.status = "TRANSFERRING";
            loaded = childFileInfo.fileSize;
        }

        var statusLabel = "";
        if (fileInfo.status == "COMPLETION") {
            fileInfo.transferedSize = fileInfo.fileSize;
            manager.totalUploadedFileSize += fileInfo.transferedSize;
            statusLabel = "완료";
        } else if (fileInfo.status == "CANCELLATION") {
            fileInfo.transferedSize = 0;
            statusLabel = "취소";
        } else if (fileInfo.status == "FAILURE") {
            fileInfo.transferedSize = 0;
            statusLabel = "실패";
        } else if (fileInfo.status == "TRANSFERRING") {
            fileInfo.transferedSize = loaded;
            /*
            if (fileInfo.fileType == 'FOLDER')
            {
                fileInfo.transferedSize = manager.totalUploadedFileSizeForFolder + loaded;
                console.log(manager.totalUploadedFileSizeForFolder + " : " + loaded);
            }
            else
            {
                fileInfo.transferedSize = loaded;
            }
            */
            statusLabel = manager.utils.convertByteUnit(fileInfo.transferedSize);
        } else {
            fileInfo.transferedSize = 0;
            statusLabel = "대기";
        }

        // Title
        if (manager.downloadUrl) {
            $('#' + monitor.titleLabel).text(manager.utils.stringFormat('{0}개의 파일 중 {1}번째 파일을 업로드하고 있습니다.',
                manager.currentFileInfoMap.size, manager.currentMonitorUploadItemIndex + 1));
        } else {
            $('#' + monitor.titleLabel).text(manager.utils.stringFormat('{0}개의 파일 중 {1}번째 파일을 업로드하고 있습니다.',
                manager.fileInfoMap.size, manager.currentUploadItemIndex + 1));
        }

        // Each uploaded file size
        manager.dataGrid.getDataItem(manager.currentUploadItemIndex)["status"] = statusLabel;
        manager.dataGrid.updateCell(manager.currentUploadItemIndex, 1);
        manager.dataGrid.updateCell(manager.currentUploadItemIndex, 2);
        manager.dataGrid.updateCell(manager.currentUploadItemIndex, 3);
        manager.dataGrid.render();

        if (manager.downloadUrl) {
            monitor.dataGrid.getDataItem(manager.currentMonitorUploadItemIndex)["status"] = statusLabel;
            monitor.dataGrid.updateCell(manager.currentMonitorUploadItemIndex, 2);
        } else {
            monitor.dataGrid.getDataItem(manager.currentUploadItemIndex)["status"] = statusLabel;
            monitor.dataGrid.updateCell(manager.currentUploadItemIndex, 2);
        }

        monitor.dataGrid.render();

        // Total uploaded file size
        var transferedSize = (fileInfo.status == "COMPLETION") ? 0 : fileInfo.transferedSize;
        $('#' + monitor.totalUploadedFileSizeLabel).text(manager.utils.convertByteUnit(manager.totalUploadedFileSize + transferedSize));
        //$('#' + monitor.totalFileSizeLabel).text("/" + manager.utils.convertByteUnit(manager.totalFileSize));
        if (manager.downloadUrl) {
            $('#' + monitor.totalFileSizeLabel).text("/" + manager.utils.convertByteUnit(manager.currentTotalFileSize));
        } else {
            $('#' + monitor.totalFileSizeLabel).text("/" + manager.utils.convertByteUnit(manager.totalFileSize));
        }

        // Upload speed
        var currentTime = new Date().getTime();
        var totalUploadedFileSizePerMillisec = manager.getTotalUploadedFileSizePerMillisec(manager.totalUploadedFileSize + transferedSize, currentTime);
        $('#' + monitor.transferSpeedLabel).text("(" + manager.utils.convertByteUnit(totalUploadedFileSizePerMillisec) + "/sec)");

        // Remaining time
        var remainingTime = 0;
        var remainingFileSize = manager.totalFileSize - (manager.totalUploadedFileSize + transferedSize);

        if (manager.downloadUrl) {
            remainingFileSize = manager.currentTotalFileSize - (manager.totalUploadedFileSize + transferedSize);
        }

        if (remainingFileSize > 0 && totalUploadedFileSizePerMillisec > 0)
            remainingTime = ((remainingFileSize * 1000.0) / totalUploadedFileSizePerMillisec) / 1000;
        $('#' + monitor.remainingTimeLabel).text(parseInt(remainingTime, 10));


        // Percent
        var percent = ((manager.totalUploadedFileSize + transferedSize) / manager.totalFileSize) * 100;

        if (manager.downloadUrl) {
            percent = ((manager.totalUploadedFileSize + transferedSize) / manager.currentTotalFileSize) * 100;
        }

        percent = parseInt(percent, 10);
        //업로드 모니터 0KB 패치 2021.08.24
        if (isNaN(percent))
            percent = 0;
        $('#' + monitor.totalUploadedPercentLabel).text(percent.toString() + "%");

        // 프로그래스바
        $('#' + monitor.progressBar).val(percent);

    };

    this.getTotalUploadedFileSizePerMillisec = function (totalUploadedFileSize, currentTime) {
        var totalUploadedFileSizePerMillisec = 0;
        // if (this.totalFileSize > 0 && totalUploadedFileSize > 0 && (currentTime - this.startTime) > 0) {
        //     totalUploadedFileSizePerMillisec = (totalUploadedFileSize * 1000) / (currentTime - this.startTime);
        // }

        if (this.downloadUrl) {
            if (this.currentTotalFileSize > 0 && totalUploadedFileSize > 0 && (currentTime - this.startTime) > 0) {
                totalUploadedFileSizePerMillisec = (totalUploadedFileSize * 1000) / (currentTime - this.startTime);
            }
        } else {
            if (this.totalFileSize > 0 && totalUploadedFileSize > 0 && (currentTime - this.startTime) > 0) {
                totalUploadedFileSizePerMillisec = (totalUploadedFileSize * 1000) / (currentTime - this.startTime);
            }
        }

        return totalUploadedFileSizePerMillisec;
    };


    this.onDrop = function (event) {
        event.stopPropagation();
        event.preventDefault();
        self.addFiles(event.dataTransfer.files);
        self.updateStatus();
    }


    this.onDragOver = function (event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    this.nextOrEndUpload = function () {
        var manager = self;
        var monitor = parent.fileUploadMonitor;

        if (manager.downloadUrl && (manager.currentMonitorUploadItemIndex + 1) == manager.currentFileInfoMap.size) {
            clearInterval(manager.progressTimer);
            manager.setUploadStatus('COMPLETION');
            monitor.resetButtonStatus();

            manager.dispatchEvent(manager.onEndUpload);

            if (monitor.getCloseMonitorCheckBoxStatus() == true) {
                monitor.close();
                manager.dispatchEvent(manager.onCloseMonitorWindow);
            }
        } else if ((manager.currentUploadItemIndex + 1) == manager.fileInfoMap.size) {
            clearInterval(manager.progressTimer);
            manager.setUploadStatus('COMPLETION');
            monitor.resetButtonStatus();

            manager.dispatchEvent(manager.onEndUpload);

            if (monitor.getCloseMonitorCheckBoxStatus() == true) {
                monitor.close();
                manager.dispatchEvent(manager.onCloseMonitorWindow);
            }
        } else {
            manager.currentUploadItemIndex++;
            manager.currentMonitorUploadItemIndex++;
            if (manager.uploadMode == "BASIC")
                setTimeout(manager.sendFormData(), 0);
            else
                setTimeout(manager.sendLargeFormData(), 0);
        }
    };

    ////
    // private
    this.nextOrEndUploadForFolder = function () {
        var manager = self;

        manager.currentUploadItemIndexForFolder++;

        if (manager.uploadMode == "BASIC")
            setTimeout(manager.sendFormData(), 0);
        else
            setTimeout(manager.sendLargeFormData(), 0);
    };

    this.sendFormData = function () {
        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        var fileInfo = this.getFileInfoFromMap(this.currentUploadItemIndex);

        if (!fileInfo) {
            return;
        }

        if (fileInfo.fileType == 'FOLDER' && (fileInfo.status == "WAIT" || fileInfo.status == "TRANSFERRING")) {
            this.sendFormDataForFolder(fileInfo);
            return;
        } else if (fileInfo.fileType == 'FOLDER') {
            this.nextOrEndUpload();
            return;
        }

        //  WAIT인 것만 업로드
        if (fileInfo.status != "WAIT") {
            if (fileInfo.status == "COMPLETION")
                this.updateProgressStatus('COMPLETION');

            this.nextOrEndUpload();
            return;
        }

        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        // 게시판 수정 모드 처리
        if (fileInfo.fileType == "UPLOADED") {
            this.dispatchEvent(this.onStartUploadItem, this.currentUploadItemIndex);
            this.updateProgressStatus('COMPLETION');
            this.dispatchEvent(this.onEndUploadItem, this.currentUploadItemIndex);

            this.nextOrEndUpload();
            return;
        }

        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        this.updateProgressStatus("TRANSFERRING", 0);
        this.dispatchEvent(this.onStartUploadItem, this.currentUploadItemIndex);

        var formData = new FormData();
        formData.append("CU_FILE", fileInfo.file);

        fileInfo.xmlHttpRequest = new XMLHttpRequest();
        fileInfo.xmlHttpRequest.open("POST", this.uploadUrl, true);

        fileInfo.xmlHttpRequest.onreadystatechange = function () {
            var manager = self;
            var monitor = parent.fileUploadMonitor;
            var fileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);

            if (fileInfo.xmlHttpRequest.readyState == 4 && fileInfo.xmlHttpRequest.status == 200) {

                manager.uploadedFileInfoList.push(fileInfo.xmlHttpRequest.responseText.trim());

                if (manager.downloadUrl) {
                    var currentFileInfo = manager.uploadedFileInfoList[manager.uploadedFileInfoList.length - 1];
                    if (currentFileInfo) {
                        manager.uploadedFileInfoList[manager.uploadedFileInfoList.length - 1]
                        var currentFileInfoObj = jQuery.parseJSON(currentFileInfo.trim());
                        var realFileName = currentFileInfoObj.lastSavedFileName;
                        var fileName = currentFileInfoObj.fileName;
                        if (manager.dataGrid.getDataItem(manager.currentUploadItemIndex)["title"] == fileName) {
                            manager.dataGrid.getDataItem(manager.currentUploadItemIndex)["title"] = realFileName;
                        }
                    }
                }

                manager.updateProgressStatus('COMPLETION');
                manager.dispatchEvent(manager.onEndUploadItem, manager.currentUploadItemIndex);

                // Next or end upload
                manager.nextOrEndUpload();
            } else if (fileInfo.xmlHttpRequest.readyState == 4 && fileInfo.xmlHttpRequest.status >= 500) {
                clearInterval(manager.progressTimer);
                manager.updateProgressStatus('FAILURE');
                manager.setUploadStatus('FAILURE');
                monitor.resetButtonStatus();

                var keys = new Array('code', 'message', 'detailMessage');
                var values = new Array(manager.global.HTTP_STATUS_ERROR, fileInfo.xmlHttpRequest.status.toString().trim(), fileInfo.xmlHttpRequest.responseText.trim());
                manager.setLastExceptionInfo(manager.utils.getJsonString(keys, values));
                manager.dispatchEvent(manager.onException);
            }
        };

        fileInfo.xmlHttpRequest.upload.addEventListener("progress", this.updateProgress, false);
        fileInfo.xmlHttpRequest.addEventListener("load", this.transferComplete, false);
        fileInfo.xmlHttpRequest.upload.addEventListener("error", this.transferFailed, false);
        fileInfo.xmlHttpRequest.addEventListener("abort", this.transferCanceled, false);

        fileInfo.xmlHttpRequest.send(formData);
    };


    this.sendFormDataForFolder = function (parentFileInfo) {
        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        this.childFileInfoList = this.folderInfoMap.get(parentFileInfo.folderId);

        var childFileInfo = this.childFileInfoList[this.currentUploadItemIndexForFolder];

        //  WAIT인 것만 업로드
        if (childFileInfo.status != "WAIT") {
            if (childFileInfo.status == "COMPLETION")
                this.updateProgressStatus('COMPLETION');

            this.nextOrEndUploadFolder();
            return;
        }

        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        // 처음 폴더를 업로드 할 때만 이벤트 변경을 한다. 
        if (parentFileInfo.status == "WAIT") {
            this.updateProgressStatus("TRANSFERRING", 0);
            this.dispatchEvent(this.onStartUploadItem, this.currentUploadItemIndex);
        }


        var formData = new FormData();

        formData.append("CU_FILE_DIR_PATH", childFileInfo.fileDirPath);
        formData.append("CU_FILE", childFileInfo.file);

        childFileInfo.xmlHttpRequest = new XMLHttpRequest();
        childFileInfo.xmlHttpRequest.open("POST", this.uploadUrl, true);

        childFileInfo.xmlHttpRequest.onreadystatechange = function () {
            var manager = self;
            var monitor = parent.fileUploadMonitor;
            var childFileInfo = manager.childFileInfoList[manager.currentUploadItemIndexForFolder];

            if (childFileInfo.xmlHttpRequest.readyState == 4 && childFileInfo.xmlHttpRequest.status == 200) {

                manager.uploadedFileInfoList.push(childFileInfo.xmlHttpRequest.responseText.trim());

                if ((manager.currentUploadItemIndexForFolder + 1) == manager.childFileInfoList.length) {
                    manager.updateProgressStatus('COMPLETION');
                    manager.dispatchEvent(manager.onEndUploadItem, manager.currentUploadItemIndex);

                    // Next or end upload
                    manager.currentUploadItemIndexForFolder = 0;
                    manager.totalUploadedFileSizeForFolder = 0;
                    manager.nextOrEndUpload();
                } else {
                    manager.updateProgressStatus('COMPLETION', 0, true);
                    manager.nextOrEndUploadForFolder();
                }
            } else if (childFileInfo.xmlHttpRequest.readyState == 4 && childFileInfo.xmlHttpRequest.status >= 500) {
                clearInterval(manager.progressTimer);
                manager.updateProgressStatus('FAILURE');
                manager.setUploadStatus('FAILURE');
                monitor.resetButtonStatus();

                var keys = new Array('code', 'message', 'detailMessage');
                var values = new Array(manager.global.HTTP_STATUS_ERROR, childFileInfo.xmlHttpRequest.status.toString(), childFileInfo.xmlHttpRequest.responseText.trim());
                manager.setLastExceptionInfo(manager.utils.getJsonString(keys, values));
                manager.dispatchEvent(manager.onException);
            }
        };

        childFileInfo.xmlHttpRequest.upload.addEventListener("progress", this.updateProgress, false);
        childFileInfo.xmlHttpRequest.addEventListener("load", this.transferComplete, false);
        childFileInfo.xmlHttpRequest.upload.addEventListener("error", this.transferFailed, false);
        childFileInfo.xmlHttpRequest.addEventListener("abort", this.transferCanceled, false);

        childFileInfo.xmlHttpRequest.send(formData);
    };

    this.sendLargeFormData = function () {
        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        var fileInfo = this.getFileInfoFromMap(this.currentUploadItemIndex);

        if (fileInfo.fileType == 'FOLDER' && (fileInfo.status == "WAIT" || fileInfo.status == "TRANSFERRING")) {
            this.sendLargeFormDataForFolder(fileInfo);
            return;
        } else if (fileInfo.fileType == 'FOLDER') {
            this.nextOrEndUpload();
            return;
        }

        //  WAIT인 것만 업로드
        if (fileInfo.status != "WAIT") {
            if (fileInfo.status == "COMPLETION")
                this.updateProgressStatus('COMPLETION');

            this.nextOrEndUpload();
            return;
        }

        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        // 게시판 수정 모드 처리
        if (fileInfo.fileType == "UPLOADED") {
            this.dispatchEvent(this.onStartUploadItem, this.currentUploadItemIndex);
            this.updateProgressStatus('COMPLETION');
            this.dispatchEvent(this.onEndUploadItem, this.currentUploadItemIndex);

            this.nextOrEndUpload();
            return;
        }

        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        // 업로드 시작 알림
        this.updateProgressStatus("TRANSFERRING", 0);
        this.dispatchEvent(this.onStartUploadItem, this.currentUploadItemIndex);


        ////
        // 기존 파일 정보 요청
        this.sendPartialFileInfo(fileInfo);
        ////

    };

    this.sendLargeFormDataForFolder = function (parentFileInfo) {
        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        this.childFileInfoList = this.folderInfoMap.get(parentFileInfo.folderId);
        var childFileInfo = this.childFileInfoList[this.currentUploadItemIndexForFolder];

        //  WAIT인 것만 업로드
        if (childFileInfo.status != "WAIT") {
            if (fileInfo.status == "COMPLETION")
                this.updateProgressStatus('COMPLETION');

            this.nextOrEndUploadFolder();
            return;
        }

        if (this.getUploadStatus() != "TRANSFERRING")
            return;


        // 처음 폴더를 업로드 할 때만 이벤트 변경을 한다. 
        if (parentFileInfo.status == "WAIT") {
            this.updateProgressStatus("TRANSFERRING", 0);
            this.dispatchEvent(this.onStartUploadItem, this.currentUploadItemIndex);
        }


        ////
        // 기존 파일 정보 요청
        this.sendPartialFileInfoForFolder(parentFileInfo);
        ////

    };

    this.sendPartialFileInfo = function (fileInfo) {
        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        var formData = new FormData();
        formData.append("CU_UPLOAD_MODE", this.uploadMode);
        formData.append("CU_FILE_GROUP_ID", this.fileGroupId);
        formData.append("CU_FILE_DIR_PATH", fileInfo.fileDirPath);
        formData.append("CU_FILE_NAME", fileInfo.fileName);
        formData.append("CU_FILE_SIZE", fileInfo.fileSize);

        fileInfo.xmlHttpRequest = new XMLHttpRequest();
        fileInfo.xmlHttpRequest.open("POST", this.configUrl, true);

        fileInfo.xmlHttpRequest.onreadystatechange = function () {
            var manager = self;
            var monitor = parent.fileUploadMonitor;
            var fileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);

            if (fileInfo.xmlHttpRequest.readyState == 4 && fileInfo.xmlHttpRequest.status == 200) {
                var partialInfo = jQuery.parseJSON(fileInfo.xmlHttpRequest.responseText.trim());

                fileInfo.fileGroupId = partialInfo.fileGroupId;
                fileInfo.fileNameKey = partialInfo.fileNameKey;
                fileInfo.fileDirPath = partialInfo.fileDirPath;
                fileInfo.tempFileSize = Number(partialInfo.tempFileSize);
                fileInfo.transferedSize = fileInfo.tempFileSize;
                fileInfo.tempFileUpdatedDate = partialInfo.tempFileUpdatedDate;
                fileInfo.isExistedFile = partialInfo.isExistedFile;

                if (partialInfo.isExistedFile == true) {
                    if (manager.uploadMode == "RESUME") {
                        if (monitor.getApplyAllFilesCheckBoxStatus() == false) {
                            monitor.openResumeOptionDlg(fileInfo);
                        } else {
                            // 대화상자에서 한번 선택했다고 가정한다. 또는 기본값이 NEW라고 가정한다.  
                            var isNextPartialFile = manager.selectedResumeMode == "ADD" ? true : false;
                            manager.sendPartialFile(isNextPartialFile);
                        }
                    } else {
                        manager.sendPartialFile(false);
                    }
                } else {
                    manager.sendPartialFile(false);
                }
            } else if (fileInfo.xmlHttpRequest.readyState == 4 && fileInfo.xmlHttpRequest.status >= 500) {
                clearInterval(manager.progressTimer);
                manager.updateProgressStatus('FAILURE');
                manager.setUploadStatus('FAILURE');
                monitor.resetButtonStatus();

                var keys = new Array('code', 'message', 'detailMessage');
                var values = new Array(manager.global.HTTP_STATUS_ERROR, fileInfo.xmlHttpRequest.status.toString(), fileInfo.xmlHttpRequest.responseText.trim());
                manager.setLastExceptionInfo(manager.utils.getJsonString(keys, values));
                manager.dispatchEvent(manager.onException);
            }
        };

        fileInfo.xmlHttpRequest.upload.addEventListener("progress", this.updateProgressForLargeFile, false);
        fileInfo.xmlHttpRequest.addEventListener("load", this.transferComplete, false);
        fileInfo.xmlHttpRequest.upload.addEventListener("error", this.transferFailed, false);
        fileInfo.xmlHttpRequest.addEventListener("abort", this.transferCanceled, false);

        fileInfo.xmlHttpRequest.send(formData);
    }


    this.sendPartialFileInfoForFolder = function (parentFileInfo) {
        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        this.childFileInfoList = this.folderInfoMap.get(parentFileInfo.folderId);

        var childFileInfo = this.childFileInfoList[this.currentUploadItemIndexForFolder];

        var formData = new FormData();
        formData.append("CU_UPLOAD_MODE", this.uploadMode);
        formData.append("CU_FILE_GROUP_ID", this.fileGroupId);
        formData.append("CU_FILE_DIR_PATH", childFileInfo.fileDirPath);
        formData.append("CU_FILE_NAME", childFileInfo.fileName);
        formData.append("CU_FILE_SIZE", childFileInfo.fileSize);

        childFileInfo.xmlHttpRequest = new XMLHttpRequest();
        childFileInfo.xmlHttpRequest.open("POST", this.configUrl, true);

        childFileInfo.xmlHttpRequest.onreadystatechange = function () {
            var manager = self;
            var monitor = parent.fileUploadMonitor;
            var parentFileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);
            var childFileInfo = manager.childFileInfoList[manager.currentUploadItemIndexForFolder];

            if (childFileInfo.xmlHttpRequest.readyState == 4 && childFileInfo.xmlHttpRequest.status == 200) {
                var partialInfo = jQuery.parseJSON(childFileInfo.xmlHttpRequest.responseText.trim());

                childFileInfo.fileGroupId = partialInfo.fileGroupId;
                childFileInfo.fileNameKey = partialInfo.fileNameKey;
                childFileInfo.fileDirPath = partialInfo.fileDirPath;
                childFileInfo.tempFileSize = Number(partialInfo.tempFileSize);
                childFileInfo.transferedSize = childFileInfo.tempFileSize;
                childFileInfo.tempFileUpdatedDate = partialInfo.tempFileUpdatedDate;
                childFileInfo.isExistedFile = partialInfo.isExistedFile;

                if (partialInfo.isExistedFile == true) {
                    if (manager.uploadMode == "RESUME") {
                        if (monitor.getApplyAllFilesCheckBoxStatus() == false) {
                            monitor.openResumeOptionDlg(childFileInfo);
                        } else {
                            // 대화상자에서 한번 선택했다고 가정한다. 또는 기본값이 NEW라고 가정한다.  
                            var isNextPartialFile = manager.selectedResumeMode == "ADD" ? true : false;
                            manager.sendPartialFileForFolder(parentFileInfo, isNextPartialFile);
                        }
                    } else {
                        manager.sendPartialFileForFolder(parentFileInfo, false);
                    }
                } else {
                    manager.sendPartialFileForFolder(parentFileInfo, false);
                }
            } else if (childFileInfo.xmlHttpRequest.readyState == 4 && childFileInfo.xmlHttpRequest.status >= 500) {
                clearInterval(manager.progressTimer);
                manager.updateProgressStatus('FAILURE');
                manager.setUploadStatus('FAILURE');
                monitor.resetButtonStatus();

                var keys = new Array('code', 'message', 'detailMessage');
                var values = new Array(manager.global.HTTP_STATUS_ERROR, childFileInfo.xmlHttpRequest.status.toString(), childFileInfo.xmlHttpRequest.responseText.trim());
                manager.setLastExceptionInfo(manager.utils.getJsonString(keys, values));
                manager.dispatchEvent(manager.onException);
            }
        };

        childFileInfo.xmlHttpRequest.upload.addEventListener("progress", this.updateProgressForLargeFile, false);
        childFileInfo.xmlHttpRequest.addEventListener("load", this.transferComplete, false);
        childFileInfo.xmlHttpRequest.upload.addEventListener("error", this.transferFailed, false);
        childFileInfo.xmlHttpRequest.addEventListener("abort", this.transferCanceled, false);

        childFileInfo.xmlHttpRequest.send(formData);
    }


    this.sendPartialFile = function (isNextPartialFile) {
        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        var fileInfo = this.getFileInfoFromMap(this.currentUploadItemIndex);

        var startFilePos = 0;
        //var endFilePos = 1024 * 4; 
        var endFilePos = 1024 * 1024 * 1024;
        //var endFilePos = 1024 * 1024 * 1024 * 4; 

        if (isNextPartialFile == true)
            startFilePos = fileInfo.tempFileSize;
        else
            fileInfo.tempFileSize = 0;

        if (startFilePos + endFilePos > fileInfo.fileSize)
            endFilePos = startFilePos + (fileInfo.fileSize - startFilePos);
        else
            endFilePos = startFilePos + endFilePos;

        var blobData = fileInfo.file.slice(startFilePos, endFilePos);
        blobData.lastModifiedDate = new Date();
        blobData.name = fileInfo.fileName;

        var formData = new FormData();

        formData.append("CU_UPLOAD_MODE", this.uploadMode);
        formData.append("CU_START_FILE_POS", startFilePos);
        formData.append("CU_FILE_GROUP_ID", this.fileGroupId);
        formData.append("CU_FILE_DIR_PATH", fileInfo.fileDirPath);
        formData.append("CU_FILE_NAME_KEY", fileInfo.fileNameKey);
        formData.append("CU_FILE_NAME", fileInfo.fileName);
        formData.append("CU_FILE_SIZE", fileInfo.fileSize);
        formData.append("CU_FILE", blobData);

        fileInfo.xmlHttpRequest = new XMLHttpRequest();
        fileInfo.xmlHttpRequest.open("POST", this.uploadUrl, true);

        fileInfo.xmlHttpRequest.onreadystatechange = function () {
            var manager = self;
            var monitor = parent.fileUploadMonitor;
            var fileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);

            if (fileInfo.xmlHttpRequest.readyState == 4 && fileInfo.xmlHttpRequest.status == 200) {

                var partialInfo = jQuery.parseJSON(fileInfo.xmlHttpRequest.responseText.trim());

                if (partialInfo.largeUploadStatus == "COMPLETION") {
                    manager.uploadedFileInfoList.push(fileInfo.xmlHttpRequest.responseText.trim());
                    manager.updateProgressStatus('COMPLETION');
                    manager.dispatchEvent(manager.onEndUploadItem, manager.currentUploadItemIndex);

                    // Next or end upload
                    manager.nextOrEndUpload();
                } else {
                    fileInfo.tempFileSize = Number(partialInfo.tempFileSize);
                    fileInfo.transferedSize = fileInfo.tempFileSize;
                    manager.sendPartialFile(true);

                }
            } else if (fileInfo.xmlHttpRequest.readyState == 4 && fileInfo.xmlHttpRequest.status >= 500) {
                clearInterval(manager.progressTimer);
                manager.updateProgressStatus('FAILURE');
                manager.setUploadStatus('FAILURE');
                monitor.resetButtonStatus();

                var keys = new Array('code', 'message', 'detailMessage');
                var values = new Array(manager.global.HTTP_STATUS_ERROR, fileInfo.xmlHttpRequest.status.toString(), fileInfo.xmlHttpRequest.responseText.trim());
                manager.setLastExceptionInfo(manager.utils.getJsonString(keys, values));
                manager.dispatchEvent(manager.onException);
            }
        };

        fileInfo.xmlHttpRequest.upload.addEventListener("progress", this.updateProgressForLargeFile, false);
        fileInfo.xmlHttpRequest.addEventListener("load", this.transferComplete, false);
        fileInfo.xmlHttpRequest.upload.addEventListener("error", this.transferFailed, false);
        fileInfo.xmlHttpRequest.addEventListener("abort", this.transferCanceled, false);

        fileInfo.xmlHttpRequest.send(formData);
    }

    this.sendPartialFileForFolder = function (parentFileInfo, isNextPartialFile) {
        if (this.getUploadStatus() != "TRANSFERRING")
            return;

        this.childFileInfoList = this.folderInfoMap.get(parentFileInfo.folderId);

        var childFileInfo = this.childFileInfoList[this.currentUploadItemIndexForFolder];

        var startFilePos = 0;
        //var endFilePos = 1024 * 4; 
        var endFilePos = 1024 * 1024 * 1024;
        //var endFilePos = 1024 * 1024 * 1024 * 4; 

        if (isNextPartialFile == true)
            startFilePos = childFileInfo.tempFileSize;
        else
            childFileInfo.tempFileSize = 0;

        if (startFilePos + endFilePos > childFileInfo.fileSize)
            endFilePos = startFilePos + (childFileInfo.fileSize - startFilePos);
        else
            endFilePos = startFilePos + endFilePos;

        var blobData = childFileInfo.file.slice(startFilePos, endFilePos);
        blobData.lastModifiedDate = new Date();
        blobData.name = childFileInfo.fileName;

        var formData = new FormData();

        formData.append("CU_UPLOAD_MODE", this.uploadMode);
        formData.append("CU_START_FILE_POS", startFilePos);
        formData.append("CU_FILE_GROUP_ID", this.fileGroupId);
        formData.append("CU_FILE_DIR_PATH", childFileInfo.fileDirPath);
        formData.append("CU_FILE_NAME_KEY", childFileInfo.fileNameKey);
        formData.append("CU_FILE_NAME", childFileInfo.fileName);
        formData.append("CU_FILE_SIZE", childFileInfo.fileSize);
        formData.append("CU_FILE", blobData);

        childFileInfo.xmlHttpRequest = new XMLHttpRequest();
        childFileInfo.xmlHttpRequest.open("POST", this.uploadUrl, true);

        childFileInfo.xmlHttpRequest.onreadystatechange = function () {
            var manager = self;
            var monitor = parent.fileUploadMonitor;
            var parentFileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);
            var childFileInfo = manager.childFileInfoList[manager.currentUploadItemIndexForFolder];

            if (childFileInfo.xmlHttpRequest.readyState == 4 && childFileInfo.xmlHttpRequest.status == 200) {

                var partialInfo = jQuery.parseJSON(childFileInfo.xmlHttpRequest.responseText.trim());

                if (partialInfo.largeUploadStatus == "COMPLETION") {
                    manager.uploadedFileInfoList.push(childFileInfo.xmlHttpRequest.responseText.trim());

                    if ((manager.currentUploadItemIndexForFolder + 1) == manager.childFileInfoList.length) {
                        manager.updateProgressStatus('COMPLETION');
                        manager.dispatchEvent(manager.onEndUploadItem, manager.currentUploadItemIndex);

                        // Next or end upload
                        manager.currentUploadItemIndexForFolder = 0;
                        manager.totalUploadedFileSizeForFolder = 0;
                        manager.nextOrEndUpload();
                    } else {
                        manager.updateProgressStatus('COMPLETION', 0, true);
                        manager.nextOrEndUploadForFolder();
                    }
                } else {
                    childFileInfo.tempFileSize = Number(partialInfo.tempFileSize);
                    childFileInfo.transferedSize = childFileInfo.tempFileSize;
                    manager.sendPartialFileForFolder(parentFileInfo, true);

                }
            } else if (childFileInfo.xmlHttpRequest.readyState == 4 && childFileInfo.xmlHttpRequest.status >= 500) {
                clearInterval(manager.progressTimer);
                manager.updateProgressStatus('FAILURE');
                manager.setUploadStatus('FAILURE');
                monitor.resetButtonStatus();

                var keys = new Array('code', 'message', 'detailMessage');
                var values = new Array(manager.global.HTTP_STATUS_ERROR, childFileInfo.xmlHttpRequest.status.toString(), childFileInfo.xmlHttpRequest.responseText.trim());
                manager.setLastExceptionInfo(manager.utils.getJsonString(keys, values));
                manager.dispatchEvent(manager.onException);
            }
        };

        childFileInfo.xmlHttpRequest.upload.addEventListener("progress", this.updateProgressForLargeFile, false);
        childFileInfo.xmlHttpRequest.addEventListener("load", this.transferComplete, false);
        childFileInfo.xmlHttpRequest.upload.addEventListener("error", this.transferFailed, false);
        childFileInfo.xmlHttpRequest.addEventListener("abort", this.transferCanceled, false);

        childFileInfo.xmlHttpRequest.send(formData);
    }

    this.setSelectedResumeMode = function (selectedResumeMode) {
        this.selectedResumeMode = selectedResumeMode;
    }


    this.setLastExceptionInfo = function (lastExceptionInfo) {
        this.lastExceptionInfo = lastExceptionInfo;
    }
    this.getLastExceptionInfo = function () {
        return this.lastExceptionInfo;
    }

    this.updateProgress = function (event) {
        if (event.lengthComputable) {
            var fileInfo = self.getFileInfoFromMap(self.currentUploadItemIndex);
            if (fileInfo.fileType == 'FOLDER') {
                fileInfo.transferedSize = self.totalUploadedFileSizeForFolder + event.loaded;
            } else
                fileInfo.transferedSize = event.loaded;
        } else {
            // Unable to compute progress information since the total size is unknown
        }
    }


    this.updateProgressForLargeFile = function (event) {
        if (event.lengthComputable) {
            var fileInfo = self.getFileInfoFromMap(self.currentUploadItemIndex);
            if (fileInfo.fileType == 'FOLDER') {
                fileInfo.transferedSize = self.childFileInfoList[self.currentUploadItemIndexForFolder].tempFileSize + self.totalUploadedFileSizeForFolder + event.loaded;
            } else
                fileInfo.transferedSize = fileInfo.tempFileSize + event.loaded;
        } else {
            // Unable to compute progress information since the total size is unknown
        }
    }


    this.transferComplete = function (event) {
        //console.log("The transfer is complete.");
    }

    this.transferFailed = function (event) {
        //console.log("An error occurred while transferring the file.");
        //clearInterval(self.progressTimer);
        //console.log(event.status);
    }

    this.transferCanceled = function (evnet) {
        //console.log("The transfer has been canceled by the user.");
        //clearInterval(self.progressTimer);

        var monitor = parent.fileUploadMonitor;
        self.updateProgressStatus('WAIT');
        self.setUploadStatus('WAIT');
        monitor.resetButtonStatus();
        self.dispatchEvent(self.onCancelUploadItem, self.currentUploadItemIndex);
    }

    this.getUploadedFilesInfo = function () {
        var i = 0;
        var json = "";

        if (this.downloadUrl) {
            this.currentFileInfoMap.forEach((value, key) => {
                var objString = "";
                for (i = 0; i < this.uploadedFileInfoList.length; i++) {
                    var obj = jQuery.parseJSON(this.uploadedFileInfoList[i]);
                    if (obj.fileName == value.fileName) {
                        objString = this.uploadedFileInfoList[i];
                    }
                }
                json += objString + ',';
            });
            if (json) {
                json = '[' + json.substring(0, json.length - 1) + ']';
            } else {
                return '[]';
            }
        } else {
            if (this.uploadedFileInfoList.length == 0)
                return '[]';

            for (i = 0; i < this.uploadedFileInfoList.length; i++) {
                json += this.uploadedFileInfoList[i] + ',';
            }

            if (json.length > 0)
                json = '[' + json.substring(0, json.length - 1) + ']';
        }


        return json;
    }

    this.getModifiedFilesInfo = function () {
        var fileItem;
        var i = 0;
        var json = "";

        if (this.modifiedFilesInfoList.length == 0)
            return '[]';

        for (i = 0; i < this.modifiedFilesInfoList.length; i++) {
            json += this.getFileInfoToJson(this.modifiedFilesInfoList[i]) + ',';
        }

        if (json.length > 0)
            json = '[' + json.substring(0, json.length - 1) + ']';

        return json;
    }

    /*
    this.getUploadedFileInfoAt = function (rowIndex) {
        var fileItem;
        var i = 0;

        if (this.uploadedFileInfoList.length < (rowIndex+1))
            return '{}';

        return this.uploadedFileInfoList[rowIndex];
    }
    */


    this.getFileInfoAt = function (rowIndex) {
        if (this.fileInfoMap.size < (rowIndex + 1))
            return '{}';

        return this.getFileInfoToJson(this.getFileInfoFromMap(rowIndex));
    }

    this.getFileAt = function (rowIndex) {
        if (this.fileInfoMap.size < (rowIndex + 1))
            return null;

        var fileInfo = this.getFileInfoFromMap(rowIndex);
        if (fileInfo.fileType != "NORMAL")
            return null;

        return fileInfo.file;
    }

    this.getFileInfoToJson = function (fileInfo) {
        var keys = new Array('fileType', 'fileId', 'fileName', 'fileSize', 'status', 'isDeleted');
        var values = new Array(fileInfo.fileType, fileInfo.fileId, fileInfo.fileName, fileInfo.fileSize, fileInfo.status, fileInfo.isDeleted);
        return this.utils.getJsonString(keys, values);
    }

    this.dispatchEvent = function (eventName, eventParam) {
        if (eventName == undefined || eventName == "")
            return;

        if (eventParam != undefined)
            setTimeout(this.utils.stringFormat(eventName + '(' + eventParam + ')'), 0);
        else
            setTimeout(this.utils.stringFormat(eventName + '()'), 0);
    };


    this.setEvnetNames = function (eventNames) {
        var obj = jQuery.parseJSON(eventNames);

        this.onStartUpload = obj.onStartUpload;
        this.onStartUploadItem = obj.onStartUploadItem;
        this.onEndUploadItem = obj.onEndUploadItem;
        this.onEndUpload = obj.onEndUpload;
        this.onCloseMonitorWindow = obj.onCloseMonitorWindow;
        this.onCancelUploadItem = obj.onCancelUploadItem;
        this.onException = obj.onException;
        this.onDblClickGridRow = obj.onDblClickGridRow;
    };

    this.getUploadStatus = function () {
        return this.uploadStatus;
    };

    this.setUploadStatus = function (uploadStatus) {
        this.uploadStatus = uploadStatus;
    };

    this.getTotalFileCount = function () {
        return this.dataGrid.getData().length;
    }


    this.addUploadedFile = function (uploadedFileInfoJsonString) {
        var uploadedFileInfo = jQuery.parseJSON(uploadedFileInfoJsonString);
        var fileId = uploadedFileInfo.fileId;
        var fileName = uploadedFileInfo.fileName;
        var fileSize = uploadedFileInfo.fileSize;

        var dataGrid = self.dataGrid;

        var fileInfo = new __UploadFileInfo();
        fileInfo.id = this.utils.getGuid();
        fileInfo.fileId = uploadedFileInfo.fileId;
        fileInfo.fileName = uploadedFileInfo.fileName;
        fileInfo.fileSize = parseInt(uploadedFileInfo.fileSize);
        fileInfo.transferedSize = 0;
        fileInfo.fileType = 'UPLOADED';
        fileInfo.status = 'WAIT';
        var statusLabel = '대기';

        self.fileInfoMap.set(fileInfo.id, fileInfo);
        self.modifiedFilesInfoList.push(fileInfo);

        var datas = dataGrid.getData();
        datas.splice(datas.length, 0, {
            'src': window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/' + this.utils.getFileExtension(fileInfo.fileName) + '.png',
            'title': fileName,
            'size': self.utils.convertByteUnit(fileSize),
            'status': statusLabel,
            'realSize': fileSize,
            'id': fileInfo.id
        });
        dataGrid.invalidateRow(datas.length);
        dataGrid.updateRowCount();
        dataGrid.render();
        dataGrid.scrollRowIntoView(datas.length - 1)

        self.totalFileSize += fileInfo.fileSize;
        self.updateStatus();
    }

    this.addFiles = function (files) {
        var dataGrid = self.dataGrid;
        for (var i = 0; i < files.length; i++) {
            // Check limit
            if (this.checkLimit(files[i]) == false)
                break;

            var fileInfo = new __UploadFileInfo();
            fileInfo.id = this.utils.getGuid();
            fileInfo.file = files[i];
            fileInfo.fileName = fileInfo.file.name;
            fileInfo.fileSize = fileInfo.file.size;
            fileInfo.transferedSize = 0;
            fileInfo.fileType = 'NORMAL';
            fileInfo.status = 'WAIT';
            var statusLabel = '대기';

            self.fileInfoMap.set(fileInfo.id, fileInfo);
            var datas = dataGrid.getData();
            datas.splice(datas.length, 0, {
                'src': window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/' + this.utils.getFileExtension(fileInfo.fileName) + '.png',
                'title': fileInfo.fileName,
                'size': self.utils.convertByteUnit(fileInfo.fileSize),
                'status': statusLabel,
                'realSize': fileInfo.fileSize,
                'id': fileInfo.id
            });
            dataGrid.invalidateRow(datas.length);
            dataGrid.updateRowCount();
            dataGrid.render();
            dataGrid.scrollRowIntoView(datas.length - 1)

            self.totalFileSize += fileInfo.fileSize;
        }
    };

    this.addFilesToFolderList = function (files) {
        // Add child file list to folder map 
        var childFileInfoList = [];
        var folderSize = 0;
        var folderId = this.utils.getGuid();

        for (var i = 0; i < files.length; i++) {
            // Check limit
            if (this.checkLimit(files[i]) == false)
                break;

            var fileInfo = new __UploadFileInfo();
            fileInfo.id = this.utils.getGuid();
            var filePath = files[i].webkitRelativePath;
            fileInfo.file = files[i];
            fileInfo.fileDirPath = filePath.substring(0, filePath.lastIndexOf("/"));
            fileInfo.fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
            fileInfo.fileSize = fileInfo.file.size;
            fileInfo.transferedSize = 0;
            fileInfo.fileType = 'NORMAL';
            fileInfo.status = 'WAIT';

            childFileInfoList.push(fileInfo);

            folderSize += fileInfo.fileSize;
            self.totalFileSize += fileInfo.fileSize;
        }
        self.folderInfoMap.set(folderId, childFileInfoList);

        // Add folder info to file list
        var rootFolderName = files[0].webkitRelativePath;
        rootFolderName = rootFolderName.substring(0, rootFolderName.indexOf("/"));

        var folderInfo = new __UploadFileInfo();
        folderInfo.id = this.utils.getGuid();
        folderInfo.folderId = folderId;
        folderInfo.file = files[i];
        folderInfo.fileDirPath = '';
        folderInfo.fileName = rootFolderName;
        folderInfo.fileSize = folderSize;
        folderInfo.transferedSize = 0;
        folderInfo.fileType = 'FOLDER';
        folderInfo.status = 'WAIT';
        var statusLabel = '대기';

        self.fileInfoMap.set(folderInfo.id, folderInfo);

        var dataGrid = self.dataGrid;
        var datas = dataGrid.getData();
        datas.splice(datas.length, 0, {
            'src': window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/folder.png',
            'title': folderInfo.fileName,
            'size': self.utils.convertByteUnit(folderInfo.fileSize),
            'status': statusLabel,
            'realSize': fileInfo.fileSize,
            'id': folderInfo.id
        });
        dataGrid.invalidateRow(datas.length);
        dataGrid.updateRowCount();
        dataGrid.render();
        dataGrid.scrollRowIntoView(datas.length - 1)
    };

    this.onFileSelect = function (event) {
        self.addFiles(event.target.files);
        self.updateStatus();

        // 연속된 동일파일 선택에 대한 예외처리
        this.value = "";
    };

    this.onFolderSelect = function (event) {
        self.addFilesToFolderList(event.target.files);
        self.updateStatus();

        // 연속된 동일파일 선택에 대한 예외처리
        this.value = "";
    };
    this.setFileFilter = function (fileFilterInfo) {
        if (fileFilterInfo == undefined || fileFilterInfo == '')
            return;
        $('#' + this.fileButton).prop('accept', fileFilterInfo);
    };

    this.setAllowedFileExtension = function (allowedExtension, fileExtensionCheckMode) {
        this.allowedFileExtensionList = allowedExtension.toLowerCase().split('|');
        this.fileExtensionCheckMode = fileExtensionCheckMode;
    };

    this.setMaxFileCount = function (maxFileCount) {
        if (maxFileCount <= 0)
            maxFileCount = -1;

        this.maxFileCount = maxFileCount;
    };

    this.setMaxTotalFileSize = function (maxTotalFileSize) {
        if (maxTotalFileSize <= 0)
            maxTotalFileSize = -1;

        this.maxTotalFileSize = maxTotalFileSize;
    };

    this.setMaxFileSize = function (maxFileSize) {
        if ((this.uploadMode == "LARGE" || this.uploadMode == "RESUME") && maxFileSize <= 0)
            maxFileSize = -1;
        else if (maxFileSize <= 0 || maxFileSize > this.global.MAX_FILE_SIZE)
            maxFileSize = this.global.MAX_FILE_SIZE;

        this.maxFileSize = maxFileSize;
    };

    this.setUploadMode = function (uploadMode) {
        this.uploadMode = uploadMode;
    };

    this.setFileGroupId = function (fileGroupId) {
        this.fileGroupId = fileGroupId;
    };


    this.checkLimit = function (file) {
        var isValid = true;
        var keys = null;
        var values = null;

        if (this.allowedFileExtensionList.length > 0) {
            // Check extension 
            var ext = '';
            var index = file.name.lastIndexOf('.');
            if (index != -1) {
                ext = file.name.substring(index + 1);
                ext = ext.toLowerCase();
            }

            // 허용된 확장자 검사
            if (this.fileExtensionCheckMode == 'FORWARD') {
                isValid = false;
                for (var i = 0; i < this.allowedFileExtensionList.length; i++) {
                    if (this.allowedFileExtensionList[i] == ext) {
                        isValid = true;
                        break;
                    }
                }
                if (isValid == false) {
                    keys = new Array('code', 'message', 'detailMessage');
                    values = new Array(this.global.ALLOWED_EXTENSION_ERROR,
                        this.utils.stringFormat('({0}) 파일은 전송이 제한된 파일 확장자입니다.', file.name), '');
                }
            }
            // 허용되지 않은 확장자 검사
            else {
                isValid = true;
                var checkValue = 0;
                for (var i = 0; i < this.allowedFileExtensionList.length; i++) {
                    if (this.allowedFileExtensionList[i] == ext) {
                        checkValue = 1;
                    }
                }
                if (checkValue == 0) {
                    isValid = false;
                }
                if (isValid == false) {
                    keys = new Array('code', 'message', 'detailMessage');
                    values = new Array(this.global.ALLOWED_EXTENSION_ERROR,
                        this.utils.stringFormat('({0}) 파일은 전송이 제한된 파일 확장자입니다.', file.name), '');
                }
            }
        }

        if (isValid == true) {
            // Check max file count
            if (this.maxFileCount != -1 && this.maxFileCount < this.fileInfoMap.size + 1) {
                keys = new Array('code', 'message', 'detailMessage');
                values = new Array(this.global.MAX_FILE_COUNT_ERROR,
                    this.utils.stringFormat('전송할 수 있는  파일 개수는 {0} 입니다.', this.utils.numberFormat(this.maxFileCount, 0)), '');

                isValid = false;
            }
            // Check max file size
            else if (this.maxFileSize != -1 && this.maxFileSize < file.size) {
                keys = new Array('code', 'message', 'detailMessage');
                values = new Array(this.global.MAX_FILE_SIZE_ERROR,
                    this.utils.stringFormat('{0}보다 큰 파일({1})은 전송할 수 없습니다.', this.utils.numberFormat(this.maxFileSize, 0), file.name), '');

                isValid = false;
            }
            // Check max total file size
            else if (this.maxTotalFileSize != -1 && this.maxTotalFileSize < this.totalFileSize + file.size) {
                keys = new Array('code', 'message', 'detailMessage');
                values = new Array(this.global.MAX_FILE_COUNT_ERROR,
                    this.utils.stringFormat('전송할 수 있는 전체 파일의 크기는 {0}입니다.', this.utils.numberFormat(this.maxTotalFileSize, 0)), '');

                isValid = false;
            }
        }

        if (isValid == false) {
            this.setLastExceptionInfo(this.utils.getJsonString(keys, values));
            this.dispatchEvent(this.onException);
        }

        return isValid;
    };

    this.initFilesInfo = function () {
        if (this.getUploadStatus() == "TRANSFERRING")
            return;

        // 파일 정보 초기화
        for (var i = 0; i < this.dataGrid.getData().length; i++) {
            var id = this.dataGrid.getDataItem(i)["id"];
            var fileInfo = this.fileInfoMap.get(id);

            fileInfo.status = "WAIT";
            fileInfo.transferedSize = 0;

            if (fileInfo.fileType == 'FOLDER') {
                var childFileInfoList = this.folderInfoMap.get(id);
                for (var ci = 0; ci < childFileInfoList.length; ci++) {
                    var childFileInfo = childFileInfoList[ci];
                    childFileInfo.status = "WAIT";
                    childFileInfo.transferedSize = 0;
                }
            }

            this.dataGrid.getDataItem(i)["status"] = "대기";
            this.dataGrid.updateCell(i, 2)
        }

        this.dataGrid.render();

        this.uploadedFileInfoList = [];
        this.modifiedFilesInfoList = [];

        // 예외처리 정보 초기화
        this.setLastExceptionInfo('')
    };

    this.getFileInfoFromMap = function (gridRowIndex) {
        var id = this.dataGrid.getDataItem(gridRowIndex)["id"];
        return this.fileInfoMap.get(id);
    };

    this.deleteFileInfoFromMap = function (gridRowIndex) {
        var id = this.dataGrid.getDataItem(gridRowIndex)["id"];
        this.fileInfoMap.delete(id);
    };

    this.numericSorter = function (a, b) {
        var x = a[self.currentSortCol], y = b[self.currentSortCol];
        return self.isAsc * (x == y ? 0 : (x > y ? 1 : -1));
    };

    this.sizeSorter = function (a, b) {
        var x = a["realSize"], y = b["realSize"];
        return self.isAsc * (x == y ? 0 : (x > y ? 1 : -1));
    };

    /*
    this.ratingSorter = function(a, b)
    {
        var xrow = a[self.currentSortCol], yrow = b[self.currentSortCol];
        console.log(xrow);
        var x = xrow[3], y = yrow[3];
        console.log(x);
        return self.isAsc * (x == y ? 0 : (x > y ? 1 : -1));
    }
    */

    this.moveFirstLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == 0)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(0, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [0];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(0);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };

    this.movePrevLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == 0)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(index - 1, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [index - 1];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(index - 1);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };

    this.moveNextLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == dataList.length - 1)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(index + 1, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [index + 1];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(index + 1);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };

    this.moveLastLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == dataList.length - 1)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(dataList.length, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [dataList.length - 1];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(dataList.length - 1);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };
};

var __FileUploadMonitor = function (_parent) {
    var parent = _parent;
    var self = this;
    this.utils = new __NamoCrossUploaderUtils();

    this.backgroundPanel = this.utils.getGuid();
    this.mainPanel = this.utils.getGuid();

    this.titlePanel = this.utils.getGuid();
    this.titleLabel = this.utils.getGuid();

    this.progressPanel = this.utils.getGuid();
    this.totalUploadedFileSizeLabel = this.utils.getGuid();
    this.totalFileSizeLabel = this.utils.getGuid();
    this.transferSpeedLabel = this.utils.getGuid();
    this.totalUploadedPercentLabel = this.utils.getGuid();
    this.remainingTimeLabel = this.utils.getGuid();
    this.remainingTimeUnitLabel = this.utils.getGuid();
    this.progressBar = this.utils.getGuid();

    this.monitorDataGrid = this.utils.getGuid();

    this.buttonPanel = this.utils.getGuid();
    this.closeCheckBox = this.utils.getGuid();
    this.transferButton = this.utils.getGuid();
    this.closeButton = this.utils.getGuid();

    // resume option dlg
    this.roBackgroundPanel = "";
    this.roMainPanel = "";
    this.roTitlePanel = "";
    this.roTitleLabel = "";
    this.roFileInfoPanel = "";
    this.roExistedUploadInfoLabel_01 = "";
    this.roExistedUploadInfoLabel_02 = "";
    this.roExistedUploadInfoLabel_03 = "";
    this.roPreviewImage = "";
    this.roTotalFileSizeTitle = "";
    this.roTotalFileSizeValue = "";
    this.roTransferedFileSizeTitle = "";
    this.roTransferedFileSizeValue = "";
    this.roRemainedFileSizeTitle = "";
    this.roRemainedFileSizeValue = "";
    this.roLastModifiedDateTitle = "";
    this.roLastModifiedDateValue = "";
    this.roApplyAllFilesCheckBox = "";
    this.roApplyAllFilesDesc = "";
    this.roResumeUploadButton = "";
    this.roReUploadButton = "";


    this.width = 610;
    this.height = 358;
    this.defaultMargin = 4;
    this.leftMargin = 16;
    this.rightMargin = 16;
    this.topMargin = 4;
    this.titlePanelHeight = 33;
    this.progressPanelHeight = 58;
    this.progressBarHeight = 17;
    this.dataGridHeight = 207; // 213
    this.buttonPanelHeight = 33;

    this.dataGrid;

    this.fontFamily = "Malgun Gothic";
    this.monitorLayerClass = "";
    this.monitorBgLayerClass = "";
    this.resumeOptionLayerClass = "";
    this.resumeOptionBgLayerClass = "";

    this.uploadMode = "BASIC";

    this.create = function (properties, uploadMode) {
        var obj = jQuery.parseJSON(properties);
        this.monitorLayerClass = obj.monitorLayerClass;
        this.monitorBgLayerClass = obj.monitorBgLayerClass;

        if (obj.resumeOptionLayerClass != undefined && obj.resumeOptionLayerClass != "" &&
            obj.resumeOptionBgLayerClass != undefined && obj.resumeOptionBgLayerClass != "") {
            this.resumeOptionLayerClass = obj.resumeOptionLayerClass;
            this.resumeOptionBgLayerClass = obj.resumeOptionBgLayerClass;
        }

        if (uploadMode != undefined && uploadMode != "")
            this.uploadMode = uploadMode;

        this.createControls();
        this.setEventHandler();
        this.setCloseMonitorCheckBoxStatus(obj.closeMonitorCheckBoxChecked)
    };

    this.setProperties = function (properties) {
        if (properties == undefined)
            return;

        this.resetProperties(properties);
    };


    this.resetProperties = function (properties) {
        if (properties == undefined)
            return;

        var obj = jQuery.parseJSON(properties);

        if (obj.closeMonitorCheckBoxChecked != undefined)
            this.setCloseMonitorCheckBoxStatus(obj.closeMonitorCheckBoxChecked);
    };

    this.createControls = function () {
        this.createMonitorDlg();

        if (this.uploadMode == "RESUME")
            this.createResumeOptionDlg();
    };


    this.createMonitorDlg = function () {
        // Background Panel
        $('body').append(this.utils.stringFormat('<div id="{0}" style="display:none;" class="{1}"></div>',
            this.backgroundPanel, this.monitorBgLayerClass));

        // Main Panel
        $('body').append(this.utils.stringFormat('<div id="{0}" style="display:none;width:{1}px;height:{2}px;background:#EEEEEE;" class={3}></div>',
            this.mainPanel, this.width, this.height, this.monitorLayerClass));

        // Title Panel 
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;background:#4072CB;"></div>',
            this.titlePanel, this.width, this.titlePanelHeight));
        $('#' + this.titlePanel).append(this.utils.stringFormat('<span id="{0}" ' +
            'style="display:inline-block;margin-left:{1}px;margin-top:{2}px;color:white;font-family:{3};font-size:12px;">파일 업로드</span>',
            this.titleLabel, this.leftMargin, this.topMargin * 2, this.fontFamily));

        // Progressbar Panel
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;"></div>',
            this.progressPanel, this.width, this.progressPanelHeight));
        $('#' + this.progressPanel).append(this.utils.stringFormat('<span id="{0}" ' +
            'style="display:inline-block;margin-left:{1}px;margin-top:{2}px;color:#7EADF1;font-weight:bold;font-family:{3};font-size:12px;">0.00B</span>',
            this.totalUploadedFileSizeLabel, this.leftMargin, 14, this.fontFamily));
        $('#' + this.progressPanel).append(this.utils.stringFormat('<span id="{0}" ' +
            'style="display:inline-block;margin-left:{1}px;margin-top:{2}px;color:#B9B9B9;font-weight:bold;font-family:{3};font-size:12px;">/0.00B</span>',
            this.totalFileSizeLabel, 0, 14, this.fontFamily));
        $('#' + this.progressPanel).append(this.utils.stringFormat('<span id="{0}"  ' +
            'style="display:inline-block;margin-left:{1}px;margin-top:{2}px;color:#B9B9B9;font-weight:bold;font-family:{3};font-size:12px;">(0/sec)</span>',
            this.transferSpeedLabel, 0, 14, this.fontFamily));
        var totalUploadedPercentLeft = (this.width / 2) - ($('#' + this.totalUploadedPercentLabel).width() / 2);
        $('#' + this.progressPanel).append(this.utils.stringFormat('<span id="{0}" ' +
            'style="display:inline-block;margin-left:{1}px;margin-top:{2}px;color:#000000;' +
            'font-weight:bold;text-align:center;position: absolute;left:{3}px;font-family:{4};font-size:20px;">0%</span>',
            this.totalUploadedPercentLabel, 0, this.topMargin, totalUploadedPercentLeft, this.fontFamily));
        $('#' + this.progressPanel).append(this.utils.stringFormat('<span id="{0}" ' +
            'style="display:inline-block;float:right;text-align:right;margin-right:{1}px;margin-top:{2}px;color:#B9B9B9;' +
            'font-weight:bold;font-family:{3};font-size:12px;">초 남음</span>',
            this.remainingTimeUnitLabel, this.rightMargin, 14, this.fontFamily));
        $('#' + this.progressPanel).append(this.utils.stringFormat('<span id="{0}" ' +
            'style="display:inline-block;float:right;text-align:right;margin-right:{1}px;margin-top:{2}px;color:#7EADF1;' +
            'font-weight:bold;font-family:{3};font-size:12px;">0</span>',
            this.remainingTimeLabel, 2, 14));
        var progressBarWidth = this.width - (this.leftMargin + this.rightMargin);
        $('#' + this.progressPanel).append(this.utils.stringFormat('<div><progress id="{0}" max="100" value="0" ' +
            'style="width:{1}px;height:{2}px;margin-left:{3}px;color:#4072CB;background-color:#B5B5B5;border:none;"></progress></div>',
            this.progressBar, progressBarWidth, this.progressBarHeight, this.leftMargin));

        // DataGrid
        var dataGridWidth = progressBarWidth;
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;margin-left:{3}px;background:#FFFFFF;"></div>',
            this.monitorDataGrid, dataGridWidth, this.dataGridHeight, this.leftMargin));

        var gridWidth = this.width - (this.leftMargin + this.rightMargin);
        var fieldWidth = 100;
        var grid;
        var columns = [
            {
                id: "title", name: "파일이름", field: "title", width: gridWidth - (fieldWidth * 2),
                formatter: function (args) {
                    //return "<img src ='" + data[args].src + "'> </img><span>" + data[args].title + "</span>"
                    return "<img src ='" + data[args].src + "' onerror=\"this.src='" + window.namoCrossUploaderConfig.productImagePath + "/app/image/file_icon/etc.png\'\"></img><span> " + data[args].title + "</span>"
                }
            },
            {id: "size", name: "크기", field: "size", width: fieldWidth, cssClass: "slick-grid-filesize"},
            {id: "status", name: "상태", field: "status", width: fieldWidth, cssClass: "slick-grid-transfer-status"}
        ];

        var options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            editable: true,
            enableCellNavigation: true,
            forceFitColumns: true,
            autoEdit: false
        };

        var data = [];
        this.dataGrid = new Slick.Grid("#" + this.monitorDataGrid, data, columns, options);
        this.dataGrid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));
        //$(function () {
        //});

        // Button panel
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;"></div>',
            this.buttonPanel, this.width, this.buttonPanelHeight));
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="checkbox" id="{0}" checked="checked" ' +
            'style="margin-left:{1}px;margin-top:{2}px;"/>',
            this.closeCheckBox, this.leftMargin, 24));
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<span style="display:inline-block;margin-left:{0}px;margin-top:{1}px;' +
            'font-family:{2};font-size:12px;">전송이 완료되면 창을 종료합니다.</span>',
            2, 0, this.fontFamily));
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="닫기"' +
            'style="float:right;text-align:center;margin-right:{1}px;margin-top:{2}px;width:89px;height:30px;font-family:{3};font-size:12px; ' +
            'background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;"/>',
            this.closeButton, this.rightMargin, 15, this.fontFamily));
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="전송"' +
            'style="float:right;text-align:center;margin-right:{1}px;margin-top:{2}px;width:89px;height:30px;font-family:{3};font-size:12px; ' +
            'background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;"/>',
            this.transferButton, this.defaultMargin, 15, this.fontFamily));
    };

    this.createResumeOptionDlg = function () {
        this.roBackgroundPanel = this.utils.getGuid();
        this.roMainPanel = this.utils.getGuid();
        this.roTitlePanel = this.utils.getGuid();
        this.roTitleLabel = this.utils.getGuid();
        this.roFileInfoPanel = this.utils.getGuid();
        this.roExistedUploadInfoLabel_01 = this.utils.getGuid();
        this.roExistedUploadInfoLabel_02 = this.utils.getGuid();
        this.roExistedUploadInfoLabel_03 = this.utils.getGuid();
        this.roPreviewImage = this.utils.getGuid();
        this.roTotalFileSizeTitle = this.utils.getGuid();
        this.roTotalFileSizeValue = this.utils.getGuid();
        this.roTransferedFileSizeTitle = this.utils.getGuid();
        this.roTransferedFileSizeValue = this.utils.getGuid();
        this.roRemainedFileSizeTitle = this.utils.getGuid();
        this.roRemainedFileSizeValue = this.utils.getGuid();
        this.roLastModifiedDateTitle = this.utils.getGuid();
        this.roLastModifiedDateValue = this.utils.getGuid();
        this.roApplyAllFilesCheckBox = this.utils.getGuid();
        this.roApplyAllFilesDesc = this.utils.getGuid();
        this.roResumeUploadButton = this.utils.getGuid();
        this.roReUploadButton = this.utils.getGuid();

        $('body').append(this.utils.stringFormat('<div id="{0}" style="display:none;" class="{1}"></div>', this.roBackgroundPanel, this.resumeOptionBgLayerClass));

        $('body').append(this.utils.stringFormat('<div id="{0}" style="display:none;width:470px;height:272px;background:#FFFFFF;font-family:{1};font-size:12px;" class="{2}">' +
            '<div id="{3}" style="height:33px;background:#4072CB;">' +
            '<span id="{4}" style="display:inline-block;margin-left:16px;margin-top:8px;color:white;">이어 올리기 옵션</span>' +
            '</div>' +
            '<div id="{5}" style="margin-left:16px;margin-top:16px;height:50px;">' +
            '<ul style="list-style-type:none;padding:0px;margin:0px;">' +
            '<li style="float:left;"><div id="{6}" style="height:20px;max-width:250px;font-weight:bold;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">""</div> </li>' +
            '<li style="display:inline-block;"><div id="{7}" style="width:180px;height:20px;">파일이 일부 전송되어 있습니다.</div></li>' +
            '</ul>' +
            '<div id="{8}" style="margin-top:4px;">' +
            '업로드 옵션을 선택해 주십시오.' +
            '</div>' +
            '</div>' +
            '<div style="margin-left:16px;margin-top:10px;">' +
            '<ul style="list-style-type:none;padding:0px;margin:0px;">' +
            '<li style="float:left;">' +
            '<div style="margin-left:16px;display:table-cell; width:85px;height:90px;background:#EFEFEF;text-align:center;vertical-align:middle;">' +
            '<img id="{9}" src="' + window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/etc.png" onerror="this.src=' + window.namoCrossUploaderConfig.productImagePath + '\'../../app/image/file_icon/etc.png\'" style="width:16px;height:16px;" />' +
            '</div>' +
            '</li>' +
            '<li>' +
            '<div>' +
            '<div>' +
            '<div id="{10}" style="display:inline-block;width:100px;height:20px;font-weight:bold;margin-left:15px; margin-top:7px;">전체 크기</div>' +
            '<div id="{11}" style="display:inline-block;color:#0295D8;font-weight:bold;">: 0 B</div>' +
            '</div>' +
            '<div>' +
            '<div id="{12}" style="display:inline-block;width:100px;height:20px;font-weight:bold;margin-left:15px;">전송된 크기</div>' +
            '<div id="{13}" style="display:inline-block;">: 0 B</div>' +
            '</div>' +
            '<div>' +
            '<div id="{14}" style="display:inline-block;width:100px;height:20px;font-weight:bold;margin-left:15px;">남은 크기</div>' +
            '<div id="{15}" style="display:inline-block;color:#0295D8;font-weight:bold;">: 0 B</div>' +
            '</div>' +
            '<div>' +
            '<div id="{16}" style="display:inline-block;width:100px;height:20px;font-weight:bold;margin-left:15px;">마지막 전송 날짜</div>' +
            '<div id="{17}" style="display:inline-block;">: </div>' +
            '</div>' +
            '</div>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '<div style="background:#EEEEEE;height:46px;margin-top:30px;">' +
            '<input id="{18}" type="checkbox" style="float:left;margin-left:16px;margin-top:18px;" />' +
            '<span id="{19}" style="display:inline-block;margin-top:17px;">모든 파일에 적용</span>' +
            '<input id="{20}" type="button" style="float:right;text-align:center;margin-right:8px;margin-top:8px;width:89px;height:30px;background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;" value="이어 올리기" />' +
            '<input id="{21}" type="button" style="float:right;text-align:center;margin-right:4px;margin-top:8px;width:89px;height:30px;background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;" value="다시 올리기" />' +
            '</div>' +
            '</div>',
            this.roMainPanel, this.fontFamily, this.resumeOptionLayerClass, this.roTitlePanel, this.roTitleLabel, this.roFileInfoPanel,
            this.roExistedUploadInfoLabel_01, this.roExistedUploadInfoLabel_02, this.roExistedUploadInfoLabel_03,
            this.roPreviewImage, this.roTotalFileSizeTitle, this.roTotalFileSizeValue, this.roTransferedFileSizeTitle, this.roTransferedFileSizeValue,
            this.roRemainedFileSizeTitle, this.roRemainedFileSizeValue,
            this.roLastModifiedDateTitle, this.roLastModifiedDateValue, this.roApplyAllFilesCheckBox, this.roApplyAllFilesDesc, this.roResumeUploadButton, this.roReUploadButton));
    }

    this.addFiles = function () {
        var manager = parent.fileUploadManager;

        for (var i = 0; i < manager.dataGrid.getData().length; i++) {
            var fileInfo = manager.getFileInfoFromMap(i);

            if (!fileInfo) {
                continue;
            }

            var statusLabel = "";
            if (fileInfo.status == "COMPLETION")
                statusLabel = "완료";
            else if (fileInfo.status == "CANCELLATION")
                statusLabel = "취소";
            else if (fileInfo.status == "FAILURE") {
                statusLabel = "실패";
            } else if (fileInfo.status == "TRANSFERRING")
                statusLabel = this.utils.convertByteUnit(fileInfo.transferedSize);
            else
                statusLabel = "대기";

            var fileIconUrl = '';
            if (fileInfo.fileType == 'FOLDER')
                fileIconUrl = window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/folder.png';
            else
                fileIconUrl = window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/' + this.utils.getFileExtension(fileInfo.fileName) + '.png';

            //업로드 파일만 처리
            if (manager.downloadUrl && statusLabel != "대기") {
                continue;
            }

            var datas = this.dataGrid.getData();
            datas.splice(datas.length, 0, {
                'src': fileIconUrl,
                "title": fileInfo.fileName,
                "size": this.utils.convertByteUnit(fileInfo.fileSize),
                "status": statusLabel
            });
            this.dataGrid.invalidateRow(datas.length);
            this.dataGrid.updateRowCount();
            this.dataGrid.render();
            this.dataGrid.scrollRowIntoView(datas.length - 1)
        }
    };

    this.openResumeOptionDlg = function (fileInfo) {
        $('#' + this.roExistedUploadInfoLabel_01).text(fileInfo.fileName);
        $('#' + this.roPreviewImage).attr('src', window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/' + this.utils.getFileExtension(fileInfo.fileName) + '.png');
        $('#' + this.roTotalFileSizeValue).text(this.utils.convertByteUnit(fileInfo.fileSize));
        $('#' + this.roTransferedFileSizeValue).text(this.utils.convertByteUnit(fileInfo.tempFileSize));
        $('#' + this.roRemainedFileSizeValue).text(this.utils.convertByteUnit(fileInfo.fileSize - fileInfo.tempFileSize));
        $('#' + this.roLastModifiedDateValue).text(fileInfo.tempFileUpdatedDate);

        $('#' + this.roBackgroundPanel).css('display', 'block');
        $('#' + this.roMainPanel).css('display', 'block');
    };

    this.closeResumeOptionDlg = function () {
        $('#' + this.roBackgroundPanel).css('display', 'none');
        $('#' + this.roMainPanel).css('display', 'none');
    };

    this.open = function () {
        $('#' + this.backgroundPanel).css('display', 'block');
        $('#' + this.mainPanel).css('display', 'block');
    };

    this.close = function () {
        $('#' + this.backgroundPanel).css('display', 'none');
        $('#' + this.mainPanel).css('display', 'none');
    };

    this.deleteAllGridFiles = function () {
        var grid = this.dataGrid;
        var dataList = grid.getData();

        while (dataList.length > 0) {
            var currentRow = dataList.length - 1;
            dataList.splice(currentRow, 1);
            var r = currentRow;
            while (r < dataList.length) {
                grid.invalidateRow(r);
                r++;
            }
            grid.updateRowCount();
            grid.render();
            grid.scrollRowIntoView(currentRow - 1)
        }
    };

    this.clear = function () {
        // Title
        $('#' + this.titleLabel).text('파일 업로드');

        // Grid
        this.deleteAllGridFiles();

        // Total uploaded file size
        $('#' + this.totalUploadedFileSizeLabel).text('0.00B');
        $('#' + this.totalFileSizeLabel).text('/0.00B');

        // Upload speed
        $('#' + this.transferSpeedLabel).text('(0.00B/sec)');

        // Remaining time
        $('#' + this.remainingTimeLabel).text('0');

        // Percent
        $('#' + this.totalUploadedPercentLabel).text('0%');

        // 프로그래스바
        $('#' + this.progressBar).val(0);
    }

    this.setEventHandler = function () {
        $('#' + this.closeButton).bind("click", this.onClickCloseButton);
        $('#' + this.transferButton).bind("click", this.onClickTransferButton);

        // resume
        $('#' + this.roResumeUploadButton).bind("click", this.onClickResumeUploadFileButton);
        $('#' + this.roReUploadButton).bind("click", this.onClickReUploadFileButton);

    };

    this.onClickTransferButton = function () {
        var manager = parent.fileUploadManager;
        var monitor = self;

        var uploadStatus = manager.uploadStatus;

        if (uploadStatus == 'WAIT') {
            manager.startTime = new Date().getTime();
            manager.progressTimer = setInterval(manager.startProgressTimer, 500);

            manager.totalUploadedFileSize = 0;
            manager.setUploadStatus('TRANSFERRING');
            monitor.resetButtonStatus();
            manager.dispatchEvent(manager.onStartUpload);

            //manager.sendFormData();

            if (manager.uploadMode == "BASIC")
                setTimeout(manager.sendFormData(), 0);
            else
                setTimeout(manager.sendLargeFormData(), 0);
        } else if (uploadStatus == 'TRANSFERRING') {
            var fileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);
            if (fileInfo.fileType == 'FOLDER')
                manager.childFileInfoList[manager.currentUploadItemIndexForFolder].xmlHttpRequest.abort();
            else
                fileInfo.xmlHttpRequest.abort();

            clearInterval(manager.progressTimer);

            /*
            manager.updateProgressStatus('WAIT');
            manager.setUploadStatus('WAIT');
            monitor.resetButtonStatus();
            manager.dispatchEvent(manager.onCancelUploadItem, manager.currentUploadItemIndex);
            */
        }
    };

    ////
    // private 
    this.onClickResumeUploadFileButton = function () {
        self.closeResumeOptionDlg();

        var manager = parent.fileUploadManager;
        manager.setSelectedResumeMode("ADD");

        var fileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);

        if (fileInfo.fileType == 'FOLDER')
            manager.sendPartialFileForFolder(fileInfo, true);
        else
            manager.sendPartialFile(true);
    };

    this.onClickReUploadFileButton = function () {
        self.closeResumeOptionDlg();

        var manager = parent.fileUploadManager;
        manager.setSelectedResumeMode("NEW");

        var fileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);

        if (fileInfo.fileType == 'FOLDER')
            manager.sendPartialFileForFolder(fileInfo, false);
        else
            manager.sendPartialFile(false);

        //manager.sendPartialFile(false);
    };

    this.resetButtonStatus = function () {
        var uploadStatus = parent.fileUploadManager.uploadStatus;

        if (uploadStatus == 'WAIT') {
            $('#' + this.transferButton).prop('value', '전송');
            $('#' + this.closeButton).prop('value', '닫기');

            $('#' + this.transferButton).prop('disabled', false);
            $('#' + this.closeButton).prop('disabled', false);
        } else if (uploadStatus == 'TRANSFERRING') {
            $('#' + this.transferButton).prop('value', '취소');
            $('#' + this.closeButton).prop('value', '닫기');

            $('#' + this.transferButton).prop('disabled', false);
            $('#' + this.closeButton).prop('disabled', true);
        } else { // COMPLETION, FAILURE, CANCELLATION
            $('#' + this.transferButton).prop('value', '전송');
            $('#' + this.closeButton).prop('value', '닫기');

            $('#' + this.transferButton).prop('disabled', true);
            $('#' + this.closeButton).prop('disabled', false);
        }
    };

    this.getCloseMonitorCheckBoxStatus = function () {
        return $('#' + this.closeCheckBox).prop('checked');
    };

    this.setCloseMonitorCheckBoxStatus = function (checked) {
        $('#' + this.closeCheckBox).prop('checked', checked);
    };

    this.onClickCloseButton = function () {
        var manager = parent.fileUploadManager;

        var fileInfo = manager.getFileInfoFromMap(manager.currentUploadItemIndex);

        if (fileInfo.fileType == 'FOLDER')
            manager.childFileInfoList[manager.currentUploadItemIndexForFolder].xmlHttpRequest.abort();
        else
            fileInfo.xmlHttpRequest.abort();

        clearInterval(manager.progressTimer);
        manager.updateProgressStatus('WAIT');
        manager.setUploadStatus('WAIT');
        self.resetButtonStatus();

        self.close();
        manager.dispatchEvent(parent.fileUploadManager.onCloseMonitorWindow);
    };

    this.getApplyAllFilesCheckBoxStatus = function () {
        return $('#' + this.roApplyAllFilesCheckBox).prop('checked');
    };

    this.getFileInfoFromMap = function (gridRowIndex) {
        var id = this.dataGrid.getDataItem(gridRowIndex)["id"];
        return this.fileInfoMap.get(id);
    }

    this.deleteFileInfoFromMap = function (gridRowIndex) {
        var id = this.dataGrid.getDataItem(gridRowIndex)["id"];
        this.fileInfoMap.delete(id);
    }
};

var __MultipleFileDownloadManager = function () {
    var self = this;
    this.utils = new __NamoCrossUploaderUtils();
    this.global = new __Global();
    this.containerId = "";

    this.mainPanel = this.utils.getGuid();

    this.downloadLink = this.utils.getGuid();
    this.topDummyPanel = this.utils.getGuid();
    this.managerDataGrid = this.utils.getGuid();

    this.statusPanel = this.utils.getGuid();
    this.statusLabel = this.utils.getGuid();

    this.buttonPanel = this.utils.getGuid();
    this.selectAllButton = this.utils.getGuid();
    this.downloadButton = this.utils.getGuid();
    this.downloadButtonOnStatus = this.utils.getGuid();
    this.downloadAllButtonOnStatus = this.utils.getGuid();

    this.width = 0;
    this.height = 0;
    this.buttonPanelHeight = 40;
    this.buttonWidth = 92;
    this.buttonHeight = 30;
    this.topDummyPanelHeight = 10;
    this.statusPanelHeight = 28;
    this.statusHeight = 20;
    this.downloadButtonHeightOnStatus = 20;
    this.downloadButtonWidthOnStatus = 60;
    this.statusLabelHeight = 20;

    this.defaultMargin = 4;
    this.leftMargin = 10;
    this.rightMargin = 10;
    this.topMargin = 5;

    this.fileInfoMap = new Map();
    this.totalFileSize = 0;

    this.dataGrid;

    this.fontFamily = "Malgun Gothic";
    this.downloadUrl = '';

    this.isAsc = true;
    this.currentSortCol = "";

    this.create = function (properties) {

        this.setProperties(properties);
        //this.createControls();
        this.setEventHandler();
        //this.setLastExceptionInfo('');
    };

    this.setProperties = function (properties) {
        /*
        var obj = jQuery.parseJSON(properties);

        if (obj.width.lastIndexOf("%") != -1)
            this.width = Math.round(this.utils.getPxFromPercent(obj.containerId, "WIDTH") / 100 * this.utils.getDigitString(obj.width));
        else
            this.width = this.utils.getDigitString(obj.width);

        if (obj.height.lastIndexOf("%") != -1)
            this.height = Math.round(this.utils.getPxFromPercent(obj.containerId, "HEIGHT") / 100 * this.utils.getDigitString(obj.height));
        else
            this.height = this.utils.getDigitString(obj.height);
        this.containerId = obj.containerId;
        this.downloadUrl = obj.downloadUrl;
        */

        if (properties == undefined)
            return;

        var obj = jQuery.parseJSON(properties);

        this.containerId = obj.containerId;

        this.createControls();

        this.resetProperties(properties);
    };

    this.resetProperties = function (properties) {
        if (properties == undefined)
            return;

        var obj = jQuery.parseJSON(properties);

        var data = this.dataGrid.getColumns();
        data[1].sortable = obj.sortable == undefined ? false : obj.sortable;
        data[2].sortable = obj.sortable == undefined ? false : obj.sortable;
        this.dataGrid.setColumns(data);

        this.downloadUrl = obj.downloadUrl;

        if (obj.width != undefined) {
            if (obj.width.lastIndexOf("%") != -1)
                this.width = Math.round(this.utils.getPxFromPercent(this.containerId, "WIDTH") / 100 * this.utils.getDigitString(obj.width));
            else
                this.width = this.utils.getDigitString(obj.width);
            $('#' + this.mainPanel).css('width', this.width + 'px');
        }
        if (obj.height != undefined) {
            if (obj.height.lastIndexOf("%") != -1)
                this.height = Math.round(this.utils.getPxFromPercent(this.containerId, "HEIGHT") / 100 * this.utils.getDigitString(obj.height));
            else
                this.height = this.utils.getDigitString(obj.height);
            $('#' + this.mainPanel).css('height', this.height + 'px');
        }
        if (obj.borderColor != undefined) {
            $('#' + this.mainPanel).css('border-color', obj.borderColor);
        }
        if (obj.bottomPanelDisplayStyle != undefined) {
            $('#' + this.buttonPanel).css('display', obj.bottomPanelDisplayStyle);
        }

        if (obj.downloadButtonDisplayStyle != undefined)
            obj.downloadButtonDisplayStyle == 'block' ? $('#' + this.downloadButton).show() : $('#' + this.downloadButton).hide();
        if (obj.downloadButtonDisabledStyle != undefined)
            $('#' + this.downloadButton).prop('disabled', obj.downloadButtonDisabledStyle);

        if (obj.downloadButtonDisplayStyle != undefined && obj.downloadButtonDisplayStyle == 'none')
            $('#' + this.buttonPanel).css('display', 'none');

        if (obj.downloadButtonDisplayStyleOnStatus != undefined)
            obj.downloadButtonDisplayStyleOnStatus == 'block' ? $('#' + this.downloadButtonOnStatus).show() : $('#' + this.downloadButtonOnStatus).hide();

        if (obj.downloadAllButtonDisplayStyleOnStatus != undefined)
            obj.downloadAllButtonDisplayStyleOnStatus == 'block' ? $('#' + this.downloadAllButtonOnStatus).show() : $('#' + this.downloadAllButtonOnStatus).hide();


        // 크기, 위치 변경
        $('#' + this.buttonPanel).css('width', this.width + 'px');

        var dataGridWidth = this.width - (this.leftMargin + this.rightMargin);
        var dataGridHeight = 0;
        if ($('#' + this.buttonPanel).css('display') == 'block') {
            dataGridHeight = this.height - (this.topDummyPanelHeight + this.statusPanelHeight + this.buttonPanelHeight);
        }
        if ($('#' + this.buttonPanel).css('display') == 'none') {
            dataGridHeight = this.height - (this.topDummyPanelHeight + this.statusPanelHeight + (this.topMargin * 2));
        }
        $('#' + this.managerDataGrid).css('width', dataGridWidth + 'px');
        $('#' + this.managerDataGrid).css('height', dataGridHeight + 'px');
        self.dataGrid.width = dataGridWidth;
        self.dataGrid.height = dataGridHeight;
        var columns = self.dataGrid.getColumns();
        columns[1].width = dataGridWidth - 100;
        columns[2].width = 100;
        self.dataGrid.setColumns(columns);

        $('#' + this.statusPanel).css('width', dataGridWidth + 'px');
    };

    this.createControls = function () {
        // Main panel
        $('#' + this.containerId).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;background:#EEEEEE;border:solid 1px #EEEEEE;"></div>',
            this.mainPanel, this.width, this.height));

        // Download a tag
        $('#' + this.mainPanel).append(this.utils.stringFormat('<a id="{0}" href="#" download="#" style="display:none;"></a>', this.downloadLink));

        // Top dummy panel
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;"></div>',
            this.topDummyPanel, this.width, this.topDummyPanelHeight, 0, 0));

        // DataGrid
        var dataGridWidth = this.width - (this.leftMargin + this.rightMargin);
        var dataGridHeight = this.height - (this.topDummyPanelHeight + this.statusPanelHeight + this.buttonPanelHeight);
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;background:#FFFFFF;"></div>',
            this.managerDataGrid, dataGridWidth, dataGridHeight, this.leftMargin, 0));

        var gridWidth = this.width - (this.leftMargin + this.rightMargin);
        var fieldWidth = 100;
        var grid;

        var checkboxSelector = new Slick.CheckboxSelectColumn({
            cssClass: "slick-cell-checkboxsel",
            toolTip: "전체선택/전체해제"
        });

        var columns = [];
        columns.push(checkboxSelector.getColumnDefinition());
        columns.push({
            id: "title", name: "파일이름", field: "title", width: gridWidth - fieldWidth, sortable: false, sorter: this.numericSorter,
            formatter: function (args) {
                //return "<img src ='" + data[args].src + "'> </img><span>" + data[args].title + "</span>"
                return "<img src ='" + data[args].src + "' onerror=\"this.src='" + window.namoCrossUploaderConfig.productImagePath + "/app/image/file_icon/etc.png\'\"></img><span> " + data[args].title + "</span>"
            }
        });
        columns.push({id: "size", name: "크기", field: "size", width: fieldWidth, cssClass: "slick-grid-filesize", sortable: false, sorter: this.sizeSorter});

        var options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            editable: true,
            enableCellNavigation: true,
            forceFitColumns: true,
            autoEdit: false
        };

        var data = [];
        //self.dataGrid = new Slick.Grid("#" + self.managerDataGrid, data, columns, options);

        var dataView = new Slick.Data.DataView();
        dataView.setItems(data);
        self.dataGrid = new Slick.Grid("#" + self.managerDataGrid, dataView.getItems(), columns, options);

        self.dataGrid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));
        self.dataGrid.registerPlugin(checkboxSelector);
        self.dataGrid.onSort.subscribe(function (e, args) {
            self.dataGrid.setSelectedRows([]);
            self.dataGrid.resetActiveCell();

            self.currentSortCol = args.sortCol.field;
            self.isAsc = args.sortAsc ? 1 : -1;

            dataView.sort(args.sortCol.sorter, self.isAsc);
            args.grid.invalidateAllRows();
            args.grid.render();
        });

        //var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);
        //$(function () {
        //});

        // Status panel
        var statusPanelWidth = dataGridWidth;
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;background-color:#737373;margin-left:{3}px;"></div>',
            this.statusPanel, statusPanelWidth, this.statusPanelHeight, this.leftMargin));

        $('#' + this.statusPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="다운로드" ' +
            'style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px; ' +
            'background:none;border:none;color:white;button:focus {outline:none;};display:none;"/>',
            this.downloadButtonOnStatus, this.downloadButtonWidthOnStatus, this.downloadButtonHeightOnStatus, 0, this.defaultMargin, this.fontFamily));

        $('#' + this.statusPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="전체 다운로드" ' +
            'style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px; ' +
            'background:none;border:none;color:white;button:focus {outline:none;};display:none;"/>',
            this.downloadAllButtonOnStatus, this.downloadButtonWidthOnStatus + 25, this.downloadButtonHeightOnStatus, 0, this.defaultMargin, this.fontFamily));


        $('#' + this.statusPanel).append(this.utils.stringFormat('<span id="{0}" ' +
            'style="height:{1}px;float:right;text-align:right;margin-right:{2}px;margin-top:{3}px;font-family:{5};font-size:12px;color:white;">0개의 파일 : 0.00B</span>',
            this.statusLabel, this.statusLabelHeight, this.rightMargin, 6, this.fontFamily));

        $('#' + this.downloadButtonOnStatus).on("mouseover", function () {
            $(this).css("color", "#E0E0E0");
            $(this).css("outline", "none");
        }).on("mouseout", function () {
            $(this).css("color", "white");
        });

        $('#' + this.downloadAllButtonOnStatus).on("mouseover", function () {
            $(this).css("color", "#E0E0E0");
            $(this).css("outline", "none");
        }).on("mouseout", function () {
            $(this).css("color", "white");
        });


        // Button panel
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;"></div>',
            this.buttonPanel, this.width, this.buttonPanelHeight));
        /*
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="전체 선택" ' +
            'style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;font-family:{5};font-size:12px; ' + 
            'background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;"/>', 
            this.selectAllButton, this.buttonWidth, this.buttonHeight, this.leftMargin, 5, this.fontFamily));
            */
        $('#' + this.buttonPanel).append(this.utils.stringFormat('<input type="button" id="{0}" value="다운로드" ' +
            'style="width:{1}px;height:{2}px;float:right;margin-right:{3}px;margin-top:{4}px; ' +
            'font-family:{5};font-size:12px;background:#FFFFFF;border-style:solid;border-width:1px;border-color:#4072CB;"/>',
            this.downloadButton, this.buttonWidth, this.buttonHeight, this.rightMargin, 5, this.fontFamily));

        $.contextMenu({
            selector: '#' + this.mainPanel,
            callback: function (key, options) {
                if (key == "selectAll")
                    self.selectAll();
                else if (key == "downloadSelectedFiles")
                    self.startDownload();
                else if (key == "downloadAllFiles")
                    self.startDownloadAll();

            },
            items: {
                "selectAll": {name: "전체선택"},
                "downloadSelectedFiles": {name: "선택파일 다운로드"},
                "downloadAllFiles": {name: "전체파일 다운로드"},
            }
        });
    };


    this.setEventHandler = function () {
        //$('#' + this.selectAllButton).bind("click", this.onClickSelectAllButton);
        $('#' + this.downloadButton).bind("click", this.onClickDownloadButton);
        $('#' + this.downloadButtonOnStatus).bind("click", this.onClickDownloadButtonOnStatus);
        $('#' + this.downloadAllButtonOnStatus).bind("click", this.onClickDownloadAllButtonOnStatus);
    };

    this.selectAll = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var itemArray = [];
        for (var i = 0; i < dataList.length; i++)
            itemArray.push(i);

        grid.setSelectedRows(itemArray);
    }
    /*
    this.onClickSelectAllButton = function () {

    };
    */
    this.startDownload = function () {
        var fileInfoMap = self.fileInfoMap;
        var downloadLink = self.downloadLink;
        var utils = self.utils;
        var dataGrid = self.dataGrid;

        var selectedRows = dataGrid.getSelectedRows();
        if (selectedRows.length == 0)
            return;

        var formData = '';
        var index = 0;
        for (var i = 0; i < selectedRows.length; i++) {
            index = selectedRows[i];
            var fileInfo = self.getFileInfoFromMap(index);

            var obj = new Object();
            obj.fileId = fileInfo.fileId;
            obj.fileName = fileInfo.fileName;
            obj.fileSize = fileInfo.fileSize;
            obj.fileUrl = fileInfo.fileUrl;

            formData += (JSON.stringify(obj) + ',');
        }
        if (formData.length > 0) {
            formData = '[' + formData.substring(0, formData.length - 1) + ']';
        }

        var href = utils.stringFormat('{0}?CD_DOWNLOAD_FILE_INFO={1}', self.downloadUrl, formData);
        $('#' + downloadLink).prop('href', encodeURI(href));
        if (selectedRows.length > 1)
            $('#' + downloadLink).prop('download', 'zipFileDownload');
        else
            $('#' + downloadLink).prop('download', fileInfo.fileName);
        $('#' + downloadLink)[0].click();
    };

    this.startDownloadAll = function () {
        self.selectAll();
        self.startDownload();
    };

    this.onClickDownloadButton = function () {
        self.startDownload();
    };

    this.onClickDownloadButtonOnStatus = function () {
        self.startDownload();
    };

    this.onClickDownloadAllButtonOnStatus = function () {
        self.startDownloadAll();
    };


    this.addFile = function (fileInfo) {
        var obj = jQuery.parseJSON(fileInfo);
        var fileId = obj.fileId;
        var fileName = obj.fileName;
        var fileSize = obj.fileSize;
        var fileUrl = obj.fileUrl;

        var fileInfo = new __DownloadFileInfo();
        fileInfo.id = this.utils.getGuid();
        fileInfo.fileId = obj.fileId;
        fileInfo.fileDirPath = '';
        fileInfo.fileName = obj.fileName;
        fileInfo.fileSize = parseInt(obj.fileSize);
        fileInfo.fileUrl = obj.fileUrl;

        this.fileInfoMap.set(fileInfo.id, fileInfo);

        var dataGrid = this.dataGrid;
        var datas = dataGrid.getData();
        datas.splice(datas.length, 0, {
            'src': window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/' + this.utils.getFileExtension(fileInfo.fileName) + '.png',
            'title': fileName,
            'size': this.utils.convertByteUnit(fileSize),
            'realSize': fileSize,
            'id': fileInfo.id
        });
        dataGrid.invalidateRow(datas.length);
        dataGrid.updateRowCount();
        dataGrid.render();
        dataGrid.scrollRowIntoView(datas.length - 1)

        this.totalFileSize += fileInfo.fileSize;

        this.updateStatus();
    }

    this.deleteFiles = function (currentRow) {
        var fileInfo = this.getFileInfoFromMap(currentRow);

        this.totalFileSize -= fileInfo.fileSize;
        this.deleteFileInfoFromMap(currentRow);
        this.updateStatus();
    };

    this.deleteAllFiles = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        //var rowsToDelete = grid.getSelectedRows().sort().reverse();

        while (0 < dataList.length) {
            self.deleteFiles(0);
            dataList.splice(0, 1);

            grid.scrollRowIntoView(0 - 1)
        }

        grid.invalidate();
        grid.setSelectedRows([]);
        grid.resetActiveCell();
    }

    this.updateStatus = function () {
        var status = this.utils.stringFormat('{0}개의 파일 : {1}',
            this.fileInfoMap.size,
            this.utils.convertByteUnit(this.totalFileSize));
        $('#' + this.statusLabel).text(status);
    }

    this.getTotalFileCount = function () {
        return this.dataGrid.getData().length;
    }

    this.getFileInfoAt = function (rowIndex) {
        if (this.fileInfoMap.size < (rowIndex + 1))
            return '{}';

        return this.getFileInfoToJson(this.getFileInfoFromMap(rowIndex));
    }

    this.getFileInfoToJson = function (fileInfo) {
        var keys = new Array('fileId', 'fileName', 'fileSize', 'fileUrl');
        var values = new Array(fileInfo.fileId, fileInfo.fileName, fileInfo.fileSize, fileInfo.fileUrl);
        return this.utils.getJsonString(keys, values);
    }

    this.scrollRow = function (row) {
        var isNumberType = (typeof row === 'number');

        if (isNumberType == false) {
            row = this.utils.getDigitString(row);
            if (row == "")
                row = 0;
        }

        var grid = self.dataGrid;
        if (grid.length - 1 > row)
            row = grid.length - 1;
        else if (row < 0)
            row = 0;

        grid.scrollRowIntoView(row);
    }

    this.getFileInfoFromMap = function (gridRowIndex) {
        var id = this.dataGrid.getDataItem(gridRowIndex)["id"];
        return this.fileInfoMap.get(id);
    }

    this.deleteFileInfoFromMap = function (gridRowIndex) {
        var id = this.dataGrid.getDataItem(gridRowIndex)["id"];
        this.fileInfoMap.delete(id);
    }

    this.numericSorter = function (a, b) {
        var x = a[self.currentSortCol], y = b[self.currentSortCol];
        return self.isAsc * (x == y ? 0 : (x > y ? 1 : -1));
    };

    this.sizeSorter = function (a, b) {
        var x = a["realSize"], y = b["realSize"];
        return self.isAsc * (x == y ? 0 : (x > y ? 1 : -1));
    };

    /*
    this.ratingSorter = function(a, b)
    {
        var xrow = a[self.currentSortCol], yrow = b[self.currentSortCol];
        console.log(xrow);
        var x = xrow[3], y = yrow[3];
        console.log(x);
        return self.isAsc * (x == y ? 0 : (x > y ? 1 : -1));
    }
    */

    this.moveFirstLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == 0)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(0, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [0];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(0);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };

    this.movePrevLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == 0)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(index - 1, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [index - 1];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(index - 1);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };

    this.moveNextLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == dataList.length - 1)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(index + 1, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [index + 1];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(index + 1);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };

    this.moveLastLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == dataList.length - 1)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(dataList.length, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [dataList.length - 1];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(dataList.length - 1);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };
};

var __SingleFileDownloadManager = function () {
    var self = this;
    this.utils = new __NamoCrossUploaderUtils();
    this.global = new __Global();
    this.containerId = "";

    this.mainPanel = this.utils.getGuid();

    this.downloadLink = this.utils.getGuid();
    this.topDummyPanel = this.utils.getGuid();
    this.managerDataGrid = this.utils.getGuid();

    this.statusPanel = this.utils.getGuid();
    this.statusLabel = this.utils.getGuid();

    this.buttonPanel = this.utils.getGuid();
    this.selectAllButton = this.utils.getGuid();
    this.downloadButton = this.utils.getGuid();

    this.width = 0;
    this.height = 0;
    //this.buttonWidth = 92;
    //this.buttonHeight = 30;
    this.topDummyPanelHeight = 10;
    this.statusPanelHeight = 28;
    this.statusHeight = 20;
    this.statusLabelHeight = 20;

    this.defaultMargin = 4;
    this.leftMargin = 10;
    this.rightMargin = 10;
    this.topMargin = 5;

    this.fileInfoMap = new Map();
    this.totalFileSize = 0;

    this.dataGrid;

    this.fontFamily = "Malgun Gothic";
    this.downloadUrl = '';

    this.isAsc = true;
    this.currentSortCol = "";

    this.create = function (properties) {

        this.setProperties(properties);
        //this.createControls();
        this.setEventHandler();
        //this.setLastExceptionInfo('');
    };

    this.setProperties = function (properties) {
        /*
        var obj = jQuery.parseJSON(properties);

        if (obj.width.lastIndexOf("%") != -1)
            this.width = Math.round(this.utils.getPxFromPercent(obj.containerId, "WIDTH") / 100 * this.utils.getDigitString(obj.width));
        else
            this.width = this.utils.getDigitString(obj.width);

        if (obj.height.lastIndexOf("%") != -1)
            this.height = Math.round(this.utils.getPxFromPercent(obj.containerId, "HEIGHT") / 100 * this.utils.getDigitString(obj.height));
        else
            this.height = this.utils.getDigitString(obj.height);
        this.containerId = obj.containerId;
        this.downloadUrl = obj.downloadUrl;
        */

        if (properties == undefined)
            return;

        var obj = jQuery.parseJSON(properties);

        this.containerId = obj.containerId;

        this.createControls();

        this.resetProperties(properties);
    };


    this.resetProperties = function (properties) {
        if (properties == undefined)
            return;

        var obj = jQuery.parseJSON(properties);

        // sort
        var data = this.dataGrid.getColumns();
        data[0].sortable = obj.sortable == undefined ? false : obj.sortable;
        data[1].sortable = obj.sortable == undefined ? false : obj.sortable;
        this.dataGrid.setColumns(data);

        this.downloadUrl = obj.downloadUrl;

        if (obj.width != undefined) {
            if (obj.width.lastIndexOf("%") != -1)
                this.width = Math.round(this.utils.getPxFromPercent(this.containerId, "WIDTH") / 100 * this.utils.getDigitString(obj.width));
            else
                this.width = this.utils.getDigitString(obj.width);
            $('#' + this.mainPanel).css('width', this.width + 'px');
        }
        if (obj.height != undefined) {
            if (obj.height.lastIndexOf("%") != -1)
                this.height = Math.round(this.utils.getPxFromPercent(this.containerId, "HEIGHT") / 100 * this.utils.getDigitString(obj.height));
            else
                this.height = this.utils.getDigitString(obj.height);
            $('#' + this.mainPanel).css('height', this.height + 'px');
        }
        if (obj.borderColor != undefined) {
            $('#' + this.mainPanel).css('border-color', obj.borderColor);
        }

        // 크기, 위치 변경
        var dataGridWidth = this.width - (this.leftMargin + this.rightMargin);
        var dataGridHeight = this.height - (this.topDummyPanelHeight + this.statusPanelHeight + (this.topMargin * 2));
        $('#' + this.managerDataGrid).css('width', dataGridWidth + 'px');
        $('#' + this.managerDataGrid).css('height', dataGridHeight + 'px');
        self.dataGrid.width = dataGridWidth;
        self.dataGrid.height = dataGridHeight;
        var columns = self.dataGrid.getColumns();
        columns[0].width = dataGridWidth - 200;
        columns[1].width = 100;
        columns[2].width = 100;
        self.dataGrid.setColumns(columns);

        $('#' + this.statusPanel).css('width', dataGridWidth + 'px');
    };

    this.createControls = function () {
        // Main panel
        $('#' + this.containerId).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;background:#EEEEEE;border:solid 1px #EEEEEE;"></div>',
            this.mainPanel, this.width, this.height));

        // Download a tag
        $('#' + this.mainPanel).append(this.utils.stringFormat('<a id="{0}" href="#" download="#" style="display:none;"></a>', this.downloadLink));

        // Top dummy panel
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;"></div>',
            this.topDummyPanel, this.width, this.topDummyPanelHeight, 0, 0));

        // DataGrid
        var dataGridWidth = this.width - (this.leftMargin + this.rightMargin);
        var dataGridHeight = this.height - (this.topDummyPanelHeight + this.statusPanelHeight + (this.topMargin * 2));
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;margin-left:{3}px;margin-top:{4}px;background:#FFFFFF;"></div>',
            this.managerDataGrid, dataGridWidth, dataGridHeight, this.leftMargin, 0));

        var gridWidth = this.width - (this.leftMargin + this.rightMargin);
        var fieldWidth = 100;
        var grid;

        var columns = [];
        columns.push({
            id: "title", name: "파일이름", field: "title", width: gridWidth - (fieldWidth * 2), sortable: false, sorter: this.numericSorter,
            formatter: function (args) {
                //return "<img src ='" + data[args].src + "'> </img><span>" + data[args].title + "</span>"
                return "<img src ='" + data[args].src + "' onerror=\"this.src='" + window.namoCrossUploaderConfig.productImagePath + "/app/image/file_icon/etc.png\'\"></img><span> " + data[args].title + "</span>"
            }
        });
        columns.push({id: "size", name: "크기", field: "size", width: fieldWidth, cssClass: "slick-grid-filesize", sortable: false, sorter: this.utils.sizeSorter});
        columns.push({id: "downloadButton", name: "다운로드", field: "downloadButton", width: fieldWidth, formatter: Slick.Formatters.Link, cssClass: "slick-grid-download-button"});

        var options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            editable: true,
            enableCellNavigation: true,
            forceFitColumns: true,
            autoEdit: false
        };

        var data = [];
        //self.dataGrid = new Slick.Grid("#" + self.managerDataGrid, data, columns, options);

        var dataView = new Slick.Data.DataView();
        dataView.setItems(data);
        self.dataGrid = new Slick.Grid("#" + self.managerDataGrid, dataView.getItems(), columns, options);

        self.dataGrid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: true}));
        self.dataGrid.onSort.subscribe(function (e, args) {
            self.dataGrid.setSelectedRows([]);
            self.dataGrid.resetActiveCell();

            self.currentSortCol = args.sortCol.field;
            self.isAsc = args.sortAsc ? 1 : -1;

            dataView.sort(args.sortCol.sorter, self.isAsc);
            args.grid.invalidateAllRows();
            args.grid.render();
        });

        //var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);
        //$(function () {
        //});

        // Status panel
        var statusPanelWidth = dataGridWidth;
        $('#' + this.mainPanel).append(this.utils.stringFormat('<div id="{0}" style="width:{1}px;height:{2}px;background-color:#737373;margin-left:{3}px;"></div>',
            this.statusPanel, statusPanelWidth, this.statusPanelHeight, this.leftMargin));
        $('#' + this.statusPanel).append(this.utils.stringFormat('<span id="{0}" ' +
            'style="height:{1}px;float:right;text-align:right;margin-right:{2}px;margin-top:{3}px;font-family:{5};font-size:12px;color:white;">0개의 파일 : 0.00B</span>',
            this.statusLabel, this.statusLabelHeight, this.rightMargin, 6, this.fontFamily));


        /*
        $.contextMenu({
            selector: '#' + this.mainPanel,
            callback: function (key, options)
            {
                if (key == "downloadSelectedFiles")
                    self.downloadSelectedFiles();
            },
            items: {
                "downloadSelectedFiles": { name: "다운로드" }
            }
        });
        */
    };

    this.setEventHandler = function () {
        //$('#' + this.selectAllButton).bind("click", this.onClickSelectAllButton);
        //$('#' + this.downloadButton).bind("click", this.onClickDownloadButton);
    };

    /*
    this.onClickSelectAllButton = function () {

    };
    */

    /*
    this.downloadSelectedFiles = function ()
    {
        var grid = self.dataGrid;
        //var dataList = grid.getData();
        var rowsToDelete = grid.getSelectedRows().sort().reverse();

        for (var i = 0; i < rowsToDelete.length; i++)
        {
            this.onClickDownloadButton("", rowsToDelete[i])
        }
    };
    */

    this.onClickDownloadButton = function (id, rowId) {
        var fileInfoMap = self.fileInfoMap;
        var downloadLink = self.downloadLink;
        var utils = self.utils;
        var dataGrid = self.dataGrid;

        if (rowId < 0 || rowId >= dataGrid.length)
            return;

        var fileInfo = self.getFileInfoFromMap(rowId);

        var obj = new Object();
        obj.fileId = fileInfo.fileId;
        obj.fileName = fileInfo.fileName;
        obj.fileSize = fileInfo.fileSize;
        obj.fileUrl = fileInfo.fileUrl;

        var formData = JSON.stringify(obj);

        var href = utils.stringFormat('{0}?CD_DOWNLOAD_FILE_INFO={1}', fileInfo.fileUrl, formData);
        //alert(href);
        $('#' + downloadLink).prop('href', encodeURI(href));
        $('#' + downloadLink).prop('download', fileInfo.fileName);
        $('#' + downloadLink)[0].click();
    };

    this.addFile = function (fileInfo) {
        var obj = jQuery.parseJSON(fileInfo);
        var fileId = obj.fileId;
        var fileName = obj.fileName;
        var fileSize = obj.fileSize;
        var fileUrl = obj.fileUrl;

        var fileInfo = new __DownloadFileInfo();
        fileInfo.id = this.utils.getGuid();
        fileInfo.fileId = obj.fileId;
        fileInfo.fileName = obj.fileName;
        fileInfo.fileSize = parseInt(obj.fileSize);
        fileInfo.fileUrl = obj.fileUrl;

        this.fileInfoMap.set(fileInfo.id, fileInfo);

        var dataGrid = this.dataGrid;
        var datas = dataGrid.getData();
        datas.splice(datas.length, 0, {
            'src': window.namoCrossUploaderConfig.productImagePath + 'app/image/file_icon/' + this.utils.getFileExtension(fileInfo.fileName) + '.png',
            'title': fileName,
            'size': this.utils.convertByteUnit(fileSize),
            'realSize': fileSize,
            'id': fileInfo.id
        });
        dataGrid.invalidateRow(datas.length);
        dataGrid.updateRowCount();
        dataGrid.render();
        dataGrid.scrollRowIntoView(datas.length - 1)

        this.totalFileSize += fileInfo.fileSize;

        this.updateStatus();
    }

    this.deleteFiles = function (currentRow) {
        var fileInfo = this.getFileInfoFromMap(currentRow);

        this.totalFileSize -= fileInfo.fileSize;
        this.deleteFileInfoFromMap(currentRow);
        this.updateStatus();
    };

    this.deleteAllFiles = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        //var rowsToDelete = grid.getSelectedRows().sort().reverse();

        while (0 < dataList.length) {
            self.deleteFiles(0);
            dataList.splice(0, 1);

            grid.scrollRowIntoView(0 - 1)
        }

        grid.invalidate();
        grid.setSelectedRows([]);
        grid.resetActiveCell();
    }

    this.updateStatus = function () {
        var status = this.utils.stringFormat('{0}개의 파일 : {1}',
            this.fileInfoMap.size,
            this.utils.convertByteUnit(this.totalFileSize));
        $('#' + this.statusLabel).text(status);
    }

    this.getTotalFileCount = function () {
        return this.dataGrid.getData().length;
    }

    this.getFileInfoAt = function (rowIndex) {
        if (this.fileInfoMap.size < (rowIndex + 1))
            return '{}';

        return this.getFileInfoToJson(this.getFileInfoFromMap(rowIndex));
    }

    this.getFileInfoToJson = function (fileInfo) {
        var keys = new Array('fileId', 'fileName', 'fileSize', 'fileUrl');
        var values = new Array(fileInfo.fileId, fileInfo.fileName, fileInfo.fileSize, fileInfo.fileUrl);
        return this.utils.getJsonString(keys, values);
    }

    this.scrollRow = function (row) {
        var isNumberType = (typeof row === 'number');

        if (isNumberType == false) {
            row = this.utils.getDigitString(row);
            if (row == "")
                row = 0;
        }

        var grid = self.dataGrid;
        if (grid.length - 1 > row)
            row = grid.length - 1;
        else if (row < 0)
            row = 0;

        grid.scrollRowIntoView(row);
    }

    this.getFileInfoFromMap = function (gridRowIndex) {
        var id = this.dataGrid.getDataItem(gridRowIndex)["id"];
        return this.fileInfoMap.get(id);
    }

    this.deleteFileInfoFromMap = function (gridRowIndex) {
        var id = this.dataGrid.getDataItem(gridRowIndex)["id"];
        this.fileInfoMap.delete(id);
    }

    this.numericSorter = function (a, b) {
        var x = a[self.currentSortCol], y = b[self.currentSortCol];
        return self.isAsc * (x == y ? 0 : (x > y ? 1 : -1));
    };

    this.sizeSorter = function (a, b) {
        var x = a["realSize"], y = b["realSize"];
        return self.isAsc * (x == y ? 0 : (x > y ? 1 : -1));
    };

    /*
    this.ratingSorter = function(a, b)
    {
        var xrow = a[self.currentSortCol], yrow = b[self.currentSortCol];
        console.log(xrow);
        var x = xrow[3], y = yrow[3];
        console.log(x);
        return self.isAsc * (x == y ? 0 : (x > y ? 1 : -1));
    }
    */

    this.moveFirstLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == 0)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(0, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [0];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(0);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };

    this.movePrevLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == 0)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(index - 1, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [index - 1];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(index - 1);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };

    this.moveNextLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == dataList.length - 1)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(index + 1, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [index + 1];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(index + 1);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };

    this.moveLastLocation = function () {
        var grid = self.dataGrid;
        var dataList = grid.getData();
        var selectedRows = grid.getSelectedRows();

        if (selectedRows.length > 0) {
            var index = selectedRows[selectedRows.length - 1];
            if (index == dataList.length - 1)
                return;

            var rowToInsert = dataList.splice(index, 1);
            dataList.splice(dataList.length, 0, rowToInsert[0]);
            grid.setSelectedRows([]);
            grid.resetActiveCell();
            var itemArray = [dataList.length - 1];
            grid.setSelectedRows(itemArray);
            grid.scrollRowIntoView(dataList.length - 1);

            grid.invalidate();
            grid.updateRowCount();
            grid.render();
        }
    };
};
var __NamoCrossUploader = function () {
    this.fileUploadManager = null;
    this.fileUploadMonitor = null;

    this.multipleFileDownloadManager = null;
    this.singleFileDownloadManager = null;

    this.createUploader = function (managerProperties, monitorProperties, eventNames) {
        this.fileUploadManager = new __FileUploadManager(this);
        this.fileUploadMonitor = new __FileUploadMonitor(this);

        this.fileUploadManager.create(managerProperties, eventNames);

        var obj = jQuery.parseJSON(managerProperties);
        this.fileUploadMonitor.create(monitorProperties, obj.uploadMode);

        return this.fileUploadManager;
    };

    this.createDownloader = function (managerProperties) {
        var obj = jQuery.parseJSON(managerProperties);
        if (obj.uiMode == undefined || obj.uiMode == 'MULTIPLE') {
            this.multipleFileDownloadManager = new __MultipleFileDownloadManager();
            this.multipleFileDownloadManager.create(managerProperties);
            return this.multipleFileDownloadManager;
        } else {
            this.singleFileDownloadManager = new __SingleFileDownloadManager();
            this.singleFileDownloadManager.create(managerProperties);
            return this.singleFileDownloadManager;
        }
    };

    this.setUploaderProperties = function (managerProperties, monitorProperties) {
        this.fileUploadManager.resetProperties(managerProperties);
        this.fileUploadMonitor.resetProperties(monitorProperties);
    }

    this.setDownloaderProperties = function (managerProperties) {
        var obj = jQuery.parseJSON(managerProperties);
        if (obj.uiMode == undefined || obj.uiMode == 'MULTIPLE') {
            this.multipleFileDownloadManager.resetProperties(managerProperties);
        } else {
            this.singleFileDownloadManager.resetProperties(managerProperties);
        }
    };
};


// NamoCrossUploader 전역 객체
var namoCrossUploader = new __NamoCrossUploader();