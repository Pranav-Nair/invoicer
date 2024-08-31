if (!sessionStorage.getItem("access_token")) {
    window.location.href="/login"
}

document.addEventListener('DOMContentLoaded', function () {
    fetchProducts();
    fetchBillDraft();

    document.getElementById('discard-bill').addEventListener('click', handleDiscardBill);
    document.getElementById('confirm-bill').addEventListener('click', handleConfirmBill);
});

async function fetchBillDraft() {
    try {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            console.error('Access token not found.');
            return;
        }

        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await fetch('/api/bill/draft/list', options);
        if (!response.ok) {
            console.error('Error fetching bill draft:', response.statusText);
            return;
        }

        const data = await response.json();
        updateBillDraft(data.products, data.total);
    } catch (error) {
        console.error('Error fetching bill draft:', error);
    }
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
        console.log(responseData.products)
        displayProducts(responseData.products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function displayProducts(products) {
    const productTableBody = document.querySelector('#product-table tbody');
    productTableBody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        for (const key in product) {
            const cell = document.createElement('td');
            cell.textContent = product[key];
            row.appendChild(cell);
        }

        const addButtonCell = document.createElement('td');
        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.dataset.productId = product['pid'];
        addButton.addEventListener('click', handleAddToDraft);
        addButtonCell.appendChild(addButton);
        row.appendChild(addButtonCell);

        productTableBody.appendChild(row);
    });
}

// Function to handle deleting products from bill draft
async function handleDeleteFromDraft(product) {
    const productId = product.pid
    console.log(product)
    try {
        const productDetailsResponse = await fetch(`/api/product/details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
            },
            body: JSON.stringify({ pid: productId })
        });
        const productDetailsData = await productDetailsResponse.json();
        console.log(productDetailsData)
        // Extract the per_qty attribute from the fetched product details
        const perQty = productDetailsData.product.per_qty;
        console.log(perQty)
        // Call the API to remove the product from the bill draft
        const response = await fetch('/api/bill/draft/rm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
            },
            body: JSON.stringify({ pid: productId , qty : perQty })
        });
        const responseData = await response.json();

        // Update the bill draft section after deleting the product
        // updateBillDraft(responseData.products, responseData.total);
        fetchBillDraft()
        fetchProducts()
    } catch (error) {
        console.error('Error deleting product from bill draft:', error);
    }
}


// Function to update bill draft section
function updateBillDraft(products, total) {
    const billDraftTable = document.getElementById('bill-draft-table');
    if (!billDraftTable) {
        console.error('Bill draft table element not found.');
        return;
    }

    // Clear existing bill draft table
    billDraftTable.innerHTML = '';

    // Create table header
    const headerRow = document.createElement('tr');
    for (const key in products[0]) {
        const headerCell = document.createElement('th');
        headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize first letter
        headerRow.appendChild(headerCell);
    }
    billDraftTable.appendChild(headerRow);

    // Populate table rows with draft items
    products.forEach(product => {
        const row = document.createElement('tr');
        for (const key in product) {
            const cell = document.createElement('td');
            cell.textContent = product[key];
            row.appendChild(cell);
        }
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        console.log(deleteButton)
        deleteButton.addEventListener('click', () => handleDeleteFromDraft(product));
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell)
        // billDraftTable.appendChild(headerRow);

        billDraftTable.appendChild(row);
    });

    // Update total price
    const totalPriceDisplay = document.getElementById('total-price');
    totalPriceDisplay.textContent = `Total Price: ${total}`;
}


async function handleAddToDraft(event) {
    // Handle adding product to bill draft when add button is clicked
    if (event.target.tagName === 'BUTTON') {
        const productId = event.target.dataset.productId;
        try {
            // Call API to add product to bill draft
            const response = await fetch('/api/bill/draft/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                },
                body: JSON.stringify({ pid: productId, qty: 1 }) // Default quantity is 1, you can adjust this as needed
            });
            if (response.status === 404) {
                console.error('Error adding product to bill draft: Product not found');
                return;
            }
            if (response.status !== 200) {
                console.error('Error adding product to bill draft: Unexpected error');
                return;
            }
            // Fetch updated bill draft data from the API
            const draftResponse = await fetch('/api/bill/draft/list', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                }
            });
            const draftData = await draftResponse.json();

            // Update bill draft section
            updateBillDraft(draftData.products, draftData.total);

            // Refresh product list after updating bill draft
            fetchProducts();
        } catch (error) {
            console.error('Error adding product to bill draft:', error);
        }
    }
}




async function handleDiscardBill() {
    try {
        const response = await fetch('/api/bill/draft/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
            }
        });
        const responseData = await response.json();

        fetchBillDraft()
        fetchProducts()
    } catch (error) {
        console.error('Error discarding bill:', error);
    }
}

async function handleConfirmBill() {
    try {
        const phoneNumber = prompt('Please enter your phone number:');
        if (!phoneNumber) {
            alert("phone number required")
            return;
        }
        const response = await fetch('/api/bill/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
            },
            body: JSON.stringify({ pno: phoneNumber })
        });
        const responseData = await response.json();
        fetchBillDraft()
        fetchProducts()
        // Handle bill confirmation success
        // Redirect or show success message as needed
    } catch (error) {
        console.error('Error confirming bill:', error);
    }
}
