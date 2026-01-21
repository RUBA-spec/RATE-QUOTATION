// 🔐 LOGIN CHECK
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("billDate").innerText =
        new Date().toLocaleDateString("en-GB");
    document.getElementById("billNo").innerText =
        "QTN-" + Date.now();
});

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

function calculateRow(input) {
    const row = input.closest("tr");
    const qty = Number(row.querySelector(".qty").value || 0);
    const rate = Number(row.querySelector(".rate").value || 0);
    const amount=qty*rate;
    row.querySelector(".amount").innerText = qty * rate;
}

function deleteRow(el) {
    el.closest("tr").remove();
    updateSerialNumbers();
}

function updateSerialNumbers() {
    document.querySelectorAll("#billBody tr").forEach((row, i) => {
        row.cells[0].innerText = i + 1;
    });
}

/* 💾 STORAGE LOGIC */
function saveBill() {
    const billNo = document.getElementById("billNo").innerText;
    const customer = document.getElementById("customerName").value || "Customer";
    const date = document.getElementById("billDate").innerText;

    const items = [];
    document.querySelectorAll("#billBody tr").forEach(row => {
        const inputs = row.querySelectorAll("input");
        items.push({
            colour: inputs[0].value,
            counts: inputs[1].value,
            qty: inputs[2].value,
            rate: inputs[3].value,
            amount: row.querySelector(".amount").innerText
        });
    });

    const bill = { billNo, customer, date, items };

    let bills = JSON.parse(localStorage.getItem("bills")) || [];
    bills.push(bill);
    localStorage.setItem("bills", JSON.stringify(bills));

    alert("Bill saved successfully!");
}

/* 📜 VIEW PREVIOUS BILLS */
