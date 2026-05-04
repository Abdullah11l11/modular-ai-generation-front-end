import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { PlaceholderPanel } from '@/components/ui/PlaceholderPanel'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Not found" />
      <PlaceholderPanel title="Missing route">
        <Link className="text-teal-700" to="/">
          Return home
        </Link>
      </PlaceholderPanel>
    </>
  )
}
