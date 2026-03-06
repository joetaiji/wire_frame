/*-------------------------------------------------
title       : 모달팝업
Author      : ㅈㅁㅈ
Create date : 2024-10-25
-------------------------------------------------*/

$(function () {
    // 팝업 없으면 #modalpopup 삭제    
    if ($('#modalpopup .item').length == 0) { $('.modalpopup').remove(); } 
    else {
        // 팝업 있으면
        $('.modalpopup').classtoggle({'tabout': true, 'close': ''});

        if ($('.modalpopup .item').length > 2) {
            // 스와이퍼
            const modalpopup = new Swiper(".modalpopup .swiper",
            {
                autoplay:
                {
                    delay: 2500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                },
                wrapperClass: "list",
                slideClass: "item",
                slidesPerView: "auto",
                loop: true,
                navigation:
                {
                    nextEl: ".modalpopup .next",
                    prevEl: ".modalpopup .prev",
                },
                pagination:
                {
                    el: ".modalpopup .pager",
                    clickable: true,
                },
            });

            const modalpopupCount = new Swiper(".modalpopup .swiper",
            {
                wrapperClass: "list",
                slideClass: "item",
                slidesPerView: "auto",
                loop: true,
                //loopedSlides            : 1,
                pagination:
                {
                    el: ".modalpopup .count",
                    type: "fraction",
                },
            });

            modalpopup.controller.control = modalpopupCount;
            swiperOption('.modalpopup', modalpopup, '.open b');
        }
    }
});


$(function () {
    // 오늘 하루 열지 않음
    $(document).on('click', '.btnModalTodayClose', function () {
        $(".modalpopup").removeClass('active');
        setStorage("modalPopup", "done", 1);
    });

    // 닫기
    $(document).on('click', '.btnModalClose', function () {
        $(".modalpopup").removeClass('active');
    });
});