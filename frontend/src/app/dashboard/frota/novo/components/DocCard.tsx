'use client'

import { FileText } from 'lucide-react'
import { useState, useEffect } from 'react'

interface DocCardProps {
    title: string
    prefix: string
    defaultDate?: string
}

export function DocCard({ title, prefix, defaultDate }: DocCardProps) {
    const [validityDate, setValidityDate] = useState<string>(defaultDate || '')
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null)

    useEffect(() => {
        if (validityDate) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const [year, month, day] = validityDate.split('-').map(Number)
            const expiry = new Date(year, month - 1, day)
            expiry.setHours(0, 0, 0, 0)

            const diffTime = expiry.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setDaysRemaining(diffDays)
        } else {
            setDaysRemaining(null)
        }
    }, [validityDate])

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValidityDate(e.target.value)
    }

    const getStatusInfo = () => {
        if (daysRemaining === null) return { text: "", className: "hidden" }

        if (daysRemaining < 0) {
            return {
                text: `Vencido há ${Math.abs(daysRemaining)} dias`,
                className: "bg-red-500/10 text-red-600 border border-red-200"
            }
        }
        if (daysRemaining === 0) {
            return {
                text: "Vence hoje",
                className: "bg-orange-500/10 text-orange-600 border border-orange-200"
            }
        }
        if (daysRemaining <= 30) {
            return {
                text: `${daysRemaining} dias restantes`,
                className: "bg-yellow-500/10 text-yellow-600 border border-yellow-200"
            }
        }
        return {
            text: `${daysRemaining} dias restantes`,
            className: "bg-emerald-500/10 text-emerald-600 border border-emerald-200"
        }
    }

    const status = getStatusInfo()

    return (
        <div className="bg-surface border border-border-color rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {title}
                </h4>
                {status.className !== "hidden" && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.className}`}>
                        {status.text}
                    </span>
                )}
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Número do Documento</label>
                    <input
                        name={`${prefix}_numero`}
                        placeholder="Nº do documento"
                        className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-sm focus:border-primary outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Data de Expedição</label>
                        <input
                            name={`${prefix}_emissao`}
                            type="date"
                            className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-sm focus:border-primary outline-none text-gray-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Data de Validade</label>
                        <input
                            name={`${prefix}_validade`}
                            type="date"
                            value={validityDate}
                            onChange={handleDateChange}
                            className="w-full bg-surface-highlight border border-border-color rounded px-3 py-2 text-sm focus:border-primary outline-none text-gray-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
