import { App, MarkdownView, Modal, TFile, Vault, View, Workspace } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { DIAGRAM_VIEW_TYPE } from './constants';
import { DiagramsApp } from './DiagramsApp';

export default class DiagramsView extends Modal {
    filePath: string;
    fileName: string;
    svgPath: string;
    xmlPath: string;
    diagramExists: boolean;
    hostView: View;
    vault: Vault;
    workspace: Workspace;
    displayText: string;

    getDisplayText(): string {
        return this.displayText ?? 'Diagram';
    }

    getViewType(): string {
        return DIAGRAM_VIEW_TYPE;
    }

    constructor(app: App, hostView: View,
        initialFileInfo: { path: string, basename: string, svgPath: string, xmlPath: string, diagramExists: boolean }) {
        super(app);
        this.filePath = initialFileInfo.path;
        this.fileName = initialFileInfo.basename;
        this.svgPath = initialFileInfo.svgPath;
        this.xmlPath = initialFileInfo.xmlPath;
        this.diagramExists = initialFileInfo.diagramExists;
        this.vault = this.app.vault;
        this.workspace = this.app.workspace;
        this.hostView = hostView
    }




    async onOpen() {

        const handleExit = async () => {
            close()
        }

        const handleSaveAndExit = async (msg: any) => {
            if (this.diagramExists) {
                saveData(msg)
                refreshMarkdownViews()
                close()
            }
            else {
                saveData(msg)
                insertDiagram()
                close()
            }
        }

        const close = () => {
            this.workspace.detachLeavesOfType(DIAGRAM_VIEW_TYPE);
            this.close();
        }

        const saveData = (msg: any) => {
            const svgData = msg.svgMsg.data
            const svgBuffer = Buffer.from(svgData.replace('data:image/svg+xml;base64,', ''), 'base64')
            if (this.diagramExists) {
                const svgFile = this.vault.getAbstractFileByPath(this.svgPath)
                const xmlFile = this.vault.getAbstractFileByPath(this.xmlPath)
                if (!(svgFile instanceof TFile && xmlFile instanceof TFile)) {
                    return
                }
                this.vault.modifyBinary(svgFile, svgBuffer)
                this.vault.modify(xmlFile, msg.svgMsg.xml)
            }
            else {
                this.vault.createBinary(this.svgPath, svgBuffer)
                this.vault.create(this.xmlPath, msg.svgMsg.xml)
            }
        }

        const refreshMarkdownViews = async () => {
            // Haven't found a way to refresh the hostView.
            // Delete the preceding image link through regular matching! and add it back in the modified content
            const editor = this.app.workspace.getActiveViewOfType(MarkdownView).editor;
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);
            const match = line.match(/\[\[.*?\]\]/);
            if (!match) return;
            const modifiedLine = line.replace(/\!\[\[/, '[[');
            editor.replaceRange(modifiedLine, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
            setTimeout(() => {
              const finalLine = modifiedLine.replace(/\[\[/, '![[');
              editor.replaceRange(finalLine, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: modifiedLine.length });
            }, 200);
        }

        const insertDiagram = () => {
            // @ts-ignore: Type not documented.
            const cursor = this.hostView.editor.getCursor();
            // @ts-ignore: Type not documented.
            this.hostView.editor.replaceRange(`![[${this.svgPath}]]`, cursor);

        }

        const container = this.containerEl.children[1];
        container.setAttr("style", "width: 100vw; height: 100vh;");


        ReactDOM.render(
            <DiagramsApp
                xmlPath={this.xmlPath}
                diagramExists={this.diagramExists}
                vault={this.vault}
                handleExit={handleExit}
                handleSaveAndExit={handleSaveAndExit}
            />,
            container
        );
    }

    async onClose() {
        ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
    }

}