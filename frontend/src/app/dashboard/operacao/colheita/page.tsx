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

export default function ColheitaPage() {
    const [view, setView] = useState<'LAVAGEM' | 'LUBRIFICACAO' | 'CALIBRAGEM' | 'TENSIONAMENTO'>('LAVAGEM')
    const [data, setData] = useState(initialData)
    const [dates, setDates] = useState([
        '22/01', '23/01', '24/01', '25/01', '26/01', '27/01', '28/01', '29/01', '30/01', '31/01',
        '01/02', '02/02', '03/02', '04/02', '05/02', '06/02', '07/02', '08/02', '09/02', '10/02', '11/02'
    ])
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedModule, setSelectedModule] = useState<'MODULO_2' | 'MODULO_5' | 'MODULO_7' | 'CARREGAMENTO'>('MODULO_2')

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

                // Converte em array de arrays (raw: false garante que datas venham como string formatada)
                // @ts-ignore
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][]
                console.log('[Import] Linhas brutas:', rows)

                if (!rows || rows.length === 0) throw new Error('Planilha vazia')

                // 1. Identificar linha de cabeçalho (procurar datas)
                let headerRowIndex = -1
                let dateColumns: { index: number, date: string }[] = []

                // Regex para DD/MM, DD-MMM, com ou sem ano (ex: 22/01, 22-Jan, 22 FEV)
                // Aceita separadores: / . - ou espaço/quebra de linha
                const dateRegex = /^(\d{1,2})[\s\/.\-]+(\d{1,2}|[a-zA-Z]{3,})(?:[\s\/.\-]+(?:\d{2,4}))?/

                for (let i = 0; i < Math.min(rows.length, 10); i++) {
                    const row = rows[i]
                    const potentialDates = row.map((cell, idx) => ({ cell, idx }))
                        .filter(item => typeof item.cell === 'string' && dateRegex.test(item.cell))

                    // Se encontrar > 3 colunas de data, assume que é o cabeçalho
                    if (potentialDates.length > 3) {
                        headerRowIndex = i
                        // Normalizar datas encontradas
                        dateColumns = potentialDates.map(p => ({
                            index: p.idx,
                            date: p.cell // Manter como string por enquanto
                        }))
                        break
                    }
                }

                if (headerRowIndex === -1) {
                    alert('Não foi possível identificar o cabeçalho com datas (ex: 25/01). Verifique o formato.')
                    return
                }

                const newDates = dateColumns.map(d => d.date)
                setDates(newDates)

                // 2. Extrair dados das máquinas
                const machinesMap = new Map<string, any>()

                for (let i = headerRowIndex + 1; i < rows.length; i++) {
                    const row = rows[i]
                    if (!row || row.length === 0) continue

                    // Tentar achar TAG/TIPO (assumindo primeiras colunas)
                    // Coluna 0: Tipo (ex: 895.2), Coluna 1: TAG (ex: F-FWX-0280) - Ajustar conforme padrão Suzano
                    // Ou procurar coluna que parece TAG (F-XXX-XXXX)

                    let tag = ''
                    let type = ''
                    let cb = ''

                    // Heurística básica: Check col 0, 1, 2
                    const col0 = row[0]?.toString() || ''
                    const col1 = row[1]?.toString() || ''
                    const col2 = row[2]?.toString() || ''

                    if (col1.startsWith('F-') || col1.includes('FWX') || col1.includes('HVE')) {
                        type = col0
                        tag = col1
                    } else if (col0.startsWith('F-')) {
                        tag = col0
                        type = 'UNK' // Desconhecido se não tiver coluna separada
                    } else {
                        // Tentar achar em todo a linha
                        const tagIdx = row.findIndex((c: any) => c && c.toString().startsWith('F-'))
                        if (tagIdx > -1) {
                            tag = row[tagIdx].toString()
                            if (tagIdx > 0) type = row[tagIdx - 1]?.toString()
                        }
                    }

                    if (!tag) continue // Pular linhas sem tag válida

                    // Extrair valores das datas
                    const values: Record<string, number> = {}
                    dateColumns.forEach(col => {
                        const val = row[col.index]
                        if (val) {
                            // Se for número direto
                            if (typeof val === 'number') {
                                values[col.date] = val
                            } else {
                                // Se for string, tentar parsear
                                const num = parseInt(val.toString().replace(/\D/g, '')) // Remove chars nao numericos? Cuidado com datas.
                                // Melhor: Se for string '1000' ok. Se for 'ok' ignorar?
                                // Suzano usa numeros para km/horas ou códigos?
                                // Assumindo numeros de horimetro/km ou códigos de manutenção
                                if (!isNaN(Number(val))) {
                                    values[col.date] = Number(val)
                                }
                            }
                        }
                    })

                    // Usar Map para evitar duplicatas e mesclar valores se necessário
                    if (machinesMap.has(tag)) {
                        const existing = machinesMap.get(tag)
                        // Mesclar valores (se houver dados divididos em varias linhas)
                        existing.values = { ...existing.values, ...values }
                        // Atualizar tipo se o existente for desconhecido
                        if (existing.type === 'UNK' || existing.type === 'N/A') {
                            existing.type = type
                        }
                    } else {
                        // Generate a pseudo-random ID
                        const rowId = `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

                        machinesMap.set(tag, {
                            id: rowId,
                            module: selectedModule, // Link to current module
                            type: type || 'N/A',
                            tag: tag,
                            cb: cb,
                            values: values
                        })
                    }
                }

                const newData = Array.from(machinesMap.values())

                if (newData.length > 0) {
                    // Update: Remove existing data for THIS module and replace with new import
                    // Keep data for OTHER modules intact
                    setData(prev => {
                        const others = prev.filter(row => {
                            const m = row.module || 'MODULO_2'
                            return m !== selectedModule
                        })
                        return [...others, ...newData]
                    })

                    alert(`Importação concluída para ${selectedModule}! ${newData.length} máquinas encontradas.`)
                } else {
                    alert('Nenhuma máquina encontrada. Verifique se a coluna de TAG começa com "F-".')
                    // Fallback to defaults? No, keep existing or empty.
                }

            } catch (err) {
                console.error('[Import] Erro ao ler planilha:', err)
                alert('Erro ao processar o arquivo. Verifique o console para detalhes.')
            } finally {
                setIsImporting(false)
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }

        reader.readAsBinaryString(file)
    }

    // Expanded Folga Dates (6x2 Pattern)
    // 22/01, 23/01, 30/01, 31/01, 07/02, 08/02, 15/02, 16/02, 23/02, 24/02, 03/03, 04/03
    const folgaDatesRaw = [
        '22/01', '23/01', '30/01', '31/01',
        '07/02', '08/02', '15/02', '16/02', '23/02', '24/02',
        '03/03', '04/03'
    ]

    const monthMap: Record<string, string> = {
        'JAN': '01', 'FEV': '02', 'MAR': '03', 'ABR': '04', 'MAI': '05', 'JUN': '06',
        'JUL': '07', 'AGO': '08', 'SET': '09', 'OUT': '10', 'NOV': '11', 'DEZ': '12'
    }

    const normalizeDate = (d: string) => {
        if (!d) return ''
        const parts = d.toUpperCase().split(/[\/\s.-]+/)
        if (parts.length < 2) return d

        let day = parts[0].padStart(2, '0')
        let month = parts[1]

        // Convert literal month to number
        if (isNaN(Number(month))) {
            // Try to match partial month name (e.g. JANEIRO -> JAN)
            const key = Object.keys(monthMap).find(k => month.startsWith(k))
            if (key) month = monthMap[key]
        } else {
            month = month.padStart(2, '0')
        }

        return `${day}/${month}`
    }

    const isFolgaDate = (dateStr: string) => {
        const norm = normalizeDate(dateStr)
        return folgaDatesRaw.includes(norm)
    }

    // Determine visible dates based on view
    const visibleDates = (view === 'CALIBRAGEM' || view === 'TENSIONAMENTO')
        ? dates.filter(d => isFolgaDate(d))
        : dates

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
            const isFolga = isFolgaDate(date)

            if (isActivityMachine && isFolga) {
                // Identificar as máquinas do grupo (FW ou HV) e a posição desta máquina na lista
                const groupPrefix = view === 'CALIBRAGEM' ? 'F-FWX' : 'F-HVE'
                const activityColor = view === 'CALIBRAGEM' ? 'bg-orange-600' : 'bg-purple-600'
                const activityLabel = view === 'CALIBRAGEM' ? 'Calibragem' : 'Tensionamento'
                const waiterColor = view === 'CALIBRAGEM' ? 'text-orange-200/40' : 'text-purple-200/40'

                // Need to filter group machines respecting the module filter too, to ensure correct split
                // Actually, logic was: split ALL machines of that type. 
                // But if we are only showing Module 5, should we consider only Module 5 machines?
                // Probably yes, for the split to make sense within the visible team.
                const groupMachines = data.filter(m => {
                    const mod = m.module || 'MODULO_2'
                    return (m as any).tag.startsWith(groupPrefix) && mod === selectedModule
                })
                const machineIndex = groupMachines.findIndex(m => (m as any).tag === tag)

                // Need to know WHICH folga of the pair this is (1st or 2nd)
                // Normalize date to check against sorted raw list
                const normDate = normalizeDate(date)
                // Find index in the raw list
                const folgaIndex = folgaDatesRaw.indexOf(normDate)

                // If it's an even index (0, 2, 4...) it is the 1st day of the pair. Odd is 2nd.
                const isDay1OfBlock = folgaIndex % 2 === 0

                // Regra: se tiver N máquinas, faz metade no dia 1 e metade no dia 2
                const count = groupMachines.length
                const splitPoint = Math.ceil(count / 2)

                const isMyTurn = isDay1OfBlock
                    ? machineIndex < splitPoint
                    : machineIndex >= splitPoint

                if (isMyTurn) {
                    return (
                        <div className={`w-full h-full flex flex-col items-center justify-center ${activityColor} text-white animate-pulse shadow-lg font-black italic`}>
                            <span className="text-[9px] uppercase tracking-tighter leading-none opacity-90">Executar</span>
                            <span className="text-[11px] font-bold">{activityLabel}</span>
                        </div>
                    )
                }

                return (
                    <div className={`w-full h-full flex items-center justify-center ${waiterColor}`}>
                        <span className="text-[10px] font-bold uppercase italic opacity-40">Aguardar</span>
                    </div>
                )
            }
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
                textClass = 'text-yellow-950'
                break
            case 'JUSTIFIED_EUNAMAN':
                containerClass = 'bg-red-500 shadow-md ring-1 ring-red-600'
                textClass = 'text-white'
                break
            case 'PENDING':
            default:
                containerClass = isGeral ? 'bg-slate-300 ring-2 ring-slate-400' : 'bg-slate-100'
                textClass = isGeral ? 'text-slate-900' : 'text-slate-600'
                break
        }

        return (
            <div
                onClick={() => toggleStatus(rowId, date, val)}
                className={`w-full h-full flex flex-col items-center justify-center transition-all cursor-pointer hover:brightness-110 active:scale-95 ${containerClass}`}
            >
                <div className="flex flex-col items-center">
                    <span className={`text-[13px] font-black leading-none ${textClass}`}>{val}</span>
                    <span className={`text-[9px] uppercase tracking-widest leading-none mt-0.5 font-bold opacity-90 ${textClass}`}>
                        {status === 'PENDING' ? (isGeral ? 'GERAL' : 'PARCIAL') :
                            status === 'DONE' ? 'FEITO' :
                                status === 'JUSTIFIED_SUZANO' ? 'J. SUZ' : 'J. EUN'}
                    </span>
                </div>
            </div>
        )
    }


    // Filter and Sort Data
    const filteredData = data
        .filter(row => {
            // Filter by selected module (defaulting to MODULO_2 for initial data if missing)
            const rowModule = row.module || 'MODULO_2'
            if (rowModule !== selectedModule) return false

            // View-specific filters
            if (view === 'TENSIONAMENTO') {
                // Exclude FW machines (Forwarders) from Tensionamento
                if (row.tag.toUpperCase().includes('FW')) return false
            }

            if (view === 'CALIBRAGEM') {
                // Exclude HV machines (Harvesters) from Calibragem
                if (row.tag.toUpperCase().includes('HV')) return false
            }

            return true
        })

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

            {/* Module Tabs (Primary Navigation) */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl border border-border-color w-fit">
                {[
                    { id: 'MODULO_2', label: 'Módulo 2' },
                    { id: 'MODULO_5', label: 'Módulo 5' },
                    { id: 'MODULO_7', label: 'Módulo 7' },
                    { id: 'CARREGAMENTO', label: 'Carregamento' },
                ].map(m => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedModule(m.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedModule === m.id
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-500 hover:text-foreground hover:bg-surface-highlight'
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Activity View Selector (Secondary) */}
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
                                    <span className="text-xs font-black uppercase text-gray-500 tracking-widest">TIPO / TAG / CB</span>
                                </th>
                                {visibleDates.map(date => (
                                    <th key={date} className={`px-2 py-3 text-center border-r border-border-color min-w-[70px] ${['24/01', '25/01', '31/01', '01/02', '07/02', '08/02'].includes(date) ? 'bg-orange-500/5' : ''
                                        }`}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-black text-foreground">{date.split(/[\/\s.-]/)[0]}</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{
                                                (date.includes('01') || date.toUpperCase().includes('JAN')) ? 'JAN' :
                                                    (date.includes('02') || date.toUpperCase().includes('FEV')) ? 'FEV' :
                                                        (date.includes('03') || date.toUpperCase().includes('MAR')) ? 'MAR' :
                                                            date.split(/[\/\s.-]/)[1] || ''
                                            }</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {filteredData.map(row => (
                                <tr key={row.id} className="hover:bg-surface-highlight/40 group">
                                    <td className="sticky left-0 z-10 bg-surface px-4 py-3 border-r border-border-color group-hover:bg-surface-highlight transition-colors">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-primary leading-none p-1.5 bg-primary/10 rounded-md">{row.type}</span>
                                                <span className="text-sm font-black text-foreground">{row.tag}</span>
                                            </div>
                                            {row.cb && (
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">CB: {row.cb}</span>
                                            )}
                                        </div>
                                    </td>
                                    {visibleDates.map(date => (
                                        <td key={date} className={`h-14 border-r border-border-color p-1 text-center transition-all hover:bg-primary/5 cursor-pointer relative ${['24/01', '25/01', '31/01', '01/02', '07/02', '08/02'].includes(date) ? 'bg-orange-500/5' : ''
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
