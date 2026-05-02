
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:8081';

export default function Register() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', workspaceName: ''
    });
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/api/auth/register`, form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('tenantId', res.data.tenantId);
            toast.success('Account created!');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Create your account</h1>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input name="name" type="text" placeholder="Full name"
                           value={form.name} onChange={handleChange}
                           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input name="email" type="email" placeholder="Email"
                           value={form.email} onChange={handleChange}
                           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input name="password" type="password" placeholder="Password"
                           value={form.password} onChange={handleChange}
                           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input name="workspaceName" type="text" placeholder="Workspace name"
                           value={form.workspaceName} onChange={handleChange}
                           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
                        Create Account
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}