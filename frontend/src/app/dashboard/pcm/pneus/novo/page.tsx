import { createPneu } from '@/app/actions/pneu-actions'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NovoPneuPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/pcm/pneus" className="text-gray-500 hover:text-primary text-xs font-bold flex items-center gap-1 mb-2 transition-colors uppercase tracking-widest">
                        <ArrowLeft className="w-3 h-3" /> Voltar ao Boletim
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Novo Cadastro de Pneu</h1>
                    <p className="text-gray-500 text-sm mt-1">Insira um novo item no estoque de borracharia.</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Save className="w-8 h-8 text-primary" />
                </div>
            </div>

            <div className="dashboard-card p-8">
                <form action={async (formData) => {
                    'use server'
                    await createPneu(formData)
                }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Código de Fogo (ID) *</label>
                            <input name="codigoPneu" required placeholder="Ex: 1200R24-001" className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Medida *</label>
                            <input name="medida" required placeholder="Ex: 295/80R22.5" className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Sulco Nominal (mm) *</label>
                            <input type="number" step="0.1" name="sulco" required placeholder="Ex: 18.0" className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Estado de Conservação *</label>
                            <select name="status" className="w-full bg-background border border-border-color rounded-xl px-4 py-3.5 text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer">
                                <option value="NOVO">NOVO (Virgem)</option>
                                <option value="RECAPADO">RECAPADO (Reformado)</option>
                                <option value="USADO">USADO (Meia Vida)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border-color flex flex-col sm:flex-row justify-end gap-4">
                        <Link href="/dashboard/pcm/pneus" className="w-full sm:w-auto">
                            <button type="button" className="w-full px-8 py-4 rounded-xl border border-border-color text-gray-400 font-bold hover:bg-surface-highlight transition-all uppercase text-[10px] tracking-widest">
                                Cancelar
                            </button>
                        </Link>
                        <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] uppercase text-[10px] tracking-widest">
                            <Save className="w-4 h-4" />
                            Cadastrar Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
