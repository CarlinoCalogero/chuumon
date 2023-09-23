'use client'

import styles from './page.module.css'
import { useState, useEffect, ChangeEvent, MouseEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UnitaDiMisuraDatabaseTableRow } from '@/types/UnitaDiMisuraDatabaseTableRow';
import { OrderedItem } from '@/types/OrderedItem';
import { CATEGORIE_OLTRE_ALLA_PIZZA_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO, PIZZE_CATEGORIES, UNITA_DI_MISURA } from '@/lib/utils';
import { TableOrderInfo } from '@/types/TableOrderInfo';
import { MenuItemWithIngredientsMap } from '@/types/MenuItemWithIngredientsMap';
import { CategoryWithMenuItemsMap } from '@/types/CategoryWithMenuItemsMap';
import { OrderedItemByCategory } from '@/types/OrderedItemByCategory';
import { IngredienteDatabaseTableRow } from '@/types/IngredienteDatabaseTableRow';

type Inputs = {
  menuItem: EventTarget & HTMLInputElement | null,
  numberOf: EventTarget & HTMLInputElement | null
  addIngredient: EventTarget & HTMLInputElement | null
}

export default function Order() {

  const router = useRouter();

  const searchParams = useSearchParams()

  console.log(searchParams.get('tableNumber'))

  const [menuItemsWithIngredientsMap, setMenuItemsWithIngredientsMap] = useState<MenuItemWithIngredientsMap>(new Map());
  const [categoriesWithMenuItemsMap, setCategoriesWithMenuItemsMap] = useState<CategoryWithMenuItemsMap>(new Map());
  const [ingredientiArray, setIngredientiArray] = useState<IngredienteDatabaseTableRow[]>([]);
  const [unitaDiMisuraArray, setUnitaDiMisuraArray] = useState<UnitaDiMisuraDatabaseTableRow[]>([]);

  const [menuItemsArray, setMenuItemsArray] = useState<string[]>([]);
  const [categoriesArray, setCategoriesArray] = useState<string[]>([]);

  const [inputs, setInputs] = useState<Inputs>({
    menuItem: null,
    numberOf: null,
    addIngredient: null
  });

  const [isInsertingMenuItemWithSearch, setIsInsertingMenuItemWithSearch] = useState<boolean | null>(null);

  const [tableOrderInfo, setTableOrderInfo] = useState<TableOrderInfo>({
    isFrittiPrimaDellaPizza: true,
    isSiDividonoLaPizza: false,
    slicedIn: null
  });

  const [orderedItem, setOrderedItem] = useState<OrderedItem>({
    menuItem: null,
    menuItemCategory: null,
    price: null,
    ingredients: [],
    removedIngredients: [],
    addedIngredients: [],
    isWereIngredientsModified: false,
    isMenuItemAPizza: false,
    isCanMenuItemBeSlicedUp: false,
    slicedIn: null,
    numberOf: null,
    unitOfMeasure: null
  });

  const [orderedItemsByCategoriesMap, setOrderedItemsByCategoriesMap] = useState<OrderedItemByCategory>(new Map());
  const [orderedItemsByCategoriesArray, setOrderedItemsByCategoriesArray] = useState<{ categoria: string; orderedItem: OrderedItem[] }[]>([]);

  const [addedIngredient, setAddedIngredient] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  var slicedInOptionsArray = [2, 4, 6, 8]

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
        setMenuItemsWithIngredientsMap(new Map(Object.entries(data.menuItemsWithIngredientsMap)));
        setCategoriesWithMenuItemsMap(new Map(Object.entries(data.categoriesWithMenuItemsMap)))
        setIngredientiArray(data.ingredienti);
        setUnitaDiMisuraArray(data.unitaDiMisura);
      }); // Update the state with the fetched data

  }, [])

  useEffect(() => {
    var newMenuItemsArray: string[] = [];
    for (var key of menuItemsWithIngredientsMap.keys()) {
      newMenuItemsArray.push(key);
    }
    setMenuItemsArray(newMenuItemsArray)
  }, [menuItemsWithIngredientsMap])

  useEffect(() => {
    console.log("menuItemsArray", menuItemsArray);
  }, [menuItemsArray])

  useEffect(() => {
    var newCategoriesArray: string[] = [];
    for (var key of categoriesWithMenuItemsMap.keys()) {
      newCategoriesArray.push(key);
    }
    setCategoriesArray(newCategoriesArray)
  }, [categoriesWithMenuItemsMap])

  useEffect(() => {
    console.log("categoriesArray", categoriesArray);
  }, [categoriesArray])

  useEffect(() => {
    setOrderedItemsByCategoriesArray(Array.from(orderedItemsByCategoriesMap, ([categoria, orderedItem]) => ({ categoria, orderedItem })))
  }, [orderedItemsByCategoriesMap])

  useEffect(() => {
    console.log("orderedItemsByCategoriesArray", orderedItemsByCategoriesArray);
  }, [orderedItemsByCategoriesArray])

  useEffect(() => {
    console.log(orderedItem);
  }, [orderedItem])

  useEffect(() => {
    console.log(tableOrderInfo);
  }, [tableOrderInfo])

  useEffect(() => {
    console.log(isInsertingMenuItemWithSearch);
  }, [isInsertingMenuItemWithSearch])

  function getInputsCopy() {
    var inputsCopy: Inputs = {
      menuItem: inputs.menuItem,
      numberOf: inputs.numberOf,
      addIngredient: inputs.addIngredient
    }
    return inputsCopy;
  }

  function getOrderedItemCopy() {
    return JSON.parse(JSON.stringify(orderedItem)) as OrderedItem
  }

  function getTableOrderInfoCopy() {
    return JSON.parse(JSON.stringify(tableOrderInfo)) as TableOrderInfo
  }

  function getOrderedItemsByCategoriesCopy() {
    return new Map(orderedItemsByCategoriesMap)
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
    orderedItemCopy.price = getMenuItemPrice(menuItemName);
    orderedItemCopy.ingredients = getMenuItemIngredients(menuItemName);
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

    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.numberOf = Number(onChangeEvent.target.value)
    setOrderedItem(orderedItemCopy)
  }

  function handleSlicedInChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.slicedIn = Number(onChangeEvent.target.value)
    setOrderedItem(orderedItemCopy)
  }

  function handleSlicedInTableOrderInfoChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var tableOrderInfoCopy = getTableOrderInfoCopy();
    tableOrderInfoCopy.slicedIn = Number(onChangeEvent.target.value);
    setTableOrderInfo(tableOrderInfoCopy)
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

    // hide the other type of insert
    if (onChangeEvent.target.value == '') {
      setIsInsertingMenuItemWithSearch(null)
    } else {
      setIsInsertingMenuItemWithSearch(false);
    }
  }

  function handleSelectMenuItemChange(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    var menuItemName = onChangeEvent.target.value;
    var menuItemCategory = getMenuItemCategory(menuItemName)

    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.menuItem = menuItemName;
    orderedItemCopy.menuItemCategory = menuItemCategory;
    orderedItemCopy.price = getMenuItemPrice(menuItemName);
    orderedItemCopy.ingredients = getMenuItemIngredients(menuItemName);
    orderedItemCopy.isMenuItemAPizza = checkIfMenuItemIsAPizza(menuItemCategory)
    orderedItemCopy.isCanMenuItemBeSlicedUp = checkIfMenuItemCanBeSlicedUp(menuItemCategory)
    setOrderedItem(orderedItemCopy)
  }

  function handleIsFrittiPrimaDellaPizzaChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    var tableOrderInfoCopy = getTableOrderInfoCopy();
    tableOrderInfoCopy.isFrittiPrimaDellaPizza = onChangeEvent.target.checked;
    setTableOrderInfo(tableOrderInfoCopy)
  }

  function handleIsSiDividonoLapizzaChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {

    var newBooleanValue = onChangeEvent.target.checked;

    var tableOrderInfoCopy = getTableOrderInfoCopy();
    tableOrderInfoCopy.isSiDividonoLaPizza = newBooleanValue;
    if (newBooleanValue == false) {
      tableOrderInfoCopy.slicedIn = null;
    }
    setTableOrderInfo(tableOrderInfoCopy)
  }

  function getMenuItemsFromCategory(categoryName: string) {
    var returnValue: string[] | undefined;
    if (categoriesWithMenuItemsMap.has(categoryName))
      returnValue = categoriesWithMenuItemsMap.get(categoryName)

    if (returnValue != undefined)
      return returnValue;
    return [];
  }

  function getMenuItemPrice(menuItemName: string) {
    var menuItemPrice = -1;

    if (menuItemsWithIngredientsMap.has(menuItemName)) {
      var menuItemWithIngredient = menuItemsWithIngredientsMap.get(menuItemName);
      if (menuItemWithIngredient != undefined)
        menuItemPrice = menuItemWithIngredient.prezzo;
    }

    return menuItemPrice;
  }

  function getMenuItemIngredients(menuItemName: string) {
    var menuItemIngredients: string[] = [];

    console.log("ingredientiPrima", menuItemIngredients)

    if (menuItemsWithIngredientsMap.has(menuItemName)) {
      var menuItemWithIngredient = menuItemsWithIngredientsMap.get(menuItemName);
      if (menuItemWithIngredient != undefined)
        menuItemIngredients = menuItemWithIngredient.ingredienti;
    }

    if (menuItemIngredients[0] == null)
      menuItemIngredients = [];

    return menuItemIngredients;
  }

  function getMenuItemCategory(menuItemName: string) {

    var resultCategory = '';

    if (menuItemsWithIngredientsMap.has(menuItemName)) {
      var menuItemInfo = menuItemsWithIngredientsMap.get(menuItemName);
      if (menuItemInfo != undefined)
        resultCategory = menuItemInfo.categoria;
    }

    return resultCategory;

  }

  function checkIfMenuItemIsAPizza(menuItemCategory: string) {

    if (menuItemCategory == '')
      return false

    for (var count = 0; count < PIZZE_CATEGORIES.length; count++) {
      var currentPizzaCategoria = PIZZE_CATEGORIES[count];
      if (currentPizzaCategoria.toUpperCase() == menuItemCategory.toUpperCase())
        return true
    }

    return false;
  }

  function checkIfMenuItemCanBeSlicedUp(menuItemCategory: string) {

    if (menuItemCategory == '')
      return false

    for (var count = 0; count < CATEGORIE_OLTRE_ALLA_PIZZA_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO.length; count++) {
      var currentSlicedUpItemCategory = CATEGORIE_OLTRE_ALLA_PIZZA_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO[count];
      if (currentSlicedUpItemCategory.toUpperCase() == menuItemCategory.toUpperCase())
        return true
    }

    return false;
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
    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.ingredients.push(addedIngredient);
    orderedItemCopy.addedIngredients.push(addedIngredient);
    orderedItemCopy.isWereIngredientsModified = true;
    setOrderedItem(orderedItemCopy)

    //reset addedIngredient
    setAddedIngredient('');

    //clear input field
    if (inputs.addIngredient != null)
      inputs.addIngredient.value = ''
  }

  function addItem() {

    //check if all fields are not null
    for (const [key, value] of Object.entries(orderedItem)) {

      if (orderedItem.isMenuItemAPizza && value == null) { // orderedItem is a pizza
        if (key == "slicedIn" && orderedItem.unitOfMeasure != null && orderedItem.unitOfMeasure.toUpperCase() == UNITA_DI_MISURA.pezzi.toUpperCase()) {
          console.log("Pezzi cannot be sliced up")
        } else {
          console.log("orderedItem is a pizza &", key, "is null")
          return
        }
      } else if (!orderedItem.isMenuItemAPizza && key != "unitOfMeasure" && value == null) { // orderedItem is not a pizza
        if (key == "slicedIn" && !orderedItem.isCanMenuItemBeSlicedUp) {
          console.log("This item cannot be sliced up")
        } else {
          console.log("orderedItem is not a pizza &", key, "is null")
          return
        }

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
      price: null,
      ingredients: [],
      removedIngredients: [],
      addedIngredients: [],
      isWereIngredientsModified: false,
      isCanMenuItemBeSlicedUp: false,
      slicedIn: null,
      menuItemCategory: null,
      numberOf: null,
      unitOfMeasure: null
    })

    // clear selectedCategory
    setSelectedCategory('');

    if (orderedItem.menuItemCategory == null)
      return

    var orderedItemsByCategoriesCopy = getOrderedItemsByCategoriesCopy();
    if (orderedItemsByCategoriesCopy.has(orderedItem.menuItemCategory)) {
      orderedItemsByCategoriesCopy.get(orderedItem.menuItemCategory)?.push(orderedItem);
    } else {
      orderedItemsByCategoriesCopy.set(orderedItem.menuItemCategory, [orderedItem])
    }
    setOrderedItemsByCategoriesMap(orderedItemsByCategoriesCopy);

    // show hidden input fields
    setIsInsertingMenuItemWithSearch(null);

  }

  function removeIngredientFromOrderedItem(onClikEvent: MouseEvent<HTMLButtonElement>, ingredientName: string) {
    var orderedItemCopy = getOrderedItemCopy();
    orderedItemCopy.isWereIngredientsModified = true;
    orderedItemCopy.removedIngredients = [...orderedItemCopy.removedIngredients, ...orderedItemCopy.ingredients.splice(orderedItemCopy.ingredients.indexOf(ingredientName), 1)]
    setOrderedItem(orderedItemCopy);
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
                slicedInOptionsArray.map((option, i) => <option key={"slicedIn1_" + i} value={option}>{option}</option>,)
              }
            </select>
          </div>
        }
      </div>

      {
        (isInsertingMenuItemWithSearch == null || isInsertingMenuItemWithSearch) &&
        <div className={styles.addItemToOrderDiv}>
          <input
            type='search'
            placeholder='Menu Item'
            list='menu-items-list'
            onChange={e => handleMenuItemChange(e)}
          />

          <datalist id="menu-items-list">
            {
              menuItemsArray.map((menuItem, i) => <option key={"orderPage_" + menuItem} value={menuItem}></option>)
            }
          </datalist>

        </div>
      }

      {
        (isInsertingMenuItemWithSearch == null || !isInsertingMenuItemWithSearch) &&
        <div className={styles.addItemToOrderDiv}>
          <select
            value={selectedCategory}
            onChange={e => handleSelectCategoryChange(e)}
          >
            <option value='' ></option>
            {
              categoriesArray.map((category, i) => <option key={"orderPage_" + category} value={category}>{category}</option>)
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
                getMenuItemsFromCategory(selectedCategory).map((menuItemInThisCategory, i) => <option key={"orderPage_menuItemInThisCategory" + i} value={menuItemInThisCategory}>{menuItemInThisCategory}</option>)
              }
            </select>
          }

        </div>
      }

      {
        orderedItem.ingredients.length != 0 &&
        <div>
          {
            orderedItem.ingredients.map((ingredient, i) => <div key={"ingredient_" + ingredient}>
              <span>{ingredient}</span>
              <button onClick={e => removeIngredientFromOrderedItem(e, ingredient)}>X</button>
            </div>)
          }
          <input
            type='search'
            placeholder='Aggiungi Ingrediente'
            list='ingredients-list'
            onChange={e => addIngredientToOrderedItem(e)}
          />

          <datalist id="ingredients-list">
            {
              ingredientiArray.map((ingredient, i) => <option key={"orderPage_" + ingredient.nome} value={ingredient.nome}></option>)
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
              unitaDiMisuraArray.map((unitaDiMisura, i) => <option key={"orderPage_" + unitaDiMisura.nome} value={unitaDiMisura.nome}>{unitaDiMisura.nome}</option>)
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
                slicedInOptionsArray.map((option, i) => <option key={"slicedIn2_" + i} value={option}>{option}</option>,)
              }
            </select>
          </div>
        }

        <button onClick={() => addItem()}>Add Item</button>

      </div>


      {
        orderedItemsByCategoriesArray.map((orderedItemByCategory, i) =>
          orderedItemByCategory.orderedItem.length != 0 &&
          <div
            key={"orderedItemByCategory_" + i}
          >

            <h2>{orderedItemByCategory.categoria}</h2>

            <div className={styles.outerDiv}>
              {
                orderedItemByCategory.orderedItem.map((orderedItem, j) => <div key={"orderedItem_" + j + "_inCategory_" + i}>
                  <span>{orderedItem.numberOf} {orderedItem.menuItem} {orderedItem.isWereIngredientsModified && <strong>modificata</strong>} {orderedItem.unitOfMeasure} {orderedItem.slicedIn != null && `tagliata in ${orderedItem.slicedIn}`}</span>
                  {
                    orderedItem.ingredients.length != 0 &&
                    <div>
                      <span>Ingredienti:</span>
                      {
                        orderedItem.ingredients.map((ingredient, i) => <div key={"orderedItemModifiedIngredient_" + ingredient}>{ingredient}</div>)
                      }
                      {
                        orderedItem.removedIngredients.length != 0 &&
                        <div>
                          <span>Ingredienti tolti:</span>
                          {
                            orderedItem.removedIngredients.map((removedIngredient, i) => <div key={"orderedItemRemovedIngredient_" + removedIngredient}>{removedIngredient}</div>)
                          }
                        </div>
                      }
                      {
                        orderedItem.addedIngredients.length != 0 &&
                        <div>
                          <span>Ingredienti aggiunti:</span>
                          {
                            orderedItem.addedIngredients.map((newIngredient, i) => <div key={"orderedItemNewIngredient_" + newIngredient}>{newIngredient}</div>)
                          }
                        </div>
                      }
                    </div>
                  }
                </div>)
              }
            </div>
          </div>)
      }

      <button onClick={() => router.push("/home")}>Back</button>

    </div >

  )
}
