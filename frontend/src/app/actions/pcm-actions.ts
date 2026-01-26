'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getOrdensServico() {
    try {
        const os = await prisma.ordemServico.findMany({
            include: {
                veiculo: true
            },
            orderBy: {
                dataAbertura: 'desc'
            }
        })
        return { success: true, data: os }
    } catch (error) {
        console.error('Erro ao buscar OS:', error)
        return { success: false, error: 'Falha ao carregar OS' }
    }
}

export async function createOrdemServico(formData: FormData) {
    const veiculoId = formData.get('veiculoId') as string
    const tipoOS = formData.get('tipoOS') as any
    const descricao = formData.get('descricao') as string
    const prioridade = formData.get('prioridade') as string // Não estava no schema, mas vamos ignorar se não tiver

    if (!veiculoId || !descricao) {
        return { success: false, error: 'Campos obrigatórios faltando' }
    }

    try {
        await prisma.ordemServico.create({
            data: {
                veiculoId,
                tipoOS, // PREVENTIVA, CORRETIVA, etc
                status: 'ABERTA',
                descricao,
                origem: 'Manual',
            }
        })

        revalidatePath('/dashboard/pcm')
        return { success: true }
    } catch (error) {
        console.error('Erro ao criar OS:', error)
        return { success: false, error: 'Erro ao criar ordem de serviço' }
    }
}

export async function getVeiculosDropdown() {
    return await prisma.veiculo.findMany({
        select: { id: true, codigoInterno: true, modelo: true, placa: true },
        where: { status: { not: 'DESATIVADO' } }
    })
}
