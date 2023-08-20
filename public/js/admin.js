const container = document.getElementById("productContainer");

fetch("/get-products")
  .then((response) => response.json())
  .then((data) => {
    addProducts(data.products);
    // addDetailButtonListeners(data.products);
    // addUpdateButtonListeners(data.products);
  })
  .catch((error) => console.error("Error fetching products:", error));

function addProducts(products) {
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
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/adminUpdate?curProduct=" + product.productName;
    const nameInput = createInputLabel("Name:", product.productName, "text","name");
    const priceInput = createInputLabel("Price:", product.productPrice, "number","price");
    const descriptionInput = createInputLabel("Description:", product.productDesc, "text-area","description");
    const quantityInput = createInputLabel("Quantity:",product.quantity, "number","quantity");
    const updateButton = document.createElement("button");
    updateButton.classList.add("update-button");
    updateButton.type = "submit";
    updateButton.name="action";
    updateButton.value="update";
    updateButton.textContent = "Update";
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "submit";
    deleteButton.name="action";
    deleteButton.value="delete";
    form.appendChild(nameInput);
    form.appendChild(priceInput);
    form.appendChild(descriptionInput);
    form.appendChild(quantityInput);
    form.appendChild(updateButton);
    form.appendChild(deleteButton);
    card.appendChild(img);
    card.appendChild(form);
    container.appendChild(card);
}

function createInputLabel(labelText, inputPlaceholder, inputType,name) {
  const inputDiv = document.createElement("div");
  const label = document.createElement("label");
  label.classList.add("input-label");
  label.textContent = labelText;
  inputDiv.appendChild(label);
  if(inputType === "text-area") {
    const textarea = document.createElement("textarea");
    textarea.placeholder = inputPlaceholder;
    textarea.style.resize ="none";
    textarea.classList.add("input-area");
    textarea.name = name;
    inputDiv.appendChild(textarea);
  }
  else{
      const input = document.createElement("input");
      input.type = inputType;
      input.classList.add("input-area");
      input.name=name;
      input.placeholder = inputPlaceholder;
      inputDiv.appendChild(input);
  }
  return inputDiv;
}
