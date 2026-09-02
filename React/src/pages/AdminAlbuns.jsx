import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../supabase';

export default function AdminAlbuns() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [tiposEnsaio, setTiposEnsaio] = useState([]);
    const [albuns, setAlbuns] = useState([]);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tipoEnsaioId, setTipoEnsaioId] = useState('');
    const [capaUrl, setCapaUrl] = useState('');
    const [albumSelecionadoId, setAlbumSelecionadoId] = useState('');
    const [fotosUrls, setFotosUrls] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [enviandoAlbum, setEnviandoAlbum] = useState(false);
    const [enviandoFotos, setEnviandoFotos] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

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

        async function carregarDados() {
            if (!isSupabaseConfigured) {
                setErro('Configure o Supabase no arquivo React/.env antes de gerenciar álbuns.');
                setCarregando(false);
                return;
            }

            const [{ data: tiposData, error: erroTipos }, { data: albunsData, error: erroAlbuns }] = await Promise.all([
                supabase.from('tipos_ensaio').select('id, nome').order('nome'),
                supabase.from('albuns').select('id, titulo, descricao, capa_url, tipo_ensaio_id, created_at, tipos_ensaio(nome), fotos(url_imagem, ordem)').order('created_at', { ascending: false })
            ]);

            if (erroTipos) {
                setErro(`Não foi possível carregar os tipos de ensaio: ${erroTipos.message}`);
                setCarregando(false);
                return;
            }

            if (erroAlbuns) {
                setErro(`Não foi possível carregar os álbuns: ${erroAlbuns.message}`);
                setCarregando(false);
                return;
            }

            setTiposEnsaio(tiposData || []);
            setAlbuns(albunsData || []);
            if ((albunsData || []).length && !albumSelecionadoId) {
                setAlbumSelecionadoId(albunsData[0].id);
            }
            setCarregando(false);
        }

        carregarDados();
    }, [admin, albumSelecionadoId]);

    function sair() {
        supabase.auth.signOut().finally(() => navigate('/login', { replace: true }));
    }

    function resetMensagens() {
        setErro('');
        setSucesso('');
    }

    async function criarAlbum(event) {
        event.preventDefault();
        resetMensagens();

        if (!titulo.trim()) {
            setErro('Informe o título do álbum.');
            return;
        }

        if (!capaUrl.trim()) {
            setErro('Informe a URL da capa do álbum.');
            return;
        }

        if (!isSupabaseConfigured) {
            setErro('Configure o Supabase no arquivo React/.env antes de criar o álbum.');
            return;
        }

        setEnviandoAlbum(true);

        try {
            const { data: albumCriado, error: erroInsert } = await supabase
                .from('albuns')
                .insert({
                    titulo: titulo.trim(),
                    descricao: descricao.trim(),
                    tipo_ensaio_id: tipoEnsaioId || null,
                    capa_url: capaUrl.trim(),
                })
                .select('id, titulo, descricao, capa_url, tipo_ensaio_id, created_at')
                .single();

            if (erroInsert) {
                throw new Error(erroInsert.message);
            }

            setTitulo('');
            setDescricao('');
            setTipoEnsaioId('');
            setCapaUrl('');
            const { data: listaAtualizada, error: erroLista } = await supabase
                .from('albuns')
                .select('id, titulo, descricao, capa_url, tipo_ensaio_id, created_at, tipos_ensaio(nome), fotos(url_imagem, ordem)')
                .order('created_at', { ascending: false });

            if (erroLista) {
                throw new Error(erroLista.message);
            }

            setAlbuns(listaAtualizada || []);
            setAlbumSelecionadoId(albumCriado.id);
            setSucesso('Álbum criado com sucesso.');
        } catch (error) {
            setErro(error.message || 'Não foi possível criar o álbum.');
        } finally {
            setEnviandoAlbum(false);
        }
    }

    async function adicionarFotos(event) {
        event.preventDefault();
        resetMensagens();

        if (!albumSelecionadoId) {
            setErro('Selecione um álbum para adicionar as fotos.');
            return;
        }

        const urlsValidas = fotosUrls
            .split('\n')
            .map((url) => url.trim())
            .filter(Boolean);

        if (!urlsValidas.length) {
            setErro('Informe pelo menos uma URL de imagem para adicionar ao álbum.');
            return;
        }

        if (!isSupabaseConfigured) {
            setErro('Configure o Supabase no arquivo React/.env antes de enviar as fotos.');
            return;
        }

        setEnviandoFotos(true);

        try {
            const itensInsert = urlsValidas.map((url, index) => ({
                album_id: albumSelecionadoId,
                url_imagem: url,
                ordem: index + 1,
            }));

            const { error: erroFotos } = await supabase.from('fotos').insert(itensInsert);
            if (erroFotos) {
                throw new Error(erroFotos.message);
            }

            const { data: listaAtualizada, error: erroLista } = await supabase
                .from('albuns')
                .select('id, titulo, descricao, capa_url, tipo_ensaio_id, created_at, tipos_ensaio(nome), fotos(url_imagem, ordem)')
                .order('created_at', { ascending: false });

            if (erroLista) {
                throw new Error(erroLista.message);
            }

            setAlbuns(listaAtualizada || []);
            setFotosUrls('');
            setSucesso('Fotos adicionadas ao álbum com sucesso.');
        } catch (error) {
            setErro(error.message || 'Não foi possível adicionar as fotos.');
        } finally {
            setEnviandoFotos(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#111311] text-[#eee9df]">
            <header className="border-b border-white/10 bg-[#171a17]">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-10">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#c89662]">Álbuns</p>
                        <h1 className="mt-2 font-serif text-3xl text-[#f2ede4]">Administração de portfólio</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/home')}
                            className="border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#eee9df] transition hover:border-[#c89662] hover:text-[#c89662]"
                        >
                            Agendamentos
                        </button>
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
                <div className="mb-10 flex items-center justify-between gap-4 border-b border-white/10 pb-8">
                    <div>
                        <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-[#c89662]">Painel</p>
                        <h2 className="font-serif text-4xl text-[#f2ede4]">Criar e organizar álbuns</h2>
                    </div>
                    <span className="text-sm text-[#aaa99f]">{admin?.nome || 'Admin'}</span>
                </div>

                {erro && <p className="mb-6 text-sm text-[#d9a07e]" role="alert">{erro}</p>}
                {sucesso && <p className="mb-6 text-sm text-[#b5c8a2]" role="status">{sucesso}</p>}

                {carregando ? (
                    <p className="text-[#aaa99f]">Carregando dados do álbum...</p>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                        <form onSubmit={criarAlbum} className="space-y-5 border border-white/10 bg-white/[0.03] p-6">
                            <div>
                                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#c89662]">Novo álbum</p>
                                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="tituloAlbum">Título</label>
                                <input
                                    id="tituloAlbum"
                                    type="text"
                                    value={titulo}
                                    onChange={(event) => setTitulo(event.target.value)}
                                    className="w-full border-b border-white/20 bg-transparent px-0 py-3 text-base text-[#f2ede4] outline-none placeholder:text-[#77786f] focus:border-[#c89662]"
                                    placeholder="Ex: Casamento Clara e Gabriel"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-[#aaa99f]" htmlFor="tipoAlbum">Tipo de ensaio</label>
                                <select
                                    id="tipoAlbum"
                                    value={tipoEnsaioId}
                                    onChange={(event) => setTipoEnsaioId(event.target.value)}
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
                                    onChange={(event) => setDescricao(event.target.value)}
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
                                    onChange={(event) => setCapaUrl(event.target.value)}
                                    className="w-full border-b border-white/20 bg-transparent px-0 py-3 text-base text-[#f2ede4] outline-none placeholder:text-[#77786f] focus:border-[#c89662]"
                                    placeholder="https://.../capa.jpg"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={enviandoAlbum}
                                className="w-full bg-[#eee9df] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-wait disabled:opacity-60"
                            >
                                {enviandoAlbum ? 'Criando álbum...' : 'Criar álbum'}
                            </button>
                        </form>

                        <div className="space-y-6">
                            <form onSubmit={adicionarFotos} className="border border-white/10 bg-white/[0.03] p-6">
                                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c89662]">Adicionar fotos</p>
                                        <h3 className="mt-2 font-serif text-3xl text-[#f2ede4]">Album selecionado</h3>
                                    </div>
                                    <select
                                        value={albumSelecionadoId}
                                        onChange={(event) => setAlbumSelecionadoId(event.target.value)}
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
                                    onChange={(event) => setFotosUrls(event.target.value)}
                                    className="w-full border border-white/10 bg-transparent px-4 py-3 text-base text-[#f2ede4] outline-none placeholder:text-[#77786f] focus:border-[#c89662]"
                                    placeholder="Cole uma URL por linha:&#10;https://.../foto1.jpg&#10;https://.../foto2.jpg"
                                />
                                {fotosUrls.trim() && (
                                    <p className="mt-3 text-xs text-[#aaa99f]">{fotosUrls.split(/\n/).map((url) => url.trim()).filter(Boolean).length} URL(s) pronta(s) para cadastro</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={enviandoFotos || !albumSelecionadoId}
                                    className="mt-6 w-full bg-[#eee9df] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111311] transition hover:bg-[#c89662] disabled:cursor-wait disabled:opacity-60"
                                >
                                    {enviandoFotos ? 'Enviando fotos...' : 'Adicionar fotos'}
                                </button>
                            </form>

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
                                                        src={album.capa_url || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80'}
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
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
