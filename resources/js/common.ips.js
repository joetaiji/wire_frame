/*-------------------------------------------------
Common Javascript
관리자페이지 js
Version : 1.0
author : mcahn
create date : 2017. 05. 01.
create date : 2017. 05. 01.
-------------------------------------------------*/


/*********************************************************************
 * 사이트 콤보 조회 함수
 *
 * 사용 : gfnSiteComboList($("#siteId"), "all", "전체", "SITE00001");
 * 입력 : selectObject, 기본값사용시 value, 기본값사용시 text, 선택 할 value, 관리자사이트(SITE00001)제외 true(미입력 시 포함)
 ***********************************************************************************************************************/
function gfnSiteComboList(selectObject, strValue, strText, strSelect, excludeAdminSite) {
    $.ajax({
        url: gContextPath + "/mgr/listSite",
        success: function (data, textStatus, jqXHR) {
            selectObject.find("option").remove();

            if (strText != "" && strText != null) {
                selectObject.append($("<option>", {
                    value: strValue, text: strText
                }));
            }

            if (data != null) {
                $.each(data, function (i, item) {
                    if (excludeAdminSite && item.siteId === 'SITE00001') {
                        return;
                    }
                    selectObject.append($("<option>", {
                        value: item.siteId, text: ConvertSystemSourcetoHtml(item.ttl)
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
 * 사이트 콤보 조회 함수
 *
 * 사용 : gfnSiteKeyComboList($("#siteId"), "all", "전체", "SITE00001");
 * 입력 : selectObject, 기본값사용시 value, 기본값사용시 text, 선택 할 value
 **********************************************************************/
function gfnSiteKeyComboList(selectObject, strValue, strText, strSelect) {
    $.ajax({
        url: gContextPath + "/mgr/listSite",
        success: function (data, textStatus, jqXHR) {
            selectObject.find("option").remove();

            if (strText != "" && strText != null) {
                selectObject.append($("<option>", {
                    value: strValue, text: strText
                }));
            }

            if (data != null) {
                $.each(data, function (i, item) {
                    if (item.siteKey != "ips") {
                        selectObject.append($("<option>", {
                            value: item.siteKey, text: ConvertSystemSourcetoHtml(item.ttl)
                        }));
                    }
                });
            }

            if (strSelect != "" && strSelect != null) {
                selectObject.val(strSelect);
            }
        }
    });
}

/***********************************************************************************************************************
 * 사이트 콤보 조회 함수 - 권한이 있는 사이트만 조회
 *
 * 사용 : gfnSiteAdminComboList($("#siteId"), "all", "전체", "SITE00001");
 * 입력 : selectObject, 기본값사용시 value, 기본값사용시 text, 선택 할 value, 관리자사이트(SITE00001)제외 true(미입력 시 포함)
 ************************************************************************************************************************/
function gfnSiteAdminComboList(selectObject, strValue, strText, strSelect, excludeAdminSite) {
    $.ajax({
        url: gContextPath + "/mgr/listAdminSite",
        success: function (data, textStatus, jqXHR) {
            selectObject.find("option").remove();

            if (strText != "" && strText != null) {
                selectObject.append($("<option>", {
                    value: strValue, text: strText
                }));
            }

            if (data != null) {
                $.each(data, function (i, item) {
                    if (excludeAdminSite && item.siteId === 'SITE00001') {
                        return;
                    }
                    selectObject.append($("<option>", {
                        value: item.siteId, text: ConvertSystemSourcetoHtml(item.ttl)
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
 * 그룹 콤보 조회 함수
 *
 * 사용 : gfnGroupComboList($("#groupId"), "", "그룹 선택", "GROUP00001");
 * 입력 : selectObject, 기본값사용시 value, 기본값사용시 text, 선택 할 value
 **********************************************************************/
function gfnGroupComboList(selectObject, strValue, strText, strSelect) {
    $.ajax({
        url: gContextPath + "/mgr/listGroup",
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
                        value: item.groupId, text: ConvertSystemSourcetoHtml(item.ttl)
                    }));
                });
            }

            if (strSelect != "" && strSelect != null) {
                selectObject.val(strSelect);
            }
        }
    });
}


/**************************************************************************************************************
 * 회원정보조회 팝업
 *
 * 사용 : gfnMemberPopupList("seCdType", "outDataForm", "type")
 * 입력 : 회원구분[T : 전체, P : 개인회원, C : 기업회원, K : 내부직원], 전달받을 데이터형태['all'/'id'], 받을건수 형태 ['S'/'M']
 **************************************************************************************************************/
function gfnMemberPopupList(seCdType, outDataForm, type) {

    //회원조회 팝업
    window.open(gContextPath + "/mgr/listMemberPopup?seCd=" + seCdType + "&outDataForm=" + outDataForm + "&type=" + type + "&schKind=" + seCdType, "회원정보", "scrollbars=yes, width=800, height=700");
}


/**************************************************************************************************************
 * 조직도-직원정보조회 팝업
 *
 * 사용 : gfnOrgStaffPopupList("siteId", "outDataForm", "type")
 * 입력 : 사이트아이디, 전달받을 데이터형태['all'/'id'], 받을건수 형태 ['S'/'M']
 **************************************************************************************************************/
function gfnOrgStaffPopupList(siteId, outDataForm, type) {

    //직원정보조회 팝업
    window.open(gContextPath + "/mgr/listOrgStaffPopup?siteId=" + siteId + "&outDataForm=" + outDataForm + "&type=" + type, "직원정보", "scrollbars=yes, width=1000, height=600");
}


/**************************************************************************************************************
 * 회원정보조회 팝업 멀티출력
 *
 * 사용 : gfnMemberPopupMultiList("seCdType", "outDataForm", "type")
 * 입력 : 회원구분[T : 전체, P : 개인회원, C : 기업회원, K : 내부직원], 전달받을 데이터형태['all'/'id'], 받을건수 형태 ['S'/'M'], parentInputId
 **************************************************************************************************************/
function gfnMemberPopupMultiList(seCdType, outDataForm, type, parentInputId) {

    //회원조회 팝업
    window.open(gContextPath + "/mgr/listMemberPopup?seCd=" + seCdType + "&outDataForm=" + outDataForm + "&type=" + type + "&parentInputId=" + parentInputId + "&schKind=" + seCdType, "회원정보", "scrollbars=yes, width=700, height=500");
}



/**************************************************************************************************************
 * 통합VOC 담당자 조회 팝업 멀티출력
 *
 * 사용 : gfnMemberPopupMultiList("seCdType", "outDataForm", "type")
 * 입력 : 회원구분[T : 전체, P : 개인회원, C : 기업회원, K : 내부직원], 전달받을 데이터형태['all'/'id'], 받을건수 형태 ['S'/'M'], parentInputId, parentInputName
 **************************************************************************************************************/
function gfnVocMemberPopupMultiList(seCdType, outDataForm, type, parentInputId, parentInputName) {

    //회원조회 팝업
    window.open(gContextPath + "/mgr/listMemberPopup?seCd=" + seCdType + "&outDataForm=" + outDataForm + "&type=" + type + "&parentInputId=" + parentInputId + "&parentInputName=" + parentInputName + "&schKind=" + seCdType, "회원정보", "scrollbars=yes, width=700, height=500");
}

/**************************************************************************************************************
 * 이미지풀조회 팝업
 *
 * 사용 : gfnImagePoolPopupList("keyword")
 * 입력 :
 **************************************************************************************************************/
function gfnImagePoolPopupList(kywdNm01) {

    //회원조회 팝업
    window.open(gContextPath + "/mgr/listImagePoolPopup?menuId=MENU01301&=schType=0&schText=" + kywdNm01, "이미지풀정보", "scrollbars=no, width=700, height=570");
    //[운영메뉴ID:MENU01301] MENU01212
}

/**************************************************************************************************************
 * Editor 팝업
 *
 * 사용 : gfnEditorPopup("opener")
 * 입력 :
 **************************************************************************************************************/
function gfnEditorPopup(eId) {
    //Editor 팝업
    window.open(gContextPath + "/mgr/editorPopup?editorId=" + eId, "Editor", "scrollbars=no, width=800, height=840");
}


/*********************************************************************
 * 키워드 호출
 *
 * 사용 : gfnOpenLogin();
 * 입력 :
 **********************************************************************/
function gfnKeywordSearch(strMenuId) {
    var strStyle = "scrollbars=yes";
    var strUrl = "/mgr/contentMgr/selectKeywordSearchPopup?menuId=" + strMenuId;

    gfnOpenWin(strUrl, "키워드검색", strStyle, 750, 710);

}