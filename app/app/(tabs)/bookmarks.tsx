import { SignedIn } from "@/utils/supabase";
import { Text } from "react-native-ui-lib";

export default function Bookmarks() {
  return (
    <SignedIn>{({ session }) => <Text>{session.user.email}</Text>}</SignedIn>
  );
}
