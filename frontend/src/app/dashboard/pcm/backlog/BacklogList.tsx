'use client'

import React from 'react'
import { BacklogItem } from '@/app/actions/backlog-actions'
import { Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface BacklogListProps {
    data: BacklogItem[]
    onEdit: (item: BacklogItem) => void
    onDelete: (id: string) => void
}

export default function BacklogList({ data, onEdit, onDelete }: BacklogListProps) {
    const [filter, setFilter] = useState('')

    const filtered = data.filter(item => {
        const search = filter.toLowerCase()
        const desc = item.descricaoAtividade?.toLowerCase() || ''
        const frota = item.frota?.toLowerCase() || ''
        const ordem = (item.numeroOrdem || item.os)?.toLowerCase() || ''

        return desc.includes(search) || frota.includes(search) || ordem.includes(search)
    })

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-border-color flex justify-between items-center bg-surface-highlight/10">
                <input
                    type="text"
                    placeholder="Buscar por descrição, frota, ordem..."
                    className="bg-surface border border-border-color rounded-lg px-4 py-2 text-xs font-bold w-96 outline-none focus:border-primary transition-colors"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <span className="text-xs font-black uppercase text-gray-500 tracking-widest">
                    {filtered.length} Itens
                </span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-highlight/50 sticky top-0 z-10 backdrop-blur-sm border-b border-border-color">
                        <tr>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">Data Evidência</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">Frota</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider w-1/3">Descrição</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">Origem</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider text-center">Dias Pend.</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">Criticidade</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">OS / Ordem</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">Status</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/50">
                        {filtered.map((item) => (
                            <tr key={item.id} className="hover:bg-surface-highlight/50 transition-colors group">
                                <td className="p-3 text-xs font-medium text-gray-500">
                                    {item.dataEvidencia ? new Date(item.dataEvidencia).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="p-3 text-xs font-bold text-foreground">
                                    <span className="px-2 py-1 bg-surface-highlight rounded-md border border-border-color">
                                        {item.frota || '-'}
                                    </span>
                                </td>
                                <td className="p-3 text-xs font-medium text-gray-600 truncate max-w-xs" title={item.descricaoAtividade || ''}>
                                    {item.descricaoAtividade}
                                </td>
                                <td className="p-3 text-xs font-bold text-gray-500 uppercase">
                                    {item.origem}
                                </td>
                                <td className="p-3 text-xs font-bold text-center">
                                    <span className={`px-2 py-0.5 rounded-full ${(() => {
                                        if (!item.dataEvidencia) return 'bg-gray-100 text-gray-500'
                                        if (item.status === 'CONCLUIDO') return 'bg-emerald-100 text-emerald-600'

                                        const days = Math.floor((new Date().getTime() - new Date(item.dataEvidencia).getTime()) / (1000 * 3600 * 24))
                                        return days > 30 ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 text-gray-500'
                                    })()
                                        }`}>
                                        {(() => {
                                            if (!item.dataEvidencia) return 0
                                            if (item.status === 'CONCLUIDO') {
                                                // If concluded, calculate duration if dates available, or show 0 / stored value
                                                // For "Dias Pend.", if it's done, it's 0 pending days.
                                                return 0
                                            }
                                            const days = Math.floor((new Date().getTime() - new Date(item.dataEvidencia).getTime()) / (1000 * 3600 * 24))
                                            return days > 0 ? days : 0
                                        })()}
                                    </span>
                                </td>
                                <td className="p-3 text-xs">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider
                                        ${item.criticidade === 'CRITICO' ? 'bg-red-500 text-white shadow-red-500/20 shadow-lg' :
                                            item.criticidade === 'ALTA' ? 'bg-orange-500 text-white' :
                                                'bg-green-500/10 text-green-600'}
                                     `}>
                                        {item.criticidade || 'NORMAL'}
                                    </span>
                                </td>
                                <td className="p-3 text-xs font-mono text-gray-500">
                                    {item.numeroOrdem || item.os || '-'}
                                </td>
                                <td className="p-3 text-xs">
                                    <span className={`
                                        inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                        ${item.status === 'CONCLUIDO' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}
                                    `}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'CONCLUIDO' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                        {item.status || 'ABERTO'}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(item) }}
                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
