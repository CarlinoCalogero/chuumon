import { COPERTO_COSTA_EURO, getArrayFromOrderedItemsByCategoriesObject, getSameDayTimeDifference, getObjectDeepCopy, getPercentage, getTimeAsString, putIngredientsTogether } from '@/lib/utils';
import styles from './OrderSnippet.module.css'
import { Order } from '@/types/Order';
import { ChangeEvent, useEffect, useState } from 'react';
import { OrderedItemsByCategoriesArray } from '@/types/OrderedItemsByCategoriesArray';

interface OrderSnippetProps {
    order: Order,
    updateConsegnato: any
}

type DivFillArguments = {
    totalNumberOfOrderedItems: number,
    numberOfConsegnati: number,
}

export function OrderSnippet({ order, updateConsegnato }: OrderSnippetProps) {

    const [orderCopy, setOrderCopy] = useState<Order>(getObjectDeepCopy(order));
    const [orderedItemsByCategoriesArray, setOrderedItemsByCategoriesArray] = useState<OrderedItemsByCategoriesArray>([]);
    const [divFillArguments, setDivFillArguments] = useState<DivFillArguments>(countNumberOfConsegnati());

    useEffect(() => {

        console.log("orderCopy", orderCopy)
        setOrderedItemsByCategoriesArray(getArrayFromOrderedItemsByCategoriesObject(orderCopy.orderedItems))
        setDivFillArguments(countNumberOfConsegnati());
        console.log(divFillArguments)

    }, [orderCopy])

    const coperto = computeCoperto();
    const bill = computeBill();

    useEffect(() => {

        const minutes = 5;

        // reloads page every tot minutes
        setTimeout(() => {
            window.location.reload();
        }, minutes * 60 * 1000) // in milliseconds

    }, [])

    function computeBill() {

        var bill = 0;

        for (const [category, orderedItems] of Object.entries(orderCopy.orderedItems)) {

            orderedItems.orderedItems.forEach(orderedItem => {

                var price = orderedItem.price;

                if (price != null)
                    bill = bill + price;


            });

        }

        return bill + coperto;

    }

    function computeCoperto() {

        var coperto = 0;

        if (orderCopy.orderInfo.numeroAdulti != null)
            coperto = coperto + (orderCopy.orderInfo.numeroAdulti * COPERTO_COSTA_EURO.adulti);

        if (orderCopy.orderInfo.numeroBambini != null)
            coperto = coperto + (orderCopy.orderInfo.numeroBambini * COPERTO_COSTA_EURO.bambini);

        return coperto;
    }

    function handleConsegnaOrdine(onChangeEvent: ChangeEvent<HTMLInputElement>, category: string, orderedItemIndex: number) {

        let dummyOrder = getObjectDeepCopy(orderCopy) as Order;
        let newConsegnatoValue = !dummyOrder.orderedItems[category].orderedItems[orderedItemIndex].consegnato;
        let orderedItem = dummyOrder.orderedItems[category].orderedItems[orderedItemIndex];

        if (!window.confirm(`${orderedItem.consegnato ? "Confermi di segnare come non consegnato" : "Confermi di aver consegnato"} "${orderedItem.numberOf} ${orderedItem.unitOfMeasure} ${orderedItem.menuItem}"?`))
            return;

        orderedItem.consegnato = newConsegnatoValue;

        setOrderCopy(dummyOrder)

        updateConsegnato(dummyOrder, orderedItem, newConsegnatoValue)

    }

    function countNumberOfConsegnati() {

        let newDivFillArguments: DivFillArguments = {
            totalNumberOfOrderedItems: 0,
            numberOfConsegnati: 0,
        }

        for (const [category, orderedItems] of Object.entries(orderCopy.orderedItems)) {

            orderedItems.orderedItems.forEach(orderedItem => {

                newDivFillArguments.totalNumberOfOrderedItems = newDivFillArguments.totalNumberOfOrderedItems + 1;

                if (orderedItem.consegnato)
                    newDivFillArguments.numberOfConsegnati = newDivFillArguments.numberOfConsegnati + 1;



            });

        }

        return newDivFillArguments;

    }

    return (
        <div
            className={styles.outerDiv}
            style={
                {
                    background: `${divFillArguments.numberOfConsegnati == 0 ? "white" : `linear-gradient(to top, lightgoldenrodyellow ${getPercentage(divFillArguments.totalNumberOfOrderedItems, divFillArguments.numberOfConsegnati)}%, white ${getPercentage(divFillArguments.totalNumberOfOrderedItems, divFillArguments.totalNumberOfOrderedItems - divFillArguments.numberOfConsegnati)}%)`}`
                }
            }
        >

            <div className={styles.numeroComandaETavolo}>
                <div className={styles.comandaInfo}>
                    <span>Comanda n° {orderCopy.numeroOrdineProgressivoGiornaliero}</span>
                    <span>del {new Date(orderCopy.dateAndTime).toLocaleDateString()} ore {getTimeAsString(orderCopy.dateAndTime)}</span>
                </div>

                {
                    orderCopy.orderInfo.isTakeAway && orderCopy.orderInfo.pickUpTime != null ?
                        <div className={styles.takeAwayInfo}>
                            <span>Asporto {getTimeAsString(orderCopy.orderInfo.pickUpTime)}</span>
                            <span>Consegna in <strong>{getSameDayTimeDifference(new Date(), orderCopy.orderInfo.pickUpTime)}</strong></span>
                        </div>
                        :
                        <span>Tavolo {orderCopy.orderInfo.tableNumber}</span>
                }
            </div>

            <hr className={styles.line} />

            {
                !orderCopy.orderInfo.isTakeAway &&
                <div>
                    <div className={styles.infoComanda}>
                        <span>Fritti prima della pizza: {orderCopy.orderInfo.isFrittiPrimaDellaPizza ? "Si" : "No"}</span>
                        <span>Si dividono la pizza: {orderCopy.orderInfo.isSiDividonoLaPizza ? "Si" : "No"}</span>
                        {
                            orderCopy.orderInfo.isSiDividonoLaPizza == true &&
                            <span>Pizze tagliate in: {orderCopy.orderInfo.slicedIn}</span>
                        }
                        <span>Adulti: {orderCopy.orderInfo.numeroAdulti}</span>
                        {
                            orderCopy.orderInfo.numeroBambini != null &&
                            <span>Bambini: {orderCopy.orderInfo.numeroBambini}</span>
                        }
                        {
                            orderCopy.orderInfo.note != null &&
                            <span>Note: {orderCopy.orderInfo.note}</span>
                        }
                    </div>

                    <hr className={styles.line} />
                </div>
            }

            {

                orderedItemsByCategoriesArray.map((categoryWithOrderedItems, i) => <div key={"categoryWithOrderedItems_" + i}>

                    <h3>{categoryWithOrderedItems.categoria.toUpperCase()}</h3>

                    <div className={styles.orderedItemsInCategoryDiv}>

                        {
                            categoryWithOrderedItems.orderedItems.map((orderedItem, j) => <div key={"categoryWithOrderedItems_" + i + "_orderedItem_" + j}>

                                <div className={styles.orderedItemHeader}>

                                    <input
                                        type="checkbox"
                                        id="consegnatoOrderedItem"
                                        checked={orderedItem.consegnato}
                                        onChange={e => handleConsegnaOrdine(e, categoryWithOrderedItems.categoria, j)}
                                    />
                                    <label htmlFor="consegnatoOrderedItem">Consegnato</label>

                                    {
                                        orderedItem.slicedIn != null &&
                                        <div>
                                            {
                                                orderedItem.consegnato ?
                                                    <s>
                                                        <span className={styles.noNewLineText}>Tagliata in {orderedItem.slicedIn}</span>
                                                    </s>
                                                    :
                                                    <span className={styles.noNewLineText}>Tagliata in {orderedItem.slicedIn}</span>
                                            }
                                        </div>
                                    }

                                </div>

                                <div className={styles.orderedItemInnerDiv}>

                                    <div className={styles.orderedItemInfo}>

                                        {
                                            orderedItem.consegnato ?
                                                <s>
                                                    <b>{`${orderedItem.numberOf} ${orderedItem.unitOfMeasure?.toUpperCase()} - ${orderedItem.menuItem?.split("_")[0].toUpperCase()}`}</b>
                                                </s>
                                                :
                                                <b>{`${orderedItem.numberOf} ${orderedItem.unitOfMeasure?.toUpperCase()} - ${orderedItem.menuItem?.split("_")[0].toUpperCase()}`}</b>
                                        }


                                        {
                                            orderedItem.ingredients.length != 0 &&
                                            <div>
                                                {
                                                    orderedItem.consegnato ?
                                                        <s>
                                                            <span>{putIngredientsTogether(orderedItem.ingredients)}</span>
                                                        </s>
                                                        :
                                                        <span>{putIngredientsTogether(orderedItem.ingredients)}</span>
                                                }
                                            </div>

                                        }
                                        {
                                            orderedItem.intolleranzaA.length != 0 &&
                                            <div>
                                                {
                                                    orderedItem.consegnato ?
                                                        <s>
                                                            <span><b>Intolleranza:</b> {putIngredientsTogether(orderedItem.intolleranzaA)}</span>
                                                        </s>
                                                        :
                                                        <span><b>Intolleranza:</b> {putIngredientsTogether(orderedItem.intolleranzaA)}</span>
                                                }
                                            </div>
                                        }
                                    </div>

                                    <span className={styles.noNewLineText}>€ {orderedItem.price}</span>


                                </div>


                            </div>)
                        }

                    </div>

                </div>)

            }

            <hr className={styles.line} />

            {
                !orderCopy.orderInfo.isTakeAway &&
                <div>
                    <div className={styles.coperto}>
                        <div className={styles.copertoHeader}>
                            <span>Coperto:</span>
                            <span>€{coperto}</span>
                        </div>
                        {
                            orderCopy.orderInfo.numeroAdulti != null &&
                            <div className={styles.copertoDetails}>
                                <span>Adulti</span>
                                <span>{COPERTO_COSTA_EURO.adulti}x€{orderCopy.orderInfo.numeroAdulti}</span>
                            </div>
                        }
                        {
                            orderCopy.orderInfo.numeroBambini != null &&
                            <div>
                                <span>Bambini</span>
                                <span>{COPERTO_COSTA_EURO.bambini}x€{orderCopy.orderInfo.numeroBambini}</span>
                            </div>
                        }
                    </div>
                    <hr className={styles.line} />
                </div>
            }



            <div className={styles.bill}>
                <h2>Totale:</h2>
                <span>€ {bill}</span>
            </div>



        </div>
    )
}