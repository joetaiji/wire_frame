/*-------------------------------------------------
Common Javascript
사용자페이지 및 관리자페이지 공통 js
Version : 1.0
author : mcahn
create date : 2017. 05. 01.
create date : 2017. 05. 01.
-------------------------------------------------*/

/*********************************************************************
 * 팝업 호출
 *
 * 사용 : gfnOpenWin("url", "name", "style", 100, 200);
 * 입력 : 호출url, 팝업이름, 스타일지정시, width값, height값
 **********************************************************************/
function gfnOpenWin(href, name, strStyle, width, height) {
    var sleft = (screen.width - width) / 2;
    var stop = (screen.height - height) / 2;

    var style = "left=" + sleft + ",top=" + stop + ",width=" + width + ",height=" + height + "," + strStyle;
    window.open(href, name, style);
}

/*********************************************************************
 * 코드 콤보 조회 함수
 *
 * 사용 : gfnCodeComboList($("#"), "SearchType", "all", "전체", "1", "900D");
 * 입력 : selectObject, upCdNm, 기본값사용시 value, 기본값사용시 text, 선택 할 value, 제외시킬 값 기준+Up/Down(null 처리 가능)
 **********************************************************************/
function gfnCodeComboList(selectObject, strHigh, strValue, strText, strSelect, strRange) {

    var condition = null;
    var strVal = null;

    if (strRange != null && strRange != "" && typeof strRange != "undefined") {
        condition = strRange.substring(strRange.length - 1, strRange.length);
        strVal = strRange.substring(0, strRange.length - 1);
    }

    $.ajax({
        url: gContextPath + "/common/listCode",
        data: "upCdNm=" + strHigh,
        async: false,
        success: function (data, textStatus, jqXHR) {
            selectObject.find("option").remove();

            if (strText != "" && strText != null) {
                selectObject.append($("<option>", {
                    value: strValue, text: strText
                }));
            }

            if (data != null) {
                $.each(data, function (i, item) {
                    // &amp; 기호 치환
                    if (item.KORN_CD_NM.indexOf('&amp;') > 0) {
                        item.KORN_CD_NM = item.KORN_CD_NM.replace('&amp;', '&');
                    }

                    if (condition == null || condition == "") {
                        selectObject.append($("<option>", {
                            value: item.CD_NM, text: ConvertSystemSourcetoHtml(item.KORN_CD_NM)
                        }));
                    } else {
                        if (condition == 'U') {
                            if (item.CD_NM >= strVal) {
                                selectObject.append($("<option>", {
                                    value: item.CD_NM, text: ConvertSystemSourcetoHtml(item.KORN_CD_NM)
                                }));
                            }
                        } else {
                            if (item.CD_NM < strVal) {
                                selectObject.append($("<option>", {
                                    value: item.CD_NM, text: ConvertSystemSourcetoHtml(item.KORN_CD_NM)
                                }));
                            }

                        }
                    }
                });
            }

            if (strSelect != "" && strSelect != null) {
                selectObject.val(strSelect);
                // 선택된 값이 없을 경우, 가장 첫번째 option 선택
                if (!selectObject.val()) {
                    selectObject.find("option:first").prop("selected", true);
                }
            }
        }
    });
}

/*********************************************************************
 * 카테고리 콤보 조회 함수
 *
 * 사용 : gfnCateComboList($("#"), "BOARD00002", "all", "전체", "1");
 * 입력 : selectObject, bbsId, 기본값사용시 value, 기본값사용시 text, 선택 할 value
 **********************************************************************/
function gfnCateComboList(selectObject, strBbsId, strValue, strText, strSelect) {
    $.ajax({
        url: gContextPath + "/common/listCate",
        data: "bbsId=" + strBbsId,
        success: function (data, textStatus, jqXHR) {
            selectObject.find("option").remove();

            if (strText != "" && strText != null) {
                selectObject.append($("<option>", {
                    value: strValue, text: strText
                }));
            }

            if (data != null) {
                $.each(data, function (i, item) {
                    selectObject.append($("<option>", {
                        value: item.ctgryNo, text: ConvertSystemSourcetoHtml(item.ctgryNm)
                    }));
                });
            }

            if (strSelect != "" && strSelect != null) {
                selectObject.val(strSelect);
            }
        }
    });
}

/*********************************************************************
 * 전체선택함수
 *
 * 사용 : gfnCodeComboList($("#"), "seq");
 * 입력 : selectObject, 선택되게할 Name
 **********************************************************************/
function selectAll(selectObject, ckName) {
    if (selectObject.is(":checked")) {
        $("input[name='" + inputName + "']:checkbox").prop("checked", true);
    } else {
        $("input[name='" + inputName + "']:checkbox").prop("checked", false);
    }
}

/*********************************************************************
 * gfnSelectAllCalss 전체선택함수 -- input에 class명으로 체크
 *
 * 사용 : gfnSelectAllCalss($("#"), "calss");
 * 입력 : selectObject, 선택되게할 Name
 **********************************************************************/
function gfnSelectAllCalss(className, bChk) {
    $("." + className).prop("checked", bChk);
}

/********************************************************************************************************
 * gfnCodeCheckList 코드 체크박스 조회함수
 *
 * 사용 : gfnCodeCheckList($("#"), "itrstFldNm", "itrstFldNm", strCheckList);
 * 입력 : 체크박스가 추가될 위치 selectObject, upCdNm, 체크박스 이름, 체크될 값 배열(null 가능)
 *******************************************************************************************************/
function gfnCodeCheckList(selectObject, strHigh, ckName, strCheckList) {
    $.ajax({
        url: gContextPath + "/common/listCode",
        data: "upCdNm=" + strHigh,
        async: false,
        success: function (data, textStatus, jqXHR) {

            selectObject.find("input").remove();
            selectObject.find("label").remove();

            if (data != null) {
                $.each(data, function (i, item) {
                    if (strCheckList == null || strCheckList == "") {
                        $("<input type='checkbox' id='" + ckName + i + "' name='" + ckName + "' value='" + item.CD_NM + "' />").appendTo(selectObject);
                        $("<label for='" + ckName + i + "'>" + item.KORN_CD_NM + "</label>").appendTo(selectObject);

                    } else {
                        if (strCheckList[i] == item.CD_NM) {
                            $("<input type='checkbox' id='" + ckName + i + "' name='" + ckName + "' value='" + item.CD_NM + "' checked='checked' />").appendTo(selectObject);
                        } else {
                            $("<input type='checkbox' id='" + ckName + i + "' name='" + ckName + "' value='" + item.CD_NM + "' />").appendTo(selectObject);
                        }
                        $("<label for='" + ckName + i + "'>" + item.KORN_CD_NM + "</label>").appendTo(selectObject);
                    }
                });
            }
        }
    });
}


