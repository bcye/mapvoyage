import { PRIMARY_COLOR } from "@/utils/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FlatList, TextInput } from "react-native";
import { Card, ListItem, View, Text } from "react-native-ui-lib";
import {
  instantMeiliSearch,
  InstantMeiliSearchInstance,
} from "@meilisearch/instant-meilisearch";
import {
  InstantSearch,
  useInfiniteHits,
  UseInfiniteHitsProps,
  useSearchBox,
  UseSearchBoxProps,
} from "react-instantsearch-core";
import { useRef, useState } from "react";

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

  function openPlace(objectID: string) {
    // TODO: Will be implemented in a later PR
    console.log(objectID);
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={items}
      keyExtractor={(item) => item.objectID}
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
          key={item.objectID}
          onPress={() => openPlace(item.objectID)}
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
