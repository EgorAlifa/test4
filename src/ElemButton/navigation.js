import { parse } from 'qs';
import { stringifyQuery } from './utils';

/**
 * Навигация кнопки по ссылке.
 *
 * Адреса платформы:
 *  - редактор:               …/editor/edit/<id>/?page=<uuid>
 *  - плеер проекта:          …/editor/player/<id|slug>/#/<страница>
 *  - публикация по ссылке:   …/editor/public/<имя>-<хеш>/#/<страница>
 * Плеер и публикация — режимы просмотра с hash-роутингом. В адресе публикации тоже есть «/editor/»,
 * поэтому по одному «/editor/» отличать редактор от просмотра нельзя.
 */

export const PlatformMode = Object.freeze({
    EDITOR: 'editor',
    VIEWER: 'viewer'
});

const VIEWER_PATH_RE = /\/(player|public)\//;
const EDITOR_EDIT_PATH_RE = /^(.*\/editor\/)edit\/([^/]+)\/?/;
const HTTP_URL_RE = /^https?:\/\//i;
const ANY_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Адрес окна, в котором смотрят проект: сам window или (если виджет в iframe того же домена) верхнее окно.
 *
 * @param {Window} win
 * @return {Location}
 */
export const getTopLocation = (win) => {
    try {
        if (win.top && win.top !== win && win.top.location.pathname) {
            return win.top.location;
        }
    } catch (e) {
        // iframe с другого домена — доступа к top нет
    }
    return win.location;
};

/**
 * Плеер (/player/) и публикация (/public/) — просмотр. Смотрим только pathname, не hash и не query.
 *
 * @param {string} pathname
 * @return {boolean}
 */
export const isViewerPath = (pathname) => VIEWER_PATH_RE.test(String(pathname || ''));

/**
 * Режим платформы.
 *  1. Адрес плеера/публикации — всегда просмотр, что бы ни пришло в isEditorMode
 *     (публикация не может быть холстом редактора).
 *  2. Иначе — флаг платформы isEditorMode (строго true / false).
 *  3. Флаг не задан — запасной разбор адреса: «/editor/» → редактор.
 *
 * @param {{ isEditorMode: *, pathnames: string[] }} params
 * @return {string}
 */
export const detectPlatformMode = ({ isEditorMode, pathnames }) => {
    if (pathnames.some(isViewerPath)) return PlatformMode.VIEWER;
    if (isEditorMode === true) return PlatformMode.EDITOR;
    if (isEditorMode === false) return PlatformMode.VIEWER;
    return pathnames.some((p) => String(p || '').includes('/editor/')) ? PlatformMode.EDITOR : PlatformMode.VIEWER;
};

/**
 * Разбирает ссылку из настроек.
 *  - 'https://…'            → absolute
 *  - 'www.site.ru/…'        → absolute (https:// дописываем — частая ошибка ввода)
 *  - 'mailto:', 'javascript:' и прочие схемы → invalid
 *  - остальное ('slug', '/slug', '#/slug', '?x=1') → relative (страница проекта)
 *
 * @param {string} url
 * @return {{ kind: 'absolute'|'relative'|'invalid', href: string }}
 */
export const classifyUrl = (url) => {
    const href = String(url ?? '').trim();
    if (href === '') return { kind: 'invalid', href };
    if (HTTP_URL_RE.test(href)) return { kind: 'absolute', href };
    if (href.startsWith('//')) return { kind: 'absolute', href: `https:${href}` };
    if (/^www\./i.test(href)) return { kind: 'absolute', href: `https://${href}` };
    if (ANY_SCHEME_RE.test(href)) return { kind: 'invalid', href };
    return { kind: 'relative', href };
};

/**
 * Относительная ссылка → путь страницы и её собственные параметры:
 * '#/3?x=1' | '/3?x=1' | '3?x=1' → { path: '/3', query: { x: '1' } }; '?x=1' → { path: '', query: { x: '1' } }
 * (пустой path — «текущая страница»).
 *
 * @param {string} url
 * @return {{ path: string, query: Record<string, *> }}
 */
