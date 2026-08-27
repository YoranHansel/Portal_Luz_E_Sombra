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
        <div>
            <NavCadastro />
            <h1>Login</h1>
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
                {erro && <p role="alert">{erro}</p>}
                <button type="submit" disabled={carregando}>
                    {carregando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}