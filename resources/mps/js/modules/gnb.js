/**
 * GNB 메뉴
 */
import { AC, $html, accessInit } from './config.js';

/**
 * GNB 메뉴 기능
 * @param {string} el - GNB 선택자
 */
export function gnb(el, submenu) {
    const $gnb = $(el);
    const $submenu = $(submenu);
    const $depth1 = $gnb.find('>li>a:not([target="_blank"])');

    // 초기셋팅 - 1차뎁스 접근성, 2차뎁스 첫번째 메뉴 활성
    $gnb.find('>li>a.active').attr('aria-current', 'page');
    $submenu.removeAttr('style');

    $depth1.each(function () {
        const $na = $(this);
        const $next = $na.next(submenu);

        // 2차뎁스메뉴가 있는 경우 구분해서 처리
        if ($next.length) {
            accessInit($na);
            $na.addClass('is-submenu');
            /* $next.prepend("<div class='depth1-go'></div>")
                .find('.depth1-go').prepend($na.clone()).find('a').removeAttr('aria-expanded'); */
        }
    });

    // 1차뎁스(2차뎁스를 갖고 있는 경우) 클릭
    $depth1.on('click', function (e) {
        const $na = $(this);

        e.preventDefault();
        $html.addClass(AC); // 배경 dim처리
        $na.attr('aria-expanded', 'true')
            .parent().addClass(AC).siblings().removeClass(AC)
            .children('.is-submenu').attr('aria-expanded', 'false');
    });

    // 열린 메뉴 닫기
    const gnbClose = () => {
        $depth1.attr('aria-expanded', 'false').parent().add($html).removeClass(AC);
    };

    $html.on('click keyup', (e) => {
        if (!$(e.target).closest($gnb).length) gnbClose();
    });
    $(window).on('scroll', gnbClose); // 2차뎁스가 열린상태에서 스크롤시
}
