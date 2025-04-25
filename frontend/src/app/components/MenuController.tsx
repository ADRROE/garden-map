import { useGarden } from "../context/GardenContext";
import MenuBar from "./MenuBar";

const MenuController = () => {

    const {isMapLocked, setIsSelectingElement, setIsMapLocked, setSelectedElement, setActiveColor, setIsPainting, setIsErasing, setShowZones} = useGarden()

    const handleZoneClick = () => { setShowZones((prev) => !prev) }
    const handleLockClick = () => {
        setIsMapLocked((prev) => !prev);
        setSelectedElement(null);
        setActiveColor(null);
        setIsPainting(false);
        setIsErasing(false);
    
    }
    const handleElementClick = () => { setIsSelectingElement((prev) => !prev) }

    return (
        <MenuBar>
            <button
                className="w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition "
                onClick={handleZoneClick}>
                <img src="/zone.png" width={"70%"} />
            </button>
            <button
                className="w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition "
                onClick={handleElementClick}>
                <img src="/element.png" width={"70%"} />
            </button>
            <button 
                className="w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition "
                onClick={handleLockClick}>
                <img src={isMapLocked? "/icons/locked.png":"/icons/unlocked.png"} width={"70%"} />
            </button>
        </MenuBar>
    )
}

export default MenuController;