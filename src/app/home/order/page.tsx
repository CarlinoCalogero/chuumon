'use client'

import styles from './page.module.css'
import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MenuItemDatabaseTableRow } from '@/types/MenuItemDatabaseTableRow';
import { UnitaDiMisuraDatabaseTableRow } from '@/types/UnitaDiMisuraDatabaseTableRow';
import { OrderedItem } from '@/types/OrderedItem';
import { PIZZE_CATEGORIES } from '@/lib/utils';

type Inputs = {
  menuItem: EventTarget & HTMLInputElement | null,
  numberOf: EventTarget & HTMLInputElement | null,
  unitOfMeasure: EventTarget & HTMLSelectElement | null
}

export default function Order() {

  const router = useRouter();

  const searchParams = useSearchParams()

  console.log(searchParams.get('tableNumber'))

  const [menuItems, setMenuItems] = useState<MenuItemDatabaseTableRow[]>([]);
  const [unitaDiMisuraArray, setUnitaDiMisuraArray] = useState<UnitaDiMisuraDatabaseTableRow[]>([]);

  const [inputs, setInputs] = useState<Inputs>({
    menuItem: null,
    numberOf: null,
    unitOfMeasure: null
  });

  const [orderedItem, setOrderedItem] = useState<OrderedItem>({
    menuItem: null,
    numberOf: null,
    unitOfMeasure: null
  });
  const [orderedItemsArray, setOrderedItemsArray] = useState<OrderedItem[]>([]);

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

  function getInputsCopy() {
    return {
      menuItem: inputs.menuItem,
      numberOf: inputs.numberOf,
      unitOfMeasure: inputs.unitOfMeasure
    } as Inputs
  }

  function getOrderedItemCopy() {
    return JSON.parse(JSON.stringify(orderedItem)) as OrderedItem
  }

  function getOrderedItemsArrayCopy() {
    return JSON.parse(JSON.stringify(orderedItemsArray)) as OrderedItem[]
  }

  function handleMenuItemChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    if (inputs.menuItem == null) {
      console.log("1 null")
      var inputsCopy = getInputsCopy();
      inputsCopy.menuItem = onChangeEvent.target;
      setInputs(inputsCopy)
    }

    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.menuItem = onChangeEvent.target.value;
    setOrderedItem(orderedItemCopy)

  }

  function handleNumberOfChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    if (inputs.numberOf == null) {
      console.log("2 null")
      var inputsCopy = getInputsCopy();
      inputsCopy.numberOf = onChangeEvent.target;
      setInputs(inputsCopy)
    }

    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.numberOf = Number(onChangeEvent.target.value)
    setOrderedItem(orderedItemCopy)
  }

  function handleUnitOfMeasurementChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    if (inputs.unitOfMeasure == null) {
      console.log("3 null")
      var inputsCopy = getInputsCopy();
      inputsCopy.unitOfMeasure = onChangeEvent.target;
      setInputs(inputsCopy)
    }

    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.unitOfMeasure = onChangeEvent.target.value;
    setOrderedItem(orderedItemCopy)
  }

  function getMenuItemCategory(menuItemName: string) {

    if (menuItemName == '')
      return menuItemName

    for (var count = 0; count < menuItems.length; count++) {
      var currentMenuItem = menuItems[count];
      if (currentMenuItem.nome.toUpperCase() == menuItemName.toUpperCase())
        return currentMenuItem.nome_categoria
    }

    return '';
  }

  function checkIfMenuItemIsAPizza(menuItemName: string) {

    if (menuItemName == '')
      return false

    var menuItemCategory = getMenuItemCategory(menuItemName);

    if (menuItemCategory == '')
      return false

    for (var count = 0; count < PIZZE_CATEGORIES.length; count++) {
      var currentPizzaCategoria = PIZZE_CATEGORIES[count];
      if (currentPizzaCategoria.toUpperCase() == menuItemCategory.toUpperCase())
        return true
    }

    return false;
  }

  function addItem() {

    console.log(orderedItem)

    //check if all fields are not null
    for (const [key, value] of Object.entries(orderedItem)) {
      if (value == null) {
        console.log(key, "is null")
        return
      }
    }

    // clear the fields
    for (const [key, value] of Object.entries(inputs)) {
      if (value != null)
        value.value = ''
    }

    // clear currentMenuItem
    setOrderedItem({
      menuItem: null,
      numberOf: null,
      unitOfMeasure: null
    })

    var orderedItemsArrayCopy = getOrderedItemsArrayCopy();
    orderedItemsArrayCopy.push(orderedItem)
    setOrderedItemsArray(orderedItemsArrayCopy);
  }

  return (

    <div className={styles.outerDiv}>

      <div className={styles.addItemToOrderDiv}>
        <input
          type='search'
          placeholder='Menu Item'
          list='menu-items-list'
          onChange={e => handleMenuItemChange(e)}
        />

        <input
          type='number'
          placeholder='Number of'
          min={1}
          onChange={e => handleNumberOfChange(e)}
        />


        {
          orderedItem.menuItem != null && checkIfMenuItemIsAPizza(orderedItem.menuItem) &&
          < select
            onChange={e => handleUnitOfMeasurementChange(e)}
            value={''}
          >
            {
              unitaDiMisuraArray.map((unitaDiMisura, i) => <option key={"orderPage_" + unitaDiMisura.nome} value={unitaDiMisura.nome}>{unitaDiMisura.nome}</option>)
            }
          </select>
        }


        <datalist id="menu-items-list">
          {
            menuItems.map((menuItem, i) => <option key={"orderPage_" + menuItem.nome} value={menuItem.nome}></option>)
          }
        </datalist>

        <button onClick={() => addItem()}>Add Item</button>

      </div>

      {
        orderedItemsArray.map((orderedItem, i) => <span key={"orderedItem_" + i}>{orderedItem.menuItem} {orderedItem.numberOf} {orderedItem.unitOfMeasure}</span>)
      }

      <button onClick={() => router.push("/home")}>Back</button>

    </div >

  )
}
