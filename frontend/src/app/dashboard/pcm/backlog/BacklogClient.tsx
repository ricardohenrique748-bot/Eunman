'use client'

import { useState } from 'react'
import { LayoutDashboard, ListTodo, TableProperties, RefreshCw, FileSpreadsheet, Plus, FileUp, List, Search, Filter, X } from 'lucide-react'
import BacklogList from './BacklogList'
import BacklogDashboard from './BacklogDashboard'
import BacklogDetailed from './BacklogDetailed'
import { BacklogItem, importBacklogItems } from '@/app/actions/backlog-actions'
import * as XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import BacklogFormDialog from './BacklogFormDialog'
import ImportBacklogDialog from './ImportBacklogDialog'

export default function BacklogClient({ initialData }: { initialData: any[] }) {
    const [data, setData] = useState<BacklogItem[]>(initialData)
    const [view, setView] = useState<'LIST' | 'DASHBOARD' | 'DETAILED'>('LIST')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)


    const [editingItem, setEditingItem] = useState<BacklogItem | undefined>(undefined)

    // Filter State
    const [searchTerm, setSearchTerm] = useState('')
    const [filterMonth, setFilterMonth] = useState('')
    const [filterYear, setFilterYear] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    // Derived Data
    const filteredData = data.filter(item => {
        // Filter by Search (Plate/Frota)
        const matchesSearch = searchTerm === '' ||
            (item.frota?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.os?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

        // Filter by Month
        // Normalize item.mes to handle various formats if necessary, assuming exact match for now or index
        // If stored as "Janeiro", we match string. If number, we match number.
        // Let's assume text match for flexibility or try both.
        const matchesMonth = filterMonth === '' ||
            (item.mes?.toString().toLowerCase() === filterMonth.toLowerCase())

        // Filter by Year
        const matchesYear = filterYear === '' ||
            (item.ano?.toString() === filterYear)

        // Filter by Status
        const matchesStatus = filterStatus === '' ||
            (item.status === filterStatus)

        return matchesSearch && matchesMonth && matchesYear && matchesStatus
    })

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]
    const years = ["2023", "2024", "2025", "2026"]

    // Get unique statuses from data for the dropdown
    const statuses = Array.from(new Set(data.map(i => i.status).filter(Boolean) as string[])).sort()

    // Export to Excel
    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Backlog")
        XLSX.writeFile(workbook, `Backlog_PCM_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const handleEdit = (item: BacklogItem) => {
        setEditingItem(item)
        setIsCreateOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            // Optimistic update
            setData(prev => prev.filter(i => i.id !== id))
            // Server action (needs import)
            const { deleteBacklogItem } = await import('@/app/actions/backlog-actions')
            await deleteBacklogItem(id)
            // Revalidate happens on server, but we kept local state inconsistent if failed. 
            // Ideally we re-fetch or use router.refresh(), but for now optimistic is fine.
        }
    }

    const closeDialog = () => {
        setIsCreateOpen(false)
        setEditingItem(undefined)
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <ListTodo className="w-6 h-6 text-primary" />
                        Backlog PCM
                    </h2>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Gestão de Pendências e Planejamento
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-surface border border-border-color rounded-lg text-xs font-bold hover:bg-surface-highlight transition-colors"
                    >
                        <FileUp className="w-4 h-4 text-blue-500" />
                        Importar
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-surface border border-border-color rounded-lg text-xs font-bold hover:bg-surface-highlight transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        Excel
                    </button>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Item
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface border border-border-color p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Buscar Placa / OS</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            placeholder="Digite a placa, tag ou OS..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-highlight border border-border-color rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5 min-w-[140px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Mês</label>
                    <select
                        value={filterMonth}
                        onChange={e => setFilterMonth(e.target.value)}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        <option value="">Todos</option>
                        {months.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5 min-w-[100px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Ano</label>
                    <select
                        value={filterYear}
                        onChange={e => setFilterYear(e.target.value)}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        <option value="">Todos</option>
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5 min-w-[140px]">
                    <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Status</label>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full bg-surface-highlight border border-border-color rounded-xl px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        <option value="">Todos</option>
                        {statuses.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>


                <div className="border-l border-border-color h-10 mx-2 hidden md:block"></div>

                <div className="flex items-center gap-2 pb-2">
                    <div className="bg-gray-100 dark:bg-surface-highlight px-4 py-2 rounded-lg text-sm font-bold text-gray-600">
                        {filteredData.length} <span className="text-[10px] font-normal uppercase ml-1">Itens</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-surface p-1 rounded-xl border border-border-color w-fit">
                <button
                    onClick={() => setView('LIST')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'LIST' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-foreground hover:bg-surface-highlight'}`}
                >
                    <List className="w-4 h-4" />
                    Lista
                </button>
                <button
                    onClick={() => setView('DASHBOARD')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'DASHBOARD' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-foreground hover:bg-surface-highlight'}`}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </button>
                <button
                    onClick={() => setView('DETAILED')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'DETAILED' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-foreground hover:bg-surface-highlight'}`}
                >
                    <TableProperties className="w-4 h-4" />
                    Detalhado
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 bg-surface border border-border-color rounded-2xl overflow-hidden shadow-sm">
                {view === 'LIST' && <BacklogList data={filteredData} onEdit={handleEdit} onDelete={handleDelete} />}
                {view === 'DASHBOARD' && <BacklogDashboard data={filteredData} />}
                {view === 'DETAILED' && <BacklogDetailed data={filteredData} />}
            </div>

            {/* Dialogs */}
            {
                isCreateOpen && (
                    <BacklogFormDialog
                        isOpen={isCreateOpen}
                        onClose={() => setIsCreateOpen(false)}
                        onSuccess={() => window.location.reload()} // For simplicity, full reload or re-fetch via action
                    />
                )
            }
            <ImportBacklogDialog
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={() => window.location.reload()}
                onImport={async (items) => {
                    try {
                        const CHUNK_SIZE = 20 // Reduced chunk size to be safe
                        let successCount = 0
                        let duplicateCount = 0
                        const total = items.length

                        // Process in chunks
                        for (let i = 0; i < total; i += CHUNK_SIZE) {
                            const chunk = items.slice(i, i + CHUNK_SIZE)
                            const result = await importBacklogItems(chunk)

                            if (result.success) {
                                successCount += (result.count || 0)
                                duplicateCount += (result.duplicates || 0)
                            } else {
                                console.error('Chunk error:', result.error)
                                // If one chunk fails, we continue trying others? Or stop?
                                // Let's stop to prevent flooding errors if schema is wrong
                                throw new Error(result.error)
                            }
                        }

                        alert(`Processo concluído!\nImportados: ${successCount}\nDuplicados (Ignorados): ${duplicateCount}`)
                    } catch (error: any) {
                        console.error('Import error:', error)
                        alert('Erro durante a importação: ' + (error.message || 'Erro desconhecido'))
                        throw error
                    }
                }}
            />
        </div>
    )
}
