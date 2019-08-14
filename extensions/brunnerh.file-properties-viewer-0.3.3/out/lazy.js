"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Decorator for a get-only property to turn it into a automatically caching property.
 */
exports.lazy = (target, propertyKey, propertyDescriptor) => {
    const defineHidden = (target, key) => Object.defineProperty(target, key, {
        writable: true,
        enumerable: false,
    });
    const valueKey = `__${String(propertyKey)}_value`;
    const hasValueKey = `__${String(propertyKey)}_has_value`;
    return {
        get: function () {
            if (this[hasValueKey] !== true) {
                defineHidden(this, valueKey);
                defineHidden(this, hasValueKey);
                this[valueKey] = propertyDescriptor.get.bind(this)();
                this[hasValueKey] = true;
            }
            return this[valueKey];
        }
    };
};
//# sourceMappingURL=lazy.js.map