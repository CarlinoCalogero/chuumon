import { miao } from '@/api/api'
import styles from './page.module.css'

export default function Home() {

  (async () => {
    var bu = JSON.stringify(await miao());
    var magico = JSON.parse(bu);
    console.log(magico);
  })()

  return (
    <div>
      uff
    </div>
  )
}
