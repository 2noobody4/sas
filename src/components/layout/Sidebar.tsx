import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, FileText, Layers, Palette, Users } from 'lucide-react';
import { useHistory, useLocation } from 'react-router-dom';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
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
};

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  isOpen,
  onClose,
  role = 'admin',
  title = 'Gestion',
  logo,
}) => {
  const history = useHistory();
  const location = useLocation();

  const visibleItems = items.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  return (
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
            className="fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {logo ? (
                  logo
                ) : (
                  <span className="text-xl font-bold text-primary-500">📦</span>
                )}
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
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon || DEFAULT_ICONS[item.id] || <LayoutDashboard size={20} />;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      history.push(item.path);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className={isActive ? 'text-primary-500' : 'text-gray-400'}>
                      {Icon}
                    </span>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="w-1 h-6 rounded-full bg-primary-500"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 text-xs text-gray-400">
              App PME v3.0
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
