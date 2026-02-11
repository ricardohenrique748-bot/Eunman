'use server'

import { getSession } from './auth-actions'
import { TipoOS } from '@prisma/client'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getOrdensServico(filters: { status?: string, q?: string } = {}) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        const where: any = {}

        // Restricted to unit if not admin
        if (session.perfil !== 'ADMIN') {
            where.veiculo = { unidadeId: session.unidadeId }
        }

        // Status Filter
        if (filters.status && filters.status !== 'TODAS') {
            where.status = filters.status
        }

        // Search Query
        if (filters.q) {
            where.OR = [
                { veiculo: { placa: { contains: filters.q, mode: 'insensitive' } } },
                { veiculo: { codigoInterno: { contains: filters.q, mode: 'insensitive' } } },
                { descricao: { contains: filters.q, mode: 'insensitive' } }
            ]
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
    } catch (error: any) {
        console.error('[PCM] Error fetching OS:', error)
        return { success: false, error: 'Falha ao carregar OS' }
    }
}

export async function createOrdemServico(formData: FormData) {
    const veiculoId = formData.get('veiculoId') as string
    const tipoOS = formData.get('tipoOS') as TipoOS
    const descricao = formData.get('descricao') as string
    const status = (formData.get('status') as any) || 'ABERTA'
    const dataAberturaStr = formData.get('dataAbertura') as string

    const horimetro = Number(formData.get('horimetro')) || null
    const motivoId = formData.get('motivoId') as string || null
    const sistemaId = formData.get('sistemaId') as string || null
    const subSistemaId = formData.get('subSistemaId') as string || null

    if (!veiculoId || !descricao) {
        return { success: false, error: 'O veículo e a descrição são obrigatórios.' }
    }

    try {
        const dataAbertura = dataAberturaStr ? new Date(dataAberturaStr) : new Date()

        // Sync horimetro if provided
        if (horimetro) {
            await prisma.veiculo.update({
                where: { id: veiculoId },
                data: { horimetroAtual: horimetro }
            })
        }

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

export async function getVeiculosSemanal() {
    const session = await getSession()
    if (!session) return []

    // Use raw query to bypass client validation error if the schema wasn't regenerated
    let whereClause = `WHERE "status_operacional" != 'DESATIVADO'`

    if (session.perfil !== 'ADMIN' && session.perfil !== 'PCM') {
        whereClause += ` AND "unidade_id" = '${session.unidadeId}'`
    }

    const query = `
        SELECT 
            id, 
            "codigo_interno" as "codigoInterno", 
            placa, 
            modelo, 
            "tipo_veiculo" as "tipoVeiculo", 
            "status_operacional" as status, 
            "semana_preventiva" as "semanaPreventiva" 
        FROM "veiculos_frota" 
        ${whereClause} 
        ORDER BY "codigo_interno" ASC
    `

    try {
        const data = await prisma.$queryRawUnsafe(query)
        return data as any[]
    } catch (e) {
        console.error("Raw query failed, falling back to basic findMany (missing new field)", e)
        // Fallback: use normal prisma client but without the new field, so the page at least loads
        const where: any = { status: { not: 'DESATIVADO' } }
        if (session.perfil !== 'ADMIN' && session.perfil !== 'PCM') {
            where.unidadeId = session.unidadeId
        }

        const fallback = await prisma.veiculo.findMany({
            where,
            select: {
                id: true, codigoInterno: true, placa: true, modelo: true, tipoVeiculo: true, status: true
            },
            orderBy: { codigoInterno: 'asc' }
        })
        return fallback.map(v => ({ ...v, semanaPreventiva: null })) as any[]
    }
}

export async function updateSemanaPreventiva(
    veiculoId: string,
    semana: number | null,
    details?: {
        status?: string,
        progresso?: number,
        modulo?: string,
        descricao?: string,
        dataInicio?: string,
        dataFim?: string
    }
) {
    try {
        // Use raw execution to bypass client validation
        const valSemana = semana === null ? 'NULL' : semana

        // If details provided, update them too
        let updateFields = `"semana_preventiva" = ${valSemana}`

        if (details) {
            if (details.status !== undefined) updateFields += `, "prog_status" = '${details.status}'`
            if (details.progresso !== undefined) updateFields += `, "prog_progresso" = ${details.progresso}`
            if (details.modulo !== undefined) updateFields += `, "prog_modulo" = '${details.modulo}'`
            if (details.descricao !== undefined) updateFields += `, "prog_descricao" = '${details.descricao}'`
            if (details.dataInicio) updateFields += `, "prog_data_inicio" = '${details.dataInicio}'::timestamp`
            if (details.dataFim) updateFields += `, "prog_data_fim" = '${details.dataFim}'::timestamp`
        }

        // If removing from week (semana === null), maybe clear fields? Let's clear them for now.
        if (semana === null) {
            updateFields += `, "prog_status" = 'PENDENTE', "prog_progresso" = 0, "prog_modulo" = NULL, "prog_descricao" = NULL, "prog_data_inicio" = NULL, "prog_data_fim" = NULL`
        }

        await prisma.$executeRawUnsafe(`UPDATE "veiculos_frota" SET ${updateFields} WHERE id = '${veiculoId}'`)

        revalidatePath('/dashboard/pcm/semanal')
        return { success: true }
    } catch (error) {
        console.error('Error updating weekly schedule:', error)
        return { success: false, error: 'Failed to update schedule' }
    }
}

export async function deleteOrdemServico(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Não autenticado' }

        // Optional: Add permission check here if needed

        await prisma.ordemServico.delete({
            where: { id }
        })

        revalidatePath('/dashboard/pcm/os')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error: any) {
        console.error('[PCM Action] Erro ao excluir OS:', error)
        return { success: false, error: `Falha ao excluir O.S.: ${error.message}` }
    }
}
