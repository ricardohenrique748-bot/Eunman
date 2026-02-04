import { Wrench, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { getPlanosManutencao } from '@/app/actions/preventiva-actions'
import PreventivaActions from './PreventivaActions'

export const dynamic = 'force-dynamic'

export default async function PreventivasListPage() {
    const planos = await getPlanosManutencao()

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Programação de Preventivas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitore os ciclos de manutenção e evite paradas não programadas.</p>
                </div>
                <Link href="/dashboard/pcm/preventivas/nova">
                    <button className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95 uppercase tracking-widest">
                        <Wrench className="w-5 h-5 stroke-[2.5px]" />
                        Novo Plano
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {planos.length === 0 ? (
                    <div className="col-span-full dashboard-card h-[50vh] flex items-center justify-center flex-col text-center p-8 bg-surface/30">
                        <div className="p-6 bg-surface-highlight rounded-full mb-6 shadow-inner">
                            <Wrench className="w-12 h-12 text-gray-600 opacity-20" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Sem Planos Cadastrados</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed">
                            Ainda não há manutenções preventivas programadas para a sua frota.
                        </p>
                        <Link href="/dashboard/pcm/preventivas/nova">
                            <button className="text-primary font-black text-sm hover:underline uppercase tracking-widest bg-primary/10 px-8 py-3 rounded-xl border border-primary/20 transition-all hover:bg-primary/20">
                                Iniciar Programação
                            </button>
                        </Link>
                    </div>
                ) : (
                    planos.map((plano) => {
                        const horimetroAtual = plano.veiculo.horimetroAtual
                        const proximaRevisao = plano.ultimoHorimetro + plano.intervalo
                        const horasRestantes = proximaRevisao - horimetroAtual
                        const percentual = Math.min(100, Math.max(0, ((horimetroAtual - plano.ultimoHorimetro) / plano.intervalo) * 100))

                        let statusColor = 'text-emerald-500'
                        let statusBg = 'bg-emerald-500/10'
                        let barColor = 'bg-emerald-500'
                        let statusText = 'No Prazo'

                        if (plano.status === 'ATRASADO' || horasRestantes < 0) {
                            statusColor = 'text-red-500'
                            statusBg = 'bg-red-500/10'
                            barColor = 'bg-red-500'
                            statusText = 'Atrasado'
                        } else if (plano.status === 'ATENCAO' || horasRestantes < 50) {
                            statusColor = 'text-yellow-500'
                            statusBg = 'bg-yellow-500/10'
                            barColor = 'bg-yellow-500'
                            statusText = 'Atenção'
                        }

                        return (
                            <div key={plano.id} className="dashboard-card p-6 group hover:translate-y-[-4px] hover:border-primary/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                                {/* Subtle Background Gradient Icon */}
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                    <Wrench className="w-32 h-32 rotate-[-15deg] stroke-[3px]" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-surface-highlight border border-border-color flex flex-col items-center justify-center shadow-inner group-hover:border-primary/30 transition-colors">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">OS</span>
                                                <span className="text-sm font-black text-foreground leading-none">PV</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-lg font-black text-foreground tracking-tight">{plano.veiculo.placa || plano.veiculo.codigoInterno}</h3>
                                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-current/10 ${statusBg} ${statusColor} tracking-widest`}>
                                                        {statusText}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{plano.veiculo.modelo}</p>
                                            </div>
                                        </div>
                                        <PreventivaActions id={plano.id} />
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-surface-highlight/40 p-3 rounded-xl border border-border-color/50">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tipo</p>
                                                <p className="text-sm font-black text-foreground">{plano.tipo}</p>
                                            </div>
                                            <div className="bg-surface-highlight/40 p-3 rounded-xl border border-border-color/50 text-right">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Intervalo</p>
                                                <p className="text-sm font-black text-foreground">{plano.intervalo} h</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 p-3 bg-background rounded-xl border border-border-color/50">
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <span className="text-gray-500">Última: {plano.ultimoHorimetro}h</span>
                                                <span className="text-foreground">Atual: {horimetroAtual}h</span>
                                            </div>
                                            <div className="h-2 w-full bg-surface-highlight rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
                                                    style={{ width: `${percentual}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border-color/50 flex justify-between items-center relative z-10 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Próxima Parada</span>
                                        <span className={`text-sm font-black ${statusColor} tracking-tight`}>
                                            {proximaRevisao} h
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Status</span>
                                        <span className={`text-xs font-bold ${statusColor} italic`}>
                                            {horasRestantes < 0 ? `${Math.abs(horasRestantes)}h em atraso` : `${horasRestantes}h restantes`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
