'use client'

import { createOrdemServico } from '@/app/actions/pcm-actions'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface VeiculoDropdown {
    id: string;
    codigoInterno: string;
    modelo: string;
    placa: string | null;
}

interface OsMotivo {
    id: string;
    nome: string;
}

interface OsSubSistema {
    id: string;
    nome: string;
    sistemaId: string;
}

interface OsSistema {
    id: string;
    nome: string;
    subSistemas: OsSubSistema[];
}

export default function NovaOSForm({ veiculos, osOptions }: {
    veiculos: VeiculoDropdown[],
    osOptions: { motivos: OsMotivo[], sistemas: OsSistema[] }
}) {
    const router = useRouter()
    const [enviadoReserva, setEnviadoReserva] = useState(false)
    const [selectedSistemaId, setSelectedSistemaId] = useState<string>('')

    const filteredSubSistemas = osOptions.sistemas.find(s => s.id === selectedSistemaId)?.subSistemas || []

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/pcm/os" className="text-gray-500 hover:text-primary text-xs font-bold flex items-center gap-1 mb-2 transition-colors uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3" /> Voltar ao Controle
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Abertura de O.S.</h1>
                    <p className="text-gray-500 text-sm mt-1">Registre uma nova ocorrência de manutenção para a frota.</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Clock className="w-8 h-8 text-primary" />
                </div>
            </div>

            <div className="dashboard-card p-8">
                <form action={async (formData) => {
                    const res = await createOrdemServico(formData)
                    if (res.success) {
                        router.push('/dashboard/pcm/os')
                    } else {
                        alert(res.error)
                    }
                }} className="space-y-10">

                    {/* Section: Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Informações Básicas</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Veículo / Placa *</label>
                                <select name="veiculoId" required className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                    <option value="">Selecione o Veículo</option>
                                    {veiculos.map((v) => (
                                        <option key={v.id} value={v.id}>{v.codigoInterno} - {v.modelo} ({v.placa || 'Interno'})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Tipo de Manutenção *</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['CORRETIVA', 'PREVENTIVA', 'MELHORIA'].map(tipo => (
                                        <label key={tipo} className="cursor-pointer">
                                            <input type="radio" name="tipoOS" value={tipo} className="peer hidden" defaultChecked={tipo === 'CORRETIVA'} />
                                            <div className="text-center py-3 rounded-xl border border-border-color font-bold text-[10px] transition-all peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary hover:bg-surface-highlight uppercase tracking-tighter">
                                                {tipo}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Data/Hora Abertura *</label>
                                <div className="relative">
                                    <input type="datetime-local" name="dataAbertura" defaultValue={new Date().toISOString().slice(0, 16)} required className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all pl-11" />
                                    <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Horímetro Atual</label>
                                <input type="number" name="horimetro" placeholder="Ex: 1450" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Status Inicial</label>
                                <select name="status" className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                    <option value="ABERTA">ABERTA</option>
                                    <option value="EM_EXECUCAO">EM EXECUÇÃO</option>
                                    <option value="PLANEJADA">PLANEJADA</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Detailed Diagnosis */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Diagnóstico & Local</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Motivo / Causa</label>
                                <select name="motivoId" className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                    <option value="">Selecione o Motivo</option>
                                    {osOptions.motivos.map(m => (
                                        <option key={m.id} value={m.id}>{m.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Sistema Afetado</label>
                                <select
                                    name="sistemaId"
                                    value={selectedSistemaId}
                                    onChange={(e) => setSelectedSistemaId(e.target.value)}
                                    className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Selecione o Sistema</option>
                                    {osOptions.sistemas.map(s => (
                                        <option key={s.id} value={s.id}>{s.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Sub-Sistema</label>
                                <select name="subSistemaId" className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                    <option value="">Selecione o Sub-Sistema</option>
                                    {filteredSubSistemas.map((ss: OsSubSistema) => (
                                        <option key={ss.id} value={ss.id}>{ss.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Descrição Detalhada do Problema *</label>
                            <textarea name="descricao" rows={4} required placeholder="Descreva os sintomas, falhas observadas ou serviços a serem realizados..." className="w-full bg-background border border-border-color rounded-xl px-4 py-4 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all resize-none"></textarea>
                        </div>
                    </div>

                    {/* Section: Logistics */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Logística & Apoio</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-background border border-border-color rounded-2xl group transition-all hover:border-primary/30">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-foreground uppercase tracking-wider">Substituição de Veículo</span>
                                        <span className="text-[10px] text-gray-500 font-bold">Foi enviado reserva para o local?</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={enviadoReserva}
                                            onChange={(e) => setEnviadoReserva(e.target.checked)}
                                        />
                                        <div className="w-12 h-6 bg-surface-highlight rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                {enviadoReserva && (
                                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-300">
                                        <label className="text-[10px] uppercase font-black text-primary tracking-widest ml-1">Veículo Reserva Enviado</label>
                                        <select name="veiculoReservaId" className="w-full bg-background border border-primary/30 rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                            <option value="">Selecione o reserva...</option>
                                            {veiculos.map((v) => (
                                                <option key={v.id} value={v.id}>{v.codigoInterno} - {v.placa}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Local do Equipamento</label>
                                    <input type="text" name="local" placeholder="Ex: Frente 02, Oficina Sul..." className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Módulo / Equipamento Específico</label>
                                    <input type="text" name="modulo" placeholder="Ex: Motor, Caçamba, Implemento..." className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border-color flex flex-col sm:flex-row justify-end gap-4">
                        <Link href="/dashboard/pcm/os" className="w-full sm:w-auto">
                            <button type="button" className="w-full px-8 py-3.5 rounded-xl border border-border-color text-gray-400 font-bold hover:bg-surface-highlight transition-all uppercase text-[10px] tracking-widest">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white px-12 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] uppercase text-[10px] tracking-widest">
                            <Clock className="w-4 h-4 stroke-[3px]" />
                            Abrir Ordem de Serviço
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
