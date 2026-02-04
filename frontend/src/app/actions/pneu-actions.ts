'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getPneus() {
    return await prisma.pneu.findMany({
        include: {
            veiculo: true
        },
        orderBy: {
            codigoPneu: 'asc'
        }
    })
}

export async function createPneu(formData: FormData) {
    const codigoPneu = formData.get('codigoPneu') as string
    const medida = formData.get('medida') as string
    const marca = formData.get('marca') as string // Add to schema if needed, for now strict to schema
    const sulco = formData.get('sulco') as string
    const status = formData.get('status') as string

    try {
        await prisma.pneu.create({
            data: {
                codigoPneu,
                medida,
                status,
                sulcoAtualMm: parseFloat(sulco) || 0,
                vida: 1
            }
        })
        revalidatePath('/dashboard/pcm/pneus')
    } catch (error: any) {
        console.error('[PNEU] Create error:', error)
        return { success: false, error: 'Erro ao cadastrar pneu' }
    }

    redirect('/dashboard/pcm/pneus')
}

export async function createBoletimPneu(formData: FormData) {
    const veiculoId = formData.get('veiculoId') as string
    const data = formData.get('data') as string
    const km = parseInt(formData.get('km') as string) || 0
    const condicao = formData.get('condicao') as string
    const observacoes = formData.get('observacoes') as string

    if (!veiculoId || !data) {
        return { success: false, error: 'Campos obrigatórios faltando' }
    }

    const posicoes = ['DE', 'DD', 'TEI', 'TEE', 'TDI', 'TDE', 'TEI1', 'TEE1', 'TDI1', 'TDE1', 'ESTEPE']
    const itens: { posicao: string; sulcoMm: number }[] = []

    for (const pos of posicoes) {
        const sulco = formData.get(`sulco_${pos}`)
        if (sulco) {
            itens.push({
                posicao: pos,
                sulcoMm: parseFloat(sulco as string)
            })
        }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Find existing tires to link
            const pneusVeiculo = await tx.pneu.findMany({
                where: { veiculoAtualId: veiculoId }
            })

            const itensToCreate = itens.map(item => {
                const pneu = pneusVeiculo.find(p => p.posicao === item.posicao)
                return {
                    posicao: item.posicao,
                    sulcoMm: item.sulcoMm,
                    pneuId: pneu?.id
                }
            })

            await tx.boletimPneu.create({
                data: {
                    veiculoId,
                    data: new Date(data),
                    km,
                    condicao,
                    observacoes,
                    itens: {
                        create: itensToCreate
                    }
                }
            })

            // Update tires
            for (const item of itensToCreate) {
                if (item.pneuId) {
                    await tx.pneu.update({
                        where: { id: item.pneuId },
                        data: { sulcoAtualMm: item.sulcoMm }
                    })
                }
            }
        })
        revalidatePath('/dashboard/pcm/pneus')
        return { success: true }
    } catch (e: any) {
        console.error('[BOLETIM] Create error:', e)
        return { success: false, error: 'Erro ao salvar boletim: ' + e.message }
    }
}

export async function getBoletins() {
    return await prisma.boletimPneu.findMany({
        include: {
            veiculo: {
                select: {
                    placa: true,
                    codigoInterno: true,
                    modelo: true
                }
            },
            itens: true
        },
        orderBy: {
            data: 'desc'
        }
    })
}

export async function deleteBoletim(id: string) {
    try {
        await prisma.boletimPneu.delete({
            where: { id }
        })
        revalidatePath('/dashboard/pcm/pneus')
        return { success: true }
    } catch (error: any) {
        console.error('[BOLETIM] Delete error:', error)
        return { success: false, error: 'Erro ao excluir boletim' }
    }
}

export async function getBoletimById(id: string) {
    return await prisma.boletimPneu.findUnique({
        where: { id },
        include: {
            veiculo: true,
            itens: true
        }
    })
}

