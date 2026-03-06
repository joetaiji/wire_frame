/*-------------------------------------------------
Common Javascript
Version : 1.0
author : park myeong-hee
-------------------------------------------------*/
$(window).scroll(function () {
    if ($(window).scrollTop() > 55) {
        $(".tow-column .tree_nav").addClass("fixed");
    } else {
        $(".tow-column .tree_nav").removeClass("fixed");
    }
});
$(function () {
    /* ▼ CMS 관리자 페이지 Layout 설정  */
    $(".toggle_nav").on("click", function () {
        if ($("#header, #side").hasClass("active")) {
            $("#header, #side").removeClass("active");
            setStorage("menuState", "", -1);
        } else {
            $("#header, #side").addClass("active");
            setStorage("menuState", "active", 7);
        }
    });


    const menuState = getStorage("menuState");
    if (menuState === "active") {
        $("#header").addClass("active");
        $("#side").addClass("active");
    }


    /* ▲ CMS 관리자 페이지 Layout 설정  */

    /* ▼ 페이지 툴팁 활성화  */
    /*$(".tooltipsy").tooltipsy({
        offset: [10, 0],
        css: {
            'padding': '10px',
            'max-width': '200px',
            'color': '#303030',
            'background-color': '#ffffff',
            'border': '2px solid #4893BA',
            '-moz-box-shadow': '0 0 10px rgba(0, 0, 0, .5)',
            '-webkit-box-shadow': '0 0 10px rgba(0, 0, 0, .5)',
            'box-shadow': '0 0 10px rgba(0, 0, 0, .5)',
            'text-shadow': 'none'
        }
    });*/
    /* ▲  페이지 툴팁 활성화  */
});
