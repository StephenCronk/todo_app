var sortable = $('sortable');

var drake = dragula([sortable]);

var tasksDoneToday = 0;

var todayformatted;

// Define a custom log function
function c() {
    console.log.apply(console, arguments);
}

// Now you can use c() instead of console.log()
c("This is a shortened log message.");

var set = [];

function $ (id) {
    return document.getElementById(id);
}

drake.on('drop', function(el, target, source, sibling) 
{
    //console.log(el, target, source, sibling);
    UpdateTasks();
});

//on dom content loaded
document.addEventListener('DOMContentLoaded', function() 
{
    //load all known tasks
    LoadTasks().then(MakeDarkMode);
    MonthCompletions().then(MakeGraph);

    //listener for button
    // Get a reference to the button element by its id
    const newTaskButton = document.getElementById('newTaskButton');

    // Add a click event listener to the button
    newTaskButton.addEventListener('click', function() {
        // Your code to handle the button click event goes here
        console.log('New Task Button clicked!');
    
        NewTaskBox();
        
        // You can perform any actions you want in response to the button click
    });
});


function DarkModeStatus()
{
    //returns current dark mode status
    const darkModeToggle = document.getElementById('darkModeToggle');
    console.log("dark mode status called: " + darkModeToggle.checked);
    return darkModeToggle.checked;
}

function SetDarkModeOnElement(element, darkModeEnabled)
{
    
    const buttons = element.querySelectorAll('.btn-round'); // Select all buttons
    console.log("buttons in doc: " + buttons.length);
     // Toggle dark mode for buttons
     buttons.forEach((button) => {
         if (darkModeEnabled) {
             button.classList.add('dark-mode');
             c("toggled dark mode for a button");
         } else {
             button.classList.remove('dark-mode');
         }
     });

     const cards = element.querySelectorAll('.card-round');
     console.log("cards in doc: "+ cards.length);
     cards.forEach((card) => {
        if(darkModeEnabled) {
            card.classList.add('dark-mode');
        } else {
            card.classList.remove('dark-mode');
        }
        });
     
        const inputs = element.querySelectorAll('.form-control');
     console.log("inputs in doc: "+ inputs.length);
     inputs.forEach((input) => {
        if(darkModeEnabled) {
            input.classList.add('text-light');
        } else {
            input.classList.remove('text-light');
        }
        });
}

//task card template:
var newTaskDiv = 
`<div class="card card-round "mb-3" style="max-width: 36rem; box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.2); border-radius:24px; margin-bottom: 12px;">
    <div class="card-body d-flex align-items-stretch">
        <input id="taskInput" type="text" class="form-control border-0 flex-grow-1" style="outline: none !important; background-color: transparent; box-shadow: none !important;" placeholder="new task" maxlength="64">
        <button id="doneButton" type="button" class="btn-round btn-outline-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
        </button>
        <button id="notDoneButton" type="button" class="btn-round btn-primary" style="display:block; background: #0d6efd">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
            </svg>
        </button>
        <button id="repeatButton" type="button" class="btn-round btn-outline-primary" style="display:block">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
            </svg>
        </button>
        <button id="noRepeatButton" type="button" class="btn-round btn-primary" style="display:none; background: #0d6efd">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
            </svg>
        </button>
        <button id="trashButton" type="button" class="btn-round btn-outline-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
            </svg>
        </button>
    </div>
</div>`;

