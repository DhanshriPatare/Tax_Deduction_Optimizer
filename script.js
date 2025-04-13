function showTab(index) {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
      contents[i].classList.toggle('hidden', i !== index);
    });
  }
  
  document.getElementById("tax-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const regime = document.getElementById("regime").value;
    const salary = +document.getElementById("salary").value || 0;
    const interest = +document.getElementById("interest").value || 0;
    const rental = +document.getElementById("rental").value || 0;
    const digital = +document.getElementById("digital").value || 0;
    const exempt = +document.getElementById("exempt").value || 0;
    const homeSelf = +document.getElementById("homeLoanSelf").value || 0;
    const homeLet = +document.getElementById("homeLoanLet").value || 0;
    const other = +document.getElementById("otherIncome").value || 0;
  
    const basic80C = +document.getElementById("ded80c").value || 0;
    const medic80D = +document.getElementById("ded80d").value || 0;
    const home80EEA = +document.getElementById("ded80eea").value || 0;
    const npsEmp = +document.getElementById("ded80ccd2").value || 0;
    const interest80TTA = +document.getElementById("ded80tta").value || 0;
    const charity = +document.getElementById("ded80g").value || 0;
    const npsEmpCont = +document.getElementById("ded80ccd").value || 0;
    const otherDeduct = +document.getElementById("dedOther").value || 0;
  
    const grossIncome = salary + interest + rental + digital + other - exempt - homeSelf - homeLet;
    const totalDeduction = basic80C + medic80D + home80EEA + npsEmp + interest80TTA + charity + npsEmpCont + otherDeduct;
    const taxableIncome = Math.max(0, grossIncome - totalDeduction);
    let tax = 0;
  
    if (regime === "old") {
      if (taxableIncome <= 250000) tax = 0;
      else if (taxableIncome <= 500000) tax = 0.05 * (taxableIncome - 250000);
      else if (taxableIncome <= 1000000) tax = 12500 + 0.2 * (taxableIncome - 500000);
      else tax = 112500 + 0.3 * (taxableIncome - 1000000);
    } else {
      if (taxableIncome <= 250000) tax = 0;
      else if (taxableIncome <= 500000) tax = 0.05 * (taxableIncome - 250000);
      else if (taxableIncome <= 750000) tax = 12500 + 0.1 * (taxableIncome - 500000);
      else if (taxableIncome <= 1000000) tax = 37500 + 0.15 * (taxableIncome - 750000);
      else if (taxableIncome <= 1250000) tax = 75000 + 0.2 * (taxableIncome - 1000000);
      else if (taxableIncome <= 1500000) tax = 125000 + 0.25 * (taxableIncome - 1250000);
      else tax = 187500 + 0.3 * (taxableIncome - 1500000);
    }
  
    document.getElementById("result").textContent = `Total Tax Payable: ₹${tax.toFixed(2)}`;
  });
  