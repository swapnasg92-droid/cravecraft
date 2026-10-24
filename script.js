/* ==========================================
   CRAVECRAFT - MAIN JAVASCRIPT
   ========================================== */


/* ==========================================
   1. LOCAL STORAGE HELPERS
   ========================================== */

function getStorage(key, fallback = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error("Storage error:", error);
        return fallback;
    }
}

function saveStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getCart() {
    return getStorage("craveCraftCart", []);
}

function saveCart(cart) {
    saveStorage("craveCraftCart", cart);
}

function getUsers() {
    return getStorage("craveCraftUsers", []);
}

function getOrders() {
    return getStorage("craveCraftOrders", []);
}


/* ==========================================
   2. CART FUNCTIONS
   ========================================== */

function addToCart(name, price, image = "") {

    const cart = getCart();

    const itemName = String(name).trim();
    const itemPrice = Number(price);

    if (!itemName || !Number.isFinite(itemPrice) || itemPrice < 0) {
        alert("Invalid food item. Please try again.");
        return;
    }

    const existingItem = cart.find(function (item) {
        return item.name === itemName;
    });

    if (existingItem) {
        existingItem.quantity = Number(existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            image: image,
            quantity: 1
        });
    }

    saveCart(cart);

    updateCartCount();

    alert(itemName + " added to your cart!");

    console.log("Updated cart:", getCart());
}


function getCartCount() {

    return getCart().reduce(function (total, item) {
        return total + Number(item.quantity || 1);
    }, 0);

}


function getCartTotal() {

    return getCart().reduce(function (total, item) {
        return total + Number(item.price) * Number(item.quantity || 1);
    }, 0);

}


function updateCartCount() {

    const count = getCartCount();

    const elements = document.querySelectorAll(
        "#cartCount, #cart-count, .cart-count"
    );

    elements.forEach(function (element) {
        element.textContent = count;
    });

}


function formatPrice(amount) {
    return "₹" + Number(amount).toFixed(2);
}


function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];

    });

}


/* ==========================================
   3. DISPLAY CART ITEMS
   ========================================== */

function renderCart() {

    const container = document.getElementById("cartItems");

    if (!container) {
        return;
    }

    const cart = getCart();

    if (cart.length === 0) {

        container.innerHTML = `
            <div class="cart-empty">
                <h2>Your cart is empty!</h2>
                <p>Add some delicious food to get started.</p>
                <a href="menu.html">Explore Menu</a>
            </div>
        `;

        updateCartSummary();
        return;
    }

    container.innerHTML = cart.map(function (item, index) {

        return `
            <div class="cart-item">

                <div class="cart-item-details">

                    <h3>${escapeHTML(item.name)}</h3>

                    <p>
                        Price:
                        ${formatPrice(item.price)}
                    </p>

                    <p>
                        Quantity:
                        ${Number(item.quantity || 1)}
                    </p>

                    <p>
                        Subtotal:
                        ${formatPrice(
                            Number(item.price) *
                            Number(item.quantity || 1)
                        )}
                    </p>

                </div>

                <div class="cart-item-actions">

                    <button
                        type="button"
                        onclick="updateQuantity(${index}, -1)">
                        -
                    </button>

                    <button
                        type="button"
                        onclick="updateQuantity(${index}, 1)">
                        +
                    </button>

                    <button
                        type="button"
                        onclick="removeFromCart(${index})">
                        Remove
                    </button>

                </div>

            </div>
        `;

    }).join("");

    updateCartSummary();

}


function updateCartSummary() {

    const subtotal = getCartTotal();

    const delivery = subtotal > 0 ? 40 : 0;

    const total = subtotal + delivery;

    const subtotalElement = document.getElementById("cartSubtotal");
    const deliveryElement = document.getElementById("deliveryFee");
    const totalElement = document.getElementById("cartTotal");

    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal);
    }

    if (deliveryElement) {
        deliveryElement.textContent = formatPrice(delivery);
    }

    if (totalElement) {
        totalElement.textContent = formatPrice(total);
    }

}


function updateQuantity(index, change) {

    const cart = getCart();

    if (!cart[index]) {
        return;
    }

    cart[index].quantity =
        Number(cart[index].quantity || 1) + Number(change);

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart(cart);

    renderCart();
    updateCartCount();

}


function removeFromCart(index) {

    const cart = getCart();

    if (index < 0 || index >= cart.length) {
        return;
    }

    cart.splice(index, 1);

    saveCart(cart);

    renderCart();
    updateCartCount();

}


