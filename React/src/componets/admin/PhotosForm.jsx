export default function PhotosForm({
    albumSelecionadoId,
    albuns,
    fotosUrls,
    enviando,
    onSubmit,
    onAlbumChange,
    onFotosChange,
}) {
    return (
        <form onSubmit={onSubmit} className="border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c89662]">Adicionar fotos</p>
                    <h3 className="mt-2 font-serif text-3xl text-[#f2ede4]">Album selecionado</h3>
                </div>
                <select
                    value={albumSelecionadoId}
                    onChange={onAlbumChange}
                    className="border-b border-white/20 bg-transparent px-0 py-3 text-sm text-[#f2ede4] outline-none focus:border-[#c89662]"
                    style={{ colorScheme: 'dark' }}
                >
                    <option value="" style={{ color: '#111311', backgroundColor: '#111311' }}>Selecione um álbum</option>
                    {albuns.map((album) => (
                        <option key={album.id} value={album.id} style={{ color: '#111311', backgroundColor: '#111311' }}>{album.titulo}</option>
                    ))}
                </select>
            </div>
            <textarea
                rows={5}
                value={fotosUrls}
                onChange={onFotosChange}
                className="w-full border border-white/10 bg-transparent px-4 py-3 text-base text-[#f2ede4] outline-none placeholder:text-[#77786f] focus:border-[#c89662]"
                placeholder="Cole uma URL por linha:&#10;https://.../foto1.jpg&#10;https://.../foto2.jpg"
            />
            {fotosUrls.trim() && (
                <p className="mt-3 text-xs text-[#aaa99f]">{fotosUrls.split(/\n/).map((url) => url.trim()).filter(Boolean).length} URL(s) pronta(s) para cadastro</p>
            )}
            <button
                type="submit"
                disabled={enviando || !albumSelecionadoId}
                className="mt-6 w-full bg-[#eee9df] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-wait disabled:opacity-60"
            >
                {enviando ? 'Enviando fotos...' : 'Adicionar fotos'}
            </button>
        </form>
    );
}
