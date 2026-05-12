import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MemberBadge } from './MemberBadge';
import { useComments } from '../hooks/useComments';

export function CommentSection({ noteId, currentUser }) {
  const { comments, loading, addComment } = useComments(noteId);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      await addComment(newComment.trim(), currentUser.id);
      setNewComment('');
    } catch (error) {
      console.error("Error al enviar comentario:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-white">
        <h3 className="font-semibold text-slate-800">Comentarios ({comments.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-slate-400 py-4 text-sm">Cargando comentarios...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-slate-400 py-8 text-sm">No hay comentarios aún. ¡Sé el primero!</div>
        ) : (
          comments.map(comment => {
            const isMe = comment.creado_por === currentUser?.id;
            const profile = comment.profiles || {};

            return (
              <div key={comment.id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0 mt-auto mb-1">
                  <MemberBadge name={profile.nombre} color={profile.avatar_color} size="sm" />
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-slate-500 mb-1 px-1">
                    {profile.nombre?.split(' ')[0]} • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                  }`}>
                    {comment.contenido}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm shadow-blue-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
