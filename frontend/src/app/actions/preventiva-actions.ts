'use server'

import { StatusPreventiva } from '@prisma/client'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPreventiva(formData: FormData) {
    const veiculoId = formData.get('veiculoId') as string
    const tipo = formData.get('tipo') as string
    const modulo = formData.get('modulo') as string
    const ultimoHorimetro = Number(formData.get('ultimoHorimetro'))
    const horimetroAtual = Number(formData.get('horimetroAtual'))
    const intervalo = Number(formData.get('intervalo'))
    const dataAtualizacao = new Date(formData.get('dataAtualizacao') as string)

    if (!veiculoId || !tipo || !intervalo) {
        return { success: false, error: 'Campos obrigatórios faltando' }
    }

    try {
        // 1. Atualizar horímetro do veículo se fornecido
        if (horimetroAtual > 0) {
            await prisma.veiculo.update({
                where: { id: veiculoId },
                data: { horimetroAtual }
            })
        }

        // 2. Calcular Status Inicial
        // Se (Ultimo + Intervalo) < Atual -> Atrasado
        let status: StatusPreventiva = 'NO_PRAZO'
        if ((ultimoHorimetro + intervalo) < horimetroAtual) {
            status = 'ATRASADO'
        } else if ((ultimoHorimetro + intervalo) - horimetroAtual < 50) {
            status = 'ATENCAO' // Menos de 50h pra vencer
        }

        // 3. Criar Plano
        await prisma.planoManutencao.create({
            data: {
                veiculoId,
                tipo,
                modulo,
                ultimoHorimetro,
                intervalo,
                dataAtualizacao,
                status: status
            }
        })

        revalidatePath('/dashboard/pcm/preventivas')
        return { success: true }
    } catch (_) {
        return { success: false, error: 'Erro ao salvar dados' }
    }
}

export async function getVeiculosSimples() {
    return await prisma.veiculo.findMany({
        where: { status: { not: 'DESATIVADO' } },
        select: { id: true, modelo: true, placa: true, codigoInterno: true, horimetroAtual: true }
    })
}
