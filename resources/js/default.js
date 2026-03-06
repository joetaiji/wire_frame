/*-------------------------------------------------
title       : 공통
Author      : ㅈㅁㅈ
Create date : 2024-10-25
-------------------------------------------------*/

$(function () {
    const currentUrl = window.location.href;

    // og:url 메타 태그 업데이트
    const ogUrlMetaTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlMetaTag) {
        ogUrlMetaTag.setAttribute('content', currentUrl);
    }

    // 서브페이지 공유하기
    // =================================================================================================================
    $('#utile .share').classtoggle({'button': '.open'});

    Kakao.init(""); // 발급받은 JavaScript 키 입력

    // 인쇄 (반응형 스타일 삭제)
    // ================================================ =================================================================
    //$('#contents .print').on('click', function() {window.print();});
    window.onbeforeprint = function () {
        $('link[href*="_respond.css"]').remove();
    };
    window.onafterprint = function () {
        location.reload();
    };

    // 비밀번호 보기
    // =================================================================================================================
    $('.form_password button, .krds-input[type="password"] + button.krds-btn.medium.icon').on('click', function () {
        if ($(this).hasClass('active') == false) {
            $(this).addClass('active');
            $(this).siblings('input[type="password"]').attr('type', 'text');
        } else {
            $(this).removeClass('active');
            $(this).siblings('input[type="text"]').attr('type', 'password');
        }
    });

    // krds-pagination
    // =================================================================================================================
    /* if (document.querySelectorAll('.board_pager')) {
        document.querySelectorAll('.board_pager span').forEach(function (span) {
            span.classList.add('page-links');
        });
        document.querySelectorAll('.board_pager span a').forEach(function (anchor) {
            anchor.classList.add('page-link');
        });
        document.querySelectorAll('.board_pager .first img, .board_pager .last img').forEach(function (img) {
            img.remove();
        });

        var firstLink = document.querySelector('.board_pager .first');
        var lastLink = document.querySelector('.board_pager .last');

        if (firstLink && lastLink) {
            var firstPageNum = new URLSearchParams(firstLink.getAttribute('href')).get('pageNum');
            var lastPageNum = new URLSearchParams(lastLink.getAttribute('href')).get('pageNum');
            var firstSpan = document.querySelector('.board_pager span a:first-child');
            var lastSpan = document.querySelector('.board_pager span a:last-child');

            if (firstSpan.textContent == firstPageNum) {
                firstLink.remove();
            } else {
                firstLink.textContent = firstPageNum;
                document.querySelector('.board_pager span.page-links').prepend(firstLink);
                firstLink.insertAdjacentHTML('afterend', '<span class="page-link link-dot"></span>');
            }

            if (lastSpan.textContent == lastPageNum) {
                lastLink.remove();
            } else {
                lastLink.textContent = lastPageNum;
                document.querySelector('.board_pager span.page-links').append(lastLink);
                lastLink.insertAdjacentHTML('beforebegin', '<span class="page-link link-dot"></span>');
            }
        }

        document.querySelectorAll('.board_pager').forEach(function (element) {
            element.classList.add('krds-pagination');
            element.classList.remove('board_pager');
        });
    } */

    // 게시판 내용의 추가필드
    // =================================================================================================================
    if ($('.community-page-title.line').length > 1) {
        $('.community-page-title.line').each(function (i) {
            if ($(this).find('*').length == 0) {
                $(this).remove();
            }
        });
    }

    // 게시판 갤러리
    // =================================================================================================================
    const gallery = new Swiper(".board_gallery .viewer .swiper", {
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        wrapperClass: "list",
        slideClass: "list>li",
        loop: false,
        navigation: {
            nextEl: ".board_gallery .viewer .swiper-button-next",
            prevEl: ".board_gallery .viewer .swiper-button-prev",
        },
        pagination: {
            el: ".board_gallery .viewer .swiper-pagination",
            clickable: true,
        }
    });

    const galleryCount = new Swiper(".board_gallery .viewer .swiper", {
        wrapperClass: "list",
        slideClass: "list>li",
        loop: false,
        pagination: {
            el: ".board_gallery .viewer .count",
            type: "fraction",
        }
    });

    gallery.controller.control = galleryCount;
    swiperOption('.board_gallery .viewer', gallery, '.open b');

    // 썸네일 4개 이상일 때
    if ($('.board_gallery .thumb .list > li').length > 4) {
        const galleryThumb = new Swiper(".board_gallery .thumb .swiper", {
            wrapperClass: "list",
            slideClass: "list>li",
            loop: false,
            slidesPerView: "auto",
            navigation: {
                nextEl: ".board_gallery .thumb .swiper-button-next",
                prevEl: ".board_gallery .thumb .swiper-button-prev",
            },
        });

        gallery.on('slideChange', function () {
            galleryThumb.slideTo(gallery.realIndex);
        });
    }

    // 슬라이드 변경될 때 썸네일도 변경
    gallery.on('slideChange', function () {
        $('.board_gallery .thumb .list > li').removeClass('active');
        $('.board_gallery .thumb .list > li').eq(gallery.realIndex).addClass('active');
    });

    // 썸네일 클릭할 때 상단 슬라이드 변경
    $('.board_gallery .thumb .list button').on('click', function () {
        gallery.slideTo($(this).parent().index());
    });
});

