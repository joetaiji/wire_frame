import { snb, tabs, inPageNav, accordion, listOpen, mobile } from 'modules/index.js';

$(function () {
    snb();

    tabs("#snb .list");

    //tab 2차뎁스
    const $tabDpth2 = $('.head_menu_depth>li>ul');
    $tabDpth2.wrap('<div class="tabs depth2-tab"></div>');

    tabs(".depth2-tab");
    inPageNav(".title-2");

    accordion(".accordion");


    //통합검색-고급검색
    tabs(".total-search-cont .tabs");
    listOpen('.sch-etc .ico-sch1', '.sch-etc', true)

    //모바일에서 원본이미지보기
    if (mobile()) {
        $('.img-zoom').each(function () {
            const imgSrc = $(this).find('img').attr('src')
            $(this).append('<a href="' + imgSrc + '" target="_blank" title="이미지 새창열기" class="btn-zoom"></a>')
        })
    }

});

