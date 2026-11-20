
const initialProducts = [
    {
        id: 1,
        name: "Wireless Earbuds",
        price: 999,
        category: "Electronics",
        emoji: "🎧",
        description: "Wireless earbuds with charging case.",
        seller: "Arun",
        contact: "arun@example.com",
        mine: false
    },
    {
        id: 2,
        name: "College Backpack",
        price: 799,
        category: "Fashion",
        emoji: "🎒",
        description: "Useful bag for college students.",
        seller: "Priya",
        contact: "priya@example.com",
        mine: false
    },
    {
        id: 3,
        name: "Smart Watch",
        price: 1499,
        category: "Electronics",
        emoji: "⌚",
        description: "Smart watch for everyday use.",
        seller: "Kavin",
        contact: "kavin@example.com",
        mine: false
    },
    {
        id: 4,
        name: "Cotton T-Shirt",
        price: 499,
        category: "Fashion",
        emoji: "👕",
        description: "Comfortable casual T-shirt.",
        seller: "Meena",
        contact: "meena@example.com",
        mine: false
    },
    {
        id: 5,
        name: "Study Books",
        price: 250,
        category: "Books",
        emoji: "📚",
        description: "Books for college students.",
        seller: "Nila",
        contact: "nila@example.com",
        mine: false
    },
    {
        id: 6,
        name: "Study Table",
        price: 1200,
        category: "Home",
        emoji: "🪑",
        description: "Compact study table.",
        seller: "Ravi",
        contact: "ravi@example.com",
        mine: false
    }
];

function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
}

let products = loadData("classified_products", initialProducts);
let cart = loadData("classified_cart", {});
let selectedCategory = "All";

const sessionKeys = {
    buyer: "harshex_buyer_demo_session",
    seller: "harshex_seller_demo_session"
};

function getSession(role) {
    try {
        const session = JSON.parse(
            sessionStorage.getItem(sessionKeys[role]) || "null"
        );
        return session && session.role === role && session.email
            ? session
            : null;
    } catch {
        return null;
    }
}

function navigateTo(route) {
    if (window.location.hash === route) {
        renderRoute();
    } else {
        window.location.hash = route;
    }
}

function redirectTo(route) {
    window.location.replace(route);
}

function logout(role) {
    sessionStorage.removeItem(sessionKeys[role]);
    navigateTo("#/" + role + "/login");
}

function showRouteElements(visibleIds) {
    [
        "roleChoice", "buyerLogin", "sellerLogin",
        "home", "products", "sell", "cart", "mine"
    ].forEach(id => {
        document.getElementById(id).classList.toggle(
            "hidden",
            !visibleIds.includes(id)
        );
    });
}

