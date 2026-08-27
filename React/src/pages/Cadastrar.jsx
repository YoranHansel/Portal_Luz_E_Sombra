import { useState } from 'react';
import NavLogin from '../componets/navigation/NavLogin';
import { isSupabaseConfigured, supabase } from '../supabase';

export default function Cadastrar() {
    const [email, setEmail] = useState('');
    const [usuario, setUsuario] = useState('');
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
                data: { usuario: usuario.trim() },
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
        setSenha('');
        setConfirmacaoSenha('');
        setCarregando(false);
    }

    return (
        <div>
            <NavLogin />
            <h1>Cadastro</h1>
            <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <label htmlFor="usuario">Usuário</label>
                <input
                    id="usuario"
                    type="text"
                    placeholder="Usuário"
                    value={usuario}
                    onChange={(event) => setUsuario(event.target.value)}
                    required
                />
                <label htmlFor="senha">Senha</label>
                <input
                    id="senha"
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    minLength={6}
                    required
                />
                <label htmlFor="confirmacaoSenha">Confirmar senha</label>
                <input
                    id="confirmacaoSenha"
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmacaoSenha}
                    onChange={(event) => setConfirmacaoSenha(event.target.value)}
                    minLength={6}
                    required
                />
                {erro && <p role="alert">{erro}</p>}
                {mensagem && <p role="status">{mensagem}</p>}
                <button type="submit" disabled={carregando}>
                    {carregando ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </form>
        </div>
    );
}