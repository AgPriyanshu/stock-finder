import {
  Box,
  Center,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import type { SfSearchItem } from "api/stock-finder";
import type { InfiniteData } from "@tanstack/react-query";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import type { SfSearchPage } from "api/stock-finder";
import { ResultCard } from "./result-card";
import { flattenResults } from "./search-utils";

interface ResultsListProps {
  query: UseInfiniteQueryResult<InfiniteData<SfSearchPage>, Error>;
}

export const ResultsList = ({ query }: ResultsListProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const items: SfSearchItem[] = flattenResults(query.data?.pages);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0]?.isIntersecting &&
        query.hasNextPage &&
        !query.isFetchingNextPage
      ) {
        void query.fetchNextPage();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  if (query.isLoading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    );
  }

  if (!query.isFetched && items.length === 0) {
    return (
      <Center py={14}>
        <Text color="fg.muted">Search for items near you</Text>
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <Center py={14} flexDir="column" gap={1} bg="bg.muted" borderRadius="md">
        <Text fontWeight="semibold">No results found</Text>
        <Text fontSize="sm" color="fg.muted">
          Try a different keyword or category.
        </Text>
      </Center>
    );
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
        {items.map((item) => (
          <ResultCard key={item.id} item={item} />
        ))}
      </SimpleGrid>
      <div ref={sentinelRef} />
      {query.isFetchingNextPage && (
        <Center py={4}>
          <Spinner size="sm" />
        </Center>
      )}
    </Box>
  );
};
