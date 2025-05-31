import { PRIMARY_COLOR } from "@/utils/theme";
import { View, Text, Button } from "react-native-ui-lib";

export default function Login() {
  return (
    <View flex center>
      <View>
        <Text text60>Sign In</Text>
        <Text>To use this feature, you must be signed in</Text>
        <Button label="Continue anonymously" backgroundColor={PRIMARY_COLOR} />
        <Button label="Sign in with email" />
      </View>
    </View>
  );
}
