'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const properties_view_provider_1 = require("./properties-view-provider");
const command_names_1 = require("./command-names");
function activate(context) {
    const commandToken = vscode.commands.registerCommand(command_names_1.viewProperties, properties_view_provider_1.viewPropertiesCommand);
    context.subscriptions.push(commandToken);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map