function clearCart() {

    if (getCart().length === 0) {
        alert("Your cart is already empty.");
        return;
    }

    if (confirm("Do you want to remove all items from your cart?")) {

        saveCart([]);

        renderCart();
        updateCartCount();

    }

}


function displayCartPage() {
    renderCart();
}


function goToCheckout() {

    if (getCart().length === 0) {
        alert("Please add food to your cart first.");
        return;
    }

    window.location.href = "checkout.html";

}


/* ==========================================
   4. FOOD BUILDER
   ========================================== */

function addCustomFoodToCart() {

    const foodNameInput = document.getElementById("foodName");
    const baseInput = document.getElementById("foodBase");
    const proteinInput = document.getElementById("foodProtein");
    const toppingInput = document.getElementById("foodTopping");

    const selectedFoodInput =
        document.querySelector('input[name="foodBase"]:checked');

    const selectedProteinInput =
        document.querySelector('input[name="foodProtein"]:checked');

    const selectedToppingInput =
        document.querySelector('input[name="foodTopping"]:checked');

    const foodName = foodNameInput
        ? foodNameInput.value.trim()
        : "Custom Meal";

    const base = selectedFoodInput
        ? selectedFoodInput.value
        : (baseInput ? baseInput.value : "");

    const protein = selectedProteinInput
        ? selectedProteinInput.value
        : (proteinInput ? proteinInput.value : "");

    const topping = selectedToppingInput
        ? selectedToppingInput.value
        : (toppingInput ? toppingInput.value : "");

    const selectedOptions = [base, protein, topping].filter(Boolean);

    if (selectedOptions.length === 0) {
        alert("Please select your food ingredients first.");
        return;
    }

    let price = 100;

    const priceElement = document.getElementById("builderPrice");

    if (priceElement) {

        const extractedPrice = Number(
            priceElement.textContent.replace(/[^\d.]/g, "")
        );

        if (Number.isFinite(extractedPrice) && extractedPrice > 0) {
            price = extractedPrice;
        }

    }

    const customName = foodName || "Custom Meal";

    const description = selectedOptions.join(", ");

    addToCart(
        customName + " (" + description + ")",
        price
    );

}


/* ==========================================
   5. REGISTER VALIDATION
   ========================================== */

