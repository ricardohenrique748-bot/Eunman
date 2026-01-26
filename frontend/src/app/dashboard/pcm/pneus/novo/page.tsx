import { createPneu } from '@/app/actions/pneu-actions'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NovoPneuPage() {
    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="mb-6">
                <Link href="/dashboard/pcm/pneus" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white">Cadastrar Novo Pneu</h1>
            </div>

            <div className="bg-surface border border-border-color rounded-xl p-6 shadow-lg">
                <form action={async (formData) => {
                    'use server'
                    await createPneu(formData)
                }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Código de Fogo (ID)</label>
                            <input name="codigoPneu" required placeholder="Ex: 1200R24-001" className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Medida</label>
                            <input name="medida" required placeholder="Ex: 295/80R22.5" className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Sulco Inicial (mm)</label>
                            <input type="number" step="0.1" name="sulco" required placeholder="Ex: 18.0" className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Status Inicial</label>
                            <select name="status" className="w-full bg-surface-highlight border border-border-color rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                                <option value="NOVO">NOVO (Estoque)</option>
                                <option value="RECAPADO">RECAPADO</option>
                                <option value="USADO">USADO</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border-color flex justify-end gap-3">
                        <Link href="/dashboard/pcm/pneus">
                            <button type="button" className="px-6 py-3 rounded-lg border border-border-color text-gray-300 font-medium hover:bg-surface-highlight transition-colors">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
                            <Save className="w-4 h-4" />
                            Salvar Pneu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
