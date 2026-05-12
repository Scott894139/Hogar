import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Trash2, Clock, MessageSquare, Calendar } from 'lucide-react';
import { MemberBadge } from './MemberBadge';
import { CATEGORY_COLORS } from './CategoryFilter';
import { clsx } from 'clsx';

export function NoteCard({ note, currentUser, onComplete, onDelete }) {
  const isCreator = currentUser?.id === note.creado_por;
  const isCompleted = note.urgencia === 'completado';
  const profile = note.profiles || {};

  const urgencyConfig = {
    urgente: 'bg-red-100 text-red-700',
    normal: 'bg-slate-100 text-slate-700',
    completado: 'bg-green-100 text-green-700'
  };

  const handleComplete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onComplete(note.id, isCompleted ? 'normal' : 'completado');
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar esta nota?')) {
      onDelete(note.id);
    }
  };

  return (
    <Link to={`/nota/${note.id}`} className="block">
      <div className={clsx(
        "bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md group",
        isCompleted && "opacity-75 bg-slate-50"
      )}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-2 items-center">
            <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full", CATEGORY_COLORS[note.categoria])}>
              {note.categoria}
            </span>
            <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1", urgencyConfig[note.urgencia])}>
              {note.urgencia === 'urgente' && <Clock className="w-3 h-3" />}
              {note.urgencia.charAt(0).toUpperCase() + note.urgencia.slice(1)}
            </span>
          </div>
          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleComplete}
              className={clsx(
                "p-1.5 rounded-full hover:bg-slate-100 transition-colors",
                isCompleted ? "text-green-600" : "text-slate-400"
              )}
              title={isCompleted ? "Desmarcar completado" : "Marcar como completado"}
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
            {isCreator && (
              <button 
                onClick={handleDelete}
                className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                title="Eliminar nota"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <h3 className={clsx(
          "text-xl font-bold mb-2 text-slate-800",
          isCompleted && "line-through text-slate-500"
        )}>
          {note.titulo}
        </h3>
        
        <p className={clsx(
          "text-sm mb-4 line-clamp-2",
          isCompleted ? "text-slate-400" : "text-slate-600"
        )}>
          {note.contenido}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <MemberBadge name={profile.nombre} color={profile.avatar_color} size="sm" />
            <span className="text-xs text-slate-500 font-medium">
              {profile.nombre?.split(' ')[0]}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {note.fecha_limite && (
              <div className="flex items-center gap-1 text-orange-600 font-medium">
                <Calendar className="w-3 h-3" />
                {format(new Date(note.fecha_limite), "d MMM", { locale: es })}
              </div>
            )}
            <div className="flex items-center gap-1">
              {format(new Date(note.created_at), "d MMM", { locale: es })}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
