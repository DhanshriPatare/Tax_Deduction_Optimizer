function showTab(index) {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
    contents[i].classList.toggle('hidden', i !== index);
  });
}

// Priority Queue classf
class PriorityQueue {
  constructor() {
    this.queue = [];
  }
  enqueue(item, priority) {
    this.queue.push({ item, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
  }
  dequeue() {
    return this.queue.shift();
  }
  isEmpty() {
    return this.queue.length === 0;
  }
}

// Optional: Deduction class for structured info
class Deduction {
  constructor(name, value, section) {
    this.name = name;
    this.value = value;
    this.section = section;
  }
}

document.getElementById("tax-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const regime = document.getElementById("regime").value;
  const age = +document.getElementById("age").value;
  const salary = +document.getElementById("salary").value || 0;
  const interest = +document.getElementById("interest").value || 0;
  const rental = +document.getElementById("rental").value || 0;
  const digital = +document.getElementById("digital").value || 0;
  const exempt = +document.getElementById("exempt").value || 0;
  const homeSelf = +document.getElementById("homeLoanSelf").value || 0;
  const homeLet = +document.getElementById("homeLoanLet").value || 0;
  const other = +document.getElementById("otherIncome").value || 0;

  const incomeTotal = salary + interest + rental + digital + other - exempt - homeSelf - homeLet;

  const deductions = {
    "80C": +document.getElementById("ded80c").value || 0,
    "80D": +document.getElementById("ded80d").value || 0,
    "80EEA": +document.getElementById("ded80eea").value || 0,
    "80CCD(2)": +document.getElementById("ded80ccd2").value || 0,
    "80TTA": +document.getElementById("ded80tta").value || 0,
    "80G": +document.getElementById("ded80g").value || 0,
    "80CCD": +document.getElementById("ded80ccd").value || 0,
    "Other": +document.getElementById("dedOther").value || 0
  };

  const totalDeduction = Object.values(deductions).reduce((a, b) => a + b, 0);
  const taxableIncome = Math.max(0, incomeTotal - totalDeduction);

  // ---------------- OLD REGIME CALCULATION ----------------
  let slab1 = 250000, slab2 = 500000, slab3 = 1000000;

  if (age >= 60 && age < 80) {
    slab1 = 300000;
  } else if (age >= 80) {
    slab1 = 500000;
  }

  let taxOld = 0;
  if (taxableIncome <= slab1) {
    taxOld = 0;
  } else if (taxableIncome <= slab2) {
    taxOld = 0.05 * (taxableIncome - slab1);
  } else if (taxableIncome <= slab3) {
    taxOld = 0.05 * (slab2 - slab1) + 0.2 * (taxableIncome - slab2);
  } else {
    taxOld = 0.05 * (slab2 - slab1) + 0.2 * (slab3 - slab2) + 0.3 * (taxableIncome - slab3);
  }

  // ---------------- NEW REGIME CALCULATION ----------------
  let taxNew = 0;
  if (taxableIncome <= 300000) taxNew = 0;
  else if (taxableIncome <= 600000) taxNew = 0.05 * (taxableIncome - 300000);
  else if (taxableIncome <= 900000) taxNew = 0.05 * 300000 + 0.1 * (taxableIncome - 600000);
  else if (taxableIncome <= 1200000) taxNew = 0.05 * 300000 + 0.1 * 300000 + 0.15 * (taxableIncome - 900000);
  else if (taxableIncome <= 1500000) taxNew = 0.05 * 300000 + 0.1 * 300000 + 0.15 * 300000 + 0.2 * (taxableIncome - 1200000);
  else taxNew = 0.05 * 300000 + 0.1 * 300000 + 0.15 * 300000 + 0.2 * 300000 + 0.3 * (taxableIncome - 1500000);

  // ---------------- REBATE UNDER 87A ----------------
  if (taxableIncome <= 500000) {
    taxOld = 0;
    taxNew = 0;
  }

  // ---------------- CESS (4%) ----------------
  taxOld *= 1.04;
  taxNew *= 1.04;

  const betterRegime = taxOld < taxNew ? 'Old Regime' : 'New Regime';
  const taxSaved = Math.abs(taxOld - taxNew).toFixed(2);
  
  document.getElementById("tax-summary").textContent =
    `Tax Payable (New Regime): ₹${taxNew.toFixed(2)}\n` +
    `Tax Payable (Old Regime): ₹${taxOld.toFixed(2)}\n` +
    `You should go with the ${betterRegime} as it results in less tax.`;

  createGraph(incomeTotal, totalDeduction, taxableIncome);
  showSmartSuggestions(deductions, age, homeSelf, homeLet);
});

function createGraph(income, deductions, taxable) {
  const ctx = document.createElement('canvas');
  const container = document.getElementById("graph-container");
  container.innerHTML = '';
  container.appendChild(ctx);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Gross Income', 'Deductions', 'Taxable Income'],
      datasets: [{
        label: 'Amount (₹)',
        data: [income, deductions, taxable],
        backgroundColor: ['#3aafa9', '#d3e0ea', '#ff914d'],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function showSmartSuggestions(deductions, age, homeLoanSelf, homeLoanLetOut) {
  const pq = new PriorityQueue();

  if (deductions["80C"] < 150000) pq.enqueue(new Deduction("Invest in PPF/ELSS/LIC", 150000 - deductions["80C"], "80C"), 8);
  if (deductions["80D"] < ((age >= 60) ? 50000 : 25000)) {
    pq.enqueue(new Deduction("Buy/Renew Health Insurance", ((age >= 60) ? 50000 : 25000) - deductions["80D"], "80D"), 7);
  }
  if (deductions["80CCD"] < 50000) pq.enqueue(new Deduction("Contribute to NPS (Self)", 50000 - deductions["80CCD"], "80CCD(1B)"), 6);
  if (deductions["80EEA"] < 150000) pq.enqueue(new Deduction("Claim more Home Loan interest", 150000 - deductions["80EEA"], "80EEA"), 5);
  if (deductions["80TTA"] < 10000) pq.enqueue(new Deduction("Claim interest on savings account", 10000 - deductions["80TTA"], "80TTA"), 4);
  if (deductions["80G"] === 0) pq.enqueue(new Deduction("Donate to charity (80G)", 50000, "80G"), 3);
  if (homeLoanSelf === 0 && homeLoanLetOut === 0) pq.enqueue(new Deduction("Consider taking a home loan", 200000, "24(b)"), 2);

  let suggestionText = `📊 Smart Deduction Suggestions:\n\n`;
  let index = 1;
  while (!pq.isEmpty()) {
    const { item } = pq.dequeue();
    suggestionText += `${index++}. ${item.name} (Section ${item.section}): ₹${item.value.toFixed(2)}\n`;
  }
  suggestionText += `\n💡 Tip: These deductions can help reduce your taxable income.`;

  document.getElementById("suggestion-box").textContent = suggestionText;
}

// PDF Export (basic - extend as needed)
document.getElementById('export-pdf').addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const regime = document.getElementById('regime').value;
  const age = document.getElementById('age').value;

  const incomeFields = ['salary', 'interest', 'rental', 'digital', 'exempt', 'homeLoanSelf', 'homeLoanLet', 'otherIncome'];
  const deductionFields = ['ded80c', 'ded80d', 'ded80eea', 'ded80ccd2', 'ded80tta', 'ded80g', 'ded80ccd', 'dedOther'];

  const incomeDetails = incomeFields.map(id => `${id}: ₹${document.getElementById(id).value || 0}`).join('\n');
  const deductionDetails = deductionFields.map(id => `${id}: ₹${document.getElementById(id).value || 0}`).join('\n');

  const summaryText = document.getElementById('tax-summary').innerText;
  const suggestionText = document.getElementById('suggestion-box').innerText;

  // -------------------------------
  // Section 1: Summary & User Info
  // -------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text("Income Tax Summary", 15, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(summaryText, 180);
  doc.text(summaryLines, 15, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("User Info", 15, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Age Category: ${age}`, 15, 62);
  doc.text(`Selected Regime: ${regime}`, 15, 70);

  // -------------------------------
  // Section 2: Income & Deductions
  // -------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Income Details", 15, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const incomeLines = doc.splitTextToSize(incomeDetails, 80);
  doc.text(incomeLines, 15, 92);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Deduction Details", 110, 85);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const deductionLines = doc.splitTextToSize(deductionDetails, 80);
  doc.text(deductionLines, 110, 92);

  // -------------------------------
  // Section 3: Graph (Next Page)
  // -------------------------------
  const canvas = document.querySelector('#graph-container canvas');
  if (canvas) {
    const graphImage = canvas.toDataURL("image/png", 1.0);
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("Tax Regime Comparison Graph", 15, 20);

    doc.addImage(graphImage, 'PNG', 30, 30, 150, 100);
  }

  // -------------------------------
  // Section 4: Smart Suggestions
  // -------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("Smart Suggestions", 15, 140);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const suggestionLines = doc.splitTextToSize(suggestionText, 180);
  doc.text(suggestionLines, 15, 150);

  // Save PDF
  doc.save("Income_Tax_Calculation_Result.pdf");
});
