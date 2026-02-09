
import { createVeiculo } from '@/app/actions/frota-actions'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import Link from 'next/link'
import { DocCard } from './components/DocCard'

export default function NovoVeiculoPage() {
    return (
        <div className="max-w-5xl mx-auto py-6 space-y-8">
            <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-foreground">Novo Veículo</h1>
            </div>

            <form action={async (formData) => {
                'use server'
                await createVeiculo(formData)
            }} className="space-y-6">

                {/* INFORMAÇÕES BÁSICAS */}
                <div className="bg-blue-50/40 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-blue-200 mb-4">Informações Básicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500">Placa *</label>
                            <input name="placa" placeholder="ABC1234" required className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500">Tipo *</label>
                            <select name="tipo" className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                                <option value="LEVE">Leve</option>
                                <option value="PESADO">Pesado</option>
                                <option value="MAQUINA">Máquina</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500">Categoria *</label>
                            <select name="categoria" className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none cursor-pointer">
                                <option value="PROPRIO">Próprio</option>
                                <option value="ALUGADO">Alugado</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500">Módulo *</label>
                            <input name="modulo" defaultValue="BASE" className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                    </div>
                </div>

                {/* HORÍMETRO */}
                <div className="bg-emerald-50/40 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-emerald-200 mb-4">Horímetro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500">Horímetro Atual</label>
                            <input name="horimetro" type="number" placeholder="0" className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500">Data da Última Atualização</label>
                            <div className="relative">
                                <input name="dataAtualizacao" type="date" className="w-full bg-surface border border-border-color rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOCUMENTAÇÃO */}
                <div>
                    <h3 className="text-lg font-bold text-foreground mb-4">Documentação do Veículo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DocCard title="Laudo Eletromecânico" prefix="laudo" />
                        <DocCard title="CRLV" prefix="crlv" />
                        <DocCard title="Implemento" prefix="implemento" />
                        <DocCard title="Tacógrafo" prefix="tacografo" />
                        <DocCard title="CIV/CIPP" prefix="civ" />
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-6 border-t border-border-color">
                    <Link href="/dashboard/admin">
                        <button type="button" className="px-6 py-2.5 rounded-lg border border-border-color text-gray-500 hover:bg-surface-highlight transition-colors text-sm font-medium">Cancelar</button>
                    </Link>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Salvar Veículo
                    </button>
                </div>
            </form>
        </div>
    )
}


