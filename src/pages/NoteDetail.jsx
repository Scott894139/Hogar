import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { CommentSection } from '../components/CommentSection';
import { MemberBadge } from '../components/MemberBadge';
import { CATEGORY_COLORS } from '../components/CategoryFilter';
import { ArrowLeft, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx } from 'clsx';

export function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const { data, error } = await supabase
        .from('notas')
        .select(`
          *,
          profiles (id, nombre, avatar_color)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setNote(data);
    } catch (error) {
      console.error("Error al cargar nota:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Nota no encontrada</h2>
        <p className="text-slate-500 mb-6">Parece que esta nota fue eliminada o no existe.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const isCompleted = note.urgencia === 'completado';
  const profile = note.profiles || {};
  
  const urgencyConfig = {
    urgente: 'bg-red-100 text-red-700',
    normal: 'bg-slate-100 text-slate-700',
    completado: 'bg-green-100 text-green-700'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-slate-800">Detalle de Nota</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className={clsx(
            "bg-white rounded-3xl p-8 shadow-sm border border-slate-100",
            isCompleted && "bg-slate-50/50"
          )}>
            <div className="flex gap-2 items-center mb-6">
              <span className={clsx("text-sm font-semibold px-3 py-1.5 rounded-full", CATEGORY_COLORS[note.categoria])}>
                {note.categoria}
              </span>
              <span className={clsx("text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5", urgencyConfig[note.urgencia])}>
                {note.urgencia === 'urgente' && <Clock className="w-4 h-4" />}
                {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                {note.urgencia.charAt(0).toUpperCase() + note.urgencia.slice(1)}
              </span>
            </div>

            <h1 className={clsx(
              "text-3xl font-bold mb-4 text-slate-800",
              isCompleted && "line-through text-slate-500"
            )}>
              {note.titulo}
            </h1>

            <div className="prose prose-slate max-w-none mb-8 whitespace-pre-wrap text-slate-600">
              {note.contenido}
            </div>

            <div className="flex flex-col gap-4 py-6 border-y border-slate-100">
              {note.fecha_limite && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Fecha Límite</p>
                    <p className="text-slate-800 font-semibold">{format(new Date(note.fecha_limite), "d 'de' MMMM, yyyy", { locale: es })}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm">
                <MemberBadge name={profile.nombre} color={profile.avatar_color} size="lg" />
                <div>
                  <p className="text-slate-500 font-medium">Creado por</p>
                  <p className="text-slate-800 font-semibold">{profile.nombre}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400 text-right">
              Publicado el {format(new Date(note.created_at), "d 'de' MMM, HH:mm", { locale: es })}
            </div>
          </div>
        </div>

        <div className="h-[600px] md:h-[calc(100vh-8rem)] sticky top-24">
          <CommentSection noteId={note.id} currentUser={user} />
        </div>
      </main>
    </div>
  );
}
