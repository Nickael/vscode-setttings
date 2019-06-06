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
const subdir = require('subdir');
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
function flushConf(key, values, global, uri) {
    if (values && values.length === 0) {
        return false;
    }
    if (util_1.isNullOrUndefined(key)) {
        vscode.window.showErrorMessage(`E1000001: Internal error`);
        return;
    }
    if (util_1.isNullOrUndefined(values)) {
        vscode.window.showErrorMessage(`E1000002: Internal error`);
        return;
    }
    const config = vscode.workspace.getConfiguration("files", uri);
    const defaultValue = config.inspect("exclude");
    let clude;
    if (defaultValue !== undefined) {
        clude = global === true ? defaultValue.globalValue : defaultValue.workspaceFolderValue;
    }
    if (clude === undefined) {
        clude = {};
    }
    try {
        Array.from(new Set(values))
            .filter(v => v !== "*")
            .forEach((glob) => {
            clude[glob] = true;
        });
        let target = global
            ? vscode.ConfigurationTarget.Global
            : vscode.ConfigurationTarget.Workspace;
        if (!global && isMultiRoot()) {
            const config = getExtenstionConfig(uri);
            let isFlushFolder = config.get('folder');
            target = isFlushFolder ? vscode.ConfigurationTarget.WorkspaceFolder : vscode.ConfigurationTarget.Workspace;
        }
        config.update("exclude", clude, target).then(() => {
            vscode.window.showInformationMessage("♡ You got it!");
        });
    }
    catch (error) { }
}
/**
 *
 * @author YoRolling
 * @version 1.2.0
 * @returns {boolean}
 */
function isMultiRoot() {
    if (vscode.workspace.workspaceFolders) {
        return vscode.workspace.workspaceFolders.length > 1;
    }
    return false;
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
            const rootPath = getRoot(uri) || '';
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
                    if (fileMeta["dirname"]) {
                        glob.push(`${fileMeta["dirname"]}/${fileMeta["basename"]}`);
                    }
                }
                result = yield shouldShowPicker(glob);
            }
            else if (isFolder) {
                result = [`${fileMeta.basename}`];
            }
            if (result) {
                flushConf("files.exclude", result, isGlobal, uri);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(error.message || error);
        }
    });
}
/**
 * get real root path for multiRoot
 * @author YoRolling
 * @version 1.2.0
 * @param {vscode.Uri} uri file uri
 * @returns {string}
 */
function getRoot(uri) {
    if (isMultiRoot() && vscode.workspace.workspaceFolders) {
        let matchRoot = vscode.workspace.workspaceFolders
            .filter((wf) => {
            return isParentPath(uri.fsPath, wf.uri.fsPath);
        })
            .map(v => v.uri.fsPath);
        return matchRoot[0];
    }
    else {
        return rootPath || "";
    }
}
/**
 * get extension configurations
 * @author YoRolling
 * @version 1.2.0
 * @returns {vscode.WorkspaceConfiguration}
 */
function getExtenstionConfig(uri) {
    const config = vscode.workspace.getConfiguration("excludeIt", uri);
    console.log('config', JSON.stringify(config));
    return config;
}
/**
 *
 * @author YoRolling
 * @version 1.2.0
 * @param {string} source
 * @param {string} target
 * @returns {boolean}
 */
function isParentPath(source, target) {
    return subdir(target, source);
}
//# sourceMappingURL=extension.js.map