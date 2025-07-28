import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    service: '',
    role: 'employee'
  });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchSchedules();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/register`, newEmployee);
      setShowAddModal(false);
      setNewEmployee({
        username: '',
        email: '',
        full_name: '',
        password: '',
        service: '',
        role: 'employee'
      });
      fetchEmployees();
      alert('Empleado agregado exitosamente');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error al agregar empleado: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee({
      ...employee,
      password: '' // Don't show existing password
    });
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        username: editingEmployee.username,
        email: editingEmployee.email,
        full_name: editingEmployee.full_name,
        service: editingEmployee.service,
        is_active: editingEmployee.is_active
      };
      
      // Only include password if it's not empty
      if (editingEmployee.password) {
        updateData.password = editingEmployee.password;
      }

      await axios.put(`${API}/users/${editingEmployee.id}`, updateData);
      setShowEditModal(false);
      setEditingEmployee(null);
      fetchEmployees();
      alert('Empleado actualizado exitosamente');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error al actualizar empleado: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${employeeName}? Esta acción no se puede deshacer.`)) {
      try {
        await axios.delete(`${API}/users/${employeeId}`);
        fetchEmployees();
        alert('Empleado eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error al eliminar empleado: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleViewSchedule = (employee) => {
    setSelectedEmployee(employee);
    setShowScheduleModal(true);
  };

  const getEmployeeSchedule = (employeeId) => {
    return schedules.find(s => s.user_id === employeeId);
  };

  const formatTime = (time) => {
    return time ? time.slice(0, 5) : '-';
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
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Empleados</h2>
          <p className="mt-2 text-sm text-gray-700">
            Lista de empleados con sus horarios asignados
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Agregar Empleado
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => {
              const schedule = getEmployeeSchedule(employee.id);
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {employee.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule ? (
                      <span className="text-green-600">✓ Asignado</span>
                    ) : (
                      <span className="text-red-600">✗ Sin asignar</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewSchedule(employee)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver Horario
                      </button>
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id, employee.full_name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Empleado</h3>
              <form onSubmit={handleAddEmployee}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.full_name}
                      onChange={(e) => setNewEmployee({...newEmployee, full_name: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usuario</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.username}
                      onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input
                      type="password"
                      required
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Servicio</label>
                    <input
                      type="text"
                      required
                      value={newEmployee.service}
                      onChange={(e) => setNewEmployee({...newEmployee, service: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Empleado</h3>
              <form onSubmit={handleUpdateEmployee}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                    <input
                      type="text"
                      required
                      value={editingEmployee.full_name}
                      onChange={(e) => setEditingEmployee({...editingEmployee, full_name: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usuario</label>
                    <input
                      type="text"
                      required
                      value={editingEmployee.username}
                      onChange={(e) => setEditingEmployee({...editingEmployee, username: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={editingEmployee.email}
                      onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nueva Contraseña (opcional)</label>
                    <input
                      type="password"
                      value={editingEmployee.password}
                      onChange={(e) => setEditingEmployee({...editingEmployee, password: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Servicio</label>
                    <input
                      type="text"
                      required
                      value={editingEmployee.service}
                      onChange={(e) => setEditingEmployee({...editingEmployee, service: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingEmployee.is_active}
                        onChange={(e) => setEditingEmployee({...editingEmployee, is_active: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Activo</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Horario de {selectedEmployee.full_name}
              </h3>
              
              {(() => {
                const schedule = getEmployeeSchedule(selectedEmployee.id);
                if (!schedule) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No hay horario asignado para este empleado</p>
                    </div>
                  );
                }

                const days = [
                  { key: 'monday', name: 'Lunes' },
                  { key: 'tuesday', name: 'Martes' },
                  { key: 'wednesday', name: 'Miércoles' },
                  { key: 'thursday', name: 'Jueves' },
                  { key: 'friday', name: 'Viernes' },
                  { key: 'saturday', name: 'Sábado' },
                  { key: 'sunday', name: 'Domingo' }
                ];

                return (
                  <div className="space-y-4">
                    {days.map(day => (
                      <div key={day.key} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{day.name}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Inicio:</span>
                            <p className="font-medium">{formatTime(schedule[`${day.key}_start`])}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Descanso:</span>
                            <p className="font-medium">{formatTime(schedule[`${day.key}_break_start`])}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Fin Descanso:</span>
                            <p className="font-medium">{formatTime(schedule[`${day.key}_break_end`])}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Fin:</span>
                            <p className="font-medium">{formatTime(schedule[`${day.key}_end`])}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;