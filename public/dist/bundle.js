/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/index.js":
/*!*************************!*\
  !*** ./public/index.js ***!
  \*************************/
/***/ (() => {

eval("document.addEventListener('DOMContentLoaded', (e) => {\n\n  // Starter code \n\n  let transactions = [];\n  let myChart;\n\n  // /starter code\n\n  // My code\n  if (!window.indexedDB) {\n    console.log(\"Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.\");\n  }\n\n\n  let db\n  const request = window.indexedDB.open(\"budget\", 1);\n\n  request.onerror = e => console.log(e.target.errorCode)\n\n  request.onupgradeneeded = function (e) {\n    const db = e.target.result\n    const transactionStore = db.createObjectStore(\"transactions\", {\n      keyPath: \"id\", autoIncrement: true\n    });\n\n    // Create Index: Has to be unique value\n    // transactionStore.createIndex('transationValue', 'value')\n  }\n\n  request.onsuccess = e => {\n    db = e.target.result\n    console.log(`successfully opened ${db.name}`)\n    addData()\n    getData()\n  }\n\n  let transactionData = []\n  function addData() {\n    var today = new Date();\n    // const transactionData = [\n    //   { name: \"breakfast\", value: 12, date: today },\n    //   { name: \"train ticket\", value: 25, date: today }\n    // ];\n    const tran = db.transaction(['transactions'], \"readwrite\")\n\n    // Add data from store\n    const transactionStore = tran.objectStore('transactions')\n    transactionData.forEach(transaction => transactionStore.add(transaction))\n  }\n\n  function getData() {\n    // Get data from store\n    const tran = db.transaction(['transactions'], \"readwrite\")\n    const transactionStore = tran.objectStore('transactions')\n    const getTranRequest = transactionStore.getAll()\n    getTranRequest.onsuccess = e => {\n      console.log(getTranRequest.result)\n      transactions = getTranRequest.result\n      populateTotal();\n      populateTable();\n      populateChart();\n    }\n\n  }\n\n  // /my code\n\n  fetch(\"/api/transaction\")\n    .then(response => {\n      return response.json();\n    })\n    .then(data => {\n      // save db data on global variable\n      transactions = data;\n\n      populateTotal();\n      populateTable();\n      populateChart();\n    });\n\n  function populateTotal() {\n    // reduce transaction amounts to a single total value\n    let total = transactions.reduce((total, t) => {\n      return total + parseInt(t.value);\n    }, 0);\n\n    let totalEl = document.querySelector(\"#total\");\n    totalEl.textContent = total;\n  }\n\n  function populateTable() {\n    let tbody = document.querySelector(\"#tbody\");\n    tbody.innerHTML = \"\";\n\n    transactions.forEach(transaction => {\n      // create and populate a table row\n      let tr = document.createElement(\"tr\");\n      tr.innerHTML = `\n      <td>${transaction.name}</td>\n      <td>${transaction.value}</td>\n    `;\n\n      tbody.appendChild(tr);\n    });\n  }\n\n  function populateChart() {\n    // copy array and reverse it\n    let reversed = transactions.slice().reverse();\n    let sum = 0;\n\n    // create date labels for chart\n    let labels = reversed.map(t => {\n      let date = new Date(t.date);\n      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;\n    });\n\n    // create incremental values for chart\n    let data = reversed.map(t => {\n      sum += parseInt(t.value);\n      return sum;\n    });\n\n    // remove old chart if it exists\n    if (myChart) {\n      myChart.destroy();\n    }\n\n    let ctx = document.getElementById(\"myChart\").getContext(\"2d\");\n\n    myChart = new Chart(ctx, {\n      type: 'line',\n      data: {\n        labels,\n        datasets: [{\n          label: \"Total Over Time\",\n          fill: true,\n          backgroundColor: \"#6666ff\",\n          data\n        }]\n      }\n    });\n  }\n\n  function sendTransaction(isAdding) {\n    let nameEl = document.querySelector(\"#t-name\");\n    let amountEl = document.querySelector(\"#t-amount\");\n    let errorEl = document.querySelector(\".form .error\");\n\n    // validate form\n    if (nameEl.value === \"\" || amountEl.value === \"\") {\n      errorEl.textContent = \"Missing Information\";\n      return;\n    }\n    else {\n      errorEl.textContent = \"\";\n    }\n\n    // create record\n    let transaction = {\n      name: nameEl.value,\n      value: amountEl.value,\n      date: new Date().toISOString()\n    };\n\n    // if subtracting funds, convert amount to negative number\n    if (!isAdding) {\n      transaction.value *= -1;\n    }\n\n    \n    // add to beginning of current array of data\n    transactions.unshift(transaction);\n\n    // re-run logic to populate ui with new record\n    populateChart();\n    populateTable();\n    populateTotal();\n    transactionData.push(transaction)\n    addData()\n\n    // also send to server\n    fetch(\"/api/transaction\", {\n      method: \"POST\",\n      body: JSON.stringify(transaction),\n      headers: {\n        Accept: \"application/json, text/plain, */*\",\n        \"Content-Type\": \"application/json\"\n      }\n    })\n      .then(response => {\n        return response.json();\n      })\n      .then(data => {\n        if (data.errors) {\n          errorEl.textContent = \"Missing Information\";\n        }\n        else {\n          // clear form\n          nameEl.value = \"\";\n          amountEl.value = \"\";\n        }\n      })\n      .catch(err => {\n        // fetch failed, so save in indexed db\n        saveRecord(transaction);\n\n        // clear form\n        nameEl.value = \"\";\n        amountEl.value = \"\";\n      });\n  }\n\n  document.querySelector(\"#add-btn\").onclick = function () {\n    sendTransaction(true);\n  };\n\n  document.querySelector(\"#sub-btn\").onclick = function () {\n    sendTransaction(false);\n  };\n})\n\n//# sourceURL=webpack://budget-app/./public/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./public/index.js"]();
/******/ 	
/******/ })()
;