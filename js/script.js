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
