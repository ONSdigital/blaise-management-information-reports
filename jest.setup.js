// Jest setup / polyfills for tests.
// Some tests execute in a Node context where DOM globals (like FormData) may not exist.
// Prefer the built-in implementation shipped with Node via undici when available.

/* eslint-disable global-require */

if (typeof FormData === "undefined") {
    try {
        // Node 18+ provides FormData via undici.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { FormData: UndiciFormData } = require("undici");
        // eslint-disable-next-line no-global-assign
        global.FormData = UndiciFormData;
    } catch (e) {
        // If undici isn't available for some reason, leave it undefined.
        // Tests that rely on FormData should provide their own mock.
    }
}

// react-router (and some other libs) expect TextEncoder/TextDecoder to exist.
if (typeof TextEncoder === "undefined" || typeof TextDecoder === "undefined") {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const util = require("util");
        if (typeof TextEncoder === "undefined") {
            // eslint-disable-next-line no-global-assign
            global.TextEncoder = util.TextEncoder;
        }
        if (typeof TextDecoder === "undefined") {
            // eslint-disable-next-line no-global-assign
            global.TextDecoder = util.TextDecoder;
        }
    } catch (e) {
        // Ignore; tests requiring these globals will fail and should add a targeted mock.
    }
}

// Some Node libraries (e.g. multer) depend on setImmediate, which isn't always present in jsdom.
if (typeof setImmediate === "undefined") {
    // eslint-disable-next-line no-global-assign
    global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

if (typeof clearImmediate === "undefined") {
    // eslint-disable-next-line no-global-assign
    global.clearImmediate = (id) => clearTimeout(id);
}
