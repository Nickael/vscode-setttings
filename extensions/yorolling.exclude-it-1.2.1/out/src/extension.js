"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const utils = require("./utils/utils");
const util_1 = require("util");
const rootPath = vscode.workspace.rootPath;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("extension.excludeWs", (uri) => {
        globMatch(uri, false);
    });
    // excludeglobal
    context.subscriptions.push(disposable);
    context.subscriptions.push(registerGlobal(context));
}
exports.activate = activate;
function registerGlobal(context) {
    let disposable = vscode.commands.registerCommand("extension.excludeglobal", (uri) => {
        globMatch(uri, true);
    });
    return disposable;
}
/**
 * show file glob quick pick to decide which `glob` will be add to exluded
 * @author YoRolling
 * @since 1.0.0
 * @param {string[]} items
 * @returns
 */
function shouldShowPicker(items) {
    return vscode.window.showQuickPick(items, {
        canPickMany: true
    });
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
/**
 * flush config to settings.json
 * @author YoRolling
 * @since 1.0.0
 * @param {string} key
 * @param {*} values
 * @returns
 */
function flushConf(key, values, global) {
    if (util_1.isNullOrUndefined(key)) {
        vscode.window.showErrorMessage(`E1000001: Internal error`);
        return;
    }
    if (util_1.isNullOrUndefined(values)) {
        vscode.window.showErrorMessage(`E1000002: Internal error`);
        return;
    }
    const config = vscode.workspace.getConfiguration("files");
    let clude = config.get("exclude");
    if (!clude) {
        clude = {};
    }
    try {
        Array.from(new Set(values)).filter((v) => v !== '*').forEach((glob) => {
            clude[glob] = true;
        });
        config.update("exclude", clude, global).then(() => {
            vscode.window.showInformationMessage("♡ You got it!");
        });
    }
    catch (error) {
    }
}
/**
 *
 *
 * @param {vscode.Uri} uri
 * @param {boolean} [isGlobal=true]
 */
function globMatch(uri, isGlobal = true) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const realPath = uri.fsPath;
            const fileMeta = (yield utils.parseFilePath(realPath, rootPath));
            const isFile = yield utils.isFile(realPath);
            const isFolder = yield utils.isFolder(realPath);
            let result;
            let glob = [];
            if (isFile) {
                Object.keys(fileMeta).forEach(key => {
                    let r = undefined;
                    switch (key) {
                        case "path":
                            break;
                        case "extname":
                            r = fileMeta[key] ? `**/*${fileMeta[key]}` : undefined;
                            break;
                        case "basename":
                            r = fileMeta[key];
                            break;
                        case "dirname":
                            r = fileMeta[key]
                                ? `${fileMeta[key] + "/"}*.*`
                                : undefined;
                            break;
                    }
                    if (r) {
                        glob.push(r);
                    }
                });
                if (fileMeta["dirname"]) {
                    if (fileMeta["extname"]) {
                        glob.push(`${fileMeta["dirname"]}/*${fileMeta["extname"]}`);
                    }
                }
                else {
                    if (fileMeta["extname"]) {
                        glob.push(`*${fileMeta["extname"]}`);
                    }
                }
                if (fileMeta["basename"]) {
                    glob.push(`**/${fileMeta["basename"]}`);
                    if (fileMeta['dirname']) {
                        glob.push(`${fileMeta['dirname']}/${fileMeta["basename"]}`);
                    }
                }
                result = yield shouldShowPicker(glob);
            }
            else if (isFolder) {
                result = [`${fileMeta.basename}`];
            }
            if (result) {
                flushConf("files.exclude", result, isGlobal);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(error.message || error);
        }
    });
}
//# sourceMappingURL=extension.js.map