import { useMenuStore } from "../stores/useMenuStore";
import { MenuElement } from "../types";
import { useElementPlacement } from "../hooks/useElementPlacement";
import { motion, AnimatePresence } from "framer-motion";

export type MenuSection = {
    id: string;
    title: string;
    items: MenuElement[];
};

type MenuProps = {
    title: string;
    sections: MenuSection[];
};

export function Menu({ title, sections }: MenuProps) {
    const { openSectionId, setOpenSection, setSelectedItem } = useMenuStore();

    const {beginPlacing} = useElementPlacement();

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
                            {section.title}
                        </button>

                        <AnimatePresence initial={false}>
                            {openSectionId === section.id && (
                                <motion.ul
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden pl-4 mt-2 border-l border-gray-200"
                                >
                                    {section.items.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item.id);
                                                    beginPlacing(item);
                                                }}
                                                className={`block w-full text-left py-1 px-2 rounded hover:bg-gray-100 `}
                                                style={{cursor: "pointer"}}
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
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </li>
                ))}
            </ul>
        </aside>
    );
}