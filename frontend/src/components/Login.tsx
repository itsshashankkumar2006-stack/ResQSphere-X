import { useState } from 'react';
import { Shield, Lock, User, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Login() {
  const login = useStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials for the Hackathon MVP
    if (username === 'admin' && password === 'admin123') {
      login();
    } else {
      setError('Invalid clearance credentials. Access denied.');
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-950 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="bg-gray-950 p-3 rounded-full border border-gray-800 mb-4">
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
            ResQSphere<span className="text-blue-500">-X</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Operator ID</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Enter admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="password" 
                className="w-full bg-gray-950 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Enter admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-900 text-red-400 text-xs p-3 rounded flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Lock className="h-4 w-4" />
            Establish Secure Connection
          </button>
        </form>
      </div>
    </div>
  );
}
