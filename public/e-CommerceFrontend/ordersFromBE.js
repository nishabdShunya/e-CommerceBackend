const ordersList = document.getElementById('orders-list');

window.addEventListener('DOMContentLoaded', showOrders);

async function showOrders(event) {
    try {
        const response = await axios.get('http://52.197.202.118:3000/orders')
        if (response.status === 200) {
            const orders = response.data.orders;
            for (let order of orders) {
                const orderItem = `
                <li class="order-items">
                    <h3>Order Id : ${order.id}</h3>
                    <hr>
                    <ul id="${order.id}" class="order-products-list"></ul>
                </li>`;
                ordersList.innerHTML += orderItem;
            }
            for (let i = 0; i < orders.length; i++) {
                const orderProducts = document.getElementById(orders[i].id);
                const products = orders[i].products;
                let total = 0;
                for (let product of products) {
                    total += (product.price) * (product.orderItem.quantity);
                    const productDetails = `
                    <li>
                        <img src="${product.imageUrl}" alt="${product.title}">
                        <p>${product.title} ( ${product.orderItem.quantity} )</p>
                    </li>`;
                    orderProducts.innerHTML += productDetails;
                }
                const orderTotal = `<hr>
                <p>Order Total : $${total}</p>`;
                const order = document.getElementsByClassName('order-items')[i];
                order.innerHTML += orderTotal;
            }
        } else {
            throw new Error('Something went wrong. Please try again.');
        }
    } catch (err) {
        alert(err);
    }
}