// 서브 페이지 공유하기
// =================================================================================================================
function fn_facebook_link() {
    const url = window.location.href;
    window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank',
        'width=1000,height=600'
    );
}

function fn_twitter_link() {
    const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || document.title;
    const url = window.location.href;
    const tweet = `${title}\n${url}`;
    window.open(
        `https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`,
        '_blank',
        'width=1000,height=600'
    );
}

function fn_blog_link() {
    const title = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || document.title;
    const url = window.location.href;
    const description = document.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

    // 네이버 블로그 공유 URL
    const blogUrl = `https://blog.naver.com/openapi/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(description)}`;

    window.open(
        blogUrl,
        '_blank',
        'width=1000,height=600'
    );
}

function fn_kakao_link() {
    // Kakao.init 에 발급받은 JavaScript 키 입력하기
    Kakao.Share.sendDefault({
        objectType: "feed", // 피드 형식
        content: {
            title: document.querySelector('meta[property="og:title"]').getAttribute('content'), // 공유 제목
            description: document.querySelector('meta[property="og:description"]').getAttribute('content'), // 설명
            imageUrl: gContextPath + "/template/mps/img/layout/logo.png", // 미리보기 이미지
            link: {
                mobileWebUrl: window.location.href, // 모바일 웹 링크
                webUrl: window.location.href // PC 웹 링크
            }
        },
        buttons: [{
            title: "웹사이트 방문하기",
            link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href
            }
        }]
    });
}

function fn_copy_link() {
    const url = window.location.href;
    if (!url) {
        alert("복사될 URL 주소가 없습니다.");
        return;
    }
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url)
            .then(() => alert("URL 주소가 복사되었습니다."))
            .catch(() => alert("URL 복사에 실패했습니다. 브라우저 설정을 확인해주세요."));
    } else {
        // 구형 브라우저 fallback
        const temp = document.createElement("input");
        document.body.appendChild(temp);
        temp.value = url;
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
        alert("URL 주소가 복사되었습니다.");
    }
}

