"use client";

import { createContext, useContext, useState } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: false,
    setIsCollapsed: () => { },
    toggleSidebar: () => { },
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => setIsCollapsed((prev) => !prev);

    return (
        <SidebarContext.Provider value= {{ isCollapsed, setIsCollapsed, toggleSidebar }
}>
    { children }
    </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
