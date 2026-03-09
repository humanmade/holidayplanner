import { useState, useCallback, useRef } from 'react';

interface DragState {
  startDate: string | null;
  endDate: string | null;
  isDragging: boolean;
}

export function useDragSelect(onSelect: (startDate: string, endDate: string) => void) {
  const [dragState, setDragState] = useState<DragState>({
    startDate: null,
    endDate: null,
    isDragging: false,
  });
  const dragRef = useRef<DragState>(dragState);
  dragRef.current = dragState;

  const onMouseDown = useCallback((date: string) => {
    setDragState({ startDate: date, endDate: date, isDragging: true });
  }, []);

  const onMouseEnter = useCallback((date: string) => {
    if (dragRef.current.isDragging) {
      setDragState((prev) => ({ ...prev, endDate: date }));
    }
  }, []);

  const onMouseUp = useCallback(() => {
    const { startDate, endDate, isDragging } = dragRef.current;
    if (isDragging && startDate && endDate) {
      // Sort dates so start <= end
      const sorted = [startDate, endDate].sort();
      onSelect(sorted[0], sorted[1]);
    }
    setDragState({ startDate: null, endDate: null, isDragging: false });
  }, [onSelect]);

  const getSelectedRange = useCallback((): Set<string> => {
    const { startDate, endDate, isDragging } = dragState;
    if (!isDragging || !startDate || !endDate) return new Set();

    const sorted = [startDate, endDate].sort();
    const days = new Set<string>();
    const current = new Date(sorted[0] + 'T00:00:00');
    const end = new Date(sorted[1] + 'T00:00:00');
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      days.add(`${y}-${m}-${d}`);
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [dragState]);

  return {
    isDragging: dragState.isDragging,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    getSelectedRange,
  };
}
