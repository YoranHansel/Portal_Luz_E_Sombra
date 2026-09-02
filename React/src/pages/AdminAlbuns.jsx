import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../supabase';
import AlbumForm from '../componets/admin/AlbumForm';
import PhotosForm from '../componets/admin/PhotosForm';
import AlbumList from '../componets/admin/AlbumList';

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
                        <AlbumForm
                            titulo={titulo}
                            tipoEnsaioId={tipoEnsaioId}
                            descricao={descricao}
                            capaUrl={capaUrl}
                            tiposEnsaio={tiposEnsaio}
                            enviando={enviandoAlbum}
                            onSubmit={criarAlbum}
                            onTituloChange={(event) => setTitulo(event.target.value)}
                            onTipoChange={(event) => setTipoEnsaioId(event.target.value)}
                            onDescricaoChange={(event) => setDescricao(event.target.value)}
                            onCapaChange={(event) => setCapaUrl(event.target.value)}
                        />

                        <div className="space-y-6">
                            <PhotosForm
                                albumSelecionadoId={albumSelecionadoId}
                                albuns={albuns}
                                fotosUrls={fotosUrls}
                                enviando={enviandoFotos}
                                onSubmit={adicionarFotos}
                                onAlbumChange={(event) => setAlbumSelecionadoId(event.target.value)}
                                onFotosChange={(event) => setFotosUrls(event.target.value)}
                            />
                            <AlbumList albuns={albuns} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
