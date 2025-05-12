import { useCallback } from "react";
import { useGardenData } from "../contexts/GardenDataContext";
import { GardenElement } from "@/types";

export const useElementActions = (id: string) => {
    const {updateElement, deleteElement} = useGardenData();

    const update = useCallback(
        (updates: GardenElement) => {
            updateElement({...updates});
        },
        [updateElement]
    );

    const remove = useCallback(() => {
        deleteElement(id);
    }, [id, deleteElement]);
    
    return {update, remove};
};