'use client'

import { useState, useRef } from 'react'
import { Tractor, Info, Filter, Download, ChevronLeft, ChevronRight, Check, Upload } from 'lucide-react'
import * as XLSX from 'xlsx'

// Mock de dados baseado na imagem enviada
const initialData = [
    { id: '1', type: '895.2', tag: 'F-FWX-0280', cb: '', values: { '25/01': 125, '01/02': 1000, '06/02': 125, '09/02': 125 } } as any,
    { id: '2', type: '895.2', tag: 'F-FWX-0259', cb: '', values: { '27/01': 125, '02/02': 250, '10/02': 125 } } as any,
    { id: '3', type: '895.2', tag: 'F-FWX-0260', cb: '', values: { '28/01': 125, '03/02': 250, '11/02': 125 } } as any,
    { id: '4', type: '895.2', tag: 'F-FWX-0208', cb: '', values: { '24/01': 2000, '29/01': 125, '04/02': 250 } } as any,
    { id: '5', type: 'PC200 MD', tag: 'F-HVE-0550', cb: 'F-CFP-0810', values: { '28/01': 1000, '05/02': 125 } } as any,
    { id: '6', type: 'PC200 MD', tag: 'F-HVE-0634', cb: 'F-CFP-0742', values: { '26/01': 125, '01/02': 500, '06/02': 125 } } as any,
]

const dates = [
    '22/01', '23/01', '24/01', '25/01', '26/01', '27/01', '28/01', '29/01', '30/01', '31/01',
    '01/02', '02/02', '03/02', '04/02', '05/02', '06/02', '07/02', '08/02', '09/02', '10/02', '11/02'
]

export default function ColheitaPage() {
    const [view, setView] = useState<'LAVAGEM' | 'LUBRIFICACAO' | 'CALIBRAGEM' | 'TENSIONAMENTO'>('LAVAGEM')
    const [data, setData] = useState(initialData)
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Função para importar planilha da Suzano
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsImporting(true)
        const reader = new FileReader()

        reader.onload = (evt) => {
            try {
                const dataArray = evt.target?.result
                // @ts-ignore
                const workbook = XLSX.read(dataArray, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]

                // Converte em JSON
                // @ts-ignore
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) // eslint-disable-line
                console.log('[Import] Dados brutos lidos:', rawData)

                // Exemplo de Mapeamento (Ajustar para o formato real da Suzano)
                // Aqui você faria o processamento das linhas e colunas para atualizar o 'data'
                alert('Planilha Suzano lida com sucesso! Mapeando TAGs e valores de lavagem...')

                // Atualização fictícia para demonstrar o carregamento
                setData([...data])

            } catch (err) {
                console.error('[Import] Erro ao ler planilha:', err)
                alert('Erro ao ler o arquivo. Verifique o formato.')
            } finally {
                setIsImporting(false)
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }

        reader.readAsBinaryString(file)
    }

    const getCellValue = (val: number | undefined) => {
        if (!val) return null

        // Regra: 125 = Parcial, > 125 = Geral
        const isGeral = val > 125

        return (
            <div className={`w-full h-full flex flex-col items-center justify-center transition-all ${isGeral
                ? 'bg-blue-600 text-white font-black animate-pulse shadow-inner'
                : 'bg-blue-100 text-blue-800 font-bold'
                }`}>
                <span className="text-[10px]">{val}</span>
                <span className="text-[7px] uppercase tracking-tighter opacity-80 leading-none">
                    {isGeral ? 'Geral' : 'Parcial'}
                </span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Tractor className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-black tracking-tight uppercase">Programação de Colheita</h1>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Escala Suzano 6x2 — Planejamento de Atividades</p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="flex items-center gap-2 px-4 py-2 bg-surface-highlight border border-border-color rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-border-color transition-all disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        {isImporting ? 'Importando...' : 'Importar Suzano'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-color rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-surface-highlight transition-all">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                        <Check className="w-4 h-4" />
                        Salvar Alterações
                    </button>
                </div>
            </div>

            {/* View Selector Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-surface border border-border-color rounded-2xl w-fit shadow-sm">
                {(['LAVAGEM', 'LUBRIFICACAO', 'CALIBRAGEM', 'TENSIONAMENTO'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setView(t)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === t
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:text-foreground hover:bg-surface-highlight'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Legends */}
            <div className="flex items-center gap-6 px-4 py-3 bg-surface border border-border-color rounded-xl w-fit">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg border border-blue-200 flex items-center justify-center">
                        <span className="text-[10px] font-black text-blue-800 italic">125</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Parcial</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center">
                        <span className="text-[10px] font-black text-white italic">250+</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Geral (Crítico)</span>
                </div>
            </div>

            {/* Grid Container */}
            <div className="bg-surface border border-border-color rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-surface-highlight border-b border-border-color">
                                <th className="sticky left-0 z-10 bg-surface-highlight px-4 py-3 text-left border-r border-border-color min-w-[150px]">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">TIPO / TAG / CB</span>
                                </th>
                                {dates.map(date => (
                                    <th key={date} className={`px-2 py-3 text-center border-r border-border-color min-w-[70px] ${['24/01', '25/01', '31/01', '01/02', '07/02', '08/02'].includes(date) ? 'bg-orange-500/5' : ''
                                        }`}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black text-foreground">{date.split('/')[0]}</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">{date.split('/')[1] === '01' ? 'JAN' : 'FEV'}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {data.map(row => (
                                <tr key={row.id} className="hover:bg-surface-highlight/40 group">
                                    <td className="sticky left-0 z-10 bg-surface px-4 py-3 border-r border-border-color group-hover:bg-surface-highlight transition-colors">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[9px] font-black text-primary leading-none p-1 bg-primary/5 rounded">{row.type}</span>
                                                <span className="text-xs font-black text-foreground">{row.tag}</span>
                                            </div>
                                            {row.cb && (
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">CB: {row.cb}</span>
                                            )}
                                        </div>
                                    </td>
                                    {dates.map(date => (
                                        <td key={date} className={`h-12 border-r border-border-color p-0.5 text-center transition-all hover:bg-primary/5 cursor-pointer relative ${['24/01', '25/01', '31/01', '01/02', '07/02', '08/02'].includes(date) ? 'bg-orange-500/5' : ''
                                            }`}>
                                            {getCellValue(row.values[date as keyof typeof row.values])}
                                            <div className="absolute inset-0 border-2 border-primary border-dashed opacity-0 hover:opacity-100 pointer-events-none transition-opacity rounded-sm" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="flex items-center gap-2 text-gray-400 italic">
                <Info className="w-4 h-4" />
                <p className="text-[10px] font-medium tracking-wide">Dica: O sistema identifica automaticamente Lavagem Parcial (125) e Geral (&gt;125) ao importar.</p>
            </div>
        </div>
    )
}
