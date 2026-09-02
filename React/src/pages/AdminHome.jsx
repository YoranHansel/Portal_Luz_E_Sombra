import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../supabase';
import AdminHeader from '../componets/admin/AdminHeader';
import AvailabilityPanel from '../componets/admin/AvailabilityPanel';
import BookingCard from '../componets/admin/BookingCard';

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
    const [motivoIndisponibilidade, setMotivoIndisponibilidade] = useState('');
    const [salvandoDisponibilidade, setSalvandoDisponibilidade] = useState(false);

    useEffect(() => {
        async function validarAdmin() {
            if (!isSupabaseConfigured) {
                navigate('/login', { replace: true });
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login', { replace: true });
                return;
            }

            const { data, error } = await supabase
                .from('admins')
                .select('id, nome, email, user_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error || !data) {
                await supabase.auth.signOut();
                navigate('/login', { replace: true });
                return;
            }

            setAdmin(data);
        }

        validarAdmin();
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

            // 1. Busca os agendamentos e o tipo de ensaio
            const { data: rawAgendamentos, error } = await supabase
                .from('agendamentos')
                .select(`
                    id, cliente_id, data_pretendida, horario, status, observacoes, created_at,
                    tipos_ensaio ( nome )
                `)
                .order('data_pretendida', { ascending: true });

            if (error) {
                console.error('Erro ao buscar agendamentos:', error);
                setErro(`Não foi possível carregar os agendamentos: ${error.message}`);
                setCarregando(false);
                return;
            }

            const listaAgendamentos = rawAgendamentos || [];

            // 2. Coleta os IDs dos clientes para buscar os dados de perfil de forma segura
            const idsClientes = [...new Set(listaAgendamentos.map((item) => item.cliente_id).filter(Boolean))];

            let clientesMap = {};
            if (idsClientes.length > 0) {
                const { data: clientesData } = await supabase
                    .from('clientes')
                    .select('id, nome, email, telefone')
                    .in('id', idsClientes);

                if (clientesData) {
                    clientesMap = clientesData.reduce((acc, cliente) => {
                        acc[cliente.id] = cliente;
                        return acc;
                    }, {});
                }
            }

            // 3. Monta o objeto final associando os clientes aos agendamentos
            const agendamentosFormatados = listaAgendamentos.map((agendamento) => ({
                ...agendamento,
                clientes: clientesMap[agendamento.cliente_id] || { nome: 'Cliente não vinculado', email: '-', telefone: '-' },
            }));

            setAgendamentos(agendamentosFormatados);
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
            setMotivoIndisponibilidade(data?.motivo ?? '');
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

        // Atualiza o estado localmente sem ocultar da tela
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

        if (!disponivel && !motivoIndisponibilidade.trim()) {
            setErro('Informe o motivo da indisponibilidade antes de salvar.');
            setSalvandoDisponibilidade(false);
            return;
        }

        const { error } = await supabase.from('disponibilidade').upsert({
            data: dataDisponibilidade,
            disponivel: disponivel,
            motivo: disponivel ? null : motivoIndisponibilidade.trim(),
        }, { onConflict: 'data' });

        if (error) {
            setErro(`Não foi possível salvar a disponibilidade: ${error.message}`);
            setSalvandoDisponibilidade(false);
            return;
        }

        setSucesso(disponivel ? 'Data marcada como disponível. Motivo limpo automaticamente.' : 'Data marcada como indisponível.');
        setSalvandoDisponibilidade(false);
    }

    function sair() {
        supabase.auth.signOut().finally(() => navigate('/login', { replace: true }));
    }

    return (
        <div className="min-h-screen bg-[#111311] text-[#eee9df]">
            <AdminHeader admin={admin} onAlbums={() => navigate('/admin/albuns')} onLogout={sair} />

            <main className="mx-auto max-w-6xl px-5 py-16 sm:px-10">
                <section className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-[#c89662]">Disponibilidade</p>
                        <h2 className="font-serif text-4xl text-[#f2ede4] sm:text-5xl">Agendamentos disponíveis</h2>
                    </div>
                    <AvailabilityPanel
                        data={dataDisponibilidade}
                        disponivel={disponivel}
                        motivo={motivoIndisponibilidade}
                        salvando={salvandoDisponibilidade}
                        onDataChange={(event) => setDataDisponibilidade(event.target.value)}
                        onToggle={() => {
                            setDisponivel((valor) => {
                                const proximo = !valor;
                                if (proximo) {
                                    setMotivoIndisponibilidade('');
                                }
                                return proximo;
                            });
                        }}
                        onMotivoChange={(event) => setMotivoIndisponibilidade(event.target.value)}
                        onSave={salvarDisponibilidade}
                    />
                </section>

                {carregando && <p className="text-[#aaa99f]">Carregando agendamentos...</p>}
                {erro && <p className="mb-6 text-sm text-[#d9a07e]" role="alert">{erro}</p>}
                {sucesso && <p className="mb-6 text-sm text-[#b5c8a2]" role="status">{sucesso}</p>}

                {!carregando && !erro && agendamentos.length === 0 && (
                    <p className="text-[#77786f]">Nenhum agendamento cadastrado no momento.</p>
                )}

                {!carregando && !erro && agendamentos.length > 0 && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {agendamentos.map((agendamento) => (
                            <BookingCard
                                key={agendamento.id}
                                agendamento={agendamento}
                                concluindoId={concluindoId}
                                onConclude={concluirAgendamento}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}