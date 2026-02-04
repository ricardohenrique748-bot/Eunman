
import { createBoletimPneu } from '@/app/actions/pneu-actions'
import { getVeiculosDropdown } from '@/app/actions/pcm-actions'
import { ArrowLeft, Save, Calendar, Gauge } from 'lucide-react'
import Link from 'next/link'

export default async function NovaInspecaoPage() {
    const veiculos = await getVeiculosDropdown()

    const posicoes = [
        { id: 'DE', label: 'DE' }, { id: 'DD', label: 'DD' },
        { id: 'TEI', label: 'TEI' }, { id: 'TEE', label: 'TEE' },
        { id: 'TDI', label: 'TDI' }, { id: 'TDE', label: 'TDE' },
        { id: 'TEI1', label: 'TEI1' }, { id: 'TEE1', label: 'TEE1' },
        { id: 'TDI1', label: 'TDI1' }, { id: 'TDE1', label: 'TDE1' },
        { id: 'ESTEPE', label: 'ESTEPE' }
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/pcm/pneus" className="text-gray-500 hover:text-primary text-xs font-bold flex items-center gap-1 mb-2 transition-colors uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3" /> Voltar ao Boletim
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Nova Inspeção de Pneu</h1>
                    <p className="text-gray-500 text-sm mt-1">Registre o desgaste e a condição geral dos pneus da frota.</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Gauge className="w-8 h-8 text-primary" />
                </div>
            </div>

            <div className="dashboard-card p-8">
                <form action={async (formData) => {
                    'use server'
                    await createBoletimPneu(formData)
                }} className="space-y-10">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Veículo / Placa *</label>
                            <select name="veiculoId" required className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                <option value="">Selecione o Veículo</option>
                                {veiculos.map(v => (
                                    <option key={v.id} value={v.id}>{v.placa || v.codigoInterno}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Data da Inspeção *</label>
                            <div className="relative">
                                <input type="date" name="data" required className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all pl-11" />
                                <Calendar className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">KM Atual</label>
                            <div className="relative">
                                <input type="number" name="km" placeholder="Ex: 15456" className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all pl-11" />
                                <Gauge className="w-5 h-5 text-gray-500 absolute left-3.5 top-3.5" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Medição de Sulco (mm)</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {posicoes.map((pos) => (
                                <div key={pos.id} className="flex items-center gap-4 bg-background border border-border-color p-3 rounded-xl focus-within:border-primary/50 transition-colors">
                                    <div className="w-14 items-center justify-center flex bg-surface-highlight rounded-lg py-1">
                                        <span className="font-black text-gray-500 text-xs">{pos.label}</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name={`sulco_${pos.id}`}
                                        placeholder="0.0"
                                        className="flex-1 bg-transparent border-none text-foreground font-bold focus:outline-none text-lg placeholder:text-gray-700"
                                    />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">mm</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Condição Geral</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['BOM', 'REGULAR', 'RUIM'].map(cond => (
                                    <label key={cond} className="cursor-pointer">
                                        <input type="radio" name="condicao" value={cond} className="peer hidden" defaultChecked={cond === 'BOM'} />
                                        <div className={`text-center py-2.5 rounded-xl border border-border-color font-bold text-xs transition-all ${cond === 'BOM' ? 'peer-checked:bg-emerald-500/10 peer-checked:border-emerald-500 peer-checked:text-emerald-500' : cond === 'REGULAR' ? 'peer-checked:bg-yellow-500/10 peer-checked:border-yellow-500 peer-checked:text-yellow-500' : 'peer-checked:bg-red-500/10 peer-checked:border-red-500 peer-checked:text-red-500'} hover:bg-surface-highlight`}>
                                            {cond}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Observações Gerais</label>
                            <textarea name="observacoes" placeholder="Ex: Pneu traseiro apresenta desgaste irregular..." rows={2} className="w-full bg-background border border-border-color rounded-xl px-4 py-3 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all"></textarea>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border-color flex flex-col sm:flex-row justify-end gap-4">
                        <Link href="/dashboard/pcm/pneus" className="w-full sm:w-auto">
                            <button type="button" className="w-full px-8 py-3.5 rounded-xl border border-border-color text-gray-400 font-bold hover:bg-surface-highlight transition-all uppercase text-xs tracking-widest">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white px-10 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] uppercase text-xs tracking-widest">
                            <Save className="w-4 h-4" />
                            Finalizar Inspeção
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
