/**
 * Font Family Options for Typography Panel
 *
 * Organized into categories for better UX:
 * - System fonts (fast, reliable)
 * - Sans-serif (modern, clean)
 * - Serif (classic, readable)
 * - Monospace (code, data)
 * - Display (headings, special)
 */

export const fontFamilyOptions = [
    // System & Default
    {
        value: '',
        label: 'По умолчанию',
        category: 'system',
        preview: 'inherit'
    },
    {
        value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        label: 'Системный',
        category: 'system',
        preview: 'system-ui'
    },

    // Sans-serif
    {
        value: '"Inter", sans-serif',
        label: 'Inter',
        category: 'sans-serif',
        preview: '"Inter", sans-serif'
    },
    {
        value: '"Roboto", sans-serif',
        label: 'Roboto',
        category: 'sans-serif',
        preview: '"Roboto", sans-serif'
    },
    {
        value: '"Open Sans", sans-serif',
        label: 'Open Sans',
        category: 'sans-serif',
        preview: '"Open Sans", sans-serif'
    },
    {
        value: '"Lato", sans-serif',
        label: 'Lato',
        category: 'sans-serif',
        preview: '"Lato", sans-serif'
    },
    {
        value: '"Montserrat", sans-serif',
        label: 'Montserrat',
        category: 'sans-serif',
        preview: '"Montserrat", sans-serif'
    },
    {
        value: '"Nunito", sans-serif',
        label: 'Nunito',
        category: 'sans-serif',
        preview: '"Nunito", sans-serif'
    },
    {
        value: '"Poppins", sans-serif',
        label: 'Poppins',
        category: 'sans-serif',
        preview: '"Poppins", sans-serif'
    },
    {
        value: '"Source Sans Pro", sans-serif',
        label: 'Source Sans Pro',
        category: 'sans-serif',
        preview: '"Source Sans Pro", sans-serif'
    },
    {
        value: '"Ubuntu", sans-serif',
        label: 'Ubuntu',
        category: 'sans-serif',
        preview: '"Ubuntu", sans-serif'
    },
    {
        value: 'Arial, sans-serif',
        label: 'Arial',
        category: 'sans-serif',
        preview: 'Arial'
    },
    {
        value: '"Helvetica Neue", Helvetica, sans-serif',
        label: 'Helvetica',
        category: 'sans-serif',
        preview: '"Helvetica Neue"'
    },

    // Serif
    {
        value: '"Playfair Display", serif',
        label: 'Playfair Display',
        category: 'serif',
        preview: '"Playfair Display", serif'
    },
    {
        value: '"Merriweather", serif',
        label: 'Merriweather',
        category: 'serif',
        preview: '"Merriweather", serif'
    },
    {
        value: '"Lora", serif',
        label: 'Lora',
        category: 'serif',
        preview: '"Lora", serif'
    },
    {
        value: '"PT Serif", serif',
        label: 'PT Serif',
        category: 'serif',
        preview: '"PT Serif", serif'
    },
    {
        value: '"Libre Baskerville", serif',
        label: 'Libre Baskerville',
        category: 'serif',
        preview: '"Libre Baskerville", serif'
    },
    {
        value: 'Georgia, serif',
        label: 'Georgia',
        category: 'serif',
        preview: 'Georgia'
    },
    {
        value: '"Times New Roman", Times, serif',
        label: 'Times New Roman',
        category: 'serif',
        preview: '"Times New Roman"'
    },

    // Monospace
    {
        value: '"JetBrains Mono", monospace',
        label: 'JetBrains Mono',
        category: 'monospace',
        preview: '"JetBrains Mono", monospace'
    },
    {
        value: '"Fira Code", monospace',
        label: 'Fira Code',
        category: 'monospace',
        preview: '"Fira Code", monospace'
    },
    {
        value: '"Source Code Pro", monospace',
        label: 'Source Code Pro',
        category: 'monospace',
        preview: '"Source Code Pro", monospace'
    },
    {
        value: '"Roboto Mono", monospace',
        label: 'Roboto Mono',
        category: 'monospace',
        preview: '"Roboto Mono", monospace'
    },
    {
        value: '"Inconsolata", monospace',
        label: 'Inconsolata',
        category: 'monospace',
        preview: '"Inconsolata", monospace'
    },
    {
        value: 'Consolas, monospace',
        label: 'Consolas',
        category: 'monospace',
        preview: 'Consolas'
    },
    {
        value: '"Courier New", Courier, monospace',
        label: 'Courier New',
        category: 'monospace',
        preview: '"Courier New"'
    },

    // Display / Decorative
    {
        value: '"Oswald", sans-serif',
        label: 'Oswald',
        category: 'display',
        preview: '"Oswald", sans-serif'
    },
    {
        value: '"Bebas Neue", sans-serif',
        label: 'Bebas Neue',
        category: 'display',
        preview: '"Bebas Neue", sans-serif'
    },
    {
        value: '"Abril Fatface", serif',
        label: 'Abril Fatface',
        category: 'display',
        preview: '"Abril Fatface", serif'
    },
    {
        value: '"Comfortaa", sans-serif',
        label: 'Comfortaa',
        category: 'display',
        preview: '"Comfortaa", sans-serif'
    },
    {
        value: '"Pacifico", cursive',
        label: 'Pacifico',
        category: 'display',
        preview: '"Pacifico", cursive'
    }
];

/**
 * Get fonts grouped by category
 */
export const fontsByCategory = {
    system: fontFamilyOptions.filter(f => f.category === 'system'),
    'sans-serif': fontFamilyOptions.filter(f => f.category === 'sans-serif'),
    serif: fontFamilyOptions.filter(f => f.category === 'serif'),
    monospace: fontFamilyOptions.filter(f => f.category === 'monospace'),
    display: fontFamilyOptions.filter(f => f.category === 'display')
};

/**
 * Category labels for display
 */
export const categoryLabels = {
    system: 'Системные',
    'sans-serif': 'Без засечек',
    serif: 'С засечками',
    monospace: 'Моноширинные',
    display: 'Декоративные'
};
