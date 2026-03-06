/**
 * SNB 메뉴
 */
import { AC } from './config.js';

/**
 * SNB 메뉴 기능
 */
export function snb() {
    const $snb = $('#snb');

    // snb 접근성 세팅
    $snb.find('#left_menu_top li>a').each(function () {
        const $na = $(this),
            $parent = $na.parent(),
            isActive = $parent.hasClass(AC);

        if (isActive) $na.attr('aria-current', 'page');
        if ($na.next('ul').length > 0) { // 3차뎁스
            $na.attr('aria-expanded', isActive ? 'true' : 'false').removeAttr('aria-current');
            $parent.addClass('is-depth3');
        }
    });

    // 하위 3차뎁스를 갖고 있는 메뉴를 클릭했을때
    $snb.on('click', '.is-depth3>a', function (e) {
        const $na = $(this),
            $parent = $na.parent(),
            isActive = $parent.hasClass(AC);

        if (!isActive) {
            $parent.addClass(AC).siblings().removeClass(AC);
            $snb.find('.is-depth3>a').attr('aria-expanded', 'false');
            $na.attr('aria-expanded', 'true');
        }
    });
}
