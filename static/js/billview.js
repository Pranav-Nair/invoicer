// bill_details.js
if (!sessionStorage.getItem("access_token")) {
    window.location.href="/login"
}
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const bid = urlParams.get('bid');

    fetchBillDetails(bid);
});

async function fetchBillDetails(bid) {
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
            },
            body: JSON.stringify({ bid: bid })
        };

        const response = await fetch('/api/bill/info', options);
        if (!response.ok) {
            console.error('Error fetching bill details:', response.statusText);
            return;
        }

        const data = await response.json();
        updateBillDetails(data.billed_items, data.total);
    } catch (error) {
        console.error('Error fetching bill details:', error);
    }
}

function updateBillDetails(billedItems, total) {
    const billDetailsBody = document.getElementById('bill-details-body');
    const totalPriceDisplay = document.getElementById('total-price');
    billDetailsBody.innerHTML = '';

    billedItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.unit}</td>
            <td>${item.qty}</td>
            <td>${item.applied_price}</td>
            <td>${item.applied_discount}</td>
            <td>${item.applied_gst}</td>
            <td>${item.final_price}</td>
        `;
        billDetailsBody.appendChild(row);
    });

    totalPriceDisplay.textContent = total;
}
