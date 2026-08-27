import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavCadastro from '../componets/navigation/NavCadastro';
import { isSupabaseConfigured, supabase } from '../supabase';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErro('');

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValido) {
            setErro('Informe um email válido.');
            return;
        }

        if (senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (!isSupabaseConfigured) {
            setErro('Configure o Supabase no arquivo React/.env antes de entrar.');
            return;
        }

        setCarregando(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        });

        if (error) {
            setErro('Email ou senha incorretos.');
            setCarregando(false);
            return;
        }

        navigate('/home');
    }

    return (
        <div className="min-h-screen bg-[#111311] text-[#eee9df]">
            <NavCadastro />
            <main className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-10 md:grid-cols-[0.8fr_1.2fr] md:py-24">
                <div className="max-w-md">
                    <p className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-[#c89662]">Bem-vindo de volta</p>
                    <h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-[#f2ede4] sm:text-7xl">Entre para continuar sua <span className="italic text-[#c89662]">história.</span></h1>
                    <p className="mt-8 max-w-sm text-base leading-relaxed text-[#aaa99f]">Acesse sua conta para acompanhar seus momentos e conversar com o nosso estúdio.</p>
                </div>
                <form onSubmit={handleSubmit} noValidate className="border-t border-white/10 pt-8 md:mt-12 md:border-t-0 md:border-l md:pl-12">
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="email">Email</label>
                    <input
                        className="mb-8 w-full border-b border-white/20 bg-transparent px-0 py-4 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662]"
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="senha">Senha</label>
                    <input
                        className="mb-8 w-full border-b border-white/20 bg-transparent px-0 py-4 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662] [color-scheme:dark]"
                        id="senha"
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        minLength={6}
                        required
                    />
                    {erro && <p className="mb-5 text-sm text-[#d9a07e]" role="alert">{erro}</p>}
                    <button className="mt-2 w-full bg-[#eee9df] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={carregando}>
                        {carregando ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </main>
        </div>
    );
}