import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Briefcase } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <Briefcase className="h-6 w-6 text-brand-600" />
                            <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">SkillSync<span className="text-brand-600">Campus</span></Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-sm text-gray-500 capitalize px-2">Role: {user.role}</span>
                                <button
                                    onClick={logout}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors">Login</Link>
                                <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none transition-colors">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
