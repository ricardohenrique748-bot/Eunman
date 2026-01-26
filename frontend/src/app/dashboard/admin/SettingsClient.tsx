'use client'

import { useState } from 'react'
import { Building2, Users, Database, Settings, Plus, X, Check, Save, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { createEmpresa, createUsuario, createUnidade, updateSystemParam, toggleUsuarioStatus, deleteUsuario, deleteVeiculo, deleteEmpresa, deleteUnidade, updateUsuario, updateVeiculo, updateEmpresa, updateUnidade, createOsMotivo, deleteOsMotivo, createOsSistema, deleteOsSistema, createOsSubSistema, deleteOsSubSistema } from '@/app/actions/admin-actions'

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

interface OsMotivo {
    id: string
    nome: string
    ativo: boolean
}

interface OsSubSistema {
    id: string
    nome: string
    sistemaId: string
    ativo: boolean
}

interface OsSistema {
    id: string
    nome: string
    ativo: boolean
    subSistemas: OsSubSistema[]
}

export default function SettingsClient({ veiculos, usuarios, empresas, systemParams, osOptions }: {
    veiculos: Veiculo[],
    usuarios: Usuario[],
    empresas: Empresa[],
    systemParams: SystemParam[],
    osOptions: { motivos: OsMotivo[], sistemas: OsSistema[] }
}) {
    const [activeTab, setActiveTab] = useState('database')
    const [showModal, setShowModal] = useState<string | null>(null) // 'user', 'company', 'unit'
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null)
    const [editItem, setEditItem] = useState<
        | { type: 'vehicle', data: Veiculo }
        | { type: 'user', data: Usuario }
        | { type: 'company', data: Empresa }
        | { type: 'unit', data: Unidade }
        | null
    >(null)

    const isAdmin = true;

    const handleNewUnit = (empresaId: string) => {
        setSelectedEmpresaId(empresaId)
        setShowModal('unit')
    }

    const handleDelete = async (type: string, id: string) => {
        if (!confirm('Deseja realmente excluir este item? Esta ação não pode ser desfeita.')) return

        if (type === 'vehicle') await deleteVeiculo(id)
        if (type === 'user') await deleteUsuario(id)
        if (type === 'company') await deleteEmpresa(id)
        if (type === 'unit') await deleteUnidade(id)
    }

    return (
        <div className="flex h-full w-full bg-[#f9fafb] overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 border-r border-border-color bg-white flex flex-col shrink-0">
                <div className="p-8">
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Painel Admin</h2>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Gestão e Governança</p>
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
            <div className="flex-1 overflow-auto bg-[#f9fafb] p-10 relative">
                {activeTab === 'database' && <DatabaseSection veiculos={veiculos} isAdmin={isAdmin} onDelete={handleDelete} onEdit={(type, data) => setEditItem({ type, data })} />}
                {activeTab === 'users' && <UsersSection usuarios={usuarios} onNew={() => setShowModal('user')} isAdmin={isAdmin} onDelete={handleDelete} onEdit={(type, data) => setEditItem({ type, data })} />}
                {activeTab === 'company' && <CompanySection empresas={empresas} onNew={() => setShowModal('company')} onNewUnit={handleNewUnit} isAdmin={isAdmin} onDelete={handleDelete} onEdit={(type, data) => setEditItem({ type: type as any, data: data as any })} />}
                {activeTab === 'system' && <SystemSection params={systemParams} osOptions={osOptions} isAdmin={isAdmin} />}
            </div>

            {/* Modais */}
            {(showModal || editItem) && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface border border-border-color p-8 rounded-xl shadow-2xl w-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">
                                {showModal === 'user' && 'Novo Usuário'}
                                {showModal === 'company' && 'Nova Empresa'}
                                {showModal === 'unit' && 'Nova Unidade Operacional'}
                                {editItem?.type === 'vehicle' && 'Editar Veículo'}
                                {editItem?.type === 'user' && 'Editar Usuário'}
                                {editItem?.type === 'company' && 'Editar Empresa'}
                                {editItem?.type === 'unit' && 'Editar Unidade'}
                            </h3>
                            <button onClick={() => { setShowModal(null); setEditItem(null); }} className="text-gray-500 hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Formulário de Criação (EXISTENTE) */}
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
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                                    <input name="senha" type="password" required defaultValue="123" className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
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

                        {/* Formulário de EDIÇÃO */}
                        {editItem?.type === 'vehicle' && (
                            <form action={async (formData) => {
                                await updateVeiculo(formData)
                                setEditItem(null)
                            }} className="space-y-5">
                                <input type="hidden" name="id" value={editItem.data.id} />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Código Interno</label>
                                    <input name="codigoInterno" defaultValue={editItem.data.codigoInterno} required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Modelo</label>
                                    <input name="modelo" defaultValue={editItem.data.modelo} required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Placa</label>
                                    <input name="placa" defaultValue={editItem.data.placa ?? ''} className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                </div>
                                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold">Atualizar Veículo</button>
                            </form>
                        )}

                        {editItem?.type === 'user' && (
                            <form action={async (formData) => {
                                await updateUsuario(formData)
                                setEditItem(null)
                            }} className="space-y-5">
                                <input type="hidden" name="id" value={editItem.data.id} />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                                    <input name="nome" defaultValue={editItem.data.nome} required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                                    <input name="email" type="email" defaultValue={editItem.data.email} required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Perfil</label>
                                    <select name="perfil" defaultValue={editItem.data.perfil} className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color">
                                        <option value="OPERACIONAL">OPERACIONAL</option>
                                        <option value="PCM">PCM</option>
                                        <option value="GESTOR">GESTOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha (deixe em branco para não alterar)</label>
                                    <input name="senha" type="password" className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                </div>
                                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold">Atualizar Usuário</button>
                            </form>
                        )}

                        {editItem?.type === 'company' && (
                            <form action={async (formData) => {
                                await updateEmpresa(formData)
                                setEditItem(null)
                            }} className="space-y-5">
                                <input type="hidden" name="id" value={editItem.data.id} />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome Fantasia</label>
                                    <input name="nomeFantasia" defaultValue={editItem.data.nomeFantasia} required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CNPJ</label>
                                    <input name="cnpj" defaultValue={editItem.data.cnpj} required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                </div>
                                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold">Atualizar Empresa</button>
                            </form>
                        )}

                        {editItem?.type === 'unit' && (
                            <form action={async (formData) => {
                                await updateUnidade(formData)
                                setEditItem(null)
                            }} className="space-y-5">
                                <input type="hidden" name="id" value={editItem.data.id} />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Unidade</label>
                                    <input name="nomeUnidade" defaultValue={editItem.data.nomeUnidade} required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
                                        <input name="cidade" defaultValue={editItem.data.cidade} required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">UF</label>
                                        <input name="estado" defaultValue={editItem.data.estado} maxLength={2} required className="w-full p-3 rounded-lg bg-surface-highlight border border-border-color uppercase" />
                                    </div>
                                </div>
                                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold">Atualizar Unidade</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function DatabaseSection({ veiculos, isAdmin, onDelete, onEdit }: { veiculos: Veiculo[], isAdmin: boolean, onDelete: (type: string, id: string) => void, onEdit: (type: 'vehicle', data: Veiculo) => void }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex justify-between items-center bg-white dark:bg-surface p-6 rounded-2xl border border-border-color shadow-sm">
                <div>
                    <h3 className="text-2xl font-bold text-foreground">Frota e Ativos</h3>
                    <p className="text-gray-500 text-sm mt-0.5 font-medium">Listagem técnica de todos os veículos operacionais.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="bg-gray-100 dark:bg-surface-highlight px-4 py-2 rounded-lg text-sm font-bold text-gray-600">
                        {veiculos.length} Veículos
                    </div>
                    {isAdmin && (
                        <button className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors">
                            <Plus className="w-4 h-4" /> Novo Ativo
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-surface border border-border-color rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-surface-highlight/50 text-gray-400 font-bold uppercase text-[11px] tracking-wider border-b border-border-color">
                        <tr>
                            <th className="px-6 py-4">Cód. Interno</th>
                            <th className="px-6 py-4">Modelo</th>
                            <th className="px-6 py-4">Placa</th>
                            <th className="px-6 py-4">Unidade</th>
                            <th className="px-6 py-4">Status</th>
                            {isAdmin && <th className="px-6 py-4 text-right">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {veiculos.map((v) => (
                            <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-surface-highlight/30 transition-colors group">
                                <td className="px-6 py-4 font-bold text-primary">{v.codigoInterno}</td>
                                <td className="px-6 py-4 font-medium text-foreground">{v.modelo}</td>
                                <td className="px-6 py-4 font-mono text-gray-500">{v.placa || '-'}</td>
                                <td className="px-6 py-4 text-gray-500">{v.unidade?.nomeUnidade || 'Não alocado'}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${v.status === 'DISPONIVEL' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                        {v.status}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => onEdit('vehicle', v)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => onDelete('vehicle', v.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function UsersSection({ usuarios, onNew, isAdmin, onDelete, onEdit }: { usuarios: Usuario[], onNew: () => void, isAdmin: boolean, onDelete: (type: string, id: string) => void, onEdit: (type: 'user', data: Usuario) => void }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-end border-b border-border-color pb-6">
                <div>
                    <h3 className="text-3xl font-black text-foreground">Usuários & Acesso</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Controle de credenciais e níveis de permissão.</p>
                </div>
                {isAdmin && (
                    <button onClick={onNew} className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-sm font-black flex items-center gap-2 shadow-xl shadow-orange-500/20 transition-all active:scale-95">
                        <Plus className="w-5 h-5" /> Novo Usuário
                    </button>
                )}
            </div>

            <div className="bg-surface border border-border-color rounded-2xl overflow-hidden shadow-sm border-t-4 border-t-primary">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-highlight/50 text-gray-500 font-bold uppercase text-[10px] tracking-widest border-b border-border-color">
                        <tr>
                            <th className="px-8 py-5">Colaborador</th>
                            <th className="px-8 py-5">Perfil</th>
                            <th className="px-8 py-5">Unidade / Empresa</th>
                            <th className="px-8 py-5">Status</th>
                            {isAdmin && <th className="px-8 py-5 text-right">Gerenciamento</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {usuarios.map((u) => (
                            <tr key={u.id} className="hover:bg-surface-highlight/30 transition-all group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center font-black text-lg shadow-md border-2 border-white/20">
                                            {u.nome.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-base leading-tight">{u.nome}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-1">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 font-mono text-[10px] font-black border border-blue-500/20">
                                        {u.perfil}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-gray-500 font-semibold text-sm">
                                    {u.empresaPadrao?.nomeFantasia || 'NÃO VINCULADO'}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-2.5 h-2.5 rounded-full ${u.ativo ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                                        <span className={`text-[11px] font-black uppercase ${u.ativo ? 'text-green-600' : 'text-red-500'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                                    </div>
                                </td>
                                {isAdmin && (
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                            <button onClick={() => onEdit('user', u)} title="Editar dados" className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <form action={async (formData) => {
                                                await toggleUsuarioStatus(u.id, u.ativo, formData)
                                            }}>
                                                <button title={u.ativo ? "Desativar" : "Ativar"} className={`p-2 rounded-lg border transition-all ${u.ativo ? 'text-orange-500 border-orange-200 hover:bg-orange-50' : 'text-green-500 border-green-200 hover:bg-green-50'}`}>
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            </form>
                                            <button onClick={() => onDelete('user', u.id)} title="Excluir Permanentemente" className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function CompanySection({ empresas, onNew, onNewUnit, isAdmin, onDelete, onEdit }: { empresas: Empresa[], onNew: () => void, onNewUnit: (id: string) => void, isAdmin: boolean, onDelete: (type: string, id: string) => void, onEdit: (type: 'company' | 'unit', data: Empresa | Unidade) => void }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex justify-between items-center bg-white dark:bg-surface p-6 rounded-2xl border border-border-color shadow-sm">
                <div>
                    <h3 className="text-2xl font-bold text-foreground">Estrutura de Empresas</h3>
                    <p className="text-gray-500 text-sm mt-0.5 font-medium">Gestão de matriz e unidades operacionais vinculadas.</p>
                </div>
                {isAdmin && (
                    <button onClick={onNew} className="bg-primary hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> Nova Empresa
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {empresas.map((e) => (
                    <div key={e.id} className="bg-white dark:bg-surface border border-border-color rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-border-color">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-surface-highlight border border-border-color rounded-xl">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                                        {e.nomeFantasia}
                                        <span className="text-[10px] bg-green-50 text-green-700 px-2 rounded border border-green-200 font-bold uppercase tracking-tight">Matriz</span>
                                    </h4>
                                    <p className="text-xs text-gray-400 font-medium">CNPJ: {e.cnpj} • {e.unidades.length} Unidades</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAdmin && (
                                    <div className="flex gap-1 mr-4 border-r border-border-color pr-4">
                                        <button onClick={() => onEdit('company', e)} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => onDelete('company', e.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                                <button onClick={() => onNewUnit(e.id)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Adicionar Filial
                                </button>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50/30 dark:bg-surface-highlight/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {e.unidades.length > 0 ? e.unidades.map((u) => (
                                    <div key={u.id} className="bg-white dark:bg-surface p-4 rounded-xl border border-border-color group hover:border-primary/50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <p className="font-bold text-foreground text-sm tracking-tight">{u.nomeUnidade}</p>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => onEdit('unit', u)} className="p-1 text-gray-400 hover:text-blue-500"><Edit className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => onDelete('unit', u.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-tight ml-4">{u.cidade} - {u.estado}</p>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-4 text-center">
                                        <p className="text-xs text-gray-400 font-medium italic">Nenhuma filial cadastrada nesta estrutura.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SystemSection({ params, osOptions, isAdmin }: { params: SystemParam[], osOptions: { motivos: OsMotivo[], sistemas: OsSistema[] }, isAdmin: boolean }) {
    const [activeSubTab, setActiveSubTab] = useState('parameters') // 'parameters', 'motivos', 'sistemas'

    // Group params
    const groups = Array.from(new Set(params.map(p => p.group)))

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-surface-highlight rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-border-color shadow-xl rotate-3">
                    <Settings className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-4xl font-black text-foreground tracking-tight">Parâmetros Mestre</h3>
                <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-sm font-medium leading-relaxed">
                    Configurações de infraestrutura e lógica computacional global.
                </p>
            </div>

            {/* Sub-Tabs Selector */}
            <div className="flex justify-center gap-2 mb-8 bg-surface-highlight/20 p-2 rounded-2xl w-fit mx-auto border border-border-color shadow-sm">
                <button
                    onClick={() => setActiveSubTab('parameters')}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'parameters' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-gray-400 hover:text-foreground hover:bg-surface-highlight'}`}
                >
                    Parâmetros Gerais
                </button>
                <button
                    onClick={() => setActiveSubTab('motivos')}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'motivos' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-gray-400 hover:text-foreground hover:bg-surface-highlight'}`}
                >
                    Motivos O.S.
                </button>
                <button
                    onClick={() => setActiveSubTab('sistemas')}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'sistemas' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-gray-400 hover:text-foreground hover:bg-surface-highlight'}`}
                >
                    Sistemas & Componentes
                </button>
            </div>

            {activeSubTab === 'parameters' && (
                <div className="space-y-12">
                    {groups.map(group => (
                        <div key={group} className="border border-border-color rounded-[2.5rem] overflow-hidden bg-surface shadow-xl border-t-[12px] border-t-primary">
                            <div className="bg-surface-highlight/30 px-10 py-6 border-b border-border-color flex justify-between items-center">
                                <h4 className="font-black text-sm text-gray-400 uppercase tracking-[0.3em]">{group} CONTROL GROUP</h4>
                                <Database className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="divide-y divide-border-color">
                                {params.filter(p => p.group === group).map(param => (
                                    <form key={param.id} action={async (formData) => {
                                        if (isAdmin) await updateSystemParam(formData)
                                    }} className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 hover:bg-surface-highlight/10 transition-all group/param">
                                        <input type="hidden" name="key" value={param.key} />
                                        <div className="flex-1">
                                            <p className="font-black text-xl text-foreground mb-1 tracking-tight group-hover/param:text-primary transition-colors">{param.description || param.key}</p>
                                            <p className="text-[10px] text-gray-400 font-black font-mono tracking-widest bg-surface-highlight inline-block px-2 py-0.5 rounded uppercase">{param.key}</p>
                                        </div>
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <input
                                                name="value"
                                                readOnly={!isAdmin}
                                                defaultValue={param.value}
                                                className={`bg-surface-highlight border-2 border-border-color rounded-2xl px-6 py-4 text-base w-full md:w-64 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-right font-black text-foreground shadow-inner transition-all ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            />
                                            {isAdmin && (
                                                <div className="flex gap-2">
                                                    <button title="Salvar Alteração" className="p-4 bg-primary text-white hover:bg-orange-600 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-110 active:scale-90">
                                                        <Save className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeSubTab === 'motivos' && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-surface border border-border-color rounded-3xl p-8 shadow-xl">
                        <h4 className="text-xl font-black text-foreground mb-6">Cadastrar Novo Motivo</h4>
                        <form action={async (formData) => {
                            await createOsMotivo(formData)
                        }} className="flex gap-4">
                            <input
                                name="nome"
                                placeholder="Ex: Manutenção Preventiva de 250h"
                                required
                                className="flex-1 bg-surface-highlight border border-border-color rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                            />
                            <button className="bg-primary hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-primary/20 transition-all">
                                Adicionar
                            </button>
                        </form>
                    </div>

                    <div className="bg-surface border border-border-color rounded-3xl p-8 shadow-xl">
                        <h4 className="text-xl font-black text-foreground mb-6">Motivos Ativos</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {osOptions.motivos.map(m => (
                                <div key={m.id} className="flex justify-between items-center bg-surface-highlight/30 p-4 rounded-2xl border border-border-color group hover:border-primary/50 transition-all">
                                    <span className="font-bold text-foreground">{m.nome}</span>
                                    <button
                                        onClick={() => deleteOsMotivo(m.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {osOptions.motivos.length === 0 && <p className="text-gray-500 italic col-span-full text-center py-4">Nenhum motivo cadastrado.</p>}
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'sistemas' && (
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="bg-surface border border-border-color rounded-3xl p-8 shadow-xl">
                        <h4 className="text-xl font-black text-foreground mb-6">Novo Sistema Operacional</h4>
                        <form action={async (formData) => {
                            await createOsSistema(formData)
                        }} className="flex gap-4">
                            <input
                                name="nome"
                                placeholder="Ex: Hidráulico, Motor, Transmissão"
                                required
                                className="flex-1 bg-surface-highlight border border-border-color rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                            />
                            <button className="bg-primary hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-primary/20 transition-all">
                                Adicionar Sistema
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        {osOptions.sistemas.map(s => (
                            <div key={s.id} className="bg-surface border border-border-color rounded-[2.5rem] overflow-hidden shadow-xl border-l-[10px] border-l-primary/40">
                                <div className="p-8 flex justify-between items-center border-b border-border-color bg-surface-highlight/10">
                                    <h5 className="text-2xl font-black text-foreground leading-none">{s.nome}</h5>
                                    <button
                                        onClick={() => deleteOsSistema(s.id)}
                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex gap-3">
                                        <form action={async (formData) => {
                                            await createOsSubSistema(formData)
                                        }} className="flex-1 flex gap-2">
                                            <input type="hidden" name="sistemaId" value={s.id} />
                                            <input
                                                name="nome"
                                                placeholder="Novo Sub-sistema / Componente"
                                                required
                                                className="flex-1 bg-surface-highlight/50 border border-border-color rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-bold"
                                            />
                                            <button className="bg-primary hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-black text-xs transition-all">
                                                Adicionar
                                            </button>
                                        </form>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {s.subSistemas.map(sub => (
                                            <div key={sub.id} className="flex justify-between items-center bg-surface-highlight/20 p-3 rounded-xl border border-border-color group/sub">
                                                <span className="text-sm font-semibold text-gray-500 group-hover/sub:text-foreground">{sub.nome}</span>
                                                <button
                                                    onClick={() => deleteOsSubSistema(sub.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover/sub:opacity-100 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function NavButton({ active, onClick, icon: Icon, label, description }: { active: boolean, onClick: () => void, icon: React.ElementType, label: string, description: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${active
                ? 'bg-white dark:bg-surface shadow-md border border-primary/20'
                : 'hover:bg-gray-100 dark:hover:bg-surface-highlight/30 border border-transparent'
                }`}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-lg transition-colors ${active ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-surface-highlight text-gray-400 group-hover:text-primary'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${active ? 'text-foreground' : 'text-gray-500 group-hover:text-foreground'}`}>{label}</p>
                    <p className="text-[10px] text-gray-400 font-medium group-hover:text-gray-500">{description}</p>
                </div>
            </div>
        </button>
    )
}
