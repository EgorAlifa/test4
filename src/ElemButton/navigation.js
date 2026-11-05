import { parse } from 'qs';
import { stringifyQuery } from './utils';

/**
 * Навигация кнопки по ссылке.
 *
 * Адреса платформы (BASE_URL — например /insight/editor/):
 *  - редактор проекта:       <BASE_URL>apps/edit/<id>/?page=<uuid>  (шаблон — templates/edit/<id>/,
 *                            публикация — publications/edit/<id>/)
 *  - плеер проекта:          …/editor/player/<id|slug>/#/<страница>
 *  - публикация по ссылке:   …/editor/public/<имя>-<хеш>/#/<страница>
 * Плеер и публикация — режимы просмотра с hash-роутингом. В их адресах тоже есть «/editor/»,
 * поэтому по одному «/editor/» отличать редактор от просмотра нельзя.
 */

export const PlatformMode = Object.freeze({
    EDITOR: 'editor',
    VIEWER: 'viewer'
});

export const UrlKind = Object.freeze({
    // http(s)-ссылка
    ABSOLUTE: 'absolute',
    // mailto: / tel: — открываются почтой / звонилкой в этой же вкладке
    SCHEME: 'scheme',
    // страница проекта: 'slug', '/slug', '#/slug', '?x=1'
    RELATIVE: 'relative',
    // пусто или недопустимая схема (javascript:, data: …)
    INVALID: 'invalid'
});

// Как в платформе: EDITOR_PLAYER_PATH '/editor/player/', EDITOR_PUBLICATION_PATH '/editor/public/'
const VIEWER_PATH_RE = /\/editor\/(player|public)\//;
// Как appPreviewUrl редактора: BASE_URL.replace('/editor/', '/editor/player/') + id + '/'.
// Редактор проектов и шаблонов (apps/edit, templates/edit) показывает один и тот же предпросмотр.
// publications/edit сюда не входит: id публикации — не id проекта, адрес плеера по нему не построить.
const EDITOR_EDIT_PATH_RE = /^(.*\/editor\/)(?:apps\/|templates\/)?edit\/([^/]+)\/?/;
const HTTP_URL_RE = /^https?:\/\//i;
const ALLOWED_SCHEME_RE = /^(mailto|tel):/i;
const ANY_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const DOT_SEGMENTS_RE = /^(\.\.?\/)+/;

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
 * Плеер и публикация — просмотр. Смотрим только pathname, не hash и не query.
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
 * Точки в начале относительной ссылки:
 *  '.', './', '.?x=1'   → текущая страница ('', '?x=1')
 *  '..', '../', '..?x'  → главная ('/', '/?x')
 *  './page', '../page'  → 'page' (у проекта нет вложенных страниц — точки просто отбрасываем)
 *
 * @param {string} url
 * @return {string}
 */
