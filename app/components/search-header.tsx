import { PRIMARY_COLOR } from "@/utils/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { forwardRef } from "react";
import { TextInputProps, TextInput } from "react-native";
import { Card, View } from "react-native-ui-lib";

export interface SearchInputUIProps {
  textInputProps: TextInputProps;
}

export const SearchHeader = forwardRef<
  TextInput,
  Omit<SearchInputUIProps, "ref">
>(function SearchHeader({ textInputProps }, ref) {
  return (
    <View padding-8 paddingT-20 paddingB-16 backgroundColor={PRIMARY_COLOR}>
      <Card
        borderRadius={50}
        paddingV-8
        paddingH-16
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <TextInput
          placeholder="Search"
          style={{ flex: 1, fontSize: 16 }}
          ref={ref}
          {...textInputProps}
        />
        <MaterialCommunityIcons name="magnify" size={20} color="grey" />
      </Card>
    </View>
  );
});
SearchHeader.displayName = "SearchHeader";
