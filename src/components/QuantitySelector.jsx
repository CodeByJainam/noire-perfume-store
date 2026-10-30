import { useState } from "react"

function QuantitySelector() {
  const [quantity, setQuantity] = useState(1)

  function increaseQuantity() {
    setQuantity(quantity + 1)
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="quantity-selector">
      <button onClick={decreaseQuantity}>−</button>

      <span>{quantity}</span>

      <button onClick={increaseQuantity}>+</button>
    </div>
  )
}

export default QuantitySelector
