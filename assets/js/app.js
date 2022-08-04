// DEV.FINANCE APP.JS

// Object that stores the main functions to work with the localStorage.
const storage = {
  // Function that gets what is stored in the LocalStorage or if the key "devFinance:transactions" doesn't exist in the localStorage an empty array is returned.
  get() {
    return JSON.parse(localStorage.getItem('devFinance:transactions')) || []
  },
  // Function that sets an entered value to the LocalStorage key "devFinance:transactions".
  set(transactions) {
    localStorage.setItem(
      'devFinance:transactions',
      JSON.stringify(transactions)
    )
  }
}

// Object responsible for storing the functions that are related with the transactions (calculus, adding, removing, etc).
const transaction = {
  // Everytime the aplicattion loads, the data stored in the LocalStorage is loaded as an array and stored at transaction.all.
  all: storage.get(),

  // When this function is called with a value as argument the value is pushed into the transaction.all array and the app reloads so that it can show the updates in the html.
  add: transact => {
    transaction.all.push(transact)
    app.reload()
  },

  // When this function is called with an id as argument the transaction is removed from the transaction.all array and the app reloads so that it can show the updates in the html.
  remove: transactId => {
    transaction.all.splice(transactId, 1)
    app.reload()
  },

  // Function that returns the sum of all incomes stored in the transaction.all array.
  incomes: () => {
    let incomes = 0
    const filteredIncomes = transaction.all
      .map(transaction => transaction.amount)
      .filter(transaction => transaction > 0)

    filteredIncomes.forEach(income => (incomes += income))

    return incomes
  },

  // Function that returns the sum of all expenses stored in the transaction.all array.
  expenses: () => {
    let expenses = 0
    const filteredExpenses = transaction.all
      .map(transaction => transaction.amount)
      .filter(transaction => transaction < 0)

    filteredExpenses.forEach(expense => (expenses += expense))
    return expenses
  },

  // Function that returns the sum of all incomes and expenses stored in the transaction.all array and toggles the application's theme according to the sum.
  total: () => {
    let total = 0
    const mappedTotal = transaction.all.map(transaction => transaction.amount)
    mappedTotal.forEach(transact => (total += transact))
    htmlManipulations.toggleGreenAndRedTheme(total)
    return total
  }
}

// Object responsible for storing the functions that manipulate data input and output visually in HTML.
const htmlManipulations = {
  // Function that switches the application's theme according to an entered total. If the total is positive, the application turns green. If not, the application turns red.
  toggleGreenAndRedTheme: total => {
    const header = document.querySelector(`header`)
    const totalCard = document.querySelector(`.card.total`)
    if (total >= 0) {
      totalCard.classList.remove(`red`)
      header.classList.remove(`red`)

      totalCard.classList.add(`green`)
      header.classList.add(`green`)
    } else {
      totalCard.classList.remove(`green`)
      header.classList.remove(`green`)

      totalCard.classList.add(`red`)
      header.classList.add(`red`)
    }
  },

  // Function that opens/closes the input modal.
  toggleModalOpen: modalId => {
    const modalOverlay = document.querySelector(`#${modalId}`)
    modalOverlay.classList.toggle(`open`)
    form.clearFields()
  },

  // Function that generates html for the specified transaction in the specified index of the main data structure.
  innerHTMLTransaction: (transaction, index) => {
    const newTransaction = transaction[index]
    const cssClass = newTransaction.amount > 0 ? `income` : `expense`
    const amount = utilities.formatCurrency(newTransaction.amount)
    const html = `
    <tr>
      <td class="description">${newTransaction.description}</td>
      <td class="${cssClass}">${amount}</td>
      <td class="date">${newTransaction.date}</td>
      <td class="deleteTransaction" onclick="transaction.remove(${index})">
        <img src="./assets/icons/minus.svg" alt="" />
      </td>
    </tr>
    `

    return html
  },

  // Function that adds the html generated by the "htmlManipulations.innerHTMLTransaction()" function to the page.
  addTransaction: (transaction, index) => {
    const tr = document.createElement(`tr`)
    tr.classList.add(`transaction`)
    const tbody = document.querySelector(`tbody`)
    tr.innerHTML = htmlManipulations.innerHTMLTransaction(transaction, index)
    tr.id = index
    tbody.appendChild(tr)
  },

  // Function that updates data in the cards that show the total of incomes, expenses and balance.
  updateBalance: () => {
    const entry = document.querySelector(`.card.entry .value`)
    const out = document.querySelector(`.card.out .value`)
    const total = document.querySelector(`.card.total .value`)

    entry.innerHTML = utilities.formatCurrency(transaction.incomes())
    out.innerHTML = utilities.formatCurrency(transaction.expenses())
    total.innerHTML = utilities.formatCurrency(transaction.total())
  },

  // Function that clears all transactions from the html table.
  removeAllTransactions: () => {
    const allTransactions = document.querySelectorAll(`.transaction`)
    allTransactions.forEach(transact => transact.remove())
  }

  // Function that removes a specific transaction from the html by its id
}

