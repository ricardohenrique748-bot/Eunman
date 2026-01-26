import { Plus, Filter, Search, MoreHorizontal, Calendar, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getOrdensServico } from '@/app/actions/pcm-actions'
import { OrdemServico, Veiculo } from '@prisma/client'

type OrdemServicoComVeiculo = OrdemServico & { veiculo: Veiculo }

export default async function PcmPage() {
    const { data: ordens, success } = await getOrdensServico()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Controle de Ordens de Serviço</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie todas as manutenções preventivas e corretivas da frota.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/pcm/os/nova">
                        <button className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20">
                            <Plus className="w-4 h-4" />
                            Nova O.S.
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filters Bar (Mock) */}
            <div className="bg-surface border border-border-color p-3 rounded-lg flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por Veículo ou OS..."
                        className="w-full bg-surface-highlight border border-border-color rounded-md pl-9 pr-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary placeholder-gray-500"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    <FilterButton label="Todas" active />
                    <FilterButton label="Abertas" />
                    <FilterButton label="Em Execução" />
                    <FilterButton label="Concluídas" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface border border-border-color rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-highlight text-gray-400 font-medium uppercase text-[10px] tracking-wider border-b border-border-color">
                            <tr>
                                <th className="px-6 py-3">Número</th>
                                <th className="px-6 py-3">Veículo</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Descrição (Resumo)</th>
                                <th className="px-6 py-3">Abertura</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {ordens && ordens.length > 0 ? (
                                ordens.map((os: OrdemServicoComVeiculo) => (
                                    <tr key={os.id} className="hover:bg-surface-highlight/10 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">#{os.numeroOS.toString().padStart(4, '0')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded bg-surface-highlight border border-border-color flex items-center justify-center text-xs font-bold text-gray-500 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                                                    {os.veiculo?.codigoInterno || '---'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{os.veiculo?.modelo || 'Veículo Desconhecido'}</div>
                                                    <div className="text-[10px] text-gray-500">{os.veiculo?.placa}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <BadgeTipo tipo={os.tipoOS} />
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-gray-400" title={os.descricao}>
                                            {os.descricao}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                                            {new Date(os.dataAbertura).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <BadgeStatus status={os.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-500 hover:text-white transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhuma Ordem de Serviço encontrada.</p>
                                        <Link href="/dashboard/pcm/os/nova" className="text-primary text-xs hover:underline mt-2 inline-block">Criar a primeira OS</Link>
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
        <button className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${active ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-highlight border-transparent text-gray-500 hover:text-foreground hover:border-gray-400 dark:hover:border-gray-600'}`}>
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
    const safeTipo = styles[tipo] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${safeTipo}`}>
            {tipo}
        </span>
    )
}

function BadgeStatus({ status }: { status: string }) {
    const styles: Record<string, string> = {
        ABERTA: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        PLANEJADA: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        EM_EXECUCAO: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        CONCLUIDA: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    }
    const safeStatus = styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'

    return (
        <div className="flex items-center gap-1.5">
            {status === 'CONCLUIDA' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <div className={`w-1.5 h-1.5 rounded-full ${status === 'EM_EXECUCAO' ? 'bg-orange-500 animate-pulse' : 'bg-gray-500'}`} />}
            <span className={`text-xs font-medium ${safeStatus.split(' ')[1]}`}>{status.replace('_', ' ')}</span>
        </div>
    )
}
