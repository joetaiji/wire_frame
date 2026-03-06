import { zoom, listOpen, layerPopup, gnb, mobileGnb, headerFixed } from '../modules/index.js';

// 헤더 고정 초기화
headerFixed();

$(function () {

    $('a[target="_blank"]').attr('title', '새창으로 열림')

    zoom('.zoom-drop .drop-menu button') //화면크기조정
    listOpen('.drop-btn', '.drop-wrap') //drop메뉴

    $('#head_menu').clone().appendTo('#popSiteMap .popup-body');//사이트맵 메뉴복제
    layerPopup('.header .btn-navi') 	//통합검색, 전체메뉴

    gnb()	//gnb메뉴

    //mobileGnb()	//모바일 gnb메뉴

});

