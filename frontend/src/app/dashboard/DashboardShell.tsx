'use client'

import Link from 'next/link'
import { LayoutDashboard, Wrench, Shield, Package, DollarSign, Users, Settings, LogOut, ChevronDown, Disc, MapPin, CalendarClock, ListTodo } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { ModeToggle } from '@/components/ui/mode-toggle'

export default function DashboardShell({ children, user }: { children: React.ReactNode, user: any }) {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/')

    // Helper to get initials
    const getInitials = (name: string) => {
        if (!name) return 'JS'
        const parts = name.split(' ')
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        return name.substring(0, 2).toUpperCase()
    }

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-68 bg-surface border-r border-border-color flex flex-col z-20 shadow-2xl">
                <div className="h-20 flex items-center px-8 border-b border-border-color/50">
                    <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <div>
                            <span className="font-black text-sm tracking-tighter text-foreground block leading-none">EUNAMAN</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        <NavItem href="/dashboard" icon={LayoutDashboard} label="Visão Geral" active={pathname === '/dashboard'} />
                    </div>

                    <div className="space-y-1">
                        <div className="px-4 mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Controle PCM</span>
                        </div>
                        <NavItem href="/dashboard/pcm/os" icon={Wrench} label="Gestão de O.S." active={isActive('/dashboard/pcm/os')} />
                        <NavItem href="/dashboard/pcm/preventivas" icon={Settings} label="Planos de Preventiva" active={isActive('/dashboard/pcm/preventivas')} />
                        <NavItem href="/dashboard/pcm/pneus" icon={Disc} label="Controle de Pneus" active={isActive('/dashboard/pcm/pneus')} />
                        <NavItem href="/dashboard/pcm/localizacao" icon={MapPin} label="Localização" active={isActive('/dashboard/pcm/localizacao')} />
                    </div>

                    <div className="space-y-1">
                        <div className="px-4 mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logística</span>
                        </div>
                        <NavItem href="/dashboard/pcm/semanal" icon={CalendarClock} label="Prog. Semanal" active={isActive('/dashboard/pcm/semanal')} />
                        <NavItem href="/dashboard/pcm/backlog" icon={ListTodo} label="Fila de Backlog" active={isActive('/dashboard/pcm/backlog')} />
                        <NavItem href="/dashboard/estoque" icon={Package} label="Almoxarifado" active={isActive('/dashboard/estoque')} />
                    </div>

                    <div className="space-y-1">
                        <div className="px-4 mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Corporativo</span>
                        </div>
                        <NavItem href="/dashboard/rh" icon={Users} label="Equipe & RH" active={isActive('/dashboard/rh')} />
                        <NavItem href="/dashboard/custos" icon={DollarSign} label="Financeiro" active={isActive('/dashboard/custos')} />
                        <NavItem href="/dashboard/seguranca" icon={Shield} label="Segurança (HSE)" active={isActive('/dashboard/seguranca')} />
                    </div>
                </nav>

                <div className="p-4 border-t border-border-color">
                    <NavItem href="/dashboard/admin" icon={Settings} label="Administração" active={isActive('/dashboard/admin')} />
                    <Link href="/" className="flex items-center w-full px-4 py-3 mt-1 text-[11px] font-black text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all group uppercase tracking-widest">
                        <LogOut className="w-4 h-4 mr-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        Encerrar Sessão
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-background">
                {/* Top Header */}
                <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border-color flex items-center justify-between px-8 z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="w-1 h-6 bg-primary rounded-full hidden lg:block" />
                        <h2 className="text-sm font-black text-foreground uppercase tracking-widest opacity-70">
                            Central de Controle Operacional
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <ModeToggle />
                        <div className="h-4 w-[1px] bg-border-color" />
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-xs font-black text-foreground leading-none">
                                    {user ? user.nome : 'Administrador'}
                                </span>
                                <span className="text-[9px] text-primary font-black tracking-widest uppercase mt-0.5">
                                    {user ? user.perfil : 'MASTER'}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/80 to-primary text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary/20 border border-white/20 transform hover:scale-105 transition-transform cursor-pointer">
                                {getInitials(user?.nome)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className={`flex-1 overflow-auto ${pathname?.startsWith('/dashboard/admin') ? '' : 'p-8'} scroll-smooth custom-scrollbar relative`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_2%_2%,_rgba(var(--primary-rgb),0.03)_0%,_transparent_50%)] pointer-events-none" />
                    {pathname?.startsWith('/dashboard/admin') ? (
                        children
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

interface NavItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
    return (
        <Link href={href} className={`flex items-center px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all mb-1 group ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-500 hover:text-foreground hover:bg-surface-highlight'}`}>
            <Icon className={`w-4 h-4 mr-3 ${active ? 'text-white' : 'text-gray-400 group-hover:text-primary'} transition-colors stroke-[2.5px]`} />
            {label}
        </Link>
    )
}
