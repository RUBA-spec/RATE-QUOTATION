let db;

// Auto Date & Bill Number
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("billDate").innerText =
        new Date().toLocaleDateString("en-GB");

    document.getElementById("billNo").innerText =
        "QTN-" + Date.now();

    initDB();
});

// Add Row
function addRow() {
    const tbody = document.getElementById("billBody");
    const rowCount = tbody.rows.length + 1;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><input type="number" class="qty" oninput="calculateRow(this)"></td>
        <td><input type="number" class="rate" oninput="calculateRow(this)"></td>
        <td class="amount-cell">
            <span class="amount">0</span>
            <span class="row-delete" onclick="deleteRow(this)">✖</span>
        </td>
    `;
    tbody.appendChild(row);
}

// Calculate Row Amount
function calculateRow(input) {
    const row = input.closest("tr");
    const qty = row.querySelector(".qty").value || 0;
    const rate = row.querySelector(".rate").value || 0;
    row.querySelector(".amount").innerText = qty * rate;
}

// Delete Row
function deleteRow(el) {
    el.closest("tr").remove();
    updateSerialNumbers();
}

function updateSerialNumbers() {
    document.querySelectorAll("#billBody tr").forEach((row, i) => {
        row.cells[0].innerText = i + 1;
    });
}

// IndexedDB Init
function initDB() {
    const request = indexedDB.open("BillingDB", 1);

    request.onupgradeneeded = e => {
        db = e.target.result;
        db.createObjectStore("bills", { keyPath: "billNo" });
    };

    request.onsuccess = e => {
        db = e.target.result;
    };

    request.onerror = () => alert("DB Error");
}

// Save Bill
// function saveBill() {
//     const customerName =
//         document.getElementById("customerName").value || "Customer";

//     const items = [];
//     document.querySelectorAll("#billBody tr").forEach(row => {
//         const inputs = row.querySelectorAll("input");
//         items.push({
//             colour: inputs[0].value,
//             counts: inputs[1].value,
//             qty: Number(inputs[2].value || 0),
//             rate: Number(inputs[3].value || 0),
//             amount: Number(row.querySelector(".amount").innerText || 0)
//         });
//     });

//     const bill = {
//         billNo: document.getElementById("billNo").innerText,
//         billDate: document.getElementById("billDate").innerText,
//         customerName,
//         items
//     };

//     const tx = db.transaction("bills", "readwrite");
//     tx.objectStore("bills").put(bill);

//     tx.oncomplete = () => {
//         alert("Bill saved successfully (Local DB)");
//         location.reload();
//     };
// }

function saveBill() {
    const customerName =
        document.querySelector('input[placeholder="Customer Name"]').value || "Customer";

    const items = [];
    document.querySelectorAll("#billBody tr").forEach(row => {
        const inputs = row.querySelectorAll("input");
        items.push({
            colour: inputs[0].value,
            counts: inputs[1].value,
            quantity: Number(inputs[2].value || 0),
            rate: Number(inputs[3].value || 0),
            amount: Number(row.querySelector(".amount").innerText || 0)
        });
    });

    const billData = {
        customerName,
        billNumber: document.getElementById("billNo").innerText,
        billDate: document.getElementById("billDate").innerText,
        totalAmount: items.reduce((s, i) => s + i.amount, 0),
        items
    };

    // 👉 SAVE TO localStorage
    const existingBills = JSON.parse(localStorage.getItem("bills")) || [];
    existingBills.push(billData);
    localStorage.setItem("bills", JSON.stringify(existingBills));

    alert("Bill saved successfully!");
}

function showPreviousBills() {
    const tx = db.transaction("bills", "readonly");
    const store = tx.objectStore("bills");
    const request = store.getAll();

    request.onsuccess = () => {
        const bills = request.result;
        if (bills.length === 0) {
            alert("No previous bills found");
            return;
        }

        let list = "PREVIOUS BILLS:\n\n";
        bills.forEach((b, i) => {
            list += `${i + 1}. ${b.billNo} | ${b.billDate} | ${b.customerName}\n`;
        });

        alert(list);
    };
} 