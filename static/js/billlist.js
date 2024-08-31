if (!sessionStorage.getItem("access_token")) {
    window.location.href="/login"
}
document.addEventListener('DOMContentLoaded', function () {
    fetchBillList();
});

async function fetchBillList() {
    try {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            console.error('Access token not found.');
            return;
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({}) // You may need to pass additional parameters if required by the API
        };

        const response = await fetch('/api/bill/list', options);
        if (!response.ok) {
            console.error('Error fetching bill list:', response.statusText);
            return;
        }

        const data = await response.json();
        populateBillTable(data.bills);
    } catch (error) {
        console.error('Error fetching bill list:', error);
    }
}

function populateBillTable(bills) {
    const billTableBody = document.getElementById('bill-table-body');
    billTableBody.innerHTML = '';

    bills.forEach(bill => {
        const row = document.createElement('tr');
        const billIdCell = document.createElement('td');
        billIdCell.textContent = bill.bid;
        row.appendChild(billIdCell);

        const phoneNumberCell = document.createElement('td');
        phoneNumberCell.textContent = bill.pno;
        row.appendChild(phoneNumberCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = bill.createdAt;
        row.appendChild(dateCell);

        const actionCell = document.createElement('td');
        const viewButton = document.createElement('button');
        viewButton.textContent = 'View';
        viewButton.addEventListener('click', () => viewBillDetails(bill.bid));
        actionCell.appendChild(viewButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className="danger"
        deleteButton.addEventListener('click', () => deleteBill(bill.bid));
        actionCell.appendChild(deleteButton);

        // Append action cell to the row
        row.appendChild(actionCell);
        row.appendChild(actionCell);

        billTableBody.appendChild(row);
    });
}

function viewBillDetails(billId) {
    // Redirect to page to view the bill details, passing the billId as a parameter
    window.location.href = `/viewbill?bid=${billId}`;
}

async function deleteBill(bid) {
    try {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            console.error('Access token not found.');
            return;
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bid }) // Pass bid to the API
        };

        const response = await fetch('/api/bill/rm', options);
        if (!response.ok) {
            console.error('Error deleting bill:', response.statusText);
            return;
        }

        // If deletion is successful, fetch the updated bill list
        fetchBillList();
    } catch (error) {
        console.error('Error deleting bill:', error);
    }
}