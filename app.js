// 🔐 LOGIN CHECK
const supabaseUrl = "https://iyvzahxlzqxhstylhquk.supabase.co";
const supabaseKey = "sb_publishable_IcGDGmPNTr-6RCeZ2owcEg_sBI-qNZs";

const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseKey
);
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}
// document.addEventListener("DOMContentLoaded", () => {
//     document.getElementById("billDate").innerText =
//         new Date().toLocaleDateString("en-GB");
//     document.getElementById("billNo").innerText =
//        "QTN-" + Date.now();
//        let lastBill = localStorage.getItem("billNo");
// if (!lastBill) lastBill = 149;

// const newBillNo = Number(lastBill) + 1;
// document.getElementById("billNo").innerText = newBillNo;
// localStorage.setItem("billNo", newBillNo);
// });

function addRow() {
    const tbody = document.getElementById("billBody");
    const rowCount = tbody.rows.length + 1;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text"></td>
        <td><input type="text"></td>
        <td><input type="number" class="qty" ></td>
        <td><input type="number" class="rate" ></td>
        <td class="amount-cell">
            <input type="number" placeholder="" />
            <span class="row-delete" onclick="deleteRow(this)">✖</span>
        </td>
    `;
    tbody.appendChild(row);
}

// function calculateRow(input) {
//     const row = input.closest("tr");
//     const qty = Number(row.querySelector(".qty").value || 0);
//     const rate = Number(row.querySelector(".rate").value || 0);
//     const amount=qty*rate;
//     row.querySelector(".amount").innerText = qty * rate;
// }

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
async function saveBill() {

    const items = [];

    document.querySelectorAll("#billBody tr").forEach(row => {

        items.push({
            colour: row.cells[1].querySelector("input")?.value || "",
            counts: row.cells[2].querySelector("input")?.value || "",
            qty: row.cells[3].querySelector("input")?.value || "",
            rate: row.cells[4].querySelector("input")?.value || "",
            partyPrice: row.cells[5].querySelector("input")?.value || ""
        });

    });

    const billData = {
        bill_no: document.getElementById("billNo").innerText,
        bill_date: document.getElementById("billDate").innerText,
        customer_name: document.querySelector('[data-order="1"]').value,
        place: document.querySelector('[data-order="2"]').value,
        items: JSON.stringify(items)
    };

    const { error } = await supabaseClient
        .from("bills")
        .insert([billData]);

    if (error) {
        console.error(error);
        alert("Save Failed");
        return;
    }

    alert("Bill Saved Successfully!");
}

/* 📜 VIEW PREVIOUS BILLS */
// document.addEventListener("keydown", function (e) {
//     if (e.key !== "Enter") return;
  
//     const el = e.target;
//     e.preventDefault();
  
//     // TO → PLACE
//     if (el.id === "toName") {
//       document.getElementById("place")?.focus();
//       return;
//     }
  
//     // PLACE → FIRST ROW COUNTS
//     if (el.id === "place") {
//       document.querySelector(".counts")?.focus();
//       return;
//     }
  
//     const row = el.closest("tr");
//     if (!row) return;
  
//     // COUNTS → QTY
//     if (el.classList.contains("counts")) {
//       row.querySelector(".qty")?.focus();
//       return;
//     }
  
//     // QTY → RATE
//     if (el.classList.contains("qty")) {
//       row.querySelector(".rate")?.focus();
//       return;
//     }
  
//     // RATE → NEXT ROW COUNTS
//     if (el.classList.contains("rate")) {
//       calculateRow(el);
  
//       const nextRow = row.nextElementSibling;
//       if (nextRow) {
//         nextRow.querySelector(".counts")?.focus();
//       }
//     }
//   });
document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
  
    e.preventDefault();
  
    const current = document.activeElement;
    if (!current || !current.dataset.order) return;
  
    const currentOrder = Number(current.dataset.order);
    const next = document.querySelector(`[data-order="${currentOrder + 1}"]`);
  
    if (next) {
      next.focus();
    }
  });
  async function showHistory() {

    const { data, error } = await supabaseClient
        .from("bills")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        alert("Error loading bills");
        return;
    }

    const tbody = document.getElementById("historyBody");

    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5">No Bills Found</td>
            </tr>
        `;
    } else {

        data.forEach(bill => {

            tbody.innerHTML += `
                <tr>
                    <td>${bill.bill_no}</td>
                    <td>${bill.bill_date}</td>
                    <td>${bill.customer_name}</td>
                    <td>${bill.place || "-"}</td>
                    <td>
                        <button onclick="viewBill(${bill.id})">
                            View
                        </button>
                    </td>
                </tr>
            `;
        });

    }

    document.getElementById("historySection").style.display = "block";
}
function closeHistory() {
    document.getElementById("historySection").style.display = "none";
}
async function viewBill(id) {

    const { data, error } = await supabaseClient
        .from("bills")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(error);
        alert("Bill not found");
        return;
    }

    const items = JSON.parse(data.items);

    let details = `
Bill No: ${data.bill_no}

Customer: ${data.customer_name}

Place: ${data.place}

Date: ${data.bill_date}

`;

    items.forEach(item => {
        details += `
Colour: ${item.colour}
Counts: ${item.counts}
Qty: ${item.qty}
Rate: ${item.rate}
Party Price: ${item.partyPrice}

`;
    });

    alert(details);
}