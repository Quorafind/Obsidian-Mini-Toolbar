import "./style.less";

import { getApi } from "@aidenlx/obsidian-icon-shortcodes";
import { EditorState, StateField } from "@codemirror/state";
import { BaseComponent, ButtonComponent, Component } from "obsidian";

import { showTooltip, Tooltip, tooltips } from "../popper/index";
import {
  SmallButton as SBtnDef,
  ToolBar as ToolBarDef,
} from "../typings/index";

const getCursorTooltips = (state: EditorState): Tooltip | null => {
  const sel = state.selection.ranges[0];
  if (!sel) return null;
  const { anchor, head, empty } = sel;
  return {
    start: anchor > head ? head : anchor,
    end: empty ? undefined : anchor > head ? anchor : head,
    create: (container) =>
      new ToolBar(container)
        .addSmallButton((btn) => btn.setIcon("scissors"))
        .addSmallButton((btn) => btn.setIcon("two-blank-pages"))
        .addSmallButton((btn) => btn.setIcon("bold-glyph"))
        .addSmallButton((btn) => btn.setIcon("underline-glyph"))
        .addSmallButton((btn) => btn.setIcon("strikethrough-glyph"))
        .addSmallButton((btn) => btn.setIcon("quote-glyph")),
  };
};

export const cursorTooltipField = StateField.define<Tooltip | null>({
  create: getCursorTooltips,

  update: (tooltips, tr) => {
    if (!tr.docChanged && !tr.selection) return tooltips;
    return getCursorTooltips(tr.state);
  },

  // enable showtooltips extension with tooltips info provided from statefield
  provide: (f) => showTooltip.from(f),
});

export const ToolBarExtension = [cursorTooltipField];

class SmallButton extends BaseComponent implements SBtnDef {
  button: ButtonComponent;
  disabled = false;
  constructor(containerEl: HTMLElement) {
    super();
    this.button = new ButtonComponent(containerEl);
  }
  setDisabled(disabled: boolean): this {
    this.button.setDisabled(disabled);
    this.disabled = disabled;
    return this;
  }
  /**
   * @param iconId icon name in obsidian or icon shortcode
   */
  setIcon(iconId: string): this {
    const iconSize = 14;
    this.button.setIcon(iconId);
    let iconSC, icon;
    if (
      !this.button.buttonEl.querySelector("svg") &&
      (iconSC = getApi()) &&
      (icon = iconSC.getIcon(iconId, false))
    ) {
      const sizeAttr = {
        width: iconSize,
        height: iconSize,
      };
      if (typeof icon === "string") {
        this.button.buttonEl.createDiv({ text: icon, attr: sizeAttr });
      } else {
        Object.assign(icon, sizeAttr);
        this.button.buttonEl.appendChild(icon);
      }
    }
    return this;
  }
  setTooltip(tooltip: string): this {
    this.button.setTooltip(tooltip);
    return this;
  }
  onClick(cb: (evt: MouseEvent) => void): this {
    this.button.onClick(cb);
    return this;
  }
  then(cb: (component: this) => any): this {
    cb(this);
    return this;
  }
}
export class ToolBar extends Component implements ToolBarDef {
  dom: HTMLElement;
  smallBtnContainer: HTMLElement;
  constructor(container: HTMLElement) {
    super();
    this.dom = container.createDiv(
      { cls: "cm-mini-toolbar" },
      (el) => (el.style.position = "absolute"),
    );
    this.smallBtnContainer = this.dom;
  }
  addSmallButton(cb: (button: SmallButton) => any): this {
    cb(new SmallButton(this.smallBtnContainer));
    return this;
  }
  unloading: boolean = false;
  hide() {
    this.unload();
    if (this.unloading) return this;
    this.unloading = true;
    this.dom.detach();
    this.unloading = false;
    return this;
  }
}
