import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavCadastro from '../componets/navigation/NavCadastro';
import { isSupabaseConfigured, supabase } from '../supabase';

const ADMIN_SESSION_KEY = 'luz_sombra_admin_session';

export default function Login() {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [codigoAcesso, setCodigoAcesso] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErro('');

        const nomeValido = nome.trim().length >= 2;
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const codigoValido = codigoAcesso.trim().length >= 6;

        if (!isSupabaseConfigured) {
            setErro('Configure o Supabase no arquivo React/.env antes de entrar.');
            return;
        }

        const temLoginAdmin = !senha.trim() && nomeValido && emailValido && codigoValido;
        const temLoginPadrao = senha.trim() && emailValido;

        if (!temLoginAdmin && !temLoginPadrao) {
            if (!nomeValido) {
                setErro('Informe seu nome completo para acessar como administrador.');
                return;
            }

            if (!emailValido) {
                setErro('Informe um email válido.');
                return;
            }

            if (!codigoValido && !senha.trim()) {
                setErro('Para acesso administrativo, informe o código de acesso. Para cliente, informe a senha.');
                return;
            }

            if (senha.trim() && senha.length < 6) {
                setErro('A senha deve ter pelo menos 6 caracteres.');
                return;
            }
        }

        if (temLoginAdmin) {
            setCarregando(true);

            const { data, error } = await supabase
                .from('admins')
                .select('id, nome, email, codigo_acesso')
                .eq('email', email.trim().toLowerCase())
                .eq('codigo_acesso', codigoAcesso.trim().toUpperCase())
                .maybeSingle();

            if (error) {
                setErro('Não foi possível validar o acesso do administrador.');
                setCarregando(false);
                return;
            }

            if (!data || data.nome.trim().toLowerCase() !== nome.trim().toLowerCase()) {
                setErro('Nome, email ou código de acesso inválidos para o perfil de administrador.');
                setCarregando(false);
                return;
            }

            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
                id: data.id,
                nome: data.nome,
                email: data.email,
                codigoAcesso: data.codigo_acesso,
            }));

            setCarregando(false);
            navigate('/admin/home');
            return;
        }

        setCarregando(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: senha,
        });

        if (error) {
            setErro('Email ou senha incorretos.');
            setCarregando(false);
            return;
        }

        setCarregando(false);
        navigate('/home');
    }

    return (
        <div className="min-h-screen bg-[#111311] text-[#eee9df]">
            <NavCadastro />
            <main className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-10 md:grid-cols-[0.8fr_1.2fr] md:py-24">
                <div className="max-w-md">
                    <p className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-[#c89662]">Bem-vindo de volta</p>
                    <h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-[#f2ede4] sm:text-7xl">Entre para continuar sua <span className="italic text-[#c89662]">história.</span></h1>
                    <p className="mt-8 max-w-sm text-base leading-relaxed text-[#aaa99f]">Acesse sua conta para acompanhar seus momentos. Administradores também podem entrar com nome, email e código de acesso especial.</p>
                </div>
                <form onSubmit={handleSubmit} noValidate className="border-t border-white/10 pt-8 md:mt-12 md:border-t-0 md:border-l md:pl-12">
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="nome">Nome</label>
                    <input
                        className="mb-8 w-full border-b border-white/20 bg-transparent px-0 py-4 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662]"
                        id="nome"
                        type="text"
                        placeholder="Seu nome"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                    />
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="email">Email</label>
                    <input
                        className="mb-8 w-full border-b border-white/20 bg-transparent px-0 py-4 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662]"
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#77786f]">Exclusivo para administradores</p>
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="codigoAcesso">Código de acesso</label>
                    <input
                        className="mb-8 w-full border-b border-white/20 bg-transparent px-0 py-4 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662] uppercase"
                        id="codigoAcesso"
                        type="text"
                        placeholder="Ex: A7K9Q2F4"
                        value={codigoAcesso}
                        onChange={(event) => setCodigoAcesso(event.target.value)}
                    />
                    <div className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[#77786f]">
                        <span className="h-px flex-1 bg-white/10" />
                        ou use senha
                        <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="senha">Senha</label>
                    <input
                        className="mb-8 w-full border-b border-white/20 bg-transparent px-0 py-4 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662] [color-scheme:dark]"
                        id="senha"
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
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