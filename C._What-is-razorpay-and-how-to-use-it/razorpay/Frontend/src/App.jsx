import React, { useEffect, useState } from "react";
import api from "./api/axios";
import "./App.css";
import PaymentButton from './components/PaymentButton';



export default function App() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    api.get("/api/products/get-item")
      .then((res) => {
        const rawProd = res.data?.product ?? res.data?.products ?? null;
        if (!rawProd) throw new Error("No product found");

        const normalizedProduct = {
          ...rawProd,
          price: {
            ...rawProd.price,
            ammount: rawProd.price?.ammount ?? 0,
          },
        };

        setProduct(normalizedProduct);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);


  const formatPrice = (amt) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amt ?? 0);

  return (
    <div className="app-root">
      <main className="container">
        {/* LAYOUT NEVER UNMOUNTS */}
        <article className="product-card">
          {loading && (
            <div style={{ fontSize: 18, opacity: 0.8 }}>
              Loading product…
            </div>
          )}


          {!loading && error && <div>{error}</div>}

          {!loading && product && (
            <>
              <figure className="product-media">
                <img src={product.image} alt={product.title} />
              </figure>

              <div>
                <span className="category">{product.category}</span>
                <h1 className="title">{product.title}</h1>
                <p className="desc">{product.description}</p>

                <div className="buy">
                  <div>{formatPrice(product.price?.ammount)}</div>
                  <div className="actions">
                    <button className="btn btn-secondary">
                      Add to Cart
                    </button>
                    <PaymentButton/>
                  </div>
                </div>
              </div>
            </>
          )}
        </article>
      </main>
    </div>
  );
}
