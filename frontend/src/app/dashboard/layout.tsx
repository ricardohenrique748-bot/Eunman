import { getSession } from '@/app/actions/auth-actions'
import DashboardShell from './DashboardShell'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession()

    if (!session) {
        redirect('/')
    }

    return (
        <DashboardShell user={session}>
            {children}
        </DashboardShell>
    )
}