// 스와이퍼 재생정지
// target : 선택자, swiper : 스와이퍼 이름, count : 슬라이더 총 갯수 나올 요소
// =================================================================================================================
function swiperOption(target, swiper, count) {
    if (count != false) {
        $(target).find(count).text($(target).find('.item').length - $(target).find('.item.swiper-slide-duplicate').length);
    }

    $(target).find('.play').hide();

    // 재생정지
    $(target).find('.play, .stop').on('click', function () {
        if ($(this).hasClass('play') == true) {
            swiperPlay();
        } else {
            swiperStop();
        }
    });

    // 재생
    function swiperPlay() {
        swiper.autoplay.start();
        $(target).find('[id*="swiper-wrapper"]').attr('aria-live', 'polite');

        $(target).find('.play').hide();
        $(target).find('.stop').show();
    }

    // 정지
    function swiperStop() {
        swiper.autoplay.stop();
        $(target).find('[id*="swiper-wrapper"]').attr('aria-live', 'off');

        $(target).find('.stop').hide();
        $(target).find('.play').show();
    }

    // 현재 슬라이드 안내
    $(target).find('.swiper-initialized > *:first').before($(target).find('.swiper-notification').last());

    // 가려진 슬라이드 요소 접근 방지 
    swiper.on('slideChange', function () {
        $(target).find('.swiper-notification').text('슬라이드가 ' + (swiper.realIndex + 1) + '번째로 변경되었습니다.');

        // 슬라이더가 한개씩만 나올 때
        if ($(target).find('[role="group"]').width() == $(target).width()) {
            swiper.slides.forEach((slide, index) => {
                if (index === swiper.activeIndex) {
                    slide.removeAttribute('inert');
                } else {
                    slide.setAttribute('inert', '');
                }
            });
        }
    });

    // 페이저, 이전 다음버튼 클릭 시 해당 슬라이드로 초점
    $(target).find('.swiper-pagination-bullet, button[aria-label="Previous slide"], button[aria-label="Next slide"]').on('click', function () {
        swiperStop();

        $(this).on('keydown', function (e) {
            if (e.keyCode === 9) {
                if ($(target).find('[role="group"]').width() == $(target).width()) {
                    if (target == '.topbanner' || target == '.board_gallery .viewer') {
                        setTimeout(function () {
                            $(target).find('[role="group"]').eq(swiper.activeIndex).removeAttr('inert').attr('tabindex', '0').focus();
                        }, 1);
                    } else {
                        $(target).find('[role="group"]').eq(swiper.activeIndex).removeAttr('inert').attr('tabindex', '0').focus();
                    }
                } else {
                    $(target).find('[role="group"]').eq(swiper.activeIndex - 1).removeAttr('inert').attr('tabindex', '0').focus();
                }

                $(this).off('keydown');
                $(target).find('[role="group"]').removeAttr('tabindex');
            }
        });
    });
}

// 클래스토글 
// =================================================================================================================
$.fn.classtoggle = function (options) {
    var settings = $.extend
    ({
        'button': '.open',      // 이벤트 받을 타겟 선택
        'action': 'click',      // 액션 선택 (click | over)
        'classname': 'active',     // 추가할 클래스명
        'accordion': false,		// active 될 때 형제요소의 반응 여부
        'latest': false,        // 탭으로 사용할 때 활성화 된 요소 누르면 비활성화 되는 부분 방지
        'respond': false,        // 반응형일 때 (true 시 반응형일때 가로 사이즈 이하에서만 / click 일때만)
        'respondWidth': '768',        // 반응형 가로 사이즈
        'close': '.close',     // 닫기 버튼이 별도로 존재하는 경우 (닫기 버튼은 클릭시에만)
        'today': '.close2',    // 오늘 하루 그만 보기(버튼 없을 때는 공란으로)
        'tabout': false         // 탭 아웃 시 클래스 삭제 여부

    }, options);

    return this.each(function () {
        var $selecter = $(this);

        function clickActive() {
            if ($selecter.find(settings.button).next('*').length > 0) {
                if ($selecter.hasClass(settings.classname) == false) {
                    toggleOpen();
                } else {
                    // 닫기 버튼 존재할 경우, 탭으로 사용할 때 토글되지 않음
                    if (settings.latest == false) {
                        toggleClose();
                    }
                }
            }
        }

        // 열기
        function toggleOpen() {
            $selecter.addClass(settings.classname);
            $selecter.find(settings.button).attr('aria-expanded', 'true');

            if (settings.accordion == true) {
                $selecter.siblings().find(settings.button).attr('aria-expanded', 'false');
                $selecter.siblings().removeClass(settings.classname);
            }

            if ($selecter.find(settings.close).length > 0) {
                $selecter.find(settings.button).removeAttr('inert');
            }
        }

        // 닫기
        function toggleClose() {
            $selecter.removeClass(settings.classname);
            $selecter.find(settings.button).attr('aria-expanded', 'false').removeAttr('inert');
        }

        if (settings.action == 'click') {
            $selecter.find(settings.button).on(settings.action, function () {
                if (settings.respond == false) {
                    clickActive();
                    return false;
                } else {
                    if ($(window).width() <= settings.respondWidth) {
                        clickActive();
                        return false;
                    } else {
                        $selecter.find(settings.button).off();
                    }
                }
            });
        } else {
            $selecter.find(settings.button).on
            ({
                mouseenter: function () {
                    toggleOpen();
                },
                focusin: function () {
                    toggleOpen();
                },
                mouseleave: function () {
                    toggleClose();
                },
                focusout: function () {
                    toggleClose();
                }
            });
        }

        // 닫기 버튼이 별도로 존재하는 경우
        if ($selecter.find(settings.close).length > 0) {
            $selecter.find(settings.close).on('click', function () {
                toggleClose();
                return false;
            });
        }

        // 오늘 하루 그만 보기
        //if ( settings.today !== '' ) { todayClose($selecter, $selecter.attr('class'), 'type1', settings.today); }

        // 탭 아웃 시 클래스 삭제 여부
        if (settings.latest == false) {
            if (settings.tabout == true) {
                // 탭
                $selecter.find('a, button').last().keydown(function (e) {
                    if (e.keyCode === 9) {
                        toggleClose();
                    }
                });

                // 역탭
                $selecter.find('a, button').first().keydown(function (e) {
                    if (e.keyCode === 9 && e.shiftKey) {
                        toggleClose();
                    }
                });
            }
        }
    });
};

