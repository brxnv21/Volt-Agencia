import SuccessContent from './SuccessContent'

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const orderId = String(searchParams.order || 'N/A')
  const isDemo = String(searchParams.demo) === 'true'
  const value = Number(searchParams.value) || 0

  return <SuccessContent orderId={orderId} isDemo={isDemo} value={value} />
}
