import { getCityAtom } from "@/utils/bookmarks";
import { useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai/react";
import { FlatList } from "react-native";

export default function CityBookmarks() {
    const { qid } = useLocalSearchParams();
    const bookmarks = useAtomValue(getCityAtom(qid as string))

    return <FlatList
      data={bookmarks}
      renderItem={({ item }) => <Card padding-8 paddingH-16 margin-8 onPress={() => router.push(`/bookmarks/${item.qid}`)}><Heading size="xl">{item.name}</Heading></Card>}
    />
}