// ============================================================
// SIDEBAR — Menu latéral avec hiérarchie et animations
// Version V4.0 — Utilise AppLink
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, FileText, Layers, Palette, Users, Store, ChevronDown, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { AppLink } from './AppLink';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  parentId?: string;
  hasChildren?: boolean;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onClose: () => void;
  role?: string;
  title?: string;
  logo?: React.ReactNode;
}

const DEFAULT_ICONS: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  FileText: <FileText size={20} />,
  Layers: <Layers size={20} />,
  Palette: <Palette size={20} />,
  Users: <Users size={20} />,
  Store: <Store size={20} />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  isOpen,
  onClose,
  title = 'Gestion',
  logo,
}) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Auto-expand le parent si un enfant est actif
  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some(
          (child) =>
            location.pathname === child.path ||
            location.pathname.startsWith(child.path + '/')
        );
        if (hasActiveChild) {
          newExpanded[item.id] = true;
        }
      }
    });
    if (Object.keys(newExpanded).length > 0) {
      setExpanded((prev) => ({ ...prev, ...newExpanded }));
    }
  }, [location.pathname, items]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {logo ? logo : <span className="text-xl font-bold text-primary-500">📦</span>}
          <span className="font-bold text-lg">{title}</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-gray-400 text-center">
            Aucun raccourci configuré
          </p>
        ) : (
          items.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expanded[item.id] || false;
            const Icon = item.icon || DEFAULT_ICONS[item.id] || <LayoutDashboard size={20} />;

            const hasActiveChild =
              hasChildren &&
              item.children!.some(
                (child) =>
                  location.pathname === child.path ||
                  location.pathname.startsWith(child.path + '/')
              );

            // Parent avec enfants → bouton toggle
            if (hasChildren) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive || hasActiveChild
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className={isActive || hasActiveChild ? 'text-primary-500' : 'text-gray-400'}>
                      {Icon}
                    </span>
                    <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                    <span className="flex-shrink-0 text-gray-400">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-6 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
                          {item.children!.map((child) => {
                            const childActive =
                              location.pathname === child.path ||
                              (child.path !== '/' && location.pathname.startsWith(child.path + '/'));

                            return (
                              <AppLink
                                key={child.id}
                                to={child.path}
                                onNavigate={onClose}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${
                                  childActive
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-500 hover:bg-gray-50 text-sm'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    childActive ? 'bg-primary-500' : 'bg-gray-300'
                                  }`}
                                />
                                <span className="flex-1 text-sm truncate">{child.label}</span>
                              </AppLink>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Parent sans enfants → navigation directe
            return (
              <AppLink
                key={item.id}
                to={item.path}
                onNavigate={onClose}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={isActive ? 'text-primary-500' : 'text-gray-400'}>
                  {Icon}
                </span>
                <span className="flex-1 text-left text-sm truncate">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="w-1 h-6 rounded-full bg-primary-500"
                  />
                )}
              </AppLink>
            );
          })
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
        {items.length} élément{items.length > 1 ? 's' : ''}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop : sidebar fixe */}
      <aside className="hidden lg:flex fixed top-16 left-0 z-40 w-64 h-[calc(100vh-128px)] bg-white border-r border-gray-200 flex-col">
        {renderContent()}
      </aside>

      {/* Mobile : drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 flex flex-col lg:hidden"
            >
              {renderContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
