import PlaceCard, { Place } from "@/components/place-card";
import { SearchHeader } from "@/components/search-header";
import { Box } from "@/components/ui/box";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { useRef, useState } from "react";
import {
  InstantSearch,
  useInfiniteHits,
  UseInfiniteHitsProps,
  useSearchBox,
  UseSearchBoxProps,
} from "react-instantsearch-core";
import { FlatList, TextInput } from "react-native";

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
      <Box className="flex-auto">
        <SearchBox />
        <InfiniteHits />
      </Box>
    </InstantSearch>
  );
}

function InfiniteHits(props: UseInfiniteHitsProps) {
  const { items, isLastPage, showMore } = useInfiniteHits({
    ...props,
    escapeHTML: false,
  });

  return (
    <FlatList
      style={{ flex: 1 }}
      data={items}
      className="p-3"
      keyExtractor={(item) => item.id}
      onEndReached={() => {
        if (!isLastPage) {
          showMore();
        }
      }}
      renderItem={({ item }) => (
        <PlaceCard item={item as unknown as Place} key={item.id} />
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
    <SearchHeader
      ref={ref}
      textInputProps={{ value: input, onChangeText: onChange, autoFocus: true }}
    />
  );
}