/*******************************************************************************
 * [ Validate ] 숫자만 입력
 *
 * 입력 : 폼 객체 허용 : 0~9 사용 : onkeyup="validateOnlyNumber(this)"
 ******************************************************************************/
function validateOnlyNumber(from) {
    for (var i = 0; i < from.value.length; i++) {
        var str = from.value.charCodeAt(i);
        if (str < 48 || str > 57) {
            // alert("숫자만 입력하실수 있습니다. ");
            from.value = from.value.replace(from.value.charAt(i), "");
            // from.select(); //내용선택
            return false;
        }
    }
    return true;
}

/*******************************************************************************
 * fnStrSplit 문자 자르는 함수
 *
 * 사용 : fnStrSplit("1###2", "###");
 * 입력 : str, 자를 문자열
 ******************************************************************************/
function fnStrSplit(str, strSplit) {
    var s = str;
    var arrayString;

    arrayString = s.split(strSplit);

    return arrayString;
}

/*******************************************************************************
 * 선택된 체크박스에 패턴추가 함수
 *
 * 사용 : gfnRtSelectCheck(chkName, pattern);
 * 입력 : 체크박스 이름, 선택값 뒤 추가될 패턴
 ******************************************************************************/
function gfnRtSelectCheck(chkName, pattern) {
    var patternLen = pattern.length;
    var result = "";
    var isCount = 0;

    $('input:checkbox[name="' + chkName + '"]').each(function () {
        if (this.checked) {
            isCount++;
            result = result + this.value + pattern;
        } else {
            result = result + pattern;
        }
    });

    return result.substring(0, result.length - patternLen);
}

/* 입력 버튼 클릭시 */
function gfnReplyInsert(selectObject, regNo, bbsId) {
    var text = selectObject.val();
    $('#replyArea').val("");
    var csrfToken = $('meta[name="_csrf"]').attr('content');
    var param = {_csrf: csrfToken, regNo: regNo, inCondition: "입력", cmntLqtyCn: text, bbsId: bbsId};

    $.ajax({
        type: "POST",
        async: false,
        url: gContextPath + "/common/replyAct",  // URL 변경
        data: param,
        success: function (data, textStatus, jqXHR) {
            if (data == "NOUSER") {
                alert("로그인이 필요합니다.");
                location.reload();
            } else {
                gfnReplyList($('#reply'), regNo, bbsId);
            }
        }
    });
}

/*******************************************************************************
 * 선택된 오브젝트에 리플 삭제
 *
 * 사용 : gfnReplyDelete(cmntSn, regNo, bbsId)
 * 입력 : 리플 Id, 글 regNo, 현재 게시판 bbsId
 ******************************************************************************/
function gfnReplyDelete(cmntSn, regNo, bbsId) {
    var csrfToken = $('meta[name="_csrf"]').attr('content');
    var param = {_csrf: csrfToken, cmntSn: cmntSn, inCondition: "삭제", regNo: regNo, bbsId: bbsId};
    if (confirm("삭제하시겠습니까?")) {
        $.ajax({
            type: "POST",
            async: false,
            url: gContextPath + "/common/replyAct",
            data: param,
            success: function () {
                $('li[value=' + cmntSn + ']').remove();
            }
        });
    }
}

/*******************************************************************************
 * 선택된 오브젝트에 리플 수정 폼 생성
 *
 * 사용 : gfnReplyUpdate(cmntSn, regNo, bbsId)
 * 입력 : 리플 Id, 글 regNo, 현재 게시판 bbsId
 ******************************************************************************/
function gfnReplyUpdate(cmntSn, regNo, bbsId) {
    var txt = $('li[value=' + cmntSn + '] > p').html();
    txt = replaceAll(txt, "<br>", "\n");

    $('li[value=' + cmntSn + '] > p').remove();
    $('li[value=' + cmntSn + ']').append('<textarea id="editArea" style="width:100%; height: 56px; min-width: 643px;">');
    $('li[value=' + cmntSn + '] > #editArea').html(txt);

    //저장 버튼 추가 할 시
    $('li[value=' + cmntSn + ']').append('<button type="button" onclick="javascript:gfnReplyUpdateAct(' + '\'' + cmntSn + '\'' + ',' + '\'' + regNo + '\'' + ',' + '\'' + bbsId + '\'' + ')">');
    $('li[value=' + cmntSn + '] > button').text("저장");

    /*var script = "javascript:gfnReplyUpdateAct("+cmntSn+","+regNo+")";
    $('li[value='+cmntSn+'] > div > .btn > button[value=modify]').attr('onclick', script);*/
}

/*******************************************************************************
 * 선택된 오브젝트에 리플 수정 처리
 *
 * 사용 : gfnReplyUpdateAct(cmntSn, regNo, bbsId)
 * 입력 : 리플 Id, 글 regNo, 현재 게시판 bbsId
 ******************************************************************************/
function gfnReplyUpdateAct(cmntSn, regNo, bbsId) {
    var text = $('#editArea').val();
    var csrfToken = $('meta[name="_csrf"]').attr('content');
    var param = {_csrf: csrfToken, 'regNo': regNo, 'cmntSn': cmntSn, 'inCondition': "수정", 'cmntLqtyCn': text, 'bbsId': bbsId};

    $.ajax({
        type: "POST",
        async: false,
        url: gContextPath + "/common/replyAct",
        data: param,
        success: function (data, textStatus, jqXHR) {
            if (data == "NOUSER") {
                alert("로그인이 필요합니다.");
                location.reload();
            } else {
                $('li[value=' + cmntSn + '] > textarea').remove();

                $('li[value=' + cmntSn + ']').last().append('<p>');
                var str = text;
                str = replaceAll(str, "\n", "<br />");
                $('li[value=' + cmntSn + '] > p').last().html(str);
            }

            gfnReplyList($('#reply'), regNo, bbsId);
        }
    });

    /*var script = "javascript:gfnReplyUpdate("+cmntSn+","+regNo+")";
    $('li[value='+cmntSn+'] > div > .btn > button[value=modify]').attr('onclick', script);*/
}

