
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API = 'http://localhost:8081';
const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE'];
const COLUMN_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const COLUMN_COLORS = { TODO: 'bg-gray-100', IN_PROGRESS: 'bg-blue-50', DONE: 'bg-green-50' };

export default function Board() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', description: '' });
    const [showForm, setShowForm] = useState(false);

    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');
    const headers = {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenantId
    };

    useEffect(() => {
        fetchTasks();
        const client = new Client({
            webSocketFactory: () => new SockJS(`${API}/ws`),
            onConnect: () => {
                client.subscribe(`/topic/tasks/${projectId}`, msg => {
                    const task = JSON.parse(msg.body);
                    setTasks(prev => {
                        const exists = prev.find(t => t.id === task.id);
                        if (exists) return prev.map(t => t.id === task.id ? task : t);
                        return [...prev, task];
                    });
                });
            }
        });
        client.activate();
        return () => client.deactivate();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${API}/api/tasks/project/${projectId}`, { headers });
            setTasks(res.data);
        } catch (err) {
            toast.error('Failed to load tasks');
        }
    };

    const createTask = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/tasks`, { ...newTask, projectId }, { headers });
            toast.success('Task created!');
            setNewTask({ title: '', description: '' });
            setShowForm(false);
        } catch (err) {
            toast.error('Failed to create task');
        }
    };

    const updateStatus = async (taskId, status) => {
        try {
            await axios.patch(`${API}/api/tasks/${taskId}/status`, { status }, { headers });
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')}
                            className="text-gray-500 hover:text-blue-600">← Back</button>
                    <h1 className="text-xl font-bold text-blue-600">Taskflow Board</h1>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    + Add Task
                </button>
            </nav>
            {showForm && (
                <div className="max-w-md mx-auto mt-4 bg-white p-6 rounded-xl shadow">
                    <form onSubmit={createTask} className="space-y-3">
                        <input type="text" placeholder="Task title"
                               value={newTask.title}
                               onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input type="text" placeholder="Description"
                               value={newTask.description}
                               onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                            Create Task
                        </button>
                    </form>
                </div>
            )}
            <div className="p-6 grid grid-cols-3 gap-4">
                {COLUMNS.map(col => (
                    <div key={col} className={`${COLUMN_COLORS[col]} rounded-xl p-4`}>
                        <h2 className="font-bold text-gray-700 mb-4">
                            {COLUMN_LABELS[col]} ({getTasksByStatus(col).length})
                        </h2>
                        <div className="space-y-3">
                            {getTasksByStatus(col).map(task => (
                                <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm">
                                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                                    <div className="mt-3 flex gap-2 flex-wrap">
                                        {COLUMNS.filter(c => c !== col).map(status => (
                                            <button key={status} onClick={() => updateStatus(task.id, status)}
                                                    className="text-xs bg-gray-200 hover:bg-blue-100 text-gray-700 px-2 py-1 rounded">
                                                → {COLUMN_LABELS[status]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {getTasksByStatus(col).length === 0 && (
                                <p className="text-gray-400 text-sm text-center py-4">No tasks</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}