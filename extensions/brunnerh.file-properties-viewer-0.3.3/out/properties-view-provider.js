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
const vscode = require("vscode");
const fs = require("fs");
const path_1 = require("path");
const prettyBytes = require("pretty-bytes");
const util_1 = require("./util");
const dateformat = require("dateformat");
const config_interface_1 = require("./config-interface");
const child_process_1 = require("child_process");
const xml2js_1 = require("xml2js");
const html_1 = require("./html");
const icons_1 = require("./icons");
function provideViewHtml(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = uri.fsPath;
        const name = path_1.basename(path);
        const directory = path_1.dirname(path);
        const stats = yield util_1.promisify(fs.stat)(path, { bigint: false }); // pretty-bytes throws for bigint
        const formatDate = (date) => {
            // Extract and only update on config changed event if performance is impacted.
            const format = config_interface_1.Config.section.get("dateTimeFormat");
            return format == null ? date.toLocaleString() : dateformat(date, format);
        };
        // Byte size redundant for sizes < 1000;
        const exactSize = stats.size >= 1000 ? ` (${stats.size} B)` : '';
        const exec = (path, args) => new Promise((res, rej) => {
            child_process_1.execFile(path, args, (error, stdout, stderr) => {
                if (error)
                    rej({ error, stderr });
                else
                    res(stdout);
            });
        });
        const copyIcon = yield icons_1.icons.copy;
        const copyButton = (text) => html_1.html `
		<button class="copy-button" onclick="copyTextToClipboard(${JSON.stringify(text)})">
			${html_1.raw(copyIcon)}
		</button>
	`;
        const fileLink = (path) => html_1.html `
		<a href="file://${path}" onclick="openFile(${JSON.stringify(path)})">
			${makePathBreakable(path)}
		</a>
	`;
        const rows = [
            new PropertyRow('Name', [name, copyButton(name)]),
            new PropertyRow('Directory', [makePathBreakable(directory), copyButton(directory)]),
            new PropertyRow('Full Path', [fileLink(path), copyButton(path)]),
            new PropertyRow('Size', prettyBytes(stats.size) + exactSize),
            new PropertyRow('Created', formatDate(stats.birthtime)),
            new PropertyRow('Changed', formatDate(stats.ctime)),
            new PropertyRow('Modified', formatDate(stats.mtime)),
            new PropertyRow('Accessed', formatDate(stats.atime)),
        ];
        // MIME Info
        if (config_interface_1.Config.section.get("queryMIME"))
            try {
                const mime = (yield exec('xdg-mime', ['query', 'filetype', path])).trim();
                rows.push(new PropertyRow('MIME Type', mime));
            }
            catch (_a) { }
        // Media Info
        if (config_interface_1.Config.section.get("queryMediaInfo"))
            try {
                const mediaXml = yield exec('mediainfo', ['--Output=xml', '--Output=XML', path]);
                rows.push(new GroupRow("Media Info"));
                const mediaContainer = yield util_1.promisify(xml2js_1.parseString)(mediaXml);
                const tracks = mediaContainer.MediaInfo.media[0].track;
                const rowTree = (parentLabel, obj, level = 0) => {
                    rows.push(new SubGroupRow(parentLabel, level));
                    Object.keys(obj)
                        .filter(key => key != "$")
                        .forEach(key => {
                        if (obj[key]) {
                            const label = key.replace(/_/g, ' ');
                            let value = obj[key][0];
                            // If object, Base64 encoded or sub-tree
                            if (typeof value == 'object') {
                                if (value.$ && value.$.dt == 'binary.base64') {
                                    value = Buffer.from(value._, 'base64').toString();
                                }
                                else {
                                    rowTree(label, value, level + 1);
                                    return;
                                }
                            }
                            rows.push(new PropertyRow(label, value, level + 1));
                        }
                    });
                };
                tracks.forEach(track => {
                    rowTree(track.$.type, track);
                });
            }
            catch (_b) { }
        const defaultStylePath = path_1.join(__dirname, '../styles/default.css');
        const stylePath = config_interface_1.Config.section.get("outputStylePath");
        const style = (yield util_1.promisify(fs.readFile)(stylePath ? stylePath : defaultStylePath))
            .toString();
        return html_1.html `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Document</title>
			<style>
				${html_1.raw(style)}
			</style>
			<script>
			(() =>
			{
				const vscode = acquireVsCodeApi();

				function copyTextToClipboard(text)
				{
					var textArea = document.createElement("textarea");
					textArea.value = text;

					document.body.appendChild(textArea);
					textArea.select();

					try
					{
						document.execCommand('copy');
					}
					finally
					{
						textArea.remove();
					}
				}

				function openFile(path)
				{
					vscode.postMessage({ command: 'open', path });
				}

				function post(data)
				{
					vscode.postMessage(data);
				}

				Object.assign(window, { copyTextToClipboard, openFile, post });
			})();
			</script>
		</head>
		<body>
			<table>
				<thead>
					<tr class="column-header-row">
						<th class="column-header-cell">Property</th>
						<th class="column-header-cell">Value</th>
					</tr>
				</thead>
				<tbody>
					${rows.map(r => r.toHTML())}
				</tbody>
			</table>
			<script>
				// post({ command: 'log', data: document.documentElement.outerHTML });
			</script>
		</body>
		</html>
	`.content;
        /**
         * Inserts a zero-width-space after every slash to create line-break opportunities.
         * @param path Path to process.
         */
        function makePathBreakable(path) {
            return path.replace(/([\/\\])/g, substr => `${substr}\u200B`);
        }
    });
}
exports.provideViewHtml = provideViewHtml;
class TableRow {
}
class PropertyRow extends TableRow {
    constructor(key, value, indent = 0) {
        super();
        this.key = key;
        this.value = value;
        this.indent = indent;
    }
    toHTML() {
        return html_1.html `<tr class="property-row">
			<td class="indent-${this.indent}" class="key-cell">${this.key}</td>
			<td class="value-cell">${this.value}</td>
		</tr>`;
    }
}
class GroupRow extends TableRow {
    constructor(label) {
        super();
        this.label = label;
    }
    toHTML() {
        return html_1.html `<tr class="group-row">
			<th colspan="2" class="group-cell">${this.label}</th>
		</tr>`;
    }
}
class SubGroupRow extends TableRow {
    constructor(label, indent = 0) {
        super();
        this.label = label;
        this.indent = indent;
    }
    toHTML() {
        return html_1.html `<tr class="sub-group-row">
			<td colspan="2" class="indent-${this.indent} sub-group-cell">${this.label}</td>
		</tr>`;
    }
}
function viewPropertiesCommand(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (uri == null && vscode.window.activeTextEditor == null ||
            uri != null && uri.scheme != 'file') {
            vscode.window.showWarningMessage("Cannot stat this item.");
            return;
        }
        const finalUri = uri || vscode.window.activeTextEditor.document.uri;
        const path = finalUri.fsPath;
        const name = path.split(/[\/\\]/).reverse()[0];
        const panel = vscode.window.createWebviewPanel('file-properties', `Properties of ${name}`, vscode.ViewColumn.Two, {
            enableFindWidget: true,
            enableScripts: true,
        });
        panel.webview.html = yield provideViewHtml(finalUri);
        panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            try {
                switch (message.command) {
                    case 'open':
                        const uri = vscode.Uri.file(message.path);
                        const document = yield vscode.workspace.openTextDocument(uri);
                        vscode.window.showTextDocument(document);
                        break;
                    case 'log':
                        console.log(message.data);
                        break;
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to handle webview message: ${JSON.stringify(message)}\n` +
                    `Error: ${error}`);
            }
        }));
        const updateHandlers = [
            vscode.workspace.onDidSaveTextDocument((e) => __awaiter(this, void 0, void 0, function* () {
                if (e.uri.toString() == finalUri.toString())
                    panel.webview.html = yield provideViewHtml(finalUri);
            })),
            vscode.workspace.onDidChangeConfiguration(() => __awaiter(this, void 0, void 0, function* () {
                panel.webview.html = yield provideViewHtml(finalUri);
            })),
        ];
        panel.onDidDispose(() => {
            updateHandlers.forEach(h => h.dispose());
        });
    });
}
exports.viewPropertiesCommand = viewPropertiesCommand;
//# sourceMappingURL=properties-view-provider.js.map