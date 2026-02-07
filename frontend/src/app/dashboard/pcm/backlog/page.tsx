import BacklogClient from "./BacklogClient";
import { getBacklogItems } from "@/app/actions/backlog-actions";
export const dynamic = 'force-dynamic'

export default async function BacklogPage() {
    // Initial fetch
    const result = await getBacklogItems()
    const initialData = result.success ? (result.data || []) : []

    return <BacklogClient initialData={initialData} />
}
