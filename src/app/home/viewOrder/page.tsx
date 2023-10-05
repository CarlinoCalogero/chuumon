'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { Order } from '@/types/Order';
import { OrderSnippet } from '@/components/OrderSnippet';
import { OrderedItem } from '@/types/OrderedItem';
import { ArgumentsUsedForUpdatingConsegnatoInAnOrder } from '@/types/ArgumentsUsedForUpdatingConsegnatoInAnOrder';

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

    const minutes = 5;

    // reloads page every tot minutes
    setTimeout(() => {
      window.location.reload();
    }, minutes * 60 * 1000) // in milliseconds

  }, [])

  useEffect(() => {
    console.log(orders)
  }, [orders])

  function updateConsegnato(order: Order, orderedItem: OrderedItem, consegnatoValue: boolean) {

    let argumentsUsedForUpdatingConsegnatoInAnOrder: ArgumentsUsedForUpdatingConsegnatoInAnOrder = {
      numeroOrdineProgressivoGiornaliero: order.numeroOrdineProgressivoGiornaliero,
      orderedItem: orderedItem,
      consegnato: consegnatoValue,
    }

    fetch("http://localhost:3000/home/viewOrder/api", {
      method: "POST",
      body: JSON.stringify(argumentsUsedForUpdatingConsegnatoInAnOrder),
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data) => {
        console.log("response", data)
        //router.push('/home');

      }); // Update the state with the fetched data

  }

  return (

    <div className={styles.outerDiv}>

      {
        orders.map((order, i) => <OrderSnippet key={"orderSnippet_" + i} order={order} updateConsegnato={updateConsegnato} />)
      }

    </div>

  )
}
