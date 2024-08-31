window.addEventListener("pageshow",function() {
    console.log("triggered")
    if (!sessionStorage.getItem("access_token")) {
        window.location.href="/login"
    }
})

window.onload = function () {
    fetchProducts();
};

function loadAddproducts() {
    window.location.href="/addproducts"
}

async function fetchProducts() {
    try {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            alert('Session expired. Redirecting to login page.');
            window.location.href = '/login';
            return;
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: '{"page":1}'
        };

        const response = await fetch('/api/product/list', options);
        if (response.status === 401) {
            alert('Session expired. Redirecting to login page.');
            window.location.href = '/login';
            return;
        }
        
        const responseData = await response.json();
        displayProducts(responseData.products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function editProduct(pid) {
    window.location.href = `/editproducts?pid=${pid}`; // Redirect to the edit page with pid as a query parameter
}

async function deleteProduct(pid) {
    try {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            alert('Session expired. Redirecting to login page.');
            window.location.href = '/login';
            return;
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'insomnia/2023.5.8',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pid })
        };

        const response = await fetch('/api/product/delete', options);
        if (response.status === 401) {
            alert('Session expired. Redirecting to login page.');
            window.location.href = '/login';
            return;
        }

        const responseData = await response.json();
        alert(responseData.msg); // Display the message from the server as an alert instead of console log
        fetchProducts(); // Refresh product list after deletion
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

function displayProducts(products) {
    const productTable = document.getElementById('product-table');
    productTable.innerHTML = ''; // Clear existing products

    products.forEach(product => {
        const row = document.createElement('tr');
        
        for (const key in product) {
            if (key !== 'createdAt' && key !== 'updatedAt') { // Exclude createdAt and updatedAt
                const cell = document.createElement('td');
                cell.textContent = product[key];
                row.appendChild(cell);
            }
        }

        const actionsCell = document.createElement('td');
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => editProduct(product.pid)); // Call editProduct function with product ID
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteProduct(product.pid));
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);

        productTable.appendChild(row);
    });
}
