'use client'

import styles from './page.module.css'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Order() {

  const router = useRouter();

  const searchParams = useSearchParams()

  console.log(searchParams.get('tableNumber'))

  return (

    <div>

      Make an order

      <button onClick={() => router.push("/home")}>Back</button>

    </div>

  )
}
