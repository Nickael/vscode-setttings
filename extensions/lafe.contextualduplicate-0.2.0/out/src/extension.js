'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    var duplicateCodeCommand = vscode.commands.registerCommand('lafe.duplicateCode', duplicateCode);
    context.subscriptions.push(duplicateCodeCommand);
}
exports.activate = activate;
function duplicateCode() {
    var editor = vscode.window.activeTextEditor;
    var document = editor.document;
    var selections = editor.selections;
    var newSelections = [];
    var _loop_1 = function(i) {
        var selection = selections[i];
        if (selection.isEmpty) {
            //Duplicate line
            editor.edit(function (textEdit) {
                var text = editor.document.lineAt(selection.start.line).text;
                textEdit.insert(new vscode.Position(selection.start.line, text.length), "\r\n" + text);
            });
        }
        else {
            var text_1 = editor.document.getText(selection);
            editor.edit(function (textEdit) {
                //Duplicate fragment
                textEdit.insert(selection.end, text_1);
            }).then(function () {
                //Modify new selection (it contains the old one plus the new one)
                var extendedSelections = editor.selections;
                var newSelectionStart = selection.end;
                var newSelectionEnd = extendedSelections[i].end;
                var newSelection = new vscode.Selection(newSelectionStart, newSelectionEnd);
                newSelections.push(newSelection);
                editor.selections = newSelections;
            });
        }
    };
    for (var i = 0; i < selections.length; i++) {
        _loop_1(i);
    }
}
//# sourceMappingURL=extension.js.map