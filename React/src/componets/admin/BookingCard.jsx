export default function BookingCard({ agendamento, concluindoId, onConclude }) {
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
            className="border border-white/10 bg-[#171a17] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c89662]">{tipo.nome || 'Ensaio'}</p>
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
                onClick={() => onConclude(agendamento.id)}
                disabled={concluido || concluindoId === agendamento.id}
                className="mt-6 w-full bg-[#eee9df] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-not-allowed disabled:bg-[#4d514d] disabled:text-[#d6d2cb]"
            >
                {concluindoId === agendamento.id ? 'Concluindo...' : concluido ? 'Concluído' : 'Concluir'}
            </button>
        </article>
    );
}
