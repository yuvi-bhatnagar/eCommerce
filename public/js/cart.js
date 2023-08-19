const container = document.getElementById("productContainer");

const popup = document.getElementById("popup");
const closeBtn = document.getElementById("closeBtn");
const detailButtons = document.getElementsByClassName("detail-button");

fetch("/cart-products")
  .then((response) => response.json())
  .then((data) => {
    addProducts(data.products);
    addDetailButtonListeners(data.products);
    addDeleteButtonListeners(data.products);
    addPlusButtonListeners(data.products);
    addMinusButtonListeners(data.products);
  })
  .catch((error) => console.error("Error fetching products:", error));

function addProducts(products) {
  if (products.length == 0) {
    const head = document.createElement("h1");
    head.classList.add("empty-cart");
    head.textContent = "Your Cart is empty !";
    container.appendChild(head);
  }
  products.forEach((product) => {
    createProductCard(product);
  });
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.classList.add("product-card");

  const img = document.createElement("img");
  img.classList.add("product-img");
  img.src = product.productImage;
  img.alt = product.productName;

  const name = document.createElement("h2");
  name.classList.add("product-name");
  name.textContent = product.productName;
  const price = document.createElement("h2");
  price.classList.add("product-price");
  price.textContent = "Price : Rs." + product.productPrice;

  const quantityContainer = document.createElement("div"); // Create a container for quantity and buttons
  quantityContainer.classList.add("quantity-container");
  const quantityLabel = document.createElement("h2");
  quantityLabel.classList.add("product-quantity-lbl");
  quantityLabel.textContent = "Quantity:";
  const decreaseButton = document.createElement("button");
  decreaseButton.classList.add("quantity-button-minus");
  decreaseButton.textContent = "-";
  const quantity = document.createElement("h2");
  quantity.classList.add("product-quantity");
  quantity.textContent = product.quantity;
  const increaseButton = document.createElement("button");
  increaseButton.classList.add("quantity-button-plus");
  increaseButton.textContent = "+";

  const detailButton = document.createElement("button");
  detailButton.classList.add("detail-button");
  detailButton.textContent = "Details";

  const Delete = document.createElement("button");
  Delete.classList.add("delete-button");
  Delete.textContent = "Delete";

  quantityContainer.appendChild(quantityLabel);
  quantityContainer.appendChild(decreaseButton);
  quantityContainer.appendChild(quantity);
  quantityContainer.appendChild(increaseButton);

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(price);
  card.appendChild(quantityContainer);
  card.appendChild(Delete);
  card.appendChild(detailButton);

  container.appendChild(card);
}

function addDetailButtonListeners(products) {
  container.addEventListener("click", (event) => {
    if (event.target.classList.contains("detail-button")) {
      const button = event.target;
      const productCard = button.closest(".product-card"); // Find the parent product card
      const index = Array.from(productCard.parentElement.children).indexOf(
        productCard
      );
      showPopup(products[index]);
    }
  });
}

function addDeleteButtonListeners(products) {
  container.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-button")) {
      const button = event.target;
      const productCard = button.closest(".product-card"); // Find the parent product card
      const index = Array.from(productCard.parentElement.children).indexOf(
        productCard
      );
      fetch("/deleteFromCart", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          user: products[index].user,
          product: products[index].productName,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.redirect) {
            window.location.href = data.redirect;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });
}

function addPlusButtonListeners(products) {
  container.addEventListener("click", (event) => {
    if (event.target.classList.contains("quantity-button-plus")) {
      const button = event.target;
      const productCard = button.closest(".product-card"); // Find the parent product card
      const index = Array.from(productCard.parentElement.children).indexOf(
        productCard
      );
      fetch("/increaseQuantity", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          user: products[index].user,
          product: products[index].productName,
          quantity: products[index].quantity
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.redirect) {
            window.location.href = data.redirect;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });
}

function addMinusButtonListeners(products) {
  container.addEventListener("click", (event) => {
    if (event.target.classList.contains("quantity-button-minus")) {
      const button = event.target;
      const productCard = button.closest(".product-card"); // Find the parent product card
      const index = Array.from(productCard.parentElement.children).indexOf(
        productCard
      );
      fetch("/decreaseQuantity", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          user: products[index].user,
          product: products[index].productName,
          quantity: products[index].quantity
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.redirect) {
            window.location.href = data.redirect;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });
}


function showPopup(product) {
  document.getElementById("popupProductName").textContent = product.productName;
  document.getElementById("popupProductPrice").textContent =
    "Price: Rs." + product.productPrice;
  document.getElementById("popupProductImage").src = product.productImage;
  document.getElementById("popupProductImage").alt = product.productName;
  document.getElementById("popupProductDesc").textContent = product.productDesc;
  popup.style.display = "block";
}
function closePopup() {
  popup.style.display = "none";
}

closeBtn.addEventListener("click", closePopup);
