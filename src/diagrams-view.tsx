import { ItemView, WorkspaceLeaf, Workspace, View, Vault, TFile, MarkdownView } from 'obsidian';
import { DIAGRAM_VIEW_TYPE } from './constants';
import { DiagramsApp } from './DiagramsApp';
import * as React from "react";
import * as ReactDOM from "react-dom";

export default class DiagramsView extends ItemView {
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

    constructor(leaf: WorkspaceLeaf, hostView: View,
        initialFileInfo: { path: string, basename: string, svgPath: string, xmlPath: string, diagramExists: boolean }) {
        super(leaf);
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
                const { svgFile } = await saveData(msg)
                insertDiagram(svgFile)
                close()
            }
        }

        const close = () => {
            this.workspace.detachLeavesOfType(DIAGRAM_VIEW_TYPE);
        }

        const saveData = async (msg: any) => {
            const svgData = msg.svgMsg.data
            const svgBuffer = Buffer.from(svgData.replace('data:image/svg+xml;base64,', ''), 'base64')
            let svgFile: TFile;
            let xmlFile: TFile;
            if (this.diagramExists) {
                svgFile = this.vault.getAbstractFileByPath(this.svgPath) as TFile
                xmlFile = this.vault.getAbstractFileByPath(this.xmlPath) as TFile
                if (!(svgFile instanceof TFile && xmlFile instanceof TFile)) {
                    return
                }
                this.vault.modifyBinary(svgFile, svgBuffer)
                this.vault.modify(xmlFile, msg.svgMsg.xml)

            }
            else {
                svgFile = await this.vault.createBinary(this.svgPath, svgBuffer)
                xmlFile = await this.vault.create(this.xmlPath, msg.svgMsg.xml)

            }

            // Return the TFile objects for later usage.
			// At this point the only use case is that `insertDiagram` needs the
			// newly created xml TFile object. But just to make the interface
			// clean, we return both files here, and regardless of newly created
			// or not.
            return {
                svgFile,
                xmlFile
            };
        }

        const refreshMarkdownViews = async () => {
            // Haven't found a way to refresh the hostView.
        }

        const insertDiagram = (svgFile: TFile) => {
            // @ts-ignore: Type not documented.
            const activeFilePath = this.workspace.getActiveViewOfType(MarkdownView).file;
			// Build link text from the svg file to source markdown file.
            const linkText = this.app.metadataCache.fileToLinktext(svgFile as TFile, activeFilePath.path);

            // @ts-ignore: Type not documented.
            const cursor = this.hostView.editor.getCursor();
            // @ts-ignore: Type not documented.
            this.hostView.editor.replaceRange(`![[${linkText}]]`, cursor);

        }

        const container = this.containerEl.children[1];

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