'use client'

import { useState } from 'react'
import { Building2, Users, Database, Settings, Plus, X, Check, Save, AlertTriangle } from 'lucide-react'
import { createEmpresa, createUsuario, createUnidade, updateSystemParam, toggleUsuarioStatus } from '@/app/actions/admin-actions'

interface Veiculo {
    id: string
    codigoInterno: string
    modelo: string
    placa?: string | null
    status: string
    unidade?: { nomeUnidade: string } | null
}

interface Usuario {
    id: string
    nome: string
    email: string
    perfil: string
    ativo: boolean
    empresaPadrao?: { nomeFantasia: string } | null
}

interface Unidade {
    id: string
    nomeUnidade: string
    cidade: string
    estado: string
}

interface Empresa {
    id: string
    nomeFantasia: string
    cnpj: string
    unidades: Unidade[]
}

interface SystemParam {
    id: string
    key: string
    value: string
    description: string | null
    group: string
}

export default function SettingsClient({ veiculos, usuarios, empresas, systemParams }: {
    veiculos: Veiculo[],
    usuarios: Usuario[],
    empresas: Empresa[],
    systemParams: SystemParam[]
}) {
    const [activeTab, setActiveTab] = useState('database')
    const [showModal, setShowModal] = useState<string | null>(null) // 'user', 'company', 'unit'
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null)

    const handleNewUnit = (empresaId: string) => {
        setSelectedEmpresaId(empresaId)
        setShowModal('unit')
    }

    return (
        <div className="flex h-[calc(100vh-120px)] bg-surface border border-border-color rounded-xl overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-72 border-r border-border-color bg-surface-highlight/5 flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-foreground">Configurações</h2>
                    <p className="text-sm text-gray-500 mt-1">Gestão global do sistema</p>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    <NavButton active={activeTab === 'database'} onClick={() => setActiveTab('database')} icon={Database} label="Base de Dados" description="Frota e Ativos" />
                    <NavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="Usuários & Acesso" description="Permissões e Logins" />
                    <NavButton active={activeTab === 'company'} onClick={() => setActiveTab('company')} icon={Building2} label="Empresa & Filiais" description="Estrutura Organizacional" />
                    <NavButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={Settings} label="Parâmetros do Sistema" description="Regras de Negócio" />
                </nav>
                <div className="p-4 border-t border-border-color">
                    <div className="bg-blue-500/10 rounded-lg p-3 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Alterações aqui impactam todo o sistema. Proceda com cautela.
                        </p>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-auto bg-surface p-10 relative">
                {activeTab === 'database' && <DatabaseSection veiculos={veiculos} />}
                {activeTab === 'users' && <UsersSection usuarios={usuarios} onNew={() => setShowModal('user')} />}
                {activeTab === 'company' && <CompanySection empresas={empresas} onNew={() => setShowModal('company')} onNewUnit={handleNewUnit} />}
                {activeTab === 'system' && <SystemSection params={systemParams} />}
            </div>

            {/* Modais */}
            {showModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface border border-border-color p-8 rounded-xl shadow-2xl w-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">
                                {showModal === 'user' && 'Novo Usuário'}
                                {showModal === 'company' && 'Nova Empresa'}
                                {showModal === 'unit' && 'Nova Unidade Operacional'}
                            </h3>
                            <button onClick={() => setShowModal(null)} className="text-gray-500 hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>

                        {showModal === 'user' && (
                            <form action={async (formData) => {
                                await createUsuario(formData)
                                setShowModal(null)
                            }} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                                    <input name="nome" required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endereço de E-mail</label>
                                    <input name="email" required type="email" className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Perfil de Acesso</label>
                                    <select name="perfil" className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                                        <option value="OPERACIONAL">Operacional (Básico)</option>
                                        <option value="PCM">PCM (Planejamento)</option>
                                        <option value="GESTOR">Gestor de Frota</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>
                                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20">Salvar Usuário</button>
                            </form>
                        )}

                        {showModal === 'company' && (
                            <form action={async (formData) => {
                                await createEmpresa(formData)
                                setShowModal(null)
                            }} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome Fantasia</label>
                                    <input name="nomeFantasia" required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ</label>
                                    <input name="cnpj" required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20">Salvar Empresa</button>
                            </form>
                        )}

                        {showModal === 'unit' && selectedEmpresaId && (
                            <form action={async (formData) => {
                                await createUnidade(formData)
                                setShowModal(null)
                            }} className="space-y-5">
                                <input type="hidden" name="empresaId" value={selectedEmpresaId} />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Unidade</label>
                                    <input name="nomeUnidade" placeholder="Ex: Matriz, Filial Norte" required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
                                        <input name="cidade" required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">UF</label>
                                        <input name="estado" maxLength={2} placeholder="Ex: SP" required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all uppercase" />
                                    </div>
                                </div>
                                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20">Criar Unidade</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function DatabaseSection({ veiculos }: { veiculos: Veiculo[] }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-border-color pb-6">
                <div>
                    <h3 className="text-3xl font-bold text-foreground">Base de Dados</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Visão geral dos ativos cadastrados.</p>
                </div>
                <div className="bg-surface-highlight px-4 py-2 rounded-lg border border-border-color text-sm">
                    Total: <span className="font-bold text-foreground">{veiculos.length}</span> veículos
                </div>
            </div>

            <div className="bg-surface border border-border-color rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-highlight text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Código</th>
                            <th className="px-6 py-4">Modelo / Fabricante</th>
                            <th className="px-6 py-4">Placa</th>
                            <th className="px-6 py-4">Unidade</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {veiculos.map((v) => (
                            <tr key={v.id} className="hover:bg-surface-highlight/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-primary">{v.codigoInterno}</td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{v.modelo}</td>
                                <td className="px-6 py-4"><span className="font-mono bg-surface-highlight px-2 py-1 rounded border border-border-color/50">{v.placa || '-'}</span></td>
                                <td className="px-6 py-4 text-gray-500">{v.unidade?.nomeUnidade || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${v.status === 'DISPONIVEL' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {v.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function UsersSection({ usuarios, onNew }: { usuarios: Usuario[], onNew: () => void }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-border-color pb-6">
                <div>
                    <h3 className="text-3xl font-bold text-foreground">Usuários</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie quem tem acesso ao sistema e seus níveis.</p>
                </div>
                <button onClick={onNew} className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Adicionar Usuário
                </button>
            </div>

            <div className="bg-surface border border-border-color rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-highlight text-gray-500 font-medium border-b border-border-color">
                        <tr>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Perfil</th>
                            <th className="px-6 py-4">Empresa Padrão</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {usuarios.map((u) => (
                            <tr key={u.id} className="hover:bg-surface-highlight/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold">
                                            {u.nome.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{u.nome}</p>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-mono text-xs font-bold dark:bg-blue-900/30 dark:text-blue-300">
                                        {u.perfil}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {u.empresaPadrao?.nomeFantasia || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {u.ativo ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                                        <span className={`text-sm ${u.ativo ? 'text-green-600' : 'text-red-500'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <form action={async (formData) => {
                                        await toggleUsuarioStatus(u.id, u.ativo, formData)
                                    }}>
                                        <button className={`p-2 rounded-lg transition-colors ${u.ativo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                                            {u.ativo ? 'Desativar' : 'Ativar'}
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function CompanySection({ empresas, onNew, onNewUnit }: { empresas: Empresa[], onNew: () => void, onNewUnit: (id: string) => void }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-border-color pb-6">
                <div>
                    <h3 className="text-3xl font-bold text-foreground">Empresas & Filiais</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Estrutura organizacional multi-empresa.</p>
                </div>
                <button onClick={onNew} className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                    <Plus className="w-5 h-5" /> Nova Empresa
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {empresas.map((e) => (
                    <div key={e.id} className="border border-border-color rounded-xl overflow-hidden bg-surface shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-surface-highlight/30 p-6 border-b border-border-color flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-surface border border-border-color rounded-lg">
                                    <Building2 className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-foreground flex items-center gap-2">
                                        {e.nomeFantasia}
                                        <span className="text-[10px] uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold tracking-wide">Matriz</span>
                                    </h4>
                                    <p className="text-sm text-gray-500 font-mono mt-1">{e.cnpj}</p>
                                </div>
                            </div>
                            <button onClick={() => onNewUnit(e.id)} className="text-sm border border-border-color  bg-surface hover:bg-surface-highlight text-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> Adicionar Unidade/Filial
                            </button>
                        </div>
                        <div className="p-6">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Database className="w-3 h-3" />
                                Unidades Operacionais Vinculadas
                            </h5>
                            {e.unidades.length > 0 ? (
                                <div className="grid grid-cols-1 md::grid-cols-2 lg:grid-cols-3 gap-4">
                                    {e.unidades.map((u) => (
                                        <div key={u.id} className="p-4 border border-border-color rounded-lg text-sm flex items-start gap-3 bg-surface-highlight/10 hover:border-primary/30 transition-colors group cursor-default">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-shadow"></div>
                                            <div>
                                                <p className="font-bold text-foreground">{u.nomeUnidade}</p>
                                                <span className="text-gray-500 text-xs">{u.cidade} - {u.estado}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Nenhuma filial cadastrada.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SystemSection({ params }: { params: SystemParam[] }) {
    // Group params
    const groups = Array.from(new Set(params.map(p => p.group)))

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mx-auto mb-4 border border-border-color">
                    <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Parâmetros do Sistema</h3>
                <p className="text-gray-500 max-w-lg mx-auto mt-2 text-sm">
                    Ajuste o comportamento global da plataforma. Estas configurações afetam todos os usuários e módulos.
                </p>
            </div>

            {groups.map(group => (
                <div key={group} className="border border-border-color rounded-xl overflow-hidden bg-surface shadow-sm">
                    <div className="bg-surface-highlight/30 px-6 py-3 border-b border-border-color">
                        <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider">{group}</h4>
                    </div>
                    <div className="divide-y divide-border-color">
                        {params.filter(p => p.group === group).map(param => (
                            <form key={param.id} action={async (formData) => {
                                await updateSystemParam(formData)
                            }} className="p-6 flex items-center justify-between gap-8 hover:bg-surface-highlight/5 transition-colors">
                                <input type="hidden" name="key" value={param.key} />
                                <div className="flex-1">
                                    <p className="font-bold text-foreground mb-1">{param.description || param.key}</p>
                                    <p className="text-xs text-gray-400 font-mono">{param.key}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        name="value"
                                        defaultValue={param.value}
                                        className="bg-surface border border-border-color rounded px-3 py-1.5 text-sm w-48 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-right font-mono text-gray-600"
                                    />
                                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                        <Save className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

function NavButton({ active, onClick, icon: Icon, label, description }: { active: boolean, onClick: () => void, icon: React.ElementType, label: string, description: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${active
                ? 'bg-surface shadow border border-primary/20'
                : 'hover:bg-surface-highlight/50 border border-transparent'
                }`}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-primary text-white' : 'bg-surface-highlight text-gray-400 group-hover:text-foreground'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className={`text-sm font-bold ${active ? 'text-foreground' : 'text-gray-600 group-hover:text-foreground'}`}>{label}</p>
                    <p className="text-[10px] text-gray-400">{description}</p>
                </div>
            </div>
        </button>
    )
}
