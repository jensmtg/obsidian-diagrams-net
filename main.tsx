import { Notice, Plugin, TFile } from 'obsidian';
import { NewView, VIEW_TYPE_NEW } from "./src/NewView";
import { EditView, VIEW_TYPE_EDIT } from "./src/EditView";

const PLUGIN_PATH = '/plugins/obsidian-diagrams-net';


export default class ObsidianDiagramsNetPlugin extends Plugin {

	
	async onload() {

		this.registerView(
			VIEW_TYPE_NEW,
			(leaf) => new NewView(leaf)
		);

		this.registerView(
			VIEW_TYPE_EDIT,
			(leaf) => new EditView(leaf)
		);

		this.registerEvent(this.app.vault.on('create', (file) => {
			if (file instanceof TFile && file.extension === 'svg') {
				this.closeViews()
			}
		}));


		// If diagram is renamed, rename it's xml-shadow.
		// FIXME: update xml-shadow in case "make a copy" of a file.
		// FIXME: delete xml-shadow in case "delete" of a file.
		this.registerEvent(this.app.vault.on('rename', (file, oldname) => {
			if (file instanceof TFile && file.extension === 'svg') {
				const shadow = this.app.vault.getAbstractFileByPath(oldname + '.xml');
				if (shadow && shadow instanceof TFile && shadow.extension === 'xml') {
					const newname = file.path
					this.app.vault.rename(shadow, newname + '.xml')
				}
			}
		}));

		this.registerEvent(this.app.vault.on('modify', (file) => {
			console.log('moduff')

			// if (file instanceof TFile && file.extension === 'svg') {
			// 	const shadow = this.app.vault.getAbstractFileByPath(oldname + '.xml');
			// 	if (shadow && shadow instanceof TFile && shadow.extension === 'xml') {
			// 		const newname = file.path
			// 		this.app.vault.rename(shadow, newname + '.xml')
			// 	}
			// }

		}));


		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				console.log('file!', file)

				// const folderOrFile = this.app.vault.getAbstractFileByPath("folderOrFile");
				if (file instanceof TFile && file.extension === 'svg') {
					menu.addItem((item) => {
						item
							.setTitle("Edit diagram")
							.setIcon("diagram")
							.onClick(async () => {
								new Notice(file.path);
								this.activateEditView(file.path);
							});
					});
				}
			})
		)

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				menu.addItem((item) => {
					item
						.setTitle("New diagram")
						.setIcon("diagram")
						.onClick(async () => {
							new Notice(view.file.path);
							this.activateNewView();
						});
				});
			})
		);

	}

	async onunload() {
		this.closeViews()
	}


	async activateNewView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEW);
		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_NEW,
			active: true,
		});
		this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(VIEW_TYPE_NEW)[0]);
	}

	async activateEditView(filePath: string) {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EDIT);
		const editPath = this.app.vault.configDir + PLUGIN_PATH + '/editPath'
		await this.app.vault.adapter.write(editPath, filePath);
		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_EDIT,
			active: true,
		});
		this.app.workspace.revealLeaf(this.app.workspace.getLeavesOfType(VIEW_TYPE_EDIT)[0]);
	}

	async closeViews() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_NEW);
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EDIT);
		const editPath = this.app.vault.configDir + PLUGIN_PATH + '/editPath'
		await this.app.vault.adapter.write(editPath, '');
	}

}


