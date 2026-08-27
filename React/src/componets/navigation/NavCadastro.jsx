import { Link } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="border-b border-white/10 bg-[#111311]/95 px-5 py-4 sm:px-10">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
                <Link className="font-serif text-xl tracking-tight text-[#f2ede4]" to="/home">
                    Luz <span className="italic text-[#c89662]">&amp;</span> Sombra
                </Link>
                <Link className="text-xs font-bold uppercase tracking-[0.16em] text-[#aaa99f] transition hover:text-[#f2ede4]" to="/cadastrar">
                    Não possui uma conta?
                </Link>
            </div>
        </nav>
    )
};