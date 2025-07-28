import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Calendar = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchSchedules();
    if (user?.role !== 'employee') {
      fetchUsers();
    }
  }, [user]);

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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getDayName = (date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const getCurrentDaySchedule = () => {
    const today = new Date();
    const dayName = getDayName(today);
    
    if (user?.role === 'employee') {
      const mySchedule = schedules.find(s => s.user_id === user.id);
      if (mySchedule) {
        return {
          start: mySchedule[`${dayName}_start`],
          break_start: mySchedule[`${dayName}_break_start`],
          break_end: mySchedule[`${dayName}_break_end`],
          end: mySchedule[`${dayName}_end`]
        };
      }
    }
    return null;
  };

  const getEmployeeScheduleForDay = (employeeId, day) => {
    const schedule = schedules.find(s => s.user_id === employeeId);
    if (schedule) {
      return {
        start: schedule[`${day}_start`],
        break_start: schedule[`${day}_break_start`],
        break_end: schedule[`${day}_break_end`],
        end: schedule[`${day}_end`]
      };
    }
    return null;
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

  if (user?.role === 'employee') {
    const todaySchedule = getCurrentDaySchedule();
    const today = new Date();
    
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Mi Horario de Hoy - {today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h2>
          
          {todaySchedule ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800">Inicio Jornada</h3>
                <p className="text-2xl font-bold text-green-600">{formatTime(todaySchedule.start)}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800">Inicio Descanso</h3>
                <p className="text-2xl font-bold text-yellow-600">{formatTime(todaySchedule.break_start)}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800">Fin Descanso</h3>
                <p className="text-2xl font-bold text-yellow-600">{formatTime(todaySchedule.break_end)}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800">Fin Jornada</h3>
                <p className="text-2xl font-bold text-red-600">{formatTime(todaySchedule.end)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No tienes horario asignado para hoy</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Horarios de Empleados</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.filter(u => u.role === 'employee').map(employee => {
            const schedule = schedules.find(s => s.user_id === employee.id);
            const today = getDayName(new Date());
            const todaySchedule = schedule ? getEmployeeScheduleForDay(employee.id, today) : null;
            
            return (
              <div key={employee.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{employee.full_name}</h3>
                  <span className="text-sm text-gray-500">{employee.service}</span>
                </div>
                
                {todaySchedule && (todaySchedule.start || todaySchedule.end) ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Jornada:</span>
                      <span className="font-medium">{formatTime(todaySchedule.start)} - {formatTime(todaySchedule.end)}</span>
                    </div>
                    {todaySchedule.break_start && todaySchedule.break_end && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Descanso:</span>
                        <span className="font-medium">{formatTime(todaySchedule.break_start)} - {formatTime(todaySchedule.break_end)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Sin horario asignado</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;