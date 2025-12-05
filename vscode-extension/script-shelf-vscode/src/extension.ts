import * as vscode from 'vscode';
import axios from 'axios';

const API_URL = 'https://script-shelf.onrender.com/api';

interface SnippetItem extends vscode.QuickPickItem {
    codeContent: string; 
}

export function activate(context: vscode.ExtensionContext) {

    let loginDisposable = vscode.commands.registerCommand('scriptshelf.login', async () => {
        const token = await vscode.window.showInputBox({
            placeHolder: 'Paste your Auth Token here (get it from the web dashboard)',
            password: true 
        });

        if (token) {
            await context.secrets.store('authToken', token);
            vscode.window.showInformationMessage('ScriptShelf: Logged in!');
        }
    });

    let insertDisposable = vscode.commands.registerCommand('scriptshelf.insert', async () => {
        const token = await context.secrets.get('authToken');
        if (!token) {
            vscode.window.showErrorMessage('Please login first using "ScriptShelf: Login"');
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/snippets`, {
                headers: { 'x-auth-token': token }
            });

            const items: SnippetItem[] = res.data.map((s: any) => ({
                label: s.title,
                description: s.language,
                detail: s.code.substring(0, 50).replace(/\n/g, ' ') + '...', 
                codeContent: s.code 
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Search your snippets...'
            });

            if (selected) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, selected.codeContent);
                    });
                }
            }
        } catch (err) {
            vscode.window.showErrorMessage('Failed to fetch snippets. Check your connection.');
        }
    });

    let saveDisposable = vscode.commands.registerCommand('scriptshelf.save', async () => {
        const token = await context.secrets.get('authToken');
        if (!token) {
            vscode.window.showErrorMessage('Please login first.');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const selection = editor.document.getText(editor.selection);
        if (!selection) {
            vscode.window.showWarningMessage('No text selected!');
            return;
        }

        const title = await vscode.window.showInputBox({
            placeHolder: 'Name your snippet'
        });

        if (!title) return;

        const language = editor.document.languageId || 'text';

        try {
            await axios.post(`${API_URL}/snippets`, {
                title,
                code: selection,
                language,
                folder_id: null
            }, {
                headers: { 'x-auth-token': token }
            });
            vscode.window.showInformationMessage(`Saved "${title}" to ScriptShelf!`);
        } catch (err) {
            vscode.window.showErrorMessage('Failed to save snippet.');
        }
    });

    context.subscriptions.push(loginDisposable, insertDisposable, saveDisposable);
}

export function deactivate() {}