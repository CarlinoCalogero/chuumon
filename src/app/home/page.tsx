'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'

export default function Home() {

  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push('/')}>Back</button>
    </div>
  )
}
