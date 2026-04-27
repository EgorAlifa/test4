import { ReportFileType } from './constants';

/**
 *
 * @param {string} pathname
 * @param {{ ext: string|undefined, name: string }} [options]
 * @return {{path: string[], basename: string, name: string, ext: string}}
 */
export const parseFilename = (pathname, { ext: defaultExt, name: defaultName = '' } = {}) => {
    const path = pathname.split('/');

    const basename = path.pop();

    const {
        groups: {
            /**
             * @type {string}
             */
            name = defaultName,
            /**
             * @type {string}
             */
            ext = defaultExt
        }
    } = /^(?<name>.*?)(?:\.(?<ext>.*))?$/.exec(basename);

    return {
        path,
        basename,
        name,
        ext
    };
};

/**
 * @param {string|[string, string]} filename
 * @param {{ customName?: string, withCurrentDate?: boolean, entitiesNames?: string[] }} [options]
 * @return {string}
 */
export const buildReportFilename = (
    filename,
    { customName = '', withCurrentDate = false, withFolderName = false, entitiesNames = [] } = {}
) => {
    const { path, name, ext = ReportFileType.EXCEL } = parseFilename(filename);
    const nameParts = [];

    if (customName === '') {
        const basePathname = withFolderName ? [...path, name].join('-') : name;
        nameParts.push(basePathname);
    } else {
        nameParts.push(customName);
    }

    if (entitiesNames.length > 0 && customName.length === 0) {
        const entitiesNamePart = entitiesNames.map((_name) => _name.replace(/\s+/g, '_')).join('-');
        nameParts.push(entitiesNamePart);
    }
    if (withCurrentDate) {
        const currentDatePart = new Date().toLocaleDateString('ru-RU');
        nameParts.push(currentDatePart);
    }

    return {
        filename: nameParts.join('-'),
        ext
    };
};
