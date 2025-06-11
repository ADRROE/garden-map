import { useSelectionStore } from '@/stores/useSelectionStore';

export const useSelectionState = () => {
  const selection = useSelectionStore(s => s.selection);
  const isEditing = selection.kind === 'editing';
  const isConfirming = selection.kind === 'confirming';
  const isDrawing = selection.kind === 'drawing';
  const isPlacing = selection.kind === 'placing';
  const isInteracting = isEditing || isDrawing || isPlacing;

  return {
    selection,
    isEditing,
    isConfirming,
    isDrawing,
    isPlacing,
    isInteracting
  };
};