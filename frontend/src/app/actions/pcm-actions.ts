'use server'

import { getSession } from './auth-actions'
import { TipoOS } from '@prisma/client'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getOrdensServico() {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        const where: any = {}
        if (session.perfil !== 'ADMIN') {
            where.veiculo = { unidadeId: session.unidadeId }
        }

        const os = await prisma.ordemServico.findMany({
            where,
            include: {
                veiculo: true
            },
            orderBy: {
                dataAbertura: 'desc'
            }
        })
        return { success: true, data: os }
    } catch (error) {
        // Reduzindo avisos de console em produção se necessário, mas mantendo para debug local
        return { success: false, error: 'Falha ao carregar OS' }
    }
}

export async function createOrdemServico(formData: FormData) {
    const veiculoId = formData.get('veiculoId') as string
    const tipoOS = formData.get('tipoOS') as TipoOS
    const descricao = formData.get('descricao') as string
    const status = (formData.get('status') as any) || 'ABERTA'
    const dataAberturaStr = formData.get('dataAbertura') as string

    const motivoId = formData.get('motivoId') as string || null
    const sistemaId = formData.get('sistemaId') as string || null
    const subSistemaId = formData.get('subSistemaId') as string || null

    if (!veiculoId || !descricao) {
        return { success: false, error: 'O veículo e a descrição são obrigatórios.' }
    }

    try {
        const dataAbertura = dataAberturaStr ? new Date(dataAberturaStr) : new Date()

        await prisma.ordemServico.create({
            data: {
                veiculoId,
                tipoOS,
                status: status as any,
                descricao,
                dataAbertura,
                origem: 'MANUAL',
                motivoId,
                sistemaId,
                subSistemaId
            }
        })

        revalidatePath('/dashboard/pcm/os')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao criar OS:', error)
        return { success: false, error: `Falha ao registrar O.S.: ${error.message}` }
    }
}

export async function getVeiculosDropdown() {
    const session = await getSession()
    if (!session) return []

    const where: any = { status: { not: 'DESATIVADO' } }
    if (session.perfil !== 'ADMIN') {
        where.unidadeId = session.unidadeId
    }

    return await prisma.veiculo.findMany({
        select: { id: true, codigoInterno: true, modelo: true, placa: true },
        where
    })
}
