'use server'

import { Perfil } from '@prisma/client'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- VEÍCULOS (BASE DE DADOS) ---
export async function getAdminVeiculos() {
    return await prisma.veiculo.findMany({
        orderBy: { codigoInterno: 'asc' },
        include: { unidade: true }
    })
}

// --- USUÁRIOS ---
export async function getAdminUsuarios() {
    return await prisma.usuario.findMany({
        orderBy: { nome: 'asc' },
        include: { empresaPadrao: true }
    })
}

export async function createUsuario(formData: FormData) {
    try {
        const nome = formData.get('nome') as string
        const email = formData.get('email') as string
        const perfil = formData.get('perfil') as Perfil

        await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: '123', // Senha padrão inicial
                perfil,
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
    const params = await prisma.systemParameter.findMany()

    // Lazy Seed
    if (params.length === 0) {
        const defaults = [
            { key: 'APP_NAME', value: 'Manut Pneus', group: 'GERAL', description: 'Nome da Aplicação' },
            { key: 'MAINTENANCE_MODE', value: 'false', group: 'GERAL', description: 'Modo Manutenção' },
            { key: 'NOTIFY_EMAIL', value: 'admin@eunaman.com', group: 'NOTIFICACAO', description: 'Email para Alertas' },
            { key: 'PREVENTIVA_TOLERANCIA', value: '50', group: 'PCM', description: 'Tolerância (h) para alerta' }
        ]

        for (const d of defaults) {
            await prisma.systemParameter.create({ data: d })
        }
        return await prisma.systemParameter.findMany()
    }

    return params
}

export async function updateSystemParam(formData: FormData) {
    try {
        const key = formData.get('key') as string
        const value = formData.get('value') as string

        await prisma.systemParameter.update({
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

        await prisma.usuario.update({
            where: { id },
            data: { nome, email, perfil }
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

        await prisma.veiculo.update({
            where: { id },
            data: { modelo, placa, codigoInterno }
        })
        revalidatePath('/dashboard/admin')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao atualizar veículo' }
    }
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
