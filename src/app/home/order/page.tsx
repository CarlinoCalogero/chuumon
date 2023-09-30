'use client'

import styles from './page.module.css'
import { useState, useEffect, ChangeEvent, MouseEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UnitaDiMisuraDatabaseTableRow } from '@/types/UnitaDiMisuraDatabaseTableRow';
import { OrderedItem } from '@/types/OrderedItem';
import { CALZONI, CATEGORIE_CREA, CATEGORIE_CREA_ARRAY, CATEGORIE_OLTRE_ALLA_PIZZA_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO, FARINE_SPECIALI, OGNI_INGREDIENTE_AGGIUNTO_COSTA_EURO, PINSE_ROMANE, PIZZE_BIANCHE, PIZZE_CATEGORIES, PIZZE_ROSSE, UNITA_DI_MISURA, checkIfMenuItemCanBeSlicedUp, checkIfMenuItemIsAPizza, getCategoriesAndMenuItemsObjectFromCategoriesWithMenuItemsObject, getArrayFromOrderedItemsByCategoriesObject, getObjectDeepCopy, getMenuItemPriceFromMenuItemsWithIngredientsObject, getMenuItemIngredientsFromMenuItemsWithIngredientsObject, getMenuItemCategoryFromMenuItemsWithIngredientsObject, addOrderedItemToOrderedItemByCategoriesObject, getMenuItemsFromCategoryFromCategoriesWithMenuItemsObject, SLICED_IN_OPTIONS_ARRAY, putIngredientsTogether, CREATED_MENU_ITEM_SUFFIX, EDITED_MENU_ITEM_SUFFIX } from '@/lib/utils';
import { TableOrderInfo } from '@/types/TableOrderInfo';
import { IngredienteDatabaseTableRow } from '@/types/IngredienteDatabaseTableRow';
import { CategoriaConIngredientiCheLaDefiniscono } from '@/types/CategoriaConIngredientiCheLaDefiniscono';
import { OrderedItemsByCategoriesArray } from '@/types/OrderedItemsByCategoriesArray';
import { TableOrder } from '@/types/TableOrder';
import { MenuItemsWithIngredients } from '@/types/MenuItemsWithIngredients';
import { CategoriesWithMenuItems } from '@/types/CategoriesWithMenuItems';
import { OrderedItemByCategories } from '@/types/OrderedItemByCategories';
import { CategoriesAndMenuItems } from '@/types/CategoriesAndMenuItems';

type Inputs = {
  menuItem: EventTarget & HTMLInputElement | null,
  numberOf: EventTarget & HTMLInputElement | null
  addIngredient: EventTarget & HTMLInputElement | null
}

