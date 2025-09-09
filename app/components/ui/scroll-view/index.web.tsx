import React from "react";
import type { VariantProps } from "@gluestack-ui/nativewind-utils";
import { scrollViewStyle } from "./styles";

type IScrollViewProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof scrollViewStyle>;

const ScrollView = React.forwardRef<React.ComponentRef<"div">, IScrollViewProps>(
  function ScrollView({ className, ...props }, ref) {
    return <div ref={ref} {...props} className={scrollViewStyle({ class: className })} />;
  },
);

ScrollView.displayName = "ScrollView";
export { ScrollView };
