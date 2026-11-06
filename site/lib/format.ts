/* Без импорта каталога: эти функции нужны в браузере, а весь JSON с описаниями туда попадать не должен */
export const fmt = (n: number | null | undefined) => (n == null ? "" : Math.round(n).toLocaleString("ru-RU").replace(/,/g, " "));
export const fmtArea = (n: number | null | undefined) => (n == null ? "" : String(n).replace(".", ","));
export function bedsWord(n: number) { return n === 1 ? "спальня" : n < 5 ? "спальни" : "спален"; }
/** Лёгкие копии для карточек, готовит scripts/harvest/make_thumbs.py */
export const cardImg = (src: string) => src.replace(/^\/p\/(.+)\.\w+$/, "/c/$1.webp");
export const cardPlan = (src: string) => src.replace(/^\/plan\/(.+)\.\w+$/, "/cp/$1.webp");
