// Code after connecting to backend
const productList = document.getElementById('product-list');
const cart = document.getElementById('cart');
const paginationContainer = document.getElementById('pagination-container');
const cartPaginationContainer = document.getElementById('cart-pagination-container');
const cartContainer = document.getElementById('cart-container');
const seeCartBtn = document.getElementById('see-cart-btn');
const navCartBtn = document.getElementById('cart-nav-btn');
const cartXBtn = document.getElementById('cart-close-btn');

window.addEventListener('DOMContentLoaded', (event) => {
    let page = 1;
    axios.get(`http://52.197.202.118:3000/products?page=${page}`)
        .then(response => {
            showProducts(response.data.pageProducts);
            showPagination(response.data.paginationInfo);
            createCart();
        })
        .catch(err => console.log(err));
});


function showPagination(paginationInfo) {
    paginationContainer.innerHTML = '';
    if (paginationInfo.hasPreviousPage) {
        const previousPageBtn = document.createElement('button');
        previousPageBtn.classList.add('pagination-btns');
        previousPageBtn.innerText = paginationInfo.previousPage;
        paginationContainer.appendChild(previousPageBtn);
        previousPageBtn.addEventListener('click', (event) => {
            axios.get(`http://52.197.202.118:3000/products?page=${paginationInfo.previousPage}`)
                .then(response => {
                    showProducts(response.data.pageProducts);
                    showPagination(response.data.paginationInfo);
                })
                .catch(err => console.log(err));
        })
    }
    const currentPageBtn = document.createElement('button');
    currentPageBtn.classList.add('pagination-btns');
    currentPageBtn.innerText = paginationInfo.currentPage;
    paginationContainer.appendChild(currentPageBtn);
    currentPageBtn.addEventListener('click', (event) => {
        axios.get(`http://52.197.202.118:3000/products?page=${paginationInfo.currentPage}`)
            .then(response => {
                showProducts(response.data.pageProducts);
                showPagination(response.data.paginationInfo);
            })
            .catch(err => console.log(err));
    })
    if (paginationInfo.hasNextPage) {
        const nextPageBtn = document.createElement('button');
        nextPageBtn.classList.add('pagination-btns');
        nextPageBtn.innerText = paginationInfo.nextPage;
        paginationContainer.appendChild(nextPageBtn);
        nextPageBtn.addEventListener('click', (event) => {
            axios.get(`http://52.197.202.118:3000/products?page=${paginationInfo.nextPage}`)
                .then(response => {
                    showProducts(response.data.pageProducts);
                    showPagination(response.data.paginationInfo);
                })
                .catch(err => console.log(err));
        })
    }
}

function showProducts(products) {
    productList.innerHTML = '';
    for (let product of products) {
        const productListItem = `
                <li>
                    <img class="item-img" src="${product.imageUrl}" alt="">
                    <div class="add-to-cart-container">
                        <div>
                            <h3 class="item-title">${product.title}</h3>    
                            <p class="item-price">$${product.price}</p>
                        </div>
                        <button class="add-to-cart-btns" type="submit" onClick="addToCart('${product.id}', '${product.title}')">Add To Cart</button>
                    </div>
                </li>`;
        productList.innerHTML += productListItem;
    }
}

function addToCart(id, title) {
    axios.post('http://52.197.202.118:3000/cart', {
        productId: id,
        productTitle: title
    })
        .then(response => {
            showNotification(response.data.message);
            emptyCart();
            createCart();
        })
        .catch(err => console.log(err));
};

function showNotification(msg) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerText = `${msg}`;
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

function emptyCart() {
    while (cart.hasChildNodes()) {
        cart.removeChild(cart.firstChild);
    }
}

function createCart() {
    axios.get(`http://52.197.202.118:3000/cart`)
        .then(response => {
            const products = response.data;
            for (let product of products) {
                const cartItem = `
                <li class="cart-item">
                    <img src="${product.imageUrl}" alt="${product.title}">
                    <div class="remove-from-cart-container">
                        <div>    
                            <p class = "item-title" style="font-weight: 800;">${product.title}</p>
                            <p class = "item-price">$${product.price}</p>
                            <input type="number" class="item-quantity" value="${product.cartItem.quantity}" onchange="changeOfQuantity(event, '${product.id}')">
                        </div>
                        <button class="remove-btns" onclick="removeItemFromCart('${product.id}')">REMOVE</button>
                    </div>
                </li>`;
                cart.innerHTML += cartItem;
            }
            updateTotal();
        })
        .catch(err => console.log(err))
}

function updateTotal() {
    let totalPrice = 0;
    let totalQty = 0;
    const cartItems = cart.getElementsByClassName('cart-item');
    for (let item of cartItems) {
        const price = parseFloat(item.getElementsByClassName('item-price')[0].innerText.replace('$', ''));
        const quantity = parseFloat(item.getElementsByClassName('item-quantity')[0].value);
        totalPrice += price * quantity;
        totalQty += quantity;
    }
    totalPrice = Math.round(totalPrice * 100) / 100;
    const totalSpan = document.getElementById('total-span');
    totalSpan.innerText = '$' + totalPrice;
    const navCartQty = document.getElementById('cart-qty');
    navCartQty.innerText = totalQty;
};

function removeItemFromCart(id) {
    axios.delete(`http://52.197.202.118:3000/cart/${id}`)
        .then(response => {
            showNotification(response.data.message);
            emptyCart();
            createCart();
        })
        .catch(err => console.log(err));
}

function changeOfQuantity(event, id) {
    const input = event.target;
    if (isNaN(input.value) || input.value < 1) {
        input.value = 1;
    }
    axios.patch(`http://52.197.202.118:3000/cart/${id}`, { quantity: input.value })
        .then(response => {
            emptyCart();
            createCart();
        })
        .catch(err => console.log(err))
}

// Opening & Closing the Cart
seeCartBtn.addEventListener('click', showCart);
navCartBtn.addEventListener('click', showCart);
cartXBtn.addEventListener('click', hideCart);

function showCart(event) {
    emptyCart();
    createCart();
    cartContainer.style.display = 'flex';
}

function hideCart(event) {
    cartContainer.style.display = 'none';
}

// Placing Order on Cart Page
const orderNowBtn = document.getElementById('purchase-btn');
orderNowBtn.addEventListener('click', (event) => {
    axios.post('http://52.197.202.118:3000/create-order')
        .then(response => {
            showNotification(response.data.message);
            emptyCart();
            updateTotal();
        })
        .catch(err => console.log(err));
})