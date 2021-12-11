import {
  EditorView,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import type { VirtualElement } from "@popperjs/core";
import flip from "@popperjs/core/lib/modifiers/flip";
import preventOverflow from "@popperjs/core/lib/modifiers/preventOverflow";
import {
  createPopper,
  Instance as PopperInst,
} from "@popperjs/core/lib/popper-lite";

import { tooltipConfig } from "./config";
import { Tooltip } from "./define";
import { showTooltip } from "./index";

const getRectFromXY = (x = 0, y = 0): DOMRect => ({
  width: 0,
  height: 0,
  top: y,
  left: x,
  bottom: y,
  right: x,
  x,
  y,
  toJSON,
});

type Measured = {
  refRect: DOMRect;
};

type Rect = { left: number; right: number; top: number; bottom: number };
function toJSON(this: DOMRect) {
  return JSON.stringify(this);
}
const getRectFromPosCoords = (
  start: Rect | null,
  end?: Rect | null,
): DOMRect | null => {
  if (!start) return null;
  let rect = {
    ...start,
    width: 0,
    height: start.bottom - start.top,
    x: start.top,
    y: start.left,
    toJSON,
  };
  if (end) rect.width = Math.abs(end.left - start.left);
  return rect;
};
const initialRect = getRectFromXY();
class ViewPluginClass implements PluginValue {
  containerEl = this.view.dom;
  virtualEl: VirtualElement & { rect: DOMRect };
  toolbarEl: HTMLElement = this.containerEl.createDiv({ text: "Hello world" });

  tooltipInfo: Tooltip | null;
  tooltipInst: PopperInst;

  measureReq: { read: () => Measured; write: (m: Measured) => void; key: any };
  inView = true;

  constructor(readonly view: EditorView) {
    const { defaultPlacement } = view.state.facet(tooltipConfig);
    this.tooltipInfo = view.state.facet(showTooltip);
    this.virtualEl = {
      rect: initialRect,
      getBoundingClientRect() {
        return this.rect;
      },
      contextElement: this.view.scrollDOM,
    };
    this.measureReq = {
      read: this.readMeasure,
      write: this.writeMeasure,
      key: this,
    };

    this.tooltipInst = createPopper(this.virtualEl, this.toolbarEl, {
      strategy: "absolute",
      placement: defaultPlacement,
      modifiers: [
        { ...flip, options: { padding: 20 } },
        { ...preventOverflow, options: { padding: 20 } },
      ],
    });
    this.maybeMeasure();
  }
  update(update: ViewUpdate) {
    let input = update.state.facet(showTooltip);
    let updated = input !== this.tooltipInfo;
    if (updated) this.tooltipInfo = input;
    let shouldMeasure = updated || update.geometryChanged;
    let newConfig = update.state.facet(tooltipConfig);
    if (newConfig.defaultPlacement != this.tooltipInst.state.placement) {
      this.tooltipInst.setOptions({ placement: newConfig.defaultPlacement });
    }
    if (shouldMeasure) this.maybeMeasure();
  }
  destroy(): void {
    this.tooltipInst.destroy();
    this.toolbarEl.remove();
  }

  readMeasure = (): Measured => {
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
        return { refRect };
      }
    }
    return { refRect: initialRect };
  };
  writeMeasure = (measured: Measured) => {
    this.virtualEl.rect = measured.refRect;
    this.tooltipInst.update();
  };

  maybeMeasure() {
    if (this.view.inView) this.view.requestMeasure(this.measureReq);
    if (this.inView != this.view.inView) {
      this.inView = this.view.inView;
      if (!this.inView) {
        // this.tooltipInst.setOptions((opts) => ({
        //   modifiers: [...(opts?.modifiers ?? [])],
        // }));
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
