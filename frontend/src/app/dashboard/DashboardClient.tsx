'use client'

import { ArrowUpRight, ArrowDownRight, Activity, Wrench, AlertTriangle, CheckCircle2, Clock, FileText, Settings, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function DashboardClient({ metrics, chartData }: {
    metrics: {
        totalOS: number;
        osAbertas: number;
        osFechadas: number;
        disponibilidadeGlobal: string;
        mttr: string;
        mtbf: string
    },
    chartData: { placa: string; valor: number }[]
}) {
    return (
        <div className="space-y-8">
            {/* KPI Grid - Style: Clean Modern */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <ModernKpiCard
                    title="Total de OS"
                    value={metrics.totalOS}
                    sub="Clique para ver lista"
                    icon={FileText}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                />
                <ModernKpiCard
                    title="Em Andamento"
                    value={metrics.osAbertas}
                    sub="Clique para ver lista"
                    icon={Clock}
                    iconColor="text-yellow-600"
                    iconBg="bg-yellow-100 dark:bg-yellow-900/30"
                />
                <ModernKpiCard
                    title="OS Fechadas"
                    value={metrics.osFechadas}
                    sub="Clique para ver lista"
                    icon={CheckCircle2}
                    iconColor="text-green-600"
                    iconBg="bg-green-100 dark:bg-green-900/30"
                />
                <ModernKpiCard
                    title="Disponibilidade"
                    value={`${metrics.disponibilidadeGlobal}%`}
                    sub="Meta: ≥ 95%"
                    icon={Activity}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                    isSuccess={Number(metrics.disponibilidadeGlobal) >= 95}
                />
                <ModernKpiCard
                    title="MTTR"
                    value={`${metrics.mttr}h`}
                    sub="Tempo Médio Reparo"
                    icon={Wrench}
                    iconColor="text-purple-600"
                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                />
                <ModernKpiCard
                    title="MTBF"
                    value={`${metrics.mtbf}h`}
                    sub="Tempo Entre Falhas"
                    icon={Clock}
                    iconColor="text-indigo-600"
                    iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                />
                <div className="bg-surface border border-border-color p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Docs</p>
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-xl font-bold text-green-600">26</span>
                                <span className="text-xl font-bold text-yellow-500">2</span>
                                <span className="text-xl font-bold text-red-500">16</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">V / AV / Venc</p>
                        </div>
                        <div className={`p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600`}>
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="bg-surface border border-border-color rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h3 className="text-foreground text-lg font-bold">Disponibilidade por Veículo</h3>
                    <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">≥ 95%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">90-94%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            <span className="text-gray-600 dark:text-gray-400">&lt; 90%</span>
                        </div>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                                <XAxis
                                    dataKey="placa"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }}
                                    height={60}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11, fill: '#6B7280' }}
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="valor" radius={[4, 4, 0, 0]} animationDuration={1500}>
                                    {chartData.map((entry: { placa: string; valor: number }, index: number) => {
                                        let color = '#10B981'; // emerald-500
                                        if (entry.valor < 90) color = '#EF4444'; // red-500
                                        else if (entry.valor < 95) color = '#F59E0B'; // yellow-500

                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 bg-surface-highlight/10 rounded-lg">
                            <div className="text-center">
                                <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Sem dados de disponibilidade para exibir este mês.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ModernKpiCard({ title, value, sub, icon: Icon, iconColor, iconBg, isSuccess }: {
    title: string;
    value: string | number;
    sub: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    isSuccess?: boolean
}) {
    return (
        <div className="bg-surface border border-border-color p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-all hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 leading-snug">{title}</p>
                    <h3 className={`text-2xl font-bold text-foreground tracking-tight ${isSuccess ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{value}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 cursor-pointer hover:text-primary transition-colors">{sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} mb-2`}>
                    <Icon className="w-5 h-5 stroke-[2.5px]" />
                </div>
            </div>
        </div>
    )
}
