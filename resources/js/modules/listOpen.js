/**
 * 리스트 열고 닫기
 */
import { AC, srOnly, OpenTxt, CloseTxt, $html } from './config.js';
import { accessInit } from './utils.js';

/**
 * 리스트 열고 닫기 기능
 * @param {string} el - 트리거 버튼 선택자
 * @param {string} target - 대상 컨테이너 선택자
 * @param {boolean} [noAnyClick] - 외부 클릭시 닫기 여부
 */
export function listOpen(el, target, noAnyClick) {
    accessInit(el);

    const $el = $(el);

    $html.on('click', el, function (e) {
        const $na = $(this),
            $elTarget = $na.closest(target),
            isActive = $elTarget.hasClass(AC);

        e.preventDefault();
        if (!isActive) $html.trigger('click');
        $elTarget.toggleClass(AC);
        $na.attr('aria-expanded', isActive ? 'false' : 'true')
            .find(srOnly).text(isActive ? OpenTxt : CloseTxt);
    });

    if (!noAnyClick) {
        $html.on('click', (e) => {
            if (!$(e.target).closest(target).length) {
                $(target).removeClass(AC)
                    .find(el).attr('aria-expanded', 'false')
                    .find(srOnly).text(OpenTxt);
            }
        });
    }

    $(target).on('click', '.btn-close', function (e) {
        $(this).closest(target).find(el).trigger('click');
    });
}
