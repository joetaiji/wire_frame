/**
 * 유틸리티 함수
 */

/**
 * 모바일 여부 체크
 * @returns {number} 모바일이면 1, 아니면 0
 */
export function mobile() {
    return window.innerWidth < 1024 ? 1 : 0;
}

/**
 * 접근성 초기 설정
 * @param {string} el - 대상 요소 선택자
 */
export function accessInit(el) {
    $(el).attr('aria-expanded', 'false');
}
