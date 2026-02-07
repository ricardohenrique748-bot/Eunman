'use client'

import { useState } from 'react'
import { updateSemanaPreventiva } from '@/app/actions/pcm-actions'
import { Truck, AlertCircle, CalendarClock, ChevronRight, GripVertical } from 'lucide-react'

interface Veiculo {
    id: string
    codigoInterno: string
    placa: string | null
    modelo: string
    tipoVeiculo: string
    semanaPreventiva: number | null
    status: string
}

export default function SemanalClient({ initialData }: { initialData: Veiculo[] }) {
    const [veiculos, setVeiculos] = useState<Veiculo[]>(initialData)
    const [draggedVeiculo, setDraggedVeiculo] = useState<string | null>(null)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleDragStart = (e: React.DragEvent, veiculoId: string) => {
        e.dataTransfer.setData('veiculoId', veiculoId)
        setDraggedVeiculo(veiculoId)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (e: React.DragEvent, targetWeek: number | null) => {
        e.preventDefault()
        const veiculoId = e.dataTransfer.getData('veiculoId')

        if (!veiculoId || loadingId) return

        const currentVeiculo = veiculos.find(v => v.id === veiculoId)
        if (currentVeiculo?.semanaPreventiva === targetWeek) return

        // Optimistic update
        setVeiculos(prev => prev.map(v =>
            v.id === veiculoId ? { ...v, semanaPreventiva: targetWeek } : v
        ))
        setLoadingId(veiculoId)

        try {
            const result = await updateSemanaPreventiva(veiculoId, targetWeek)
            if (!result.success) {
                // Revert on failure
                setVeiculos(prev => prev.map(v =>
                    v.id === veiculoId ? { ...v, semanaPreventiva: currentVeiculo?.semanaPreventiva ?? null } : v
                ))
            }
        } catch (error) {
            console.error('Failed to update week', error)
        } finally {
            setLoadingId(null)
            setDraggedVeiculo(null)
        }
    }

    const getColumnVehicles = (week: number | null) => {
        return veiculos.filter(v => v.semanaPreventiva === week)
    }

    const weeks = [
        { id: 1, label: 'Semana 1', color: 'border-l-blue-500', bg: 'bg-blue-500/5' },
        { id: 2, label: 'Semana 2', color: 'border-l-emerald-500', bg: 'bg-emerald-500/5' },
        { id: 3, label: 'Semana 3', color: 'border-l-orange-500', bg: 'bg-orange-500/5' },
        { id: 4, label: 'Semana 4', color: 'border-l-purple-500', bg: 'bg-purple-500/5' },
    ]

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <CalendarClock className="w-6 h-6 text-primary" />
                        Programação Semanal
                    </h2>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Distribuição da Frota por Ciclo
                    </p>
                </div>
                <div className="bg-surface border border-border-color px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-500">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Arraste os veículos para programar a semana
                </div>
            </div>

            <div className="flex-1 grid grid-cols-5 gap-4 min-h-0 overflow-hidden">
                {/* Unscheduled Column */}
                <div
                    className="bg-surface border border-border-color rounded-2xl flex flex-col h-full overflow-hidden"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, null)}
                >
                    <div className="p-4 border-b border-border-color bg-surface-highlight/20 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Sem Programação</span>
                            <span className="bg-gray-500/10 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-black">
                                {getColumnVehicles(null).length}
                            </span>
                        </div>
                    </div>
                    <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {getColumnVehicles(null).map(veiculo => (
                            <VehicleCard
                                key={veiculo.id}
                                veiculo={veiculo}
                                onDragStart={handleDragStart}
                                isLoading={loadingId === veiculo.id}
                            />
                        ))}
                        {getColumnVehicles(null).length === 0 && (
                            <div className="h-20 flex items-center justify-center text-gray-400 text-xs font-bold italic opacity-50 border-2 border-dashed border-border-color rounded-xl">
                                Vazio
                            </div>
                        )}
                    </div>
                </div>

                {/* Weeks Columns */}
                {weeks.map(week => (
                    <div
                        key={week.id}
                        className={`bg-surface border border-border-color rounded-2xl flex flex-col h-full overflow-hidden ${draggedVeiculo ? 'border-dashed border-primary/30' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, week.id)}
                    >
                        <div className={`p-4 border-b border-border-color ${week.bg} sticky top-0 z-10 backdrop-blur-sm`}>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-widest text-foreground">{week.label}</span>
                                <span className="bg-surface text-foreground px-2 py-0.5 rounded-md text-[10px] font-black shadow-sm">
                                    {getColumnVehicles(week.id).length}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2 relative">
                            {/* Guide Lines */}
                            <div className={`absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]`} />

                            {getColumnVehicles(week.id).map(veiculo => (
                                <VehicleCard
                                    key={veiculo.id}
                                    veiculo={veiculo}
                                    onDragStart={handleDragStart}
                                    weekId={week.id}
                                    isLoading={loadingId === veiculo.id}
                                />
                            ))}
                            {getColumnVehicles(week.id).length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs font-bold opacity-30">
                                    <span className="text-2xl mb-2">📅</span>
                                    <span>Arraste aqui</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function VehicleCard({ veiculo, onDragStart, weekId, isLoading }: { veiculo: Veiculo, onDragStart: (e: React.DragEvent, id: string) => void, weekId?: number, isLoading?: boolean }) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, veiculo.id)}
            className={`
                bg-surface-highlight border border-border-color p-3 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all group relative overflow-hidden
                ${isLoading ? 'opacity-50 pointer-events-none' : ''}
                ${veiculo.status === 'EM_MANUTENCAO' ? 'border-l-4 border-l-red-500' :
                    veiculo.status === 'EM_OPERACAO' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-gray-300'}
            `}
        >
            {isLoading && (
                <div className="absolute inset-0 bg-surface/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    {veiculo.codigoInterno}
                </span>
                {veiculo.status === 'EM_MANUTENCAO' && (
                    <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />
                )}
            </div>

            <div className="flex items-center gap-2 mb-1">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                <h4 className="text-sm font-bold text-foreground truncate">{veiculo.placa || 'Sem Placa'}</h4>
            </div>

            <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] text-gray-500 font-medium truncate max-w-[80px]" title={veiculo.modelo}>
                    {veiculo.modelo}
                </span>
                <GripVertical className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    )
}
