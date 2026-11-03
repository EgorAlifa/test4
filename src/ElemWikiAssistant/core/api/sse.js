/**
 * Потоковый разбор Server-Sent Events.
 *
 * Блоки событий разделяются пустой строкой (`\n\n` или `\r\n\r\n`).
 * В блоке учитываются строки `event:` и `data:` (несколько `data:` склеиваются через `\n`),
 * комментарии (`: keep-alive`) и прочие поля игнорируются. Данные события — JSON;
 * блок с некорректным JSON пропускается.
 */

/**
 * @param {string} block
 * @return {{ name: string, data: string } | null}
 */
function parseBlock(block) {
    let name = 'message';
    const dataLines = [];
    block.split(/\r\n|\r|\n/).forEach((line) => {
        if (!line || line[0] === ':') {
            return;
        }
        const idx = line.indexOf(':');
        const field = idx === -1 ? line : line.slice(0, idx);
        let value = idx === -1 ? '' : line.slice(idx + 1);
        if (value[0] === ' ') {
            value = value.slice(1);
        }
        if (field === 'event') {
            name = value || 'message';
        } else if (field === 'data') {
            dataLines.push(value);
        }
    });
    if (dataLines.length === 0) {
        return null;
    }
    return { name, data: dataLines.join('\n') };
}

/**
 * Создать потоковый парсер SSE.
 *
 * @param {(name: string, data: any) => void} onEvent обработчик события с разобранным JSON
 * @return {{ feed: (textChunk: string) => void, end: () => void }}
 */
export function createSseParser(onEvent) {
    let buffer = '';

    /** @param {string} block */
    const emit = (block) => {
        const parsed = parseBlock(block);
        if (!parsed) {
            return;
        }
        let data;
        try {
            data = JSON.parse(parsed.data);
        } catch (e) {
            return;
        }
        onEvent(parsed.name, data);
    };

    return {
        feed(textChunk) {
            if (!textChunk) {
                return;
            }
            buffer += textChunk;
            const re = /\r\n\r\n|\n\n|\r\r/g;
            let start = 0;
            let match;
            while ((match = re.exec(buffer)) !== null) {
                emit(buffer.slice(start, match.index));
                start = match.index + match[0].length;
            }
            buffer = buffer.slice(start);
        },
        end() {
            const rest = buffer;
            buffer = '';
            if (rest.trim()) {
                emit(rest);
            }
        }
    };
}
