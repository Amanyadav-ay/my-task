import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import QuickTaskModal from '../components/QuickTaskModal.jsx';
import AIModal from '../components/AIModal.jsx';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <div className="min-h-screen flex bg-main-bg dark:bg-main-darkBg text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onOpenAI={() => setShowAIModal(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onQuickAdd={() => setShowQuickAdd(true)}
          onOpenAI={() => setShowAIModal(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Add Modal */}
      <QuickTaskModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onTaskCreated={() => {
          // Trigger global refresh event or navigate
          window.dispatchEvent(new CustomEvent('task-updated'));
        }}
      />

      {/* Global AI Assistant Modal */}
      <AIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onTasksImported={() => {
          window.dispatchEvent(new CustomEvent('task-updated'));
        }}
      />
    </div>
  );
}
