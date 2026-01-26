'use server'

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
        const perfil = formData.get('perfil') as any

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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
        return { success: false, error: 'Erro ao alterar status' }
    }
}