export default function Order() {

  const router = useRouter();

  const searchParams = useSearchParams()

  console.log(searchParams.get('tableNumber'))

  const [menuItemsWithIngredients, setMenuItemsWithIngredients] = useState<MenuItemsWithIngredients>({});
  const [categoriesWithMenuItems, setCategoriesWithMenuItems] = useState<CategoriesWithMenuItems>({});
  const [ingredientiArray, setIngredientiArray] = useState<IngredienteDatabaseTableRow[]>([]);
  const [unitaDiMisuraArray, setUnitaDiMisuraArray] = useState<UnitaDiMisuraDatabaseTableRow[]>([]);

  const [categoriesAndMenuItems, setCategoriesAndMenuItems] = useState<CategoriesAndMenuItems>({
    categories: [],
    menuItems: []
  });

  const [inputs, setInputs] = useState<Inputs>({
    menuItem: null,
    numberOf: null,
    addIngredient: null
  });

  const [isInsertingMenuItemWithSearch, setIsInsertingMenuItemWithSearch] = useState<boolean | null>(null);
  const [isWasCreaButtonPressed, setIsWasCreaButtonPressed] = useState<boolean>(false);

  const [tableOrderInfo, setTableOrderInfo] = useState<TableOrderInfo>({
    tableNumber: Number(searchParams.get('tableNumber')),
    isFrittiPrimaDellaPizza: true,
    isSiDividonoLaPizza: false,
    slicedIn: null,
    note: null,
    numeroBambini: null,
    numeroAdulti: null
  });

  const [orderedItem, setOrderedItem] = useState<OrderedItem>({
    menuItem: null,
    menuItemCategory: null,
    price: null,
    originalIngredients: [],
    ingredients: [],
    removedIngredients: [],
    addedIngredients: [],
    intolleranzaA: [],
    isWasMenuItemCreated: false,
    isWereIngredientsModified: false,
    isMenuItemAPizza: false,
    isCanMenuItemBeSlicedUp: false,
    slicedIn: null,
    numberOf: null,
    unitOfMeasure: null,
    consegnato: false
  });

  const [orderedItemsByCategory, setOrderedItemsByCategory] = useState<OrderedItemByCategories>({});
  const [orderedItemsByCategoryArray, setOrderedItemsByCategoryArray] = useState<OrderedItemsByCategoriesArray>([]);

  const [addedIngredient, setAddedIngredient] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCreaCategory, setSelectedCreaCategory] = useState<string>('');

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
        setMenuItemsWithIngredients(data.menuItemsWithIngredients);
        setCategoriesWithMenuItems(data.categoriesWithMenuItems)
        setIngredientiArray(data.ingredienti);
        setUnitaDiMisuraArray(data.unitaDiMisura);
      }); // Update the state with the fetched data

  }, [])

  useEffect(() => {
    console.log("menuItemsWithIngredients", menuItemsWithIngredients)
  }, [menuItemsWithIngredients])

  useEffect(() => {
    console.log("categoriesWithMenuItems", categoriesWithMenuItems)
    setCategoriesAndMenuItems(getCategoriesAndMenuItemsObjectFromCategoriesWithMenuItemsObject(categoriesWithMenuItems))
  }, [categoriesWithMenuItems])

  useEffect(() => {
    console.log("categoriesAndMenuItems", categoriesAndMenuItems);
  }, [categoriesAndMenuItems])

  useEffect(() => {
    setOrderedItemsByCategoryArray(getArrayFromOrderedItemsByCategoriesObject(orderedItemsByCategory))
  }, [orderedItemsByCategory])

  useEffect(() => {
    console.log("orderedItemsByCategoriesArray", orderedItemsByCategoryArray);
  }, [orderedItemsByCategoryArray])

  useEffect(() => {
    console.log("orderedItem", orderedItem);
  }, [orderedItem])

  useEffect(() => {
    console.log("tableOrderInfo", tableOrderInfo);
  }, [tableOrderInfo])

  useEffect(() => {
    console.log("isInsertingMenuItemWithSearch", isInsertingMenuItemWithSearch);
  }, [isInsertingMenuItemWithSearch])

  function getInputsCopy() {
    var inputsCopy: Inputs = {
      menuItem: inputs.menuItem,
      numberOf: inputs.numberOf,
      addIngredient: inputs.addIngredient
    }
    return inputsCopy;
  }

  function handleMenuItemChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    if (inputs.menuItem == null) {
      console.log("1 null")
      var inputsCopy = getInputsCopy();
      inputsCopy.menuItem = onChangeEvent.target;
      setInputs(inputsCopy)
    }

    var menuItemName = onChangeEvent.target.value;
    var menuItemCategory = getMenuItemCategoryFromMenuItemsWithIngredientsObject(menuItemsWithIngredients, menuItemName)

    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem;
    orderedItemCopy.menuItem = menuItemName;
    orderedItemCopy.menuItemCategory = menuItemCategory;
    orderedItemCopy.price = getMenuItemPriceFromMenuItemsWithIngredientsObject(menuItemsWithIngredients, menuItemName);
    orderedItemCopy.originalIngredients = getMenuItemIngredientsFromMenuItemsWithIngredientsObject(menuItemsWithIngredients, menuItemName);
    orderedItemCopy.ingredients = [...orderedItemCopy.originalIngredients];
    orderedItemCopy.isMenuItemAPizza = checkIfMenuItemIsAPizza(menuItemCategory)
    orderedItemCopy.isCanMenuItemBeSlicedUp = checkIfMenuItemCanBeSlicedUp(menuItemCategory)
    setOrderedItem(orderedItemCopy)

    // hide the other type of insert
    if (onChangeEvent.target.value == '') {
      setIsInsertingMenuItemWithSearch(null)
    } else {
      setIsInsertingMenuItemWithSearch(true);
    }

  }

  function handleNumberOfChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    if (inputs.numberOf == null) {
      console.log("2 null")
      var inputsCopy = getInputsCopy();
      inputsCopy.numberOf = onChangeEvent.target;
      setInputs(inputsCopy)
    }

    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem;
    orderedItemCopy.numberOf = Number(onChangeEvent.target.value)
    setOrderedItem(orderedItemCopy)
  }

  function handleNumberoAdultiChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    var tableOrderInfoCopy = getObjectDeepCopy(tableOrderInfo) as TableOrderInfo
    tableOrderInfoCopy.numeroAdulti = Number(onChangeEvent.target.value)
    setTableOrderInfo(tableOrderInfoCopy)
  }

  function handleNumberoBambiniChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    var tableOrderInfoCopy = getObjectDeepCopy(tableOrderInfo) as TableOrderInfo
    tableOrderInfoCopy.numeroBambini = Number(onChangeEvent.target.value)
    setTableOrderInfo(tableOrderInfoCopy)
  }

  function handleNoteTextAreaChange(onChangeEvent: ChangeEvent<HTMLTextAreaElement>) {
    var newNote: string | null = onChangeEvent.target.value;

    var tableOrderInfoCopy = getObjectDeepCopy(tableOrderInfo) as TableOrderInfo

    if (newNote == '') {
      newNote = null;
    }

    tableOrderInfoCopy.note = newNote;
    setTableOrderInfo(tableOrderInfoCopy)
  }

  function handleSlicedInChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem;
    orderedItemCopy.slicedIn = Number(onChangeEvent.target.value)
    setOrderedItem(orderedItemCopy)
  }

  function handleSlicedInTableOrderInfoChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var tableOrderInfoCopy = getObjectDeepCopy(tableOrderInfo) as TableOrderInfo;
    tableOrderInfoCopy.slicedIn = Number(onChangeEvent.target.value);
    setTableOrderInfo(tableOrderInfoCopy)
  }

  function handleUnitOfMeasurementChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem;
    orderedItemCopy.unitOfMeasure = onChangeEvent.target.value;
    setOrderedItem(orderedItemCopy)
  }

  function handleSelectCategoryChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    setSelectedCategory(onChangeEvent.target.value)

    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem;
    orderedItemCopy.menuItem = null;
    orderedItemCopy.menuItemCategory = onChangeEvent.target.value;
    setOrderedItem(orderedItemCopy)

    // hide the other type of insert
    if (onChangeEvent.target.value == '') {
      setIsInsertingMenuItemWithSearch(null)
    } else {
      setIsInsertingMenuItemWithSearch(false);
    }
  }

  function handleSelectMenuItemChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var menuItemName = onChangeEvent.target.value;
    var menuItemCategory = getMenuItemCategoryFromMenuItemsWithIngredientsObject(menuItemsWithIngredients, menuItemName)

    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem;
    orderedItemCopy.menuItem = menuItemName;
    orderedItemCopy.menuItemCategory = menuItemCategory;
    orderedItemCopy.price = getMenuItemPriceFromMenuItemsWithIngredientsObject(menuItemsWithIngredients, menuItemName);
    orderedItemCopy.originalIngredients = getMenuItemIngredientsFromMenuItemsWithIngredientsObject(menuItemsWithIngredients, menuItemName);
    orderedItemCopy.ingredients = [...orderedItemCopy.originalIngredients];
    orderedItemCopy.isMenuItemAPizza = checkIfMenuItemIsAPizza(menuItemCategory)
    orderedItemCopy.isCanMenuItemBeSlicedUp = checkIfMenuItemCanBeSlicedUp(menuItemCategory)
    setOrderedItem(orderedItemCopy)
  }

  function handleIsFrittiPrimaDellaPizzaChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    var tableOrderInfoCopy = getObjectDeepCopy(tableOrderInfo) as TableOrderInfo;
    tableOrderInfoCopy.isFrittiPrimaDellaPizza = onChangeEvent.target.checked;
    setTableOrderInfo(tableOrderInfoCopy)
  }

  function handleIsSiDividonoLapizzaChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {

    var newBooleanValue = onChangeEvent.target.checked;

    var tableOrderInfoCopy = getObjectDeepCopy(tableOrderInfo) as TableOrderInfo;
    tableOrderInfoCopy.isSiDividonoLaPizza = newBooleanValue;
    if (newBooleanValue == false) {
      tableOrderInfoCopy.slicedIn = null;
    }
    setTableOrderInfo(tableOrderInfoCopy)
  }

  function addIngredientToOrderedItem(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    if (inputs.addIngredient == null) {
      console.log("3 null")
      var inputsCopy = getInputsCopy();
      inputsCopy.addIngredient = onChangeEvent.target;
      setInputs(inputsCopy)
    }

    setAddedIngredient(onChangeEvent.target.value);
  }

  function addIngredient() {

    if (orderedItem.ingredients.includes(addedIngredient)) {
      //reset addedIngredient
      setAddedIngredient('');

      //clear input field
      if (inputs.addIngredient != null)
        inputs.addIngredient.value = ''
      return
    }


    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem;
    orderedItemCopy.ingredients.push(addedIngredient);

    if (!isWasCreaButtonPressed) {

      // only add ingredient to addedIngredients array if ingredient was not an original ingredient
      if (!orderedItemCopy.originalIngredients.includes(addedIngredient)) {
        orderedItemCopy.addedIngredients.push(addedIngredient);
      }

      orderedItemCopy.isWereIngredientsModified = true;

      // check if ingredient is in removedIngredients array and remove it
      if (orderedItem.removedIngredients.includes(addedIngredient)) {
        orderedItemCopy.removedIngredients.splice(orderedItemCopy.removedIngredients.indexOf(addedIngredient), 1) // remove ingredient
      }

      // check if ingredient is in intolleranzaA array and remove it
      if (orderedItem.intolleranzaA.includes(addedIngredient)) {
        orderedItemCopy.intolleranzaA.splice(orderedItemCopy.intolleranzaA.indexOf(addedIngredient), 1) // remove ingredient
      }

    }

    setOrderedItem(orderedItemCopy)

    //reset addedIngredient
    setAddedIngredient('');

    //clear input field
    if (inputs.addIngredient != null)
      inputs.addIngredient.value = ''
  }

  function tryCategory(orderedItemCopy: OrderedItem, categoriaConIngredientiCheLaDefiniscono: CategoriaConIngredientiCheLaDefiniscono) {

    if (orderedItemCopy.menuItemCategory != null) {
      return orderedItemCopy.menuItemCategory;
    }

    for (let count = 0; count < categoriaConIngredientiCheLaDefiniscono.ingredientiCheDefinisconoLaCategoria.length; count++) {
      let ingredient = categoriaConIngredientiCheLaDefiniscono.ingredientiCheDefinisconoLaCategoria[count];

      console.log(orderedItemCopy.ingredients, ingredient)
      if (orderedItemCopy.ingredients.includes(ingredient)) {
        console.log("papavero", ingredient, categoriaConIngredientiCheLaDefiniscono.nomeCategoria)
        return categoriaConIngredientiCheLaDefiniscono.nomeCategoria;
      }
    }

    console.log("porcello")

    return null;

  }

  function checkOrderedItemFieldsAndGetCopy() {

    if (isWasCreaButtonPressed && selectedCreaCategory == '') {
      console.log("selectedCreaCategory is null")
      return
    }

    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem

    // menuItem Check
    if (orderedItemCopy.menuItem == null) {
      if (!isWasCreaButtonPressed) {
        console.log("menuItem is null")
        return;
      }
    }

    // menuItemCategory
    if (orderedItemCopy.menuItemCategory == null) {
      if (isWasCreaButtonPressed) {
        if (selectedCreaCategory.toUpperCase() == CATEGORIE_CREA.pizza.toUpperCase()) {

          let newCategory: null | string = null;

          newCategory = tryCategory(orderedItemCopy, FARINE_SPECIALI);

          if (newCategory == null)
            newCategory = tryCategory(orderedItemCopy, PINSE_ROMANE);

          //non invertire l'ordine di pizze rosse e pizze bianche altrimenti una pizza rossa può risultare essere di categoria "PIZZE_BIANCHE"

          if (newCategory == null)
            newCategory = tryCategory(orderedItemCopy, PIZZE_ROSSE);

          if (newCategory == null)
            newCategory = tryCategory(orderedItemCopy, PIZZE_BIANCHE);

          // if nothing matches
          if (newCategory == null)
            newCategory = PIZZE_BIANCHE.nomeCategoria

          orderedItemCopy.menuItemCategory = newCategory;

        } else {
          orderedItemCopy.menuItemCategory = CALZONI.nomeCategoria;
        }
      } else {
        console.log("menuItemCategory is null")
        return;
      }
    }

    // price
    if (orderedItemCopy.price == null) {
      if (isWasCreaButtonPressed) {
        console.log("Il prezzo non può essere scelto qui")
        orderedItemCopy.price = 0;
      } else {
        console.log("price is null")
        return;
      }
    }

    // ingredients
    if (orderedItemCopy.ingredients.length == 0) {
      if (isWasCreaButtonPressed) {
        console.log("ingredients is null")
        return;
      }
    }

    //removedIngredients can be empty

    //addedIngredients can be empty
    if (orderedItemCopy.addedIngredients.length != 0) {
      if (orderedItemCopy.price == null)
        orderedItemCopy.price = 0;
      orderedItemCopy.price = orderedItemCopy.price + (OGNI_INGREDIENTE_AGGIUNTO_COSTA_EURO * orderedItemCopy.addedIngredients.length);
    }

    //intolleranzaA can be empty

    // isWasMenuItemCreated
    if (isWasCreaButtonPressed) {
      orderedItemCopy.menuItem = `${selectedCreaCategory.toUpperCase()} ${CREATED_MENU_ITEM_SUFFIX}`
      orderedItemCopy.isWasMenuItemCreated = true;
    } else {
      orderedItemCopy.isWasMenuItemCreated = false;
    }

    // isWereIngredientsModified
    if (orderedItemCopy.isWereIngredientsModified) {
      if (!orderedItemCopy.isWasMenuItemCreated)
        orderedItemCopy.menuItem = `${orderedItemCopy.menuItem} ${EDITED_MENU_ITEM_SUFFIX}`
    }

    // unitOfMeasure
    if (orderedItemCopy.unitOfMeasure == null) {
      if (orderedItemCopy.isMenuItemAPizza) {
        console.log("unitOfMeasure is null")
        return;
      }
    }

    // slicedIn
    if (orderedItemCopy.slicedIn == null) {
      if (orderedItemCopy.isMenuItemAPizza) {

        if (orderedItemCopy.unitOfMeasure?.toUpperCase() == UNITA_DI_MISURA.intera.toUpperCase()) {
          console.log("slicedIn is null")
          return;
        }
      }
      if (orderedItemCopy.isCanMenuItemBeSlicedUp) {
        console.log("slicedIn is null")
        return;
      }
    }

    // numberOf
    if (orderedItemCopy.numberOf == null) {
      console.log("numberOf is null")
      return;
    }

    // aggiungere il nuovo prezzo, 1 euro per ogni ingrediente aggiunto
    // attento che uno può aggiungere e rimuovere più ingredienti più volte

    //return the copy
    return orderedItemCopy;

  }

  function addItem() {

    // check fields and get a Copy
    var orderedItemCopy = checkOrderedItemFieldsAndGetCopy();

    // if true  one or more mandatory fields are empty
    if (orderedItemCopy == undefined)
      return;

    // useless but deletes compiler errors
    if (orderedItemCopy.menuItemCategory == null)
      return

    var orderedItemsByCategoriesCopy = getObjectDeepCopy(orderedItemsByCategory) as OrderedItemByCategories;
    addOrderedItemToOrderedItemByCategoriesObject(orderedItemsByCategoriesCopy, orderedItemCopy);
    setOrderedItemsByCategory(orderedItemsByCategoriesCopy);

    // reset
    resetFieldsAndOrderedItem();

    // reset creaButton
    setIsWasCreaButtonPressed(false);

    // reset selectedCreaCategory
    setSelectedCreaCategory("")

  }

  function removeIngredientFromOrderedItem(onClikEvent: MouseEvent<HTMLButtonElement>, ingredientName: string) {

    // cannot remove ingredient if menuItem has only one ingredient
    if (orderedItem.ingredients.length == 1) {
      if (!isWasCreaButtonPressed) {
        console.log("A menuItem with only one ingredient cannot exist in this particularly case")
        return;
      }
    }

    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem;
    orderedItemCopy.ingredients.splice(orderedItemCopy.ingredients.indexOf(ingredientName), 1) // remove ingredient

    if (!isWasCreaButtonPressed) {
      orderedItemCopy.isWereIngredientsModified = true;
      orderedItemCopy.removedIngredients.push(ingredientName);

      // do not ask if customer is intollerant to ingredient if it is an added ingredient
      if (!orderedItemCopy.addedIngredients.includes(ingredientName) && confirm(`Intollerante/Allergico a \"${ingredientName}\"?`)) {
        orderedItemCopy.intolleranzaA.push(ingredientName);
      }

    }

    setOrderedItem(orderedItemCopy);
  }

  function creaButtonWasPressed(onClickEvent: MouseEvent<HTMLButtonElement>) {
    setIsWasCreaButtonPressed(!isWasCreaButtonPressed);

    // reset
    resetFieldsAndOrderedItem();
  }

  function resetFieldsAndOrderedItem() {
    // clear the fields
    for (const [key, value] of Object.entries(inputs)) {
      if (value != null)
        value.value = ''
    }

    // clear currentMenuItem
    setOrderedItem({
      menuItem: null,
      isMenuItemAPizza: false,
      price: null,
      originalIngredients: [],
      ingredients: [],
      removedIngredients: [],
      addedIngredients: [],
      intolleranzaA: [],
      isWasMenuItemCreated: false,
      isWereIngredientsModified: false,
      isCanMenuItemBeSlicedUp: false,
      slicedIn: null,
      menuItemCategory: null,
      numberOf: null,
      unitOfMeasure: null,
      consegnato: false
    })

    // clear selectedCategory
    setSelectedCategory('');

    // show hidden input fields
    setIsInsertingMenuItemWithSearch(null);
  }

  function handleSelectedCreaCategory(onChangeEvent: ChangeEvent<HTMLSelectElement>) {

    var creaCategory = onChangeEvent.target.value;

    var orderedItemCopy = getObjectDeepCopy(orderedItem) as OrderedItem;


    if (creaCategory == CATEGORIE_CREA.pizza) {
      orderedItemCopy.isMenuItemAPizza = true;
      orderedItemCopy.isCanMenuItemBeSlicedUp = false;
    } else {
      orderedItemCopy.isMenuItemAPizza = false;
      orderedItemCopy.isCanMenuItemBeSlicedUp = true;
    }

    setOrderedItem(orderedItemCopy)
    setSelectedCreaCategory(creaCategory)
  }

  function placeAnOrder() {

    if (tableOrderInfo.numeroAdulti == null) {
      console.log("numero adulti is null")
      return;
    }

    var tableOrder: TableOrder = {
      dateAndTime: new Date(),
      tableOrderInfo: tableOrderInfo,
      orderedItemsByCategoriesArray: orderedItemsByCategoryArray
    }

    console.log("before placing the order", tableOrder)

    fetch("http://localhost:3000/home/order/api", {
      method: "POST",
      body: JSON.stringify(tableOrder),
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

      <div>
        <input
          type="checkbox"
          id="frittiPrimaDellaPizzaCheckbox"
          checked={tableOrderInfo.isFrittiPrimaDellaPizza}
          onChange={e => handleIsFrittiPrimaDellaPizzaChange(e)}
        />
        <label htmlFor="frittiPrimaDellaPizzaCheckbox">Fritti Prima della Pizza</label>
      </div>

      <div>
        <input
          type="checkbox"
          id="siDividonoLePizzeCheckbox"
          checked={tableOrderInfo.isSiDividonoLaPizza}
          onChange={e => handleIsSiDividonoLapizzaChange(e)}
        />
        <label htmlFor="siDividonoLePizzeCheckbox">Si dividono la pizza</label>

        {
          tableOrderInfo.isSiDividonoLaPizza &&
          <div>
            <label>Sliced in</label>
            <select
              value={tableOrderInfo.slicedIn != null ? tableOrderInfo.slicedIn : ''}
              onChange={e => handleSlicedInTableOrderInfoChange(e)}
            >
              <option value='' disabled></option>,
              {
                SLICED_IN_OPTIONS_ARRAY.map((option, i) => <option key={"slicedIn1_" + i} value={option}>{option}</option>,)
              }
            </select>
          </div>
        }
      </div>

      <div>
        <input
          type='number'
          placeholder='Numero adulti'
          min={0}
          onChange={e => handleNumberoAdultiChange(e)}
        />
      </div>

      <div>
        <input
          type='number'
          placeholder='Numero bambini'
          min={0}
          onChange={e => handleNumberoBambiniChange(e)}
        />
      </div>

      <div>
        <textarea
          value={tableOrderInfo.note == null ? '' : tableOrderInfo.note}
          onChange={e => handleNoteTextAreaChange(e)}
        />
      </div>

      <div>
        <button onClick={e => creaButtonWasPressed(e)}>Crea</button>
        {
          isWasCreaButtonPressed &&
          <div>
            <label>Selezione categoria:</label>
            <select
              value={selectedCreaCategory}
              onChange={e => handleSelectedCreaCategory(e)}
            >
              <option value='' disabled></option>,
              {
                CATEGORIE_CREA_ARRAY.map((creaCategory, i) => <option key={"creaCategory_" + creaCategory + i} value={creaCategory}>{creaCategory}</option>,)
              }
            </select>
          </div>
        }
      </div>

      {
        (isInsertingMenuItemWithSearch == null || isInsertingMenuItemWithSearch) && !isWasCreaButtonPressed &&
        <div className={styles.addItemToOrderDiv}>
          <input
            type='search'
            placeholder='Menu Item'
            list='menu-items-list'
            onChange={e => handleMenuItemChange(e)}
          />

          <datalist id="menu-items-list">
            {
              categoriesAndMenuItems.menuItems.map((menuItem, i) => <option key={"orderPage_" + menuItem + i} value={menuItem}></option>)
            }
          </datalist>

        </div>
      }

      {
        (isInsertingMenuItemWithSearch == null || !isInsertingMenuItemWithSearch) && !isWasCreaButtonPressed &&
        <div className={styles.addItemToOrderDiv}>
          <select
            value={selectedCategory}
            onChange={e => handleSelectCategoryChange(e)}
          >
            <option value='' ></option>
            {
              categoriesAndMenuItems.categories.map((category, i) => <option key={"orderPage_" + category + i} value={category}>{category}</option>)
            }
          </select>

          {
            selectedCategory != '' &&
            <select
              value={orderedItem.menuItem != null ? orderedItem.menuItem : ''}
              onChange={e => handleSelectMenuItemChange(e)}
            >
              <option value='' disabled></option>
              {
                getMenuItemsFromCategoryFromCategoriesWithMenuItemsObject(categoriesWithMenuItems, selectedCategory).map((menuItemInThisCategory, i) => <option key={"orderPage_menuItemInThisCategory" + i} value={menuItemInThisCategory}>{menuItemInThisCategory}</option>)
              }
            </select>
          }

        </div>
      }

      {
        (orderedItem.ingredients.length != 0 || isWasCreaButtonPressed) &&
        <div>
          {
            orderedItem.ingredients.map((ingredient, i) => <div key={"ingredient_" + ingredient + i}>
              <span>{ingredient}</span>
              <button onClick={e => removeIngredientFromOrderedItem(e, ingredient)}>X</button>
            </div>)
          }
          <input
            type='search'
            placeholder='Aggiungi Ingrediente'
            list='ingredients-list'
            value={addedIngredient}
            onChange={e => addIngredientToOrderedItem(e)}
          />

          <datalist id="ingredients-list">
            {
              ingredientiArray.map((ingredient, i) => <option key={"orderPage_" + ingredient.nome + i} value={ingredient.nome}></option>)
            }
          </datalist>
          <button onClick={addIngredient}>Add Ingredient</button>
        </div>
      }

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
              unitaDiMisuraArray.map((unitaDiMisura, i) => <option key={"orderPage_" + unitaDiMisura.nome + i} value={unitaDiMisura.nome}>{unitaDiMisura.nome}</option>)
            }
          </select>
        }

        {
          ((orderedItem.isMenuItemAPizza && (orderedItem.unitOfMeasure != null && orderedItem.unitOfMeasure.toUpperCase() != UNITA_DI_MISURA.pezzi.toUpperCase())) || orderedItem.isCanMenuItemBeSlicedUp) && !tableOrderInfo.isSiDividonoLaPizza &&
          <div>
            <label>Sliced in</label>
            <select
              value={orderedItem.slicedIn != null ? orderedItem.slicedIn : ''}
              onChange={e => handleSlicedInChange(e)}
            >
              <option value='' disabled></option>,
              {
                SLICED_IN_OPTIONS_ARRAY.map((option, i) => <option key={"slicedIn2_" + i} value={option}>{option}</option>,)
              }
            </select>
          </div>
        }

        <button onClick={() => addItem()}>Add Item</button>

      </div>


      {
        orderedItemsByCategoryArray.map((orderedItemByCategory, i) =>
          orderedItemByCategory.orderedItems.length != 0 &&
          <div
            key={"orderedItemByCategory_" + i}
          >

            <h2>{orderedItemByCategory.categoria.toUpperCase()}</h2>

            <div
              className={styles.orderedItemsInCategoryDiv}
            >
              {
                orderedItemByCategory.orderedItems.map((orderedItem, j) => <div
                  key={"orderedItem_" + j + "_inCategory_" + i}
                  className={styles.orderedItemDiv}
                >

                  <b>{orderedItem.numberOf} {orderedItem.unitOfMeasure?.toUpperCase()} - {orderedItem.menuItem?.toUpperCase()}</b>

                  {
                    orderedItem.slicedIn != null &&
                    <span>Tagliata in {orderedItem.slicedIn}</span>
                  }

                  {
                    orderedItem.ingredients.length != 0 &&
                    <div className={styles.ingredientsDiv}>
                      <span><strong>Ingredienti:</strong> {putIngredientsTogether(orderedItem.ingredients)}</span>
                      {
                        orderedItem.removedIngredients.length != 0 &&
                        <span><strong>Ingredienti tolti:</strong> {putIngredientsTogether(orderedItem.removedIngredients)}</span>
                      }
                      {
                        orderedItem.addedIngredients.length != 0 &&
                        <span><strong>Ingredienti aggiunti:</strong> {putIngredientsTogether(orderedItem.addedIngredients)}</span>
                      }
                    </div>
                  }
                  {
                    orderedItem.intolleranzaA.length != 0 &&
                    <span><strong>Intollerante a:</strong> {putIngredientsTogether(orderedItem.intolleranzaA)}</span>
                  }
                </div>)
              }
            </div>
          </div>)
      }


      <button onClick={placeAnOrder}>Order</button>
      <button onClick={() => router.push("/home")}>Back</button>

    </div >

  )
}