function CreateNewTask(IDno, completed, repeats, text)
{
    // Create a task card for each task
    var taskCard = document.createElement("div");
    // console.log("dark mode is currently " + DarkModeStatus());
    

    taskCard.innerHTML = newTaskDiv;
    taskCard.id = `${IDno}`;
    // Add other task card contents (task name, buttons, etc.)

    // assign new id with ID to identify task
    // Attach event listeners to buttons and input fields
    var doneButton = taskCard.querySelector("#doneButton");
    doneButton.id = `doneButton${IDno}`;
    var notDoneButton = taskCard.querySelector("#notDoneButton");
    notDoneButton.id = `notDoneButton${IDno}`;

    var trashButton = taskCard.querySelector("#trashButton");
    trashButton.id = `trashButton${IDno}`;

    var repeatButton = taskCard.querySelector("#repeatButton");
    repeatButton.id = `repeatButton${IDno}`;
    var noRepeatButton = taskCard.querySelector("#noRepeatButton");
    noRepeatButton.id = `noRepeatButton${IDno}`;

    var taskInput = taskCard.querySelector("#taskInput");
    taskInput.id = `taskInput${IDno}`;
    taskInput.value = text;

    SetDarkModeOnElement(taskCard, DarkModeStatus());

    if(doneButton != null)
    doneButton.addEventListener("click", function() {
        // Handle edit button click
        // will also pass ID to server to update task
        c("done button clicked on ID: " + IDno);
        UpdateTaskComplete(IDno, true);
    });
    if(notDoneButton != null)
    notDoneButton.addEventListener("click", function() {
        // Handle edit button click
        // will also pass ID to server to update task
        c("NOT DONE button clicked on ID: " + IDno);
        UpdateTaskComplete(IDno, false);
    });

    if(trashButton != null)
    trashButton.addEventListener("click", function() {
        // Handle delete button click
        c("trash BUTTONNN clicked on ID: " + IDno);
        DeleteTask(IDno);
    });

    if(repeatButton != null)
    repeatButton.addEventListener("click", function() {
        // Handle delete button click
        c("repeat button clicked on ID: " + IDno);
        ToggleRepeat(IDno, true);
    });
    if(noRepeatButton != null)
    noRepeatButton.addEventListener("click", function() {
        // Handle delete button click
        c("no repeat button clicked on ID: " + IDno);
        ToggleRepeat(IDno, false);
    });


    if(taskInput != null)
    taskInput.addEventListener("blur", function() {
        // Handle input field blur event
        c(`input field changed to ${taskInput.value} on ID:`  + IDno);

        if (taskInput.value === "") {
            DeleteTask(IDno);
        }
        else
        {
            UpdateTasks();
        }
        
    });

    if(taskInput != null)
    {
        // Add a focus event listener to the input element
    taskInput.addEventListener("focus", function() {
        // Add a keydown event listener inside the focus event listener
        document.addEventListener("keydown", function(event) {
            // Check if the focused element is the input field
            if (document.activeElement === taskInput) {
                // Handle the key press when the input field is focused
                if (event.key === "Enter") {
                    // Handle the Enter key press
                    console.log("Enter key pressed while input is focused");

                    // Perform your desired action here
                    if (taskInput.value === "") {
                        DeleteTask(IDno);
                    }
                    else
                    {
                        UpdateTasks();
                        //and make a new one
                        NewTaskBox();
                    }
                } else if (event.key === "Escape") {
                    // Handle the Escape key press
                    console.log("Escape key pressed while input is focused");

                    // Perform your desired action here
                    // Perform your desired action here
                    if (taskInput.value === "") {
                        DeleteTask(IDno);
                    }
                    else
                    {
                        UpdateTasks();
                        //and make a new one
                        taskInput.blur();   
                    }
                }
            }
        });
});
    }

    //add new task box to parent's inner html
    var newTaskButtonDiv = document.getElementById("newTaskButtonDiv");
    newTaskButtonDiv.insertAdjacentElement('beforebegin', taskCard);

    //set initial state for repeat button
    SetRepeatInitialState(IDno, repeats);
    //print current button task completion state
    console.log("loadtasks:" + IDno + "completion state is " + completed);
    SetTaskCompletionButton(IDno, completed);
    // Add the task card to the end of the list
    //document.getElementById("sortable").appendChild(taskCard);
    
    taskInput.focus();
}

