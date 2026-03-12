/**
 * 탭 메뉴
 */
import { AC, $html, mobile } from './config.js';

/**
 * 탭 메뉴 기능
 * @param {string} el - 탭 메뉴 선택자
 * @param {string} [cont] - 탭 콘텐츠 선택자 (선택사항)
 */
export function tabs(el, cont) {
    const $el = $(el);
    const tabBtnNum = $el.find('button, a').length;
    $el.addClass(`num${tabBtnNum}`);

    // 탭콘텐츠 내에서 전환되는 경우
    if (cont) {
        const $btns = $el.find('button, a');

        // 탭메뉴 접근성
        $btns.attr({ role: 'tab', 'aria-selected': 'false' });
        $(cont).attr('role', 'tabpanel');
        $el.find('.active').attr('aria-selected', 'true');

        $el.on('click', 'a, button', function (e) {
            const $tabBtn = $(this);

            $btns.attr('aria-selected', 'false').removeClass(AC).find('i.sr-only').remove();
            $tabBtn.attr('aria-selected', 'true').addClass(AC);

            if (!$tabBtn.find('i.sr-only').length) {
                $tabBtn.append('<i class="sr-only">선택됨</i>');
            }

            $(`#${$tabBtn.attr('aria-controls')}`).addClass(AC).siblings().removeClass(AC);
            e.preventDefault();
        });
    } else {
        // 탭메뉴 접근성
        $el.find('li.active').children('a, button').attr('aria-current', 'page');

        // 탭메뉴(모바일)
        $el.find('>ul>li>a, >ul>li>button').on('click', function (e) {
            if (mobile() && $(this).parent().hasClass(AC)) {
                e.preventDefault();
                $(this).closest(el).toggleClass(AC);
            }
        });
        // 탭메뉴(모바일) : 벗어난 곳 클릭시 탭메뉴 닫히게
        $html.on('click', (e) => {
            if (!$(e.target).closest(el).length) $el.removeClass(AC);
        });
    }
}
