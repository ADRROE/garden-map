
import { useUIStore } from "../stores/useUIStore";
import { useMenuStore } from "@/stores/useMenuStore";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const QuickMenu = () => {

    const uidispatch = useUIStore(state => state.dispatch);
    const isMapLocked = useUIStore(state => state.isMapLocked);
    const { toggleMapLock } = useUIStore();

    const menudispatch = useMenuStore(state => state.dispatch);

    const [isOpen, setIsOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);


    // const handleZoneClick = () => datadispatch({ type: 'TOGGLE_SHOW_ZONES' });
    const handleLockClick = () => {
        toggleMapLock()
    }
    const handleItemClick = () => menudispatch({ type: 'TOGGLE_MENU', menu: 'picker' })
    const handleZoneClick = () => {
        menudispatch({ type: 'SHOW_MENU', menu: 'picker'});
        useUIStore.getState().dispatch({type: 'SET_MAP_LOCK', value: false})
        useMenuStore.getState().setOpenSection('s3');
    }

    const buttons = [
        { src: "/icons/cog.png", alt: "Cog", onClick: () => { setIsOpen(false) } },
        { src: "/icons/lightbulb.png", alt: "Tool 1", onClick: () => { setIsOpen(false) } },
        { src: "/icons/database.png", alt: "Database", onClick: () => { setIsOpen(false) } },
        { src: "/icons/workflow.png", alt: "Workflow", onClick: () => { setIsOpen(false) } },
        {
            src: "/icons/layers.png", alt: "Layers", onClick: () => { }, submenu: [
                { src: "/icons/top-layer.png", alt: "Toplayer", onClick: () => { 
                    uidispatch({type: 'TOGGLE_LAYER', layer: 'items'});
                    setActiveDropdown(null);
                }},
                { src: "/icons/bottom-layer.png", alt: "Bottomlayer", onClick: () => { 
                    uidispatch({type: 'TOGGLE_LAYER', layer: 'zones'});
                    setActiveDropdown(null);
                } },
            ],
        },
        { src: "/digging.png", alt: "Digging", onClick: handleZoneClick },
        { src: "/planting.png", alt: "Planting", onClick: handleItemClick },
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
                        className="relative flex flex-col items-start space-y-3 mb-3"
                    >
                        {buttons.map((btn, i) => (
                            <div key={i} className="relative flex items-center">
                                {/* Main Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>{
                                        setActiveDropdown((prev) => (prev === i ? null : i));
                                        btn.onClick()
                                    }

                                    }
                                    className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition"
                                >
                                    <img src={btn.src} alt={btn.alt} className="w-6 h-6" />
                                </motion.button>

                                {/* Submenu */}
                                <AnimatePresence>
                                    {activeDropdown === i && btn.submenu && (
                                        <motion.div
                                            key={`submenu-${i}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute left-16 flex flex-col space-y-2"
                                        >
                                            {btn.submenu.map((item, j) => (
                                                <motion.button
                                                    key={j}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => item.onClick()}
                                                    className="bg-white rounded-full p-2 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-md hover:bg-gray-100 transition"                                                >
                                                    <img src={item.src} alt={item.alt} className="w-6 h-6" />

                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={() => {
                    setIsOpen((prev) => !prev);
                    setActiveDropdown(null);
                }}
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#C5D4BC] text-white rounded-full p-3 shadow-xl hover:bg-[#9BB58B] transition"
            >
                <span className="text-xl font-bold">...</span>
            </motion.button>
        </div>
    );
}

export default QuickMenu;