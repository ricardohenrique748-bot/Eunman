'use client'

import React, { useState } from 'react'
import { BacklogItem } from '@/app/actions/backlog-actions'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function BacklogDetailed({ data }: { data: BacklogItem[] }) {
    const [search, setSearch] = useState('')

    const filtered = data.filter(item => {
        const s = search.toLowerCase()
        return (
            (item.descricaoAtividade?.toLowerCase() || '').includes(s) ||
            (item.frota?.toLowerCase() || '').includes(s) ||
            (item.os?.toLowerCase() || '').includes(s)
        )
    })

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border-color flex justify-between items-center bg-surface-highlight/10">
                <input
                    type="text"
                    placeholder="Filtrar tabela completa..."
                    className="bg-surface border border-border-color rounded-lg px-4 py-2 text-xs font-bold w-96 outline-none focus:border-primary transition-colors"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-surface-highlight/50 sticky top-0 z-10 backdrop-blur-sm border-b border-border-color">
                        <tr>
                            {[
                                'Semana', 'Mês', 'Ano', 'Data Evidência', 'Módulo', 'Reg. Prog.', 'Dias Pend.', 'Frota', 'TAG', 'Tipo',
                                'Descrição', 'Origem', 'Criticidade', 'Tempo Est.', 'Campo Base', 'OS', 'Material', 'RC', 'Ordem',
                                'Fornecedor', 'Data RC', 'Detalhe Pedido', 'Nec. Material', 'Tipo Pedido', 'Prev. Material',
                                'Sit. RC', 'Dias Req.', 'Prog.', 'Mão de Obra', 'Delta', 'Status Prog.', 'Prev. Conclusão',
                                'Conclusão', 'Dias Res.', 'Status', 'Obs'
                            ].map((header, i) => (
                                <th key={i} className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/50">
                        {filtered.map((item) => (
                            <tr key={item.id} className="hover:bg-surface-highlight/50 transition-colors text-xs text-foreground">
                                <td className="p-3">{item.semana}</td>
                                <td className="p-3">{item.mes}</td>
                                <td className="p-3">{item.ano}</td>
                                <td className="p-3">{item.dataEvidencia ? new Date(item.dataEvidencia).toLocaleDateString() : ''}</td>
                                <td className="p-3">{item.modulo}</td>
                                <td className="p-3">{item.regiaoProgramacao}</td>
                                <td className="p-3">{item.diasPendenciaAberta}</td>
                                <td className="p-3 font-bold">{item.frota}</td>
                                <td className="p-3">{item.tag}</td>
                                <td className="p-3">{item.tipo}</td>
                                <td className="p-3 max-w-xs truncate" title={item.descricaoAtividade || ''}>{item.descricaoAtividade}</td>
                                <td className="p-3">{item.origem}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.criticidade === 'CRITICO' ? 'bg-red-500 text-white' : ''}`}>
                                        {item.criticidade}
                                    </span>
                                </td>
                                <td className="p-3">{item.tempoExecucaoPrevisto}</td>
                                <td className="p-3">{item.campoBase}</td>
                                <td className="p-3">{item.os}</td>
                                <td className="p-3 max-w-xs truncate">{item.material}</td>
                                <td className="p-3">{item.numeroRc}</td>
                                <td className="p-3">{item.numeroOrdem}</td>
                                <td className="p-3">{item.fornecedor}</td>
                                <td className="p-3">{item.dataRc ? new Date(item.dataRc).toLocaleDateString() : ''}</td>
                                <td className="p-3 max-w-xs truncate">{item.detalhamentoPedido}</td>
                                <td className="p-3">{item.dataNecessidadeMaterial ? new Date(item.dataNecessidadeMaterial).toLocaleDateString() : ''}</td>
                                <td className="p-3">{item.tipoPedido}</td>
                                <td className="p-3">{item.previsaoMaterial ? new Date(item.previsaoMaterial).toLocaleDateString() : ''}</td>
                                <td className="p-3">{item.situacaoRc}</td>
                                <td className="p-3">{item.diasAberturaReqCompras}</td>
                                <td className="p-3">{item.dataProgramacao ? new Date(item.dataProgramacao).toLocaleDateString() : ''}</td>
                                <td className="p-3">{item.maoDeObra}</td>
                                <td className="p-3">{item.deltaEvidenciaProgramacao}</td>
                                <td className="p-3">{item.statusProgramacao}</td>
                                <td className="p-3">{item.previsaoConclusaoPendencia ? new Date(item.previsaoConclusaoPendencia).toLocaleDateString() : ''}</td>
                                <td className="p-3">{item.dataConclusaoPendencia ? new Date(item.dataConclusaoPendencia).toLocaleDateString() : ''}</td>
                                <td className="p-3">{item.diasResolucaoPendencia}</td>
                                <td className="p-3 font-bold">{item.status}</td>
                                <td className="p-3 max-w-xs truncate">{item.observacao}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