/*******************************************************************************
 * 선택된 오브젝트에 리플 리스트 가져오기
 *
 * 사용 : gfnReplyList(selectObject, regNo, bbsId)
 * 입력 : 추가될 위치, 현재 글 regNo, 현재 게시판 bbsId
 ******************************************************************************/
function gfnReplyList(selectObject, regNo, bbsId) {
    selectObject.empty();

    $.ajax({
        url: gContextPath + "/common/replyList",
        data: {regNo: regNo, bbsId: bbsId},
        success: function (data, textStatus, jqXHR) {
            if (data != null) {
                $.each(data, function (i, item) {
                    selectObject.append('<li value=' + item.cmntSn + '>');
                    selectObject.find('li').last().append('<div class="cmt_control">');
                    selectObject.find('.cmt_control').last().append('<strong class="cmt_name">');
                    selectObject.find('.cmt_name').last().text(item.dmlUserName);
                    selectObject.find('.cmt_control').last().append('<span class="date">');
                    selectObject.find('.cmt_control > .date').last().text(item.regDt);
                    if (item.isMyReply == "Y") {
                        selectObject.find('.cmt_control').last().append('<span class="btn">');
                        selectObject.find('.btn').last().append('<button type="button" value="modify" onclick="javascript:gfnReplyUpdate(' + '\'' + item.cmntSn + '\'' + ',' + '\'' + item.regNo + '\'' + ',' + '\'' + bbsId + '\'' + ');">수정</button>');
                        selectObject.find('.btn').last().append('<button type="button" value="delete" onclick="javascript:gfnReplyDelete(' + '\'' + item.cmntSn + '\'' + ',' + '\'' + item.regNo + '\'' + ',' + '\'' + bbsId + '\'' + ');">삭제</button>');
                    }
                    selectObject.find('li').last().append('<p>');

                    var str = item.cmntLqtyCn;
                    str = replaceAll(str, "\n", "<br />");
                    selectObject.find('li > p').last().html(str);

                });
            }
        }
    });
}

/*********************************************************************
 * 프린트 div 영역 지정 출력
 *
 **********************************************************************/
var win = null;

function printIt(contextPath) {
    win = window.open('', '', 'width=1024,height=900');
    self.focus();
    win.document.open();
    win.document.write('<' + 'html' + '><' + 'head' + '><' + 'style' + '>');
    win.document.write('body { margin: 10px!important;}');
    win.document.write('body, th { font-size: 10pt;}');
    win.document.write('<' + '/' + 'style' + '>');
    win.document.write('<link rel="stylesheet" type="text/css" href="' + contextPath + '/resources/css/ips/sub.css" />');
    win.document.write('<link rel="stylesheet" type="text/css" href="' + contextPath + '/resources/css/ips/print.css" /><' + '/' + 'head' + '><' + 'body' + '>');
    const el = window.top.document.getElementById('contentArea');

    if (el.tagName.toLowerCase() === 'iframe') {
        // iframe일 경우
        const doc = el.contentDocument || el.contentWindow.document;
        win.document.write(doc.body.innerHTML);
    } else {
        // div 또는 기타 요소일 경우
        win.document.write($("#contentArea").html());
    }
    win.document.write('<' + '/' + 'body' + '><' + '/' + 'html' + '>');
    win.document.close();
    win.print();
    win.close();
}

/*********************************************************************
 * 프린트 div content 영역 출력
 *
 **********************************************************************/
function printContent(contextPath, strSiteKey) {
    var $divContent = $('#content').clone();
    var menuId = $('#menuId').val();
    var step = $('#step').val();

    win = window.open('', '', 'width=1024,height=900');
    self.focus();
    win.document.open();
    win.document.write('<' + 'html' + '><' + 'head' + '><' + 'style type="text/css" media="print" ' + '>');
    // win.document.write('body, td { font-size: 10pt;}');
    // win.document.write('body, th { font-size: 10pt;}');
    // win.document.write('.content-footer { display:none; }');
    // win.document.write('@media print { .content-footer { display:none; } }');
    // win.document.write('@page{ size:auto; margin:8mm;} ');
    win.document.write('<' + '/' + 'style' + '>');
    win.document.write('<link rel="stylesheet" type="text/css" href="' + contextPath + '/resources/css/' + strSiteKey + '/print.css" />');
    win.document.write('<' + '/' + 'head' + '><' + 'body id="print"' + '>');
    win.document.write($divContent.html());
    win.document.write('<' + '/' + 'body' + '><' + '/' + 'html' + '>');
    win.document.close();

    setTimeout(function () {
        win.print();
        win.close();
    }, 1000);
}

/*
//쿠키값 설정
function setCookie(name, value, expiredays) {
    var today = new Date();
    today.setDate(today.getDate() + expiredays);
    document.cookie = name + "=" + escape(value) + "; path=" + gContextPath + "; expires=" + today.toGMTString() + ";";
}

function setCookieWithSamePath(name, value, expiredays) {
    var today = new Date();
    today.setDate(today.getDate() + expiredays);
    document.cookie = name + "=" + escape(value) + "; path=/; expires=" + today.toGMTString() + ";";
}

//쿠키값 가져오기 
function getCookie(key) {
    var cook = document.cookie + ";";
    var idx = cook.indexOf(key, 0);
    var val = "";

    if (idx != -1) {
        cook = cook.substring(idx, cook.length);
        begin = cook.indexOf("=", 0) + 1;
        end = cook.indexOf(";", begin);

        //key 값과 cookie의 key 값이 일치 할 경우에만
        if (key == cook.substring(0, begin - 1)) {
            val = unescape(cook.substring(begin, end));
        }
    }

    return val;
}*/

// localStorage 설정
function setStorage(name, value, expireDays) {
    if (expireDays === -1) {
        localStorage.removeItem(name);
        return;
    }
    const data = {
        value: value,
        expires: expireDays ? new Date().getTime() + expireDays * 24 * 60 * 60 * 1000 : null
    };
    localStorage.setItem(name, JSON.stringify(data));
}

// localStorage 가져오기
function getStorage(name) {
    try {
        const data = JSON.parse(localStorage.getItem(name));
        if (!data) return null;
        if (data.expires && new Date().getTime() > data.expires) {
            localStorage.removeItem(name);
            return null;
        }
        return data.value;
    } catch (e) {
        console.error("getStorage parse error", e);
        return null;
    }
}


