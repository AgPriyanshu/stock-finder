import {
  Box,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { FiArrowRight, FiSearch, FiTag, FiX } from "react-icons/fi";
import type { SfAutocompleteSuggestion } from "api/stock-finder";
import { useSearchAutocomplete } from "api/stock-finder";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const { data: suggestions = [] } = useSearchAutocomplete(draft);

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

  const selectSuggestion = (suggestion: SfAutocompleteSuggestion) => {
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
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search tools, fixtures, parts..."
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
          overflow="hidden"
        >
          {suggestions.map((suggestion, index) => (
            <Box
              key={suggestion.name}
              px={3}
              py={2}
              cursor="pointer"
              bg={index === activeIndex ? "bg.muted" : "transparent"}
              _hover={{ bg: "bg.muted" }}
              display="flex"
              alignItems="center"
              gap={3}
              onMouseDown={(event) => {
                // Prevent input blur before click registers.
                event.preventDefault();
                selectSuggestion(suggestion);
              }}
            >
              <Box
                flexShrink={0}
                w="32px"
                h="32px"
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
                  <FiTag size={14} color="var(--chakra-colors-fg-muted)" />
                ) : (
                  <FiSearch size={14} color="var(--chakra-colors-fg-muted)" />
                )}
              </Box>
              <Box flex={1} minW={0}>
                <Text fontSize="sm" truncate>
                  {suggestion.name}
                </Text>
                {suggestion.type === "category" && (
                  <Text fontSize="xs" color="fg.muted">
                    Category
                  </Text>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
