import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../componets/navigation/Navbar';
import { isSupabaseConfigured, supabase } from '../supabase';

const TEMPO_ESCONDIDO_APOS_CONCLUSAO = 2 * 60 * 1000;

function agendamentoAindaVisivel(agendamento) {
    if (!agendamento || agendamento.status !== 'concluido' || !agendamento.concluido_em) {
        return true;
    }

    return Date.now() - new Date(agendamento.concluido_em).getTime() < TEMPO_ESCONDIDO_APOS_CONCLUSAO;
}

export default function Agendamento() {
    const navigate = useNavigate();
    const [tipoEnsaio, setTipoEnsaio] = useState('');
    const [tiposEnsaio, setTiposEnsaio] = useState([]);
    const [dataPretendida, setDataPretendida] = useState('');
    const [fotografaSelecionada, setFotografaSelecionada] = useState('');
    const [fotografasDisponiveis, setFotografasDisponiveis] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [clienteAtual, setClienteAtual] = useState(null);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [carregandoAgendamentos, setCarregandoAgendamentos] = useState(true);

    useEffect(() => {
        async function carregarAgendamentos() {
            if (!isSupabaseConfigured) {
                setErro('Configure o Supabase no arquivo React/.env antes de agendar.');
                setCarregandoAgendamentos(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const { data: clientes, error: erroCliente } = await supabase
                .from('clientes')
                .select('id, nome, email')
                .eq('email', user.email)
                .order('created_at', { ascending: true })
                .limit(1);

            if (erroCliente) {
                setErro(`Não foi possível carregar seus dados: ${erroCliente.message}`);
                setCarregandoAgendamentos(false);
                return;
            }

            let clienteEncontrado = clientes?.[0];
            if (!clienteEncontrado) {
                const { data: novoCliente, error: erroNovoCliente } = await supabase
                    .from('clientes')
                    .insert({
                        nome: user.user_metadata?.usuario || user.email,
                        email: user.email,
                        telefone: user.user_metadata?.telefone || null,
                    })
                    .select('id, nome, email')
                    .single();

                if (erroNovoCliente) {
                    if (erroNovoCliente.code === '42501') {
                        setErro('O Supabase bloqueou a criação do cliente. Execute a policy de INSERT da tabela clientes no README.');
                    } else {
                        setErro(`Não foi possível criar o cadastro do cliente: ${erroNovoCliente.message}`);
                    }
                    setCarregandoAgendamentos(false);
                    return;
                }
                clienteEncontrado = novoCliente;
            }

            setClienteAtual(clienteEncontrado);

            const { data: tipos, error: erroTipos } = await supabase
                .from('tipos_ensaio')
                .select('id, nome, descricao')
                .order('nome');

            if (erroTipos) {
                setErro(`Não foi possível carregar os tipos de ensaio: ${erroTipos.message}`);
                setCarregandoAgendamentos(false);
                return;
            }

            setTiposEnsaio(tipos || []);
            if (!tipos?.length) {
                setErro('Nenhum tipo de ensaio está cadastrado. Insira os tipos no Supabase antes de agendar.');
            }
            const { data, error } = await supabase
                .from('agendamentos')
                .select('id, tipo_ensaio_id, data_pretendida, horario, status, observacoes, created_at, concluido_em, tipos_ensaio(nome)')
                .eq('cliente_id', clienteEncontrado.id)
                .order('data_pretendida', { ascending: true });

            if (error) {
                setErro(`Não foi possível carregar seus agendamentos: ${error.message}`);
            } else {
                setAgendamentos((data || []).filter(agendamentoAindaVisivel));
            }
            setCarregandoAgendamentos(false);
        }

        carregarAgendamentos();
    }, [navigate]);

    useEffect(() => {
        async function carregarFotografasDisponiveis() {
            if (!dataPretendida || !isSupabaseConfigured) {
                setFotografasDisponiveis([]);
                setFotografaSelecionada('');
                return;
            }

            const { data: disponibilidadeData, error: erroDisponibilidade } = await supabase
                .from('disponibilidade')
                .select('data, disponivel')
                .eq('data', dataPretendida)
                .maybeSingle();

            if (erroDisponibilidade) {
                setErro(`Não foi possível verificar a disponibilidade: ${erroDisponibilidade.message}`);
                setFotografasDisponiveis([]);
                return;
            }

            if (!disponibilidadeData) {
                const { error: erroCriar } = await supabase.from('disponibilidade').upsert({
                    data: dataPretendida,
                    disponivel: true,
                    motivo: null,
                }, { onConflict: 'data' });

                if (erroCriar) {
                    setErro(`Não foi possível registrar a disponibilidade da data: ${erroCriar.message}`);
                    setFotografasDisponiveis([]);
                    return;
                }
            }

            const { data: fotografas, error: erroFotografas } = await supabase
                .from('perfis')
                .select('id, nome, papel')
                .eq('papel', 'fotografa')
                .order('nome');

            if (erroFotografas) {
                setErro(`Não foi possível carregar as fotógrafas: ${erroFotografas.message}`);
                setFotografasDisponiveis([]);
                return;
            }

            const dataDisponivel = disponibilidadeData ? disponibilidadeData.disponivel !== false : true;
            setFotografasDisponiveis(dataDisponivel ? fotografas || [] : []);

            if (!dataDisponivel) {
                setFotografaSelecionada('');
                return;
            }

            if (fotografas?.length && !fotografas.some((fotografa) => fotografa.id === fotografaSelecionada)) {
                setFotografaSelecionada(fotografas[0].id);
            }
        }

        carregarFotografasDisponiveis();
    }, [dataPretendida]);

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

        if (!fotografaSelecionada) {
            setErro('Selecione uma fotógrafa disponível para esta data.');
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
        const tipoSelecionado = tiposEnsaio.find((tipo) => tipo.id === tipoEnsaio);
        if (!tipoSelecionado) {
            setErro('Selecione um tipo de ensaio válido.');
            setCarregando(false);
            return;
        }

        const payload = {
            cliente_id: clienteAtual.id,
            tipo_ensaio_id: tipoSelecionado.id,
            data_pretendida: dataPretendida,
            fotografa_id: fotografaSelecionada,
        };

        let { error } = await supabase.from('agendamentos').insert(payload);

        if (error && error.message && error.message.toLowerCase().includes('fotografa_id')) {
            const { error: erroSemFotografa } = await supabase.from('agendamentos').insert({
                cliente_id: clienteAtual.id,
                tipo_ensaio_id: tipoSelecionado.id,
                data_pretendida: dataPretendida,
            });
            error = erroSemFotografa;
        }

        if (error) {
            if (error.code === '42501') {
                setErro('O Supabase bloqueou este agendamento. Execute novamente as policies de agendamentos do README.');
            } else {
                setErro(`Não foi possível solicitar o agendamento: ${error.message}`);
            }
            setCarregando(false);
            return;
        }

        setMensagem('Solicitação enviada. Aguarde a confirmação da fotógrafa.');
        setTipoEnsaio('');
        setDataPretendida('');
        setFotografaSelecionada('');
        setFotografasDisponiveis([]);
        setCarregando(false);

        const { data } = await supabase
            .from('agendamentos')
            .select('id, tipo_ensaio_id, data_pretendida, horario, status, observacoes, created_at, concluido_em, tipos_ensaio(nome)')
            .eq('cliente_id', clienteAtual.id)
            .order('data_pretendida', { ascending: true });
        setAgendamentos((data || []).filter(agendamentoAindaVisivel));
    }

    const dataMinima = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-[#111311] text-[#eee9df]">
            <Navbar />
            <main className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-10 md:grid-cols-[0.8fr_1.2fr] md:py-24">
                <div className="max-w-md">
                    <p className="mb-6 font-mono text-xs uppercase tracking-[0.28em] text-[#c89662]">Vamos criar juntos</p>
                    <h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-[#f2ede4] sm:text-7xl">Reserve seu <span className="italic text-[#c89662]">momento.</span></h1>
                    <p className="mt-8 max-w-sm text-base leading-relaxed text-[#aaa99f]">Conte um pouco sobre o ensaio que você imagina. Retornaremos com os próximos passos e a melhor data para você.</p>
                    <p className="mt-16 border-l border-[#c89662] pl-4 text-sm leading-relaxed text-[#77786f]">Atendemos com hora marcada, em nosso estúdio ou no local escolhido por você.</p>
                </div>
                <form onSubmit={handleSubmit} noValidate className="border-t border-white/10 pt-8 md:mt-12 md:border-t-0 md:border-l md:pl-12">
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="tipoEnsaio">Tipo de ensaio</label>
                    <select
                        className="mb-8 w-full border-b border-white/20 bg-transparent px-0 py-4 text-lg text-[#f2ede4] outline-none transition focus:border-[#c89662]"
                        id="tipoEnsaio"
                        value={tipoEnsaio}
                        onChange={(event) => setTipoEnsaio(event.target.value)}
                        required
                    >
                        <option value="">Selecione uma opção</option>
                        {tiposEnsaio.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}
                    </select>
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="dataPretendida">Data pretendida</label>
                    <input
                        className="mb-8 w-full border-b border-white/20 bg-transparent px-0 py-4 text-lg text-[#f2ede4] outline-none transition focus:border-[#c89662] [color-scheme:dark]"
                        id="dataPretendida"
                        type="date"
                        min={dataMinima}
                        value={dataPretendida}
                        onChange={(event) => setDataPretendida(event.target.value)}
                        required
                    />
                    <label className="mb-3 block font-mono text-xs uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="fotografaSelecionada">Fotógrafa disponível</label>
                    <select
                        className="mb-8 w-full border-b border-white/20 bg-transparent px-0 py-4 text-lg text-[#f2ede4] outline-none transition focus:border-[#c89662]"
                        id="fotografaSelecionada"
                        value={fotografaSelecionada}
                        onChange={(event) => setFotografaSelecionada(event.target.value)}
                        disabled={!fotografasDisponiveis.length}
                    >
                        <option value="">{dataPretendida ? 'Selecione uma fotógrafa disponível' : 'Escolha a data primeiro'}</option>
                        {fotografasDisponiveis.map((fotografa) => (
                            <option key={fotografa.id} value={fotografa.id}>{fotografa.nome}</option>
                        ))}
                    </select>
                    {erro && <p className="mb-5 text-sm text-[#d9a07e]" role="alert">{erro}</p>}
                    {mensagem && <p className="mb-5 text-sm text-[#b5c8a2]" role="status">{mensagem}</p>}
                    <button className="mt-2 w-full bg-[#eee9df] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={carregando || !clienteAtual || !tipoEnsaio || !fotografaSelecionada}>
                        {carregando ? 'Enviando...' : 'Solicitar agendamento'}
                    </button>
                </form>
                <section className="md:col-span-2" aria-labelledby="meus-agendamentos-titulo">
                    <div className="mb-7 border-t border-white/10 pt-8">
                        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-[#c89662]">Sua agenda</p>
                        <h2 id="meus-agendamentos-titulo" className="font-serif text-4xl text-[#f2ede4]">Meus agendamentos</h2>
                    </div>
                    {carregandoAgendamentos && <p className="text-sm text-[#aaa99f]">Carregando seus agendamentos...</p>}
                    {!carregandoAgendamentos && agendamentos.length === 0 && <p className="text-sm text-[#77786f]">Você ainda não possui agendamentos.</p>}
                    {!carregandoAgendamentos && agendamentos.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {agendamentos.map((agendamento) => (
                                <article key={agendamento.id} className="border border-white/10 bg-white/[0.03] p-5">
                                    <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#c89662]">{agendamento.tipos_ensaio?.nome || 'Ensaio'}</p>
                                    <p className="mt-3 font-serif text-2xl capitalize text-[#f2ede4]">{new Date(`${agendamento.data_pretendida}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[#77786f]">Status: {agendamento.status}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}