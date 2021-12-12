import "obsidian";

import { ToolBar } from "../modules/toolbar";
import { MiniToolbarEvtName } from "../popper/define";

declare module "obsidian" {
  interface Menu {
    dom: HTMLElement;
  }

  interface Workspace {
    trigger(
      name: typeof MiniToolbarEvtName,
      toolbar: ToolBar,
      range: EditorRange,
      editor: Editor,
      view: MarkdownView,
    ): void;
  }
}
