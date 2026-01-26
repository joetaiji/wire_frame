var AC = "active",
    FX = "fixed",
    ALL = "all_nav",
    ScrollNo = 'scroll-no',
    srOnly = '.sr-only',
    OpenTxt = '열기',
    CloseTxt = '닫기',
    $html = $('html');


/*  mobile ------------------------------------------------------------------------------ */
function mobile() {
    return window.innerWidth < 1024 ? 1 : 0 //ipad pro는 넓어서 web화면이 나오게
}

/*  initial setup of accessibility ------------------------------------------------------- */
function accessInit(el) {
    $(el).attr('aria-expanded', 'false')
    //$(el).append('<span class="sr-only">' + OpenTxt + '</span>').attr('aria-expanded', 'false')
}

/* --------------------------------------------------------------------------------------
*   화면크기
----------------------------------------------------------------------------------------- */
function zoom(el) {
    const zoomLevels = [0.9, 1, 1.1, 1.2, 1.3],
        classNames = ['xsm', 'sm', 'md', 'lg', 'xlg'],
        $item = $(el);
    let zoom = 1;

    $html.on('click', el, function () {
        const $na = $(this);

        $na.attr('aria-selected', true).parent().addClass(AC).siblings().removeClass(AC).children().removeAttr('aria-selected')
        $.each(classNames, function (index, className) {
            if ($na.hasClass(className)) zoom = zoomLevels[index];
        });
        //초기화
        if ($na.hasClass('ico-reset')) {
            $html.css('zoom', 1);
            $item.eq(1).attr('aria-selected', true).parent().addClass(AC).siblings().removeClass(AC).children().removeAttr('aria-selected')
        }
        localStorage.setItem('zoomDefault', zoom);
        $html.css('zoom', zoom);
    })

    //로컬 저장
    zoom = localStorage.getItem('zoomDefault') || 1;
    $html.css('zoom', zoom);
    $.each(zoomLevels, function (index, zoomLevel) {
        if (zoom == zoomLevel) $item.eq(index).attr('aria-selected', true).parent().addClass(AC)
    })
}

/*  ---------------------------------------------------------------------------------------
*    gnb
----------------------------------------------------------------------------------------- */
function gnb(el) {
    const $gnb = $('#head_menu'),
        $depth1 = $gnb.find('>li>a:not(.linkWindow)');
    //$depth2 = $gnb.find('.submenu>ul>li>a:not(.linkWindow)');

    //초기셋팅 - 1차뎁스 접근성, 2차뎁스 첫번째 메뉴 활성
    //accessInit($depth2)
    $gnb.find('>li>a.active').attr('aria-current', 'page')
    //$('.subfirst').addClass(AC).find('>a').attr('aria-expanded', 'true')
    $('.submenu').removeAttr('style')


    $depth1.each(function () {
        const $na = $(this)

        //2차뎁스메뉴가 있는 경우 구분해서 처리
        if ($na.next('.submenu').length !== 0) {
            accessInit($na);
            $na.addClass('is-submenu');

            $na.next().prepend("<div class='depth1-go'></div>");
            $na.next().find('.depth1-go').prepend($na.clone()).find('a').removeAttr('aria-expanded');
            //$na.next().find('.depth1-go').prepend($na.clone()).addClass('ico-arr').find('a').removeAttr('aria-expanded');
        }

    })

    //1차뎁스(2차뎁스를 갖고 있는 경우) 클릭
    $('.topmenu > li > .is-submenu').on('click', function (e) {
        const $na = $(this)

        e.preventDefault()
        $html.addClass(AC)//배경 dim처리
        $na.attr('aria-expanded', 'true')
            .parent().addClass(AC).siblings().removeClass(AC)
            .children('.is-submenu').attr('aria-expanded', 'false')
        /* $na.parent().toggleClass(AC).hasClass(AC) ? $na.attr('aria-expanded', 'true').parent().add($html).addClass(AC) : $na.attr('aria-expanded', 'false').parent().add($html).removeClass(AC)
        $na.parent().siblings().removeClass(AC).find('>a:not(.linkWindow)').attr('aria-expanded', 'false') */
    })


    //의료개혁사이트 - 2차뎁스메뉴가 없어서 
    /* if (el != 'nodepth2') {
         $depth2.on('click', function (e) {
             const $na = $(this)
 
             e.preventDefault()
             $na.attr('aria-expanded', 'true').parent().addClass(AC).siblings().removeClass(AC).find('>a:not(.linkWindow)').attr('aria-expanded', 'false')
         })
 
        //2차뎁스 타이틀 생성
        $depth2.each(function () {
            if (!$(this).next().is("div")) $(this).after("<div></div>")
            $(this).next("div").prepend($(this).clone()).find('a').removeAttr('aria-expanded');
        })
    } else {
 
        $depth1.each(function () {
            $(this).next().prepend("<div class='depth1-go'></div>");
            $(this).next().find('.depth1-go').prepend($(this).clone()).addClass('ico-arr').find('a').removeAttr('aria-expanded');
        })
    } */


    //열린 메뉴 닫기
    function gnbClose() {
        $depth1.attr('aria-expanded', 'false').parent().add($html).removeClass(AC)
    }

    $html.on('click keyup', function (e) {
        if (!$(e.target).closest($gnb).length) gnbClose()
    })
    $(window).on('scroll', function () {
        gnbClose()
    }) //2차뎁스가 열린상태에서 스크롤시
}

