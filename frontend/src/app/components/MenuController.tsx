import { useGardenStore } from "../stores/useGardenStore";
import { useUIStore } from "../stores/useUIStore";
import { LayerName } from "../types";
import { useMenuStore } from "@/stores/useMenuStore";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const MenuController = () => {

    const dispatch = useGardenStore(state => state.dispatch);
    const uidispatch = useUIStore(state => state.dispatch);
    const isMapLocked = useUIStore(state => state.isMapLocked);
    const { toggleMapLock } = useUIStore();

    const [isOpen, setIsOpen] = useState(false);


    // const handleZoneClick = () => datadispatch({ type: 'TOGGLE_SHOW_ZONES' });
    const handleLockClick = () => {
        toggleMapLock()
    }
    const handleElementClick = () => dispatch({ type: 'TOGGLE_IS_SELECTING_ELEMENT' });
    const handleZoneClick = () => {
        useMenuStore.getState().setOpenSection('s3');
    }
    const handleLayersClick = (layers: LayerName[]) => {
        uidispatch({type: 'SET_ACTIVE_LAYERS', activeLayers: layers})
    }

    const buttons = [
        { src: "/icons/lightbulb.png", alt: "Tool 1", onClick: () => {} },
        { src: "/icons/database.png", alt: "Database", onClick: () => {} },
        { src: "/icons/workflow.png", alt: "Workflow", onClick: () => {} },
        { src: "/icons/layers.png", alt: "Layers", onClick: () => handleLayersClick(['background']) },
        { src: "/zone.png", alt: "Zones", onClick: handleZoneClick },
        { src: "/element.png", alt: "Elements", onClick: handleElementClick },
        { src: isMapLocked ? "/icons/locked.png" : "/icons/unlocked.png", alt: "Lock", onClick: handleLockClick },
    ];

    return (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-2">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="flex flex-col items-center space-y-3 mb-3"
                    >
                        {buttons.map((btn, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    btn.onClick();
                                    setIsOpen(false); // optional: auto-close
                                }}
                                className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition"
                            >
                                <img src={btn.src} alt={btn.alt} className="w-6 h-6" />
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(prev => !prev)}
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white rounded-full p-3 shadow-xl hover:bg-blue-700 transition"
            >
                <span className="text-xl font-bold">...</span>
            </motion.button>
        </div>
    );
}

export default MenuController;