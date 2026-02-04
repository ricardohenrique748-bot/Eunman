import { Plus, Filter, Search, MoreHorizontal, Calendar, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getOrdensServico } from '@/app/actions/pcm-actions'
import { OrdemServico, Veiculo } from '@prisma/client'

type OrdemServicoComVeiculo = OrdemServico & { veiculo: Veiculo }

export default async function PcmPage(props: any) {
    const searchParams = await props.searchParams
    const statusFilter = (searchParams.status as string) || 'TODAS'
    const queryFilter = (searchParams.q as string) || ''

    const { data: ordens } = await getOrdensServico({
        status: statusFilter,
        q: queryFilter
    })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight text-gradient bg-clip-text">Histórico de O.S.</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie a manutenção preventiva e corretiva da frota.</p>
                </div>
                <Link href="/dashboard/pcm/os/nova">
                    <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase tracking-widest border border-white/10">
                        <Plus className="w-5 h-5 stroke-[3px]" />
                        Nova Ordem de Serviço
                    </button>
                </Link>
            </div>

            {/* Filters & Command Bar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                <div className="xl:col-span-4 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <form action="" method="GET">
                        <input
                            type="text"
                            name="q"
                            defaultValue={queryFilter}
                            placeholder="Buscar placa, TAG ou problema..."
                            className="w-full bg-surface border border-border-color rounded-2xl pl-12 pr-4 py-3.5 text-xs font-black text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-600 placeholder:uppercase placeholder:tracking-tighter"
                        />
                        {statusFilter !== 'TODAS' && <input type="hidden" name="status" value={statusFilter} />}
                    </form>
                </div>

                <div className="xl:col-span-8 flex gap-2 overflow-x-auto pb-2 xl:pb-0 scrollbar-none scroll-smooth">
                    <FilterButton label="Todas" value="TODAS" active={statusFilter === 'TODAS'} q={queryFilter} />
                    <FilterButton label="Abertas" value="ABERTA" active={statusFilter === 'ABERTA'} q={queryFilter} />
                    <FilterButton label="Em Execução" value="EM_EXECUCAO" active={statusFilter === 'EM_EXECUCAO'} q={queryFilter} />
                    <FilterButton label="Planejadas" value="PLANEJADA" active={statusFilter === 'PLANEJADA'} q={queryFilter} />
                    <FilterButton label="Concluídas" value="CONCLUIDA" active={statusFilter === 'CONCLUIDA'} q={queryFilter} />
                </div>
            </div>

            {/* Table Area */}
            <div className="dashboard-card overflow-hidden border-none shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-highlight/30 border-b border-border-color/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Identificador</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Equipamento / Veículo</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Tipo</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Diagnóstico</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest">Abertura</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color/30">
                            {ordens && ordens.length > 0 ? (
                                ordens.map((os: OrdemServicoComVeiculo) => (
                                    <tr key={os.id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="font-black text-primary text-xs tracking-tighter">
                                                OS#{os.numeroOS.toString().padStart(5, '0')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-surface-highlight border border-border-color flex flex-col items-center justify-center group-hover:border-primary/40 transition-all shadow-inner">
                                                    <span className="text-[9px] font-black text-gray-500 uppercase leading-none block mb-0.5">TAG</span>
                                                    <span className="text-[11px] font-black text-foreground leading-none">
                                                        {os.veiculo?.codigoInterno || '---'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-foreground text-xs tracking-tight mb-0.5 uppercase">{os.veiculo?.placa || 'Sem Placa'}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{os.veiculo?.modelo}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <BadgeTipo tipo={os.tipoOS} />
                                        </td>
                                        <td className="px-8 py-6 max-w-md">
                                            <p className="text-gray-500 dark:text-gray-400 text-[11px] font-bold leading-relaxed line-clamp-2 italic opacity-80 group-hover:opacity-100 transition-opacity" title={os.descricao}>
                                                &ldquo;{os.descricao}&rdquo;
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground text-[10px] tracking-widest mb-0.5">
                                                    {new Date(os.dataAbertura).toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {new Date(os.dataAbertura).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <BadgeStatus status={os.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="w-8 h-8 rounded-xl bg-surface-highlight hover:bg-primary/10 text-gray-400 hover:text-primary transition-all flex items-center justify-center">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center bg-surface-highlight/5 rounded-3xl p-12 border-2 border-dashed border-border-color max-w-md mx-auto">
                                            <div className="w-20 h-20 rounded-full bg-surface-highlight flex items-center justify-center mb-6 shadow-inner relative">
                                                <Wrench className="w-8 h-8 text-gray-400 opacity-20" />
                                                <Search className="w-5 h-5 text-primary absolute -bottom-1 -right-1" />
                                            </div>
                                            <h3 className="text-lg font-black text-foreground mb-2">Histórico não Localizado</h3>
                                            <p className="text-xs text-gray-500 mb-8 max-w-xs mx-auto font-medium">Nenhuma Ordem de Serviço corresponde aos filtros aplicados. Tente ajustar sua busca.</p>
                                            <Link href="/dashboard/pcm/os">
                                                <button className="text-primary font-black text-[10px] hover:underline uppercase tracking-widest bg-primary/10 px-6 py-2.5 rounded-xl border border-primary/20 transition-all hover:bg-primary/20">
                                                    Limpar Filtros
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

function FilterButton({ label, value, active, q }: { label: string, value: string, active?: boolean, q?: string }) {
    const url = `/dashboard/pcm/os?status=${value}${q ? `&q=${q}` : ''}`

    return (
        <Link href={url} className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap flex items-center gap-2 group ${active ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' : 'bg-surface border-border-color text-gray-500 hover:text-foreground hover:bg-surface-highlight'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white shadow-[0_0_8px_white]' : 'bg-gray-400 group-hover:bg-primary transition-colors'}`} />
            {label}
        </Link>
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
