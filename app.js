const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "jvh1pjdfrb1y",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "98folHB7yMFivnNExb1Cs0_x4U2ZQshmVRZmy2z6lWw"
});

//Variable
const productDOM = document.querySelector(".product-center");
let cartTotal = document.querySelector(".cart-total");
let cartItem = document.querySelector(".cart-items");
let cartContent = document.querySelector(".cart-content");
let cartItemDOM = document.querySelector(".your-cart-items");
let cartOverlay = document.querySelector(".cart-overlay");
let cartDOM = document.querySelector(".cart");

let cartBtn = document.querySelector(".cart-btn");
let closeCart = document.querySelector(".close-cart");
let clearCart = document.querySelector(".clear-cart");

let cart = [];
let buttonDOM = [];
//class
class Product {
  async getProduct() {
    try {
      let contentfull = await client.getEntries({
        content_type: "furniture"
      });
      // console.log(contentfull);

      // const result = await fetch("products.json");
      // const data = await result.json();
      let products = contentfull.items;
      products = products.map(product => {
        const { id } = product.sys;
        const { title, price } = product.fields;
        const image = product.fields.image.fields.file.url;
        return { id, title, price, image };
      });
      return products;
    } catch (error) {
      console.log("error");
    }
  }
}
class UI {
  displayProduct(products) {
    let result = "";
    products.map(product => {
      result += `
        <article class="product">
            <div class="img-container">
              <img class="product-img" src="${product.image}" alt"">
              <button class="add-to-cart" data-id="${product.id}"><i class="fa fa-cart-plus"></i>Add to cart</button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
          </article>
        `;
    });
    productDOM.innerHTML = result;
  }
  getProduct() {
    const buttonAddToCart = [...document.querySelectorAll(".add-to-cart")];
    buttonDOM = buttonAddToCart;
    buttonAddToCart.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.textContent = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", e => {
        e.target.textContent = "In Cart";
        e.target.disabled = true;
        // get product
        const cartItems = { ...Storage.getProducts(id), amount: 1 };
        // add product to cart
        cart = [...cart, cartItems];
        // save cart
        Storage.saveCarts(cart);
        //set cart value
        this.setCartValue(cart);
        // display cart items
        this.showCartItem(cartItems);
        // show cart
        this.showCart();
      });
    });
  }
  setCartValue(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.textContent = parseFloat(tempTotal.toFixed(2));
    cartItem.textContent = itemsTotal;
  }

  showCartItem(cartItems) {
    let div = document.createElement("div");
    div.classList.add("your-cart-items");
    div.innerHTML = `
              <img src=${cartItems.image} alt="product" />
              <div class="info-items">
                <h1 class="">${cartItems.title}</h1>
                <h2 class="">$${cartItems.price}</h2>
                <span class="remove-cart" data-id=${cartItems.id}>remove</span>
              </div>
              <div class="cart-mount">
                <i class="fa fa-chevron-up" data-id=${cartItems.id}></i>
                <p class="mount">${cartItems.amount}</p>
                <i class="fa fa-chevron-down" data-id=${cartItems.id}></i>
              </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("showCartOverlay");
    cartDOM.classList.add("transcart");
  }
  setupApp() {
    cart = Storage.getCarts();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCart.addEventListener("click", this.hideCart);
  }
  populateCart() {
    cart.map(item => this.showCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("showCartOverlay");
    cartDOM.classList.remove("transcart");
  }
  cartLogic() {
    clearCart.addEventListener("click", () => {
      this.clearCart();
    });
    cartDOM.addEventListener("click", e => {
      if (e.target.classList.contains("remove-cart")) {
        let id = e.target.dataset.id;
        let cartItems = cart.find(item => item.id === id);
        this.removeCart(id);
        cartContent.removeChild(e.target.parentElement.parentElement);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        let id = e.target.dataset.id;
        let cartItems = cart.find(item => item.id === id);
        cartItems.amount += 1;
        e.target.nextElementSibling.textContent = cartItems.amount;
        Storage.saveCarts(cart);
        this.setCartValue(cart);
      } else if (e.target.classList.contains("fa-chevron-down")) {
        let id = e.target.dataset.id;
        let cartItems = cart.find(item => item.id === id);
        cartItems.amount -= 1;
        console.log(cartItems.amount);
        if (cartItems.amount == 0) {
          this.removeCart(id);
          cartContent.removeChild(e.target.parentElement.parentElement);
        }
        e.target.previousElementSibling.textContent = cartItems.amount;
        Storage.saveCarts(cart);
        this.setCartValue(cart);
      }
    });
  }
  clearCart() {
    let cartItem = cart.map(item => item.id);
    cartItem.forEach(id => this.removeCart(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeCart(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValue(cart);
    Storage.saveCarts(cart);
    let button = this.getSingleItem(id);
    button.disabled = false;
    button.innerHTML = `<i class="fa fa-cart-plus"></i>Add to cart`;
  }
  getSingleItem(id) {
    return buttonDOM.find(button => button.dataset.id === id);
  }
}
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProducts(id) {
    const products = JSON.parse(localStorage.getItem("products")).find(
      product => product.id === id
    );
    return products;
  }
  static saveCarts(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCarts() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Product();
  const ui = new UI();
  ui.setupApp();
  products
    .getProduct()
    .then(products => {
      ui.displayProduct(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getProduct();
      ui.cartLogic();
    });
});
