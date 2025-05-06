
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/layout/Sidebar";
import SidebarFooter from "@/components/layout/SidebarFooter";
import SidebarOverlay from "@/components/layout/SidebarOverlay";
import DesktopView from "@/components/layout/DesktopView";
import MobileTabs from "@/components/layout/MobileTabs";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (view: string) => {
    setActiveView(view);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        toggleSidebar={toggleSidebar} 
        onLogoClick={() => handleNavigation("dashboard")} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <aside 
          className={`bg-white border-r border-gray-100 w-64 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col 
                     ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                     fixed md:relative h-[calc(100vh-64px)] z-20`}
        >
          <Sidebar activeView={activeView} handleNavigation={handleNavigation} />
          <SidebarFooter activeView={activeView} handleNavigation={handleNavigation} />
        </aside>
        
        <SidebarOverlay isVisible={isSidebarOpen} onClick={toggleSidebar} />
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            <DesktopView activeView={activeView} onNavigate={handleNavigation} />
            
            <div className="md:hidden">
              <MobileTabs 
                activeView={activeView} 
                onViewChange={setActiveView} 
                onNavigate={handleNavigation} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
