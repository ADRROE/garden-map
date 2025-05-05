import { useGarden } from "../context/GardenContext";
import MenuBar from "./MenuBar";

const MenuController = () => {

    const {
        state: { isMapLocked },
        dispatch,
      } = useGarden();

    const btnClass =
        'w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition';

    const handleZoneClick = () => dispatch({ type: 'TOGGLE_SHOW_ZONES' });
    const handleLockClick = () => {
        dispatch({ type: 'TOGGLE_MAP_LOCK' });
        dispatch({ type: 'TOGGLE_IS_SELECTING_ELEMENT' });
    }
    const handleElementClick = () => dispatch({ type: 'TOGGLE_IS_SELECTING_ELEMENT' });

    return (
        <MenuBar>
            <div className="fixed left-4 top-1/2 -translate-y-1/2 space-y-4 z-50">
                <button className={btnClass}>
                    <img src="/icons/tool1.png" alt="Tool 1" className="w-[70%]" />
                </button>
                <button className={btnClass}>
                    <img src="/icons/tool2.png" alt="Tool 2" className="w-[70%]" />
                </button>
                <button className={btnClass}>
                    <img src="/icons/tool3.png" alt="Tool 3" className="w-[70%]" />
                </button>
                <button className={btnClass}>
                    <img src="/icons/tool4.png" alt="Tool 4" className="w-[70%]" />
                </button>
                <button
                    className={btnClass}
                    onClick={handleZoneClick}>
                    <img src="/zone.png" width={"70%"} alt="layers" />
                </button>
                <button
                    className={btnClass}
                    onClick={handleElementClick}>
                    <img src="/element.png" width={"70%"} alt="leaf" />
                </button>
                <button
                    className={btnClass}
                    onClick={handleLockClick}>
                    <img src={isMapLocked ? "/icons/locked.png" : "/icons/unlocked.png"} width={"70%"} alt="lock"/>
                </button>
            </div>
        </MenuBar>
    )
}

export default MenuController;