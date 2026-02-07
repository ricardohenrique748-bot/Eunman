'use client'

import React, { useState } from 'react'
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ImportBacklogDialog({ isOpen, onClose, onSuccess, onImport }: Props & { onImport?: (items: any[]) => Promise<void> }) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const processExcel = async (file: File) => {
        return new Promise<any[]>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer)
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true })
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
                    resolve(jsonData)
                } catch (err) {
                    reject(err)
                }
            }
            reader.onerror = (err) => reject(err)
            reader.readAsArrayBuffer(file)
        })
    }

    const mapDataToBacklogItems = (data: any[]) => {
        return data.map(row => {
            // Helper to find key case-insensitively
            const get = (key: string) => {
                const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase())
                return foundKey ? row[foundKey] : null
            }

            return {
                semana: get('Semana')?.toString(),
                mes: get('Mês')?.toString() || get('Mes')?.toString(),
                ano: get('Ano')?.toString(),
                dataEvidencia: get('Data Evidência') || get('Data Evidencia'),
                modulo: get('Módulo')?.toString() || get('Modulo')?.toString(),
                regiaoProgramacao: get('Região Programação') || get('Regiao Programacao'),
                diasPendenciaAberta: Number(get('Dias Pendência Aberta') || get('Dias Pendencia Aberta') || 0),
                frota: get('Frota')?.toString(),
                tag: get('Tag')?.toString(),
                tipo: get('Tipo')?.toString(),
                descricaoAtividade: get('Descrição Atividade') || get('Descricao Atividade') || get('Descrição'),
                origem: get('Origem')?.toString(),
                criticidade: get('Criticidade')?.toString(),
                tempoExecucaoPrevisto: get('Tempo Execução Previsto') || get('Tempo Execucao Previsto'),
                campoBase: get('Campo Base')?.toString(),
                os: get('OS')?.toString() || get('Ordem de Serviço')?.toString(),
                material: get('Material')?.toString(),
                numeroRc: get('Número RC') || get('Numero RC'),
                numeroOrdem: get('Número Ordem') || get('Numero Ordem'),
                fornecedor: get('Fornecedor')?.toString(),
                dataRc: get('Data RC'),
                detalhamentoPedido: get('Detalhamento Pedido'),
                dataNecessidadeMaterial: get('Data Necessidade Material'),
                tipoPedido: get('Tipo Pedido'),
                previsaoMaterial: get('Previsão Material') || get('Previsao Material'),
                situacaoRc: get('Situação RC') || get('Situacao RC'),
                diasAberturaReqCompras: Number(get('Dias Abertura Req Compras') || 0),
                dataProgramacao: get('Data Programação') || get('Data Programacao'),
                maoDeObra: get('Mão de Obra') || get('Mao de Obra'),
                deltaEvidenciaProgramacao: Number(get('Delta Evidência Programação') || get('Delta Evidencia Programacao') || 0),
                statusProgramacao: get('Status Programação') || get('Status Programacao'),
                previsaoConclusaoPendencia: get('Previsão Conclusão Pendência') || get('Previsao Conclusao Pendencia'),
                dataConclusaoPendencia: get('Data Conclusão Pendência') || get('Data Conclusao Pendencia'),
                diasResolucaoPendencia: Number(get('Dias Resolução Pendência') || get('Dias Resolucao Pendencia') || 0),
                status: get('Status')?.toString(),
                observacao: get('Observação') || get('Observacao')
            }
        })
    }

    const handleImport = async () => {
        if (!file) return
        setUploading(true)

        try {
            // Emulate progress
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval)
                        return 90
                    }
                    return prev + 10
                })
            }, 100)

            let items: any[] = []
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const rawData = await processExcel(file)
                items = mapDataToBacklogItems(rawData)
            } else {
                // PDF import not supported yet
                alert('Importação de PDF requer processamento específico. Por favor use Excel.')
                setUploading(false)
                clearInterval(interval)
                return
            }

            clearInterval(interval)
            setProgress(100)

            if (onImport) {
                await onImport(items)
            } else {
                // Fallback for simulation
                await new Promise(r => setTimeout(r, 500))
            }

            setUploading(false)
            onSuccess()
            onClose()

        } catch (error) {
            console.error(error)
            alert('Erro ao processar arquivo.')
            setUploading(false)
            setProgress(0)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border-color w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-border-color flex justify-between items-center bg-surface-highlight/10">
                    <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                        Importar Backlog
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${file ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'} transition-colors`}>
                        {file ? <CheckCircle2 className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-foreground">
                            {file ? file.name : 'Selecione o arquivo Excel'}
                        </h4>
                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                            Arraste e solte ou clique para selecionar o arquivo de backlog (.xlsx) para importação.
                        </p>
                    </div>

                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />

                    {!file && (
                        <label
                            htmlFor="file-upload"
                            className="px-6 py-2 bg-surface text-foreground border border-border-color hover:bg-surface-highlight rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all"
                        >
                            Escolher Arquivo
                        </label>
                    )}

                    {uploading && (
                        <div className="w-full space-y-1">
                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                                <span>Processando...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border-color flex justify-end gap-2 bg-surface-highlight/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground hover:bg-surface-highlight rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || uploading}
                        className="px-6 py-2 text-xs font-black uppercase tracking-widest bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Importar Dados
                    </button>
                </div>
            </div>
        </div>
    )
}