// Object responsible for storing useful functions to be used many times inside other functions.
const utilities = {
  // Function that formats the amount value to the brazillian currency.
  formatCurrency: value => {
    return (value / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  },

  // Function that formats the amount by turning it into a number and multiplying it by 100 so that it's not a float number anymore.
  formatAmount: amountValue => {
    return Number(amountValue) * 100
  },

  // Function that formats the date to the brazillian pattern (dd/mm/yyyy).
  formatDate: dateValue => {
    return dateValue.replace(/(\d{4})-(\d{2})-(\d{2})/, `$3/$2/$1`)
  }
}

// Object responsible for storing functions related to the modal form.
const form = {
  // Function that returns the values entered in the form as an object ({description: ..., amount: ..., date:...}).
  getValues: () => {
    return {
      description: document.querySelector("#description").value,
      amount: document.querySelector("#amount").value,
      date: document.querySelector("#date").value
    }
  },

  // Function that submits the form by executing all related functions in the right order.
  submit: event => {
    event.preventDefault()
    try {
      form.validateFields()
      const transaction = form.formatData()
      htmlManipulations.toggleModalOpen('modalOverlay')
      form.saveTransaction(transaction)

    } catch (error) {
      alert(error.message)
    }
  },

  // Function that validades the field by checking if all fields are filled and throws an error if not.
  validateFields: () => {
    const { description, amount, date } = form.getValues()
    const someFieldsAreEmpty =
      description.trim() === '' || amount.trim() === '' || date.trim() === ''

    if (someFieldsAreEmpty) {
      throw new Error('Todos os campos devem ser preenchidos')
    }
  },

  // Function that formats the data so that it can be added and read in the transaction.all array properly.
  formatData: () => {
    let { description, amount, date } = form.getValues()
    amount = utilities.formatAmount(amount)
    date = utilities.formatDate(date)
    return {
      description: description,
      amount: amount,
      date: date
    }
  },

  // Function that saves the transaction by adding it to the transaction.all array.
  saveTransaction: transact => {
    transaction.add(transact)
  },

  // Function that clears all the values of the form fields.
  clearFields: () => {
    const description = document.querySelector(`#description`)
    const amount = document.querySelector(`#amount`)
    const date = document.querySelector(`#date`)
    description.value = ``
    amount.value = ``
    date.value = ``
  }
}

// Object that stores the two main function of the app.
const app = {
  // Function that initializes the application by adding all the transactions that are already stored to the html, setting the localStorage to the same value as the transaction.all array and updating balance.
  init: () => {
    transaction.all.forEach(obj => {
      htmlManipulations.addTransaction(
        transaction.all,
        transaction.all.indexOf(obj)
      )
    })

    htmlManipulations.updateBalance()
    storage.set(transaction.all)
  },
  // Function that reloads the html by removing all transactions from the html and initializing the app again.
  reload: () => {
    htmlManipulations.removeAllTransactions()
    console.log(transaction.all)
    app.init()
  }
}

app.init()