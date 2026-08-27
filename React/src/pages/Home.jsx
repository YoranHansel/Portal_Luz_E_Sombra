import { useEffect, useState } from 'react';
import Navbar from '../componets/navigation/Navbar';

export default function Home() {
    const [albuns, setAlbuns] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        async function carregarAlbuns() {
            try {
                const resposta = await fetch(
                    'https://jsonplaceholder.typicode.com/photos?_limit=8'
                );

                if (!resposta.ok) {
                    throw new Error('Não foi possível carregar os álbuns.');
                }

                setAlbuns(await resposta.json());
            } catch {
                setErro('Não foi possível carregar os álbuns no momento.');
            } finally {
                setCarregando(false);
            }
        }

        carregarAlbuns();
    }, []);

    return (
        <div>
            <Navbar />
            <main>
                <h1>Estúdio Fotográfico Luz &amp; Sombra</h1>
                <p>Confira alguns dos nossos trabalhos.</p>
                <section aria-labelledby="albuns-titulo">
                    <h2 id="albuns-titulo">Álbuns</h2>
                    {carregando && <p>Carregando álbuns...</p>}
                    {erro && <p role="alert">{erro}</p>}
                    {!carregando && !erro && (
                        <div>
                            {albuns.map((album) => (
                                <article key={album.id}>
                                    <img
                                        src={album.thumbnailUrl}
                                        alt={album.title}
                                    />
                                    <h3>{album.title}</h3>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}