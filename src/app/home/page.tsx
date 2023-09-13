'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent, useCallback } from 'react'
import styles from './page.module.css'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tables } from '@/components/Tables';
import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS, removeNumbersFromArray } from '@/lib/utils';
import { Sala } from '@/types/Sala';
import { Table } from '@/types/Table';
import { AppearingButton } from '@/components/AppearingButton';

export default function Home() {

  const router = useRouter();

  const [tablesArray, setTablesArray] = useState<Table[]>([]);

  useEffect(() => {
    console.log(tablesArray)
  }, [tablesArray])

  useEffect(() => {
    console.log("runs one time only");

    fetch("http://localhost:3000/home/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data: Table[]) => {
        setTablesArray(data);
      }); // Update the state with the fetched data

  }, [])

  const searchParams = useSearchParams()

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  function placeAnOrder(table: Table) {
    console.log("place an order")
    router.push("/home/order" + '?' + createQueryString('tableNumber', table.tableNumber + ''))
  }

  return (

    <div>

      {
        tablesArray.map((table, i) => <Tables
          key={"table" + i}
          tableNumber={table.tableNumber}
          numberOfMergedTables={table.numberOfMergedTables}
          top={table.top}
          left={table.left}
          rotate={table.rotate}
          isCanBeClicked={true}
          isCanBeDragged={false}
          isCanBeRotated={false}
          isResetTableRotation={false}
          functionOnDrag={null}
          functionOnDragEnd={null}
          functionOnDrop={null}
          functionOnClick={placeAnOrder}
          functionOnSaveRotation={null}
        />)
      }

    </div>

  )
}