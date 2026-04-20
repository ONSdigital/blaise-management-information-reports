/* eslint-disable global-require */

if (typeof FormData === "undefined") {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { FormData: UndiciFormData } = require("undici");
        // eslint-disable-next-line no-global-assign
        global.FormData = UndiciFormData;
    } catch (e) {
    }
}

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
    }
}

if (typeof setImmediate === "undefined") {
    // eslint-disable-next-line no-global-assign
    global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

if (typeof clearImmediate === "undefined") {
    // eslint-disable-next-line no-global-assign
    global.clearImmediate = (id) => clearTimeout(id);
}