// 사용자 로그인 폼 아이디 저장 쿠키 가져오기
function getIdCookie(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=').map(item => item.trim());
        if (key === name) {
            return decodeURIComponent(value || '');
        }
    }
    return '';
}

// 사용자 로그인 폼 아이디 저장 쿠키 설정하기
function setIdCookie(name, value, days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${date.toUTCString()}${secure}`;
}

// 사용자 로그인 폼 아이디 저장 쿠키 삭제하기
function deleteIdCookie(name) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}


function replaceAll(sValue, param1, param2) {
    return sValue.split(param1).join(param2);
}

/*******************************************************************************
 * 선택된 게시글(메뉴) 스크랩하기
 *
 * 사용 : gfnMyScrapInsert(menuid, regNo)
 * 입력 : 현재메뉴 menuid, 현재 글 regNo
 ******************************************************************************/
//스크랩중복체크 후 인서트
function gfnMyScrapInsert(menuid, regNo) {
    if (menuid.length < 9) {

        alert("스크랩할 수 없습니다.");
        return;
    }

    $.ajax({
        url: gContextPath + "/mps/mypage/check",
        data: {'menuId': menuid, 'schText': regNo},
        success: function (rtn) {

            fnScrapInsert(menuid, regNo, rtn);
        }
    });
}

//마이스크랩등록
function fnScrapInsert(menuid, regNo, rtn) {
    if (rtn > 0) {
        alert("이미 스크랩되어 있습니다.");
        return false;
    } else {
        if (confirm("해당 게시물(메뉴)를 스크랩 하시겠습니까?")) {

            $.ajax({
                url: gContextPath + "/mps/mypage/insert",
                data: {'menuId': menuid, 'schText': regNo},
                success: function (val) {
                    alert("해당 게시물(메뉴)이 스크랩되었습니다.");
                }
            });
        } else {
            alert("취소되었습니다.");
        }
    }
}

/********************************************************************************************************
 * gfnCodeRadioList 코드 라디오버튼 조회함수
 *
 * 사용 : gfnCodeRadioList($("#"), "itrstFldNm", "answerWay", "", "", "01");
 * 입력 : 추가될 위치 selectObject, upCdNm, 라디오버튼 이름, 기본값 사용시 value, 기본값 사용시 text, 선택 할 value
 *******************************************************************************************************/
function gfnCodeRadioList(selectObject, strHigh, objName, strValue, strText, strSelect) {
    $.ajax({
        url: gContextPath + "/common/listCode",
        data: "upCdNm=" + strHigh,
        async: false,
        success: function (data, textStatus, jqXHR) {

            selectObject.find("input").remove();
            selectObject.find("label").remove();

            if (data != null) {
                $.each(data, function (i, item) {
                    $("<input type='radio' id='" + objName + i + "' name='" + objName + "' value='" + item.CD_NM + "' />").appendTo(selectObject);
                    $("<label for='" + objName + i + "'>" + item.KORN_CD_NM + "</label>").appendTo(selectObject);
                });
            }

            if (strSelect != "" && strSelect != null) {
                $('input[name=' + objName + ']').each(function () {
                    if ($(this).val() == strSelect) {
                        $(this).attr('checked', 'checked');
                    }
                });
            }
        }
    });
}

function padDigit(num) {
    if (num < 10) {
        return "0" + num;
    } else {
        return num;
    }
}

function gfnAjaxError() {
    alert("경로가 정확하지 않거나 오류가 발생하였습니다.");
    return;
}

//메일보내기
function gfnToMail(rtnLoction, ttl, url) {
    var pop_title = "mail_pop";
    window.open("", pop_title, 'width=870px,height=610px,scrollbars=yes,status=no');

    var frmData = document.frmData;
    frmData.menuName.value = rtnLoction;
    frmData.ttl.value = ttl;
    frmData.urlAddr.value = url;
    frmData.target = pop_title;
    frmData.action = "/mps/footerMail";
    frmData.submit();
}

//트위터보내기
function gfnToTwitter(strUrl) {
    strUrl = "http://www.plani.co.kr" + strUrl;
    var shareUrl = "http://twitter.com/share?url=" + encodeURIComponent(strUrl);
    window.open(shareUrl, 'share_twitter', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
}


/**************************************************************************************************************
 * 이용약관 전체선택 공통
 *
 * 사용 : gfnOpenNewsLetter()
 * 입력 :
 **************************************************************************************************************/
function gfnAllPolicyCheck() {
    var choicePolicyChk = $("input:checkbox[name='allcheck']").is(":checked");

    if (choicePolicyChk) {
        $(".agree1").prop("checked", true);
        $(".agree2").prop("checked", true);
    } else {
        $(".agree1").removeAttr('checked');
        $(".agree2").removeAttr('checked');
    }
}

/**************************************************************************************************************
 * 이용약관 전체선택 공통
 *
 * 사용 : gfnNotAgreeCheck()
 * 입력 :
 **************************************************************************************************************/
function gfnNotAgreeCheck() {
    $("#allcheck").removeAttr('checked');
}

/**************************************************************************************************************
 * 날짜 공통함수
 *
 * 사용 :
 * 입력 :
 **************************************************************************************************************/
function gfnIsHoliday(yyyy, mm, dd) {
    //검사년도
    var yyyymmdd = yyyy + "" + mm + "" + dd;
    //var yyyy = "";
    var holidays = new Array();
    var holidaysName = new Array();
    var holidayName = "";
    // 음력 공휴일 양력으로 바꾸어서 입력

    // 양력 공휴일 일력
    holidays[0] = yyyy + "0101"; //양력설날
    holidays[1] = yyyy + "0301"; //삼일절
    //holidays[2] = yyyy+"0405"; //식목일
    holidays[2] = yyyy + "0505"; //어린이날
    holidays[3] = yyyy + "0606"; //현충일
    holidays[4] = yyyy + "0815"; //광복절
    holidays[5] = yyyy + "1003"; //개천절
    holidays[6] = yyyy + "1009"; //한글날
    holidays[7] = yyyy + "1225"; //성탄절

    var tmp01 = lunerCalenderToSolarCalenger(yyyy + "0101");
    var tmp02 = lunerCalenderToSolarCalenger(yyyy + "0815");

    holidays[8] = Number(tmp01) - 1;  //음력설 첫쨋날
    holidays[9] = tmp01; 	 //음력설 둘쨋날
    holidays[10] = Number(tmp01) + 1; //음력설 셋쨋날
    holidays[11] = Number(tmp02) - 1; //음력추석 첫쨋날
    holidays[12] = tmp02; 	 //음력추석 둘쨋날
    holidays[13] = Number(tmp02) + 1; //음력추석 셋쨋날
    holidays[14] = lunerCalenderToSolarCalenger(yyyy + "0408"); //석가탄신일

    holidaysName[0] = "신정";
    holidaysName[1] = "삼일절";
    //holidaysName[2] = "식목일";
    holidaysName[2] = "어린이날";
    holidaysName[3] = "현충일";
    holidaysName[4] = "광복절";
    holidaysName[5] = "개천절";
    holidaysName[6] = "한글날";
    holidaysName[7] = "성탄절";
    holidaysName[8] = "구정 첫쨋날";
    holidaysName[9] = "구정 둘쨋날";
    holidaysName[10] = "구정 셋쨋날";
    holidaysName[11] = "추석 첫쨋날";
    holidaysName[12] = "추석 둘쨋날";
    holidaysName[13] = "추석 셋쨋날";
    holidaysName[14] = "석가탄신일";

    for (var i = 0; i < holidays.length; i++) {
        if (holidays[i] == yyyymmdd) {
            holidayName = holidaysName[i];
            //return true;
        }
    }
    return holidayName;
}

function get_year(src) {
    if ((src < 1841) || (src > 2043)) {
        alert('연도 범위는 1841 ~ 2043 까지입니다.');
        return;
    } else {
        return src;
    }
}

/**
 * 달이 12보다 크거나 1보다 작은지 검사한다.
 * 날짜가 잘못된 경우에는 경고창 후 멈춘다.
 *
 * @param int
 * @return int
 */
function get_month(src) {
    if ((src < 1) || (src > 12)) {
        alert('월 범위는 1 ~ 12 까지입니다.');
        return;
    } else {
        return src;
    }
}

/**
 * 날짜가 1일보다 크고 src보다 작은 경우는 날짜를 반환한다.
 * 날짜가 잘못된 경우에는 경고창 후 멈춘다.
 *
 * @param int
 * @param int
 * @return int
 */
function get_day(src, day) {
    if ((src < 1) || (src > day)) {
        alert('일 범위가 틀립니다.');
        return;
    } else {
        return src;
    }
}

/**
 * 음력을 양력으로 바꾸어서 반환한다.
 *
 * @param string
 * return string
 */
function lunerCalenderToSolarCalenger(input_day) {
    var kk = [[1, 2, 4, 1, 1, 2, 1, 2, 1, 2, 2, 1],   /* 1841 */
        [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 1, 4, 1, 2, 1, 2, 1],
        [2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 5, 2, 1, 2, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 5, 2],   /* 1851 */
        [2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2],
        [1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
        [1, 2, 1, 1, 5, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [2, 1, 6, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1861 */
        [2, 1, 2, 1, 2, 2, 1, 2, 2, 3, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 4, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
        [1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 1],
        [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 1, 2, 1, 1, 5, 2, 1],
        [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2],   /* 1871 */
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
        [1, 1, 2, 1, 2, 4, 2, 1, 2, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
        [2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1, 2],
        [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 4, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
        [1, 2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1],   /* 1881 */
        [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
        [2, 1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],   /* 1891 */
        [1, 1, 2, 1, 1, 5, 2, 2, 1, 2, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],   /* 1901 */
        [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
        [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
        [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2],   /* 1911 */
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
        [2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 5, 2, 2, 1, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],   /* 1921 */
        [2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],
        [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
        [2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
        [1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1],
        [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],   /* 1931 */
        [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2],
        [1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 4, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
        [2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2],
        [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1],   /* 1941 */
        [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
        [1, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
        [2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],   /* 1951 */
        [1, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
        [2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
        [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
        [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],   /* 1961 */
        [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
        [2, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
        [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 1, 5, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
        [1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   /* 1971 */
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],
        [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
        [2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 1981 */
        [2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
        [2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
        [1, 2, 1, 1, 5, 1, 2, 1, 2, 2, 2, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   /* 1991 */
        [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
        [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
        [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
        [2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2],   /* 2001 */
        [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
        [1, 5, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2],
        [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
        [1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
        [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
        [2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 2011 */
        [2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1],
        [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
        [1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 2],
        [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
        [2, 1, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
        [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
        [2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
        [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],   /* 2021 */
        [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
        [1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
        [2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
        [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
        [1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
        [2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
        [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
        [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 2031 */
        [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 5, 2, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
        [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
        [2, 2, 1, 2, 1, 4, 1, 1, 2, 1, 2, 2],
        [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
        [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
        [2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
        [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
        [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],   /* 2041 */
        [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
        [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2]];

    var gan = new Array("甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸");
    var jee = new Array("子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥");
    var ddi = new Array("쥐", "소", "범", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지");
    var week = new Array("일", "월", "화", "수", "목", "금", "토");

    var md = new Array(31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

    var year = input_day.substring(0, 4);
    var month = input_day.substring(4, 6);
    var day = input_day.substring(6, 8);

    // 음력에서 양력으로 변환
    var lyear, lmonth, lday, leapyes;
    var syear, smonth, sday;
    var mm, y1, y2, m1;
    var i, j, k1, k2, leap, w;
    var td, y;
    lyear = get_year(year);        // 년도 check
    lmonth = get_month(month);     // 월 check

    y1 = lyear - 1841;
    m1 = lmonth - 1;
    leapyes = 0;
    if (kk[y1][m1] > 2) {
        if (document.frmTest.yoon[0].checked) {
            leapyes = 1;
            switch (kk[y1][m1]) {
                case 3:
                case 5:
                    mm = 29;
                    break;
                case 4:
                case 6:
                    mm = 30;
                    break;
            }
        } else {
            switch (kk[y1][m1]) {
                case 1:
                case 3:
                case 4:
                    mm = 29;
                    break;
                case 2:
                case 5:
                case 6:
                    mm = 30;
                    break;
            } // end of switch
        } // end of if
    } // end of if

    lday = get_day(day, mm);

    td = 0;
    for (i = 0; i < y1; i++) {
        for (j = 0; j < 12; j++) {
            switch (kk[i][j]) {
                case 1:
                    td = td + 29;
                    break;
                case 2:
                    td = td + 30;
                    break;
                case 3:
                    td = td + 58;    // 29+29
                    break;
                case 4:
                    td = td + 59;    // 29+30
                    break;
                case 5:
                    td = td + 59;    // 30+29
                    break;
                case 6:
                    td = td + 60;    // 30+30
                    break;
            } // end of switch
        } // end of for
    } // end of for

    for (j = 0; j < m1; j++) {
        switch (kk[y1][j]) {
            case 1:
                td = td + 29;
                break;
            case 2:
                td = td + 30;
                break;
            case 3:
                td = td + 58;    // 29+29
                break;
            case 4:
                td = td + 59;    // 29+30
                break;
            case 5:
                td = td + 59;    // 30+29
                break;
            case 6:
                td = td + 60;    // 30+30
                break;
        } // end of switch
    } // end of for

    if (leapyes == 1) {
        switch (kk[y1][m1]) {
            case 3:
            case 4:
                td = td + 29;
                break;
            case 5:
            case 6:
                td = td + 30;
                break;
        } // end of switch
    } // end of switch

    td = td + parseFloat(lday) + 22;
    // td : 1841 년 1 월 1 일 부터 원하는 날짜까지의 전체 날수의 합
    y1 = 1840;
    do {
        y1 = y1 + 1;
        if ((y1 % 400 == 0) || ((y1 % 100 != 0) && (y1 % 4 == 0))) {
            y2 = 366;
        } else {
            y2 = 365;
        }
        if (td <= y2) {
            break;
        } else {
            td = td - y2;
        }
    } while (1); // end do-While

    syear = y1;
    md[1] = parseInt(y2) - 337;
    m1 = 0;
    do {
        m1 = m1 + 1;
        if (td <= md[m1 - 1]) {
            break;
        } else {
            td = td - md[m1 - 1];
        }
    } while (1); // end of do-While

    smonth = parseInt(m1);
    sday = parseInt(td);

    // 월이 한자리인경우에는 앞에 0을 붙혀서 반환
    if (smonth < 10) {
        smonth = "0" + smonth;
    }
    // 일이 한자리인경우에는 앞에 0을 붙혀서 반환
    if (sday < 10) {
        sday = "0" + sday;
    }

    return new String(syear + smonth + sday);
}

//날짜 포맷변환  00000000 => 0000-00-00
function gfnDateYYYYMMDDFormat(object) {

    var num, year, month, day;

    var input = "#" + object;

    num = $(input).val();

    if (num.length == 0) {
        return;
    }

    while (num.search("-") != -1) {

        num = num.replace("-", "");
    }

    if (isNaN(num)) {
        alert("숫자로만 작성하셔야 합니다.");
        $(input).focus();
        return;
    }

    if (num != 0 && num.length == 8) {

        year = num.substring(0, 4);
        month = num.substring(4, 6);
        day = num.substring(6);

        if (isValidDay(year, month, day) == false) {

            num = "";
            alert("유효하지 않는 날짜입니다. 다시 한번 확인하시고 입력해주세요.");
            $(input).val(num);
            $(input).focus();
            return;
        }

        num = year + "-" + month + "-" + day;

    } else {
        num = "";
        alert("날짜 입력형식 오류입니다. 다시 한번 확인하시고 입력해 주세요");
        $(input).val(num);
        $(input).focus();
        return;
    }

    $(input).val(num);
}

//유효한 날짜인지 체크
function isValidDay(yyyy, mm, dd) {

    var m = parseInt(mm, 10) - 1;
    var d = parseInt(dd, 10);
    var end = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

    if ((yyyy % 4 == 0 && yyyy % 100 != 0) || yyyy % 400 == 0) {

        end[1] = 29;
    }

    return (d >= 1 && d <= end[m]);
}


/*********************************************************************
 * 로그인  호출
 *
 * 사용 : gfnOpenLogin();
 * 입력 :
 **********************************************************************/
function gfnOpenLogin() {

    //$(".login_layerPopup").show();
    $(".login_layerPopup").css("display", "none");
    $(".login_layerPopup").fadeIn('slow');
}

/*********************************************************************
 * 정규식 패턴 생성 (공백/특수문자 무시)
 * 유해어의 각 문자 사이에 공백/특수문자가 올 수 있도록 패턴 생성
 * 예: "유해어" -> "유[공백/특수문자]*해[공백/특수문자]*어"
 *
 * 사용 : createTabooPattern("유해어");
 * 입력 : word - 유해어
 * 반환 : RegExp 객체 (대소문자 무시)
 **********************************************************************/
function createTabooPattern(word) {
    if (!word || word.length === 0) return null;

    // 각 문자 사이에 0개 이상의 공백/특수문자가 올 수 있도록 패턴 생성
    // 특수문자: 공백, 하이픈, 언더스코어, 기타 특수문자 등
    var pattern = '';
    // 정규식에서 특수문자로 취급되는 문자들
    var regexSpecialChars = /[.*+?^${}()|[\]\\]/;

    for (var i = 0; i < word.length; i++) {
        if (i > 0) {
            // 문자 사이에 공백/특수문자 허용 (0개 이상)
            // 공백, 하이픈, 언더스코어, @, #, $, %, ^, &, *, (, ), +, =, [, ], {, }, |, \, ;, :, ", ', <, >, ,, ., ?, /, !, ~, `
            pattern += '[\\s\\-\\_@#\\$%\\^&\\*\\(\\)\\+=\\[\\]\\{\\}\\|\\\\;:\"\'<>,\\.\\?/!~`]*';
        }
        // 정규식 특수문자는 이스케이프 처리
        var char = word.charAt(i);
        if (regexSpecialChars.test(char)) {
            pattern += '\\' + char;
        } else {
            pattern += char;
        }
    }
    return new RegExp(pattern, 'i'); // 대소문자 무시
}

