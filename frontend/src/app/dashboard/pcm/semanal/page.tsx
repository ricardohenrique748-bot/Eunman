import { getVeiculosSemanal } from '@/app/actions/pcm-actions'
import SemanalClient from './SemanalClient'

export const dynamic = 'force-dynamic'

export default async function SemanalPage() {
    const data = await getVeiculosSemanal()

    return (
        <div className="h-[85vh] p-4">
            <SemanalClient initialData={data} />
        </div>
    )
}
