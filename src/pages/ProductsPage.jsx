import ProductList from "../components/ProductList"

function ProductsPage({ products, addToCart }) {
  return (
    <main className="product-main">
      <div className="container-main">
        <ProductList products={products} addToCart={addToCart} />
      </div>
    </main>
  )
}

export default ProductsPage
