import { getPneus, getBoletins } from '@/app/actions/pneu-actions'
import { Plus, Disc, Activity, Truck, ClipboardCheck, Calendar, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import BoletimActions from './BoletimActions'

export const dynamic = 'force-dynamic'

export default async function PneusPage() {
    const boletins = await getBoletins()

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Boletim de Pneus</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestão de vida útil, desgaste e movimentação de pneus.</p>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <Link href="/dashboard/pcm/pneus/novo" className="flex-1 lg:flex-none">
                        <button className="w-full bg-surface border border-border-color text-foreground px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-surface-highlight active:scale-95">
                            <Plus className="w-4 h-4" />
                            Novo Pneu
                        </button>
                    </Link>
                    <Link href="/dashboard/pcm/pneus/inspecao" className="flex-1 lg:flex-none">
                        <button className="w-full bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95">
                            <ClipboardCheck className="w-4 h-4" />
                            Nova Inspeção
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
                {boletins.length > 0 ? (
                    boletins.map((boletim) => (
                        <div key={boletim.id} className="dashboard-card p-6 group hover:translate-y-[-4px] hover:border-primary/40 transition-all duration-300 relative overflow-hidden flex flex-col h-full">
                            {/* Accent Icon Background */}
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                <Disc className="w-32 h-32 rotate-12 stroke-[3px]" />
                            </div>

                            <div className="relative z-10 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-surface-highlight border border-border-color flex flex-col items-center justify-center shadow-inner group-hover:border-primary/30 transition-colors">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">FROTA</span>
                                            <span className="text-sm font-black text-foreground leading-none">
                                                {boletim.veiculo.codigoInterno.substring(0, 3)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-foreground tracking-tight leading-none mb-1">
                                                {boletim.veiculo.placa || boletim.veiculo.codigoInterno}
                                            </h3>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                {boletim.veiculo.modelo}
                                            </p>
                                        </div>
                                    </div>
                                    <BoletimActions id={boletim.id} />
                                </div>

                                <div className="flex items-center gap-4 mb-6 border-b border-border-color/50 pb-4">
                                    <div className="flex items-center gap-2 bg-background border border-border-color/40 px-3 py-1.5 rounded-xl">
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[10px] font-black text-foreground">{new Date(boletim.data).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-background border border-border-color/40 px-3 py-1.5 rounded-xl">
                                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-[10px] font-black text-foreground">{boletim.km.toLocaleString()} KM</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medição (Sulco)</p>
                                        <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">
                                            {boletim.itens.length} Pneus
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {boletim.itens.slice(0, 4).map((item, idx) => (
                                            <div key={idx} className={`flex justify-between items-center px-3 py-2.5 rounded-xl border transition-all ${item.sulcoMm < 3 ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-surface-highlight/50 border-border-color/30 hover:border-border-color'}`}>
                                                <span className="text-[10px] font-black opacity-60 uppercase">{item.posicao}</span>
                                                <div className="flex items-baseline gap-0.5">
                                                    <span className="text-sm font-black tracking-tight">{item.sulcoMm}</span>
                                                    <span className="text-[8px] font-bold opacity-40 uppercase">mm</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {boletim.itens.length > 4 && (
                                        <div className="flex justify-center">
                                            <div className="w-1 h-1 rounded-full bg-gray-300 mx-0.5"></div>
                                            <div className="w-1 h-1 rounded-full bg-gray-300 mx-0.5"></div>
                                            <div className="w-1 h-1 rounded-full bg-gray-300 mx-0.5"></div>
                                        </div>
                                    )}
                                </div>

                                {boletim.observacoes && (
                                    <div className="mt-auto pt-4 border-t border-border-color/50">
                                        <div className="flex gap-3 p-3 bg-orange-500/5 border border-orange-500/10 rounded-xl relative overflow-hidden">
                                            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-bold text-gray-500 leading-relaxed line-clamp-2">
                                                {boletim.observacoes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full dashboard-card h-[60vh] flex items-center justify-center flex-col text-center p-8 bg-surface/30">
                        <div className="p-8 bg-surface-highlight rounded-full mb-8 shadow-inner relative">
                            <Disc className="w-16 h-16 text-gray-400 opacity-20 animate-[spin_10s_linear_infinite]" />
                            <Plus className="w-6 h-6 text-primary absolute bottom-6 right-6" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Frota sem Inspeções</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 leading-relaxed font-medium">
                            Nenhum boletim de pneu foi registrado ainda. Comece monitorando o desgaste para otimizar seus custos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/dashboard/pcm/pneus/inspecao">
                                <button className="bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/25 active:scale-95">
                                    Primeira Inspeção
                                </button>
                            </Link>
                            <Link href="/dashboard/pcm/pneus/novo">
                                <button className="bg-surface border border-border-color text-foreground px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-surface-highlight active:scale-95">
                                    Cadastrar Pneu
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