/*  ---------------------------------------------------------------------------------------
*    mobileGnb
----------------------------------------------------------------------------------------- */
function mobileGnb() {
    const $mGnbWrap = $('.m-gnb-wrap'),
        $mGnb = $('.topmenu_all');

    $('.m-gnb-top-etc').prepend($('#header').find('.etc-ul').clone());
    $mGnb.children('li').eq(0).addClass(AC)
    $('#m-gnb-open').on('click', function (e) {
        if (mobile()) {
            $(this).add($mGnbWrap).toggleClass(AC)
            $html.addClass(ScrollNo)
            e.preventDefault();
        }
    })
    $mGnbWrap.on('click', '.ico-close', function () {
        $mGnbWrap.removeClass(AC)
        $html.removeClass(ScrollNo)
    })
    $mGnb.on('click', '>li>a', function (e) {
        e.preventDefault()
        $(this).parent().addClass(AC).siblings().removeClass(AC)
    })

    //모바일에서 Active 찾아서 활성화
    $mGnb.find('>li').each(function () {
        if ($(this).children().hasClass(AC)) {
            $(this).addClass(AC).siblings().removeClass(AC)
        }
        if ($(this).find('.submenu').length == 0) {
            const $submenuClone = $(this).clone();
            const $submenuWrap = $submenuClone.wrap('<div class="submenu"><ul></ul></div>').parent().parent();
            $(this).append($submenuWrap);
        }
    })

}

/*  -------------------------------------------------------------------------------------
*   snb
----------------------------------------------------------------------------------------- */
function snb() {
    const $snb = $('#snb');

    // snb 접근성 세팅
    $snb.find('#left_menu_top li>a').each(function () {
        const $na = $(this),
            $parent = $na.parent(),
            isActive = $parent.hasClass(AC);

        if (isActive) $na.attr('aria-current', 'page')
        if ($na.next('ul').length > 0) { //3차뎁스
            $na.attr('aria-expanded', isActive ? 'true' : 'false').removeAttr('aria-current')
            $parent.addClass('is-depth3')
        }
    });

    // 하위 3차뎁스를 갖고 있는 메뉴를 클릭했을때
    $snb.on('click', '.is-depth3>a', function (e) {
        const $na = $(this),
            $parent = $na.parent(),
            isActive = $parent.hasClass(AC);

        //e.preventDefault()
        if (!isActive) {
            $parent.addClass(AC).siblings().removeClass(AC)
            $('.is-depth3').find('>a').attr('aria-expanded', 'false')
            $na.attr('aria-expanded', 'true')
        }
    });
}

/*  -------------------------------------------------------------------------------------
*    tab메뉴 - 페이지가 전환되는 탭메뉴(ex. depth4, depth5)             tabs(this)
*    tab메뉴와 콘텐츠가 포함된 경우                                     tabs(this, "탭콘텐츠")
----------------------------------------------------------------------------------------- */
function tabs(el, cont) {
    const tabBtnNum = $(el).find('button, a').length
    $(el).addClass("num" + tabBtnNum + "")


    //탭콘텐츠 내에서 전환되는 경우
    if (cont) {
        //탭메뉴 접근성
        $(el).find('button, a').attr({ 'role': 'tab', 'aria-selected': 'false' });
        $(cont).attr('role', 'tabpanel');
        $(el).find('.active').attr('aria-selected', true);


        $(el).on("click", "a, button", function (e) {
            const $tabBtn = $(this);

            $(el).find('button, a').attr('aria-selected', false).removeClass(AC).find('i.sr-only').remove();
            $tabBtn.attr('aria-selected', true).addClass(AC);

            if ($(this).find('i.sr-only').length === 0) {
                $(this).append('<i class="sr-only">선택됨</i>');
            }

            $("#" + $tabBtn.attr('aria-controls')).addClass(AC).siblings().removeClass(AC);
            e.preventDefault();
        })
    } else {
        //탭메뉴 접근성
        $(el).find('li.active')
            .children('a, button').attr('aria-current', 'page')

        //탭메뉴(모바일)
        $(el).find('>ul>li>a, >ul>li>button').on("click", function (e) {
            if (mobile() && $(this).parent().hasClass(AC)) {
                e.preventDefault()
                $(this).parents(el).toggleClass(AC)
            }
        })
        //탭메뉴(모바일) : 벗어난 곳 클릭시 탭메뉴 닫히게
        $html.on('click', function (e) {
            if (!$(e.target).closest(el).length) $(el).removeClass(AC)
        })
    }
}

