import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Heart, User } from 'lucide-react';

export function Login() {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginWithName } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (selectedName) => {
    if (!selectedName.trim()) return;
    
    setError('');
    setLoading(true);

    try {
      await loginWithName(selectedName);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al entrar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600 rotate-3">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Familia Notas</h1>
          <p className="text-slate-500 text-sm mt-2 text-center">
            ¿Quién eres? Selecciona tu nombre
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {[
            { id: 'Karen', display: 'Mamá' },
            { id: 'Scott', display: 'Papá' },
            { id: 'Emma', display: 'Hija' },
            { id: 'Tomas', display: 'Hijo' }
          ].map((member) => (
            <button
              key={member.id}
              onClick={() => {
                setNombre(member.display);
                handleSubmit(member.display);
              }}
              disabled={loading}
              className="w-full flex items-center p-4 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-2xl transition-all group"
            >
              <div className="w-16 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-4 group-hover:scale-105 transition-transform">
                {member.display}
              </div>
              <span className="text-lg font-medium text-slate-700 group-hover:text-blue-700">
                {member.id}
              </span>
              {loading && nombre === member.display && (
                <div className="ml-auto animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* Eliminar el formulario original */}
      </div>
    </div>
  );
}
