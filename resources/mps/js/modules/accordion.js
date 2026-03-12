/**
 * 아코디언
 */
import { AC, OpenTxt, CloseTxt } from './config.js';

/**
 * 아코디언 기능
 * @param {string} el - 아코디언 컨테이너 선택자
 */
export function accordion(el) {
    const $el = $(el);

    // sr-only 텍스트 업데이트
    const setSrOnly = ($details, isOpen) => {
        $details.find('summary i .sr-only').text(isOpen ? CloseTxt : OpenTxt);
    };

    // 전체버튼 상태 업데이트
    const updateBtnAll = ($accordion) => {
        const hasActive = $accordion.children('details').hasClass(AC);
        $accordion.find('.btn-all')
            .toggleClass(AC, hasActive)
            .find('span').text(hasActive ? CloseTxt : OpenTxt);
    };

    // 초기 상태 설정 - open 여부에 따라 active 클래스 및 sr-only 텍스트 지정
    $el.children('details').each(function () {
        const $details = $(this);
        const isOpen = $details.is('[open]');
        $details.toggleClass(AC, isOpen)
            .find('summary i').append(`<span class="sr-only">${isOpen ? CloseTxt : OpenTxt}</span>`);
    });

    // summary 클릭
    $el.on('click', 'summary', function () {
        const $details = $(this).parent('details');
        const isOpen = $details.is('[open]');
        const $accordion = $(this).closest(el);

        $details.toggleClass(AC, !isOpen);
        setSrOnly($details, !isOpen);
        updateBtnAll($accordion);
    });

    // 전체버튼 클릭
    $el.on('click', '.btn-all', function () {
        const $accordion = $(this).closest(el);
        const target = $(this).hasClass(AC) ? 'details.active summary' : 'summary';
        $accordion.find(target).trigger('click');
    });
}
