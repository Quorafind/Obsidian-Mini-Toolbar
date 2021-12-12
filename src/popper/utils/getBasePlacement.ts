import { BasePlacement, Placement } from "@floating-ui/core/src/types";

export const getBasePlacement = (placement: Placement): BasePlacement => {
  return placement.split("-")[0] as BasePlacement;
};
