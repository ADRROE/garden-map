
import QuickMenu from "./QuickMenu";
import { SideBar } from "./SideBar";
import { useMenuElements } from "../hooks/useMenuElements";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import { useUIStore } from "@/stores/useUIStore";
import StatusBar from "./StatusBar";
import { useTransientFlag } from "@/hooks/useTransientFlag";
import { capitalizeFirstLetter } from "@/utils/utils";
import { MenuSection } from "@/stores/useMenuStore";
import MatrixDebugger from "./Matrix";


export default function Overlay({ onEditConfirm }: { onEditConfirm: () => void }) {

  const t = useTranslations('Overlay');

  const btnClass =
    'w-12 h-12 flex rounded-full bg-[#C5D4BC] items-center justify-center hover:bg-green-700 shadow-lg transition';


  const { data: menuElements = [] } = useMenuElements();

  const clear = useSelectionStore((s) => s.clear);
  const selection = useSelectionStore((s) => s.selection);
  const isInteracting = selection.kind === 'drawing' || selection.kind === 'editing';
  
  const showSideBar = useUIStore((s) => s.showSideBar);
  const showStatusBar = useTransientFlag(selection.kind, 2000); // shown for 2s after any change

  const sideBarSections: MenuSection[] = [{
    id: "s1",
    title: "Vegetation",
    items: menuElements.filter(element => element.category === "vegetation")

  }, {
    id: "s2",
    title: "Material",
    items: menuElements.filter(element => element.category === "pavement")
  }, {
    id: "s3",
    title: "Soil",
    items: menuElements.filter(element => element.category === "soil")
  }]
  
  return (
    <>
      <QuickMenu />
      <LanguageSwitcher />
      
      {isInteracting &&
        <>
          <div className="fixed top-4 right-4 -translate-x-1/2 z-50 space-x-4 flex">
            <button onClick={onEditConfirm}>
              <img src='/icons/check.png' width={30} height={30} />
            </button>
            <button onClick={clear}>
              <img src='/icons/remove.png' width={30} height={30} />
            </button>
          </div>
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-x-4 flex">
            <button className={btnClass}>
              <img src="/icons/undo.svg" alt="undo" className="w-[50%]" />
            </button>
            <button className={btnClass}>
              <img src="/icons/redo.svg" alt="redo" className="w-[50%]" />
            </button>
          </div>
        </>
      }
      {process.env.NODE_ENV === "development" && <MatrixDebugger />}
      {showSideBar && !isInteracting &&
        <SideBar
          title={t('elementchooser')}
          sections={sideBarSections}>
        </SideBar>
      }
      {showStatusBar && (
        <StatusBar
          text={selection.kind ? `${capitalizeFirstLetter(selection.kind)}... `: ""}
          status={selection}
          className={showStatusBar ? "opacity-100" : "opacity-0"}
        />
      )}


    </>
  );
}