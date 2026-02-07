'use server'

import { getSession } from './auth-actions'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Define the interface manually since Prisma Client might not be updated
export interface BacklogItem {
    id: string
    semana: string | null
    mes: string | null
    ano: string | null
    dataEvidencia: Date | null
    modulo: string | null
    regiaoProgramacao: string | null
    diasPendenciaAberta: number | null
    frota: string | null
    tag: string | null
    tipo: string | null
    descricaoAtividade: string | null
    origem: string | null
    criticidade: string | null
    tempoExecucaoPrevisto: string | null
    campoBase: string | null
    os: string | null
    material: string | null
    numeroRc: string | null
    numeroOrdem: string | null
    fornecedor: string | null
    dataRc: Date | null
    detalhamentoPedido: string | null
    dataNecessidadeMaterial: Date | null
    tipoPedido: string | null
    previsaoMaterial: Date | null
    situacaoRc: string | null
    diasAberturaReqCompras: number | null
    dataProgramacao: Date | null
    maoDeObra: string | null
    deltaEvidenciaProgramacao: number | null
    statusProgramacao: string | null
    previsaoConclusaoPendencia: Date | null
    dataConclusaoPendencia: Date | null
    diasResolucaoPendencia: number | null
    status: string | null
    observacao: string | null
    createdAt: Date
    updatedAt: Date
}

// Helper to map raw result to proper casing
function mapRawToBacklog(row: any): BacklogItem {
    return {
        id: row.id,
        semana: row.semana,
        mes: row.mes,
        ano: row.ano,
        dataEvidencia: row.data_evidencia ? new Date(row.data_evidencia) : null,
        modulo: row.modulo,
        regiaoProgramacao: row.regiao_programacao,
        diasPendenciaAberta: row.dias_pendencia_aberta,
        frota: row.frota,
        tag: row.tag,
        tipo: row.tipo,
        descricaoAtividade: row.descricao_atividade,
        origem: row.origem,
        criticidade: row.criticidade,
        tempoExecucaoPrevisto: row.tempo_execucao_previsto,
        campoBase: row.campo_base,
        os: row.os,
        material: row.material,
        numeroRc: row.numero_rc,
        numeroOrdem: row.numero_ordem,
        fornecedor: row.fornecedor,
        dataRc: row.data_rc ? new Date(row.data_rc) : null,
        detalhamentoPedido: row.detalhamento_pedido,
        dataNecessidadeMaterial: row.data_necessidade_material ? new Date(row.data_necessidade_material) : null,
        tipoPedido: row.tipo_pedido,
        previsaoMaterial: row.previsao_material ? new Date(row.previsao_material) : null,
        situacaoRc: row.situacao_rc,
        diasAberturaReqCompras: row.dias_abertura_req_compras,
        dataProgramacao: row.data_programacao ? new Date(row.data_programacao) : null,
        maoDeObra: row.mao_de_obra,
        deltaEvidenciaProgramacao: row.delta_evidencia_programacao,
        statusProgramacao: row.status_programacao,
        previsaoConclusaoPendencia: row.previsao_conclusao_pendencia ? new Date(row.previsao_conclusao_pendencia) : null,
        dataConclusaoPendencia: row.data_conclusao_pendencia ? new Date(row.data_conclusao_pendencia) : null,
        diasResolucaoPendencia: row.dias_resolucao_pendencia,
        status: row.status,
        observacao: row.observacao,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
    }
}

export async function getBacklogItems(filters: any = {}) {
    const session = await getSession()
    if (!session) return { success: false, error: 'Não autenticado' }

    let whereClause = `WHERE 1=1`

    // Authorization Check (Standard logic from dashboard)
    // Assuming PCM can see everything, others might be restricted. For now, open to PCM/Admin.
    // If specific area restrictions are needed, add them here.

    if (filters.status && filters.status !== 'TODOS') {
        whereClause += ` AND status = '${filters.status}'`
    }

    if (filters.criticidade && filters.criticidade !== 'TODOS') {
        whereClause += ` AND criticidade = '${filters.criticidade}'`
    }

    if (filters.search) {
        const s = filters.search.toLowerCase()
        whereClause += ` AND (
            LOWER(frota) LIKE '%${s}%' OR 
            LOWER("descricao_atividade") LIKE '%${s}%' OR 
            LOWER("numero_rc") LIKE '%${s}%' OR 
            LOWER("numero_ordem") LIKE '%${s}%' 
        )`
    }

    const query = `SELECT * FROM "backlog_pcm" ${whereClause} ORDER BY "data_evidencia" DESC`

    try {
        // Use raw query
        const rawData = await prisma.$queryRawUnsafe(query)
        const data = (rawData as any[]).map(mapRawToBacklog)
        return { success: true, data }
    } catch (error) {
        console.error('Error fetching backlog:', error)
        return { success: false, error: 'Falha ao buscar backlog' }
    }
}

