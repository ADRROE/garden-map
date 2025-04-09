import { useCallback } from "react";
import { useGarden } from "@/app/context/GardenContext";
import { GardenElement } from "@/app/types";

export const useElementActions = (id: string) => {
    const {updateElement, deleteElement} = useGarden();

    const update = useCallback(
        (updates: Partial<GardenElement>) => {
            updateElement({id, ...updates});
        },
        [id, updateElement]
    );

    const remove = useCallback(() => {
        deleteElement(id);
    }, [id, deleteElement]);
    
    return {update, remove};
};