// 주메뉴
// =================================================================================================================
$.fn.gnb = function (options) {
    var settings = $.extend
    ({
        'actionType': 'mouseenter focusin',     // 메뉴가 동작하는 액션 (mouseenter focusin, click)
        'target': '#krds-header',           // 활성화 시 클래스가 추가되는 요소 (공란일 경우 오버되는 a 링크 부모 li에만 클래스 추가됨)
        'class': 'active',                 // 추가할 클래스명 (target에 추가됨)
        'depth2': '.gnb-toggle-wrap',       // 서브메뉴
        'closeBtn': '.close'                  // 닫기 버튼이 별도로 존재하는 경우 (닫기 버튼은 클릭시에만)

    }, options);

    return this.each(function () {
        var $selecter = $(this);

        // 버튼을 링크로 변경
        document.querySelectorAll('.gnb-main-trigger').forEach(function (button) {
            const parent = button.parentElement;
            const aTag = parent && parent.querySelector('a');
            if (!aTag) return;

            const link = document.createElement('a');
            link.href = aTag.getAttribute('href');
            link.className = button.className;

            while (button.firstChild) {
                link.appendChild(button.firstChild);
            }

            button.replaceWith(link);
        });

        // 3뎁스 없을 때 aria 속성 삭제
        setTimeout(function () {
            $selecter.find('.depth2 > li > a').each(function (i) {
                if ($(this).next('.gnb-sub-list').find('.depth3').length == 0) {
                    $(this).removeAttr('aria-expanded').removeAttr('aria-haspopup');
                }
            });

        }, 100);

        let resetTimeout = null;

        $selecter.find('.gnb-main-trigger').on(settings.actionType, function () {
            // 마우스 아웃 후 다시 오버 시 서브메뉴가 안 나오는 문제 수정
            // resetTimeout이 있으면 초기화 취소
            if (resetTimeout) {
                clearTimeout(resetTimeout);
                resetTimeout = null;
            }

            $selecter.find('.gnb-main-trigger').removeClass('active');
            $(this).addClass('active');
            $(settings.depth2).removeClass('is-open');
            $(this).next(settings.depth2).addClass('is-open');
            $('.gnb-backdrop').addClass('active');

            // 서브메뉴 있을 때
            if ($(this).next('*').length > 0) {
                if ($(this).hasClass('active') == false) {
                    $selecter.attr('aria-expanded', 'false');
                    $(this).attr('aria-expanded', 'true');
                }
            }

            if (settings.target != '') {
                $(settings.target).addClass(settings.class);

                // 전체가 보일 때
                setTimeout(function () {
                    $selecter.find(settings.depth2).each(function (i) {
                        if ($(this).css('visibility') == 'visible') {
                            $(this).prev('a, button').attr('aria-expanded', 'true');
                        }
                    });

                }, 10);
            }
        });

        // 서브메뉴 onclick 초기화
        document.querySelectorAll('.gnb-sub-trigger').forEach(function (el) {
            el.removeAttribute('onclick');
        });

        $selecter.find('.gnb-sub-trigger').on(settings.actionType, function () {
            // 서브메뉴 있을 때
            if ($(this).next('*').length > 0) {
                if ($(this).hasClass('active') == false) {
                    $selecter.find('.gnb-sub-trigger').removeClass('active').attr('aria-expanded', 'false');
                    $(this).addClass('active').attr('aria-expanded', 'true');

                    $('.gnb-sub-list').removeClass('active');
                    $(this).next('.gnb-sub-list').addClass('active');
                }
            }

            $selecter.find('.gnb-toggle-wrap, .gnb-main-trigger').removeClass('is-open').removeClass('active');
            $(this).parents('.gnb-toggle-wrap').addClass('is-open');
            $(this).parents('.gnb-toggle-wrap').siblings('.gnb-main-trigger').addClass('active');
        });

        // 아웃될 때 초기화
        function reset() {
            $selecter.find('a, button').removeClass('is-open active').attr('aria-expanded', 'false');
            $(settings.depth2).removeClass('is-open');
            $('.gnb-backdrop').removeClass('active');

            if (settings.target != '') {
                $(settings.target).removeClass(settings.class);
            }
        }

        if ($selecter.find(settings.closeBtn).length == 1) {
            $selecter.find(settings.closeBtn).on('click', function () {
                reset();
                return false;
            });
        } else {
            // 마우스가 메뉴 밖으로 나갔을 때만 reset, 다시 오버하면 reset 취소
            $(document).on('mousemove', function (e) {
                let cursorY = e.pageY;

                var $active = $selecter.find('button.active, a.active');
                var $nextDepth2 = $active.next(settings.depth2);

                if ($active.length > 0 && $nextDepth2.length > 0 && $nextDepth2.offset()) {
                    var offsetTop = $nextDepth2.offset().top;
                    var height = $nextDepth2.height();

                    if (typeof offsetTop !== 'undefined' && typeof height !== 'undefined') {
                        if (cursorY > parseInt(offsetTop + height)) {
                            if (!resetTimeout) {
                                resetTimeout = setTimeout(function () {
                                    reset();
                                    resetTimeout = null;
                                }, 400);
                            }
                        } else {
                            // 마우스가 다시 메뉴 영역에 들어오면 reset 취소
                            if (resetTimeout) {
                                clearTimeout(resetTimeout);
                                resetTimeout = null;
                            }
                        }
                    }
                }
            });
        }

        // 탭/역탭 아웃
        $selecter.find('a:last, button:last').keydown(function (e) {
            if (e.keyCode === 9) {
                reset();
            }
        });
        $selecter.find('a:first, button:first').keydown(function (e) {
            if (e.keyCode === 9 && e.shiftKey) {
                reset();
            }
        });
    });
};

