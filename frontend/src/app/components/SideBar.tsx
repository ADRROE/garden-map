import { useMenuStore } from "../stores/useMenuStore";
import { MenuElement } from "../types";
import { useGardenElement } from "../hooks/useGardenElement";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export type SideBarSection = {
    id: string;
    title: string;
    items: MenuElement[];
};

type SideBarProps = {
    title: string;
    sections: SideBarSection[];
};

export function SideBar({ title, sections }: SideBarProps) {
    const { openSectionId, setOpenSection, setSelectedItem } = useMenuStore();
    const { beginPlacing } = useGardenElement();
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
                            className="w-full text-left font-medium text-gray-700 hover:text-black"
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
                                                    onClick={() => {
                                                        setSelectedItem(item.id);
                                                        beginPlacing(item);
                                                    }}
                                                    className={`block w-full text-left py-1 px-2 rounded hover:bg-gray-100 `}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <img src={item.icon} alt="" className="w-10 h-10" />
                                                </button>

                                                {/* Recursive nested items */}
                                                {item.children && (
                                                    <ul className="ml-4 mt-1 border-l border-gray-100 pl-2">
                                                        {item.children.map((child: MenuElement) => (
                                                            <li key={child.id}>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedItem(child.id);
                                                                        beginPlacing(child);
                                                                    }}
                                                                    className={`block w-full text-left py-1 px-2 rounded hover:bg-gray-100`}
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