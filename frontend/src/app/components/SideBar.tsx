import { MenuSection, useMenuStore } from "../stores/useMenuStore";
import { PaletteItem } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSideBarActions } from "@/hooks/useSideBarActions";

type SideBarProps = {
    title: string;
    sections: MenuSection[];
};

export function SideBar({ title, sections }: SideBarProps) {
    const { openSectionId, setOpenSection } = useMenuStore();
    const { handleItemClick } = useSideBarActions();
    const t = useTranslations('Menu');

    const toggleSection = (id: string) => {
        setOpenSection(openSectionId === id ? null : id);
    };

    return (
        <aside className="fixed top-0 right-0 h-screen w-64 bg-white shadow-lg flex flex-col items-center py-4 gap-4 z-50 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <ul className="space-y-2">
                {sections.map((section) => (
                    <li key={section.id}>
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full text-left font-medium text-gray-700 hover:text-black hover:font-bold"
                            style={{ cursor: "pointer" }}
                        >
                            {t(section.title)}
                        </button>

                        <AnimatePresence initial={false}>
                            {openSectionId === section.id && (
                                <motion.ul
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden pl-4 mt-2 border-l border-gray-200"
                                ><div className="grid grid-cols-3">
                                        {section.items.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    onClick={() => handleItemClick(item)}
                                                    className={`block w-full text-left py-1 px-2 rounded hover:bg-gray-100 `}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <img src={item.icon} alt="" className="w-10 h-10" />
                                                </button>

                                                {/* Recursive nested items */}
                                                {item.children && (
                                                    <ul className="ml-4 mt-1 border-l border-gray-100 pl-2">
                                                        {item.children.map((child: PaletteItem) => (
                                                            <li key={child.id}>
                                                                <button
                                                                    onClick={() => handleItemClick(item)}
                                                                    className={`block w-full text-left py-1 px-2 rounded hover:bg-gray-100`}
                                                                    style={{ cursor: "pointer" }}
                                                                >

                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}</div>
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </li>
                ))}
            </ul>
        </aside>
    );
}