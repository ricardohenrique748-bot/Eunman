'use client'
import Link from 'next/link'
import { LayoutDashboard, Wrench, Shield, Package, DollarSign, Users, Settings, LogOut, ChevronDown, Disc, MapPin, CalendarClock, ListTodo } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { ModeToggle } from '@/components/ui/mode-toggle'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/')

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-surface/50 border-r border-border-color flex flex-col z-20 backdrop-blur-xl">
                <div className="h-20 flex items-center px-6 border-b border-border-color/50">
                    <div className="relative w-8 h-8 mr-3">
                        <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="font-semibold text-sm tracking-wide text-foreground opacity-90">EUNAMAN</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    <NavItem href="/dashboard" icon={LayoutDashboard} label="Visão Geral" active={pathname === '/dashboard'} />

                    <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">PCM</div>
                    <NavItem href="/dashboard/pcm/os" icon={Wrench} label="Controle de OS" active={isActive('/dashboard/pcm/os')} />
                    <NavItem href="/dashboard/pcm/preventivas" icon={Settings} label="Preventivas" active={isActive('/dashboard/pcm/preventivas')} />
                    <NavItem href="/dashboard/pcm/pneus" icon={Disc} label="Pneus" active={isActive('/dashboard/pcm/pneus')} />
                    <NavItem href="/dashboard/pcm/localizacao" icon={MapPin} label="Localização" active={isActive('/dashboard/pcm/localizacao')} />
                    <NavItem href="/dashboard/pcm/semanal" icon={CalendarClock} label="Prog. Semanal" active={isActive('/dashboard/pcm/semanal')} />
                    <NavItem href="/dashboard/pcm/backlog" icon={ListTodo} label="Backlog" active={isActive('/dashboard/pcm/backlog')} />

                    <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Operacional</div>
                    <NavItem href="/dashboard/seguranca" icon={Shield} label="Segurança (HSE)" active={isActive('/dashboard/seguranca')} />
                    <NavItem href="/dashboard/estoque" icon={Package} label="Almoxarifado" active={isActive('/dashboard/estoque')} />

                    <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gestão</div>
                    <NavItem href="/dashboard/custos" icon={DollarSign} label="Custos" active={isActive('/dashboard/custos')} />
                    <NavItem href="/dashboard/rh" icon={Users} label="Recursos Humanos" active={isActive('/dashboard/rh')} />

                    <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Admin</div>
                    <NavItem href="/dashboard/admin" icon={Settings} label="Configurações" active={isActive('/dashboard/admin')} />
                </nav>

                <div className="p-4 border-t border-border-color bg-surface-highlight/5">
                    <Link href="/" className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-primary hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-md transition-all group">
                        <LogOut className="w-4 h-4 mr-3 group-hover:text-red-500 transition-colors" />
                        Sair do Sistema
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-background">
                {/* Top Header with Filters */}
                <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border-color flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm">
                    <div className="flex items-center gap-6">
                        <h2 className="text-lg font-semibold text-foreground tracking-tight">Dashboard Geral</h2>
                        <span className="h-5 w-[1px] bg-border-color"></span>
                        {/* Global Filters Mockup */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select className="appearance-none bg-surface-highlight border border-border-color text-xs font-medium rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-gray-500 dark:text-gray-300 cursor-pointer hover:border-primary/50 transition-colors">
                                    <option>Todas Empresas</option>
                                    <option>Matriz - SP</option>
                                    <option>Filial - MG</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                            </div>

                            <div className="relative">
                                <select className="appearance-none bg-surface-highlight border border-border-color text-xs font-medium rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-gray-500 dark:text-gray-300 cursor-pointer hover:border-primary/50 transition-colors">
                                    <option>Últimos 30 dias</option>
                                    <option>Janeiro 2026</option>
                                    <option>Hoje</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <div className="flex flex-col items-end mr-2 hidden md:block">
                            <span className="text-sm font-bold text-foreground leading-none">João Silva</span>
                            <span className="text-[10px] text-primary font-medium tracking-wide">GESTOR DE FROTA</span>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-green-700 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-green-500/20 border border-white/10">
                            JS
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className={`flex-1 overflow-auto ${pathname?.startsWith('/dashboard/admin') ? '' : 'p-6'} scroll-smooth custom-scrollbar relative`}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />
                    {pathname?.startsWith('/dashboard/admin') ? (
                        children
                    ) : (
                        <div className="max-w-7xl mx-auto space-y-6">
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
        <Link href={href} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mb-0.5 ${active ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-foreground hover:bg-surface-highlight'}`}>
            <Icon className={`w-4 h-4 mr-3 ${active ? 'text-primary' : 'text-gray-400 group-hover:text-foreground'} transition-colors`} />
            {label}
        </Link>
    )
}
