import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (mounted) setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            // Solo buscar perfil si no lo tenemos para evitar ciclos
            if (!profile || profile.id !== session.user.id) {
              await fetchProfile(session.user.id);
            }
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      }
    );

    // Salvavidas: Forzar fin de carga después de 3 segundos máximo
    const timeoutId = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error al obtener o crear perfil:", error);
    }
  }

  const loginWithName = async (nombre) => {
    // Quitamos espacios y caracteres especiales para el email
    const safeName = nombre.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    const fakeEmail = `${safeName}@familianotas.com`;
    const fakePassword = 'FamiliaPassword123!';

    // Intentamos iniciar sesión primero
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: fakePassword
    });

    let userId = signInData?.user?.id;

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials') || signInError.status === 400) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: fakeEmail,
          password: fakePassword
        });
        
        if (signUpError) throw signUpError;
        userId = signUpData?.user?.id;
      } else {
        throw signInError;
      }
    }

    // Siempre garantizamos que el perfil exista con el nombre correcto
    if (userId) {
      const color = ['#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F97316'][Math.floor(Math.random() * 5)];
      
      // Upsert: Si existe actualiza el nombre, si no existe lo crea
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: userId,
        nombre: nombre.trim(),
        rol: 'Miembro',
        // No sobrescribimos el color si ya existía (Supabase upsert behavior)
      }, { onConflict: 'id', ignoreDuplicates: false });
      
      if (!upsertError) {
        await fetchProfile(userId);
      }
    }

    return signInData;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('sb-rowmnwosvsvdekdyngpt-auth-token');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithName, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
