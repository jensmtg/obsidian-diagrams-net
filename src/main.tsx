import type { Settings } from './settings';

import { addIcon, Notice, Plugin, TFile, Vault, Workspace, WorkspaceLeaf, MenuItem, MarkdownView, TAbstractFile, Menu, Editor, moment } from 'obsidian';
import { DIAGRAM_VIEW_TYPE, ICON } from './constants';
import DiagramsView from './diagrams-view';
import { DEFAULT_SETTINGS, DiagramsNetSettingsTab } from './settings'


export default class DiagramsNet extends Plugin {

	vault: Vault;
	workspace: Workspace;
	diagramsView: DiagramsView;
	settings: Settings;

	async onload() {

		await this.loadSettings();

		this.vault = this.app.vault;
		this.workspace = this.app.workspace;

		addIcon("diagram", ICON);

		this.registerView(
			DIAGRAM_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => (
				this.diagramsView = new DiagramsView(
					leaf, null, {
					path: this.activeLeafPath(this.workspace),
					basename: this.activeLeafName(this.workspace),
					svgPath: '',
					xmlPath: '',
					diagramExists: false,
				})
			)
		);

		this.addCommand({
			id: 'app:diagrams-net-new-diagram',
			name: 'New diagram',
			checkCallback: (checking: boolean) => {
				const leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						this.attemptNewDiagram()
					}
					return true;
				}
				return false;
			},
			hotkeys: []
		});


		// this.addRibbonIcon("diagram", "Insert new diagram", () => this.attemptNewDiagram() );

		this.registerEvent(
			this.app.workspace.on("file-menu", this.handleFileMenu, this)
		);

		this.registerEvent(
			this.app.workspace.on("editor-menu", this.handleEditorMenu, this)
		);


		this.registerEvent(this.app.vault.on('rename', (file, oldname) => this.handleRenameFile(file, oldname)));
		this.registerEvent(this.app.vault.on('delete', (file) => this.handleDeleteFile(file)));

		this.addSettingTab(new DiagramsNetSettingsTab(this.app, this));

	}

	isFileValidDiagram(file: TAbstractFile) {
		let itIs = false
		if (file instanceof TFile && file.extension === 'svg') {
			const xmlFile = this.app.vault.getAbstractFileByPath(this.getXmlPath(file.path));
			if (xmlFile && xmlFile instanceof TFile && xmlFile.extension === 'xml') {
				itIs = true
			}
		}
		return itIs
	}

	getXmlPath(path: string) {
		return (path + '.xml')
	}

	activeLeafPath(workspace: Workspace) {
		return workspace.activeLeaf?.view.getState().file;
	}

	activeLeafName(workspace: Workspace) {
		return workspace.activeLeaf?.getDisplayText();
	}

	getActiveFolderAndFileName() {
		const filepath = this.activeLeafPath(this.workspace);
		const lastIndex = filepath.lastIndexOf("/");
		const activeFileName = lastIndex == -1 ? filepath : filepath.substring(lastIndex + 1);
		return {
			activeFolder: filepath.substring(0, lastIndex),
			activeFileName,
			activeFileBase: activeFileName.replace(/\.[^/.]+$/, ""),
		};
	}

	async availablePath() {
		const {activeFolder, activeFileBase} = this.getActiveFolderAndFileName();

		const base = this.settings.nameWithFileNameAndTimestamp
			? `${activeFileBase}-${moment().format().replaceAll(':', '.')}.svg`
			// @ts-ignore: Type not documented.
			: await this.vault.getAvailablePathForAttachments('Diagram', 'svg');

		if (this.settings.createUnderVaultAttachmentsFolder) {

			// @ts-ignore: Type not documented.
			const attachmentFolder = this.vault.getConfig('attachmentFolderPath');
			// Attachment folder being './' means that the attachments need to be
			// in the same folder as the note.
			const fullPath = attachmentFolder === './'
				? `${activeFolder}/${base}`
				: `${attachmentFolder.endsWith('/')
					? attachmentFolder
					: attachmentFolder + '/'}${base}`;

			return {
				svgPath: fullPath,
				xmlPath: this.getXmlPath(fullPath)
			}
		}

		return {
			svgPath: base,
			xmlPath: this.getXmlPath(base)
		}
	}

	async attemptNewDiagram() {
		const { svgPath, xmlPath } = await this.availablePath()
		const fileInfo = {
			path: this.activeLeafPath(this.workspace),
			basename: this.activeLeafName(this.workspace),
			diagramExists: false,
			svgPath,
			xmlPath
		};
		this.initView(fileInfo);
	}


	attemptEditDiagram(svgFile: TFile) {
		if (!this.isFileValidDiagram(svgFile)) {
			new Notice('Diagram is not valid. (Missing .xml data)');
		}
		else {
			const fileInfo = {
				path: this.activeLeafPath(this.workspace),
				basename: this.activeLeafName(this.workspace),
				svgPath: svgFile.path,
				xmlPath: this.getXmlPath(svgFile.path),
				diagramExists: true,
			};
			this.initView(fileInfo);
		}

	}

	async initView(fileInfo: any) {
		if (this.app.workspace.getLeavesOfType(DIAGRAM_VIEW_TYPE).length > 0) {
			return
		}
		const hostView = this.workspace.getActiveViewOfType(MarkdownView);

		const leaf = this.app.workspace.splitActiveLeaf('horizontal')
		// TODO: Replace splitActiveLeaf with getLeaf, when official version => 0.15.
		// const leaf = this.app.workspace.getLeaf(true, 'horizontal')

		const diagramView = new DiagramsView(leaf, hostView, fileInfo)
		leaf.open(diagramView)
	}

	handleDeleteFile(file: TAbstractFile) {
		if (this.isFileValidDiagram(file)) {
			const xmlFile = this.app.vault.getAbstractFileByPath(this.getXmlPath(file.path));
			this.vault.delete(xmlFile)
		}
	}

	handleRenameFile(file: TAbstractFile, oldname: string) {
		if (file instanceof TFile && file.extension === 'svg') {
			const xmlFile = this.app.vault.getAbstractFileByPath(this.getXmlPath(oldname));
			if (xmlFile && xmlFile instanceof TFile && xmlFile.extension === 'xml') {
				this.vault.rename(xmlFile, this.getXmlPath(file.path))
			}
		}
	}

	handleFileMenu(menu: Menu, file: TAbstractFile) {
		if (file instanceof TFile && file.extension === 'svg') {
			menu.addItem((item) => {
				item
					.setTitle("Edit diagram")
					.setIcon("diagram")
					.onClick(async () => {
						this.attemptEditDiagram(file);
					});
			});
		}
	}

	handleEditorMenu(menu: Menu, editor: Editor, view: MarkdownView) {
		menu.addItem((item: MenuItem) => {
			item
				.setTitle("Insert new diagram")
				.setIcon("diagram")
				.onClick(async () => {
					this.attemptNewDiagram();
				});
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onunload() {
	}

}


