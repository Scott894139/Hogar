import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, Circle, Trophy, PartyPopper } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const TASKS = [
  { id: 'cambiar_ropa', label: 'Cambiarme de ropa' },
  { id: 'banarse', label: 'Bañarme' },
  { id: 'hacer_cama', label: 'Hacer la cama' },
  { id: 'recoger_ropa', label: 'Recoger la ropa sucia' },
  { id: 'ordenar_pieza', label: 'Ordenar mi pieza' }
];

export function RutinasDiarias() {
  const { profile } = useAuth();
  const [rutinas, setRutinas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comprobar si es de lunes a viernes (1 = Lunes, 5 = Viernes)
  const isWeekday = () => {
    const day = new Date().getDay();
    return day >= 1 && day <= 5;
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (profile && isWeekday()) {
      fetchRutinas();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const fetchRutinas = async () => {
    try {
      if (profile.rol === 'Mamá' || profile.rol === 'Papá') {
        // Padres ven las misiones de todos los hijos
        const { data: kidsProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('rol', ['Hijo', 'Hija']);

        if (kidsProfiles && kidsProfiles.length > 0) {
          const { data: rutinasHoy } = await supabase
            .from('rutinas_diarias')
            .select('*, profiles(nombre, avatar_color)')
            .eq('fecha', todayStr);

          // Verificar si falta crear la lista de algún niño hoy
          const existingIds = rutinasHoy?.map(r => r.profile_id) || [];
          const missingKids = kidsProfiles.filter(k => !existingIds.includes(k.id));

          if (missingKids.length > 0) {
            const newRuts = missingKids.map(k => ({ profile_id: k.id, fecha: todayStr }));
            await supabase.from('rutinas_diarias').insert(newRuts);
            
            // Volver a consultar con las listas ya creadas
            const { data: refetched } = await supabase
              .from('rutinas_diarias')
              .select('*, profiles(nombre, avatar_color)')
              .eq('fecha', todayStr)
              .order('id', { ascending: true });
            setRutinas(refetched || []);
          } else {
            setRutinas(rutinasHoy || []);
          }
        }
      } else {
        // Niños solo ven su propia lista
        const { data: miRutina } = await supabase
          .from('rutinas_diarias')
          .select('*, profiles(nombre, avatar_color)')
          .eq('fecha', todayStr)
          .eq('profile_id', profile.id)
          .single();

        if (miRutina) {
          setRutinas([miRutina]);
        } else {
          // Si es su primer inicio de sesión de hoy, crear su lista vacía
          const { data: creada } = await supabase
            .from('rutinas_diarias')
            .insert({ profile_id: profile.id, fecha: todayStr })
            .select('*, profiles(nombre, avatar_color)')
            .single();
          if (creada) setRutinas([creada]);
        }
      }
    } catch (e) {
      console.error('Error cargando rutinas:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (rutinaId, taskKey, currentValue) => {
    // Actualización instantánea en pantalla (Optimistic UI)
    setRutinas(prev => prev.map(r => 
      r.id === rutinaId ? { ...r, [taskKey]: !currentValue } : r
    ));

    // Guardado silencioso en la base de datos
    try {
      await supabase
        .from('rutinas_diarias')
        .update({ [taskKey]: !currentValue })
        .eq('id', rutinaId);
    } catch (e) {
      console.error('Error al guardar la tarea:', e);
      fetchRutinas(); // Si falla, recargar de la base de datos
    }
  };

  if (!isWeekday()) {
    return (
      <div className="mb-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 text-center border border-purple-200">
        <PartyPopper className="w-8 h-8 text-purple-500 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-purple-800">¡Es fin de semana!</h3>
        <p className="text-purple-600 text-sm">Hoy no hay misiones obligatorias. ¡A descansar y jugar!</p>
      </div>
    );
  }

  if (loading) return <div className="animate-pulse bg-slate-100 h-32 rounded-3xl mb-8"></div>;
  if (!rutinas.length) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Trophy className="text-yellow-500 w-6 h-6" /> 
        Misiones del Día
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rutinas.map(rutina => {
          const completedCount = TASKS.filter(t => rutina[t.id]).length;
          const isAllDone = completedCount === TASKS.length;

          return (
            <div key={rutina.id} className={clsx(
              "bg-white rounded-3xl p-5 shadow-sm border transition-all duration-300",
              isAllDone ? "border-green-300 bg-gradient-to-b from-green-50/50 to-white shadow-green-100" : "border-slate-100"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: rutina.profiles?.avatar_color || '#ccc' }}
                  >
                    {rutina.profiles?.nombre?.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-700">{rutina.profiles?.nombre}</span>
                </div>
                <span className={clsx(
                  "text-xs font-bold px-3 py-1.5 rounded-full transition-colors",
                  isAllDone ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                )}>
                  {completedCount}/{TASKS.length} completadas
                </span>
              </div>
              
              <div className="space-y-1.5">
                {TASKS.map(task => {
                  const isChecked = rutina[task.id];
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(rutina.id, task.id, isChecked)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 group-hover:text-blue-400 flex-shrink-0" />
                      )}
                      <span className={clsx(
                        "text-sm font-medium transition-all duration-300",
                        isChecked ? "text-slate-400 line-through" : "text-slate-700"
                      )}>
                        {task.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