// 전체메뉴
// =================================================================================================================
function gnb() {
    // 열기
    $('#krds-header .header-container .btn-navi.all').on('click', function () {
        $('.krds-main-menu-mobile').addClass('is-backdrop').addClass('is-open');
    });

    // 타이틀에 링크 추가
    $('.krds-main-menu-mobile .sub-title').each(function () {
        var $h2 = $(this);
        if ($h2.find('a').length === 0) {
            var $mdepth2 = $h2.next('.mdepth2');
            var $firstLink = $mdepth2.find('li:first-child a');
            var href = $firstLink.attr('href') || '#';
            var $a = $('<a>', {
                'href': href,
                'html': $h2.html()
            });
            $h2.empty().append($a);
        }
    });

    // .sub-title > a 클릭 시 mdepth2의 li가 2개 이상이면 링크 이동 막고 부모 .gnb-sub-list에 active 클래스 추가
    $(document).on('click', '.krds-main-menu-mobile .sub-title > a', function (e) {
        var $a = $(this);
        var $mdepth2 = $a.parent().next('.mdepth2');
        if ($mdepth2.length === 0) return; // mdepth2가 없으면 아무 동작도 하지 않음

        var $li = $mdepth2.find('li');
        var $gnbSubList = $a.closest('.gnb-sub-list');

        if ($li.length >= 2) {
            e.preventDefault();
            e.stopImmediatePropagation();
            $gnbSubList.toggleClass('active');
        }
    });

    // 닫기
    $('.krds-main-menu-mobile #close-nav').on('click', function () {
        $('.krds-main-menu-mobile .gnb-sub-list').removeClass('active');
    });
}


/*-------------------------------------------------
title       : 공통 추가
Author      : 조정연
Create date : 2026-02-04
-------------------------------------------------*/
const AC = 'active',
    FX = 'fixed',
    ScrollNo = 'no-scroll',
    srOnly = '.sr-only',
    OpenTxt = '열기',
    CloseTxt = '닫기',
    isOpen = 'is-open',
    $html = $('html');

let $clickSpot;