function ToggleDarkMode(darkModeEnabled)
{
    const buttons = document.querySelectorAll('.btn-round'); // Select all buttons
    console.log("buttons in doc: " + buttons.length);
     // Toggle dark mode for buttons
     buttons.forEach((button) => {
         if (darkModeEnabled) {
             button.classList.add('dark-mode');
             c("toggled dark mode for a button");
         } else {
             button.classList.remove('dark-mode');
         }
     });

     const cards = document.querySelectorAll('.card-round');
     console.log("cards in doc: "+ cards.length);
     cards.forEach((card) => {
        if(darkModeEnabled) {
            card.classList.add('dark-mode');
        } else {
            card.classList.remove('dark-mode');
        }
        });
     
        const inputs = document.querySelectorAll('.form-control');
     console.log("inputs in doc: "+ inputs.length);
     inputs.forEach((input) => {
        if(darkModeEnabled) {
            input.classList.add('text-light');
        } else {
            input.classList.remove('text-light');
        }
        });

     document.body.classList.toggle('dark-mode', darkModeEnabled);
}



function MakeDarkMode()
{
    // Toggle dark mode when the checkbox is clicked
    const darkModeToggle = document.getElementById('darkModeToggle');
    
        darkModeToggle.addEventListener('change', () => {
        const darkModeEnabled = darkModeToggle.checked;
        ToggleDarkMode(darkModeEnabled);
    });
}
let myBarChart;

function UpdateGraph() {
    MonthCompletions().then((result)=> {
        // Assuming 'result' contains the updated data
        if (myBarChart) {
            myBarChart.data.datasets[0].data = set;
            myBarChart.update();
            c("tried to update barchart!!!!!");
        }
        else{
            c("tried to update barchart but DOES NOT EXIST");
        }
    });
}

function MakeGraph() {
    c("GRAPH DATA SET: " + set);
    
    // Get a reference to the canvas element
    const canvas = document.getElementById('myBarChart');
    canvas.style.width = '70%'; // Set the width to 70%
    canvas.style.height = '150px'; // Set the height to 200px

    document.getElementById('chart-title').innerHTML = `${todayformatted}`;

    const ctx = canvas.getContext('2d');

    const labels = [];
    for (let i = 1; i <= 31; i++) {
        labels.push(i.toString());
    }
    
    // Sample data points
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'My Bar Chart',
                data: set,
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd',
                borderWidth: 1,
                
            }
        ]
    };

    // Create the bar chart
    myBarChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 1, // Set the minimum value of the x-axis
                    max: 31, // Set the maximum value of the x-axis
                    stepSize: 1,
                    
                },
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide the legend
                },
                // Set the background color of the entire chart area
            beforeDraw: (chart) => {
                const ctx = chart.canvas.getContext('2d');
                ctx.clearRect(0, 0, chart.width, chart.height);
            }
        }
    }
    
    });
    
}

function MonthCompletions() {
    return new Promise((resolve, reject) =>  {
    // Create an empty array to store completion percentages for each day
    const completionPercentages = [];

    // Make a fetch request to the 'monthlycompletions' view
    fetch('monthlycompletions') // Update the URL to match your Django URL configuration
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Data contains completion percentages for each day
            if (data.completion_percentages) {
                data.completion_percentages.forEach(item => {
                    completionPercentages.push(item.completion_percentage);
                });
            }

            // Now, you can use the completionPercentages array for your chart or other purposes
            console.log("COMPLETION PERCENTAGES: " + completionPercentages);
            set = completionPercentages;
            resolve();
        })
        .catch(error => {
            console.error('Error:', error);
    });
    
});
}


