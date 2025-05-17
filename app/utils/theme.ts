import { ThemeManager } from "react-native-ui-lib";

export const PRIMARY_COLOR = "#388659";

export function initialiseTheme() {
  ThemeManager.setComponentTheme("Text", (props: any) => ({
    style: [{ fontFamily: "Fraunces" }, props.style],
  }));
}
