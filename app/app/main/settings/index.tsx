import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DevSettings } from "react-native";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";

export default function SettingsScreen() {
  const router = useRouter();
  const [sentryEnabled, setSentryEnabled] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("sentryConsent").then((v) =>
      setSentryEnabled(!!parseInt(v ?? "0")),
    );
  }, []);

  const toggleSentry = async () => {
    const next = !sentryEnabled;
    setSentryEnabled(next);
    await AsyncStorage.setItem("sentryConsent", next ? "1" : "0");
    DevSettings.reload();
  };

  return (
    <Box className="flex-1 p-4">
      <Pressable
        className="py-4 border-b border-gray-200"
        onPress={() => router.push("/main/settings/licenses")}
      >
        <Text>Licenses</Text>
      </Pressable>
      <HStack className="justify-between items-center py-4">
        <Text>Sentry telemetry</Text>
        <Pressable onPress={toggleSentry}>
          <Box
            className={`w-10 h-6 rounded-full px-1 flex-row items-center ${
              sentryEnabled ? "bg-primary-500" : "bg-gray-300"
            }`}
          >
            <Box
              className={`h-4 w-4 rounded-full bg-white transition-all ${
                sentryEnabled ? "ml-4" : "ml-0"
              }`}
            />
          </Box>
        </Pressable>
      </HStack>
    </Box>
  );
}

export const options = {
  title: "Settings",
};
