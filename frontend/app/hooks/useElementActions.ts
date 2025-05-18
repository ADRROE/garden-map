import { useCallback } from "react";
import { useGardenStore } from "../stores/useGardenStore";
import { GardenElement } from "@/types";

export const useElementActions = (id: string) => {

    const updateElement = useGardenStore(state => state.updateElement);
    const deleteElement = useGardenStore(state => state.deleteElement);

    const update = useCallback(
        (updates: GardenElement) => {
            updateElement({ ...updates });
        },
        [updateElement]
    );

    const remove = useCallback(() => {
        deleteElement(id);
    }, [id, deleteElement]);

    return { update, remove };
};