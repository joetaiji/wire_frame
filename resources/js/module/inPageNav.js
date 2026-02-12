/**
 * 페이지 내 탐색
 */
import { AC } from './config.js';

let lastScroll;

/**
 * 페이지 내 탐색 생성
 * @param {string} el - 페이지 타이틀 선택자
 */
export function inPageNav(el) {
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
            $(this).attr('id', 'anchor-page-' + index); // id부여
            $('.in-page-navigation-list ul').append(
                `<li>
                    <a href="#anchor-page-${index}" data-anchor="anchor-page-${index}">${$pageNav}</a>
                </li>`
            );
        });
    }

    const $navList = $('.in-page-navigation-list ul');
    $navList.find('li:first a').add($pageTit.eq(0)).addClass(AC); // 첫번째 메뉴 활성화

    $(window).on('load scroll', function () {
        if ($(window).scrollTop() > 110) {
            let scrollT = $(this).scrollTop();

            // 스크롤에 따른 페이지 타이틀 활성화
            $pageTit.each(function () {
                const $na = $(this);
                const pageTitTop = $na.offset().top;
                const isDown = scrollT > lastScroll;

                if (isDown && pageTitTop - 45 < scrollT) { // down scroll 
                    $pageTit.removeClass('active up');
                    $na.addClass(AC);
                } else if (!isDown && pageTitTop - 210 < scrollT) { // up scroll 
                    $pageTit.addClass('up').removeClass(AC);
                    $na.addClass(AC);
                }
            });

            lastScroll = scrollT;

            // 탐색 메뉴 활성화 및 뱡향 클래스 지정
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

            // 마지막 콘텐츠타이틀에 다다르기 전에 스크롤이 다 내려갔을 경우
            if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
                $navList.find('li:last a').addClass(AC).parent().siblings('li').find('a').removeClass(AC).addClass('up');
            }
        }

        // 탐색 메뉴 클릭
        $navList.find('a').on('click', function () {
            $pageTit.toggleClass('up', $(this).hasClass('up'));
        });
    });
}
