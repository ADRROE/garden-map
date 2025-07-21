
import QuickMenu from "./QuickMenu";
import { SideBar } from "./SideBar";
import { useMenuItems } from "../hooks/usePaletteItems";
import { useSelectionStore } from "../stores/useSelectionStore";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import StatusBar from "./StatusBar";
import { useTransientFlag } from "@/hooks/useTransientFlag";
import { capitalizeFirstLetter } from "@/utils/utils";
import { MenuSection, useMenuStore } from "@/stores/useMenuStore";
import MatrixDebugger from "./Matrix";
import { useGardenStore } from "@/stores/useGardenStore";
import { useState } from "react";
import UpdateModal from "./UpdateModal";


export default function Overlay({ onEditConfirm, onEditAbort }: { onEditConfirm: (operation: 'create' | 'modify') => void, onEditAbort: () => void }) {

  const t = useTranslations('Overlay');

  const btnClass =
    'w-12 h-12 flex items-center justify-center bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition';


  const { data: menuItems = [] } = useMenuItems();
  const [confirming, setConfirming] = useState(false);

  const selection = useSelectionStore((s) => s.selection);
  const isInteracting = selection.kind === 'drawing';

  const showSideBar = useMenuStore((s) => s.activeMenu === 'picker')
  const showStatusBar = useTransientFlag(selection.kind, 2000);

  const sideBarSections: MenuSection[] = [{
    id: "s1",
    title: "Canopies",
    items: menuItems.filter(item => item.subCategory === "canopies")

  }, {
    id: "s2",
    title: "Hedges",
    items: menuItems.filter(item => item.subCategory === "hedges")
  }, {
    id: "s3",
    title: "Shrubs",
    items: menuItems.filter(item => item.subCategory === "shrubs")
  }, {
    id: "s4",
    title: "Soil",
    items: menuItems.filter(item => item.category === "soil")
  }, {
    id: "s5",
    title: "Pavement",
    items: menuItems.filter(item => item.category === "pavement")
  }]

  return (
    <>
      <QuickMenu />
      <LanguageSwitcher />

      {isInteracting &&
        <div className="fixed top-4 right-4 -translate-x-1/2 z-50 space-x-4 flex">
          <button onClick={() => setConfirming(true)}>
            <img src='/icons/check.png' width={30} height={30} />
          </button>
          <button onClick={onEditAbort}>
            <img src='/icons/remove.png' width={30} height={30} />
          </button>
        </div>
      }
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-x-4 flex">
        <button className={btnClass} onClick={() => useGardenStore.getState().undo()}>
          <img src="/icons/undo.svg" alt="undo" className="w-[50%]" />
        </button>
        <button className={btnClass} onClick={() => useGardenStore.getState().redo()}>
          <img src="/icons/redo.svg" alt="redo" className="w-[50%]" />
        </button>
      </div>
      {process.env.NODE_ENV === "development" && <MatrixDebugger />}
      {showSideBar && !isInteracting &&
        <SideBar
          title={t('itemchooser')}
          sections={sideBarSections}>
        </SideBar>
      }
      {showStatusBar && (
        <StatusBar
          text={selection.kind ? `${capitalizeFirstLetter(selection.kind)}... ` : ""}
          status={selection}
          className={showStatusBar ? "opacity-100" : "opacity-0"}
        />
      )}
      {confirming &&
        <UpdateModal
          onEditConfirm={onEditConfirm}
          onEditAbort={() => {
            onEditAbort();
            setConfirming(false);
          }}
        />
      }
    </>
  );
}