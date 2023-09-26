'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { OrdinazioneDatabaseTableRow } from '@/types/OrdinazioneDatabaseTableRow';

export default function ViewOrder() {

  const router = useRouter();

  const [orders, setOrders] = useState<OrdinazioneDatabaseTableRow[]>([]);

  useEffect(() => {
    console.log("runs one time only");

    fetch("http://localhost:3000/home/viewOrder/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data: OrdinazioneDatabaseTableRow[]) => {
        setOrders(data);
      }); // Update the state with the fetched data

  }, [])

  useEffect(() => {
    console.log(orders)
  }, [orders])

  return (

    <div>

      miao

    </div>

  )
}