/*********************************************************************
 * 유해어 체크
 *
 * 사용 : gfnTabooWordCheck();
 * 입력 :
 **********************************************************************/
function gfnTabooWordCheck(objs) {
    var chkCnt = 0;
    var chkTtlArray = [];
    var kNameArray = [];

    $.each(objs.split('§§'), function (index, obj) {
        $.ajax({
            url: gContextPath + "/tabooWord",
            async: false,
            cache: false,
            success: function (data) {
                if (data != null) {
                    var fieldValue = $("#" + obj).val();
                    if (fieldValue !== undefined && fieldValue !== null) {
                        $.each(data, function (j) {
                            if (data[j].PHWRD_NM) {
                                var pattern = createTabooPattern(data[j].PHWRD_NM);
                                if (pattern && pattern.test(fieldValue)) {
                                    chkCnt += 1;
                                    chkTtlArray.push(data[j].PHWRD_NM);
                                }
                            }
                        });
                    }
                }
            }
        });
    });

    $.each(chkTtlArray, function (i, el) {
        if ($.inArray(el, kNameArray) == -1) kNameArray.push(el);
    });


    return [chkCnt + "건의 유해어가 검출되었습니다.\n" + kNameArray, chkCnt];
}

/*********************************************************************
 * 유해어 검증 및 알림 (공통 함수)
 * 
 * 사용 : if (!gfnValidateTabooWords('ttl§§htmlLqtyCn')) return false;
 * 입력 : fieldIds - 검증할 필드 ID들 (예: 'ttl§§htmlLqtyCn' 또는 'htmlLqtyCn')
 * 반환 : true (유해어 없음) / false (유해어 검출 시 alert 후 false 반환)
 **********************************************************************/