function registerUser(event) {

    if (event) {
        event.preventDefault();
    }

    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const phoneInput = document.getElementById("registerPhone");
    const passwordInput = document.getElementById("registerPassword");

    if (!nameInput || !emailInput || !passwordInput) {
        alert("Registration form fields were not found.");
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const password = passwordInput.value;

    // Name: letters and spaces only.
    if (!/^[A-Za-z ]+$/.test(name)) {
        alert("Name must contain letters and spaces only.");
        nameInput.focus();
        return;
    }

    // Email validation.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    // Phone: exactly 10 digits.
    if (phoneInput && !/^\d{10}$/.test(phone)) {
        alert("Phone number must contain exactly 10 digits.");
        phoneInput.focus();
        return;
    }

    // Password: uppercase, lowercase, number, special character.
    const strongPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/;

    if (!strongPassword.test(password)) {
        alert(
            "Password must have at least 8 characters, " +
            "including uppercase, lowercase, a number, " +
            "and a special character."
        );

        passwordInput.focus();
        return;
    }

    const users = getUsers();

    const existingUser = users.find(function (user) {
        return user.email.toLowerCase() === email;
    });

    if (existingUser) {
        alert("This email is already registered. Please log in.");
        return;
    }

    const newUser = {
        name: name,
        email: email,
        phone: phone,
        password: password
    };

    users.push(newUser);

    saveStorage("craveCraftUsers", users);

    alert("Registration successful! You can now log in.");

    window.location.href = "login.html";

}


/* ==========================================
   6. LOGIN
   ========================================== */

function loginUser(event) {

    if (event) {
        event.preventDefault();
    }

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    if (!emailInput || !passwordInput) {
        alert("Login form fields were not found.");
        return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    const users = getUsers();

    const user = users.find(function (item) {

        return item.email.toLowerCase() === email &&
               item.password === password;

    });

    if (!user) {
        alert("Incorrect email or password.");
        return;
    }

    saveStorage("craveCraftLoggedInUser", {
        name: user.name,
        email: user.email
    });

    saveStorage("craveCraftCurrentUser", {
        name: user.name,
        email: user.email
    });

    alert("Welcome back, " + user.name + "!");

    window.location.href = "home.html";

}


function logoutUser() {

    localStorage.removeItem("craveCraftLoggedInUser");
    localStorage.removeItem("craveCraftCurrentUser");

    alert("You have been logged out.");

    window.location.href = "login.html";

}


/* ==========================================
   7. CHECKOUT PAYMENT OPTIONS
   ========================================== */

function updatePaymentFields() {

    const paymentInputs =
        document.querySelectorAll('input[name="payment"]');

    let payment = "";

    paymentInputs.forEach(function (input) {

        if (input.checked) {
            payment = input.value.toLowerCase();
        }

    });

    const upiFields = document.getElementById("upiFields");
    const cardFields = document.getElementById("cardFields");

    if (upiFields) {
        upiFields.style.display =
            payment.includes("upi") ? "block" : "none";
    }

    if (cardFields) {
        cardFields.style.display =
            payment.includes("card") ? "block" : "none";
    }

}


/* ==========================================
   8. CHECKOUT SUMMARY
   ========================================== */

function displayCheckoutSummary() {

    const summary = document.getElementById("checkoutSummary");

    if (!summary) {
        return;
    }

    const cart = getCart();

    if (cart.length === 0) {

        summary.innerHTML = `
            <p>Your cart is empty.</p>
            <a href="menu.html">Go to Menu</a>
        `;

        return;
    }

    const subtotal = getCartTotal();
    const delivery = 40;
    const total = subtotal + delivery;

    const itemsHTML = cart.map(function (item) {

        return `
            <p>
                ${escapeHTML(item.name)}
                × ${Number(item.quantity || 1)}
                — ${formatPrice(
                    Number(item.price) * Number(item.quantity || 1)
                )}
            </p>
        `;

    }).join("");

    summary.innerHTML = `
        <h3>Order Summary</h3>

        ${itemsHTML}

        <hr>

        <p>Subtotal: ${formatPrice(subtotal)}</p>

        <p>Delivery: ${formatPrice(delivery)}</p>

        <h3>Total: ${formatPrice(total)}</h3>
    `;

}


/* ==========================================
   9. PLACE ORDER
   ========================================== */

function placeOrder(event) {

    if (event) {
        event.preventDefault();
    }

    const cart = getCart();

    if (cart.length === 0) {
        alert("Your cart is empty. Please add food first.");
        return;
    }

    const nameInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("customerPhone");
    const cityInput = document.getElementById("customerCity");
    const addressInput = document.getElementById("customerAddress");

    if (!nameInput || !phoneInput || !cityInput || !addressInput) {
        alert("Please check the checkout form fields.");
        return;
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const city = cityInput.value.trim();
    const address = addressInput.value.trim();

    if (!/^[A-Za-z ]+$/.test(name)) {
        alert("Name must contain letters and spaces only.");
        nameInput.focus();
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        alert("Phone number must contain exactly 10 digits.");
        phoneInput.focus();
        return;
    }

    if (!/^[A-Za-z ]+$/.test(city)) {
        alert("City must contain letters and spaces only.");
        cityInput.focus();
        return;
    }

    if (!address) {
        alert("Please enter your delivery address.");
        addressInput.focus();
        return;
    }

    const paymentInput =
        document.querySelector('input[name="payment"]:checked');

    if (!paymentInput) {
        alert("Please select a payment method.");
        return;
    }

    const payment = paymentInput.value.toLowerCase();

    // Check UPI details if UPI is selected.
    if (payment.includes("upi")) {

        const upiInput = document.getElementById("upiId");

        if (upiInput && !upiInput.value.trim()) {
            alert("Please enter your UPI ID.");
            upiInput.focus();
            return;
        }

    }

    // Check card details if card is selected.
    if (payment.includes("card")) {

        const cardNumber = document.getElementById("cardNumber");
        const cardName = document.getElementById("cardName");
        const expiry = document.getElementById("cardExpiry");

        const verificationCode =
            document.getElementById("verificationCode") ||
            document.getElementById("cardCVV");

        if (cardNumber && !cardNumber.value.trim()) {
            alert("Please enter the card number.");
            cardNumber.focus();
            return;
        }

        if (cardName && !cardName.value.trim()) {
            alert("Please enter the name on the card.");
            cardName.focus();
            return;
        }

        if (expiry && !expiry.value.trim()) {
            alert("Please enter the card expiry date.");
            expiry.focus();
            return;
        }

        if (verificationCode && !verificationCode.value.trim()) {
            alert("Please enter the card verification code.");
            verificationCode.focus();
            return;
        }

    }

    const subtotal = getCartTotal();
    const delivery = 40;

    const order = {

        orderId: "CC" + Date.now(),

        customerName: name,
        phone: phone,
        city: city,
        address: address,

        payment: payment,

        items: cart,

        subtotal: subtotal,
        delivery: delivery,
        total: subtotal + delivery,

        orderDate: new Date().toLocaleString(),

        status: "Placed"

    };

    const orders = getOrders();

    orders.push(order);

    saveStorage("craveCraftOrders", orders);

    saveCart([]);

    alert(
        "Order placed successfully!\n" +
        "Order ID: " + order.orderId
    );

    window.location.href = "orders.html";

}


/* ==========================================
   10. CUSTOMER ORDERS
   ========================================== */

function showCustomerOrders() {

    const container =
        document.getElementById("ordersContainer") ||
        document.getElementById("ordersList");

    if (!container) {
        return;
    }

    const currentUser =
        getStorage("craveCraftLoggedInUser", null) ||
        getStorage("craveCraftCurrentUser", null);

    let orders = getOrders();

    if (currentUser && currentUser.email) {

        orders = orders.filter(function (order) {

            return !order.customerEmail ||
                   order.customerEmail === currentUser.email;

        });

    }

    if (orders.length === 0) {

        container.innerHTML = `
            <div class="orders-empty">
                <h2>No orders yet</h2>
                <p>Your placed orders will appear here.</p>
                <a href="menu.html">Explore Menu</a>
            </div>
        `;

        return;
    }

    container.innerHTML = orders.slice().reverse().map(function (order) {

        const itemsHTML = (order.items || []).map(function (item) {

            return `
                <p>
                    ${escapeHTML(item.name)}
                    × ${Number(item.quantity || 1)}
                </p>
            `;

        }).join("");

        return `
            <div class="order-card">

                <h3>Order ${escapeHTML(order.orderId)}</h3>

                <p>Date: ${escapeHTML(order.orderDate || "")}</p>

                <p>Status: ${escapeHTML(order.status || "Placed")}</p>

                <h4>Items</h4>

                ${itemsHTML}

                <p>Total: ${formatPrice(order.total || 0)}</p>

            </div>
        `;

    }).join("");

}


/* ==========================================
   11. ADMIN DASHBOARD
   ========================================== */

function renderAdminDashboard() {

    const users = getUsers();
    const orders = getOrders();

    const userCount = document.getElementById("totalUsers") ||
                      document.getElementById("totalStudents");

    const orderCount = document.getElementById("totalOrders") ||
                       document.getElementById("totalRegistrations");

    if (userCount) {
        userCount.textContent = users.length;
    }

    if (orderCount) {
        orderCount.textContent = orders.length;
    }

    renderAdminUsers();
    renderAdminOrders();
    renderAdminFoods();

}


function renderAdminUsers() {

    const container =
        document.getElementById("adminUsers") ||
        document.getElementById("usersList");

    if (!container) {
        return;
    }

    const users = getUsers();

    if (users.length === 0) {

        container.innerHTML = "<p>No registered users found.</p>";
        return;

    }

    container.innerHTML = users.map(function (user, index) {

        return `
            <div class="admin-user">

                <h3>${escapeHTML(user.name)}</h3>

                <p>Email: ${escapeHTML(user.email)}</p>

                <p>Phone: ${escapeHTML(user.phone || "Not provided")}</p>

                <button
                    type="button"
                    onclick="deleteUser(${index})">
                    Delete User
                </button>

            </div>
        `;

    }).join("");

}


function deleteUser(index) {

    const users = getUsers();

    if (index < 0 || index >= users.length) {
        return;
    }

    if (!confirm("Are you sure you want to delete this user?")) {
        return;
    }

    users.splice(index, 1);

    saveStorage("craveCraftUsers", users);

    renderAdminDashboard();

}


function renderAdminOrders() {

    const container =
        document.getElementById("adminOrders") ||
        document.getElementById("ordersList");

    if (!container) {
        return;
    }

    const orders = getOrders();

    if (orders.length === 0) {

        container.innerHTML = "<p>No orders found.</p>";
        return;

    }

    container.innerHTML = orders.map(function (order, index) {

        return `
            <div class="admin-order">

                <h3>${escapeHTML(order.orderId)}</h3>

                <p>Customer: ${escapeHTML(order.customerName)}</p>

                <p>Phone: ${escapeHTML(order.phone)}</p>

                <p>City: ${escapeHTML(order.city)}</p>

                <p>Total: ${formatPrice(order.total)}</p>

                <p>Status: ${escapeHTML(order.status || "Placed")}</p>

                <button
                    type="button"
                    onclick="deleteOrder(${index})">
                    Delete Order
                </button>

            </div>
        `;

    }).join("");

}


function deleteOrder(index) {

    const orders = getOrders();

    if (index < 0 || index >= orders.length) {
        return;
    }

    if (!confirm("Are you sure you want to delete this order?")) {
        return;
    }

    orders.splice(index, 1);

    saveStorage("craveCraftOrders", orders);

    renderAdminDashboard();

}


/* ==========================================
   12. ADMIN FOOD MANAGEMENT
   ========================================== */

function getAdminFoods() {
    return getStorage("craveCraftMenuItems", []);
}

function renderAdminFoods() {
    const container = document.getElementById("adminFoodList");

    if (!container) {
        return;
    }

    const foods = getAdminFoods();

    if (foods.length === 0) {
        container.innerHTML = "<p>No additional foods added yet.</p>";
        return;
    }

    container.innerHTML = foods.map(function (food, index) {
        return `
            <div class="admin-food">
                <h3>${escapeHTML(food.name || "Unnamed food")}</h3>
                <p>Category: ${escapeHTML(food.category || "Other")}</p>
                <p>Price: ${formatPrice(food.price || 0)}</p>
                <p>${escapeHTML(food.description || "")}</p>
                ${food.image ? `<img src="${escapeHTML(food.image)}" alt="${escapeHTML(food.name || "Food")}" style="max-width:120px;">` : ""}
                <button type="button" onclick="deleteAdminFood(${index})">
                    Delete Food
                </button>
            </div>
        `;
    }).join("");
}

function addAdminFood(event) {
    if (event) {
        event.preventDefault();
    }

    const nameInput = document.getElementById("foodName");
    const priceInput = document.getElementById("foodPrice");
    const categoryInput = document.getElementById("foodCategory");
    const imageInput = document.getElementById("foodImage");
    const descriptionInput = document.getElementById("foodDescription");

    if (!nameInput || !priceInput) {
        alert("Food name and price fields were not found.");
        return;
    }

    const name = nameInput.value.trim();
    const price = Number(priceInput.value);

    if (!name || !Number.isFinite(price) || price <= 0) {
        alert("Enter a valid food name and price.");
        return;
    }

    const foods = getAdminFoods();
    foods.push({
        name: name,
        price: price,
        category: categoryInput ? categoryInput.value.trim() : "Other",
        image: imageInput ? imageInput.value.trim() : "",
        description: descriptionInput ? descriptionInput.value.trim() : ""
    });

    saveStorage("craveCraftMenuItems", foods);

    alert("Food added successfully!");

    const form = document.getElementById("adminFoodForm");
    if (form) {
        form.reset();
    }

    renderAdminFoods();
}

function deleteAdminFood(index) {
    const foods = getAdminFoods();

    if (index < 0 || index >= foods.length) {
        return;
    }

    if (!confirm("Delete this food item?")) {
        return;
    }

    foods.splice(index, 1);
    saveStorage("craveCraftMenuItems", foods);
    renderAdminFoods();
}

/* Button handlers used by admin.html */
function showAdminFoods() {
    renderAdminFoods();
}

function showAdminUsers() {
    renderAdminUsers();
}

function showAdminOrders() {
    renderAdminOrders();
}

/* ==========================================
   13. CATEGORY FILTER
   ========================================== */

function filterFoods(category) {

    const cards = document.querySelectorAll(
        "[data-category], .food-card, .menu-card"
    );

    cards.forEach(function (card) {

        const cardCategory =
            (card.dataset.category || "").toLowerCase();

        const selectedCategory = String(category).toLowerCase();

        const showAll =
            selectedCategory === "all" ||
            selectedCategory === "all foods";

        card.style.display =
            showAll || cardCategory === selectedCategory
                ? ""
                : "none";

    });

}


/* ==========================================
   14. INITIALIZE THE CURRENT PAGE
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {

    updateCartCount();

    renderCart();

    displayCheckoutSummary();

    updatePaymentFields();

    showCustomerOrders();

    renderAdminDashboard();

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }

    const checkoutForm = document.getElementById("checkoutForm");

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", placeOrder);
    }

    const adminFoodForm = document.getElementById("adminFoodForm");

    if (adminFoodForm) {
        adminFoodForm.addEventListener("submit", addAdminFood);
    }

    const paymentInputs =
        document.querySelectorAll('input[name="payment"]');

    paymentInputs.forEach(function (input) {

        input.addEventListener("change", updatePaymentFields);

    });

});