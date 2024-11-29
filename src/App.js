import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import EditTask from './components/EditTask';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
  };

  const addTask = async (task) => {
    console.log('Añadiendo tarea:', task);

    const { data, error } = await supabase.from('tasks').insert([{
      title: task.title,
      description: task.description,
      completed: task.completed
    }]).select();

    if (error) {
      console.error('Error al añadir tarea:', error.message);
      return;
    }

    console.log('Respuesta de la inserción:', data);
    if (Array.isArray(data)) {
      setTasks([...tasks, ...data]);
    }
  };

  const updateTask = async (id, updates) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select();
    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    if (Array.isArray(data)) {
      setTasks(tasks.map(task => task.id === id ? data[0] : task));
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = async (id, currentStatus) => {
    const updates = { completed: !currentStatus };
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select();
    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    if (Array.isArray(data)) {
      setTasks(tasks.map(task => task.id === id ? data[0] : task));
    }
  };

  const startEditingTask = (task) => {
    setEditingTask(task);
  };

  const saveTask = async (task) => {
    const { data, error } = await supabase.from('tasks').update(task).eq('id', task.id).select();
    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    if (Array.isArray(data)) {
      setTasks(tasks.map(t => t.id === task.id ? data[0] : t));
      setEditingTask(null);
    }
  };

  const cancelEditing = () => {
    setEditingTask(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Administrador de Tareas</h1>
      </header>
      <div className="App-content">
        <aside className={`App-sidebar ${tasks.length === 0 ? 'centered' : ''}`}>
          <AddTask addTask={addTask} />
        </aside>
        <main className="App-main">
          <TaskList tasks={tasks} updateTask={updateTask} deleteTask={deleteTask} toggleTaskCompletion={toggleTaskCompletion} startEditingTask={startEditingTask} />
          {editingTask && (
            <EditTask task={editingTask} saveTask={saveTask} cancelEditing={cancelEditing} />
          )}
        </main>
      </div>
      <footer className="App-footer">
        <p>© 2024 Belén Castañera</p>
      </footer>
    </div>
  );
}

export default App;
