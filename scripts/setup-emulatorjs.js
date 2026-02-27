#!/usr/bin/env node
'use strict';

/**
 * ElemGameConsole — установка EmulatorJS
 *
 * Скачивает EmulatorJS и кладёт в public/emulatorjs/data/
 * После этого виджет работает полностью офлайн через тот же dev-сервер.
 *
 * Запуск: npm run setup:emu
 * Принудительная переустановка: npm run setup:emu -- --force
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_EMU_DIR = path.join(ROOT_DIR, 'public', 'emulatorjs');
const LOADER_PATH = path.join(PUBLIC_EMU_DIR, 'data', 'loader.js');
const TEMP_ZIP = path.join(os.tmpdir(), `emulatorjs-setup-${Date.now()}.zip`);

const FORCE = process.argv.includes('--force');

// ─── helpers ─────────────────────────────────────────────────────────────────

function httpsGet(url, redirectCount = 0) {
    if (redirectCount > 5) return Promise.reject(new Error('Слишком много редиректов'));
    return new Promise((resolve, reject) => {
        const opts = { headers: { 'User-Agent': 'ElemGameConsole-Setup/1.0' } };
        https
            .get(url, opts, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    return resolve(httpsGet(res.headers.location, redirectCount + 1));
                }
                if (res.statusCode !== 200) {
                    return reject(new Error(`HTTP ${res.statusCode} при запросе ${url}`));
                }
                const chunks = [];
                res.on('data', (c) => chunks.push(c));
                res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
                res.on('error', reject);
            })
            .on('error', reject);
    });
}

function downloadFile(url, dest, redirectCount = 0) {
    if (redirectCount > 5) return Promise.reject(new Error('Слишком много редиректов'));
    return new Promise((resolve, reject) => {
        const opts = { headers: { 'User-Agent': 'ElemGameConsole-Setup/1.0' } };
        https
            .get(url, opts, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    return resolve(downloadFile(res.headers.location, dest, redirectCount + 1));
                }
                if (res.statusCode !== 200) {
                    return reject(new Error(`HTTP ${res.statusCode}`));
                }

                const total = parseInt(res.headers['content-length'] || '0', 10);
                let downloaded = 0;
                const file = fs.createWriteStream(dest);

                res.on('data', (chunk) => {
                    downloaded += chunk.length;
                    if (total > 0) {
                        const pct = Math.round((downloaded / total) * 100);
                        const mb = (downloaded / 1024 / 1024).toFixed(1);
                        const totalMb = (total / 1024 / 1024).toFixed(1);
                        process.stdout.write(
                            `\r   ⬇  ${pct}%  ${mb} / ${totalMb} MB    `
                        );
                    }
                });

                res.pipe(file);
                file.on('finish', () => {
                    process.stdout.write('\n');
                    file.close(resolve);
                });
                file.on('error', (err) => {
                    fs.unlinkSync(dest);
                    reject(err);
                });
            })
            .on('error', reject);
    });
}

function checkCommand(cmd) {
    try {
        execSync(`which ${cmd}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function dirSize(dir) {
    try {
        return execSync(`du -sh "${dir}" 2>/dev/null`).toString().split('\t')[0];
    } catch {
        return '?';
    }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n🎮  ElemGameConsole — установка EmulatorJS\n');
    console.log('   EmulatorJS будет размещён в public/emulatorjs/');
    console.log('   После этого виджет работает офлайн без отдельного сервера.\n');

    // Уже установлен?
    if (fs.existsSync(LOADER_PATH) && !FORCE) {
        const size = dirSize(PUBLIC_EMU_DIR);
        console.log(`✅  EmulatorJS уже установлен (${size})`);
        console.log('   Путь: public/emulatorjs/data/');
        console.log('   Для переустановки: npm run setup:emu -- --force\n');
        return;
    }

    // Проверка зависимостей
    if (!checkCommand('unzip')) {
        console.error('❌  Не найдена утилита unzip. Установите: sudo apt install unzip\n');
        process.exit(1);
    }

    // Получаем последний релиз
    console.log('📡  Получение информации о последнем релизе...');
    let release;
    try {
        const json = await httpsGet(
            'https://api.github.com/repos/EmulatorJS/EmulatorJS/releases/latest'
        );
        release = JSON.parse(json);
    } catch (e) {
        console.error(`❌  Не удалось получить данные с GitHub API: ${e.message}`);
        console.error('   Проверьте интернет-соединение (нужен однократный доступ для загрузки).\n');
        process.exit(1);
    }

    const version = release.tag_name;
    const zipUrl = `https://github.com/EmulatorJS/EmulatorJS/archive/refs/tags/${version}.zip`;
    console.log(`   Версия: ${version}`);
    console.log('   ⚠  Размер загрузки: ~150-400 MB (WASM-ядра для всех платформ)');
    console.log('   После установки всё работает офлайн.\n');

    // Загружаем
    console.log(`📦  Загрузка EmulatorJS ${version}...`);
    try {
        await downloadFile(zipUrl, TEMP_ZIP);
    } catch (e) {
        console.error(`\n❌  Ошибка загрузки: ${e.message}\n`);
        if (fs.existsSync(TEMP_ZIP)) fs.unlinkSync(TEMP_ZIP);
        process.exit(1);
    }

    // Распаковываем
    console.log('📂  Распаковка...');
    const TEMP_EXTRACT = path.join(os.tmpdir(), `emulatorjs-extract-${Date.now()}`);
    try {
        // Определяем имя корневой папки внутри zip
        const listOutput = execSync(`unzip -Z1 "${TEMP_ZIP}" | head -1`).toString().trim();
        const rootFolder = listOutput.split('/')[0];

        fs.mkdirSync(TEMP_EXTRACT, { recursive: true });

        // Распаковываем только папку data/
        execSync(
            `unzip -q "${TEMP_ZIP}" "${rootFolder}/data/*" -d "${TEMP_EXTRACT}"`,
            { stdio: 'inherit' }
        );

        // Копируем в public/emulatorjs/
        console.log('📋  Копирование в public/emulatorjs/...');
        fs.mkdirSync(PUBLIC_EMU_DIR, { recursive: true });

        // Удаляем старую версию если есть
        if (fs.existsSync(path.join(PUBLIC_EMU_DIR, 'data'))) {
            execSync(`rm -rf "${path.join(PUBLIC_EMU_DIR, 'data')}"`);
        }

        execSync(`cp -r "${TEMP_EXTRACT}/${rootFolder}/data" "${PUBLIC_EMU_DIR}/"`);
    } catch (e) {
        console.error(`\n❌  Ошибка распаковки: ${e.message}\n`);
        process.exit(1);
    } finally {
        if (fs.existsSync(TEMP_ZIP)) fs.unlinkSync(TEMP_ZIP);
        if (fs.existsSync(TEMP_EXTRACT)) execSync(`rm -rf "${TEMP_EXTRACT}"`);
    }

    // Итог
    const size = dirSize(PUBLIC_EMU_DIR);
    console.log(`\n✅  EmulatorJS установлен! (${size})`);
    console.log('   Путь: public/emulatorjs/data/\n');
    console.log('🚀  Теперь запустите: npm start');
    console.log('   Виджет ElemGameConsole автоматически найдёт эмулятор.');
    console.log('   Путь по умолчанию: /emulatorjs/data/\n');
}

main().catch((err) => {
    console.error('\n❌  Непредвиденная ошибка:', err.message);
    process.exit(1);
});