export async function createBacklogItem(data: Omit<BacklogItem, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
        // Construct INSERT statement dynamically
        const fields = [
            'semana', 'mes', 'ano', 'modulo', 'regiao_programacao', 'dias_pendencia_aberta',
            'frota', 'tag', 'tipo', 'descricao_atividade', 'origem', 'criticidade',
            'tempo_execucao_previsto', 'campo_base', 'os', 'material', 'numero_rc',
            'numero_ordem', 'fornecedor', 'detalhamento_pedido', 'tipo_pedido',
            'situacao_rc', 'dias_abertura_req_compras', 'mao_de_obra',
            'delta_evidencia_programacao', 'status_programacao', 'dias_resolucao_pendencia',
            'status', 'observacao'
        ]

        // Date fields need special handling for NULL
        const dateFields = [
            'data_evidencia', 'data_rc', 'data_necessidade_material', 'previsao_material',
            'data_programacao', 'previsao_conclusao_pendencia', 'data_conclusao_pendencia'
        ]

        const columns = [...fields, ...dateFields].map(f => `"${f}"`).join(', ')

        const values = [
            ...fields.map(f => {
                // Map camelBack to snake_case for access
                const camelKey = f.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) as keyof typeof data
                // Special mapping for keys that dont follow simple rule if any
                // Mapping back logic
                let val: any
                if (f === 'descricao_atividade') val = data.descricaoAtividade
                else if (f === 'regiao_programacao') val = data.regiaoProgramacao
                else if (f === 'dias_pendencia_aberta') val = data.diasPendenciaAberta
                else if (f === 'tempo_execucao_previsto') val = data.tempoExecucaoPrevisto
                else if (f === 'campo_base') val = data.campoBase
                else if (f === 'numero_rc') val = data.numeroRc
                else if (f === 'numero_ordem') val = data.numeroOrdem
                else if (f === 'detalhamento_pedido') val = data.detalhamentoPedido
                else if (f === 'tipo_pedido') val = data.tipoPedido
                else if (f === 'situacao_rc') val = data.situacaoRc
                else if (f === 'dias_abertura_req_compras') val = data.diasAberturaReqCompras
                else if (f === 'mao_de_obra') val = data.maoDeObra
                else if (f === 'delta_evidencia_programacao') val = data.deltaEvidenciaProgramacao
                else if (f === 'status_programacao') val = data.statusProgramacao
                else if (f === 'dias_resolucao_pendencia') val = data.diasResolucaoPendencia
                else val = data[f as keyof typeof data]

                if (val === undefined || val === null || val === '') return 'NULL'
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'` // Escape quotes
                return val
            }),
            ...dateFields.map(f => {
                let val: any
                if (f === 'data_evidencia') val = data.dataEvidencia
                else if (f === 'data_rc') val = data.dataRc
                else if (f === 'data_necessidade_material') val = data.dataNecessidadeMaterial
                else if (f === 'previsao_material') val = data.previsaoMaterial
                else if (f === 'data_programacao') val = data.dataProgramacao
                else if (f === 'previsao_conclusao_pendencia') val = data.previsaoConclusaoPendencia
                else if (f === 'data_conclusao_pendencia') val = data.dataConclusaoPendencia

                if (!val) return 'NULL'
                return `'${new Date(val).toISOString()}'`
            })
        ].join(', ')

        const query = `
            INSERT INTO "backlog_pcm" (id, created_at, updated_at, ${columns})
            VALUES (gen_random_uuid(), NOW(), NOW(), ${values})
        `

        await prisma.$executeRawUnsafe(query)
        revalidatePath('/dashboard/pcm/backlog')
        return { success: true }
    } catch (e: any) {
        console.error('Create error:', e)
        return { success: false, error: e.message }
    }
}

