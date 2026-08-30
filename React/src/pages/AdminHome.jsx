import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../supabase';

const ADMIN_SESSION_KEY = 'luz_sombra_admin_session';

export default function AdminHome() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [agendamentos, setAgendamentos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [concluindoId, setConcluindoId] = useState(null);
    const [dataDisponibilidade, setDataDisponibilidade] = useState(new Date().toISOString().split('T')[0]);
    const [disponivel, setDisponivel] = useState(true);
    const [salvandoDisponibilidade, setSalvandoDisponibilidade] = useState(false);

    useEffect(() => {
        const dadosSalvos = localStorage.getItem(ADMIN_SESSION_KEY);

        if (!dadosSalvos) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const dados = JSON.parse(dadosSalvos);
            setAdmin(dados);
        } catch {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        if (!admin) {
            return;
        }

        async function carregarAgendamentos() {
            if (!isSupabaseConfigured) {
                setErro('Configure o Supabase no arquivo React/.env antes de abrir a área administrativa.');
                setCarregando(false);
                return;
            }

            const { data, error } = await supabase
                .from('agendamentos')
                .select(
                    `id, data_pretendida, horario, status, observacoes, created_at,
                    clientes(nome, email, telefone),
                    tipos_ensaio(nome)`
                )
                .order('data_pretendida', { ascending: true });

            if (error) {
                setErro(`Não foi possível carregar os agendamentos: ${error.message}`);
                setCarregando(false);
                return;
            }

            setAgendamentos(data || []);
            setCarregando(false);
        }

        carregarAgendamentos();
    }, [admin]);

    useEffect(() => {
        if (!admin || !isSupabaseConfigured) {
            return;
        }

        async function carregarDisponibilidade() {
            const { data, error } = await supabase
                .from('disponibilidade')
                .select('id, data, disponivel, motivo')
                .eq('data', dataDisponibilidade)
                .maybeSingle();

            if (error) {
                setErro(`Não foi possível carregar a disponibilidade: ${error.message}`);
                return;
            }

            setDisponivel(data?.disponivel ?? true);
        }

        carregarDisponibilidade();
    }, [admin, dataDisponibilidade]);

    async function concluirAgendamento(agendamentoId) {
        setConcluindoId(agendamentoId);
        setErro('');

        if (!isSupabaseConfigured) {
            setErro('Configure o Supabase no arquivo React/.env antes de concluir agendamentos.');
            setConcluindoId(null);
            return;
        }

        const { error } = await supabase
            .from('agendamentos')
            .update({ status: 'concluido' })
            .eq('id', agendamentoId);

        if (error) {
            setErro(`Não foi possível concluir o agendamento: ${error.message}`);
            setConcluindoId(null);
            return;
        }

        setAgendamentos((itens) =>
            itens.map((item) =>
                item.id === agendamentoId
                    ? { ...item, status: 'concluido' }
                    : item
            )
        );
        setConcluindoId(null);
    }

    async function salvarDisponibilidade() {
        setSalvandoDisponibilidade(true);
        setErro('');
        setSucesso('');

        if (!isSupabaseConfigured) {
            setErro('Configure o Supabase no arquivo React/.env antes de alterar a disponibilidade.');
            setSalvandoDisponibilidade(false);
            return;
        }

        const { error } = await supabase.from('disponibilidade').upsert({
            data: dataDisponibilidade,
            disponivel: disponivel,
            motivo: disponivel ? null : 'Indisponível pela administração',
        }, { onConflict: 'data' });

        if (error) {
            setErro(`Não foi possível salvar a disponibilidade: ${error.message}`);
            setSalvandoDisponibilidade(false);
            return;
        }

        setSucesso(disponivel ? 'Data marcada como disponível.' : 'Data marcada como indisponível.');
        setSalvandoDisponibilidade(false);
    }

    function sair() {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        navigate('/login', { replace: true });
    }

    return (
        <div className="min-h-screen bg-[#111311] text-[#eee9df]">
            <header className="border-b border-white/10 bg-[#171a17]">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-10">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#c89662]">Área administrativa</p>
                        <h1 className="mt-2 font-serif text-3xl text-[#f2ede4]">Painel do estúdio</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/albuns')}
                            className="border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#eee9df] transition hover:border-[#c89662] hover:text-[#c89662]"
                        >
                            Álbum
                        </button>
                        <span className="text-sm text-[#aaa99f]">{admin?.nome || 'Admin'}</span>
                        <button
                            type="button"
                            onClick={sair}
                            className="border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#eee9df] transition hover:border-[#c89662] hover:text-[#c89662]"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-5 py-16 sm:px-10">
                <section className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-[#c89662]">Disponibilidade</p>
                        <h2 className="font-serif text-4xl text-[#f2ede4] sm:text-5xl">Agendamentos disponíveis</h2>
                    </div>
                    <div className="flex flex-col gap-3 rounded border border-white/10 bg-white/[0.02] p-4 sm:min-w-[340px]">
                        <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="dataDisponibilidade">Data</label>
                        <input
                            id="dataDisponibilidade"
                            type="date"
                            value={dataDisponibilidade}
                            onChange={(event) => setDataDisponibilidade(event.target.value)}
                            className="border-b border-white/20 bg-transparent px-0 py-2 text-base text-[#f2ede4] outline-none focus:border-[#c89662]"
                        />
                        <button
                            type="button"
                            onClick={() => setDisponivel((valor) => !valor)}
                            className="border border-white/15 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#eee9df] transition hover:border-[#c89662] hover:text-[#c89662]"
                        >
                            {disponivel ? 'Marcar como indisponível' : 'Marcar como disponível'}
                        </button>
                        <button
                            type="button"
                            onClick={salvarDisponibilidade}
                            disabled={salvandoDisponibilidade}
                            className="bg-[#eee9df] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-wait disabled:opacity-60"
                        >
                            {salvandoDisponibilidade ? 'Salvando...' : 'Salvar disponibilidade'}
                        </button>
                    </div>
                </section>

                {carregando && <p className="text-[#aaa99f]">Carregando agendamentos...</p>}
                {erro && <p className="mb-6 text-sm text-[#d9a07e]" role="alert">{erro}</p>}
                {sucesso && <p className="mb-6 text-sm text-[#b5c8a2]" role="status">{sucesso}</p>}

                {!carregando && !erro && agendamentos.length === 0 && (
                    <p className="text-[#77786f]">Nenhum agendamento cadastrado no momento.</p>
                )}

                {!carregando && !erro && agendamentos.length > 0 && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {agendamentos.map((agendamento) => {
                            const cliente = agendamento.clientes || {};
                            const tipo = agendamento.tipos_ensaio || {};
                            const dataFormatada = new Date(`${agendamento.data_pretendida}T12:00:00`).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            });

                            const concluido = agendamento.status === 'concluido';

                            return (
                                <article
                                    key={agendamento.id}
                                    className="border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c89662]">
                                                {tipo.nome || 'Ensaio'}
                                            </p>
                                            <h3 className="mt-3 font-serif text-3xl text-[#f2ede4]">{dataFormatada}</h3>
                                        </div>
                                        <span
                                            className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${concluido
                                                ? 'border-[#b5c8a2] text-[#b5c8a2]'
                                                : 'border-[#c89662] text-[#c89662]'
                                                }`}
                                        >
                                            {agendamento.status}
                                        </span>
                                    </div>

                                    <div className="mt-6 space-y-2 text-sm text-[#aaa99f]">
                                        <p><span className="font-semibold text-[#f2ede4]">Cliente:</span> {cliente.nome || 'Não informado'}</p>
                                        <p><span className="font-semibold text-[#f2ede4]">Email:</span> {cliente.email || 'Não informado'}</p>
                                        <p><span className="font-semibold text-[#f2ede4]">Telefone:</span> {cliente.telefone || 'Não informado'}</p>
                                        <p><span className="font-semibold text-[#f2ede4]">Horário:</span> {agendamento.horario || 'A combinar'}</p>
                                        {agendamento.observacoes && (
                                            <p><span className="font-semibold text-[#f2ede4]">Observações:</span> {agendamento.observacoes}</p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => concluirAgendamento(agendamento.id)}
                                        disabled={concluido || concluindoId === agendamento.id}
                                        className="mt-6 w-full bg-[#eee9df] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-not-allowed disabled:bg-[#4d514d] disabled:text-[#d6d2cb]"
                                    >
                                        {concluindoId === agendamento.id ? 'Concluindo...' : concluido ? 'Concluído' : 'Concluir'}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
