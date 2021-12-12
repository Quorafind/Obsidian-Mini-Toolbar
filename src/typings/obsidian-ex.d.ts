import "obsidian";

import { MiniToolbarEvtName } from "../popper/define";

declare module "obsidian" {
  interface Menu {
    dom: HTMLElement;
  }

  interface Workspace {
    trigger(
      name: typeof MiniToolbarEvtName,
      toolbar: HTMLElement,
      range: EditorRange,
      editor: Editor,
      view: MarkdownView,
    ): void;
  }
}