function gfnValidateTabooWords(fieldIds) {
    var tabooResult = gfnTabooWordCheck(fieldIds);
    if (tabooResult[1] > 0) {
        alert(tabooResult[0]);
        return false;
    }
    return true;
}

function zooms(nowZoom) {
    var docbody = document.body;
    header.style.zoom = nowZoom;// IE
    body.style.zoom = nowZoom;// IE
    footer.style.zoom = nowZoom;  // IE
    docbody.style.webkitTransform = 'scale(' + nowZoom + ')';  // Webkit(chrome)
    docbody.style.webkitTransformOrigin = '0 0';
    docbody.style.mozTransform = 'scale(' + nowZoom + ')';  // Mozilla(firefox)
    docbody.style.mozTransformOrigin = '0 0';
    docbody.style.oTransform = 'scale(' + nowZoom + ')';  // Opera
    docbody.style.oTransformOrigin = '0 0';
}

/*********************************************************************
 * 에디터 설정
 *
 **********************************************************************/
function gfnInitEditor(objId, objPosition) {
    // 다음에디터 설정
    $.ajax({
        url: gContextPath + "/resources/component/daumeditor-7.4.27/editor.html",
        success: function (data) {
            data = data.replace(/images\/icon\/editor\/skin\/01\/btn_drag01.gif/g, gContextPath + "/resources/component/daumeditor-7.4.27/images/icon/editor/skin/01/btn_drag01.gif");
            data = data.replace(/images\/icon\/editor\/loading2.png/g, gContextPath + "/resources/component/daumeditor-7.4.27/images/icon/editor/loading2.png");
            data = data.replace(/images\/icon\/editor\/pn_preview.gif/g, gContextPath + "/resources/component/daumeditor-7.4.27/images/icon/editor/pn_preview.gif");

            $("#editor_frame").html(data);
            var config = {
                txHost: '', /* 런타임 시 리소스들을 로딩할 때 필요한 부분으로, 경로가 변경되면 이 부분 수정이 필요. ex) http://xxx.xxx.com */
                txPath: '', /* 런타임 시 리소스들을 로딩할 때 필요한 부분으로, 경로가 변경되면 이 부분 수정이 필요. ex) /xxx/xxx/ */
                txService: 'sample', /* 수정필요없음. */
                txProject: 'sample', /* 수정필요없음. 프로젝트가 여러개일 경우만 수정한다. */
                initializedId: "", /* 대부분의 경우에 빈문자열 */
                wrapper: "tx_trex_container", /* 에디터를 둘러싸고 있는 레이어 이름(에디터 컨테이너) */
                form: 'tx_editor_form' + "", /* 등록하기 위한 Form 이름 */
                txIconPath: gContextPath + "/resources/component/daumeditor-7.4.27/images/icon/editor/", /*에디터에 사용되는 이미지 디렉터리, 필요에 따라 수정한다. */
                txDecoPath: gContextPath + "/resources/component/daumeditor-7.4.27/images/deco/contents/", /*본문에 사용되는 이미지 디렉터리, 서비스에서 사용할 때는 완성된 컨텐츠로 배포되기 위해 절대경로로 수정한다. */
                canvas: {
                    exitEditor: {
                        /*
                        desc:'빠져 나오시려면 shift+b를 누르세요.',
                        hotKey: {
                            shiftKey:true,
                            keyCode:66
                        },
                        nextElement: document.getElementsByTagName('button')[0]
                        */
                    },
                    styles: {
                        color: "#123456", /* 기본 글자색 */
                        fontFamily: "굴림", /* 기본 글자체 */
                        fontSize: "9pt", /* 기본 글자크기 */
                        backgroundColor: "#fff", /*기본 배경색 */
                        lineHeight: "1.5", /*기본 줄간격 */
                        padding: "10px" /* 위지윅 영역의 여백 */
                    },
                    showGuideArea: false
                },
                events: {
                    preventUnload: false
                },
                sidebar: {
                    attachbox: {
                        show: true,
                        confirmForDeleteAll: true
                    },
                    capacity: {
                        available: 1024 * 1024 * 10, /* 첨부 용량 제한 */
                        maximum: 1024 * 1024 * 10     /* 첨부 용량 제한 */
                    }
                },
                size: {
                    //contentWidth: 670 /* 지정된 본문영역의 넓이가 있을 경우에 설정 */
                }
            };

            EditorJSLoader.ready(function (Editor) {
                var editor = new Editor(config);
                Editor.getCanvas().setCanvasSize({height: 250});

                if (objPosition == 'self') {
                    Editor.modify({
                        "content": document.getElementById(objId) /* 내용 문자열, 주어진 필드(textarea) 엘리먼트 */
                    });
                } else {
                    Editor.modify({
                        "content": opener.document.getElementById(objId) /* 내용 문자열, 주어진 필드(textarea) 엘리먼트 */
                    });
                }

            });
        }
    });
}

