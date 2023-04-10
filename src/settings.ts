import type DiagramsNet from "./main";

import { App, PluginSettingTab, Setting } from "obsidian";

export type Settings = {

	// If true, we put the newly created diagram under the attachment folder
	// specified in the vault's settings.
	createUnderVaultAttachmentsFolder: boolean;

	// If true, the newly created diagram will have filename in format of
	// ${activeFileName}-${timestamp}.
	nameWithFileNameAndTimestamp: boolean;

};

export const DEFAULT_SETTINGS: Settings = {
	createUnderVaultAttachmentsFolder: false,
	nameWithFileNameAndTimestamp: false,
};

export class DiagramsNetSettingsTab extends PluginSettingTab {

	plugin: DiagramsNet;

	constructor(app: App, plugin: DiagramsNet) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Create under the attachments folder')
			.setDesc(
				'Create new diagrams under the attachment folder defined in ' + 
				"Obsidian's settings."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.createUnderVaultAttachmentsFolder)
					.onChange(async (value) => {
						this.plugin.settings.createUnderVaultAttachmentsFolder = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Name with file name and timestamp')
			.setDesc(
				'If true, newly created embedded diagrams will have name in ' + 
				'format of ${activeFileName}-${timestamp}.'
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.nameWithFileNameAndTimestamp)
					.onChange(async (value) => {
						this.plugin.settings.nameWithFileNameAndTimestamp = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
