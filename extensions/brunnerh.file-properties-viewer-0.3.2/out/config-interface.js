"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Config {
    static get section() {
        return vscode.workspace.getConfiguration("filePropertiesViewer");
    }
}
exports.Config = Config;
//# sourceMappingURL=config-interface.js.map