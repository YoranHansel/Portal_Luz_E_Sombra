import { useEffect, useState } from 'react';
import Navbar from '../componets/navigation/Navbar';
import { isSupabaseConfigured, supabase } from '../supabase';

export default function Home() {
    const [albuns, setAlbuns] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [albumSelecionadoId, setAlbumSelecionadoId] = useState(null);

    useEffect(() => {
        async function carregarAlbuns() {
            try {
                if (!isSupabaseConfigured) {
                    setErro('Configure o Supabase no arquivo React/.env antes de carregar os álbuns.');
                    setCarregando(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('albuns')
                    .select(
                        `id, titulo, descricao, capa_url, created_at,
                        tipos_ensaio(nome),
                        fotos(url_imagem, ordem)`
                    )
                    .order('created_at', { ascending: false });

                if (error) {
                    throw new Error(error.message);
                }

                setAlbuns(data || []);
            } catch {
                setErro('Não foi possível carregar os álbuns no momento.');
            } finally {
                setCarregando(false);
            }
        }

        carregarAlbuns();
    }, []);

    return (
        <div className="min-h-screen bg-[#111311] text-[#eee9df]">
            <Navbar />
            <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-10">
                <section className="grid min-h-[520px] items-end gap-10 border-b border-white/10 py-16 md:grid-cols-[1fr_0.75fr] md:py-24">
                    <div>
                        <p className="mb-7 font-mono text-xs uppercase tracking-[0.28em] text-[#c89662]">Estúdio autoral · desde 2018</p>
                        <h1 className="max-w-3xl font-serif text-5xl leading-[0.96] tracking-[-0.04em] text-[#f2ede4] sm:text-7xl md:text-8xl">A luz certa <span className="italic text-[#c89662]">conta</span> tudo.</h1>
                    </div>
                    <div className="max-w-sm pb-1 md:justify-self-end">
                        <p className="text-lg leading-relaxed text-[#aaa99f]">Fotografia com presença, delicadeza e intenção. Criamos imagens que continuam vivas muito depois do clique.</p>
                        <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#eee9df]"><span className="h-px w-10 bg-[#c89662]" /> Explore nosso trabalho</div>
                    </div>
                </section>
                <section aria-labelledby="albuns-titulo" className="pt-16">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div><p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-[#c89662]">Seleção 01</p><h2 id="albuns-titulo" className="font-serif text-4xl text-[#f2ede4]">Histórias em foco</h2></div>
                        <p className="hidden text-sm text-[#77786f] sm:block">Casamentos · Retratos · Afeto</p>
                    </div>
                    {carregando && <p className="py-12 text-[#aaa99f]">Revelando histórias...</p>}
                    {erro && <p className="py-12 text-[#d9a07e]" role="alert">{erro}</p>}
                    {!carregando && !erro && albumSelecionadoId && (
                        <div>
                            {albuns.map((album) => {
                                if (album.id !== albumSelecionadoId) return null;
                                return (
                                    <div key={album.id}>
                                        <button
                                            onClick={() => setAlbumSelecionadoId(null)}
                                            className="mb-8 flex items-center gap-2 text-sm text-[#c89662] transition hover:text-[#eee9df]"
                                        >
                                            <span>←</span> Voltar
                                        </button>
                                        <div className="mb-8 border-b border-white/10 pb-8">
                                            <h3 className="font-serif text-4xl text-[#f2ede4]">{album.titulo}</h3>
                                            {album.descricao && <p className="mt-4 text-[#aaa99f]">{album.descricao}</p>}
                                        </div>
                                        {album.fotos && album.fotos.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                                {album.fotos
                                                    .sort((a, b) => a.ordem - b.ordem)
                                                    .map((foto, index) => (
                                                        <div key={index} className="aspect-[4/5] overflow-hidden bg-[#252823]">
                                                            <img
                                                                src={foto.url_imagem}
                                                                alt={`Foto ${index + 1} de ${album.titulo}`}
                                                                onError={(event) => {
                                                                    event.currentTarget.onerror = null;
                                                                    event.currentTarget.src = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80';
                                                                }}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-[#aaa99f]">Este álbum ainda não tem fotos.</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {!carregando && !erro && !albumSelecionadoId && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
                            {albuns.map((album, index) => {
                                const capa = album.capa_url || album.fotos?.[0]?.url_imagem || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80';
                                return (
                                    <article key={album.id} className={`group cursor-pointer ${index % 3 === 0 ? 'sm:col-span-2' : ''}`}>
                                        <button
                                            onClick={() => setAlbumSelecionadoId(album.id)}
                                            className="w-full text-left"
                                            aria-label={`Ver fotos de ${album.titulo}`}
                                        >
                                            <div className="aspect-[4/5] overflow-hidden bg-[#252823]">
                                                <img
                                                    src={capa}
                                                    alt={album.titulo}
                                                    onError={(event) => {
                                                        event.currentTarget.onerror = null;
                                                        event.currentTarget.src = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80';
                                                    }}
                                                    className="h-full w-full object-cover grayscale-[20%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                                />
                                            </div>
                                            <h3 className="mt-3 line-clamp-1 text-xs uppercase tracking-[0.14em] text-[#aaa99f]">{album.titulo}</h3>
                                            {album.tipos_ensaio?.nome && (
                                                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#77786f]">{album.tipos_ensaio.nome}</p>
                                            )}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}