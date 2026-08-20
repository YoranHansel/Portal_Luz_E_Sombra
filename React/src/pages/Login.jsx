import NavCadastro from './NavCadastro';

export default function Login(){
    return (
        <div>
            <NavCadastro />
            <h1>Login</h1>
            <input type="text" placeholder="Usuário" />
            <input type="text" placeholder="Senha" />
        </div>
    )
}