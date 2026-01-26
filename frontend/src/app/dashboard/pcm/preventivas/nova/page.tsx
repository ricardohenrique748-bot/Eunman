'use client'

import { useState, useEffect } from 'react'
import { createPreventiva, getVeiculosSimples } from '@/app/actions/preventiva-actions'
import { ArrowLeft, Save, Calendar, Clock, Settings, Wrench } from 'lucide-react'
import Link from 'next/link'

export default function NovaPreventivaPage() {
    const [veiculos, setVeiculos] = useState<any[]>([])
    const [selectedVeiculo, setSelectedVeiculo] = useState<string>('')
    const [horimetroAtual, setHorimetroAtual] = useState<number>(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Fetch vehicles on client load
        getVeiculosSimples().then(setVeiculos)
    }, [])

    const handleVeiculoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const vId = e.target.value
        setSelectedVeiculo(vId)
        // Auto-fill Current Hour Meter if vehicle found
        const v = veiculos.find(x => x.id === vId)
        if (v) setHorimetroAtual(v.horimetroAtual || 0)
    }

    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="mb-6">
                <Link href="/dashboard/pcm/preventivas" className="text-gray-500 hover:text-foreground text-sm flex items-center gap-1 mb-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Nova Programação de Preventiva</h1>
                </div>
            </div>

            <div className="bg-surface border border-border-color rounded-xl p-6 shadow-lg">
                <form action={async (formData) => {
                    setLoading(true)
                    await createPreventiva(formData)
                    setLoading(false)
                    // Redirect handle via server usually, or manual push here if needed, but keeping simple
                    window.location.href = '/dashboard/pcm/preventivas'
                }} className="space-y-6">

                    {/* Placa */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Placa / Veículo</label>
                        <select
                            name="veiculoId"
                            required
                            className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                            onChange={handleVeiculoChange}
                            value={selectedVeiculo}
                        >
                            <option value="">Selecione o veículo</option>
                            {veiculos.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.codigoInterno} - {v.modelo} ({v.placa || 'Sem Placa'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tipo */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Tipo</label>
                            <div className="relative">
                                <Wrench className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input name="tipo" placeholder="Ex: Motor, Hidráulico" required className="w-full bg-surface-highlight border border-border-color rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            </div>
                        </div>

                        {/* Módulo */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Módulo</label>
                            <div className="relative">
                                <Settings className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input name="modulo" placeholder="Ex: Sistema de Freio" className="w-full bg-surface-highlight border border-border-color rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Último Horímetro */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Último Horímetro (h)</label>
                            <input type="number" name="ultimoHorimetro" placeholder="0" className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        </div>

                        {/* Horímetro Atual */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Horímetro Atual (h)</label>
                            <input
                                type="number"
                                name="horimetroAtual"
                                value={horimetroAtual}
                                onChange={(e) => setHorimetroAtual(Number(e.target.value))}
                                className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Intervalo (h)</label>
                        <input type="number" name="intervalo" defaultValue={500} required className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Data da Atualização</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="dataAtualizacao"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                            />
                            <Calendar className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                    </div>

                    <div className="pt-4 border-t border-border-color flex justify-end gap-3">
                        <Link href="/dashboard/pcm/preventivas">
                            <button type="button" className="px-6 py-3 rounded-lg border border-border-color text-gray-500 hover:text-foreground font-medium hover:bg-surface-highlight transition-colors">
                                Cancelar
                            </button>
                        </Link>
                        <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50">
                            {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Criar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
