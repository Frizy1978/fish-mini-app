import { CartProvider } from "../features/cart/cart-store";

import { MiniApp } from "./mini-app";

export default function HomePage() {
  return (
    <CartProvider>
      <MiniApp />
    </CartProvider>
  );
}
