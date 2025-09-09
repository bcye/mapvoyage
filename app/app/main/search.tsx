import { PRIMARY_COLOR } from "@/utils/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  InstantSearch,
  useInfiniteHits,
  UseInfiniteHitsProps,
  useSearchBox,
  UseSearchBoxProps,
} from "react-instantsearch-core";
import { FlatList, TextInput } from "react-native";
import { Card, Text, View } from "react-native-ui-lib";

// See:
// https://www.algolia.com/doc/guides/building-search-ui/going-further/native/react
// https://www.npmjs.com/package/@meilisearch/instant-meilisearch

const { searchClient } = instantMeiliSearch(
  "https://zrh.search.infra.mapvoyage.app",
  process.env.EXPO_PUBLIC_MEILISEARCH_KEY,
);

export default function Search() {
  return (
    // @ts-ignore should be right
    <InstantSearch indexName="wiki-en" searchClient={searchClient}>
      <View flex>
        <SearchBox />
        <InfiniteHits />
      </View>
    </InstantSearch>
  );
}

function InfiniteHits(props: UseInfiniteHitsProps) {
  const { items, isLastPage, showMore } = useInfiniteHits({
    ...props,
    escapeHTML: false,
  });
  const router = useRouter();

  function openPlace(objectID: string) {
    router.navigate(`/main/explore/page/${objectID}`);
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={items}
      keyExtractor={(item) => item.id}
      onEndReached={() => {
        if (!isLastPage) {
          showMore();
        }
      }}
      renderItem={({ item }) => (
        <Card
          paddingH-8
          paddingV-12
          margin-8
          key={item.id}
          onPress={() => openPlace(item.id)}
        >
          <Text text70>{item.title}</Text>
        </Card>
      )}
    />
  );
}

function SearchBox(props: UseSearchBoxProps) {
  const { query, refine } = useSearchBox(props);
  const [input, setInput] = useState("");
  const ref = useRef<TextInput | null>(null);

  function onChange(text: string) {
    setInput(text);
    refine(text);
  }

  // Synchronise with instant search, see https://www.algolia.com/doc/guides/building-search-ui/going-further/native/react/#add-a-search-box
  if (query !== input && !ref.current?.isFocused()) {
    setInput(query);
  }

  return (
    <View padding-8 paddingT-20 paddingB-16 backgroundColor={PRIMARY_COLOR}>
      <Card
        borderRadius={50}
        paddingV-8
        paddingH-16
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <TextInput
          autoFocus
          value={input}
          onChangeText={onChange}
          placeholder="Search"
          style={{ flex: 1, fontSize: 16 }}
          ref={ref}
        />
        <MaterialCommunityIcons name="magnify" size={20} color="grey" />
      </Card>
    </View>
  );
}
