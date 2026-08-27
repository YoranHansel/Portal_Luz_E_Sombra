import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../supabase';

export default function Sair() {
    const navigate = useNavigate();
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function encerrarSessao() {
            if (!isSupabaseConfigured) {
                setErro('Não foi possível conectar ao Supabase para sair da conta.');
                setCarregando(false);
                return;
            }

            const { error } = await supabase.auth.signOut();
            if (error) {
                setErro(`Não foi possível sair da conta: ${error.message}`);
                setCarregando(false);
                return;
            }

            navigate('/login', { replace: true });
        }

        encerrarSessao();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#111311] text-[#eee9df]">
            <header className="border-b border-white/10 bg-[#111311]/95 px-5 py-4 sm:px-10">
                <div className="mx-auto max-w-6xl">
                    <Link className="font-serif text-xl tracking-tight text-[#f2ede4]" to="/home">
                        Luz <span className="italic text-[#c89662]">&amp;</span> Sombra
                    </Link>
                </div>
            </header>
            <main className="mx-auto flex min-h-[calc(100svh-73px)] max-w-6xl items-center px-5 py-16 sm:px-10">
                <section className="max-w-xl">
                    <p className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-[#c89662]">Até breve</p>
                    <h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-[#f2ede4] sm:text-7xl">Encerrando sua <span className="italic text-[#c89662]">sessão.</span></h1>
                    {carregando && <p className="mt-8 text-base text-[#aaa99f]">Saindo da sua conta com segurança...</p>}
                    {erro && (
                        <div className="mt-8">
                            <p className="mb-5 text-sm text-[#d9a07e]" role="alert">{erro}</p>
                            <Link className="inline-block bg-[#eee9df] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662]" to="/login">
                                Voltar ao login
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
