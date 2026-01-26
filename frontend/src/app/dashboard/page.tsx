import { getDashboardMetrics } from '../actions/dashboard-actions'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const { data } = await getDashboardMetrics()

    // Fallback if data fails
    const metrics = data?.kpis || { totalOS: 0, osAbertas: 0, osFechadas: 0, disponibilidadeGlobal: '0.0', mttr: '0.0', mtbf: '0.0' }
    const chartData = data?.chartData || []

    return <DashboardClient metrics={metrics} chartData={chartData} />
}
