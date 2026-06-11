"use client";

import { cn } from "@/lib/utils";

interface TabNavProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabNav = ({ tabs, activeTab, onTabChange }: TabNavProps) => {
  return (
    <div className="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn("tab-nav-item", activeTab === tab.id && "active")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNav;
