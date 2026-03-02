/**
 * Handwriting Font Definitions
 *
 * Google Fonts that give a handwritten/casual feel to sticker notes.
 * These fonts are loaded dynamically when the sticker uses handwriting mode.
 */

export const handwritingFonts = {
    caveat: {
        name: 'caveat',
        label: 'Caveat',
        fontFamily: "'Caveat', cursive",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap',
        preview: 'The quick brown fox'
    },
    indieFlower: {
        name: 'indieFlower',
        label: 'Indie Flower',
        fontFamily: "'Indie Flower', cursive",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap',
        preview: 'The quick brown fox'
    },
    patrickHand: {
        name: 'patrickHand',
        label: 'Patrick Hand',
        fontFamily: "'Patrick Hand', cursive",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap',
        preview: 'The quick brown fox'
    },
    shadows: {
        name: 'shadows',
        label: 'Shadows Into Light',
        fontFamily: "'Shadows Into Light', cursive",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap',
        preview: 'The quick brown fox'
    },
    kalam: {
        name: 'kalam',
        label: 'Kalam',
        fontFamily: "'Kalam', cursive",
        googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap',
        preview: 'The quick brown fox'
    }
};

/**
 * Get handwriting font config by name
 * @param {string} fontName - Font name key
 * @returns {object} Font configuration
 */
export function getHandwritingFont(fontName) {
    return handwritingFonts[fontName] || handwritingFonts.caveat;
}

/**
 * Font options for dropdown selectors
 */
export const handwritingFontOptions = Object.entries(handwritingFonts).map(([key, font]) => ({
    value: key,
    label: font.label,
    fontFamily: font.fontFamily
}));

/**
 * Load a Google Font dynamically
 * @param {string} fontName - Font name key
 */
export function loadHandwritingFont(fontName) {
    const font = handwritingFonts[fontName];
    if (!font) return;

    // Check if already loaded
    const existingLink = document.querySelector(`link[data-font="${fontName}"]`);
    if (existingLink) return;

    // Create and append link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = font.googleFontUrl;
    link.dataset.font = fontName;
    document.head.appendChild(link);
}

/**
 * Preload all handwriting fonts
 */
export function preloadAllHandwritingFonts() {
    Object.keys(handwritingFonts).forEach(loadHandwritingFont);
}

export default handwritingFonts;
