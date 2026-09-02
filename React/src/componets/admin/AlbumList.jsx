const FALLBACK_COVER = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80';

export default function AlbumList({ albuns }) {
    return (
        <div className="border border-white/10 bg-white/[0.03] p-6">
            <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#c89662]">Álbuns cadastrados</p>
            {albuns.length === 0 ? (
                <p className="text-[#77786f]">Nenhum álbum criado ainda.</p>
            ) : (
                <div className="space-y-5">
                    {albuns.map((album) => (
                        <article key={album.id} className="border border-white/10 p-3">
                            <div className="flex gap-4">
                                <img
                                    src={album.capa_url || FALLBACK_COVER}
                                    alt={album.titulo}
                                    className="h-24 w-24 object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c89662]">{album.tipos_ensaio?.nome || 'Ensaio'}</p>
                                    <h4 className="mt-2 font-serif text-2xl text-[#f2ede4]">{album.titulo}</h4>
                                    {album.descricao && <p className="mt-2 text-sm text-[#aaa99f]">{album.descricao}</p>}
                                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#77786f]">{(album.fotos || []).length} fotos</p>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {(album.fotos || []).slice(0, 6).map((foto, index) => (
                                    <img
                                        key={`${album.id}-${index}`}
                                        src={foto.url_imagem}
                                        alt={`${album.titulo} ${index + 1}`}
                                        className="h-20 w-full object-cover"
                                    />
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
