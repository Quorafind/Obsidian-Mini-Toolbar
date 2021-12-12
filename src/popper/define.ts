export interface Tooltip {
  /** The document position at which to show the tooltip. */
  start: number;
  /**
   * The end of the range annotated by this tooltip, if different from `start`.
   * should be larger than start
   **/
  end?: number;
  create: () => HTMLElement;
}

export const MiniToolbarEvtName = "editor-mini-toolbar";
