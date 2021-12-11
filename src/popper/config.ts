import { Extension, Facet } from "@codemirror/state";
import { Placement } from "@popperjs/core";

type TooltipConfig = {
  defaultPlacement: Placement;
};
export const tooltipConfig = Facet.define<
  Partial<TooltipConfig>,
  TooltipConfig
>({
  combine: (values) => ({
    defaultPlacement:
      values.find((conf) => conf.defaultPlacement)?.defaultPlacement || "top",
  }),
});
/// Return an extension that configures tooltip behavior.

export const tooltips = (
  config: {
    /**
     * The default placement of the tooltip
     */
    defaultPlacement?: Placement;
  } = {},
): Extension => tooltipConfig.of(config);
