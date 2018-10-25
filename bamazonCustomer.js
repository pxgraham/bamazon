//VARIABLES FOR NPM PACKAGES
var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require('cli-table');

//CONNECTION TO SQL DATABASE
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});
connection.connect(function(err) {
  if (err) throw err;
  init();
});

//INITIALIZES MAIN MENU
function init() {
    console.log('Welcome To The Store Front!(admin)')
    inquirer
    .prompt([
        {
            type: 'list',
            choices: ['Customer', 'Manager', 'Supervisor'],
            message: 'Sign in as:',
            name: "type"
        }   
    ])
    .then(function (res) {
        if(res.type === 'Customer') {
            displayProducts();
        } else if(res.type === 'Manager') {
            managerView();
            return;
        } else if(res.type === 'Supervisor') {
            console.log('this feature is not available yet');
            return;
        }
    });  
}
//MANAGER VIEW
function managerView() {
    inquirer
    .prompt([
        {
            type: 'list',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Log Out'],
            message: 'What would you like to do?',
            name: "view"
        }   
    ])
    .then(function (res) {
        switch(res.view) {
            case 'View Products for Sale': 
                viewProducts();
                break;
            case 'View Low Inventory':   
                viewLowProducts();         
                break;
            case 'Add to Inventory':
                increaseQuantity();
                break;
            case 'Add New Product':
                addProducts();
                break;
            case 'Log Out':
                init();
                break;
        }
    });      
}
//VIEW PRODUCTS FOR MANAGER
function viewProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['ID', 'PRODUCT', 'PRICE', 'IN-STOCK'], 
            colWidths: [5, 20, 10, 10]
        });       
        for(var i = 0; i < res.length; i++) {
            var prices = '$' + res[i].price;
            table.push(
                [res[i].item_id, res[i].product_name, prices, res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        managerView();
    });
}
//VIEW LOW PRODUCTS FOR MANAGER
function viewLowProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['ID', 'PRODUCT', 'PRICE', 'IN-STOCK'], 
            colWidths: [5, 20, 10, 10]
        });       
        for(var i = 0; i < res.length; i++) {
            var prices = '$' + res[i].price;
            table.push(
                [res[i].item_id, res[i].product_name, prices, res[i].stock_quantity]
            );
            if(res[i].stock_quantity > 5) {
                table.splice(-1,1);
            }
        }
        console.log(table.toString());
        managerView();
    });  
}
//INCREASE QUANTITY OF ITEMS
function increaseQuantity() {
    inquirer
    .prompt([
        {
            type: "input",
            message: "Enter the ID of the item that you want to increase:",
            name: "item"
        },   
        {
            type: "input",
            message: "How many of the items are you adding?",
            name: "amount"
        }             
    ])
    .then(function (res) {
        var sql = "UPDATE products SET stock_quantity = " + res.amount + " WHERE item_id = " + res.item;
        connection.query(sql, function(err, res) {
            if(err) {
                console.log('You made an error in a term');
                managerView();
            }
            console.log('\nItem Volume Increased!\n');
            managerView();
        });
    });  
}
//ADD PRODUCTS (MANAGER)
function addProducts() {
    inquirer
    .prompt([
        {
            type: "input",
            message: "What product would you like to add?",
            name: "name"
        },
        {
            type: "input",
            message: "What is the price of the item?",
            name: "price"
        },    
        {
            type: "input",
            message: "How many of the item are you adding?",
            name: "quantity"
        },
        {
            type: "list",
            message: "What department is it catetorized in?",
            choices: ['Produce', 'Tools', 'Costumes'],
            name: "dept"
        }                  
    ])
    .then(function (res) {
        var sql = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (" + "'" + res.name + "'," + "'" + res.dept + "'," +  "'" + res.price + "'," + "'" + res.quantity + "'" + ")";
        // connection.query("SELECT * FROM products", function(err, res) {
        //     console.log(res);
        //     managerView();
        //     return;
        // });
        connection.query(sql, function(err, res) {
            if(err) {
                console.log(err);
            }
            console.log('\nItem successfully added!\n');
            managerView();
        });
    });  
}

