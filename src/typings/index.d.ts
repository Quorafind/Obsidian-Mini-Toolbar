import "obsidian";

import { BaseComponent, ButtonComponent, Component } from "obsidian";

declare module "obsidian" {
  interface Workspace {
    on(
      name: "editor-mini-toolbar",
      cb: (
        toolbar: ToolBar,
        range: EditorRange,
        editor: Editor,
        view: MarkdownView,
      ) => any,
    ): EventRef;
  }
}

export declare class ToolBar extends Component {
  dom: HTMLElement;
  smallBtnContainer: HTMLElement;
  constructor(container: HTMLElement);
  addSmallButton(cb: (button: SmallButton) => any): this;
  unloading: boolean;
  hide(): this;
}

export declare class SmallButton extends BaseComponent {
  button: ButtonComponent;
  disabled: boolean;
  constructor(containerEl: HTMLElement);
  setDisabled(disabled: boolean): this;
  /**
   * @param iconId icon name in obsidian or icon shortcode
   */
  setIcon(iconId: string): this;
  setTooltip(tooltip: string): this;
  onClick(cb: (evt: MouseEvent) => void): this;
  then(cb: (component: this) => any): this;
}