export async function updateBacklogItem(id: string, data: Partial<BacklogItem>) {
    try {
        const updates: string[] = []

        // Helper to add update chunk
        const add = (col: string, val: any, isDate = false) => {
            if (val === undefined) return
            if (val === null || val === '') {
                updates.push(`"${col}" = NULL`)
            } else if (isDate) {
                updates.push(`"${col}" = '${new Date(val).toISOString()}'`)
            } else if (typeof val === 'number') {
                updates.push(`"${col}" = ${val}`)
            } else {
                updates.push(`"${col}" = '${val.toString().replace(/'/g, "''")}'`)
            }
        }

        add('semana', data.semana)
        add('mes', data.mes)
        add('ano', data.ano)
        add('modulo', data.modulo)
        add('regiao_programacao', data.regiaoProgramacao)
        add('dias_pendencia_aberta', data.diasPendenciaAberta)
        add('frota', data.frota)
        add('tag', data.tag)
        add('tipo', data.tipo)
        add('descricao_atividade', data.descricaoAtividade)
        add('origem', data.origem)
        add('criticidade', data.criticidade)
        add('tempo_execucao_previsto', data.tempoExecucaoPrevisto)
        add('campo_base', data.campoBase)
        add('os', data.os)
        add('material', data.material)
        add('numero_rc', data.numeroRc)
        add('numero_ordem', data.numeroOrdem)
        add('fornecedor', data.fornecedor)
        add('detalhamento_pedido', data.detalhamentoPedido)
        add('tipo_pedido', data.tipoPedido)
        add('situacao_rc', data.situacaoRc)
        add('dias_abertura_req_compras', data.diasAberturaReqCompras)
        add('mao_de_obra', data.maoDeObra)
        add('delta_evidencia_programacao', data.deltaEvidenciaProgramacao)
        add('status_programacao', data.statusProgramacao)
        add('dias_resolucao_pendencia', data.diasResolucaoPendencia)
        add('status', data.status)
        add('observacao', data.observacao)

        // Dates
        add('data_evidencia', data.dataEvidencia, true)
        add('data_rc', data.dataRc, true)
        add('data_necessidade_material', data.dataNecessidadeMaterial, true)
        add('previsao_material', data.previsaoMaterial, true)
        add('data_programacao', data.dataProgramacao, true)
        add('previsao_conclusao_pendencia', data.previsaoConclusaoPendencia, true)
        add('data_conclusao_pendencia', data.dataConclusaoPendencia, true)

        if (updates.length === 0) return { success: true }

        updates.push(`"updated_at" = NOW()`)

        const query = `UPDATE "backlog_pcm" SET ${updates.join(', ')} WHERE id = '${id}'`

        await prisma.$executeRawUnsafe(query)
        revalidatePath('/dashboard/pcm/backlog')
        return { success: true }

    } catch (e: any) {
        console.error('Update error:', e)
        return { success: false, error: e.message }
    }
}

