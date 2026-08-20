import NavLogin from '../componets/navigation/NavLogin';

export default function Cadastrar() {
    return (
        <div>
            <NavLogin />
            <h1>Cadastro</h1>
            <input type="text" placeholder="Email" />
            <input type="text" placeholder="Usuário" />
            <input type="text" placeholder="Senha" />
        </div>
    )
};