import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ViewPageClient from './ViewPageClient'
import axios from 'axios'

export default async function ViewPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const cookieStore = cookies()
  const session = cookieStore.get('accessToken')

  // Redirect if not authenticated
  if (!session) {
    redirect('/login')
  }

  try {
    // Server-side data fetching
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER}/api/v1/invoice/invoices/${params.id}`, {
        headers: {
          Authorization: `Bearer ${session.value}`,
        },
      }
    )

    const invoiceItem = response.data
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/share/${params.id}`
    const modalOpen = searchParams.openModal === 'true'

    return (
      <ViewPageClient 
        invoiceItem={invoiceItem}
        shareUrl={shareUrl}
        initialModalState={modalOpen}
      />
    )
  } catch (error) {
    console.error('Error fetching invoice:', error)
    redirect('/user/myinvoice')
  }
}