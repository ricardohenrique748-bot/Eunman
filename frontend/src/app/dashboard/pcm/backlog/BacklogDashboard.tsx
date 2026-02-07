'use client'

import React from 'react'
import { BacklogItem } from '@/app/actions/backlog-actions'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Factory, Hammer } from 'lucide-react'

export default function BacklogDashboard({ data }: { data: BacklogItem[] }) {

    // Process Data
    const total = data.length
    const critical = data.filter(i => i.criticidade === 'CRITICO').length
    const pending = data.filter(i => i.status !== 'CONCLUIDO').length
    const completed = total - pending

    // Chart 1: By Type (Simplistic grouping)
    const typeCount = data.reduce((acc, item) => {
        const t = item.tipo || 'OUTROS'
        acc[t] = (acc[t] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }))

    // Chart 2: Status Distribution
    const statusData = [
        { name: 'Pendente', value: pending, color: '#f59e0b' },
        { name: 'Concluído', value: completed, color: '#10b981' },
    ]

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full custom-scrollbar">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-surface shadow-none border-border-color/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-surface shadow-none border-border-color/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Críticos</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{critical}</div>
                        <p className="text-xs text-muted-foreground">Itens de alta prioridade</p>
                    </CardContent>
                </Card>
                <Card className="bg-surface shadow-none border-border-color/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{completed}</div>
                        <p className="text-xs text-muted-foreground">Taxa de resolução: {total > 0 ? Math.round((completed / total) * 100) : 0}%</p>
                    </CardContent>
                </Card>
                <Card className="bg-surface shadow-none border-border-color/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Aberto</CardTitle>
                        <Hammer className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">{pending}</div>
                        <p className="text-xs text-muted-foreground">Work in progress</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
                <Card className="col-span-1 border-border-color">
                    <CardHeader>
                        <CardTitle>Por Tipo de Equipamento</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#adfa1d" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-border-color">
                    <CardHeader>
                        <CardTitle>Status Geral</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function ListChecks(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m3 17 2 2 4-4" />
            <path d="m3 7 2 2 4-4" />
            <path d="M13 6h8" />
            <path d="M13 12h8" />
            <path d="M13 18h8" />
        </svg>
    )
}
