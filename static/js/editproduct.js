if (!sessionStorage.getItem("access_token")) {
    window.location.href="/login"
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('editProductForm');
    const productId = new URLSearchParams(window.location.search).get('pid');
    console.log(productId)

    // Fetch the product details
    fetch('/api/product/details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
        },
        body: JSON.stringify({ pid: productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error fetching product: ' + data.error);
        } else {
            const product = data.product;
            form.pid.value = product.pid;
            form.name.value = product.name || '';
            form.unit.value = product.unit || '';
            form.per_qty.value = product.per_qty || 0;
            form.qty.value = product.qty || 0;
            form.price.value = product.price || 0;
            form.discount.value = product.discount || 0;
            form.gst.value = product.gst || 0;
        }
    })
    .catch(error => {
        alert('Error fetching product details: ' + error);
    });

    // Handle form submission to update product
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = {
            pid: form.pid.value,
            name: form.name.value,
            unit: form.unit.value,
            per_qty: Number(form.per_qty.value),
            qty: Number(form.qty.value),
            price: Number(form.price.value),
            discount: Number(form.discount.value),
            gst: Number(form.gst.value)
        };

        fetch('/api/product/change', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error updating product: ' + data.error);
            } else {
                alert('Product updated successfully!');
                // form.reset()
                // Redirect or update the page as necessary
            }
        })
        .catch(error => {
            alert('Failed to update product: ' + error);
        });
    });
});
