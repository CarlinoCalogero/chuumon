import { useEffect, useState } from 'react';
import styles from './page.module.css'

export default async function Home() {

  async function getApiData() {
    const res = await (await fetch('http://localhost:3000/api')).json();
    return res.data;
  }

  type Miao = {
    id: number,
    nome: string
  }

  const miagolo = await getApiData();

  return (
    <div>
      {
        miagolo.map((uff: Miao, i: number) => <span key={"uff" + i}>
          {uff.nome}
        </span>)
      }
    </div>
  )
}