/*  -------------------------------------------------------------------------------------
*   리스트 열고 닫기			listOpen('.sns .sns_btn', 'target클래스명') 
----------------------------------------------------------------------------------------- */
function listOpen(el, target, noAnyClick) {
    accessInit(el);

    const $el = $(el);

    $html.on('click', el, function (e) {
        const $na = $(this),
            $elTarget = $na.closest(target),
            isActive = $elTarget.hasClass(AC)

        e.preventDefault()
        if (!isActive) $html.trigger('click')
        $elTarget.toggleClass(AC)
        $na.attr('aria-expanded', isActive ? 'false' : 'true')
            .find(srOnly).text(isActive ? OpenTxt : CloseTxt)
    })
    if (!noAnyClick) {
        $html.on('click', function (e) {
            if (!$(e.target).closest(target).length) {
                $(target).removeClass(AC)
                    .find(el).attr('aria-expanded', 'false')
                    .find(srOnly).text(OpenTxt)
            }
        })
    }
    $(target).on('click', '.btn-close', function (e) {
        $(this).closest(target).find($el).trigger('click');
    })
}

/* --------------------------------------------------------------------------------------
*   아코디언 - details로 수정( ※name속성을 W3C Validation에서 오류로 인식하기 때문에 data-name으로 그룹설정)
----------------------------------------------------------------------------------------- */
function accordion(el) {
    const $el = $(el)

    //전체 details 스캔해서 open 되어 있는거에 active지정
    $el.children('details').each(function () {
        $(this).attr('open') ? $(this).addClass(AC).find('summary i').append('<span class="sr-only">' + CloseTxt + '</span>') : $(this).removeClass(AC).find('summary i').append('<span class="sr-only">' + OpenTxt + '</span>')
    })

    //summary클릭했을때
    $el.on('click', 'summary', function () {
        const $details = $(this).parent('details'),
            isOpen = $details.attr('open'),
            $accordion = $(this).parents(el),
            $btnAll = $accordion.find('.btn-all');

        $details.toggleClass(AC, !isOpen).find("summary i .sr-only").text(!isOpen ? CloseTxt : OpenTxt)

        //details가 열리면? 전체버튼 닫기 : 열기
        $accordion.children('details').hasClass(AC) ? $btnAll.addClass(AC).find("span").text(CloseTxt) : $btnAll.removeClass(AC).find("span").text(OpenTxt)
    })

    //전체 버튼 클릭했을때
    $el.on('click', '.btn-all', function () {
        $(this).hasClass(AC) ? $(this).parents(el).find('details.active summary').trigger('click') : $(this).parents(el).find('summary').trigger('click');
    })
}

/* --------------------------------------------------------------------------------------
*   top 고정               goTop()
----------------------------------------------------------------------------------------- */
function goTop() {
    var $goTop = $(".btn_go_top");
    $(window).on("load scroll", function () {
        var scrollT = $(window).scrollTop()
        scrollT > 0 ? $goTop.addClass(FX) : $goTop.removeClass(FX)
        if (!mobile()) {
            var $sideRightUtil = $goTop.parent(".side_right_util");
            scrollT > $footer.offset().top - $(window).height() ? $sideRightUtil.addClass("stick") : $sideRightUtil.removeClass("stick")
        }
    })
    $goTop.on("click", function () {
        $("html,body").stop().animate({ scrollTop: 0 }, 800)
    })
}


/*  -------------------------------------------------------------------------------------
*   팝업 또는 레이어 열고 닫기
----------------------------------------------------------------------------------------- */
let $clickSpot;

