export default function AlbumForm({
    titulo,
    tipoEnsaioId,
    descricao,
    capaUrl,
    tiposEnsaio,
    enviando,
    onSubmit,
    onTituloChange,
    onTipoChange,
    onDescricaoChange,
    onCapaChange,
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-5 border border-white/10 bg-white/[0.03] p-6">
            <div>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#c89662]">Novo álbum</p>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="tituloAlbum">Título</label>
                <input
                    id="tituloAlbum"
                    type="text"
                    value={titulo}
                    onChange={onTituloChange}
                    className="w-full border-b border-white/20 bg-transparent px-0 py-3 text-base text-[#f2ede4] outline-none placeholder:text-[#77786f] focus:border-[#c89662]"
                    placeholder="Ex: Casamento Clara e Gabriel"
                />
            </div>
            <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="tipoAlbum">Tipo de ensaio</label>
                <select
                    id="tipoAlbum"
                    value={tipoEnsaioId}
                    onChange={onTipoChange}
                    className="w-full border-b border-white/20 bg-transparent px-0 py-3 text-base text-[#f2ede4] outline-none focus:border-[#c89662]"
                    style={{ colorScheme: 'dark' }}
                >
                    <option value="" style={{ color: '#111311', backgroundColor: '#111311' }}>Selecione</option>
                    {tiposEnsaio.map((tipo) => (
                        <option key={tipo.id} value={tipo.id} style={{ color: '#111311', backgroundColor: '#111311' }}>{tipo.nome}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="descricaoAlbum">Descrição</label>
                <textarea
                    id="descricaoAlbum"
                    rows={4}
                    value={descricao}
                    onChange={onDescricaoChange}
                    className="w-full border border-white/10 bg-transparent px-4 py-3 text-base text-[#f2ede4] outline-none placeholder:text-[#77786f] focus:border-[#c89662]"
                    placeholder="Conte um pouco sobre esse álbum..."
                />
            </div>
            <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="capaAlbum">URL da capa</label>
                <input
                    id="capaAlbum"
                    type="url"
                    value={capaUrl}
                    onChange={onCapaChange}
                    className="w-full border-b border-white/20 bg-transparent px-0 py-3 text-base text-[#f2ede4] outline-none placeholder:text-[#77786f] focus:border-[#c89662]"
                    placeholder="https://.../capa.jpg"
                />
            </div>
            <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#eee9df] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-wait disabled:opacity-60"
            >
                {enviando ? 'Criando álbum...' : 'Criar álbum'}
            </button>
        </form>
    );
}
