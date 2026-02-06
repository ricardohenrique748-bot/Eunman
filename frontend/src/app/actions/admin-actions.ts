'use server'

import { Perfil } from '@prisma/client'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- VEÍCULOS (BASE DE DADOS) ---
import { getSession } from './auth-actions'

export async function getAdminVeiculos() {
    const session = await getSession()
    if (!session) return []

    const where: any = {}
    if (session.perfil !== 'ADMIN') {
        where.unidadeId = session.unidadeId
    }

    return await prisma.veiculo.findMany({
        where,
        orderBy: { codigoInterno: 'asc' },
        // @ts-ignore
        include: { unidade: true, documentos: true }
    })
}

export async function getAdminUsuarios() {
    const session = await getSession()
    if (!session) return []

    const where: any = {}
    if (session.perfil !== 'ADMIN') {
        where.unidadePadraoId = session.unidadeId
    }

    return await prisma.usuario.findMany({
        where,
        orderBy: { nome: 'asc' },
        include: { empresaPadrao: true, unidadePadrao: true }
    })
}

export async function createUsuario(formData: FormData) {
    try {
        const nome = formData.get('nome') as string
        const email = formData.get('email') as string
        const senha = formData.get('senha') as string || '123'
        const perfil = formData.get('perfil') as Perfil
        // @ts-ignore
        const area = formData.get('area') || 'GERAL'

        const unidadePadraoId = formData.get('unidadePadraoId') as string

        await prisma.usuario.create({
            data: {
                nome,
                email,
                senha,
                perfil,
                // @ts-ignore
                area: area,
                unidadePadraoId: unidadePadraoId !== '' ? unidadePadraoId : null,
                ativo: true
            }
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao criar usuário' }
    }
}

// --- EMPRESAS ---
export async function getAdminEmpresas() {
    return await prisma.empresa.findMany({
        include: {
            unidades: true
        }
    })
}

export async function createEmpresa(formData: FormData) {
    try {
        const nomeFantasia = formData.get('nomeFantasia') as string
        const cnpj = formData.get('cnpj') as string

        await prisma.empresa.create({
            data: {
                nomeFantasia,
                razaoSocial: nomeFantasia, // Simplificação
                cnpj
            }
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao criar empresa' }
    }
}

export async function createUnidade(formData: FormData) {
    try {
        const empresaId = formData.get('empresaId') as string
        const nomeUnidade = formData.get('nomeUnidade') as string
        const cidade = formData.get('cidade') as string
        const estado = formData.get('estado') as string

        await prisma.unidade.create({
            data: {
                empresaId,
                nomeUnidade,
                cidade,
                estado
            }
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao criar unidade' }
    }
}

// --- SYSTEM PARAMS ---
export async function getSystemParams() {
    const params = await prisma.systemParameters.findMany()

    // Lazy Seed
    if (params.length === 0) {
        const defaults = [
            { key: 'APP_NAME', value: 'Manut Pneus', group: 'GERAL', description: 'Nome da Aplicação' },
            { key: 'MAINTENANCE_MODE', value: 'false', group: 'GERAL', description: 'Modo Manutenção' },
            { key: 'NOTIFY_EMAIL', value: 'admin@eunaman.com', group: 'NOTIFICACAO', description: 'Email para Alertas' },
            { key: 'PREVENTIVA_TOLERANCIA', value: '50', group: 'PCM', description: 'Tolerância (h) para alerta' }
        ]

        for (const d of defaults) {
            await prisma.systemParameters.create({ data: d })
        }
        return await prisma.systemParameters.findMany()
    }

    return params
}

export async function updateSystemParam(formData: FormData) {
    try {
        const key = formData.get('key') as string
        const value = formData.get('value') as string

        await prisma.systemParameters.update({
            where: { key },
            data: { value }
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao atualizar parâmetro' }
    }
}

export async function toggleUsuarioStatus(id: string, currentStatus: boolean, _formData: FormData) {
    try {
        await prisma.usuario.update({
            where: { id },
            data: { ativo: !currentStatus }
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao alterar status' }
    }
}

export async function updateUsuario(formData: FormData) {
    try {
        const id = formData.get('id') as string
        const nome = formData.get('nome') as string
        const email = formData.get('email') as string
        const perfil = formData.get('perfil') as Perfil
        // @ts-ignore
        const area = formData.get('area')
        const senhaCandidate = formData.get('senha') as string
        const unidadePadraoId = formData.get('unidadePadraoId') as string

        const data: any = {
            nome,
            email,
            perfil,
            area,
            unidadePadraoId: unidadePadraoId !== '' ? unidadePadraoId : null
        }
        if (senhaCandidate && senhaCandidate.trim() !== '') {
            data.senha = senhaCandidate
        }

        await prisma.usuario.update({
            where: { id },
            data
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao atualizar usuário' }
    }
}

export async function updateVeiculo(formData: FormData) {
    try {
        const id = formData.get('id') as string
        const modelo = formData.get('modelo') as string
        const placa = formData.get('placa') as string
        const codigoInterno = formData.get('codigoInterno') as string
        const tipo = formData.get('tipo') as string
        const categoria = formData.get('categoria') as string
        const modulo = formData.get('modulo') as string
        const horimetro = parseInt(formData.get('horimetro') as string) || 0
        const dataAtualizacao = formData.get('dataAtualizacao') as string

        const docTypes = [
            { prefix: 'laudo', type: 'LAUDO_ELETROMECANICO' },
            { prefix: 'crlv', type: 'CRLV' },
            { prefix: 'implemento', type: 'IMPLEMENTO' },
            { prefix: 'tacografo', type: 'TACOGRAFO' },
            { prefix: 'civ', type: 'CIV_CIPP' }
        ]

        await prisma.$transaction(async (tx) => {
            // 1. Update Vehicle
            await tx.veiculo.update({
                where: { id },
                data: {
                    modelo,
                    placa,
                    codigoInterno,
                    tipoVeiculo: typeMap(tipo),
                    // @ts-ignore
                    categoria,
                    // @ts-ignore
                    moduloSistema: modulo,
                    horimetroAtual: horimetro,
                    dataAtualizacaoHorimetro: dataAtualizacao ? new Date(dataAtualizacao) : new Date()
                }
            })

            // 2. Handle Documents (Upsert per type)
            for (const d of docTypes) {
                const num = formData.get(`${d.prefix}_numero`) as string
                const emissao = formData.get(`${d.prefix}_emissao`) as string
                const validade = formData.get(`${d.prefix}_validade`) as string

                if (num) {
                    // @ts-ignore
                    await tx.documentoFrota.upsert({
                        where: {
                            veiculoId_tipo: {
                                veiculoId: id,
                                tipo: d.type
                            }
                        },
                        update: {
                            numero: num,
                            dataEmissao: emissao ? new Date(emissao) : null,
                            dataValidade: validade ? new Date(validade) : null
                        },
                        create: {
                            veiculoId: id,
                            tipo: d.type,
                            numero: num,
                            dataEmissao: emissao ? new Date(emissao) : null,
                            dataValidade: validade ? new Date(validade) : null
                        }
                    })
                }
            }
        })

        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (e: any) {
        console.error(e)
        return { success: false, error: 'Erro ao atualizar veículo: ' + e.message }
    }
}

function typeMap(val: string) {
    if (!val) return 'LEVE'
    const v = val.toUpperCase()
    if (v.includes('PESADO')) return 'PESADO'
    if (v.includes('MAQUINA')) return 'MAQUINA'
    return 'LEVE'
}

export async function updateEmpresa(formData: FormData) {
    try {
        const id = formData.get('id') as string
        const nomeFantasia = formData.get('nomeFantasia') as string
        const cnpj = formData.get('cnpj') as string

        await prisma.empresa.update({
            where: { id },
            data: { nomeFantasia, cnpj }
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao atualizar empresa' }
    }
}

export async function updateUnidade(formData: FormData) {
    try {
        const id = formData.get('id') as string
        const nomeUnidade = formData.get('nomeUnidade') as string
        const cidade = formData.get('cidade') as string
        const estado = formData.get('estado') as string

        await prisma.unidade.update({
            where: { id },
            data: { nomeUnidade, cidade, estado }
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao atualizar unidade' }
    }
}

export async function deleteUsuario(id: string) {
    try {
        await prisma.usuario.delete({ where: { id } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao excluir usuário' }
    }
}

export async function deleteVeiculo(id: string) {
    try {
        await prisma.veiculo.delete({ where: { id } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao excluir veículo' }
    }
}

export async function deleteEmpresa(id: string) {
    try {
        await prisma.empresa.delete({ where: { id } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao excluir empresa' }
    }
}

export async function deleteUnidade(id: string) {
    try {
        await prisma.unidade.delete({ where: { id } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao excluir unidade' }
    }
}
// --- OS OPTIONS ---

export async function getOsOptions() {
    try {
        const motivos = await prisma.osMotivo.findMany({
            orderBy: { nome: 'asc' }
        })
        const sistemas = await prisma.osSistema.findMany({
            orderBy: { nome: 'asc' },
            include: {
                subSistemas: {
                    orderBy: { nome: 'asc' }
                }
            }
        })
        return { motivos, sistemas }
    } catch (_) {
        return { motivos: [], sistemas: [] }
    }
}

export async function createOsMotivo(formData: FormData) {
    try {
        const nome = formData.get('nome') as string
        if (!nome) return { success: false }

        await prisma.osMotivo.create({ data: { nome } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false }
    }
}

export async function deleteOsMotivo(id: string) {
    try {
        await prisma.osMotivo.delete({ where: { id } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false }
    }
}

export async function createOsSistema(formData: FormData) {
    try {
        const nome = formData.get('nome') as string
        if (!nome) return { success: false, error: 'Nome obrigatório' }

        await prisma.osSistema.create({ data: { nome } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { success: false, error: 'Sistema já cadastrado' }
        }
        return { success: false, error: 'Erro ao criar sistema' }
    }
}

export async function deleteOsSistema(id: string) {
    try {
        await prisma.osSistema.delete({ where: { id } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false }
    }
}

export async function createOsSubSistema(formData: FormData) {
    try {
        const nome = formData.get('nome') as string
        const sistemaId = formData.get('sistemaId') as string
        if (!nome || !sistemaId) return { success: false, error: 'Dados incompletos' }

        await prisma.osSubSistema.create({ data: { nome, sistemaId } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { success: false, error: 'Componente já existe neste sistema' }
        }
        return { success: false, error: 'Erro ao criar componente' }
    }
}

export async function deleteOsSubSistema(id: string) {
    try {
        await prisma.osSubSistema.delete({ where: { id } })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false }
    }
}
