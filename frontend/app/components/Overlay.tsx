
import MenuController from "./MenuController";
import { Menu, MenuSection } from "./Menu";
import { useMenuElements } from "@/hooks/useMenuElements";


export default function Overlay() {

  const btnClass =
    'w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition';

    const { data: menuElements = [] } = useMenuElements('elements');

  const menuSections: MenuSection[] = [{
    id: "s1",
    title: "Vegetation",
    items: menuElements.filter(element => element.category === "vegetation")

  }, {
    id: "s2",
    title: "Material",
    items: menuElements.filter(element => element.category === "pavement")
  }]

  return (
    <>
      <MenuController />
     <Menu
      title="Element chooser"
      sections={menuSections}>

      </Menu>
      {/* Top center buttons */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-x-4 flex">
        <button className={btnClass}>
          <img src="/icons/undo.svg" alt="undo" className="w-[50%]" />
        </button>
        <button className={btnClass}>
          <img src="/icons/redo.svg" alt="redo" className="w-[50%]" />
        </button>
      </div>
    </>
  );
}