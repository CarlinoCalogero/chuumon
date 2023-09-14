'use client'

import styles from './page.module.css'
import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MenuItemDatabaseTableRow } from '@/types/MenuItemDatabaseTableRow';
import { UnitaDiMisuraDatabaseTableRow } from '@/types/UnitaDiMisuraDatabaseTableRow';

export default function Order() {

  const router = useRouter();

  const searchParams = useSearchParams()

  console.log(searchParams.get('tableNumber'))

  const [menuItems, setMenuItems] = useState<MenuItemDatabaseTableRow[]>([]);
  const [unitaDiMisuraArray, setUnitaDiMisuraArray] = useState<UnitaDiMisuraDatabaseTableRow[]>([]);

  useEffect(() => {
    console.log("runs one time only");

    fetch("http://localhost:3000/home/order/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data) => {
        console.log("data", data)
        setMenuItems(data.menuItems);
        setUnitaDiMisuraArray(data.unitaDiMisura);
      }); // Update the state with the fetched data

  }, [])

  useEffect(() => {
    console.log(menuItems);
  }, [menuItems])

  function onFormSubmit(onFormEvent: FormEvent<HTMLFormElement>) {
    // prevents page refresh
    onFormEvent.preventDefault();

    console.log(onFormEvent.currentTarget.length)

    var childrenArray = onFormEvent.currentTarget.children;

    for (var count = 0; count < onFormEvent.currentTarget.length; count++) {
      var inputElement = onFormEvent.currentTarget[count] as EventTarget & HTMLInputElement;
      console.log(inputElement.name, inputElement.value);
    }

  }

  return (

    <div className={styles.outerDiv}>

      <form onSubmitCapture={e => onFormSubmit(e)} id='orderForm'>

        <div className={styles.outerDiv}>

          <input
            type='search'
            name='menuItem'
            placeholder='Menu Item'
            list='menu-items-list'
          />

          <input
            type='number'
            name='numberOf'
            placeholder='Number of'
            min={1}
          />

          <select
            name='selectUnitaDiMisura'
            form='orderForm'
          >
            {
              unitaDiMisuraArray.map((unitaDiMisura, i) => <option key={"orderPage_" + unitaDiMisura.nome} value={unitaDiMisura.nome}>{unitaDiMisura.nome}</option>)
            }
          </select>

          <input type="submit" name='submit' value="Submit" />

        </div>

      </form>



      <datalist id="menu-items-list">
        {
          menuItems.map((menuItem, i) => <option key={"orderPage_" + menuItem.nome} value={menuItem.nome}></option>)
        }
      </datalist>

      <button onClick={() => router.push("/home")}>Back</button>

    </div>

  )
}