/*  ---------------------------------------------------------------------------------------
*    globalNav 
----------------------------------------------------------------------------------------- */
function globalNav(el, type) {
    const $el = $(el),
        $gnbDepth1 = $el.find(">li>a"),
        $header = $("#krds-header");
    if (type == "full") { //full : 오버시 서브메뉴 전체활성화
        $header.on("mouseenter focusin", function () {
            $(this).addClass(`${AC} full`)
            $gnbDepth1.attr('aria-expanded', 'true')
        }).on("mouseleave", function () {
            $(this).removeClass(`${AC} full`)   
            $gnbDepth1.attr('aria-expanded', 'false')
            
        })        
    } else { //기본gnb : 오버시 해당서브메뉴활성화
        $gnbDepth1.on("mouseenter focusin", function () {
            $(this).attr('aria-expanded', 'true').add($header).addClass(AC).siblings().removeClass(AC)
        }).on("mouseleave focusout", function () {
            $(this).attr('aria-expanded', 'false').add($header).removeClass(AC)
        })
    }
    
    //3차뎁스를 갖고있는 상위요소에 클래스부여
    $(".depth3").each(function () {
        $(this).parent().addClass("is-depth3")
    })
    //접근성 탭포커스로 메뉴영역을 벗어났을때 (로고/전체메뉴 등 헤더 내 다른 요소로 이동 시에도 메뉴 닫기)
    const isFocusLeavingMenu = (e) => {
        const related = e.relatedTarget;
        return related && !$el[0].contains(related);
    };
    const isFocusLeavingHeader = (e) => {
        const related = e.relatedTarget;
        return related && !$header[0].contains(related);
    };
    $el.on("focusout", function (e) {
        if (isFocusLeavingMenu(e)) $header.removeClass(`${AC} full`);
    });
    $header.find('.logo a').on("focusout", function (e) {
        if (isFocusLeavingHeader(e)) $header.removeClass(`${AC} full`);
    });

    //모바일
    $header.on("click", ".is-depth3>a", function (e) {
        if (mobile()) active(this, "toggle")
    })
}
/*  -------------------------------------------------------------------------------------
*   팝업 또는 레이어 열고 닫기
----------------------------------------------------------------------------------------- */
function layerPopup(el) {
    //accessInit(el);
    

    $(el).on('click', function (e) {
        e.preventDefault();

        $clickSpot = $(this);
        const isActive = $clickSpot.hasClass(AC);

        $clickSpot.toggleClass(AC).attr('aria-expanded', isActive ? 'false' : 'true')
        $('#' + $(this).data('id')).attr('tabindex', 0).fadeIn(300).focus().addClass(isOpen);
        $html.addClass(ScrollNo);
    })

    $html.on('click', `.${isOpen} .popup-close`, function (e) {
        e.preventDefault();
        $(this).closest(`.${isOpen}`).removeAttr('tabindex').fadeOut(100).removeClass(isOpen);
        $html.removeClass(ScrollNo);
        $clickSpot.focus().removeClass(AC).attr('aria-expanded', 'false');
    })
    $html.on('keydown', `.${isOpen} .popup-close`, function (e) {
        if (e.keyCode == 9) $(this).closest(`.${isOpen}`).focus();
    })
}

/*  -------------------------------------------------------------------------------------
*    tab메뉴 - 페이지가 전환되는 탭메뉴(ex. depth4, depth5)             tabs(this)
*    tab메뉴와 콘텐츠가 포함된 경우                                     tabs(this, "탭콘텐츠")
----------------------------------------------------------------------------------------- */
function tabs(el, cont) {
    const tabLi = $(el).find('>li').length
    $(el).addClass("num" + tabLi + "")


    //탭콘텐츠 내에서 전환되는 경우
    if (cont) {
        //탭메뉴 접근성
        $(el).find('>li').attr('role', 'tab');
        $(cont).attr('role', 'tabpanel');
        $(el).find('li.active').attr('aria-selected', true)
            .siblings('li').attr('aria-selected', false)

        $(el).on("click", ">li>a, >li>button", function (e) {
            const $li = $(this).parent('li');
            $li.attr('aria-selected', true)
                .addClass(AC)
                .siblings().removeClass(AC).attr('aria-selected', false)
                .find('i.sr-only').remove();

            $li.children('a, button').each(function () {
                if ($(this).find('i.sr-only').length === 0) {
                    $(this).append('<i class="sr-only">선택됨</i>');
                }
            });

            $("#" + $li.attr('aria-controls')).addClass(AC).siblings().removeClass(AC);
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