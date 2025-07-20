import { citiesAtom } from "@/utils/bookmarks";
import { useAtom } from "jotai/react";
import { Text } from "@/components/ui/text";
import { FlatList } from "react-native";
import { Card } from "react-native-ui-lib";
import { Heading } from "@/components/ui/heading";
import { useRouter } from "expo-router";

export default function Bookmarks() {
  const [cities] = useAtom(citiesAtom);
  const router = useRouter();

  if (cities.length === 0) { 
    return <Text className="text-center text-2xl font-bold m-20">You haven't added any bookmarks yet.</Text>
  } else {
    return <FlatList
      data={cities}
      renderItem={({ item }) => <Card padding-8 paddingH-16 margin-8 onPress={() => router.push(`/bookmarks/${item.qid}`)}><Heading size="xl">{item.name}</Heading></Card>}
    />
  }
}
