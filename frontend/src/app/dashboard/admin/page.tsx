'use client'

import { useState } from 'react'
import { Building2, Users, Truck, Database, Settings, Search, Plus, Trash2, Edit } from 'lucide-react'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('database')

    return (
        <div className="flex h-[calc(100vh-120px)] bg-surface border border-border-color rounded-xl overflow-hidden shadow-sm">
            {/* Sidebar de Configurações */}
            <div className="w-64 border-r border-border-color bg-surface-highlight/5 flex flex-col">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-foreground">Configurações</h2>
                    <p className="text-xs text-gray-500 mt-1">Gestão global do sistema</p>
                </div>
                <nav className="flex-1 px-3 space-y-1">
                    <NavButton
                        active={activeTab === 'database'}
                        onClick={() => setActiveTab('database')}
                        icon={Database}
                        label="Base de Dados"
                    />
                    <NavButton
                        active={activeTab === 'users'}
                        onClick={() => setActiveTab('users')}
                        icon={Users}
                        label="Usuários & Acesso"
                    />
                    <NavButton
                        active={activeTab === 'company'}
                        onClick={() => setActiveTab('company')}
                        icon={Building2}
                        label="Empresa & Filiais"
                    />
                    <NavButton
                        active={activeTab === 'system'}
                        onClick={() => setActiveTab('system')}
                        icon={Settings}
                        label="Parâmetros do Sistema"
                    />
                </nav>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 overflow-auto bg-surface p-8">
                {activeTab === 'database' && <DatabaseSection />}
                {activeTab === 'users' && <div className="text-center text-gray-500 mt-20">Gestão de Usuários (Em Breve)</div>}
                {activeTab === 'company' && <div className="text-center text-gray-500 mt-20">Gestão de Empresas (Em Breve)</div>}
                {activeTab === 'system' && <div className="text-center text-gray-500 mt-20">Parâmetros (Em Breve)</div>}
            </div>
        </div>
    )
}

function NavButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                    ? 'bg-primary text-white shadow-lg shadow-orange-500/20'
                    : 'text-gray-500 hover:text-foreground hover:bg-surface-highlight'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    )
}

function DatabaseSection() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-border-color pb-6">
                <div>
                    <h3 className="text-2xl font-bold text-foreground">Base de Dados</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os registros mestres que alimentam o sistema.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-surface-highlight border border-border-color rounded-lg text-sm font-medium hover:text-foreground transition-colors flex items-center gap-2">
                        Importar CSV
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Novo Registro
                    </button>
                </div>
            </div>

            {/* Sumário */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Veículos Cadastrados" value="45" icon={Truck} color="text-blue-500" bg="bg-blue-500/10" />
                <StatCard title="Unidades Operacionais" value="3" icon={Building2} color="text-purple-500" bg="bg-purple-500/10" />
                <StatCard title="Usuários Ativos" value="12" icon={Users} color="text-green-500" bg="bg-green-500/10" />
            </div>

            {/* Lista Exemplo - Veículos */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        Frota Principal (Exemplo)
                    </h4>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input placeholder="Buscar registro..." className="pl-9 pr-4 py-2 bg-surface-highlight border border-border-color rounded-lg text-sm focus:outline-none focus:border-primary w-64" />
                    </div>
                </div>

                <div className="bg-surface border border-border-color rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-surface-highlight text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Código</th>
                                <th className="px-6 py-3">Modelo</th>
                                <th className="px-6 py-3">Placa</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            <TableRow code="V-01" model="Volvo FH 540" plate="ROG-1122" status="Ativo" />
                            <TableRow code="V-02" model="Scania R450" plate="BRA-2E19" status="Ativo" />
                            <TableRow code="E-01" model="CAT 320D" plate="N/A" status="Manutenção" />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="p-5 bg-surface border border-border-color rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors">
            <div className={`p-3 rounded-lg ${bg} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    )
}

function TableRow({ code, model, plate, status }: any) {
    return (
        <tr className="hover:bg-surface-highlight/50 transition-colors">
            <td className="px-6 py-4 font-medium text-foreground">{code}</td>
            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{model}</td>
            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{plate}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${status === 'Ativo' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button className="p-1.5 hover:bg-blue-500/10 rounded text-blue-500 transition-colors"><Edit className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-red-500/10 rounded text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </td>
        </tr>
    )
}
