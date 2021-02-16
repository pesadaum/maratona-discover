const Modal = {
    open() {
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },
    close() {
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transactions))
    }
}


const transaction = {
    all: Storage.get(),
    
    add(props){
        transaction.all.push(props)
        App.reload()
    },

    remove(index){
        transaction.all.splice(index,1)
        App.reload()
    },

    incomes() {
        let income = 0
        transaction.all.forEach( transaction => {
            if (transaction.amount > 0){
                income += transaction.amount
            }

        })
        return income
    },

    expenses() {
        let expense = 0
        transaction.all.forEach( transaction => {
            if (transaction.amount < 0){
                expense += transaction.amount
            }

        })
        return expense

    },

    total() {
        return transaction.incomes() + transaction.expenses()
    }

}

const DOM = {
    TransactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLtransaction(transaction)
        DOM.TransactionsContainer.appendChild(tr)
        tr.dataset.index = index
    },

    innerHTMLtransaction(transaction, index) {
        
        const CSSclass = transaction.amount > 0 ? "income" : "expense" 
        const amount = utils.formatCurrency(transaction.amount)
        
        const html = `
                        <td class="description">${transaction.description}</td>
                        <td class="${CSSclass}">${amount}</td>
                        <td class="date">${transaction.date}</td>
                        <td>
                            <img onclick="transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                        </td>
                    `
        return html
    },

    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = utils.formatCurrency(transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = utils.formatCurrency(transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = utils.formatCurrency(transaction.total())
    },

    clearTransactions(){
        DOM.TransactionsContainer.innerHTML = ""
    }
}

const utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" :"" 
        
        value = String(value).replace(/\D/g,"")
        value = Number(value)/100
        value = value.toLocaleString("pt-BR",{
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },

    formatAmount(value){
        value = Number(value) * 100
        return value
    },

    formatDate(value){
        const splittedDate = value.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const {description, amount, date} = Form.getValues()
        console.log(description)

        if(description.trim() ==="" || amount.trim() ==="" || date.trim() ===""){
            throw new Error("Preencha todos os campos")
        }
    },
    
    formatValues(){
        let {description, amount, date} = Form.getValues()

        amount = utils.formatAmount(amount)
        date = utils.formatDate(date)

        return{
            description,
            amount,
            date
        }
        
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    
    submit(event){
        event.preventDefault()
        
        try {
            Form.validateFields()
            const FormattedTrans = Form.formatValues()
            transaction.add(FormattedTrans)
            Form.clearFields()
            Modal.close()
        } 
        catch (error) {
            alert(error.message)
            
        }
    }

}


const App = {
    init(){
        transaction.all.forEach((transaction, index) => DOM.addTransaction(transaction, index))
        DOM.updateBalance() 
        Storage.set(transaction.all)

    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
