/**
 * Dynamically loads Leaflet and its plugins from CDN.
 * Replaces static npm imports so the widget works without leaflet in node_modules.
 * The promise is cached — safe to call from multiple components simultaneously.
 */

let loadPromise = null;

function loadStyle(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(script);
    });
}

export async function loadLeaflet() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
        loadStyle('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
        await Promise.all([
            loadScript('https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js'),
            loadScript('https://unpkg.com/leaflet.glify@2.2.2/dist/leaflet.glify.js'),
            loadScript('https://unpkg.com/leaflet-lasso@2.0.4/dist/leaflet-lasso.umd.min.js'),
        ]);
    })();
    return loadPromise;
}
