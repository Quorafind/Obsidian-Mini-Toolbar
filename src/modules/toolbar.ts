import { EditorState, StateField } from "@codemirror/state";

import { showTooltip, Tooltip, tooltips } from "./tooltip";

const getCursorTooltips = (state: EditorState): readonly Tooltip[] => {
  return state.selection.ranges
    .filter((range) => range.empty)
    .map((range) => {
      let line = state.doc.lineAt(range.head);
      let text = line.number + ":" + (range.head - line.from);
      return {
        pos: range.head,
        above: true,
        strictSide: true,
        arrow: true,
        create: () => {
          let dom = document.createElement("div");
          dom.className = "cm-tooltip-cursor";
          dom.textContent = text;
          return { dom };
        },
      };
    });
};

export const cursorTooltipField = StateField.define<readonly Tooltip[]>({
  create: getCursorTooltips,

  update: (tooltips, tr) => {
    if (!tr.docChanged && !tr.selection) return tooltips;
    return getCursorTooltips(tr.state);
  },

  provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
});

export const ToolBar = [tooltips({ position: "absolute" }), cursorTooltipField];
