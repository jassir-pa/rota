import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Configuration = () => {
  const { user } = useAuth();
  const [configuration, setConfiguration] = useState({ background_color: '#ffffff' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const response = await axios.get(`${API}/configuration`);
      setConfiguration(response.data);
    } catch (error) {
      console.error('Error fetching configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/configuration`, configuration);
      alert('Configuración guardada correctamente');
      // Reload page to apply background color
      window.location.reload();
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const colorOptions = [
    { name: 'Blanco', value: '#ffffff', preview: 'bg-white' },
    { name: 'Rosa Claro', value: '#fce7f3', preview: 'bg-pink-100' },
    { name: 'Azul Claro', value: '#dbeafe', preview: 'bg-blue-100' },
    { name: 'Verde Claro', value: '#dcfce7', preview: 'bg-green-100' },
    { name: 'Amarillo Claro', value: '#fef3c7', preview: 'bg-yellow-100' },
    { name: 'Púrpura Claro', value: '#e9d5ff', preview: 'bg-purple-100' }
  ];

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
          <h2 className="text-xl font-semibold text-gray-900">Configuración</h2>
          <p className="mt-2 text-sm text-gray-700">
            {user?.role === 'employee' 
              ? 'Personaliza tu experiencia en la aplicación' 
              : 'Configura la apariencia de la aplicación'}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Apariencia</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color de fondo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setConfiguration({ ...configuration, background_color: color.value })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    configuration.background_color === color.value 
                      ? 'border-indigo-500 ring-2 ring-indigo-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-12 rounded-md mb-2 ${color.preview} border border-gray-200`}></div>
                  <span className="text-sm font-medium text-gray-900">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Vista previa</h4>
            <div 
              className="p-6 rounded-lg border-2 border-dashed border-gray-300"
              style={{ backgroundColor: configuration.background_color }}
            >
              <div className="bg-white rounded-lg shadow p-4 max-w-md">
                <h5 className="font-medium text-gray-900 mb-2">HORARIOS CONECTA</h5>
                <p className="text-sm text-gray-600">
                  Esta es una vista previa de cómo se verá la aplicación con el color de fondo seleccionado.
                </p>
              </div>
            </div>
          </div>

          {(user?.role === 'admin' || user?.role === 'coordinator') && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveConfiguration}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Versión</dt>
            <dd className="mt-1 text-sm text-gray-900">1.0.0</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Última actualización</dt>
            <dd className="mt-1 text-sm text-gray-900">Enero 2025</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Usuario actual</dt>
            <dd className="mt-1 text-sm text-gray-900">{user?.full_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Rol</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {user?.role}
              </span>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;