function renderRoute() {
    const route = window.location.hash || "#/";
    const buyerSession = getSession("buyer");
    const sellerSession = getSession("seller");

    if (route === "#/buyer/login") {
        if (buyerSession) {
            redirectTo("#/buyer/home");
            return;
        }
        if (sellerSession) {
            redirectTo("#/seller/dashboard");
            return;
        }
        showRouteElements(["buyerLogin"]);
        document.getElementById("entryNav").classList.remove("hidden");
        document.getElementById("buyerNav").classList.add("hidden");
        document.getElementById("sellerNav").classList.add("hidden");
        return;
    }

    if (route === "#/seller/login") {
        if (sellerSession) {
            redirectTo("#/seller/dashboard");
            return;
        }
        if (buyerSession) {
            redirectTo("#/buyer/home");
            return;
        }
        showRouteElements(["sellerLogin"]);
        document.getElementById("entryNav").classList.remove("hidden");
        document.getElementById("buyerNav").classList.add("hidden");
        document.getElementById("sellerNav").classList.add("hidden");
        return;
    }

    if (route === "#/buyer/home" || route === "#/buyer/cart") {
        if (!buyerSession) {
            redirectTo(sellerSession ? "#/seller/dashboard" : "#/buyer/login");
            return;
        }
        showRouteElements(
            route === "#/buyer/home"
                ? ["home", "products"]
                : ["cart"]
        );
        document.getElementById("entryNav").classList.add("hidden");
        document.getElementById("buyerNav").classList.remove("hidden");
        document.getElementById("sellerNav").classList.add("hidden");
        if (route === "#/buyer/home") {
            renderProducts();
        } else {
            renderCart();
            updateCount();
        }
        return;
    }

    if (route === "#/seller/dashboard" || route === "#/seller/listings") {
        if (!sellerSession) {
            redirectTo(buyerSession ? "#/buyer/home" : "#/seller/login");
            return;
        }
        showRouteElements(
            route === "#/seller/dashboard" ? ["sell"] : ["mine"]
        );
        document.getElementById("entryNav").classList.add("hidden");
        document.getElementById("buyerNav").classList.add("hidden");
        document.getElementById("sellerNav").classList.remove("hidden");
        if (route === "#/seller/dashboard") {
            const sellerName = document.getElementById("seller");
            if (!sellerName.value) sellerName.value = sellerSession.name || "";
        } else {
            renderMyProducts();
        }
        return;
    }

    if (buyerSession) {
        redirectTo("#/buyer/home");
    } else if (sellerSession) {
        redirectTo("#/seller/dashboard");
    } else if (route !== "#/") {
        redirectTo("#/");
    } else {
        showRouteElements(["roleChoice"]);
        document.getElementById("entryNav").classList.remove("hidden");
        document.getElementById("buyerNav").classList.add("hidden");
        document.getElementById("sellerNav").classList.add("hidden");
    }
}

document.getElementById("buyerLoginForm").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();
        const email = document.getElementById("buyerEmail").value
            .trim().toLowerCase();
        sessionStorage.removeItem(sessionKeys.seller);
        sessionStorage.setItem(sessionKeys.buyer, JSON.stringify({
            role: "buyer",
            email
        }));
        navigateTo("#/buyer/home");
    }
);

document.getElementById("sellerLoginForm").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();
        const name = document.getElementById("sellerLoginName").value.trim();
        const email = document.getElementById("sellerLoginEmail").value
            .trim().toLowerCase();
        sessionStorage.removeItem(sessionKeys.buyer);
        sessionStorage.setItem(sessionKeys.seller, JSON.stringify({
            role: "seller",
            name,
            email
        }));
        navigateTo("#/seller/dashboard");
    }
);

window.addEventListener("hashchange", renderRoute);

function saveData() {
    localStorage.setItem(
        "classified_products",
        JSON.stringify(products)
    );

    localStorage.setItem(
        "classified_cart",
        JSON.stringify(cart)
    );
}

