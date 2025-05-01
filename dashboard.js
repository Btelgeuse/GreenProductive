const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const displayWeekDay = document.getElementById("day");
const displayDayNb = document.getElementById("number");
const displayMonth = document.getElementById("month");

const day = new Date();
let todayName = day.getDay();
let todayNumber = day.getDate();
let todayMonth = day.getMonth();

displayWeekDay.innerHTML = weekday[todayName];
displayDayNb.innerHTML = todayNumber;
displayMonth.innerHTML = month[todayMonth];

const addTaskBtn = document.getElementById("add-btn");
const inputTask = document.getElementById("write-task");
const exportBtn = document.getElementById("export-btn");
const exportDateInput = document.getElementById("export-date");
let taskList = [];
const taskSpans = [];

const progressBarValue = document.getElementById("progress-bar");

const finishBtn = document.getElementById("finish-btn");
function clearTaskDisplay() {
    // Clear task texts and checked state
    taskSpans.forEach((span, i) => {
      span.textContent = "";
      span.classList.remove("done", "checked");
      // Hide corresponding delete button
      const delBtn = document.getElementById(`delete-${i + 1}`);
      if (delBtn) delBtn.style.display = "none";
    });
  }

finishBtn.addEventListener("click", () => {
    console.log("Saving progress:", progressBarValue.value);
    localStorage.setItem("finalProgress", progressBarValue.value);
    saveTasksToStorage(); // Save on finish too
    window.electronAPI.loadPage("finishDay.html");
    clearTaskDisplay();
    progressBarValue.value = 0; // Reset progress bar
    taskList = []; // Clear task list
});

// Load saved input if available
const savedInput = localStorage.getItem("currentInput");
if (savedInput) {
    inputTask.value = savedInput;
}

inputTask.addEventListener("input", () => {
    localStorage.setItem("currentInput", inputTask.value);
});

inputTask.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {    
        event.preventDefault();
        addTaskBtn.click();
    }
});

for (let i = 1; i <= 7; i++) {
    let taskSpan = document.getElementById("text-task-" + i);

    if (taskSpan) {
        taskSpans.push(taskSpan);

        taskSpan.addEventListener("click", (event) => {
            event.target.classList.toggle("done");
            event.target.classList.toggle("checked");
            updateProgressBar();
            saveTasksToStorage(); //This to Save immediately
        });
    }
}

addTaskBtn.addEventListener("click", () => {
    if (inputTask.value.trim() === "") {
        console.warn("Please enter a task before adding to the list.");
    } else if (taskList.length >= 7) {
        console.warn("Task list is full. You can only add up to 10 tasks.");
    } else {
        taskList.push(inputTask.value);
        updateTaskDisplay();
        inputTask.value = "";
        localStorage.removeItem("currentInput");
        updateProgressBar();
        saveTasksToStorage(); // This to save immediately
    }
});
function getLocalDateKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()     ).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  

function updateTaskDisplay() {
    for (let i = 0; i < taskSpans.length; i++) {
      const span  = taskSpans[i];
      const delBtn = document.getElementById(`delete-${i + 1}`);
  
      if (taskList[i]) {
        span.textContent = taskList[i];
        delBtn.style.display = "inline-block";
  
        delBtn.onclick = () => {
          //capture old checked indices
          const oldChecked = taskSpans
            .map((s, idx) => s.classList.contains("checked") ? idx : null)
            .filter(idx => idx !== null);
  
          //compute new checked indices
          const newChecked = oldChecked
            .filter(idx => idx !== i)             // drop the deleted one
            .map(idx => idx > i ? idx - 1 : idx); // shift down any beyond i
  
          //clear ALL checked/done classes
          taskSpans.forEach(s => s.classList.remove("checked", "done"));
  
          //actually remove the task
          taskList.splice(i, 1);
  
          //re-apply the surviving checks
          newChecked.forEach(idx => {
            taskSpans[idx].classList.add("checked", "done");
          });
  
          //re-render, recalculate, and save
          updateTaskDisplay();
          updateProgressBar();
          saveTasksToStorage();
        };
  
      } else {
        span.textContent = "";
        delBtn.style.display = "none";
        delBtn.onclick = null;
      }
    }
  }
  
  
function updateProgressBar() {
    const checkedElements = document.querySelectorAll(".checked");
    const checkedCount = checkedElements.length;
    const total = taskList.length;
    const progress = total > 0 ? (checkedCount / total) : 0;
    progressBarValue.value = progress * 100;
}

// Save tasks and checked state in localStorage per day
function saveTasksToStorage() {
    const today = getLocalDateKey();
    localStorage.setItem(`tasks-${todayKey}`, JSON.stringify(taskData));

    const taskData = {
        tasks: taskList,
        checked: taskSpans.map((span, i) =>
            span.classList.contains("checked") ? i : null
        ).filter(i => i !== null)
    };

    localStorage.setItem(`tasks-${today}`, JSON.stringify(taskData));
}

//Load today's tasks from storage on startup
function loadTodayTasks() {
    const todayKey = getLocalDateKey();
    const saved = localStorage.getItem(`tasks-${todayKey}`);
    if (!saved) return;

    const data = JSON.parse(saved);
    taskList = data.tasks || [];
    updateTaskDisplay();

    setTimeout(() => {
        if (data.checked) {
            data.checked.forEach(index => {
                const el = taskSpans[index];
                if (el) {
                    el.classList.add("done", "checked");
                }
            });
        }
        updateProgressBar();
    }, 100);
}


exportBtn.addEventListener("click", () => {
    const selectedDate = exportDateInput.value;
    if (!selectedDate) {
        alert("Please select a date.");
        return;
    }

    const saved = localStorage.getItem(`tasks-${selectedDate}`);
    if (!saved) {
        alert(`No tasks found for ${selectedDate}`);
        return;
    }

    const data = JSON.parse(saved);
    let message = `Tasks for ${selectedDate}:\n\n`;

    data.tasks.forEach((task, index) => {
        const isChecked = data.checked && data.checked.includes(index);
        message += `${isChecked ? "✔" : " "} ${task}\n`;
    });
    
    alert(message);
});
// Call it on page load
loadTodayTasks();