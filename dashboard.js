const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const displayWeekDay = document.getElementById("day")
const displayDayNb = document.getElementById("number")
const displayMonth = document.getElementById("month")

const day = new Date()
let todayName = day.getDay()
let todayNumber = day.getDate()
let todayMonth = day.getMonth()

displayWeekDay.innerHTML = weekday[todayName]
displayDayNb.innerHTML = todayNumber
displayMonth.innerHTML = month[todayMonth]

//-------------------------------------------------------------------------

const addTaskBtn = document.getElementById("add-btn")
const inputTask = document.getElementById("write-task")
const list = document.getElementById("task-list");
let taskCount = 0;
let taskList = [];
const taskSpans = [];

const progressBarValue = document.getElementById("progress-bar")
let totalTasks = 0;

const finishBtn = document.getElementById("finish-btn");
finishBtn.addEventListener("click", () => {
    console.log("Saving progress:", progressBarValue.value); // Debugging
    localStorage.setItem("finalProgress", progressBarValue.value);
    window.electronAPI.loadPage("finishDay.html");
})

for (let i = 1; i <= 6; i++) {
    const p = document.createElement("p");
    p.id = `task${i}`;

    const icon = document.createElement("i");
    icon.className = "bx bxs-leaf";

     const span = document.createElement("span");
    span.id = `text-task-${i}`;
    span.textContent = taskList[i - 1];

    span.addEventListener("click", (event) => {
    event.target.classList.toggle("done")
    event.target.classList.toggle("checked")
    updateProgressBar()
})

  p.appendChild(icon);
  p.appendChild(span);
  list.appendChild(p);
}

addTaskBtn.addEventListener("click", () => {
    if (inputTask.value.trim() === "") {
        console.warn("Please enter a task before adding to the list.");
    }else if(taskCount < 6){
        taskCount++;
        taskList.push(inputTask.value);
        const rellenar = document.getElementById(`text-task-${taskCount}`);
        rellenar.textContent = taskList[taskCount - 1];
        inputTask.value = ""; //Clear input field
        updateProgressBar()
    } 
    else {
        taskList.push(inputTask.value);
        addTask();
        inputTask.value = ""; //Clear input field
        updateProgressBar()
    }
});

function addTask(){
    taskCount++;

    const p = document.createElement("p");
    p.id = `task${taskCount}`;

  const icon = document.createElement("i");
  icon.className = "bx bxs-leaf";

  const span = document.createElement("span");
  span.id = `text-task-${taskCount}`;
  span.textContent = taskList[taskCount - 1];

  span.addEventListener("click", (event) => {
    event.target.classList.toggle("done")
    event.target.classList.toggle("checked")
    updateProgressBar()
    })

  p.appendChild(icon);
  p.appendChild(span);
  list.appendChild(p);

}
function updateProgressBar() {
    const checkedElements = document.querySelectorAll(".checked");
    const checkedCount = checkedElements.length;
    const totalTasks = taskList.length;
    const progress = checkedCount / totalTasks;

    progressBarValue.value = progress * 100;
}