import { getVeiculosDropdown, createOrdemServico } from '@/app/actions/pcm-actions'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default async function NovaOSPage() {
    const veiculos = await getVeiculosDropdown()

    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="mb-6">
                <Link href="/dashboard/pcm/os" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Lista
                </Link>
                <h1 className="text-2xl font-bold text-white">Nova Ordem de Serviço</h1>
                <p className="text-gray-400 text-sm">Preencha os dados para abrir um novo chamado de manutenção.</p>
            </div>

            <div className="bg-surface border border-border-color rounded-xl p-6 shadow-lg">
                <form action={createOrdemServico} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Veículo / Equipamento</label>
                            <select name="veiculoId" required className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                                <option value="">Selecione um veículo...</option>
                                {veiculos.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.codigoInterno} - {v.modelo} ({v.placa ? v.placa : 'SEM PLACA'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Tipo de Manutenção</label>
                            <select name="tipoOS" required className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                                <option value="CORRETIVA">CORRETIVA (Quebra/Falha)</option>
                                <option value="PREVENTIVA">PREVENTIVA (Planejada)</option>
                                <option value="INSPECAO">INSPEÇÃO (Checklist)</option>
                                <option value="MELHORIA">MELHORIA / REFORMA</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Descrição do Problema / Serviço</label>
                        <textarea
                            name="descricao"
                            required
                            rows={4}
                            placeholder="Descreva detalhadamente o problema relatado ou o serviço a ser executado..."
                            className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-600 resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-4 border-t border-border-color flex justify-end gap-3">
                        <Link href="/dashboard/pcm/os">
                            <button type="button" className="px-6 py-3 rounded-lg border border-border-color text-gray-300 font-medium hover:bg-surface-highlight transition-colors">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
                            <Save className="w-4 h-4" />
                            Abrir Ordem de Serviço
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
