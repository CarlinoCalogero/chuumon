import { COPERTO_COSTA_EURO, getArrayFromOrderedItemsByCategoriesObject, getObjectDeepCopy } from '@/lib/utils';
import styles from './OrderSnippet.module.css'
import { Order } from '@/types/Order';
import { ChangeEvent, useEffect, useState } from 'react';
import { OrderedItemsByCategoriesArray } from '@/types/OrderedItemsByCategoriesArray';
import { OrderedItem } from '@/types/OrderedItem';

interface OrderSnippetProps {
    orderNumber: number,
    order: Order
}

export function OrderSnippet({ orderNumber, order }: OrderSnippetProps) {

    const [orderCopy, setOrderCopy] = useState<Order>(getObjectDeepCopy(order));
    const [orderedItemsByCategoriesArray, setOrderedItemsByCategoriesArray] = useState<OrderedItemsByCategoriesArray>([]);

    useEffect(() => {

        console.log("orderCopy", orderCopy)
        setOrderedItemsByCategoriesArray(getArrayFromOrderedItemsByCategoriesObject(orderCopy.orderedItems))

    }, [orderCopy])

    const coperto = computeCoperto();
    const bill = computeBill();

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

        var dummyOrder = getObjectDeepCopy(orderCopy) as Order;
        dummyOrder.orderedItems[category].orderedItems[orderedItemIndex].consegnato = !dummyOrder.orderedItems[category].orderedItems[orderedItemIndex].consegnato;

        setOrderCopy(dummyOrder)


    }

    return (
        <div className={styles.outerDiv}>

            <div className={styles.numeroComandaETavolo}>
                <span>Comanda n° {orderCopy.numeroOrdineProgressivoGiornaliero}</span>
                <span>Tavolo {orderCopy.orderInfo.tableNumber}</span>
            </div>

            <span>Il {new Date(orderCopy.dateAndTime).toLocaleDateString()} {new Date(orderCopy.dateAndTime).toLocaleTimeString()}</span>

            <hr className={styles.line} />

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

            {

                orderedItemsByCategoriesArray.map((categoryWithOrderedItems, i) => <div key={"categoryWithOrderedItems_" + i}>

                    <h3>{categoryWithOrderedItems.categoria.toUpperCase()}</h3>

                    {
                        categoryWithOrderedItems.orderedItems.map((orderedItem, j) => <div key={"categoryWithOrderedItems_" + i + "_orderedItem_" + j}>

                            <div>

                                {
                                    orderedItem.slicedIn != null &&
                                    <span className={styles.noNewLineText}>Tagliata in {orderedItem.slicedIn}</span>
                                }

                                <input
                                    type="checkbox"
                                    id="consegnatoOrderedItem"
                                    checked={orderedItem.consegnato}
                                    onChange={e => handleConsegnaOrdine(e, categoryWithOrderedItems.categoria, j)}
                                />
                                <label htmlFor="consegnatoOrderedItem">Consegnato</label>
                            </div>

                            <div className={styles.orderedItemInnerDiv}>

                                <div className={styles.orderedItemInfo}>
                                    <b>{`${orderedItem.numberOf} ${orderedItem.unitOfMeasure?.toUpperCase()} - ${orderedItem.menuItem?.split("_")[0].toUpperCase()}`}</b>
                                    {
                                        orderedItem.ingredients.length != 0 &&
                                        <span>{orderedItem.ingredients.toString()}</span>
                                    }
                                    {
                                        orderedItem.intolleranzaA.length != 0 &&
                                        <span><b>Intolleranza:</b> {orderedItem.intolleranzaA.toString()}</span>
                                    }
                                </div>

                                <span className={styles.noNewLineText}>€ {orderedItem.price}</span>


                            </div>


                        </div>)
                    }

                </div>)

            }

            <hr className={styles.line} />

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

            <div className={styles.bill}>
                <h2>Totale:</h2>
                <span>€ {bill}</span>
            </div>



        </div>
    )
}