//load tasks function
function LoadTasks() {
    return new Promise((resolve, reject) =>  {
        
   // Get the current date and time (local time zone)
   var today = new Date();
   var year = today.getUTCFullYear();
   var month = today.getUTCMonth() + 1; // Month is 0-indexed, so add 1
   var day = today.getUTCDate();
   var hours = today.getUTCHours();
   var minutes = today.getUTCMinutes();
   var seconds = today.getUTCSeconds();

   var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var monthIndex = today.getUTCMonth(); // Month is 0-indexed
  todayformatted = monthNames[monthIndex] + " " + year;
   
   // Format the date and time as a string
   var formattedDateTime = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
   
   // Print date and time in UTC to the console
   console.log(`Current date and time (UTC): ${formattedDateTime}`);
   


    // Make an AJAX request to loadtasks view
    fetch(`/loadtasks/${year}/${month}/${day}/`)
        .then(response => response.json())
        .then(data => {
            c(data.tasks);
            c(`Number of tasks for ${year}-${month}-${day}: ${data.tasks.length}`);
            if (data.tasks && data.tasks.length > 0) {
                // Iterate through the tasks JSON data
                // print number of tasks for the date to console
                
                data.tasks.forEach(task => {
                    var IDno = task.id; //ID NUMBER FOR THIS TASK
                    var repeats = task.repeats;
                    var completed = task.completed;
                    var text = task.task;

                    if(completed)
                    {
                        tasksDoneToday++;
                    }

                    CreateNewTask(IDno, completed, repeats, text);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
        resolve();
    });
}

function isNotNumerical(id) {
    return /\D/.test(id); // \D matches non-numeric characters
}

// update all tasks
// specify json format
// 
function UpdateTasks()
{
    
    c("updating tasks");
    // get all children of "sortable"
    var parent = document.getElementById("sortable");
    var children = parent.childNodes;
    var numberOfChildren = 0;
    //go through each child
        //get the ID from the top level div
        //use the ID to specify the ID of the text element and get the text from it
        //index is just the order
        //use the ID to specify the ID of the repeat toggle and get the value from it
    let taskUpdates = [];
    for(var i = 0; i < children.length; i++)
    {
        if(children[i].nodeType === 1) // Check if it's an element node (nodeType 1)
        {
            c("child: " + children[i].id)
            if (isNotNumerical(children[i].id)) {
                // The ID contains non-numeric characters
                // You can handle this case here
                console.log("ID is not numerical:", children[i].id);
                continue; // Skip this child
            } 
            
            numberOfChildren++;
            var taskID = children[i].id;
            var taskText = children[i].querySelector(`#taskInput${taskID}`).value;
            var taskIndex = i;            
            //populate json
            const taskUpdate = createTaskUpdateData(taskID, taskText, taskIndex);
            // Add the JSON object to the array
            taskUpdates.push(taskUpdate);
        }
    }
    // Combine all individual task JSON objects into one JSON object
    let combinedJSON = {};
    for (const taskUpdate of taskUpdates) {
        combinedJSON = { ...combinedJSON, ...taskUpdate };
    }
    //send json to server

    // Create a JSON object containing the taskUpdates array
    const data = {
        taskUpdates: taskUpdates
    };

    // c(data);
    
    // Send JSON data to the server using fetch
    fetch('update-all-tasks', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken() // You can use a function to get the CSRF token
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the server response here
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });

}

function createTaskUpdateData(taskID, taskText, index) {
    // Create a JSON object with the task update data
    const taskUpdateData = {
        id: taskID,
        task: taskText,
        index: index
    };

    return taskUpdateData;
}

// Example usage:


// You can now use the `taskUpdate` object to send data to your Django backend for updating a Task.


function getCSRFToken() {
    var csrfTokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (csrfTokenInput) {
        return csrfTokenInput.value;
    } else {
        console.error('CSRF token input field not found.');
        return null; // Handle the case when the token is not found
    }
}

function SetRepeatInitialState(IDNo, active)
{
    //swap buttons
    //the active button will trigger inactive, and vice versa
    var repeatButton = document.getElementById(`repeatButton${IDNo}`);
    var noRepeatButton = document.getElementById(`noRepeatButton${IDNo}`);
    if(active)
    {
        //swap buttons
        
        repeatButton.style.display = "none";
        noRepeatButton.style.display = "block";
    }
    else
    {
        repeatButton.style.display = "block";
        noRepeatButton.style.display = "none";
    }
}

function ToggleRepeat(IDNo, active)
{
    //swap buttons
    //the active button will trigger inactive, and vice versa
    var repeatButton = document.getElementById(`repeatButton${IDNo}`);
    var noRepeatButton = document.getElementById(`noRepeatButton${IDNo}`);
    if(active)
    {
        //swap buttons
        
        repeatButton.style.display = "none";
        noRepeatButton.style.display = "block";
    }
    else
    {
        repeatButton.style.display = "block";
        noRepeatButton.style.display = "none";
    }

    //set repeat to active
    //send to server
    var requestData = {
        task_id: IDNo,
        task_repeats: active
    };
    
    // Make a POST request to the Django view
    fetch('update-repeat', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken() // Use a function to get the CSRF token
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the server response here
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//function to add empty task box to end of the list to type in new task
//if user clicks off the input and text is in the field, then save it
function NewTaskBox()
{
    //add new task box to end of list
    var parent = document.getElementById("sortable");
    var children = parent.childNodes;
    var numberOfChildren = 0;

    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType === 1) { // Check if it's an element node (nodeType 1)
            numberOfChildren++;
        }
    }
    //number of cards

    console.log("Number of task cards: " + numberOfChildren);

    //get ID from server and make a new task model
    // Define the data you want to send in the request body
    const requestData = {
        task: "none",  // Replace with the actual task text
        currentIndex: numberOfChildren  // Replace with the actual currentIndex value
    };
    var newTaskID = 0;

    fetch('add', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()  // You may need to define a function to get the CSRF token
        },
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
        // Handle the response from the server
        if (data.response_message) {
            // The server successfully processed the data
            newTaskID = data.new_task_id;  // Assuming the view sends the new task's ID in the response
            console.log(`New Task ID: ${newTaskID}`);
            var IDno = newTaskID; //ID NUMBER FOR THIS TASK
            
            CreateNewTask(newTaskID, false, false, "");
        } else {
            console.error('Error:', data.error);
        }
        })
        .catch(error => {
        console.error('Error:', error);
        });
  
}

//add new task to the end of the list
function SaveNewTask(tempID)
{
    //get the last task
    //get its index
    //create new task with index + 1
    //send to database
    //add to server and get back new task ID

    // Get the task text from your page (e.g., from an input field)
    const taskText = getTaskText(); // Replace this with your logic to get task text

    // Get the currentIndex value from your page
    const currentIndex = getCurrentIndex(); // Replace this with your logic to get currentIndex

    // Create an object with the data to send
    const postData = {
        task: taskText,
        currentIndex: currentIndex
    };
}



function UpdateTaskComplete(IDNo, active)
{
    //set repeat to active
    //send to server
    var requestData = {
        task_id: IDNo,
        task_complete: active
    };

    console.log("saving task competion" + IDNo + " " + active);

    SetTaskCompletionButton(IDNo, active);

    //add or subtract to completed things
    if(active)
    {
        tasksDoneToday++;
        c("tasks done today now: " + tasksDoneToday);
    }
    else{
        tasksDoneToday--;
        c("tasks done today now: " + tasksDoneToday);
    }
        
    
    
    // Make a POST request to the Django view
    fetch('complete', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken() // Use a function to get the CSRF token
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the server response here
        console.log(data);

        UpdateGraph();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function SetTaskCompletionButton(IDNo, active)
{
    //swap buttons
    console.log("setting completion button for ID " + IDNo + " to " + active);
    //the active button will trigger inactive, and vice versa
    var doneButton = document.getElementById(`doneButton${IDNo}`);
    var notDoneButton = document.getElementById(`notDoneButton${IDNo}`);
    if(active)
    {
        //swap buttons
        
        doneButton.style.display = "none";
        notDoneButton.style.display = "block";
    }
    else
    {
        doneButton.style.display = "block";
        notDoneButton.style.display = "none";
    }
}

function DeleteTask(taskID) {
    c("deleting task: " + taskID);
    // Make a POST request to the Django view to delete the task
    fetch(`/delete/${taskID}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken() // Use a function to get the CSRF token
        }
    })
    .then(response => response.json())
    .then(data => {
        // Handle the server response here
        if (data.success) {
            // Task was successfully deleted
            console.log('Task deleted successfully');
            //remove from page
            var taskCard = document.getElementById(taskID);
            taskCard.remove();
        } else {
            // Task deletion was not successful, handle the error
            console.error('Error:', data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
