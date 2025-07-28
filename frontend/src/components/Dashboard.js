import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import Navigation from './Navigation';
import Calendar from './Calendar';
import EmployeeManagement from './EmployeeManagement';
import ScheduleManagement from './ScheduleManagement';
import PendingRequests from './PendingRequests';
import Reports from './Reports';
import Configuration from './Configuration';
import ScheduleRequests from './ScheduleRequests';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <Calendar />;
      case 'employees':
        return <EmployeeManagement />;
      case 'schedules':
        return <ScheduleManagement />;
      case 'pending':
        return <PendingRequests />;
      case 'reports':
        return <Reports />;
      case 'configuration':
        return <Configuration />;
      case 'requests':
        return <ScheduleRequests />;
      default:
        return <Calendar />;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {user?.role === 'employee' ? 'Mi Panel' : 'Panel de Administración'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {user?.role === 'employee' 
              ? 'Gestiona tu horario y solicitudes' 
              : 'Administra horarios y empleados'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;