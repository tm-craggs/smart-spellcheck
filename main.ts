import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class SmartSpellcheck extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// this adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));

		// register event to read content when it changes
		this.registerEvent(
			this.app.workspace.on('editor-change', (editor) => {
				this.readEditorContent(editor);
			})
		);

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	addStyle(){
		const styleE1 = document.createElement('style');
		styleE1.id = 'smart-spellcheck-style';
		styleE1.textContent = `
		
		/* Hide spell check highlights for all uppercase words */
		.cm-spell-error.cm-upper {
			text-decoration: none !important;
			background-color: transparent !important;
		}
	
		`;
		document.head.appendChild(styleE1)
	}
	

	readEditorContent(editor: Editor) {
		const cursor = editor.getCursor(); // Get cursor position
		const line = editor.getLine(cursor.line); // Get the content of the modified line

		const uppercaseWords = line.match(/\b[A-Z]+\b/g); // Find all uppercase words

		// Create a new line with uppercase words wrapped in <span>
		let newLine = line;
		uppercaseWords?.forEach((word) => {
			const regex = new RegExp(`\\b${word}\\b`, 'g');
			newLine = newLine.replace(regex, `<span class="cm-upper">${word}</span>`);
		});

		// Only update the line if changes were made
		if (newLine !== line) {
			editor.setLine(cursor.line, newLine);
		}
	}

}


class SettingsTab extends PluginSettingTab {
	plugin: SmartSpellcheck;

	constructor(app: App, plugin: SmartSpellcheck) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
