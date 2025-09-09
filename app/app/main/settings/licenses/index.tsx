import { useRouter } from "expo-router";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";
import licenses from "@/licenses.json";

export default function LicenseListScreen() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 p-4">
      {licenses.map((pkg) => (
        <Pressable
          key={pkg.name}
          className="py-2 border-b border-gray-200"
          onPress={() =>
            router.push({
              pathname: "/main/settings/licenses/[pkg]",
              params: { pkg: pkg.name },
            })
          }
        >
          <Text bold>{pkg.name}</Text>
          <Text className="text-sm text-gray-500">{pkg.license}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export const options = {
  title: "Licenses",
};
