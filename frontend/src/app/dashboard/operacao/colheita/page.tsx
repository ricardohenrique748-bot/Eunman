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

    // Estado para armazenar o status individual de cada célula (Lavagem)
    const [cellStatuses, setCellStatuses] = useState<Record<string, 'PENDING' | 'DONE' | 'JUSTIFIED_SUZANO' | 'JUSTIFIED_EUNAMAN'>>({})

    const toggleStatus = (rowId: string, date: string, currentVal: number) => {
        if (!currentVal) return

        const key = `${rowId}-${date}`
        const currentStatus = cellStatuses[key] || 'PENDING'

        const nextStatusMap: Record<string, 'PENDING' | 'DONE' | 'JUSTIFIED_SUZANO' | 'JUSTIFIED_EUNAMAN'> = {
            'PENDING': 'DONE',
            'DONE': 'JUSTIFIED_SUZANO',
            'JUSTIFIED_SUZANO': 'JUSTIFIED_EUNAMAN',
            'JUSTIFIED_EUNAMAN': 'PENDING'
        }

        setCellStatuses(prev => ({
            ...prev,
            [key]: nextStatusMap[currentStatus]
        }))
    }

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

    const folgaDates = ['22/01', '23/01', '30/01', '31/01', '07/02', '08/02']

    const getCellValue = (val: number | undefined, date: string, tag: string, rowId: string) => {
        if (view === 'LUBRIFICACAO') {
            return (
                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100">
                    <Check className="w-4 h-4 stroke-[3px]" />
                </div>
            )
        }

        if (view === 'CALIBRAGEM' || view === 'TENSIONAMENTO') {
            const isActivityMachine = view === 'CALIBRAGEM' ? tag.startsWith('F-FWX') : tag.startsWith('F-HVE')
            const isFolga = folgaDates.includes(date)

            if (isActivityMachine && isFolga) {
                // Identificar as máquinas do grupo (FW ou HV) e a posição desta máquina na lista
                const groupPrefix = view === 'CALIBRAGEM' ? 'F-FWX' : 'F-HVE'
                const activityColor = view === 'CALIBRAGEM' ? 'bg-orange-600' : 'bg-purple-600'
                const activityLabel = view === 'CALIBRAGEM' ? 'Calibragem' : 'Tensionamento'
                const waiterColor = view === 'CALIBRAGEM' ? 'text-orange-200/40' : 'text-purple-200/40'

                const groupMachines = data.filter(m => (m as any).tag.startsWith(groupPrefix))
                const machineIndex = groupMachines.findIndex(m => (m as any).tag === tag)

                const dateIndex = folgaDates.indexOf(date)
                const isDay1OfBlock = dateIndex % 2 === 0

                // Regra: se tiver N máquinas, faz metade no dia 1 e metade no dia 2
                const splitPoint = Math.ceil(groupMachines.length / 2)
                const isMyTurn = isDay1OfBlock
                    ? machineIndex < splitPoint
                    : machineIndex >= splitPoint

                if (isMyTurn) {
                    return (
                        <div className={`w-full h-full flex flex-col items-center justify-center ${activityColor} text-white animate-pulse shadow-lg font-black italic`}>
                            <span className="text-[7px] uppercase tracking-tighter leading-none opacity-80">Executar</span>
                            <span className="text-[9px]">{activityLabel}</span>
                        </div>
                    )
                }

                return (
                    <div className={`w-full h-full flex items-center justify-center ${waiterColor}`}>
                        <span className="text-[8px] font-bold uppercase italic opacity-30">Aguardar</span>
                    </div>
                )
            }
            return null
        }

        if (!val) return null

        // Lógica LAVAGEM com Status
        const key = `${rowId}-${date}`
        const status = cellStatuses[key] || 'PENDING'
        const isGeral = val > 125

        let containerClass = ''
        let textClass = ''

        switch (status) {
            case 'DONE':
                containerClass = 'bg-emerald-500 shadow-md ring-1 ring-emerald-600'
                textClass = 'text-white'
                break
            case 'JUSTIFIED_SUZANO':
                containerClass = 'bg-yellow-400 shadow-sm'
                textClass = 'text-yellow-900'
                break
            case 'JUSTIFIED_EUNAMAN':
                containerClass = 'bg-red-500 shadow-md ring-1 ring-red-600'
                textClass = 'text-white'
                break
            case 'PENDING':
            default:
                containerClass = isGeral ? 'bg-slate-300 ring-2 ring-slate-400' : 'bg-slate-100'
                textClass = isGeral ? 'text-slate-800' : 'text-slate-500'
                break
        }

        return (
            <div
                onClick={() => toggleStatus(rowId, date, val)}
                className={`w-full h-full flex flex-col items-center justify-center transition-all cursor-pointer hover:brightness-110 active:scale-95 ${containerClass}`}
            >
                <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-black leading-none ${textClass}`}>{val}</span>
                    <span className={`text-[6px] uppercase tracking-widest leading-none mt-0.5 opacity-80 ${textClass}`}>
                        {status === 'PENDING' ? (isGeral ? 'GERAL' : 'PARCIAL') :
                            status === 'DONE' ? 'FEITO' :
                                status === 'JUSTIFIED_SUZANO' ? 'J. SUZ' : 'J. EUN'}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header section... */}
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
                {view === 'LAVAGEM' && (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-200 rounded-full border border-slate-300"></div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Pendente</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-emerald-200 shadow-md"></div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Feito (Verde)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-yellow-200 shadow-md"></div>
                            <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wide">Imp. Suzano (Amarelo)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full shadow-red-200 shadow-md"></div>
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Imp. Eunaman (Vermelho)</span>
                        </div>
                    </>
                )}
                {view === 'LUBRIFICACAO' && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Lubrificação Diária OK</span>
                    </div>
                )}
                {view === 'CALIBRAGEM' && (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg border border-orange-200 flex items-center justify-center">
                                <span className="text-[8px] font-black text-orange-700">M1</span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">1ª Metade (Folga 1)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg shadow-lg flex items-center justify-center">
                                <span className="text-[8px] font-black text-white">M2</span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">2ª Metade (Folga 2)</span>
                        </div>
                    </>
                )}
                {view === 'TENSIONAMENTO' && (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg border border-purple-200 flex items-center justify-center">
                                <span className="text-[8px] font-black text-purple-700">M1</span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">1ª Metade (Folga 1)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg shadow-lg flex items-center justify-center">
                                <span className="text-[8px] font-black text-white">M2</span>
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">2ª Metade (Folga 2)</span>
                        </div>
                    </>
                )}
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
                                            {getCellValue(row.values[date as keyof typeof row.values], date, row.tag, row.id)}
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
