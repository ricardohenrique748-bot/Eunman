import { getPneus, getBoletins } from '@/app/actions/pneu-actions'
import { Plus, Disc, Activity, Truck, ClipboardCheck, Calendar, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import BoletimActions from './BoletimActions'

export const dynamic = 'force-dynamic'

export default async function PneusPage() {
    const boletins = await getBoletins()

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Disc className="w-8 h-8 text-primary" />
                        </div>
                        Boletim de Pneus
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 ml-1">
                        Gerencie inspeções, acompanhe desgaste e vida útil dos pneus.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link href="/dashboard/pcm/pneus/inspecao" className="flex-1 md:flex-none">
                        <button className="w-full bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0">
                            <ClipboardCheck className="w-4 h-4" />
                            Nova Inspeção
                        </button>
                    </Link>
                    <Link href="/dashboard/pcm/pneus/novo" className="flex-1 md:flex-none">
                        <button className="w-full bg-surface hover:bg-surface-highlight border border-border-color text-foreground px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:border-gray-300 dark:hover:border-gray-600">
                            <Plus className="w-4 h-4" />
                            Novo Pneu
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {boletins.map((boletim) => (
                    <div key={boletim.id} className="group glass-card p-6 hover:shadow-xl hover:shadow-black/5 hover:border-primary/40 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-lg shadow-inner">
                                    {boletim.veiculo.codigoInterno.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground leading-none mb-1">
                                        {boletim.veiculo.placa || boletim.veiculo.codigoInterno}
                                    </h3>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {boletim.veiculo.modelo}
                                    </p>
                                </div>
                            </div>
                            <BoletimActions id={boletim.id} />
                        </div>

                        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 border-b border-border-color pb-4 border-dashed">
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-lg">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="font-semibold">{new Date(boletim.data).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-lg">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <span className="font-semibold">{boletim.km.toLocaleString()} km</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumo da Inspeção</p>
                                    <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                                        {boletim.itens.length} Pneus
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {boletim.itens.slice(0, 4).map((item, idx) => (
                                        <div key={idx} className={`flex justify-between items-center px-3 py-2 rounded-lg border ${item.sulcoMm < 3 ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-surface-highlight border-transparent'}`}>
                                            <span className="text-xs font-bold text-gray-500">{item.posicao}</span>
                                            <div className="flex items-baseline gap-0.5">
                                                <span className={`text-sm font-bold ${item.sulcoMm < 3 ? 'text-red-500' : 'text-foreground'}`}>
                                                    {item.sulcoMm}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">mm</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {boletim.itens.length > 4 && (
                                    <p className="text-center text-[10px] text-gray-400 mt-2 font-medium hover:text-primary cursor-default transition-colors">
                                        + {boletim.itens.length - 4} outros pneus inspecionados
                                    </p>
                                )}
                            </div>

                            {boletim.observacoes && (
                                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl relative">
                                    <div className="absolute top-3 left-3">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 pl-6 leading-relaxed">
                                        {boletim.observacoes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {boletins.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 dark:bg-gray-900/20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
                            <ClipboardCheck className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">Nenhuma inspeção encontrada</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                            Registre a primeira inspeção da frota clicando no botão abaixo.
                        </p>
                        <Link href="/dashboard/pcm/pneus/inspecao">
                            <button className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                                Criar Nova Inspeção
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
