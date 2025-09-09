import React from "react";
import { ScrollView as RNScrollView, ScrollViewProps } from "react-native";
import type { VariantProps } from "@gluestack-ui/nativewind-utils";
import { scrollViewStyle } from "./styles";

type IScrollViewProps = ScrollViewProps &
  VariantProps<typeof scrollViewStyle> & { className?: string };

const ScrollView = React.forwardRef<
  React.ComponentRef<typeof RNScrollView>,
  IScrollViewProps
>(function ScrollView({ className, ...props }, ref) {
  return (
    <RNScrollView
      ref={ref}
      {...props}
      className={scrollViewStyle({ class: className })}
    />
  );
});

ScrollView.displayName = "ScrollView";
export { ScrollView };
