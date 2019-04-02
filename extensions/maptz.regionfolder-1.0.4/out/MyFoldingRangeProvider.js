"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
class MyFoldingRangeProvider {
    get configuration() { return this._configuration; }
    set configuration(value) {
        if (this._configuration !== value) {
            this._configuration = value;
        }
    }
    constructor(config) {
        this._configuration = config;
        //You may have to implement a default Folding range provider: 
        //https://github.com/Microsoft/vscode/blob/master/src/vs/editor/contrib/folding/indentRangeProvider.ts
    }
    provideFoldingRanges(document, context, token) {
        const languageId = document.languageId;
        const currentLanguageConfig = this._configuration["[" + languageId + "]"];
        if ((typeof currentLanguageConfig === "undefined") || !currentLanguageConfig) {
            return [];
        }
        let regionTags = [currentLanguageConfig];
        var startedRegions = [];
        var completedRegions = [];
        var text = document.getText();
        var lines = text.split("\n");
        var errors = [];
        for (let i = 0; i < lines.length; i++) {
            var line = lines[i];
            for (let regionTag of regionTags) {
                var start = new RegExp(regionTag.foldStartRegex, "i"); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
                var end = new RegExp(regionTag.foldEndRegex, "i");
                if (start.exec(line)) {
                    var match = line.match(regionTag.foldStartRegex);
                    var name = match.length > 1 ? match[1] : "";
                    startedRegions.push({
                        lineStart: i,
                        name: name
                    });
                }
                else if (end.exec(line)) {
                    if (startedRegions.length === 0) {
                        errors.push(`Found an end region with no matching start tag at line ${i}`);
                        continue;
                    }
                    var lastStartedRegion = startedRegions[startedRegions.length - 1];
                    lastStartedRegion.lineEnd = i;
                    var foldingRange = new vscode.FoldingRange(lastStartedRegion.lineStart, i, vscode.FoldingRangeKind.Region);
                    completedRegions.push(foldingRange);
                    startedRegions.pop();
                }
            }
        }
        if (startedRegions.length > 0) {
            for (let err of startedRegions) {
                errors.push(`Found a started region with no matching end tag at line ${err.lineStart}`);
            }
        }
        return completedRegions;
    }
}
exports.MyFoldingRangeProvider = MyFoldingRangeProvider;
//# sourceMappingURL=MyFoldingRangeProvider.js.map