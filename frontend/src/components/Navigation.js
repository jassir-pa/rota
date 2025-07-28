import React from 'react';
import { useAuth } from './AuthContext';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const getTabsForRole = () => {
    if (user?.role === 'employee') {
      return [
        { id: 'calendar', label: 'Mi Horario', icon: '📅' },
        { id: 'reports', label: 'Reportes', icon: '📊' },
        { id: 'requests', label: 'Cambios', icon: '🔄' },
        { id: 'configuration', label: 'Configuración', icon: '⚙️' }
      ];
    } else if (user?.role === 'coordinator' || user?.role === 'admin') {
      return [
        { id: 'calendar', label: 'Calendario', icon: '📅' },
        { id: 'employees', label: 'Empleados', icon: '👥' },
        { id: 'schedules', label: 'Horarios', icon: '⏰' },
        { id: 'pending', label: 'Solicitudes', icon: '📋' },
        { id: 'reports', label: 'Reportes', icon: '📊' },
        { id: 'configuration', label: 'Configuración', icon: '⚙️' }
      ];
    }
    return [];
  };

  const tabs = getTabsForRole();

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Navigation;