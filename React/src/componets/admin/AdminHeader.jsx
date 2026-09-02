export default function AdminHeader({ admin, onAlbums, onLogout }) {
    return (
        <header className="border-b border-white/10 bg-[#171a17]">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-10">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#c89662]">Área administrativa</p>
                    <h1 className="mt-2 font-serif text-3xl text-[#f2ede4]">Painel do estúdio</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onAlbums}
                        className="border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#eee9df] transition hover:border-[#c89662] hover:text-[#c89662]"
                    >
                        Álbum
                    </button>
                    <span className="text-sm text-[#aaa99f]">{admin?.nome || 'Admin'}</span>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="border border-white/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#eee9df] transition hover:border-[#c89662] hover:text-[#c89662]"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
}