export const normalizeRelativeUrl = (url) => {
    const source = String(url ?? '').trim();
    if (/^\.\.\/?(?=$|[?#])/.test(source)) return `/${source.replace(/^\.\.\/?/, '')}`;
    if (/^\.\/?(?=$|[?#])/.test(source)) return source.replace(/^\.\/?/, '');
    return source.replace(DOT_SEGMENTS_RE, '');
};

/**
 * Разбирает ссылку из настроек.
 *  - 'https://…'                → absolute
 *  - '//host/…'                 → absolute со схемой текущей страницы
 *  - 'www.site.ru/…'            → absolute (https:// дописываем — частая ошибка ввода)
 *  - 'mailto:…', 'tel:…'        → scheme
 *  - 'javascript:', 'data:' и прочие схемы → invalid
 *  - остальное                  → relative (страница проекта), см. normalizeRelativeUrl
 *
 * @param {string} url
 * @param {string} [currentProtocol] — location.protocol, для '//host'
 * @return {{ kind: string, href: string }}
 */
export const classifyUrl = (url, currentProtocol = 'https:') => {
    const href = String(url ?? '').trim();
    if (href === '') return { kind: UrlKind.INVALID, href };
    if (HTTP_URL_RE.test(href)) return { kind: UrlKind.ABSOLUTE, href };
    if (href.startsWith('//')) {
        const protocol = /^https?:$/.test(currentProtocol) ? currentProtocol : 'https:';
        return { kind: UrlKind.ABSOLUTE, href: `${protocol}${href}` };
    }
    if (/^www\./i.test(href)) return { kind: UrlKind.ABSOLUTE, href: `https://${href}` };
    if (ALLOWED_SCHEME_RE.test(href)) return { kind: UrlKind.SCHEME, href };
    if (ANY_SCHEME_RE.test(href)) return { kind: UrlKind.INVALID, href };
    return { kind: UrlKind.RELATIVE, href: normalizeRelativeUrl(href) };
};

/**
 * Относительная ссылка → путь страницы и её собственные параметры:
 *  '#/3?x=1' | '/3?x=1' | '3?x=1' | '#3' → { path: '/3', query: { x: '1' } }
 *  '/' | '#/' | '#' | '..'               → { path: '/' } — главная страница
 *  '?x=1' | '#?x=1' | '.?x=1' | ''       → { path: '' } — текущая страница (с параметрами)
 *
 * @param {string} url
 * @return {{ path: string, query: Record<string, *> }}
 */
export const splitRelativeUrl = (url) => {
    const source = normalizeRelativeUrl(url);
    // корень: '/…', '#/…' или ровно '#'; '#?x=1' — это параметры текущей страницы
    const hasRoot = /^(\/|#\/|#$)/.test(source);
    const clean = source.replace(/^[#/]+/, '');
    const queryIdx = clean.indexOf('?');
    const pathPart = queryIdx >= 0 ? clean.substring(0, queryIdx) : clean;
    const search = queryIdx >= 0 ? clean.substring(queryIdx + 1) : '';
    const query = search ? parse(search) : {};
    if (pathPart) return { path: `/${pathPart}`, query };
    return { path: hasRoot ? '/' : '', query };
};

/**
 * Маршрут страницы проекта: { path, query }. Параметры кнопки перекрывают параметры самой ссылки,
 * пустой path — текущая страница.
 *
 * @param {string} url — относительная ссылка
 * @param {Record<string, *>} query — параметры кнопки
 * @param {string} currentPath — путь текущей страницы
 * @return {{ path: string, query: Record<string, *> }}
 */
export const buildRoute = (url, query, currentPath) => {
    const { path, query: urlQuery } = splitRelativeUrl(url);
    return { path: path || currentPath || '/', query: { ...urlQuery, ...query } };
};

/**
 * Путь текущей страницы из hash: '#/page1?x=1' → '/page1'.
 *
 * @param {Location} loc
 * @return {string}
 */
export const currentHashPath = (loc) => String(loc.hash || '').replace(/^#/, '').split('?')[0] || '/';

/**
 * Маршрут → строка '/slug?x=1'.
 *
 * @param {{ path: string, query: Record<string, *> }} route
 * @return {string}
 */
export const routeToString = ({ path, query }) => {
    const search = stringifyQuery(query || {});
    return search ? `${path}?${search}` : path;
};

/**
 * Hash-маршрут страницы: '/slug?x=1'. Пустой path — текущая страница из hash.
 *
 * @param {Location} loc
 * @param {string} url
 * @param {Record<string, *>} query — параметры кнопки, перекрывают параметры самой ссылки
 * @return {string}
 */
export const buildHashRoute = (loc, url, query = {}) => routeToString(buildRoute(url, query, currentHashPath(loc)));

/**
 * Адрес текущего документа без hash — ровно как в адресной строке (без добавления слешей),
 * чтобы смена страницы оставалась переходом внутри документа.
 *
 * @param {Location} loc
 * @return {string}
 */
export const documentBase = (loc) => String(loc.href).split('#')[0];

/**
 * Полный адрес страницы проекта с hash-роутингом: <документ>#/slug?vars
 *
 * @param {Location} loc
 * @param {string} url
 * @param {Record<string, *>} query
 * @return {string}
 */
export const buildHashUrl = (loc, url, query = {}) => `${documentBase(loc)}#${buildHashRoute(loc, url, query)}`;

/**
 * Адрес плеера проекта для проверки из редактора (как кнопка «Предпросмотр» редактора):
 * …/editor/apps/edit/<id>/ → …/editor/player/<id>/. Если адрес не распознан — null.
 *
 * @param {Location} loc
 * @return {string|null}
 */
export const getEditorPlayerBase = (loc) => {
    const match = EDITOR_EDIT_PATH_RE.exec(String(loc?.pathname || ''));
    if (match == null) return null;
    const [, editorBase, appId] = match;
    return `${loc.origin}${editorBase}player/${appId}/`;
};

/**
 * Адрес страницы проекта в плеере для проверки из редактора: …/editor/player/<id>/#/slug?vars, или null.
 *
 * @param {Location} loc
 * @param {string} url
 * @param {Record<string, *>} query
 * @return {string|null}
 */
export const buildEditorPreviewUrl = (loc, url, query = {}) => {
    const base = getEditorPlayerBase(loc);
    return base == null ? null : `${base}#${routeToString(buildRoute(url, query, '/'))}`;
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
