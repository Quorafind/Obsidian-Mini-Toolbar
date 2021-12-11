import { Plugin } from "obsidian";
import {
  DEFAULT_SETTINGS,
  MiniToolbarSettings,
  MiniToolbarSettingTab,
} from "settings";

export default class MiniToolbar extends Plugin {
  settings: MiniToolbarSettings = DEFAULT_SETTINGS;

  async onload() {
    console.log("loading MiniToolbar");

    await this.loadSettings();

    // this.addSettingTab(new MiniToolbarSettingTab(this.app, this));
  }

  // onunload() {
  //   console.log("unloading MiniToolbar");
  // }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}