function money(price) {
    return "₹" + Number(price).toLocaleString("en-IN");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function renderProducts() {
    if (!getSession("buyer")) return;

    const search = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const list = products.filter(product =>
        (selectedCategory === "All" ||
         product.category === selectedCategory) &&
        (product.name + " " + product.description + " " +
         product.category).toLowerCase().includes(search)
    );

    document.getElementById("productList").innerHTML =
        list.length ? list.map(product => `
            <div class="card">
                <div class="product-image">
                    ${escapeHTML(product.emoji)}
                </div>
                <h3>${escapeHTML(product.name)}</h3>
                <p>${escapeHTML(product.description)}</p>
                <p class="price">${money(product.price)}</p>
                <small>Seller: ${escapeHTML(product.seller)}</small>
                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
                <button onclick="contactSeller(${product.id})">
                    Contact Seller
                </button>
            </div>
        `).join("") : "<p>No products found.</p>";

    document.querySelectorAll(".filters button").forEach(button => {
        button.classList.toggle(
            "active",
            button.textContent === selectedCategory
        );
    });

    updateCount();
}

function setCategory(category) {
    selectedCategory = category;
    renderProducts();
}

function addToCart(id) {
    if (!getSession("buyer")) return;
    cart[id] = (cart[id] || 0) + 1;
    saveData();
    updateCount();
    alert("Product added to cart!");
}

function updateCount() {
    document.getElementById("count").textContent =
        Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function renderCart() {
    if (!getSession("buyer")) return;
    const container = document.getElementById("cartItems");
    let total = 0;

    const entries = Object.entries(cart).filter(([id, qty]) =>
        qty > 0 && products.some(p => p.id === Number(id))
    );

    if (entries.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        container.innerHTML = entries.map(([id, qty]) => {
            const p = products.find(item => item.id === Number(id));
            total += p.price * qty;

            return `
                <div class="cart-row">
                    <span>${escapeHTML(p.name)} × ${qty}</span>
                    <strong>${money(p.price * qty)}</strong>
                    <span>
                        <button onclick="changeQty(${p.id},-1)">−</button>
                        <button onclick="changeQty(${p.id},1)">+</button>
                    </span>
                    <button onclick="removeItem(${p.id})">Remove</button>
                </div>
            `;
        }).join("");
    }

    document.getElementById("total").textContent =
        "Total: " + money(total);
}

function changeQty(id, amount) {
    if (!getSession("buyer")) return;
    cart[id] = (cart[id] || 0) + amount;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    saveData();
    renderCart();
    updateCount();
}

function removeItem(id) {
    if (!getSession("buyer")) return;
    delete cart[id];
    saveData();
    renderCart();
    updateCount();
}

function checkout() {
    if (!getSession("buyer")) return;
    if (Object.keys(cart).length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("Demo order placed! No payment was collected.");
    cart = {};
    saveData();
    renderCart();
    updateCount();
}

function contactSeller(id) {
    if (!getSession("buyer")) return;
    const p = products.find(item => item.id === id);

    alert(
        "Seller: " + p.seller +
        "\nContact: " + p.contact
    );
}

document.getElementById("sellForm").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();
        const sellerSession = getSession("seller");
        if (!sellerSession) {
            navigateTo("#/seller/login");
            return;
        }

        const product = {
            id: Date.now(),
            name: document.getElementById("pname").value.trim(),
            price: Number(document.getElementById("price").value),
            category: document.getElementById("category").value,
            emoji: document.getElementById("emoji").value,
            description: document.getElementById("description")
                .value.trim(),
            seller: document.getElementById("seller").value.trim(),
            contact: document.getElementById("contact").value.trim(),
            mine: true,
            ownerId: sellerSession.email
        };

        products.unshift(product);
        saveData();
        renderProducts();
        renderMyProducts();

        this.reset();
        navigateTo("#/seller/listings");
        alert("Product published successfully!");
    }
);

function renderMyProducts() {
    const sellerSession = getSession("seller");
    if (!sellerSession) return;
    const mine = products.filter(product =>
        product.ownerId === sellerSession.email
    );

    document.getElementById("myProducts").innerHTML =
        mine.length ? mine.map(p => `
            <div class="card">
                <div class="product-image">
                    ${escapeHTML(p.emoji)}
                </div>
                <h3>${escapeHTML(p.name)}</h3>
                <p class="price">${money(p.price)}</p>
                <button onclick="deleteProduct(${p.id})">
                    Delete Listing
                </button>
            </div>
        `).join("") : "<p>No products listed by you.</p>";
}

function deleteProduct(id) {
    const sellerSession = getSession("seller");
    if (!sellerSession) return;
    const product = products.find(item => item.id === id);
    if (!product || product.ownerId !== sellerSession.email) return;
    if (!confirm("Delete this product?")) return;

    products = products.filter(p => p.id !== id);
    delete cart[id];

    saveData();
    renderProducts();
    renderMyProducts();
    renderCart();
    updateCount();
}

function showHome() {
    navigateTo("#/buyer/home");
}

function showSell() {
    navigateTo("#/seller/dashboard");
}

function showCart() {
    navigateTo("#/buyer/cart");
}

function showMyProducts() {
    navigateTo("#/seller/listings");
}

renderRoute();
