import { App, Editor, MarkdownView, Modal, Notice, Plugin, Menu, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactView } from "./src/ReactView";
import { NewView, VIEW_TYPE_NEW } from "./src/NewView";
import { EditView, VIEW_TYPE_EDIT } from "./src/EditView";

const PLUGIN_PATH = '/plugins/obsidian-diagrams-net';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	
	async onload() {
		await this.loadSettings();



		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			// new Notice('This is a notice!');
			// new SampleModal(this.app).open();
			// this.activateView();

		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		this.registerView(
			VIEW_TYPE_NEW,
			(leaf) => new NewView(leaf)
		);

		this.registerView(
			VIEW_TYPE_EDIT,
			(leaf) => new EditView(leaf)
		);

		this.registerEvent(this.app.vault.on('create', (file) => {
			console.log('a new file has entered the arena', file)
			if (file instanceof TFile && file.extension === 'svg') {
				this.closeViews()
			}
		}));

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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			// console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				console.log('file!', file)

				// const folderOrFile = this.app.vault.getAbstractFileByPath("folderOrFile");
				if (file instanceof TFile && file.extension === 'svg') {
					menu.addItem((item) => {
						item
							.setTitle("Edit diagram!!!")
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
						.setTitle("NEW DIAGRAM!")
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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		// const {contentEl} = this;
		// contentEl.setText('Woah!');
		ReactDOM.render(<ReactView />, this.containerEl.children[1]);
	}

	async onClose() {
		// const {contentEl} = this;
		// contentEl.empty();
		ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
