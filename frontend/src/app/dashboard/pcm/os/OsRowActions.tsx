'use client'

import { Printer, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { deleteOrdemServico } from '@/app/actions/pcm-actions'
import { useRouter } from 'next/navigation'

interface OsRowActionsProps {
    osId: string
    osNumero: string
}

export default function OsRowActions({ osId, osNumero }: OsRowActionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handlePrint = () => {
        // Encontra a linha da tabela e prepara para impressão ou abre uma nova aba formatada
        // Por enquanto, vamos apenas acionar o print padrao, mas idealmente seria um layout de impressao
        alert(`Gerando relatório para OS #${osNumero}... (Layout de impressão em desenvolvimento)`)
        window.print()
    }

    const handleDelete = async () => {
        if (!confirm(`Deseja realmente excluir a OS #${osNumero}?`)) return

        setIsDeleting(true)
        const res = await deleteOrdemServico(osId)
        if (res.success) {
            router.refresh()
        } else {
            alert(res.error)
        }
        setIsDeleting(false)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDeleting}
                className="w-8 h-8 rounded-xl bg-surface-highlight hover:bg-primary/10 text-gray-400 hover:text-primary transition-all flex items-center justify-center"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-color rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimir O.S.
                        </button>
                        <button
                            onClick={() => alert('Edição em desenvolvimento...')}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all"
                        >
                            <Pencil className="w-4 h-4" />
                            Editar Dados
                        </button>
                        <div className="h-px bg-border-color/50 my-1 mx-2" />
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 hover:bg-red-500/5 transition-all disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? 'Excluindo...' : 'Excluir O.S.'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
