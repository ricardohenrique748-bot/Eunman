import { getDashboardMetrics } from '../actions/dashboard-actions'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage(props: any) {
    const searchParams = props.searchParams
    const params = await searchParams
    console.log('[Page] RAW PROPS:', props)
    console.log('[Page] searchParams resolvidos:', params)

    // Robust extraction to handle strings or arrays
    const getVal = (key: string) => {
        const val = params[key]
        return Array.isArray(val) ? val[0] : val
    }

    const filters = {
        mes: getVal('mes') !== undefined ? Number(getVal('mes')) : undefined,
        ano: getVal('ano') !== undefined ? Number(getVal('ano')) : undefined,
        placa: getVal('placa'),
        status: getVal('status'),
        os: getVal('os'),
        tipo: getVal('tipo')
    }

    console.log('[Page] Filtros Aplicados:', filters)

    const { data } = await getDashboardMetrics(filters)

    // Fallback if data fails
    const metrics = data?.kpis || {
        totalOS: 0,
        osAbertas: 0,
        osFechadas: 0,
        disponibilidadeGlobal: '0.0',
        mttr: '0.0',
        mtbf: '0.0',
        docs: { valid: 0, attention: 0, expired: 0 }
    }
    const chartData = data?.chartData || []
    const preventiveData = data?.preventiveData || []
    const recentActivity = data?.recentActivity || []

    return <DashboardClient key={JSON.stringify(filters)} metrics={metrics} chartData={chartData} preventiveData={preventiveData} recentActivity={recentActivity} filters={filters} />
}
