'use client'

import { useState, useEffect } from 'react'
import { createPreventiva, getVeiculosSimples } from '@/app/actions/preventiva-actions'
import { ArrowLeft, Save, Calendar, Clock, Settings, Wrench } from 'lucide-react'
import Link from 'next/link'

interface VeiculoSimple {
    id: string;
    modelo: string;
    placa: string | null;
    codigoInterno: string;
    horimetroAtual: number;
}

export default function NovaPreventivaPage() {
    const [veiculos, setVeiculos] = useState<VeiculoSimple[]>([])
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
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/pcm/preventivas" className="text-gray-500 hover:text-primary text-xs font-bold flex items-center gap-1 mb-2 transition-colors uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3" /> Voltar ao Controle
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Nova Preventiva</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure o ciclo de manutenção para um veículo da frota.</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Clock className="w-8 h-8 text-primary" />
                </div>
            </div>

            <div className="dashboard-card p-8">
                <form action={async (formData) => {
                    setLoading(true)
                    await createPreventiva(formData)
                    setLoading(false)
                    window.location.href = '/dashboard/pcm/preventivas'
                }} className="space-y-8">

                    {/* Placa Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Veículo / Equipamento *</label>
                        <select
                            name="veiculoId"
                            required
                            className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                            onChange={handleVeiculoChange}
                            value={selectedVeiculo}
                        >
                            <option value="">Selecione o veículo</option>
                            {veiculos.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.codigoInterno} - {v.modelo} ({v.placa || 'Interno'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Detail Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Tipo de Plano *</label>
                            <div className="relative">
                                <Wrench className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                                <input name="tipo" placeholder="Ex: Preventiva de Motor" required className="w-full bg-background border border-border-color rounded-xl pl-12 pr-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Módulo / Sistema</label>
                            <div className="relative">
                                <Settings className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
                                <input name="modulo" placeholder="Ex: Lubrificação" className="w-full bg-background border border-border-color rounded-xl pl-12 pr-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    <hr className="border-border-color" />

                    {/* Horímetro / Intervalo Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Última Revisão (h)</label>
                            <input type="number" name="ultimoHorimetro" placeholder="0" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                            <p className="text-[9px] text-gray-500 leading-none ml-1">Horímetro da última parada.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Atual (h) *</label>
                            <input
                                type="number"
                                name="horimetroAtual"
                                value={horimetroAtual}
                                onChange={(e) => setHorimetroAtual(Number(e.target.value))}
                                className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                            <p className="text-[9px] text-gray-500 leading-none ml-1">Horímetro lido hoje.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Intervalo (h) *</label>
                            <input type="number" name="intervalo" defaultValue={500} required className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                            <p className="text-[9px] text-gray-500 leading-none ml-1">A cada quantas horas?</p>
                        </div>
                    </div>

                    <div className="space-y-2 max-w-sm">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Início da Contagem</label>
                        <div className="relative">
                            <input
                                type="date"
                                name="dataAtualizacao"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all pl-11"
                            />
                            <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border-color flex flex-col sm:flex-row justify-end gap-4">
                        <Link href="/dashboard/pcm/preventivas" className="w-full sm:w-auto">
                            <button type="button" className="w-full px-8 py-3.5 rounded-xl border border-border-color text-gray-400 font-bold hover:bg-surface-highlight transition-all uppercase text-[10px] tracking-widest">
                                Cancelar
                            </button>
                        </Link>
                        <button disabled={loading} type="submit" className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white px-10 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] uppercase text-[10px] tracking-widest disabled:opacity-50">
                            {loading ? (
                                <>
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Ativar Plano
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
