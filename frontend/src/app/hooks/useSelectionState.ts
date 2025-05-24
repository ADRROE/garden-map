// hooks/useOverlayState.ts
import { useSelectionStore } from '@/stores/useSelectionStore';

export const useSelectionState = () => {
  const selection = useSelectionStore(s => s.selection);
  const isEditing = selection.kind === 'editing';
  const isDrawing = selection.kind === 'drawing';
  const isPlacing = selection.kind === 'placing';
  const isInteracting = isEditing || isDrawing || isPlacing;

  return {
    selection,
    isEditing,
    isDrawing,
    isPlacing,
    isInteracting
  };
};