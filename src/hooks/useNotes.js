import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useNotes(category = null) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotes();

    const channel = supabase
      .channel('notas_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notas' }, (payload) => {
        handleRealtimeChange(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  const fetchNotes = async () => {
    let isDone = false;
    try {
      console.log('Iniciando fetchNotes...');
      setLoading(true);
      
      // Salvavidas de 5 segundos
      setTimeout(() => {
        if (!isDone) {
          console.warn('fetchNotes tardó demasiado. Forzando fin de carga.');
          setLoading(false);
          setError('La conexión está tardando demasiado.');
        }
      }, 5000);

      let query = supabase
        .from('notas')
        .select(`
          *,
          profiles (id, nombre, avatar_color)
        `)
        .order('created_at', { ascending: false });

      if (category && category !== 'Todas') {
        query = query.eq('categoria', category);
      }

      console.log('Ejecutando query de notas...');
      const { data, error } = await query;
      console.log('Respuesta de notas:', { data, error });
      
      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error en fetchNotes:', err);
      setError(err.message);
    } finally {
      isDone = true;
      setLoading(false);
    }
  };

  const handleRealtimeChange = async (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'INSERT') {
      // Necesitamos el perfil también, lo buscamos
      const { data } = await supabase.from('profiles').select('id, nombre, avatar_color').eq('id', newRecord.creado_por).single();
      const noteWithProfile = { ...newRecord, profiles: data };
      setNotes((prev) => {
        // Solo agregar si coincide con la categoría actual o no hay filtro
        if (!category || category === 'Todas' || newRecord.categoria === category) {
          // Prevenir duplicados
          if (!prev.find(n => n.id === newRecord.id)) {
            return [noteWithProfile, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }
        }
        return prev;
      });
    } else if (eventType === 'UPDATE') {
      setNotes((prev) => prev.map((n) => (n.id === newRecord.id ? { ...n, ...newRecord } : n)));
    } else if (eventType === 'DELETE') {
      setNotes((prev) => prev.filter((n) => n.id !== oldRecord.id));
    }
  };

  const createNote = async (noteData) => {
    const { data, error } = await supabase.from('notas').insert([noteData]).select();
    if (error) throw error;
    return data;
  };

  const updateNote = async (id, updates) => {
    const { data, error } = await supabase.from('notas').update(updates).eq('id', id).select();
    if (error) throw error;
    return data;
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notas').delete().eq('id', id);
    if (error) throw error;
  };

  return { notes, loading, error, createNote, updateNote, deleteNote, fetchNotes };
}
