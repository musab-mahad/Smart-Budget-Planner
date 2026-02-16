// USER SETUP LOGIC
const setupModal = document.getElementById("setupModal");
const userNameDisplay = document.getElementById("userNameDisplay");

function checkUserSetup() {
  const name = localStorage.getItem("userName");
  const currency = localStorage.getItem("currencySymbol");
  const rule = localStorage.getItem("budgetRule");

  if (!name || !currency || !rule) {
    setupModal.classList.add("show");
  } else {
    if (userNameDisplay) {
      userNameDisplay.textContent = `👤 ${name}`;
    }
  }
}

const saveUserBtn = document.getElementById("saveUserBtn");

if (saveUserBtn) {
  saveUserBtn.addEventListener("click", function () {
    const name = document.getElementById("userNameInput").value.trim();
    const currency = document.getElementById("currencyInput").value.trim();

    const needs = parseFloat(document.getElementById("needsPercent").value);
    const wants = parseFloat(document.getElementById("wantsPercent").value);
    const savings = parseFloat(document.getElementById("savingsPercent").value);

    const error = document.getElementById("setupError");

    if (!name || !currency || isNaN(needs) || isNaN(wants) || isNaN(savings)) {
      error.textContent = "All fields are required.";
      return;
    }

    const total = needs + wants + savings;

    if (total !== 100) {
      error.textContent = "Needs + Wants + Savings must equal exactly 100%.";
      return;
    }

    // Save user data
    localStorage.setItem("userName", name);
    localStorage.setItem("currencySymbol", currency);

    // Save custom rule
    localStorage.setItem(
      "budgetRule",
      JSON.stringify({
        needs,
        wants,
        savings,
      }),
    );

    setupModal.classList.remove("show");

    if (userNameDisplay) {
      userNameDisplay.textContent = `👤 ${name}`;
    }
  });
}

checkUserSetup();

// STORAGE HELPERS
function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

function saveTransactions(data) {
  localStorage.setItem("transactions", JSON.stringify(data));
}

function getCurrency() {
  return localStorage.getItem("currencySymbol") || "$";
}

// ADD / EDIT PAGE
const form = document.getElementById("budgetForm");
const typeSelect = document.getElementById("type");
const categoryGroup = document.getElementById("categoryGroup");
const categorySelect = document.getElementById("category");

// Hide category by default
if (categoryGroup) {
  categoryGroup.style.display = "none";
}

// Show category only if expense
if (typeSelect) {
  typeSelect.addEventListener("change", function () {
    if (this.value === "expense") {
      categoryGroup.style.display = "block";
    } else {
      categoryGroup.style.display = "none";
      categorySelect.value = "";
    }
  });
}

if (form) {
  const editId = localStorage.getItem("editId");

  if (editId) {
    const transactions = getTransactions();
    const transaction = transactions.find((t) => t.id == editId);

    if (transaction) {
      document.getElementById("type").value = transaction.type;
      document.getElementById("category").value = transaction.category;
      document.getElementById("amount").value = transaction.amount;
      document.getElementById("description").value = transaction.description;

      form.dataset.editing = editId;
    }

    localStorage.removeItem("editId");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const description = document.getElementById("description").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    if (!type || !amount || amount <= 0 || !description) {
      errorMessage.textContent =
        "All required fields must be filled and amount must be positive.";
      return;
    }

    // If expense, category is required
    if (type === "expense" && !category) {
      errorMessage.textContent = "Please select a category for expense.";
      return;
    }

    let transactions = getTransactions();
    const editingId = form.dataset.editing;

    if (editingId) {
      transactions = transactions.map((t) =>
        t.id == editingId ? { ...t, type, category, amount, description } : t,
      );
    } else {
      transactions.push({
        id: Date.now(),
        type,
        category: type === "expense" ? category : null,
        amount,
        description,
      });
    }

    saveTransactions(transactions);
    window.location.href = "transactions.html";
  });
}

// ===============================
// TRANSACTIONS PAGE
// ===============================

const transactionList = document.getElementById("transactionList");

if (transactionList) {
  renderTransactions();
}

function renderTransactions() {
  let transactions = getTransactions();

  // 🔥 Newest first
  transactions.sort((a, b) => b.id - a.id);

  const currency = getCurrency();

  transactionList.innerHTML = "";

  if (transactions.length === 0) {
    transactionList.innerHTML = `
    <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No Transactions Yet</h3>
        <p>Start by adding your first income, expense, or savings entry.</p>
        <a href="add.html" class="btn-empty">
            + Add Transaction
        </a>
    </div>
`;
    return;
  }

  transactions.forEach((t) => {
    const sign = t.type === "income" ? "+" : "-";
    const amountClass =
      t.type === "income" ? "income-amount" : "expense-amount";

    const div = document.createElement("div");
    div.classList.add("transaction-card");

    div.innerHTML = `
            <div class="transaction-info">
                <p class="transaction-type">
                    ${t.type.toUpperCase()}
                    ${t.category ? " - " + t.category : ""}
                </p>

                <p class="transaction-amount ${amountClass}">
                    ${sign}${currency}${t.amount.toLocaleString()}
                </p>

                <p class="transaction-desc">
                    ${t.description}
                </p>
            </div>

            <div class="transaction-actions">
                <button class="btn-edit" onclick="editTransaction(${t.id})">
                    ✏ Edit
                </button>

                <button class="btn-delete" onclick="deleteTransaction(${t.id})">
                    🗑 Delete
                </button>
            </div>
        `;

    transactionList.appendChild(div);
  });
}

function deleteTransaction(id) {
  let transactions = getTransactions();
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions(transactions);
  renderTransactions();
}

function editTransaction(id) {
  localStorage.setItem("editId", id);
  window.location.href = "add.html";
}
