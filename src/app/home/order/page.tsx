'use client'

import styles from './page.module.css'
import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MenuItemDatabaseTableRow } from '@/types/MenuItemDatabaseTableRow';
import { UnitaDiMisuraDatabaseTableRow } from '@/types/UnitaDiMisuraDatabaseTableRow';
import { OrderedItem } from '@/types/OrderedItem';
import { CATEGORIE_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO, PIZZE_CATEGORIES, UNITA_DI_MISURA } from '@/lib/utils';
import { CategoriesDatabaseTableRow } from '@/types/CategoriesDatabaseTableRow';

type Inputs = {
  menuItem: EventTarget & HTMLInputElement | null,
  numberOf: EventTarget & HTMLInputElement | null
}

type OrderedItemsByCategories = {
  categoryName: string,
  thisCategoryOrderedItemsArray: OrderedItem[]
}

export default function Order() {

  const router = useRouter();

  const searchParams = useSearchParams()

  console.log(searchParams.get('tableNumber'))

  const [menuItems, setMenuItems] = useState<MenuItemDatabaseTableRow[]>([]);
  const [categories, setCategories] = useState<CategoriesDatabaseTableRow[]>([]);
  const [unitaDiMisuraArray, setUnitaDiMisuraArray] = useState<UnitaDiMisuraDatabaseTableRow[]>([]);

  const [inputs, setInputs] = useState<Inputs>({
    menuItem: null,
    numberOf: null
  });

  const [orderedItem, setOrderedItem] = useState<OrderedItem>({
    menuItem: null,
    menuItemCategory: null,
    isMenuItemAPizza: false,
    isCanMenuItemBeSlicedUp: false,
    slicedIn: null,
    numberOf: null,
    unitOfMeasure: null
  });
  const [orderedItemsByCategories, setOrderedItemsByCategories] = useState<OrderedItemsByCategories[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        setCategories(data.categories)
        setUnitaDiMisuraArray(data.unitaDiMisura);
      }); // Update the state with the fetched data

  }, [])

  useEffect(() => {
    console.log(menuItems);
  }, [menuItems])

  useEffect(() => {
    console.log(categories);
    var orderedItemsByCategoriesCopy = getOrderedItemsByCategoriesCopy();
    categories.forEach(category => {
      orderedItemsByCategoriesCopy.push({
        categoryName: category.nome,
        thisCategoryOrderedItemsArray: []
      })
    });
    setOrderedItemsByCategories(orderedItemsByCategoriesCopy);
  }, [categories])

  useEffect(() => {
    console.log(orderedItemsByCategories);
  }, [orderedItemsByCategories])

  useEffect(() => {
    console.log(orderedItem);
  }, [orderedItem])

  function getInputsCopy() {
    var inputsCopy: Inputs = {
      menuItem: inputs.menuItem,
      numberOf: inputs.numberOf
    }
    return inputsCopy;
  }

  function getOrderedItemCopy() {
    return JSON.parse(JSON.stringify(orderedItem)) as OrderedItem
  }

  function getOrderedItemsByCategoriesCopy() {
    return JSON.parse(JSON.stringify(orderedItemsByCategories)) as OrderedItemsByCategories[]
  }

  function handleMenuItemChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    if (inputs.menuItem == null) {
      console.log("1 null")
      var inputsCopy = getInputsCopy();
      inputsCopy.menuItem = onChangeEvent.target;
      setInputs(inputsCopy)
    }

    var menuItemName = onChangeEvent.target.value;
    var menuItemCategory = getMenuItemCategory(menuItemName)

    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.menuItem = menuItemName;
    orderedItemCopy.menuItemCategory = menuItemCategory;
    orderedItemCopy.isMenuItemAPizza = checkIfMenuItemIsAPizza(menuItemName, menuItemCategory)
    orderedItemCopy.isCanMenuItemBeSlicedUp = checkIfMenuItemCanBeSlicedUp(menuItemName, menuItemCategory)
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

  function handleSlicedInChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.slicedIn = Number(onChangeEvent.target.value)
    setOrderedItem(orderedItemCopy)
  }

  function handleUnitOfMeasurementChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.unitOfMeasure = onChangeEvent.target.value;
    setOrderedItem(orderedItemCopy)
  }

  function handleSelectCategoryChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    setSelectedCategory(onChangeEvent.target.value)

    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.menuItem = null;
    orderedItemCopy.menuItemCategory = onChangeEvent.target.value;
    setOrderedItem(orderedItemCopy)
  }

  function handleSelectMenuItemChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var menuItemName = onChangeEvent.target.value;
    var menuItemCategory = getMenuItemCategory(menuItemName)

    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.menuItem = menuItemName;
    orderedItemCopy.menuItemCategory = menuItemCategory;
    orderedItemCopy.isMenuItemAPizza = checkIfMenuItemIsAPizza(menuItemName, menuItemCategory)
    orderedItemCopy.isCanMenuItemBeSlicedUp = checkIfMenuItemCanBeSlicedUp(menuItemName, menuItemCategory)
    setOrderedItem(orderedItemCopy)
  }

  function getMenuItemsFromCategory(categoryName: string) {
    var menuItemsArray: string[] = [];
    menuItems.forEach(menuItem => {
      if (menuItem.nome_categoria == categoryName)
        menuItemsArray.push(menuItem.nome);
    });
    return menuItemsArray;
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

  function checkIfMenuItemIsAPizza(menuItemName: string, menuItemCategory: string) {

    if (menuItemName == '' || menuItemCategory == '')
      return false

    for (var count = 0; count < PIZZE_CATEGORIES.length; count++) {
      var currentPizzaCategoria = PIZZE_CATEGORIES[count];
      if (currentPizzaCategoria.toUpperCase() == menuItemCategory.toUpperCase())
        return true
    }

    return false;
  }

  function checkIfMenuItemCanBeSlicedUp(menuItemName: string, menuItemCategory: string) {

    if (menuItemName == '' || menuItemCategory == '')
      return false

    for (var count = 0; count < CATEGORIE_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO.length; count++) {
      var currentSlicedUpItemCategory = CATEGORIE_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO[count];
      if (currentSlicedUpItemCategory.toUpperCase() == menuItemCategory.toUpperCase())
        return true
    }

    return false;
  }

  function addItem() {

    console.log(orderedItem)

    //check if all fields are not null
    for (const [key, value] of Object.entries(orderedItem)) {

      if (orderedItem.isMenuItemAPizza && value == null) { // orderedItem is a pizza
        console.log("orderedItem is a pizza &", key, "is null")
        return
      } else if (!orderedItem.isMenuItemAPizza && key != "unitOfMeasure" && value == null) { // orderedItem is not a pizza
        console.log("orderedItem is not a pizza &", key, "is null")
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
      isMenuItemAPizza: false,
      isCanMenuItemBeSlicedUp: false,
      slicedIn: null,
      menuItemCategory: null,
      numberOf: null,
      unitOfMeasure: null
    })

    // clear selectedCategory
    setSelectedCategory(null);

    var orderedItemsByCategoriesCopy = getOrderedItemsByCategoriesCopy();
    var categoryWasFound = false;
    var count = 0;
    while (!categoryWasFound && count < orderedItemsByCategoriesCopy.length) {
      var currentCategory = orderedItemsByCategoriesCopy[count];
      if (currentCategory.categoryName == orderedItem.menuItemCategory) {
        currentCategory.thisCategoryOrderedItemsArray.push(orderedItem);
        categoryWasFound = true;
      }
      count++
    }
    setOrderedItemsByCategories(orderedItemsByCategoriesCopy);
  }

  return (

    <div className={styles.outerDiv}>

      <div>
        <input
          type="checkbox"
          id="frittiPrimaDellaPizzaCheckbox"
          onChange={e => console.log(e.target.checked)}
        />
        <label htmlFor="frittiPrimaDellaPizzaCheckbox">Fritti Prima della Pizza</label>
      </div>

      <div>
        <input
          type="checkbox"
          id="siDividonoLePizzeCheckbox"
          onChange={e => console.log(e.target.checked)}
        />
        <label htmlFor="siDividonoLePizzeCheckbox">Si dividono la pizza</label>
      </div>

      <div className={styles.addItemToOrderDiv}>
        <input
          type='search'
          placeholder='Menu Item'
          list='menu-items-list'
          onChange={e => handleMenuItemChange(e)}
        />

        <datalist id="menu-items-list">
          {
            menuItems.map((menuItem, i) => <option key={"orderPage_" + menuItem.nome} value={menuItem.nome}></option>)
          }
        </datalist>

      </div>

      <div className={styles.addItemToOrderDiv}>
        <select
          value={selectedCategory != null ? selectedCategory : ''}
          onChange={e => handleSelectCategoryChange(e)}
        >
          <option value='' disabled ></option>
          {
            categories.map((category, i) => <option key={"orderPage_" + category.nome} value={category.nome}>{category.nome}</option>)
          }
        </select>

        {
          selectedCategory != null &&
          <select
            value={orderedItem.menuItem != null ? orderedItem.menuItem : ''}
            onChange={e => handleSelectMenuItemChange(e)}
          >
            <option value='' disabled></option>
            {
              getMenuItemsFromCategory(selectedCategory).map((menuItemInThisCategory, i) => <option key={"orderPage_menuItemInThisCategory" + i} value={menuItemInThisCategory}>{menuItemInThisCategory}</option>)
            }
          </select>
        }

      </div>

      <div className={styles.addItemToOrderDiv}>

        <input
          type='number'
          placeholder='Number of'
          min={1}
          onChange={e => handleNumberOfChange(e)}
        />

        {
          orderedItem.isMenuItemAPizza &&
          < select
            value={orderedItem.unitOfMeasure != null ? orderedItem.unitOfMeasure : ''}
            onChange={e => handleUnitOfMeasurementChange(e)}
          >
            <option value='' disabled></option>
            {
              unitaDiMisuraArray.map((unitaDiMisura, i) => <option key={"orderPage_" + unitaDiMisura.nome} value={unitaDiMisura.nome}>{unitaDiMisura.nome}</option>)
            }
          </select>
        }

        {
          ((orderedItem.isMenuItemAPizza && (orderedItem.unitOfMeasure != null && orderedItem.unitOfMeasure.toUpperCase() != UNITA_DI_MISURA.pezzi.toUpperCase())) || orderedItem.isCanMenuItemBeSlicedUp) &&
          <div>
            <label>Sliced in</label>
            <select
              value={orderedItem.slicedIn != null ? orderedItem.slicedIn : ''}
              onChange={e => handleSlicedInChange(e)}
            >
              <option value='' disabled></option>
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={8}>4</option>
            </select>
          </div>
        }

        <button onClick={() => addItem()}>Add Item</button>

      </div>

      {
        orderedItemsByCategories.map((orderedItemByCategory, i) =>
          orderedItemByCategory.thisCategoryOrderedItemsArray.length != 0 &&
          <div
            key={"orderedItemByCategory_" + i}
          >

            <h2>{orderedItemByCategory.categoryName}</h2>

            <div className={styles.outerDiv}>
              {
                orderedItemByCategory.thisCategoryOrderedItemsArray.map((orderedItem, j) => <span key={"orderedItem_" + j + "_inCategory_" + i}>{orderedItem.menuItem} {orderedItem.numberOf} {orderedItem.unitOfMeasure} tagliata in {orderedItem.slicedIn}</span>)
              }
            </div>
          </div>)
      }

      <button onClick={() => router.push("/home")}>Back</button>

    </div >

  )
}
