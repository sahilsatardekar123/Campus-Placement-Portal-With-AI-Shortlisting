import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Briefcase, Users, PlusCircle, Trash2 } from 'lucide-react';

const RecruiterDashboard = () => {
    const [activeTab, setActiveTab] = useState('jobs');
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '', skills_required: '', min_cgpa: 0, exp_required: 0, description: ''
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/jobs/me');
            setJobs(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await api.post('/jobs', formData);
            setMessage('Job created successfully!');
            setFormData({ title: '', skills_required: '', min_cgpa: 0, exp_required: 0, description: '' });
            fetchJobs();
            setActiveTab('jobs');
        } catch (err) {
            const errorMsg = err.response?.data?.errors
                ? err.response.data.errors.map(e => e.msg).join(', ')
                : 'Failed to create job';
            setMessage(errorMsg);
        }
        setTimeout(() => setMessage(''), 5000);
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/jobs/${jobId}`);
            setMessage('Job deleted successfully.');
            fetchJobs(); // Refresh the list
            if (selectedJob?.id === jobId) setSelectedJob(null);
        } catch (error) {
            console.error('Failed to delete job', error);
            setMessage('Failed to delete job.');
        }
        setTimeout(() => setMessage(''), 5000);
    };

    const viewApplicants = async (job) => {
        setSelectedJob(job);
        setActiveTab('applicants');
        try {
            const res = await api.get(`/applications/${job.id}/applicants`);
            setApplicants(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Recruiter Dashboard</h1>

            {message && (
                <div className="mb-4 bg-brand-50 border border-brand-200 text-brand-800 px-4 py-3 rounded relative">
                    {message}
                </div>
            )}

            <div className="flex space-x-4 mb-8 border-b border-gray-200">
                <button
                    className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'jobs' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => { setActiveTab('jobs'); setSelectedJob(null); }}
                ><Briefcase className="inline w-4 h-4 mr-2" />My Postings</button>
                <button
                    className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'post' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('post')}
                ><PlusCircle className="inline w-4 h-4 mr-2" />Post New Job</button>
                {selectedJob && (
                    <button
                        className={`py-2 px-4 font-medium border-b-2 transition-colors ${activeTab === 'applicants' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    ><Users className="inline w-4 h-4 mr-2" />Applicants ({selectedJob.title})</button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {activeTab === 'jobs' && (
                    <div className="space-y-4">
                        {jobs.length === 0 ? <p className="text-gray-500">No jobs posted yet.</p> : jobs.map(job => (
                            <div key={job.id} className="border border-gray-200 rounded-lg p-6 flex justify-between items-center hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Skills: {job.skills_required}</p>
                                    <p className="text-xs text-gray-400 mt-1">Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <button
                                        onClick={() => viewApplicants(job)}
                                        className="bg-brand-50 text-brand-600 hover:bg-brand-100 px-4 py-2 rounded-md font-medium transition mr-2"
                                    >
                                        View AI Ranking
                                    </button>
                                    <button
                                        onClick={() => handleDeleteJob(job.id)}
                                        className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-md transition"
                                        title="Delete Job"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'post' && (
                    <form onSubmit={handleCreateJob} className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma separated) <span className="text-brand-600 font-semibold">*AI Basis*</span></label>
                            <input type="text" required value={formData.skills_required} onChange={e => setFormData({ ...formData, skills_required: e.target.value })} placeholder="e.g. React, Node.js, Typescript" className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum CGPA</label>
                                <input type="number" step="0.01" value={formData.min_cgpa} onChange={e => setFormData({ ...formData, min_cgpa: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience (months)</label>
                                <input type="number" value={formData.exp_required} onChange={e => setFormData({ ...formData, exp_required: parseInt(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                            <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
                        </div>
                        <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded-md hover:bg-brand-700 transition">Publish Job</button>
                    </form>
                )}

                {activeTab === 'applicants' && (
                    <div>
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">AI Ranked Candidates</h2>
                                <p className="text-sm text-gray-500">Sorted automatically based on Skill Similarity, CGPA, and Experience</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrics</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matched Skills</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {applicants.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No applications yet.</td></tr>
                                    ) : applicants.map((app, idx) => (
                                        <tr key={idx} className={idx < 5 ? 'bg-amber-50/30' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${idx < 3 ? 'bg-brand-100 text-brand-700 font-bold' : 'bg-gray-100 text-gray-600 font-medium'}`}>
                                                    #{idx + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{app.full_name}</div>
                                                <div className="text-xs text-gray-500">{app.email}</div>
                                                <div className="text-xs text-gray-400 mt-1">{app.branch} '{app.graduation_year}</div>
                                                {app.resume_url && (
                                                    <div className="text-xs mt-2">
                                                        <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-800 hover:underline font-medium inline-flex items-center">
                                                            View Resume ↗
                                                        </a>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`text-lg font-bold ${app.match_score > 0.7 ? 'text-green-600' : app.match_score > 0.4 ? 'text-amber-600' : 'text-gray-500'}`}>
                                                        {Math.round(app.match_score * 100)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-y-1">
                                                <div><span className="font-medium">CGPA:</span> {app.cgpa}</div>
                                                <div><span className="font-medium">Exp:</span> {app.experience} mo</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 mb-1">
                                                    <span className="text-green-600 font-medium whitespace-normal">
                                                        ✓ {app.matched_skills || 'None'}
                                                    </span>
                                                </div>
                                                {app.missing_skills && (
                                                    <div className="text-xs text-red-500 whitespace-normal">
                                                        Missing: {app.missing_skills}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterDashboard;
