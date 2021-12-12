import {
  EditorView,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { ClientRectObject, flip } from "@floating-ui/core";
import { computePosition } from "@floating-ui/dom";
import equal from "fast-deep-equal";
import { around } from "monkey-around";
import { editorViewField, EventRef, Events, Menu } from "obsidian";

import { tooltipConfig } from "./config";
import { Tooltip } from "./define";
import { showTooltip } from "./index";
import { shift } from "./shift";

const getRectFromXY = (x = 0, y = 0): ClientRectObject => ({
  width: 0,
  height: 0,
  top: y,
  left: x,
  bottom: y,
  right: x,
  x,
  y,
});
type VirtualElement = {
  getBoundingClientRect(): ClientRectObject;
  contextElement?: Element;
};

type Rect = { left: number; right: number; top: number; bottom: number };
const getRectFromPosCoords = (
  start: Rect | null,
  end?: Rect | null,
): ClientRectObject | null => {
  if (!start) return null;
  let rect = {
    left: start.left,
    right: start.right,
    top: start.top,
    bottom: start.bottom,
    width: 0,
    height: start.bottom - start.top,
    x: start.top,
    y: start.left,
  };
  if (end) rect.width = Math.abs(end.left - start.left);
  return rect;
};
const initialRect = getRectFromXY();
class ViewPluginClass implements PluginValue {
  containerEl = this.view.dom;
  virtualEl: VirtualElement & { rect: ClientRectObject };
  toolbarEl: HTMLElement = this.containerEl.createDiv(
    { text: "Hello world" },
    (el) => {
      el.style.position = "absolute";
    },
  );

  tooltipInfo: Tooltip | null;

  inView = true;

  defaultPlacement = this.view.state.facet(tooltipConfig).defaultPlacement;
  editorMenu: {
    evtRef: EventRef;
    currMenu: Menu | null;
  };

  constructor(readonly view: EditorView) {
    this.tooltipInfo = view.state.facet(showTooltip);
    this.virtualEl = {
      rect: initialRect,
      getBoundingClientRect() {
        return this.rect;
      },
      // contextElement: this.view.scrollDOM,
    };
    this.maybeMeasure();
    this.editorMenu = {
      currMenu: null,
      evtRef: view.state
        .field(editorViewField)
        .app.workspace.on("editor-menu", (menu) => {
          const self = this;
          self.onEditorMenuOpen(menu);
          around(menu, {
            onunload: (next) =>
              function (this: Menu) {
                self.onEditorMenuClose(menu);
                return next.call(this);
              },
          });
        }),
    };
  }

  onEditorMenuOpen(menu: Menu) {
    if (!this.editorMenu.currMenu) {
      this.editorMenu.currMenu = menu;
      if (this.cachedRefRect) this.computePosition(this.cachedRefRect);
      else this.maybeMeasure();
    }
  }
  onEditorMenuClose(menu: Menu) {
    if (this.editorMenu.currMenu === menu) {
      this.editorMenu.currMenu = null;
    }
  }

  update(update: ViewUpdate) {
    let input = update.state.facet(showTooltip);
    let updated = input !== this.tooltipInfo && !equal(input, this.tooltipInfo);
    if (updated) this.tooltipInfo = input;
    let shouldMeasure = updated || update.geometryChanged;
    let newConfig = update.state.facet(tooltipConfig);
    if (newConfig.defaultPlacement != this.defaultPlacement) {
      newConfig.defaultPlacement = this.defaultPlacement;
    }
    if (shouldMeasure) this.maybeMeasure();
  }
  destroy(): void {
    this.editorMenu.currMenu = null;
    this.toolbarEl.remove();
    this.view.state
      .field(editorViewField)
      .app.workspace.offref(this.editorMenu.evtRef);
  }

  cachedRefRect: ClientRectObject | null = null;
  readFromDOM = (): void => {
    if (this.tooltipInfo) {
      let { start, end } = this.tooltipInfo;
      if (end && start === end) {
        end = undefined;
      }
      const startRect = this.view.coordsAtPos(start);
      let endRect = end ? this.view.coordsAtPos(end) : null;
      // if start and end are not visually on the same line,
      // endRect will be set to right boundary of contentDOM
      // at the same visuall line
      if (startRect && endRect && startRect.top !== endRect.top) {
        const contentRect = this.view.contentDOM.getBoundingClientRect();
        endRect = {
          left: contentRect.right,
          right: contentRect.right,
          top: startRect.top,
          bottom: startRect.bottom,
        };
      }
      const refRect = getRectFromPosCoords(startRect, endRect);
      if (refRect) {
        this.cachedRefRect = refRect;
        this.computePosition(refRect);
      }
    }
  };
  async computePosition(refRect: ClientRectObject): Promise<void> {
    this.virtualEl.rect = refRect;
    const { padding } = this.view.state.facet(tooltipConfig);
    const { x, y } = await computePosition(this.virtualEl, this.toolbarEl, {
      placement: this.defaultPlacement,
      middleware: [
        flip({ padding, boundary: this.view.scrollDOM }),
        shift({
          padding,
          boundary: this.view.scrollDOM,
          editorMenu: this.editorMenu.currMenu,
        }),
      ],
    });
    Object.assign(this.toolbarEl.style, {
      top: "0",
      left: "0",
      transform: `translate(${Math.round(x)}px,${Math.round(y)}px)`,
    });
  }

  maybeMeasure() {
    if (this.view.inView) this.view.requestMeasure({ read: this.readFromDOM });
    if (this.inView != this.view.inView) {
      this.inView = this.view.inView;
      if (!this.inView) {
      }
    }
  }
}

const tooltipPlugin = ViewPlugin.fromClass(ViewPluginClass, {
  eventHandlers: {
    scroll() {
      this.maybeMeasure();
    },
  },
});
export default tooltipPlugin;
