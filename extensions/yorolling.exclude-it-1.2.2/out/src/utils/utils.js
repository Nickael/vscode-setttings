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
const fs_1 = require("fs");
const util_1 = require("util");
const path = require("path");
/**
 *  检测文件或者目录是否存在
 * @author YoRolling
 * @export
 * @param {string} _path
 * @returns {(Promise<boolean | Error>)}
 * @version 0.0.1
 */
function exist(_path) {
    if (isUnavail(_path)) {
        return Promise.reject(new Error(`${_path} should has a falsy value`));
    }
    return new Promise((res, rej) => {
        fs_1.access(_path, (error) => {
            if (util_1.isNullOrUndefined(error)) {
                res(true);
            }
            else {
                rej(error);
            }
        });
    });
}
exports.exist = exist;
/**
 * 检测传入路径是否合法
 * @author YoRolling
 * @param {string} _path file path or folder's
 * @returns {boolean}
 */
function isUnavail(_path) {
    return util_1.isNullOrUndefined(_path) || _path === '';
}
/**
 * get stats for _path
 * @author YoRolling`
 * @export
 * @param {string} _path
 * @returns {(Promise<Stats | Error >)}
 */
function lsStat(_path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isUnavail(_path)) {
            return Promise.reject(false);
        }
        try {
            yield exist(_path);
            return new Promise((res, rej) => {
                fs_1.lstat(_path, (error, stats) => {
                    if (!util_1.isNullOrUndefined(error)) {
                        rej(error);
                    }
                    else {
                        res(stats);
                    }
                });
            });
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
exports.lsStat = lsStat;
/**
 * @author YoRolling
 * @version 0.1.1
 * @export
 * @param {string} _path
 * @returns {(Promise<boolean | Error>)}
 */
function isFile(_path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isUnavail(_path)) {
            return false;
        }
        try {
            const stats = yield lsStat(_path);
            return stats.isFile();
        }
        catch (error) {
            return false;
        }
    });
}
exports.isFile = isFile;
function isFolder(_path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isUnavail(_path)) {
            return false;
        }
        try {
            const stats = yield lsStat(_path);
            return stats.isDirectory();
        }
        catch (error) {
            return false;
        }
    });
}
exports.isFolder = isFolder;
/**
 * @author YoRolling
 * @param filePath
 */
function parseFilePath(filePath, rootPath = '') {
    return __awaiter(this, void 0, void 0, function* () {
        if (isUnavail(filePath)) {
            return Promise.reject(new Error(`${filePath} should have a fasly value`));
        }
        try {
            yield exist(filePath);
            const extname = path.extname(filePath);
            const basename = path.basename(filePath);
            const dirname = path.relative(rootPath, path.dirname(filePath));
            return {
                path: filePath,
                extname,
                basename,
                dirname
            };
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
exports.parseFilePath = parseFilePath;
//# sourceMappingURL=utils.js.map