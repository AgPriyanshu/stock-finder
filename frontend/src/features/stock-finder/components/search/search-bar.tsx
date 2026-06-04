import {
  Box,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowRight, FiSearch, FiTag, FiX } from "react-icons/fi";
import { useCatalogItems, useSearchAutocomplete } from "api/stock-finder";

interface FlatSuggestion {
  name: string;
  thumbnail: string | null;
  type: "item" | "category";
  categoryName: string | null;
}

interface SuggestionGroup {
  label: string;
  items: FlatSuggestion[];
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    startTransition(() => setDraft(value));
  }, [value]);

  const { data: autocompleteSuggestions = [] } = useSearchAutocomplete(draft);
  const { data: catalogItems = [] } = useCatalogItems("", undefined, {
    enabled: focused && draft.trim().length === 0,
  });

  const flatSuggestions: FlatSuggestion[] = useMemo(() => {
    if (draft.trim().length >= 2) {
      return autocompleteSuggestions.map((s) => ({
        name: s.name,
        thumbnail: s.thumbnail,
        type: s.type,
        categoryName: s.type === "category" ? "Category" : null,
      }));
    }
    return catalogItems.map((item) => ({
      name: item.name,
      thumbnail: null,
      type: "item" as const,
      categoryName: item.categoryName ?? "Uncategorised",
    }));
  }, [draft, autocompleteSuggestions, catalogItems]);

  const groups: SuggestionGroup[] = useMemo(() => {
    const map = new Map<string, FlatSuggestion[]>();
    for (const s of flatSuggestions) {
      const label = s.categoryName ?? "Other";
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(s);
    }
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
  }, [flatSuggestions]);

  // Flat index across all groups for keyboard nav.
  const suggestions = flatSuggestions;

  const commit = useCallback(
    (text: string) => {
      onChange(text);
      setOpen(false);
      setActiveIndex(-1);
    },
    [onChange]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft !== value) {
        onChange(draft);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [draft, onChange, value]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const selectSuggestion = (suggestion: FlatSuggestion) => {
    setDraft(suggestion.name);
    commit(suggestion.name);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        selectSuggestion(suggestions[activeIndex]!);
      } else {
        commit(draft);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = open && suggestions.length > 0;

  const handleClear = () => {
    setDraft("");
    commit("");
  };

  const handleSubmit = () => {
    commit(draft);
  };

  return (
    <Box className="search-bar" position="relative" ref={containerRef}>
      <InputGroup
        startElement={<FiSearch />}
        endElement={
          draft ? (
            <HStack gap={0.5}>
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="Clear search"
                onClick={handleClear}
                color="fg.muted"
                _hover={{ color: "fg" }}
              >
                <FiX />
              </IconButton>
              <IconButton
                size="xs"
                variant="solid"
                aria-label="Submit search"
                onClick={handleSubmit}
              >
                <FiArrowRight />
              </IconButton>
            </HStack>
          ) : undefined
        }
      >
        <Input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          size="lg"
          bg="bg.panel"
        />
      </InputGroup>

      {showDropdown && (
        <Box
          className="search-bar-dropdown"
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          zIndex={20}
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="md"
          shadow="lg"
          maxH="calc(5 * 44px)"
          overflowY="auto"
        >
          {(() => {
            let flatIndex = 0;
            return groups.map((group) => (
              <Box key={group.label}>
                <Text
                  px={3}
                  pt={2}
                  pb={1}
                  fontSize="2xs"
                  fontWeight="semibold"
                  color="fg.muted"
                  textTransform="uppercase"
                  letterSpacing="wider"
                >
                  {group.label}
                </Text>
                {group.items.map((suggestion) => {
                  const idx = flatIndex++;
                  return (
                    <Box
                      key={suggestion.name}
                      px={3}
                      py={2}
                      cursor="pointer"
                      bg={idx === activeIndex ? "bg.muted" : "transparent"}
                      _hover={{ bg: "bg.muted" }}
                      display="flex"
                      alignItems="center"
                      gap={3}
                      h="44px"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectSuggestion(suggestion);
                      }}
                    >
                      <Box
                        flexShrink={0}
                        w="28px"
                        h="28px"
                        borderRadius="sm"
                        overflow="hidden"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg="bg.subtle"
                      >
                        {suggestion.thumbnail ? (
                          <Image
                            src={suggestion.thumbnail}
                            alt={suggestion.name}
                            w="full"
                            h="full"
                            objectFit="cover"
                          />
                        ) : suggestion.type === "category" ? (
                          <FiTag size={13} color="var(--chakra-colors-fg-muted)" />
                        ) : (
                          <FiSearch size={13} color="var(--chakra-colors-fg-muted)" />
                        )}
                      </Box>
                      <Text fontSize="sm" truncate flex={1}>
                        {suggestion.name}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            ));
          })()}
        </Box>
      )}
    </Box>
  );
};
