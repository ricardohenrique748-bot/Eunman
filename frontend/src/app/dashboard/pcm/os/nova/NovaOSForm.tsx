'use client'

import { createOrdemServico } from '@/app/actions/pcm-actions' // Import server action
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface VeiculoDropdown {
    id: string;
    codigoInterno: string;
    modelo: string;
    placa: string | null;
}

export default function NovaOSForm({ veiculos }: { veiculos: VeiculoDropdown[] }) {
    const [enviadoReserva, setEnviadoReserva] = useState(false)

    return (
        <div className="max-w-4xl mx-auto py-6">
            <div className="mb-6">
                <Link href="/dashboard/pcm/os" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Lista
                </Link>
                <h1 className="text-2xl font-bold text-white">Nova Ordem de Serviço</h1>
            </div>

            <div className="bg-surface border border-border-color rounded-xl p-6 shadow-lg">
                <form action={async (formData) => {
                    await createOrdemServico(formData)
                }} className="space-y-6">

                    {/* Linha 1: Datas e Status/Placa */}
                    {/* Linha 1: Datas e Status/Placa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Datas */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Data/Hora Abertura</label>
                            <div className="relative">
                                <input type="datetime-local" name="dataAbertura" className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary" />
                                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Data/Hora Fechamento</label>
                            <div className="relative">
                                <input type="datetime-local" name="dataFechamento" disabled className="w-full bg-surface-highlight/50 border border-border-color rounded px-3 py-2 text-gray-400 text-sm cursor-not-allowed" />
                                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-600 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Status</label>
                            <select name="status" className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary appearance-none">
                                <option value="ABERTA">Aberta</option>
                                <option value="EM_ANDAMENTO">Em Andamento</option>
                                <option value="FECHAD">Fechada</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Placa *</label>
                            <select name="veiculoId" required className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary appearance-none">
                                <option value="">Selecione</option>
                                {veiculos.map((v) => (
                                    <option key={v.id} value={v.id}>{v.placa ? `${v.placa} - ${v.modelo}` : v.modelo}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Linha 2: Módulo */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Módulo</label>
                        <input type="text" name="modulo" className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary" />
                    </div>

                    {/* Linha 3: Horimetro, Operação, Local */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Horímetro</label>
                            <input type="number" name="horimetro" className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Operação (Tipo)</label>
                            <input type="text" name="operacao" className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Local</label>
                            <input type="text" name="local" className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary" />
                        </div>
                    </div>

                    {/* Linha 4: Classe e Checkbox */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Classe</label>
                            <select name="tipoOS" className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary appearance-none">
                                <option value="CORRETIVA">CORRETIVA</option>
                                <option value="PREVENTIVA">PREVENTIVA</option>
                                <option value="MELHORIA">MELHORIA</option>
                            </select>
                        </div>

                        <div className="flex flex-col pt-5 gap-4">
                            <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={enviadoReserva}
                                        onChange={(e) => setEnviadoReserva(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-surface-highlight peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-300">Foi enviado reserva?</span>
                                </label>
                            </div>

                            {/* Campo Condicional */}
                            {enviadoReserva && (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-semibold text-primary">Qual reserva foi enviada?</label>
                                    <select name="veiculoReservaId" className="w-full bg-surface-highlight border border-primary/50 rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary appearance-none">
                                        <option value="">Selecione o veículo reserva...</option>
                                        {veiculos.map((v) => (
                                            <option key={v.id} value={v.id}>{v.placa ? `${v.placa} - ${v.modelo}` : v.modelo}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Linha 5: Descrição Gigante */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Descrição da Atividade *</label>
                        <textarea name="descricao" rows={5} required className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary resize-none"></textarea>
                    </div>

                    {/* Linha 6: Motivo, Sistema, Sub-Sistema */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Motivo</label>
                            <select className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary appearance-none">
                                <option>Selecione</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sistema</label>
                            <select className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary appearance-none">
                                <option>Selecione</option>
                                <option>Motor</option>
                                <option>Elétrica</option>
                                <option>Hidráulica</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sub-Sistema</label>
                            <select className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary appearance-none">
                                <option>Selecione</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer Azul */}
                    <div className="bg-blue-900/10 dark:bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-200 font-medium text-sm">Tempo Total de Manutenção: <strong className="text-foreground text-lg">0 horas</strong></span>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link href="/dashboard/pcm/os">
                            <button type="button" className="px-6 py-2 rounded bg-white text-gray-800 font-bold hover:bg-gray-100 transition-colors border border-gray-200">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-bold transition-all shadow-lg active:scale-95">
                            Criar OS
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
