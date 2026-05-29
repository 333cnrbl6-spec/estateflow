import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';


export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8faff', fontFamily: 'Poppins, Inter, Segoe UI, sans-serif' }}>
            <div className="max-w-md w-full text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: '#0A1E3F' }}>
                    <span className="text-white font-bold text-lg">P</span>
                </div>
                <h1 className="text-6xl font-bold mb-3" style={{ color: '#007BFF' }}>404</h1>
                <h2 className="text-xl font-bold mb-3" style={{ color: '#0A1E3F' }}>Page Not Found</h2>
                <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                    The page <span className="font-semibold" style={{ color: '#0A1E3F' }}>"{pageName}"</span> could not be found.
                </p>
                
                {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
                    <div className="mb-6 p-4 rounded-xl text-left text-sm" style={{ background: '#fff3e0', border: '1px solid #FF7A0040' }}>
                        <p className="font-semibold mb-1" style={{ color: '#FF7A00' }}>Admin Note</p>
                        <p className="text-slate-600">This page may not be implemented yet. Ask the AI assistant to build it in the chat.</p>
                    </div>
                )}
                
                <button
                    onClick={() => window.location.href = '/'}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-90"
                    style={{ background: '#007BFF' }}
                >
                    ← Return to Premiso
                </button>
                <p className="text-xs mt-6" style={{ color: '#9ca3af' }}>Premiso BETA · SynergyFlow Group</p>
            </div>
        </div>
    )
}