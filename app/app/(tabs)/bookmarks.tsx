import { citiesAtom } from "@/utils/bookmarks";
import { useAtom } from "jotai/react";
import { Text } from "@/components/ui/text";
import { FlatList } from "react-native";

export default function Bookmarks() {
  const [cities, setCities] = useAtom(citiesAtom);
  
  if (cities.length === 0) { 
    return <Text className="text-center text-2xl font-bold m-20">You haven't added any bookmarks yet.</Text>
  } else {
    return <FlatList
      data={cities}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  }
}
