if (!sessionStorage.getItem("access_token")) {
    window.location.href="/login"
}

document.getElementById('addProductForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const jsonData = Object.fromEntries(formData.entries());
    const form = document.getElementById('addProductForm');
    try {
        const response = await fetch(this.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            },
            body: JSON.stringify(jsonData)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Product added successfully!');
            form.reset();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product.');
    }
});
