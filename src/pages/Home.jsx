import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';
import { CategoryFilter } from '../components/CategoryFilter';
import { NoteCard } from '../components/NoteCard';
import { NoteForm } from '../components/NoteForm';
import { MemberBadge } from '../components/MemberBadge';
import { usePush } from '../hooks/usePush';
import { LogOut, Plus, Heart, Bell } from 'lucide-react';

export function Home() {
  const { user, profile, logout } = useAuth();
  const [currentCategory, setCurrentCategory] = useState('Todas');
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes(currentCategory);
  const [showForm, setShowForm] = useState(false);
  const { isSubscribed, subscribe, loading: pushLoading } = usePush(user?.id);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 shadow-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <Heart className="w-6 h-6 fill-current" />
            <span>Familia Notas</span>
          </div>
          
          <div className="flex items-center gap-4">
            {profile && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">{profile.nombre}</span>
              </div>
            )}
            <MemberBadge name={profile?.nombre} color={profile?.avatar_color} size="md" />
            
            {(!isSubscribed && !pushLoading) && (
              <button 
                onClick={subscribe}
                className="p-2 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
                title="Activar notificaciones"
              >
                <Bell className="w-5 h-5" />
              </button>
            )}

            <div className="h-6 w-px bg-slate-200"></div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Tablero Familiar</h1>
          <p className="text-slate-500">¿Qué hay de nuevo en la casa hoy?</p>
        </div>

        <CategoryFilter 
          currentCategory={currentCategory} 
          onSelectCategory={setCurrentCategory} 
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">No hay notas</h3>
            <p className="text-slate-500">Aún no hay nada en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                currentUser={user}
                onComplete={updateNote}
                onDelete={deleteNote}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Form Modal */}
      {showForm && (
        <NoteForm 
          onClose={() => setShowForm(false)} 
          onSubmit={createNote}
          userId={user?.id}
          profile={profile}
        />
      )}
    </div>
  );
}