/*********************************************************************
 * 파일업로드 확장자 체크
 *
 **********************************************************************/
function gfnCheckFext(objs, type) {

    var retval = true;
    var ext = "";

    objs.each(function () {
        var fpath = $(this).val();
        if (fpath.length > 0) {
            ext = fpath.substr(fpath.lastIndexOf(".") + 1, fpath.length);
            ext = ext.toLowerCase();

            if (type == "IMG") {
                var allows = "jpg|png|bmp|gif";
                if (allows.indexOf(ext) < 0) {
                    alert("허용되지 않는 파일이거나 목적에 맞지 않는 파일입니다.\n이미지 파일을 등록해주십시오.\n현재 파일 종류 : " + ext);
                    retval = false;
                    return false;
                }
            } else if (type == "DOC") {
                var allows = "doc|docx|xls|xlsx|ppt|pptx|pdf|hwp|txt";
                if (allows.indexOf(ext) < 0) {
                    alert("허용되지 않는 파일이거나 목적에 맞지 않는 파일입니다/.\n문서 파일을 등록해주십시오.\n현재 파일 종류 : " + ext);
                    retval = false;
                    return false;
                }
            } else if (type == "GNR") {
                var allows = "jpg|png|bmp|gif|doc|docx|xls|xlsx|ppt|pptx|pdf|hwp|txt|zip";
                if (allows.indexOf(ext) < 0) {
                    alert("허용되지 않는 파일이거나 목적에 맞지 않는 파일입니다.\n파일 종류 : " + ext);
                    retval = false;
                    return false;
                }
            }
        }
    });

    return retval;
}


