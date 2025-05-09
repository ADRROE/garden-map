
import MenuController from "./MenuController";
import { motion, AnimatePresence } from "framer-motion";
import { useGarden } from "@/context/GardenContext";
import ElementMenu from "./ElementMenu";


export default function Overlay() {

  const {state} = useGarden()

  const btnClass =
    'w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition';

  return (
    <>
      <MenuController />
      <AnimatePresence>
        {state.isSelectingElement && (
          <div
            style={{
              width: 300,
              right: 20,
              position: "absolute",
            }}>
            <motion.div
              key="element-menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              className="h-screen overflow-y-auto"
            >
              <ElementMenu />
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Top center buttons */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-x-4 flex">
        <button className={btnClass}>
          <img src="/icons/top1.png" alt="Top 1" className="w-[70%]" />
        </button>
        <button className={btnClass}>
          <img src="/icons/top2.png" alt="Top 2" className="w-[70%]" />
        </button>
      </div>
    </>
  );
}