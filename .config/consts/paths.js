const path = require('path');
const { argv } = require('@goodt/webpack/common/utils');
const { ARGV_OUTPUT_DIR } = require('./argv');

const PROCESS_DIR = process.cwd();

module.exports = {
    OUTPUT_DIR: path.join(PROCESS_DIR, argv(ARGV_OUTPUT_DIR) ?? 'dist'),
    PROCESS_DIR,
    PROJECT_DIR: path.join(__dirname, './../../'),
    APP_BUILD_ENTRY_PATH: './resolveEntry.js'
    /*
    APP_ENTRIES_CONFIG_PATH: './config/entries.config.json',
    */
};
