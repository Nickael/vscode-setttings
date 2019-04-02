"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Escapes angle brackets and quotes.
 * @param str The string to escape.
 */
function escape(str) {
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
exports.escape = escape;
/**
 * Class for wrapping raw HTML values.
 * These will not be escaped by {@link html}.
 */
class HtmlString {
    /**
     * Creates a new instance of the HtmlString class.
     * @param content The HTML content.
     */
    constructor(content) {
        this.content = content;
    }
    toString() {
        return this.content;
    }
}
exports.HtmlString = HtmlString;
/**
 * Creates a raw HTML string.
 * @param str The HTML content.
 */
exports.raw = (str) => new HtmlString(str);
/**
 * Tagged template string function for creating HTML, automatically escaping all inputs.
 * If an input should not be escaped use {@link raw}
 */
exports.html = (strings, ...values) => {
    const out = [];
    let stringIndex = 0;
    let valueIndex = 0;
    for (let i = 0; i < strings.length + values.length; i++) {
        if (i % 2 == 0) {
            out.push(strings[stringIndex++]);
        }
        else {
            const value = values[valueIndex++];
            const pushValue = (single) => out.push(single instanceof HtmlString ? single.content : escape(single.toString()));
            if (Array.isArray(value))
                value.forEach(pushValue);
            else
                pushValue(value);
        }
    }
    return exports.raw(out.join(''));
};
//# sourceMappingURL=html.js.map