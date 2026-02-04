'use client'

import { MoreVertical, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { deleteBoletim } from '@/app/actions/pneu-actions'
import { useRouter } from 'next/navigation'

export default function BoletimActions({ id }: { id: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (confirm('Tem certeza que deseja excluir este boletim?')) {
            setLoading(true)
            const res = await deleteBoletim(id)
            setLoading(false)
            if (res.success) {
                router.refresh()
            } else {
                alert('Erro ao excluir')
            }
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 hover:bg-surface-highlight rounded-full transition-colors"
            >
                <MoreVertical className="w-5 h-5 text-gray-400 hover:text-foreground" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-8 w-32 bg-surface text-sm border border-border-color rounded-lg shadow-xl z-20 overflow-hidden">
                        {/* 
                        <Link href={`/dashboard/pcm/pneus/inspecao/${id}/editar`} className="w-full text-left px-4 py-2 hover:bg-surface-highlight flex items-center gap-2 text-foreground">
                            <Edit className="w-4 h-4" /> Editar
                        </Link>
                         */}
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 hover:text-red-600 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            {loading ? '...' : 'Excluir'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
