import { useGardenStore } from "@/stores/useGardenStore";
import { useUIStore } from "@/stores/useUIStore";
import MenuBar from "./MenuBar";
import { LayerName } from "@/types";

const MenuController = () => {


    const datadispatch = useGardenStore(state => state.dispatch);
    const uidispatch = useUIStore(state => state.dispatch);
    const isMapLocked = useUIStore(state => state.isMapLocked);
    const { toggleMapLock } = useUIStore()

    const btnClass =
        'w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition';

    // const handleZoneClick = () => datadispatch({ type: 'TOGGLE_SHOW_ZONES' });
    const handleLockClick = () => {
        toggleMapLock()
    }
    const handleElementClick = () => datadispatch({ type: 'TOGGLE_IS_SELECTING_ELEMENT' });
    const handleZoneClick = () => datadispatch({ type: 'TOGGLE_IS_SELECTING_ZONE' });
    const handleLayersClick = (layers: LayerName[]) => {
        uidispatch({type: 'SET_ACTIVE_LAYERS', activeLayers: layers})
    }

    return (
        <MenuBar>
            <div className="fixed left-4 top-1/2 -translate-y-1/2 space-y-4 z-50">
                <button className={btnClass}>
                    <img src="/icons/lightbulb.png" alt="Tool 1" className="w-[70%]" />
                </button>
                <button className={btnClass}>
                    <img src="/icons/database.png" alt="database" className="w-[55%]" />
                </button>
                <button className={btnClass}>
                    <img src="/icons/workflow.png" alt="workflow" className="w-[55%]" />
                </button>
                <button 
                    className={btnClass}
                    onClick={() => handleLayersClick(['background'])}>
                    <img src="/icons/layers.png" width={"60%"} alt="layers" />
                </button>
                <button
                    className={btnClass}
                    onClick={handleZoneClick}
                >
                    <img src="/zone.png" width={"70%"} alt="zones" />
                </button>
                <button
                    className={btnClass}
                    onClick={handleElementClick}>
                    <img src="/element.png" width={"70%"} alt="leaf" />
                </button>
                <button
                    className={btnClass}
                    onClick={handleLockClick}>
                    <img src={isMapLocked ? "/icons/locked.png" : "/icons/unlocked.png"} width={"70%"} alt="lock" />
                </button>
            </div>
        </MenuBar>
    )
}

export default MenuController;