import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PendingRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [response, setResponse] = useState('');
  const [responseType, setResponseType] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`${API}/pending-requests`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId, status) => {
    try {
      await axios.put(`${API}/schedule-requests/${requestId}/respond`, {
        request_id: requestId,
        status: status,
        response: response
      });
      
      setShowResponseModal(false);
      setResponse('');
      setSelectedRequest(null);
      fetchPendingRequests();
      alert('Respuesta enviada correctamente');
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Error al responder la solicitud');
    }
  };

  const openResponseModal = (request, type) => {
    setSelectedRequest(request);
    setResponseType(type);
    setShowResponseModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <h2 className="text-xl font-semibold text-gray-900">Solicitudes Pendientes</h2>
          <p className="mt-2 text-sm text-gray-700">
            Revisa y responde las solicitudes de cambio de horario de los empleados
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg px-4 py-2">
            <span className="text-yellow-800 font-medium">{requests.length} solicitudes pendientes</span>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes pendientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Todas las solicitudes han sido procesadas
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Solicitada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Solicitud
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {/* We'll need to get employee name from user data */}
                      Empleado ID: {request.employee_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      request.request_type === 'day_off' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {request.request_type === 'day_off' ? 'Día libre' : 'Cambio de horario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.requested_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={request.reason}>
                      {request.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openResponseModal(request, 'approved')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => openResponseModal(request, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {responseType === 'approved' ? 'Aprobar' : 'Rechazar'} Solicitud
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Empleado:</strong> {selectedRequest.employee_id}<br />
                  <strong>Tipo:</strong> {selectedRequest.request_type === 'day_off' ? 'Día libre' : 'Cambio de horario'}<br />
                  <strong>Fecha:</strong> {formatDate(selectedRequest.requested_date)}<br />
                  <strong>Motivo:</strong> {selectedRequest.reason}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justificación de la respuesta:
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ingresa la justificación de tu decisión..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setResponse('');
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRespondToRequest(selectedRequest.id, responseType)}
                  disabled={!response.trim()}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    responseType === 'approved' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:bg-gray-400`}
                >
                  {responseType === 'approved' ? 'Aprobar' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;