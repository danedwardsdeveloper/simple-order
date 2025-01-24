import { bakeryItems } from '@/library/tempData/bakeryItems'

import AddItemButton from './components/AddItemButton'
import InventoryList from './components/InventoryList'

export default function InventoryPage() {
  const bakeryItemsArray = Object.values(bakeryItems)

  return (
    <>
      <h1>Inventory</h1>
      <AddItemButton classes="mb-8" />
      <InventoryList items={bakeryItemsArray} />
    </>
  )
}