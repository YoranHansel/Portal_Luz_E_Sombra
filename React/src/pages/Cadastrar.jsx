import { useState } from 'react';
import NavLogin from '../componets/navigation/NavLogin';
import { isSupabaseConfigured, supabase } from '../supabase';

export default function Cadastrar() {
    const [email, setEmail] = useState('');
    const [usuario, setUsuario] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErro('');
        setMensagem('');

        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!usuario.trim()) {
            setErro('Informe um nome de usuário.');
            return;
        }

        if (!emailValido) {
            setErro('Informe um email válido.');
            return;
        }

        if (senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (senha !== confirmacaoSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        if (!isSupabaseConfigured) {
            setErro('Configure o Supabase no arquivo React/.env antes de cadastrar.');
            return;
        }

        setCarregando(true);
        const { error } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
                data: { usuario: usuario.trim(), telefone: telefone.trim() },
            },
        });

        if (error) {
            setErro(error.message);
            setCarregando(false);
            return;
        }

        setMensagem('Cadastro realizado. Verifique seu email para confirmar a conta.');
        setEmail('');
        setUsuario('');
        setTelefone('');
        setSenha('');
        setConfirmacaoSenha('');
        setCarregando(false);
    }

    return (
        <div className="min-h-screen bg-[#111311] text-[#eee9df]">
            <NavLogin />
            <main className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-10 md:grid-cols-[0.8fr_1.2fr] md:py-20">
                <div className="max-w-md">
                    <p className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-[#c89662]">Seu próximo capítulo</p>
                    <h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-[#f2ede4] sm:text-7xl">Vamos dar forma ao seu <span className="italic text-[#c89662]">momento.</span></h1>
                    <p className="mt-8 max-w-sm text-base leading-relaxed text-[#aaa99f]">Crie sua conta para solicitar ensaios e acompanhar cada detalhe da sua experiência com Luz &amp; Sombra.</p>
                </div>
                <form onSubmit={handleSubmit} noValidate className="border-t border-white/10 pt-8 md:mt-4 md:border-t-0 md:border-l md:pl-12">
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="usuario">Nome</label>
                    <input
                        className="mb-7 w-full border-b border-white/20 bg-transparent px-0 py-3 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662]"
                        id="usuario"
                        type="text"
                        placeholder="Como podemos chamar você?"
                        value={usuario}
                        onChange={(event) => setUsuario(event.target.value)}
                        required
                    />
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="email">Email</label>
                    <input
                        className="mb-7 w-full border-b border-white/20 bg-transparent px-0 py-3 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662]"
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="telefone">Telefone</label>
                    <input
                        className="mb-7 w-full border-b border-white/20 bg-transparent px-0 py-3 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662]"
                        id="telefone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={telefone}
                        onChange={(event) => setTelefone(event.target.value)}
                    />
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="senha">Senha</label>
                    <input
                        className="mb-7 w-full border-b border-white/20 bg-transparent px-0 py-3 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662] [color-scheme:dark]"
                        id="senha"
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        minLength={6}
                        required
                    />
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="confirmacaoSenha">Confirmar senha</label>
                    <input
                        className="mb-7 w-full border-b border-white/20 bg-transparent px-0 py-3 text-lg text-[#f2ede4] outline-none transition placeholder:text-[#77786f] focus:border-[#c89662] [color-scheme:dark]"
                        id="confirmacaoSenha"
                        type="password"
                        placeholder="Confirmar senha"
                        value={confirmacaoSenha}
                        onChange={(event) => setConfirmacaoSenha(event.target.value)}
                        minLength={6}
                        required
                    />
                    {erro && <p className="mb-5 text-sm text-[#d9a07e]" role="alert">{erro}</p>}
                    {mensagem && <p className="mb-5 text-sm text-[#b5c8a2]" role="status">{mensagem}</p>}
                    <button className="mt-2 w-full bg-[#eee9df] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={carregando}>
                        {carregando ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
            </main>
        </div>
    );
}