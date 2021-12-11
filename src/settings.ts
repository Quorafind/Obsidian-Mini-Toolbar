import MiniToolbar from "mt-main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface MiniToolbarSettings {}

export const DEFAULT_SETTINGS: MiniToolbarSettings = {};

export class MiniToolbarSettingTab extends PluginSettingTab {
  plugin: MiniToolbar;

  constructor(app: App, plugin: MiniToolbar) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    this.containerEl.empty();
  }
}
