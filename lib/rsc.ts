import type { JSX, ReactElement } from "react";

export type AsyncServerComponent<P = Record<string, never>> = (
  props: P,
) => Promise<ReactElement>;

export function rsc<P = Record<string, never>>(
  Component: AsyncServerComponent<P>,
): (props: P) => JSX.Element {
  return Component as unknown as (props: P) => JSX.Element;
}
