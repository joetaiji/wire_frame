/**
 * 모바일 GNB 메뉴
 */
import { AC, ScrollNo, $html } from './config.js';
import { mobile } from './utils.js';

/**
 * 모바일 GNB 메뉴 기능
 */
export function mobileGnb() {
    const $mGnbWrap = $('.m-gnb-wrap'),
        $mGnb = $('.topmenu_all');

    $('.m-gnb-top-etc').prepend($('#header').find('.etc-ul').clone());
    $mGnb.children('li').eq(0).addClass(AC);

    $('#m-gnb-open').on('click', function (e) {
        if (mobile()) {
            $(this).add($mGnbWrap).toggleClass(AC);
            $html.addClass(ScrollNo);
            e.preventDefault();
        }
    });

    $mGnbWrap.on('click', '.ico-close', function () {
        $mGnbWrap.removeClass(AC);
        $html.removeClass(ScrollNo);
    });

    $mGnb.on('click', '>li>a', function (e) {
        e.preventDefault();
        $(this).parent().addClass(AC).siblings().removeClass(AC);
    });

    // 모바일에서 Active 찾아서 활성화
    $mGnb.find('>li').each(function () {
        const $li = $(this);

        if ($li.children().hasClass(AC)) {
            $li.addClass(AC).siblings().removeClass(AC);
        }
        if ($li.find('.submenu').length === 0) {
            const $submenuWrap = $li.clone()
                .wrap('<div class="submenu"><ul></ul></div>').parent().parent();
            $li.append($submenuWrap);
        }
    });
}
