/**
 * 유틸리티 함수
 */

/**
 * 모바일 여부 체크
 * @returns {boolean}
 */
export const mobile = () => window.innerWidth < 1024;

/**
 * 접근성 초기 설정
 * @param {string|jQuery} el - 대상 요소 선택자
 */
export const accessInit = (el) => $(el).attr('aria-expanded', 'false');