/*********************************************************************
 * 파일미리보기
 *
 **********************************************************************/
function gfnFileViewer(url) {
    $.ajax({
        type: "POST",
        async: false,
        url: url,
        success: function (data) {
            window.open(data.INFO, "_balnk", "status=no,toolbar=no,scrollbars=no");
        }
    });
}

/*********************************************************************
 * 특수문자변화코드
 *
 **********************************************************************/
function ConvertSystemSourcetoHtml(str) {
    str = str.replace(/&lt;/g, "<");
    str = str.replace(/&gt;/g, ">");
    str = str.replace(/&quot;/g, "\"");
    str = str.replace(/&#39;/g, "\'");
    str = str.replace(/&apos;/g, "\'");
    return str;
}

function gfnNtnNmAdd(obj) {
    var nodeLeng = $("#tdNtnNm").children('select').length;
    var cntntNmCdNm = "cntntNm" + (nodeLeng / 2);
    var ntnNmCdNm = "ntnNm" + (nodeLeng / 2);

    obj.before('<select id="' + cntntNmCdNm + '" name="' + cntntNmCdNm + '" class="selContinent"><option value="">대륙 선택</option></select> '
        + '<select id="' + ntnNmCdNm + '" name="' + ntnNmCdNm + '" class="selNtnNm"><option value="">국가 선택</option></select> ');

    gfnCodeComboList($("#" + cntntNmCdNm), "cntntNm", "", "대륙 선택", "", ""); // 대륙 코드조회

}

function gfnFileTagAdd(obj) {
    obj.after('<input type="file" id="file_upload" name="file_upload" class="input_mid"/> '
        + '<input type="button" value="파일삭제" class="btn btn-black" onClick="javascript:gfnFileTagDel($(this));" />');
}

function gfnFileTagDel(obj) {
    obj.prev().remove();
    obj.remove();
}


function gfnDatePicker(selobjs, format) {
    selobjs.each(function () {
        let pickobj = $(this);
        if (pickobj.prop('type') == "text") {
            pickobj.datepicker({
                monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
                showOtherMonths: true,
                selectOtherMonths: true,
                showButtonPanel: false,
                changeYear: true,
                changeMonth: true,
                prevText: '이전',
                nextText: '다음',
                dateFormat: 'yy-mm-dd'
            });
        }
    });
}

$(function () {

    // 검색기간 체크
    if ($("#schStartDate").val() !== undefined && $("#schEndDate").val() !== undefined) {
        $("#schStartDate, #schEndDate").change(function () {
            var stdt = $("#schStartDate").val();
            var endt = $("#schEndDate").val();

            if (stdt !== '' && endt !== '') {
                var startDate = new Date(stdt);
                var endDate = new Date(endt);

                if (startDate > endDate) {
                    alert("검색 종료일이 검색 시작일보다 빠릅니다.\n\n다시 입력하세요.");
                    $("#schEndDate").val('');
                    $("#schEndDate").focus();
                }
            }
        });
    }
});

// 검색
$(function () {
    // 검색 버튼 클릭 이벤트 등록
    $("#btnHeadGfnSearch, #btnModalGfnSearch, #btnMainGfnSearch, #btnMainGfnSearch2nd").on("click", function () {
        var $form = $(this).closest("form");
        handleSearch($form);
    });

    // 검색 인풋에서 엔터 입력 시 해당 버튼 클릭 이벤트 발생
    $("#aiHeadSearchWord, #aiModalSearchWord, #aiMainSearchWord, #aiMainSearchWord2nd").on("keydown", function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            $(this).closest("form").find("button[type='button']").trigger("click");
        }
    });

    // 공통 검색 처리 함수
    function handleSearch($form) {
        var $visibleInput = $form.find("input[type='text']:not([name='aiSearchWord'])");
        var $hiddenInput = $form.find("input[name='aiSearchWord']");
        var keyword = $.trim($visibleInput.val());

        if (keyword === "") {
            alert("검색어를 입력해 주세요.");
            $visibleInput.focus();
            return false;
        }

        if (keyword.length < 2) {
            alert("두 글자 이상 입력해 주세요.");
            $visibleInput.focus();
            return false;
        }

        $hiddenInput.val(keyword); // hidden input에 입력값 복사
        $form.submit();
    }
});


/*********************************************************************
 * 카테고리 콤보 조회 함수
 *
 * 사용 : gfnCateComboList($("#"), "BOARD00002", "all", "전체", "1");
 * 입력 : selectObject, bbsId, 기본값사용시 value, 기본값사용시 text, 선택 할 value
 **********************************************************************/
function gfnVocCateComboList(selectObject, strBbsId, strValue, strText, strSelect) {
    $.ajax({
        url: gContextPath + "/common/vocListCate",
        data: "bbsId=" + strBbsId,
        success: function (data, textStatus, jqXHR) {
            selectObject.find("option").remove();

            if (strText != "" && strText != null) {
                selectObject.append($("<option>", {
                    value: strValue, text: strText
                }));
            }

            if (data != null) {
                $.each(data, function (i, item) {
                    selectObject.append($("<option>", {
                        value: item.ctgryNo, text: ConvertSystemSourcetoHtml(item.ctgryNm)
                    }));
                });
            }

            if (strSelect != "" && strSelect != null) {
                selectObject.val(strSelect);
            }
        }
    });
}