import { useState } from 'react';
import Navbar from '../componets/navigation/Navbar';
import { isSupabaseConfigured, supabase } from '../supabase';

export default function Agendamento() {
    const [tipoEnsaio, setTipoEnsaio] = useState('');
    const [dataPretendida, setDataPretendida] = useState('');
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErro('');
        setMensagem('');

        if (!tipoEnsaio) {
            setErro('Selecione o tipo de ensaio.');
            return;
        }

        if (!dataPretendida) {
            setErro('Informe a data pretendida.');
            return;
        }

        const hoje = new Date().toISOString().split('T')[0];
        if (dataPretendida < hoje) {
            setErro('A data pretendida deve ser hoje ou uma data futura.');
            return;
        }

        if (!isSupabaseConfigured) {
            setErro('Configure o Supabase no arquivo React/.env antes de agendar.');
            return;
        }

        setCarregando(true);
        const { error } = await supabase.from('agendamentos').insert({
            tipo_ensaio: tipoEnsaio,
            data_pretendida: dataPretendida,
        });

        if (error) {
            setErro('Não foi possível solicitar o agendamento.');
            setCarregando(false);
            return;
        }

        setMensagem('Solicitação enviada. Aguarde a confirmação da fotógrafa.');
        setTipoEnsaio('');
        setDataPretendida('');
        setCarregando(false);
    }

    const dataMinima = new Date().toISOString().split('T')[0];

    return (
        <div>
            <Navbar />
            <main>
                <h1>Agendamento</h1>
                <p>Solicite uma data para o seu ensaio.</p>
                <form onSubmit={handleSubmit} noValidate>
                    <label htmlFor="tipoEnsaio">Tipo de ensaio</label>
                    <select
                        id="tipoEnsaio"
                        value={tipoEnsaio}
                        onChange={(event) => setTipoEnsaio(event.target.value)}
                        required
                    >
                        <option value="">Selecione uma opção</option>
                        <option value="casamento">Casamento</option>
                        <option value="gestante">Gestante</option>
                    </select>
                    <label htmlFor="dataPretendida">Data pretendida</label>
                    <input
                        id="dataPretendida"
                        type="date"
                        min={dataMinima}
                        value={dataPretendida}
                        onChange={(event) => setDataPretendida(event.target.value)}
                        required
                    />
                    {erro && <p role="alert">{erro}</p>}
                    {mensagem && <p role="status">{mensagem}</p>}
                    <button type="submit" disabled={carregando}>
                        {carregando ? 'Enviando...' : 'Solicitar agendamento'}
                    </button>
                </form>
            </main>
        </div>
    );
}