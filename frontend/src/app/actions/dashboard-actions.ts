'use server'

import prisma from '@/lib/prisma'
import { differenceInHours, startOfMonth, endOfMonth, min } from 'date-fns'

export async function getDashboardMetrics() {
    try {
        const now = new Date()
        const firstDay = startOfMonth(now)
        const lastDay = endOfMonth(now)

        // 1. Fetch all OS for the current month
        const osList = await prisma.ordemServico.findMany({
            where: {
                dataAbertura: {
                    gte: firstDay,
                    lte: lastDay
                }
            },
            include: {
                veiculo: true
            }
        })

        // 2. Calculate KPI Counts
        const totalOS = osList.length
        const osAbertas = osList.filter(os => ['ABERTA', 'PLANEJADA', 'EM_EXECUCAO'].includes(os.status)).length
        const osFechadas = osList.filter(os => os.status === 'CONCLUIDA').length

        // 3. Calculate Availability per Vehicle (Simplified Logic)
        const veiculos = await prisma.veiculo.findMany({
            where: { status: { not: 'DESATIVADO' } },
            include: {
                os: {
                    where: {
                        dataAbertura: { gte: firstDay },
                        status: { in: ['CONCLUIDA', 'EM_EXECUCAO'] }
                    }
                }
            }
        })

        const totalHoursInMonth = differenceInHours(now, firstDay) // Hours passed so far in month

        const availabilityData = veiculos.map(v => {
            let totalDowntimeHours = 0

            v.os.forEach(os => {
                const start = new Date(os.dataAbertura)
                const end = os.dataConclusao ? new Date(os.dataConclusao) : now

                // Clamp end to now to avoid future downtime calculation issues
                const actualEnd = min([end, now])

                const hours = differenceInHours(actualEnd, start)
                if (hours > 0) totalDowntimeHours += hours
            })

            // Formula: (Total Time - Downtime) / Total Time
            // Default to 100% if no downtime
            // Prevent division by zero if month just started (totalHoursInMonth ~ 0)
            const availability = totalHoursInMonth > 0
                ? Math.max(0, ((totalHoursInMonth - totalDowntimeHours) / totalHoursInMonth) * 100)
                : 100

            return {
                placa: v.placa || v.modelo || v.codigoInterno || 'N/A',
                valor: Number(availability.toFixed(1))
            }
        }).sort((a, b) => a.valor - b.valor) // Sort by lowest availability first (critical ones)

        // 4. Calculate Global Availability
        const totalAvailability = availabilityData.length > 0
            ? availabilityData.reduce((acc, curr) => acc + curr.valor, 0) / availabilityData.length
            : 100

        // 5. Calculate MTTR (Mean Time To Repair) - Only CLOSED OS
        const closedOS = osList.filter(os => os.dataConclusao)
        let totalRepairHours = 0
        closedOS.forEach(os => {
            if (os.dataConclusao) {
                totalRepairHours += differenceInHours(new Date(os.dataConclusao), new Date(os.dataAbertura))
            }
        })
        const mttr = closedOS.length > 0 ? (totalRepairHours / closedOS.length).toFixed(1) : '0.0'


        return {
            success: true,
            data: {
                kpis: {
                    totalOS,
                    osAbertas,
                    osFechadas,
                    disponibilidadeGlobal: totalAvailability.toFixed(1),
                    mttr,
                    mtbf: '120.5' // Hardcoded for now as MTBF requires more complex historical data
                },
                chartData: availabilityData
            }
        }

    } catch (_) {
        return { success: false, error: 'Failed to fetch metrics' }
    }
}
