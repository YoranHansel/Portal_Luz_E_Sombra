import { NavLink } from 'react-router-dom'

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-10 border-b border-white/10 bg-[#111311]/95 px-5 py-4 backdrop-blur-md sm:px-10">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
                <NavLink to="/home" className="font-serif text-xl tracking-tight text-[#f2ede4]">
                    Luz <span className="italic text-[#c89662]">&amp;</span> Sombra
                </NavLink>
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-xs font-semibold uppercase tracking-[0.16em]">
                    <NavLink to="/home" className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? 'bg-[#eee9df] text-[#111311]' : 'text-[#aaa99f] hover:text-white'}`}>
                        Portfólio
                    </NavLink>
                    <NavLink to="/agendamento" className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? 'bg-[#c89662] text-[#111311]' : 'text-[#aaa99f] hover:text-white'}`}>
                        Agendar
                    </NavLink>
                    <NavLink to="/sair" className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? 'bg-[#d9a07e] text-[#111311]' : 'text-[#aaa99f] hover:text-white'}`}>
                        Sair
                    </NavLink>
                </div>
            </div>
        </nav>
    )
};