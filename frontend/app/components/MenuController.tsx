import { useGardenStore } from "@/hooks/useGardenStore";
import MenuBar from "./MenuBar";

const MenuController = () => {


    const datadispatch = useGardenStore(state => state.dispatch)
    const isMapLocked = useGardenStore(state => state.present.isMapLocked)

    const btnClass =
        'w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition';

    // const handleZoneClick = () => datadispatch({ type: 'TOGGLE_SHOW_ZONES' });
    const handleLockClick = () => {
        datadispatch({ type: 'TOGGLE_MAP_LOCK' });
        datadispatch({ type: 'TOGGLE_IS_SELECTING_ELEMENT' });
    }
    const handleElementClick = () => datadispatch({ type: 'TOGGLE_IS_SELECTING_ELEMENT' });
    const handleZoneClick = () => datadispatch({ type: 'TOGGLE_IS_SELECTING_ZONE' });


    return (
        <MenuBar>
            <div className="fixed left-4 top-1/2 -translate-y-1/2 space-y-4 z-50">
                <button className={btnClass}>
                    <img src="/icons/tool1.png" alt="Tool 1" className="w-[70%]" />
                </button>
                <button className={btnClass}>
                    <img src="/icons/database.png" alt="database" className="w-[55%]" />
                </button>
                <button className={btnClass}>
                    <img src="/icons/workflow.png" alt="workflow" className="w-[55%]" />
                </button>
                <button className={btnClass}>
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