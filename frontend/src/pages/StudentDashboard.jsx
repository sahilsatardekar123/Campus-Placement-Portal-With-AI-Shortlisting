import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({});
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [profileRes, jobsRes, appsRes] = await Promise.all([
                api.get('/students/profile'),
                api.get('/jobs'),
                api.get('/applications/me')
            ]);
            setProfile(profileRes.data.data);
            setJobs(jobsRes.data.data);
            setApplications(appsRes.data.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put('/students/profile', profile);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.errors
                ? err.response.data.errors.map(e => e.msg).join(', ')
                : 'Failed to update';
            setMessage(errorMsg);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleApply = async (jobId) => {
        try {
            const res = await api.post('/applications', { job_id: jobId });
            setMessage(\`Applied successfully! Match Score: \${res.data.rank.match_score}\`);
            fetchData(); // Refresh apps
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to apply');
        }
        setTimeout(() => setMessage(''), 5000);
    };

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    const appliedJobIds = new Set(applications.map(app => app.job_id));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>
            
            {message && (
                <div className="mb-4 bg-brand-50 border border-brand-200 text-brand-800 px-4 py-3 rounded relative">
                    {message}
                </div>
            )}

            <div className="flex space-x-4 mb-8 border-b border-gray-200">
                <button 
                    className={\`py-2 px-4 font-medium border-b-2 transition-colors \${activeTab === 'profile' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
                    onClick={() => setActiveTab('profile')}
                ><User className="inline w-4 h-4 mr-2"/>Profile</button>
                <button 
                    className={\`py-2 px-4 font-medium border-b-2 transition-colors \${activeTab === 'jobs' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
                    onClick={() => setActiveTab('jobs')}
                ><Briefcase className="inline w-4 h-4 mr-2"/>Available Jobs</button>
                <button 
                    className={\`py-2 px-4 font-medium border-b-2 transition-colors \${activeTab === 'apps' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
                    onClick={() => setActiveTab('apps')}
                ><CheckCircle className="inline w-4 h-4 mr-2"/>My Applications</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Branch</label>
                                <input type="text" value={profile.branch || ''} onChange={e => setProfile({...profile, branch: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                                <input type="number" value={profile.graduation_year || ''} onChange={e => setProfile({...profile, graduation_year: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">CGPA (0-10)</label>
                                <input type="number" step="0.01" value={profile.cgpa || ''} onChange={e => setProfile({...profile, cgpa: parseFloat(e.target.value)})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Experience (months)</label>
                                <input type="number" value={profile.experience || 0} onChange={e => setProfile({...profile, experience: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm" />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700">Skills (comma separated) <span className="text-red-500">*Crucial for AI Matching</span></label>
                            <input type="text" value={profile.skills || ''} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="e.g. React, Node.js, Python, Machine Learning" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm" />
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700">Projects / Additional Info</label>
                            <textarea rows={3} value={profile.projects || ''} onChange={e => setProfile({...profile, projects: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm" />
                        </div>
                        <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 transition">Save Profile</button>
                    </form>
                )}

                {activeTab === 'jobs' && (
                    <div className="space-y-4">
                        {jobs.length === 0 ? <p className="text-gray-500">No jobs available right now.</p> : jobs.map(job => (
                            <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                                        <p className="text-sm text-gray-500">{job.company_name}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleApply(job.id)}
                                        disabled={appliedJobIds.has(job.id)}
                                        className={\`px-4 py-2 rounded-md text-sm font-medium transition \${appliedJobIds.has(job.id) ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-brand-100 text-brand-700 hover:bg-brand-200'}\`}
                                    >
                                        {appliedJobIds.has(job.id) ? 'Applied' : 'Apply Now'}
                                    </button>
                                </div>
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500 block text-xs uppercase tracking-wider">Min CGPA</span><span className="font-semibold">{job.min_cgpa}</span></div>
                                    <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500 block text-xs uppercase tracking-wider">Experience</span><span className="font-semibold">{job.exp_required} months</span></div>
                                    <div className="bg-gray-50 p-3 rounded col-span-2"><span className="text-gray-500 block text-xs uppercase tracking-wider">Required Skills</span><span className="font-semibold text-brand-600">{job.skills_required}</span></div>
                                </div>
                                <p className="mt-4 text-gray-700 text-sm whitespace-pre-wrap">{job.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'apps' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company & Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No applications yet.</td></tr>
                                ) : applications.map((app, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{app.title}</div>
                                            <div className="text-sm text-gray-500">{app.company_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(app.applied_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                                    <div className="bg-brand-600 h-2.5 rounded-full" style={{ width: \`\${Math.min(100, Math.max(0, app.match_score * 100))}%\` }}></div>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{Math.round(app.match_score * 100)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