export const splitRelativeUrl = (url) => {
    const clean = String(url).replace(/^[#/]+/, '');
    const queryIdx = clean.indexOf('?');
    const pathPart = queryIdx >= 0 ? clean.substring(0, queryIdx) : clean;
    const search = queryIdx >= 0 ? clean.substring(queryIdx + 1) : '';
    const query = search ? parse(search) : {};
    return { path: pathPart ? `/${pathPart}` : '', query };
};

/**
 * Hash-маршрут страницы: '/slug?x=1'. Пустой path — текущая страница из hash.
 *
 * @param {Location} loc
 * @param {string} url
 * @param {Record<string, *>} query — параметры кнопки, перекрывают параметры самой ссылки
 * @return {string}
 */
export const buildHashRoute = (loc, url, query = {}) => {
    const { path, query: urlQuery } = splitRelativeUrl(url);
    const currentPath = String(loc.hash || '').replace(/^#/, '').split('?')[0] || '/';
    const search = stringifyQuery({ ...urlQuery, ...query });
    const routePath = path || currentPath;
    return search ? `${routePath}?${search}` : routePath;
};

/**
 * Адрес документа без hash: origin + pathname (со слешем на конце) + search.
 *
 * @param {Location} loc
 * @return {string}
 */
const documentBase = (loc) => {
    const pathname = loc.pathname.endsWith('/') ? loc.pathname : `${loc.pathname}/`;
    return `${loc.origin}${pathname}${loc.search || ''}`;
};

/**
 * Полный адрес страницы проекта в просмотре (плеер / публикация): <документ>#/slug?vars
 *
 * @param {Location} loc
 * @param {string} url
 * @param {Record<string, *>} query
 * @return {string}
 */
export const buildViewerUrl = (loc, url, query = {}) => `${documentBase(loc)}#${buildHashRoute(loc, url, query)}`;

/**
 * Адрес страницы проекта для проверки из редактора: …/editor/edit/<id>/ → …/editor/player/<id>/#/slug
 * (как кнопка «Предпросмотр» редактора). Если адрес редактора не распознан — null.
 *
 * @param {Location} loc
 * @param {string} url
 * @param {Record<string, *>} query
 * @return {string|null}
 */
export const buildEditorPreviewUrl = (loc, url, query = {}) => {
    const match = EDITOR_EDIT_PATH_RE.exec(loc.pathname);
    if (match == null) return null;
    const [, editorBase, appId] = match;
    const { path, query: urlQuery } = splitRelativeUrl(url);
    const search = stringifyQuery({ ...urlQuery, ...query });
    const routePath = path || '/';
    return `${loc.origin}${editorBase}player/${appId}/#${search ? `${routePath}?${search}` : routePath}`;
};

/**
 * Добавляет параметры в абсолютную ссылку: одноимённые параметры ссылки заменяются,
 * массивы — повтором ключа, hash сохраняется.
 *
 * @param {string} href
 * @param {Record<string, *>} query
 * @return {string}
 */
export const appendQuery = (href, query = {}) => {
    const entries = Object.entries(query).filter(([, value]) => value !== undefined);
    if (entries.length === 0) return href;
    try {
        const target = new URL(href);
        entries.forEach(([key, value]) => {
            target.searchParams.delete(key);
            [value].flat().forEach((item) => target.searchParams.append(key, String(item)));
        });
        return target.toString();
    } catch (e) {
        const hashIdx = href.indexOf('#');
        const main = hashIdx >= 0 ? href.substring(0, hashIdx) : href;
        const hash = hashIdx >= 0 ? href.substring(hashIdx) : '';
        return `${main}${main.includes('?') ? '&' : '?'}${stringifyQuery(query)}${hash}`;
    }
};
