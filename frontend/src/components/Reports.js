import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Reports = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchServices();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleExportAll = async () => {
    try {
      const response = await axios.get(`${API}/export-schedules`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'todos_los_horarios.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting schedules:', error);
      alert('Error al exportar horarios');
    }
  };

  const handleExportMySchedule = async () => {
    try {
      // For employees, we'll create a filtered export with just their schedule
      const response = await axios.get(`${API}/my-schedule`);
      const mySchedule = response.data;
      
      // Create a simple CSV for employee's own schedule
      const csvContent = [
        ['Día', 'Inicio Jornada', 'Inicio Descanso', 'Fin Descanso', 'Fin Jornada'],
        ['Lunes', mySchedule.monday_start || '', mySchedule.monday_break_start || '', mySchedule.monday_break_end || '', mySchedule.monday_end || ''],
        ['Martes', mySchedule.tuesday_start || '', mySchedule.tuesday_break_start || '', mySchedule.tuesday_break_end || '', mySchedule.tuesday_end || ''],
        ['Miércoles', mySchedule.wednesday_start || '', mySchedule.wednesday_break_start || '', mySchedule.wednesday_break_end || '', mySchedule.wednesday_end || ''],
        ['Jueves', mySchedule.thursday_start || '', mySchedule.thursday_break_start || '', mySchedule.thursday_break_end || '', mySchedule.thursday_end || ''],
        ['Viernes', mySchedule.friday_start || '', mySchedule.friday_break_start || '', mySchedule.friday_break_end || '', mySchedule.friday_end || ''],
        ['Sábado', mySchedule.saturday_start || '', mySchedule.saturday_break_start || '', mySchedule.saturday_break_end || '', mySchedule.saturday_end || ''],
        ['Domingo', mySchedule.sunday_start || '', mySchedule.sunday_break_start || '', mySchedule.sunday_break_end || '', mySchedule.sunday_end || '']
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mi_horario.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting my schedule:', error);
      alert('Error al exportar mi horario');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-xl font-semibold text-gray-900">Reportes</h2>
          <p className="mt-2 text-sm text-gray-700">
            {user?.role === 'employee' 
              ? 'Descarga tu horario personal' 
              : 'Descarga reportes de horarios por servicio'}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Exportar Horarios</h3>
        
        <div className="space-y-4">
          {user?.role === 'employee' ? (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportMySchedule}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                📄 Descargar Mi Horario
              </button>
              <p className="text-sm text-gray-500">
                Descarga tu horario personal en formato CSV
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExportAll}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  📊 Exportar Todos los Horarios
                </button>
                <p className="text-sm text-gray-500">
                  Descarga un archivo Excel con todos los horarios
                </p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Filtrar por Servicio</h4>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="block w-48 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Seleccionar servicio</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedService) {
                        // This would need to be implemented in the backend as a filtered export
                        alert(`Exportando horarios para el servicio: ${selectedService}`);
                      }
                    }}
                    disabled={!selectedService}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                  >
                    📋 Exportar Servicio
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Schedule Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Horarios</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800">Total Empleados</h4>
            <p className="text-2xl font-bold text-blue-600">
              {user?.role === 'employee' ? '1' : schedules.length}
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800">Horarios Activos</h4>
            <p className="text-2xl font-bold text-green-600">
              {user?.role === 'employee' ? '1' : schedules.filter(s => s.monday_start || s.tuesday_start || s.wednesday_start || s.thursday_start || s.friday_start || s.saturday_start || s.sunday_start).length}
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800">Servicios</h4>
            <p className="text-2xl font-bold text-purple-600">
              {user?.role === 'employee' ? '1' : services.length}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {user?.role !== 'employee' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-4 w-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Horarios actualizados correctamente
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;