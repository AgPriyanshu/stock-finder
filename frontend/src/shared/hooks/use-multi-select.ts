import { useCallback, useState } from "react";

/**
 * Manages multi-select state with Finder-style shift+click range selection.
 *
 * @param orderedIds - Flat list of all selectable IDs in display order.
 *   Determines the range expanded by shift+click.
 */
export const useMultiSelect = (orderedIds: string[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);

  const handleToggleSelect = useCallback(
    (id: string, shiftKey: boolean) => {
      if (shiftKey && anchorId) {
        const anchorIdx = orderedIds.indexOf(anchorId);
        const currentIdx = orderedIds.indexOf(id);

        if (anchorIdx !== -1 && currentIdx !== -1) {
          const from = Math.min(anchorIdx, currentIdx);
          const to = Math.max(anchorIdx, currentIdx);

          setSelectedIds((prev) => {
            const next = new Set(prev);

            for (let i = from; i <= to; i++) {
              next.add(orderedIds[i]);
            }

            return next;
          });
        }
      } else {
        setSelectedIds((prev) => {
          const next = new Set(prev);

          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }

          return next;
        });
        setAnchorId(id);
      }
    },
    [anchorId, orderedIds]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(orderedIds));
  }, [orderedIds]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setAnchorId(null);
  }, []);

  return {
    selectedIds,
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,
  };
};