function layerPopup(el) {
    //accessInit(el);
    const OL = 'opened-layer';

    $(el).on('click', function (e) {
        e.preventDefault();

        $clickSpot = $(this);
        const isActive = $clickSpot.hasClass(AC);

        $clickSpot.toggleClass(AC).attr('aria-expanded', isActive ? 'false' : 'true')
        $('#' + $(this).data('id')).attr('tabindex', 0).fadeIn(300).focus().addClass(OL);
        $html.addClass(ScrollNo);
    })

    $html.on('click', '.opened-layer .popup-close', function (e) {
        e.preventDefault();
        $(this).closest('.opened-layer').removeAttr('tabindex').fadeOut(100).removeClass(OL);
        $html.removeClass(ScrollNo);
        $clickSpot.focus().removeClass(AC).attr('aria-expanded', 'false');
    })
    $html.on('keydown', '.opened-layer .popup-close', function (e) {
        if (e.keyCode == 9) $(this).closest('.opened-layer').focus();
    })
}

/* --------------------------------------------------------------------------------------
*   공통 - header 고정 & top버튼 고정
----------------------------------------------------------------------------------------- */

let lastScroll;

$(window).on('load scroll', function () {

    const $fixedItem = $('header');

    if ($(window).scrollTop() > 110) {
        let scrollT = $(this).scrollTop();
        scrollT > lastScroll ? $fixedItem.addClass(FX) : $fixedItem.removeClass(FX);
        lastScroll = scrollT;
    }

    //top버튼
    $(window).scrollTop() > 0 ? $('.go-top').addClass(FX) : $('.go-top').removeClass(FX)
});


/* --------------------------------------------------------------------------------------
*   페이지내 탐색 생성
----------------------------------------------------------------------------------------- */
function inPageNav(el) {

    const $pageTit = $(el);

    /* 콘텐츠 내 탐색 메뉴 생성 - 페이지타이틀을 수집해서 생성 */
    if ($pageTit.length > 1) {

        $('.contents').prepend(
            `<div class="in-page-navigation-area">
                <div class="in-page-navigation-header">
                    <p class="quick-caption">이 페이지의 구성</p>
                    <p class="quick-title">${$('.h-tit').text()}</p>
                </div>
                <nav class="in-page-navigation-list">
                    <ul></ul>
                </nav>
            </div>`
        );

        $pageTit.each(function (index) {
            const $pageNav = $(this).text();
            $(this).attr('id', 'anchor-page-' + index); //id부여
            $('.in-page-navigation-list ul').append(
                `<li>
                    <a href="#anchor-page-${index}" data-anchor="anchor-page-${index}">${$pageNav}</a>
                </li>`
            );
        });


    }

    const $navList = $('.in-page-navigation-list ul');
    $navList.find('li:first a').add($pageTit.eq(0)).addClass(AC);//첫번째 메뉴 활성화


    $(window).on('load scroll', function () {

        if ($(window).scrollTop() > 110) {

            //let lastScroll;
            let scrollT = $(this).scrollTop();

            //스크롤에 따른 페이지 타이틀 활성화
            $pageTit.each(function () {
                const $na = $(this);
                const pageTitTop = $na.offset().top;
                const isDown = scrollT > lastScroll;

                if (isDown && pageTitTop - 45 < scrollT) { //down scroll 
                    $pageTit.removeClass('active up');
                    $na.addClass(AC);
                } else if (!isDown && pageTitTop - 210 < scrollT) { //up scroll 
                    $pageTit.addClass('up').removeClass(AC)
                    $na.addClass(AC);
                }
            });

            lastScroll = scrollT;

            //탐색 메뉴 활성화 및 뱡향 클래스 지정
            const activeId = $pageTit.filter('.active').attr('id');
            $navList.find('li').each(function () {
                const $link = $(this).find('a');
                const anchor = $link.data('anchor');
                $link.removeClass('up down');

                if (anchor == activeId) {
                    $link.addClass(AC).parent().siblings('li').find('a').removeClass(AC);
                } else {
                    $link.removeClass(AC).addClass(anchor > activeId ? 'down' : 'up');
                }
            });

            //마지막 콘텐츠타이틀에 다다르기 전에 스크롤이 다 내려갔을 경우
            if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
                $navList.find('li:last a').addClass(AC).parent().siblings('li').find('a').removeClass(AC).addClass('up');
            }
        }

        //탐색 메뉴 클릭
        $navList.find('a').on('click', function () {
            $pageTit.toggleClass('up', $(this).hasClass('up'));
        });

    });


}





