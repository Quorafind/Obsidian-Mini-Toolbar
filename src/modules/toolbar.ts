import { EditorState, StateField } from "@codemirror/state";

import { showTooltip, Tooltip, tooltips } from "../popper/index";

const getCursorTooltips = (state: EditorState): Tooltip | null => {
  const sel = state.selection.ranges[0];
  if (!sel) return null;
  const { anchor, head, empty } = sel;
  return {
    start: anchor > head ? head : anchor,
    end: empty ? undefined : anchor > head ? anchor : head,
    create: () => {
      return createDiv({ cls: "cm-mini-toolbar", text: "Hello World" });
    },
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

export const ToolBar = [cursorTooltipField];
