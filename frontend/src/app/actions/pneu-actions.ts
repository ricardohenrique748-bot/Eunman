'use server'

import prisma from '@/lib/prisma'

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
                sulcoAtualMm: parseFloat(sulco),
                vida: 1
            }
        })
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao cadastrar pneu' }
    }
}