//DISPLAYS LIST OF PRODUCTS THEN INITIATES PROMPTS
function displayProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['ID', 'PRODUCT', 'PRICE', 'IN-STOCK'], 
            colWidths: [5, 20, 10, 10]
        });       
        for(var i = 0; i < res.length; i++) {
            var prices = '$' + res[i].price;
            table.push(
                [res[i].item_id, res[i].product_name, prices, res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        startInput();
    });
}

//INITIATES PROMPTS
function startInput() {
    inquirer
    .prompt([
        {
            type: "input",
            message: "What would you like to buy? (type in the item ID)",
            name: "buy_item"
        },
        {
            type: "input",
            message: "How many of the item would you like?",
            name: "buy_amount"
        },    
    ])
    .then(function (res) {
        var buyID = res.buy_item;
        var buyAmount = res.buy_amount;
        checkExists(buyID, buyAmount);
    });
}

//CHECKS IF THE ITEM CHOSEN IS IN THE STORE
function checkExists(buyID, buyAmount) {
    connection.query("SELECT * FROM products WHERE item_id = ?", [buyID], function(err, item) {        
        if (err) {
            throw err
        }      
        if(item[0] == undefined) {
            console.log(`\nHmm... Seems we don\'t have the item you\'re looking for :/\n`)
            startInput();
        } else {
            var selectedItem = item[0].product_name;
            var quantity = item[0].stock_quantity;
            checkAmount(buyAmount, buyID, selectedItem, quantity);
        }
    });
}

//CHECKS IF THERE ARE ENOUGH ITEMS IN STORE TO SATISFY ORDER
function checkAmount(buyAmount, buyID, selectedItem, quantity) {
    connection.query("SELECT * FROM products WHERE item_id = ?", [buyID], function(err, item) {
        var total = buyAmount * item[0].price;
        if (err) {
            throw err
        }      
        if(buyAmount === NaN) {
            console.log(`\nPlease type in numbers only.\n`)
            startInput();
        }
        if(buyAmount === 0) {
            console.log('You can\'t buy 0!');
            startInput();
        }
        if(buyAmount > item[0].stock_quantity) {
            console.log(`\nUnfortunately, we don't have than many ${selectedItem}s in stock :/\n`)
            startInput();
        } else {
            console.log(`\nGreat! So, ${buyAmount} ${selectedItem}(s) will cost $${total}.`);
            confirmPrompt(buyAmount, selectedItem, quantity);
        }
    });    
}

//CONFIRMS PAYMENT AMOUNT BEFORE YOU PURCHASE
function confirmPrompt(buyAmount, selectedItem, quantity) {
    inquirer
    .prompt([
        {
            type: 'confirm',
            message: 'Would you like to proceed to checkout?',
            name: "choice"
        },   
    ])
    .then(function (res) {
        if(!res.choice) {
            console.log(`Okay, come back when you need some more stuff!`)
            shopMore();
        } else {
            console.log(`\nAwesome! We've withdrawn the money from your account....`);
            console.log(`You should expect your item in the next 3 to 5 business days. Have a great day!\n`);
            deductQuantity(buyAmount, selectedItem, quantity);
        }
    });
}

//DEDUCTS QUANTITY OF ITEMS PURCHASED FROM DATABASE
function deductQuantity(buyAmount, selectedItem, quantity) {
    var newTotal = quantity - buyAmount;
    var sql = "UPDATE products SET stock_quantity = " + newTotal + " WHERE product_name = " + "'" + selectedItem + "'";
    connection.query(sql, function (err, result) {
        if (err) throw err;
    });
    shopMore();
}

//DISPLAYS THE PRODUCTS AND GOES BACK TO INITAL PROMPT AFTER YOU CONFIRM
function shopMore() {
    inquirer
    .prompt([
        {
            type: "input",
            message: "Press ENTER to continue shopping...",
            name: "confirm"
        },   
    ])
    .then(function (res) {
        displayProducts();
    });
}