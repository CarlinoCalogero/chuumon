'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { Order } from '@/types/Order';
import { OrderSnippet } from '@/components/OrderSnippet';

export default function ViewOrder() {

  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    console.log("runs one time only");

    fetch("http://localhost:3000/home/viewOrder/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data: Order[]) => {
        setOrders(data);
      }); // Update the state with the fetched data

  }, [])

  useEffect(() => {
    console.log(orders)
  }, [orders])

  return (

    <div className={styles.outerDiv}>

      {
        orders.map((order, i) => <OrderSnippet key={"orderSnippet_" + i} order={order} />)
      }

    </div>

  )
}
