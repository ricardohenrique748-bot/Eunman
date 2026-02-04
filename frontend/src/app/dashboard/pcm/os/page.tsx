import { Plus, Filter, Search, MoreHorizontal, Calendar, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getOrdensServico } from '@/app/actions/pcm-actions'
import { OrdemServico, Veiculo } from '@prisma/client'

type OrdemServicoComVeiculo = OrdemServico & { veiculo: Veiculo }

export default async function PcmPage() {
    const { data: ordens, success } = await getOrdensServico()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Ordens de Serviço</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestão centralizada de manutenções e reparos da frota.</p>
                </div>
                <Link href="/dashboard/pcm/os/nova">
                    <button className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95 uppercase tracking-widest">
                        <Plus className="w-5 h-5 stroke-[3px]" />
                        Nova O.S.
                    </button>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="dashboard-card p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por placa, número ou mecânico..."
                        className="w-full bg-background border border-border-color rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-gray-600"
                    />
                </div>
                <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                    <FilterButton label="Todas" active />
                    <FilterButton label="Abertas" />
                    <FilterButton label="Em Execução" />
                    <FilterButton label="Concluídas" />
                </div>
            </div>

            {/* Table Area */}
            <div className="dashboard-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-highlight/50 border-b border-border-color">
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Número</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Veículo</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Tipo / Categoria</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Descrição</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Abertura</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color/50">
                            {ordens && ordens.length > 0 ? (
                                ordens.map((os: OrdemServicoComVeiculo) => (
                                    <tr key={os.id} className="hover:bg-surface-highlight/20 transition-all group">
                                        <td className="px-6 py-5 font-black text-primary text-sm">
                                            #{os.numeroOS.toString().padStart(4, '0')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-surface-highlight border border-border-color flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:border-primary/50 group-hover:text-primary transition-all shadow-inner">
                                                    {os.veiculo?.codigoInterno || '---'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground text-sm leading-none mb-1">{os.veiculo?.modelo || 'N/A'}</div>
                                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{os.veiculo?.placa}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <BadgeTipo tipo={os.tipoOS} />
                                        </td>
                                        <td className="px-6 py-5 max-w-xs">
                                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1 italic" title={os.descricao}>
                                                &ldquo;{os.descricao}&rdquo;
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-gray-500 text-xs">
                                            {new Date(os.dataAbertura).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <BadgeStatus status={os.status} />
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 rounded-lg hover:bg-surface-highlight text-gray-500 hover:text-primary transition-all">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center max-w-xs mx-auto">
                                            <div className="p-4 bg-surface-highlight rounded-full mb-4">
                                                <Wrench className="w-10 h-10 text-gray-600 opacity-20" />
                                            </div>
                                            <p className="font-bold text-foreground mb-1">Fila de manutenção vazia</p>
                                            <p className="text-sm text-gray-500 mb-6">Nenhuma Ordem de Serviço foi registrada para os filtros atuais.</p>
                                            <Link href="/dashboard/pcm/os/nova">
                                                <button className="text-primary font-black text-xs hover:underline uppercase tracking-widest">
                                                    Criar Nova OS agora
                                                </button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function FilterButton({ label, active }: { label: string, active?: boolean }) {
    return (
        <button className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${active ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-background border-border-color text-gray-500 hover:text-foreground hover:border-gray-400 dark:hover:border-gray-600'}`}>
            {label}
        </button>
    )
}

function BadgeTipo({ tipo }: { tipo: string }) {
    const styles: Record<string, string> = {
        PREVENTIVA: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        CORRETIVA: 'bg-red-500/10 text-red-500 border-red-500/20',
        INSPECAO: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        MELHORIA: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    }
    const safeStyle = styles[tipo] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'

    return (
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${safeStyle}`}>
            {tipo}
        </span>
    )
}

function BadgeStatus({ status }: { status: string }) {
    const styles: Record<string, { bg: string, text: string, dot: string }> = {
        ABERTA: { bg: 'bg-gray-500/5', text: 'text-gray-500', dot: 'bg-gray-500' },
        PLANEJADA: { bg: 'bg-yellow-500/5', text: 'text-yellow-500', dot: 'bg-yellow-500' },
        EM_EXECUCAO: { bg: 'bg-orange-500/5', text: 'text-orange-500', dot: 'bg-orange-500 animate-pulse' },
        CONCLUIDA: { bg: 'bg-emerald-500/5', text: 'text-emerald-500', dot: 'bg-emerald-500' },
    }
    const config = styles[status] || styles.ABERTA

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-current/10 ${config.bg} ${config.text}`}>
            {status === 'CONCLUIDA' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
                <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{status.replace('_', ' ')}</span>
        </div>
    )
}
