'use client'

import { Popup } from '@/components/Popup';
import { Tables } from '@/components/Tables';
import { TAKE_AWAY_ORDER_SECTION_NUMBER_TRIGGER, getObjectDeepCopy } from '@/lib/utils';
import { OrderedTablesWithMenuItemsAndDeliveredMenuItems } from '@/types/OrderedTablesWithMenuItemsAndDeliveredMenuItems';
import { Sala } from '@/types/Sala';
import { SalaWithTables } from '@/types/SalaWithTables';
import { Table } from '@/types/Table';
import { TableMenuItemsNumber } from '@/types/TableMenuItemsNumber';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

export default function Home() {

  const router = useRouter();

  const [showNotBookedTablePopUp, setShowNotBookedTablePopUp] = useState(false);
  const [showBookedTablePopUp, setShowBookedTablePopUp] = useState(false);

  const [selectedSalaNumber, setSelectedSalaNumber] = useState(0);
  const [sala, setSala] = useState<Sala>({
    currentMaxTableNumber: -1,
    tableNumbersArray: [],
    saleWithTables: {}
  });
  const [orderedTablesWithMenuItemsAndDeliveredMenuItems, setOrderedTablesWithMenuItemsAndDeliveredMenuItems] = useState<OrderedTablesWithMenuItemsAndDeliveredMenuItems>({})

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
    console.log(sala);
    setSelectedSalaNumber(0);
  }, [sala])

  useEffect(() => {
    console.log(orderedTablesWithMenuItemsAndDeliveredMenuItems)
  }, [orderedTablesWithMenuItemsAndDeliveredMenuItems])

  useEffect(() => {
    console.log("runs one time only");

    fetch("http://localhost:3000/home/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data) => {
        setSala(data.sala);
        setOrderedTablesWithMenuItemsAndDeliveredMenuItems(data.orderedTablesWithMenuItemsAndDeliveredMenuItems);
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

  function handleChangeSalaNumber(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    setSelectedSalaNumber(Number(onChangeEvent.target.value));
  }

  return (

    <div>

      <button onClick={() => router.push("/home/order" + '?' + createQueryString('tableNumber', TAKE_AWAY_ORDER_SECTION_NUMBER_TRIGGER + ''))}>Take away order</button>

      <select
        value={selectedSalaNumber}
        onChange={e => handleChangeSalaNumber(e)}
      >
        <option value='' disabled></option>,
        {
          Object.keys(sala.saleWithTables).map((salaNumber, i) => <option key={"salaNumber_" + i} value={salaNumber}>Sala {salaNumber}</option>)
        }
      </select>

      {
        sala.saleWithTables[selectedSalaNumber] != undefined &&
        sala.saleWithTables[selectedSalaNumber].map((table, i) => <Tables
          key={"table" + i}
          table={table}
          tableOrderMenuItemInfo={orderedTablesWithMenuItemsAndDeliveredMenuItems[table.tableNumber]}
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
