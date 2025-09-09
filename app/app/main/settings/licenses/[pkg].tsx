import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import licenses from "@/licenses.json";

export default function LicenseDetailScreen() {
  const { pkg } = useLocalSearchParams<{ pkg: string }>();
  const info = licenses.find((p) => p.name === pkg);
  return (
    <ScrollView className="flex-1 p-4">
      <Text bold className="mb-4">
        {info?.name}
      </Text>
      <Text className="whitespace-pre-wrap">
        {info?.text || "License not found"}
      </Text>
    </ScrollView>
  );
}

export const options = ({ params }: { params: { pkg: string } }) => ({
  title: params.pkg,
});
