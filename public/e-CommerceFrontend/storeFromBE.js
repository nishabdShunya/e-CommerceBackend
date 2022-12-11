// Code after connecting to backend
const productList = document.getElementById('product-list');
const cart = document.getElementById('cart');
const paginationContainer = document.getElementById('pagination-container');
const cartPaginationContainer = document.getElementById('cart-pagination-container');
const cartContainer = document.getElementById('cart-container');
const seeCartBtn = document.getElementById('see-cart-btn');
const navCartBtn = document.getElementById('cart-nav-btn');
const cartXBtn = document.getElementById('cart-close-btn');

window.addEventListener('DOMContentLoaded', async (event) => {
    try {
        let page = 1;
        const response = await axios.get(`http://52.197.202.118:3000/products?page=${page}`)
        if (response.status === 200) {
            showProducts(response.data.pageProducts);
            showPagination(response.data.paginationInfo);
            createCart();
        } else {
            throw new Error('Something went wrong please try again.');
        }
    } catch (err) {
        alert(err);
    }
});

function showPagination(paginationInfo) {
    paginationContainer.innerHTML = '';
    if (paginationInfo.hasPreviousPage) {
        const previousPageBtn = document.createElement('button');
        previousPageBtn.classList.add('pagination-btns');
        previousPageBtn.innerText = paginationInfo.previousPage;
        paginationContainer.appendChild(previousPageBtn);
        previousPageBtn.addEventListener('click', async (event) => {
            try {
                const response = await axios.get(`http://52.197.202.118:3000/products?page=${paginationInfo.previousPage}`)
                if (response.status === 200) {
                    showProducts(response.data.pageProducts);
                    showPagination(response.data.paginationInfo);
                } else {
                    throw new Error(`Something went wrong while loading page ${paginationInfo.previousPage}. Please try again.`);
                }
            } catch (err) {
                alert(err);
            }
        })
    }
    const currentPageBtn = document.createElement('button');
    currentPageBtn.classList.add('pagination-btns');
    currentPageBtn.innerText = paginationInfo.currentPage;
    paginationContainer.appendChild(currentPageBtn);
    currentPageBtn.addEventListener('click', async (event) => {
        try {
            const response = await axios.get(`http://52.197.202.118:3000/products?page=${paginationInfo.currentPage}`)
            if (response.status === 200) {
                showProducts(response.data.pageProducts);
                showPagination(response.data.paginationInfo);
            } else {
                throw new Error(`Something went wrong while loading page ${paginationInfo.currentPage}. Please try again.`);
            }
        } catch (err) {
            alert(err);
        }
    })
    if (paginationInfo.hasNextPage) {
        const nextPageBtn = document.createElement('button');
        nextPageBtn.classList.add('pagination-btns');
        nextPageBtn.innerText = paginationInfo.nextPage;
        paginationContainer.appendChild(nextPageBtn);
        nextPageBtn.addEventListener('click', async (event) => {
            try {
                const response = await axios.get(`http://52.197.202.118:3000/products?page=${paginationInfo.nextPage}`)
                if (response.status === 200) {
                    showProducts(response.data.pageProducts);
                    showPagination(response.data.paginationInfo);
                } else {
                    throw new Error(`Something went wrong while loading page ${paginationInfo.nextPage}. Please try again.`);
                }
            } catch (err) {
                alert(err);
            }
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

async function addToCart(id, title) {
    try {
        const response = await axios.post('http://52.197.202.118:3000/cart', {
            productId: id,
            productTitle: title
        })
        if (response.status === 201) {
            showNotification(response.data.message);
            createCart();
        } else {
            throw new Error('Something went wrong. Please try again.');
        }
    } catch (err) {
        showNotification(err);
    }
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

async function createCart() {
    cart.innerHTML = '';
    try {
        const response = await axios.get(`http://52.197.202.118:3000/cart`)
        if (response.status === 200) {
            const products = response.data.products;
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
        } else {
            throw new Error('Something went wrong. Please refresh the page');
        }
    } catch (err) {
        alert(err);
    }
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

async function removeItemFromCart(id) {
    try {
        const response = await axios.delete(`http://52.197.202.118:3000/cart/${id}`)
        if (response.status === 200) {
            showNotification(response.data.message);
            createCart();
        } else {
            throw new Error('Failed to remove the product. Please try again.');
        }
    } catch (err) {
        showNotification(err);
    }
}

async function changeOfQuantity(event, id) {
    try {
        const input = event.target;
        if (isNaN(input.value) || input.value < 1) {
            input.value = 1;
        }
        const response = await axios.patch(`http://52.197.202.118:3000/cart/${id}`, { quantity: input.value })
        if (response.status === 200) {
            createCart();
        } else {
            throw new Error('Failed to update the quantity. Please try again.');
        }
    } catch (err) {
        showNotification(err);
    }
}

// Opening & Closing the Cart
seeCartBtn.addEventListener('click', showCart);
navCartBtn.addEventListener('click', showCart);
cartXBtn.addEventListener('click', hideCart);

function showCart(event) {
    createCart();
    cartContainer.style.display = 'flex';
}

function hideCart(event) {
    cartContainer.style.display = 'none';
}

// Placing Order on Cart Page
const orderNowBtn = document.getElementById('purchase-btn');
orderNowBtn.addEventListener('click', async (event) => {
    try {
        const response = await axios.post('http://52.197.202.118:3000/create-order')
        if (response.status === 201) {
            showNotification(response.data.message);
            cart.innerHTML = '';
            updateTotal();
        } else {
            throw new Error('Something went wrong. Please try again placing your order.');
        }
    } catch (err) {
        showNotification(err);
    }
})