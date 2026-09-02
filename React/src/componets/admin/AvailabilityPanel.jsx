export default function AvailabilityPanel({
    data,
    disponivel,
    motivo,
    salvando,
    onDataChange,
    onToggle,
    onMotivoChange,
    onSave,
}) {
    return (
        <div className="flex flex-col gap-3 rounded border border-white/10 bg-white/[0.02] p-4 sm:min-w-[340px]">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="dataDisponibilidade">Data</label>
            <input
                id="dataDisponibilidade"
                type="date"
                value={data}
                onChange={onDataChange}
                className="border-b border-white/20 bg-transparent px-0 py-2 text-base text-[#f2ede4] outline-none focus:border-[#c89662]"
            />
            <button
                type="button"
                onClick={onToggle}
                className="border border-white/15 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#eee9df] transition hover:border-[#c89662] hover:text-[#c89662]"
            >
                {disponivel ? 'Marcar como indisponível' : 'Marcar como disponível'}
            </button>
            {!disponivel && (
                <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="motivoIndisponibilidade">Motivo da indisponibilidade</label>
                    <textarea
                        id="motivoIndisponibilidade"
                        rows={3}
                        value={motivo}
                        onChange={onMotivoChange}
                        className="border border-white/10 bg-transparent px-3 py-2 text-sm text-[#f2ede4] outline-none placeholder:text-[#77786f] focus:border-[#c89662]"
                        placeholder="Ex: viagem, bloqueio de agenda, manutenção etc."
                    />
                </div>
            )}
            <button
                type="button"
                onClick={onSave}
                disabled={salvando}
                className="bg-[#eee9df] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-wait disabled:opacity-60"
            >
                {salvando ? 'Salvando...' : 'Salvar disponibilidade'}
            </button>
        </div>
    );
}