export async function deleteBacklogItem(id: string) {
    try {
        await prisma.$executeRawUnsafe(`DELETE FROM "backlog_pcm" WHERE id = '${id}'`)
        revalidatePath('/dashboard/pcm/backlog')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function importBacklogItems(items: Omit<BacklogItem, 'id' | 'createdAt' | 'updatedAt'>[]) {
    try {
        if (items.length === 0) return { success: true, count: 0 }

        const valuesList: string[] = []

        for (const data of items) {
            const fields = [
                'semana', 'mes', 'ano', 'modulo', 'regiao_programacao', 'dias_pendencia_aberta',
                'frota', 'tag', 'tipo', 'descricao_atividade', 'origem', 'criticidade',
                'tempo_execucao_previsto', 'campo_base', 'os', 'material', 'numero_rc',
                'numero_ordem', 'fornecedor', 'detalhamento_pedido', 'tipo_pedido',
                'situacao_rc', 'dias_abertura_req_compras', 'mao_de_obra',
                'delta_evidencia_programacao', 'status_programacao', 'dias_resolucao_pendencia',
                'status', 'observacao'
            ]

            const dateFields = [
                'data_evidencia', 'data_rc', 'data_necessidade_material', 'previsao_material',
                'data_programacao', 'previsao_conclusao_pendencia', 'data_conclusao_pendencia'
            ]

            const values = [
                ...fields.map(f => {
                    const camelKey = f.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) as keyof typeof data
                    let val: any
                    if (f === 'descricao_atividade') val = data.descricaoAtividade
                    else if (f === 'regiao_programacao') val = data.regiaoProgramacao
                    else if (f === 'dias_pendencia_aberta') val = data.diasPendenciaAberta
                    else if (f === 'tempo_execucao_previsto') val = data.tempoExecucaoPrevisto
                    else if (f === 'campo_base') val = data.campoBase
                    else if (f === 'numero_rc') val = data.numeroRc
                    else if (f === 'numero_ordem') val = data.numeroOrdem
                    else if (f === 'detalhamento_pedido') val = data.detalhamentoPedido
                    else if (f === 'tipo_pedido') val = data.tipoPedido
                    else if (f === 'situacao_rc') val = data.situacaoRc
                    else if (f === 'dias_abertura_req_compras') val = data.diasAberturaReqCompras
                    else if (f === 'mao_de_obra') val = data.maoDeObra
                    else if (f === 'delta_evidencia_programacao') val = data.deltaEvidenciaProgramacao
                    else if (f === 'status_programacao') val = data.statusProgramacao
                    else if (f === 'dias_resolucao_pendencia') val = data.diasResolucaoPendencia
                    else val = data[f as keyof typeof data]

                    if (val === undefined || val === null || val === '') return 'NULL'
                    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`
                    if (val instanceof Date) return `'${val.toISOString()}'` // Handle accidental dates in text fields
                    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'` // Fallback for objects
                    return val
                }),
                ...dateFields.map(f => {
                    let val: any
                    if (f === 'data_evidencia') val = data.dataEvidencia
                    else if (f === 'data_rc') val = data.dataRc
                    else if (f === 'data_necessidade_material') val = data.dataNecessidadeMaterial
                    else if (f === 'previsao_material') val = data.previsaoMaterial
                    else if (f === 'data_programacao') val = data.dataProgramacao
                    else if (f === 'previsao_conclusao_pendencia') val = data.previsaoConclusaoPendencia
                    else if (f === 'data_conclusao_pendencia') val = data.dataConclusaoPendencia

                    if (val === undefined || val === null || val === '') return 'NULL'
                    try {
                        const d = new Date(val)
                        if (isNaN(d.getTime())) return 'NULL'
                        return `'${d.toISOString()}'`
                    } catch {
                        return 'NULL'
                    }
                })
            ].join(', ')

            valuesList.push(`(gen_random_uuid(), NOW(), NOW(), ${values})`)
        }

        const fields = [
            'semana', 'mes', 'ano', 'modulo', 'regiao_programacao', 'dias_pendencia_aberta',
            'frota', 'tag', 'tipo', 'descricao_atividade', 'origem', 'criticidade',
            'tempo_execucao_previsto', 'campo_base', 'os', 'material', 'numero_rc',
            'numero_ordem', 'fornecedor', 'detalhamento_pedido', 'tipo_pedido',
            'situacao_rc', 'dias_abertura_req_compras', 'mao_de_obra',
            'delta_evidencia_programacao', 'status_programacao', 'dias_resolucao_pendencia',
            'status', 'observacao'
        ]
        const dateFields = [
            'data_evidencia', 'data_rc', 'data_necessidade_material', 'previsao_material',
            'data_programacao', 'previsao_conclusao_pendencia', 'data_conclusao_pendencia'
        ]
        const columns = [...fields, ...dateFields].map(f => `"${f}"`).join(', ')

        // Batch insert in chunks of 50 to avoid query string limit issues
        const CHUNK_SIZE = 50
        for (let i = 0; i < valuesList.length; i += CHUNK_SIZE) {
            const chunk = valuesList.slice(i, i + CHUNK_SIZE)
            const query = `
                INSERT INTO "backlog_pcm" (id, created_at, updated_at, ${columns})
                VALUES ${chunk.join(', ')}
            `
            await prisma.$executeRawUnsafe(query)
        }

        revalidatePath('/dashboard/pcm/backlog')
        return { success: true, count: items.length }
    } catch (e: any) {
        console.error('Import error:', e)
        return { success: false, error: e.message }
    }
}
