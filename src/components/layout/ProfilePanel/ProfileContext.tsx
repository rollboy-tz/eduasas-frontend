'use client'

import React, { createContext, useContext, useState } from "react";

interface ProfilePanelContextType {
    isOpen: boolean;
    openProfilePanel: () => void;
    closeProfilePanel: () => void;
    toggleProfilePanel: () => void;
}

const ProfilePanelContext = createContext<ProfilePanelContextType | undefined>(undefined);

export const ProfilePanelProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openProfilePanel = () => setIsOpen(true);
    const closeProfilePanel = () => setIsOpen(false);
    const toggleProfilePanel = () => setIsOpen((prev) => !prev);

    return (
        <ProfilePanelContext.Provider value={{ isOpen, openProfilePanel, closeProfilePanel, toggleProfilePanel }}>
            {children}
        </ProfilePanelContext.Provider>
    );
};

export const useProfilePanel = () => {
    const context = useContext(ProfilePanelContext);
    if (!context) {
        throw new Error("useProfilePanel must be used within a ProfilePanelProvider");
    }
    return context;
};