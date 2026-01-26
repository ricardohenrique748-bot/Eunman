import { Wrench } from 'lucide-react'
import Link from 'next/link'

export default function PreventivasListPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Programação de Preventivas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie os planos de manutenção da frota</p>
                </div>
                <Link href="/dashboard/pcm/preventivas/nova">
                    <button className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                        <Wrench className="w-4 h-4" />
                        Nova Preventiva
                    </button>
                </Link>
            </div>

            <div className="bg-surface border border-border-color rounded-xl h-[60vh] flex items-center justify-center flex-col text-center">
                <div className="p-4 bg-surface-highlight rounded-full mb-4">
                    <Wrench className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Lista em Construção</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    Você já pode cadastrar novas preventivas clicando no botão acima. A visualização em lista será implementada em breve.
                </p>
            </div>
        </div>
    )
}
