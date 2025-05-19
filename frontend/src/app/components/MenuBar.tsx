import React from "react";

type MenuBarProps = {
    children: React.ReactNode;
}

const MenuBar: React.FC<MenuBarProps> = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="fixed bottom-6 left-6 flex flex-col items-center space-y-3 z-50">
            {children}
        </div>
    )
}

export default MenuBar;