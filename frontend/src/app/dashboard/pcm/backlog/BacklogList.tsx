'use client'

import React from 'react'
import { BacklogItem } from '@/app/actions/backlog-actions'
import { Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function BacklogList({ data }: { data: BacklogItem[] }) {
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
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider text-center">Dias Aberta</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">Criticidade</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">OS / Ordem</th>
                            <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">Status</th>
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
                                    <span className={`px-2 py-0.5 rounded-full ${Number(item.diasPendenciaAberta) > 30 ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                                        {item.diasPendenciaAberta || 0}
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
