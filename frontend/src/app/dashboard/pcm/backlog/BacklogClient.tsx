'use client'

import { useState } from 'react'
import { LayoutDashboard, ListTodo, TableProperties, RefreshCw, FileSpreadsheet, Plus, FileUp, List } from 'lucide-react'
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
                {view === 'LIST' && <BacklogList data={data} />}
                {view === 'DASHBOARD' && <BacklogDashboard data={data} />}
                {view === 'DETAILED' && <BacklogDetailed data={data} />}
            </div>

            {/* Dialogs */}
            {isCreateOpen && (
                <BacklogFormDialog
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onSuccess={() => window.location.reload()} // For simplicity, full reload or re-fetch via action
                />
            )}
            <ImportBacklogDialog
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onSuccess={() => window.location.reload()}
                onImport={async (items) => {
                    try {
                        const CHUNK_SIZE = 20 // Reduced chunk size to be safe
                        let successCount = 0
                        const total = items.length

                        // Process in chunks
                        for (let i = 0; i < total; i += CHUNK_SIZE) {
                            const chunk = items.slice(i, i + CHUNK_SIZE)
                            const result = await importBacklogItems(chunk)

                            if (result.success) {
                                successCount += (result.count || 0)
                            } else {
                                console.error('Chunk error:', result.error)
                                // If one chunk fails, we continue trying others? Or stop?
                                // Let's stop to prevent flooding errors if schema is wrong
                                throw new Error(result.error)
                            }
                        }

                        alert(`Sucesso! ${successCount} itens foram importados.`)
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
