'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent, useCallback } from 'react'
import styles from './page.module.css'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tables } from '@/components/Tables';
import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS, TAKE_AWAY_ORDER_SECTION_NUMBER_TRIGGER, getObjectDeepCopy, removeNumbersFromArray } from '@/lib/utils';
import { Sala } from '@/types/Sala';
import { Table } from '@/types/Table';
import { AppearingButton } from '@/components/AppearingButton';
import { Popup } from '@/components/Popup';

export default function Home() {

  const router = useRouter();

  const [showNotBookedTablePopUp, setShowNotBookedTablePopUp] = useState(false);
  const [showBookedTablePopUp, setShowBookedTablePopUp] = useState(false);

  const [tablesArray, setTablesArray] = useState<Table[]>([]);

  const [clickedTable, setClickedTable] = useState<Table | null>(null);

  const notBookedTableButtons = [
    {
      buttonText: "Place an order",
      onClickFunction: placeAnOrderNotBookedTable
    },
    {
      buttonText: "Book table",
      onClickFunction: bookTable
    }
  ]

  const bookedTableButtons = [
    {
      buttonText: "Remove booking",
      onClickFunction: removeBooking
    },
    {
      buttonText: "Place an order",
      onClickFunction: placeAnOrderAlreadyBookedTable
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

  function placeAnOrderNotBookedTable() {
    if (clickedTable == null)
      return
    router.push("/home/order" + '?' + createQueryString('table', JSON.stringify(clickedTable) + ''))
  }

  function placeAnOrderAlreadyBookedTable() {
    if (clickedTable == null)
      return

    if (confirm("Sono arrivati i clienti della prenotazione?")) {
      removeBooking(false);
      let newTable = getObjectDeepCopy(clickedTable) as Table;
      newTable.ora = null;
      newTable.nome_prenotazione = null;
      newTable.numero_persone = null;
      newTable.note = null;
      router.push("/home/order" + '?' + createQueryString('table', JSON.stringify(newTable) + ''))
    } else if (confirm("Confermi di voler ordinare un tavolo prenotato?")) {
      router.push("/home/order" + '?' + createQueryString('table', JSON.stringify(clickedTable) + ''))
    }

  }

  function bookTable() {
    if (clickedTable == null)
      return
    router.push("/home/book" + '?' + createQueryString('tableNumber', clickedTable.tableNumber + ''))
  }

  function openPopup(table: Table) {
    setClickedTable(table);

    if (table.ora == null) {
      setShowNotBookedTablePopUp(true)
    } else {
      setShowBookedTablePopUp(true)
    }
  }

  function closePopup() {
    setClickedTable(null);
    setShowNotBookedTablePopUp(false);
    setShowBookedTablePopUp(false);
  }

  function removeBooking(reload: boolean = true) {

    if (clickedTable == null)
      return

    if (!confirm("Vuoi davvero rimuovere la prenotazione?"))
      return;

    fetch("http://localhost:3000/home/api", {
      method: "POST",
      body: JSON.stringify(clickedTable.tableNumber),
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data) => {
        console.log("response", data)
        if (reload) {
          closePopup();
          window.location.reload();
        }
      }); // Update the state with the fetched data

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
        showNotBookedTablePopUp &&
        <Popup buttons={notBookedTableButtons} closePopupFunction={closePopup} />
      }

      {
        showBookedTablePopUp &&
        <Popup buttons={bookedTableButtons} closePopupFunction={closePopup} />
      }

    </div>

  )
}
