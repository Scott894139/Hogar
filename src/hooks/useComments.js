import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useComments(noteId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!noteId) return;

    fetchComments();

    const channel = supabase
      .channel(`comments_${noteId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comentarios', filter: `nota_id=eq.${noteId}` },
        async (payload) => {
          const { data } = await supabase
            .from('profiles')
            .select('id, nombre, avatar_color')
            .eq('id', payload.new.creado_por)
            .single();
          
          setComments((prev) => {
            const newComment = { ...payload.new, profiles: data };
            if (!prev.find(c => c.id === newComment.id)) {
               return [...prev, newComment];
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comentarios')
        .select(`
          *,
          profiles (id, nombre, avatar_color)
        `)
        .eq('nota_id', noteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content, userId) => {
    const { error } = await supabase
      .from('comentarios')
      .insert([{ nota_id: noteId, contenido: content, creado_por: userId }]);
    if (error) throw error;
  };

  return { comments, loading, addComment };
}
