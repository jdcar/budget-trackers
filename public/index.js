document.addEventListener('DOMContentLoaded', (e) => {

  // Starter code 

  let transactions = [];
  let myChart;

  // /starter code

  // My code
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
  }


  let db
  const request = window.indexedDB.open("budget", 1);

  request.onerror = e => console.log(e.target.errorCode)

  request.onupgradeneeded = function (e) {
    const db = e.target.result
    const transactionStore = db.createObjectStore("transactions", {
      keyPath: "id", autoIncrement: true
    });

    // Create Index: Has to be unique value
    // transactionStore.createIndex('transationValue', 'value')
  }

  request.onsuccess = e => {
    db = e.target.result
    console.log(`successfully opened ${db.name}`)
    addData()
    getData()
  }

  let transactionData = []
  function addData() {
    var today = new Date();
    // const transactionData = [
    //   { name: "breakfast", value: 12, date: today },
    //   { name: "train ticket", value: 25, date: today }
    // ];
    const tran = db.transaction(['transactions'], "readwrite")

    // Add data from store
    const transactionStore = tran.objectStore('transactions')
    transactionData.forEach(transaction => transactionStore.add(transaction))
  }

  function getData() {
    // Get data from store
    const tran = db.transaction(['transactions'], "readwrite")
    const transactionStore = tran.objectStore('transactions')
    const getTranRequest = transactionStore.getAll()
    getTranRequest.onsuccess = e => {
      console.log(getTranRequest.result)
      transactions = getTranRequest.result
      populateTotal();
      populateTable();
      populateChart();
    }

  }

  // /my code

  fetch("/api/transaction")
    .then(response => {
      return response.json();
    })
    .then(data => {
      // save db data on global variable
      transactions = data;

      populateTotal();
      populateTable();
      populateChart();
    });

  function populateTotal() {
    // reduce transaction amounts to a single total value
    let total = transactions.reduce((total, t) => {
      return total + parseInt(t.value);
    }, 0);

    let totalEl = document.querySelector("#total");
    totalEl.textContent = total;
  }

  function populateTable() {
    let tbody = document.querySelector("#tbody");
    tbody.innerHTML = "";

    transactions.forEach(transaction => {
      // create and populate a table row
      let tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

      tbody.appendChild(tr);
    });
  }

  function populateChart() {
    // copy array and reverse it
    let reversed = transactions.slice().reverse();
    let sum = 0;

    // create date labels for chart
    let labels = reversed.map(t => {
      let date = new Date(t.date);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    });

    // create incremental values for chart
    let data = reversed.map(t => {
      sum += parseInt(t.value);
      return sum;
    });

    // remove old chart if it exists
    if (myChart) {
      myChart.destroy();
    }

    let ctx = document.getElementById("myChart").getContext("2d");

    myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: "Total Over Time",
          fill: true,
          backgroundColor: "#6666ff",
          data
        }]
      }
    });
  }

  function sendTransaction(isAdding) {
    let nameEl = document.querySelector("#t-name");
    let amountEl = document.querySelector("#t-amount");
    let errorEl = document.querySelector(".form .error");

    // validate form
    if (nameEl.value === "" || amountEl.value === "") {
      errorEl.textContent = "Missing Information";
      return;
    }
    else {
      errorEl.textContent = "";
    }

    // create record
    let transaction = {
      name: nameEl.value,
      value: amountEl.value,
      date: new Date().toISOString()
    };

    // if subtracting funds, convert amount to negative number
    if (!isAdding) {
      transaction.value *= -1;
    }

    
    // add to beginning of current array of data
    transactions.unshift(transaction);

    // re-run logic to populate ui with new record
    populateChart();
    populateTable();
    populateTotal();

    transactionData.push(transaction)

    transactionData.forEach(element => {
      if (!unique.includes(element)) {
        unique.push(element)
      }
    })
    addData()

    // also send to server
    fetch("/api/transaction", {
      method: "POST",
      body: JSON.stringify(transaction),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.errors) {
          errorEl.textContent = "Missing Information";
        }
        else {
          // clear form
          nameEl.value = "";
          amountEl.value = "";
        }
      })
      .catch(err => {
        // fetch failed, so save in indexed db
        saveRecord(transaction);

        // clear form
        nameEl.value = "";
        amountEl.value = "";
      });
  }

  document.querySelector("#add-btn").onclick = function () {
    sendTransaction(true);
  };

  document.querySelector("#sub-btn").onclick = function () {
    sendTransaction(false);
  };
})