/*-------------------------------------------------
title       : 레이어팝업
Author      : PLAN I
Create date : 2025-03-04
-------------------------------------------------*/

$(function () {

    if (nPopupWindowCnt > 0) {
        $(".layerPop").show();
    } else {
        $(".layerPop").hide();
    }

    // 오늘 하루 열지 않음
    $(document).on('click', '.btnPopupWinodwChk', function () {
        var strPopupId = $(this).attr("popupId");
        $("#layerPop" + strPopupId).hide();
        setStorage("mainPopupId" + strPopupId, "done", 1);
        nPopupWindowCnt = nPopupWindowCnt - 1;

        if (nPopupWindowCnt == 0) {
            $(".layerPop").hide();
        }
    });

    // 닫기
    $(document).on('click', '.btnPopupWinodwClose', function () {
        var strPopupId = $(this).attr("popupId");
        $("#layerPop" + strPopupId).hide();
        nPopupWindowCnt = nPopupWindowCnt - 1;

        // 하루동안 열지 않음
        if ($(this).parents(".layerPop-area:first").find(":checked").length > 0) {
            setStorage("mainPopupId" + strPopupId, "done", 1);
        }

        // 모든 창 닫을 경우
        if (nPopupWindowCnt == 0) {
            $(".layerPop").hide();
        }
    });
});