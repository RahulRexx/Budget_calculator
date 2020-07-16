var budgetController = (function () {
    
    var Expense = function (id,description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    };

    Expense.prototype.calcPercentage = function (totalInc) {
        if(totalInc > 0)
        {
            this.percentage = Math.round(this.value / totalInc * 100);
        }
    };

    Expense.prototype.getPercentage = function (params) {
        return this.percentage;  
    };

    var Income = function (id,description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach( (current,index) => {
            sum += current.value;
        });
        data.total[type] = sum;
        // return sum;
    }

    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        total : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    };

    return {
        addItem : function (type , des, val) {
            
            var ID = 0,newItem;

            if(data.allItems[type].length > 0)
            {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }  else {
                ID = 0;
            }
            

            if(type === 'exp')
            {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem : function (type,id) {
            var ids,index;

            ids = data.allItems[type].map( (current) => {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
                

        },

        calculateBudget : function () {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.total.inc - data.total.exp;

            if(data.total.inc > 0)
                data.percentage = Math.round(data.total.exp/data.total.inc * 100);


        },
        calculatePercentage : function () {
            data.allItems.exp.forEach( (current) => {
                current.calcPercentage(data.total.inc); //
            });
        }, 
        getPercentage : function () {
            var allPerc = data.allItems.exp.map( (current) => {
                                return current.getPercentage();
                        });
                        return allPerc ;
        }
        ,
        getBudgets : function () {
            return {
                budget : data.budget,
                totalInc : data.total.inc,
                totalExp : data.total.exp,
                percentage : data.percentage
            };
        },
        testing : function () {
            
            console.log(data);
            
        }
    };




})();

var UIController = (function () {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensePercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

   var  formatNumber = function (num, type) {

        var numSplit, int, dec, sign;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
 
        int = numSplit[0];
        //234,53322
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+'

        return sign + int + '.' + dec;

    }

     var nodeListForEach = function (list, callback) {
         for (var i = 0; i < list.length; i++) {
             callback(list[i], i);
         }
     };


    return {
         getInput : function () {
            return {
                     type: document.querySelector(DOMstrings.inputType).value,
                     description: document.querySelector(DOMstrings.inputDescription).value,
                     value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
            
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem : function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields : function () {
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ', '+ DOMstrings.inputValue);
            // console.log(fields);
            //here field is a list , so we need to convert it in array
            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach( (current , index, completeArray) => {
                current.value ="";
            });

            // console.log(fieldsArr);    

            fieldsArr[0].focus()

        },
        displayBudget : function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            // console.log(obj);
            

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },
        displayPercentage : function (percentage) {
            
            var fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);

            nodeListForEach(fields,function (current , index) {

                console.log(current);
                

                if(percentage[index] > 0 )
                {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---'
                }
            });


        },
        displayMonth : function () {
            var now, months, month, year;
            
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changeType : function () {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },
        getDOMstrings: function () {
            // console.log(DOMstrings);
            return DOMstrings;
        }
       
    };

})();


var Controller = (function (budgetCtrl,UICtrl) {
    

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();
            document.querySelector(DOM.inputBtn).addEventListener('click', () => {
                ctrlAddItem();

            });

            document.addEventListener('keypress', (event) => {
                // console.log(event);
                if (event.keyCode === 13 || event.which === 13) {
                    // console.log("ENTER HITTED");
                    ctrlAddItem();
                }

            });

            document.querySelector(DOM.container).addEventListener('click', (event) => {
                // console.log(event.target);
                ctrlDeleteItem(event);
            });

            document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
    };

    var updateBudget = function () {
          budgetCtrl.calculateBudget();

          var budget = budgetCtrl.getBudgets();
        //   console.log(budget);

          UICtrl.displayBudget(budget); 

    };

    var updatePercentages = function () {
        budgetCtrl.calculatePercentage();

       var percentages =  budgetCtrl.getPercentage();
       console.log(percentages);
       
       UICtrl.displayPercentage(percentages);
    };

    var ctrlAddItem = function () {
        // 1st part
        var input = UICtrl.getInput();

        // 2nd part
        if(input.description !== "" &&  !isNaN(input.value) && input.value>0){
                var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                //3rd part
                UICtrl.addListItem(newItem, input.type);

                //4th part
                UICtrl.clearFields();

                updateBudget();

                updatePercentages();
        }
 
    };

    var ctrlDeleteItem = function (event) {

        var itemID,splitID,ID,type;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // console.log(itemID.id);
        if(itemID) {

            // format inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type,ID) ;

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentages();
        }
        
    };

    return {
        init : function () {
            console.log("Started");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
    
})(budgetController,UIController);



Controller.init();