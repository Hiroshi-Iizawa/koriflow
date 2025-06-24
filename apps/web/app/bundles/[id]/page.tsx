import { BundleDetailClient } from "./bundle-detail-client"

interface BundleDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BundleDetailPage({ params }: BundleDetailPageProps) {
  const { id } = await params
  return <BundleDetailClient bundleId={id} />
}