const container = document.getElementById("productContainer");
const loadMoreBtn = document.getElementById("loadMoreBtn");
let currentProductIndex = 0;

// for pop up window
const popup = document.getElementById("popup");
const closeBtn = document.getElementById("closeBtn");
const detailButtons = document.getElementsByClassName("detail-button");

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

  const detailButton = document.createElement("button");
  detailButton.classList.add("detail-button");
  detailButton.textContent = "Details";

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(detailButton);

  container.appendChild(card);
}

function addProducts(products) {
  let count=5;
  let n=currentProductIndex;
  products.forEach((product) => {
    if(n<=0 && count>0){
      createProductCard(product);
      count--;
    }
    n--;
  });

  currentProductIndex +=5;
  if (currentProductIndex >= totalProductCount) {
    loadMoreBtn.style.display = "none";
  }
}

loadMoreBtn.addEventListener("click", () => {
  fetch('/get-products')
    .then((response) => response.json())
    .then((data) => {
      addProducts(data.products);
      addDetailButtonListeners(data.products)//product detail is accessible there
    })
    .catch((error) => console.error("Error fetching products:", error));
});

let totalProductCount = 0;
// to get the total product count
fetch("/get-products-count")
  .then((response) => response.json())
  .then((data) => {
    totalProductCount = data.count;
})
.catch((error) => console.error("Error fetching product count:", error));

loadMoreBtn.click();

function addDetailButtonListeners(products) {
  container.addEventListener("click", (event) => {
    if (event.target.classList.contains("detail-button")) {
        const button = event.target;
        const productCard = button.closest(".product-card"); // Find the parent product card
        const index = Array.from(productCard.parentElement.children).indexOf(productCard);

        showPopup(products[index]);
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
