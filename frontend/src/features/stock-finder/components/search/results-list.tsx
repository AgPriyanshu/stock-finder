import { Button, Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import type { SfSearchItem } from "api/stock-finder";
import type { InfiniteData } from "@tanstack/react-query";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import type { SfSearchPage } from "api/stock-finder";
import { ResultCard } from "./result-card";
import { flattenResults } from "./search-utils";

interface ResultsListProps {
  query: UseInfiniteQueryResult<InfiniteData<SfSearchPage>, Error>;
  radiusKm: number;
  onExpandRadius: () => void;
}

export const ResultsList = ({
  query,
  radiusKm,
  onExpandRadius,
}: ResultsListProps) => {
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

  if (items.length === 0) {
    return (
      <Center py={14} flexDir="column" gap={3} bg="bg.muted" borderRadius="md">
        <Text fontWeight="semibold">No results in {radiusKm}km</Text>
        <Button onClick={onExpandRadius}>Expand to 10km</Button>
      </Center>
    );
  }

  return (
    <VStack align="stretch" gap={3}>
      {items.map((item) => (
        <ResultCard key={item.id} item={item} />
      ))}
      <div ref={sentinelRef} />
      {query.isFetchingNextPage && (
        <Center py={4}>
          <Spinner size="sm" />
        </Center>
      )}
    </VStack>
  );
};
