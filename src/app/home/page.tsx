'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent, useCallback } from 'react'
import styles from './page.module.css'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tables } from '@/components/Tables';
import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS, TAKE_AWAY_ORDER_SECTION_NUMBER_TRIGGER, removeNumbersFromArray } from '@/lib/utils';
import { Sala } from '@/types/Sala';
import { Table } from '@/types/Table';
import { AppearingButton } from '@/components/AppearingButton';
import { Popup } from '@/components/Popup';

export default function Home() {

  const router = useRouter();

  const [show, setShow] = useState(false);

  const [tablesArray, setTablesArray] = useState<Table[]>([]);

  const [clickedTable, setClickedTable] = useState<Table | null>(null);

  const buttons = [
    {
      buttonText: "Place an order",
      onClickFunction: placeAnOrder
    },
    {
      buttonText: "Book table",
      onClickFunction: bookTable
    }
  ]

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

  function placeAnOrder() {
    if (clickedTable == null)
      return
    router.push("/home/order" + '?' + createQueryString('tableNumber', clickedTable.tableNumber + ''))
  }

  function bookTable() {
    if (clickedTable == null)
      return
    router.push("/home/book" + '?' + createQueryString('tableNumber', clickedTable.tableNumber + ''))
  }

  function openPopup(table: Table) {
    setClickedTable(table);
    setShow(true)
  }

  function closePopup() {
    setClickedTable(null);
    setShow(false);
  }

  return (

    <div>

      <button onClick={() => router.push("/home/order" + '?' + createQueryString('tableNumber', TAKE_AWAY_ORDER_SECTION_NUMBER_TRIGGER + ''))}>Take away order</button>

      {
        tablesArray.map((table, i) => <Tables
          key={"table" + i}
          table={table}
          isCanBeClicked={true}
          isCanBeDragged={false}
          isCanBeRotated={false}
          isResetTableRotation={false}
          functionOnDrag={null}
          functionOnDragEnd={null}
          functionOnDrop={null}
          functionOnClick={openPopup}
          functionOnSaveRotation={null}
        />)
      }

      {
        show &&
        <Popup buttons={buttons} closePopupFunction={closePopup} />
      }

    </div>

  )
}
