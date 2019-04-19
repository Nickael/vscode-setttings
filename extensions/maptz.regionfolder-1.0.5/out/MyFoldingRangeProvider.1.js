"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
class MyFoldingRangeProvider {
    static getRegionsTags() {
        var retval = [];
        retval.push({
            language: ["c#"],
            end: "/\\*[\\s]*#endregion",
            start: "^[\\s]*/\\*[\\s]*#region[\\s]*(.*)[\\s]*\\*/[\\s]*$"
        }, {
            language: ["html"],
            end: "\\<!--[\\s]*#endregion",
            start: "\\<!--[\\s]*#region[\\s]*(.*)"
        }, {
            language: ["twig"],
            end: "\\<!--[\\s]*#endregion",
            start: "\\<!--[\\s]*#region[\\s]*(.*)"
        }, {
            language: ["dart"],
            end: "//[\\s]*#endregion",
            start: "//[\\s]*#region[\\s]*(.*)"
        }, {
            language: ["fish"],
            end: "[\\s]*#endregion",
            start: "[\\s]*#region[\\s]*(.*)"
        }, {
            language: ["swift"],
            end: "//[\\s]*#endregion",
            start: "//[\\s]*#region[\\s]*(.*)"
        }, {
            language: ["lua"],
            end: "--[\\s]*#endregion",
            start: "--[\\s]*#region[\\s]*(.*)"
        }, {
            language: ["ahk"],
            end: ";[\\s]*#endregion",
            start: ";[\\s]*#region[\\s]*(.*)"
        }, {
            language: ["go"],
            end: "//[\\s]*#endregion",
            start: "^[\\s]*//[\\s]*#region[\\s]*(.*)[\\s]*[\\s]*$"
        }, {
            language: ["php"],
            end: "/\\*[\\s]*#endregion",
            start: "^[\\s]*/\\*[\\s]*#region[\\s]*(.*)[\\s]*\\*/[\\s]*$"
        });
        return retval;
    }
    provideFoldingRanges(document, context, token) {
        var startedRegions = [];
        var completedRegions = [];
        var text = document.getText();
        var lines = text.split("\n");
        var regionTags = MyFoldingRangeProvider.getRegionsTags();
        var errors = [];
        for (let i = 0; i < lines.length; i++) {
            var line = lines[i];
            for (let regionTag of regionTags) {
                var start = new RegExp(regionTag.start, "i"); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
                var end = new RegExp(regionTag.end, "i");
                if (start.exec(line)) {
                    var match = line.match(regionTag.start);
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
//# sourceMappingURL=MyFoldingRangeProvider.1.js.map