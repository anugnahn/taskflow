
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:8081';

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');
    const headers = {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenantId
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${API}/api/projects`, { headers });
            setProjects(res.data);
        } catch (err) {
            toast.error('Failed to load projects');
        }
    };

    const createProject = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/api/projects`, newProject, { headers });
            toast.success('Project created!');
            setNewProject({ name: '', description: '' });
            setShowForm(false);
            fetchProjects();
        } catch (err) {
            toast.error('Failed to create project');
        }
    };

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">Taskflow</h1>
                <button onClick={logout} className="text-gray-600 hover:text-red-500">Logout</button>
            </nav>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
                    <button onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        + New Project
                    </button>
                </div>
                {showForm && (
                    <form onSubmit={createProject} className="bg-white p-6 rounded-xl shadow mb-6 space-y-4">
                        <input type="text" placeholder="Project name"
                               value={newProject.name}
                               onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input type="text" placeholder="Description"
                               value={newProject.description}
                               onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            Create
                        </button>
                    </form>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map(project => (
                        <div key={project.id} onClick={() => navigate(`/board/${project.id}`)}
                             className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-md transition">
                            <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                            <p className="text-gray-500 mt-1">{project.description}</p>
                            <span className="text-blue-600 text-sm mt-3 inline-block">Open Board →</span>
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <p className="text-gray-500 col-span-2 text-center py-12">
                            No projects yet. Create your first one!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}