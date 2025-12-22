const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const displayWeekDay = document.getElementById("day");
const displayDayNb = document.getElementById("number");
const displayMonth = document.getElementById("month");
const speechBtn = document.getElementById("speech-btn");
const micIcon = speechBtn.querySelector('i');

const day = new Date();
let todayName = day.getDay();
let todayNumber = day.getDate();
let todayMonth = day.getMonth();
let speechActive = false;

displayWeekDay.innerHTML = weekday[todayName];
displayDayNb.innerHTML = todayNumber;
displayMonth.innerHTML = month[todayMonth];

const addTaskBtn = document.getElementById("add-btn");
const inputTask = document.getElementById("write-task");
let taskList = [];
const taskSpans = [];

const progressBarValue = document.getElementById("progress-bar");
let totalTasks = 0;

const finishBtn = document.getElementById("finish-btn");
finishBtn.addEventListener("click", () => {
  console.log("Saving progress:", progressBarValue.value); // Debugging
  localStorage.setItem("finalProgress", progressBarValue.value);
  window.electronAPI.loadPage("finishDay.html");
});

for (let i = 1; i <= 7; i++) {
  let taskSpan = document.getElementById("text-task-" + i);

  if (taskSpan) {
    taskSpans.push(taskSpan);

    taskSpan.addEventListener("click", (event) => {
      event.target.classList.toggle("done");
      event.target.classList.toggle("checked");
      updateProgressBar();
    });
  }
}

addTaskBtn.addEventListener("click", () => {
  if (inputTask.value.trim() === "") {
    console.warn("Please enter a task before adding to the list.");
  } else if (taskList.length >= 7) {
    console.warn("Task list is full. You can only add up to 7 tasks.");
  } else {
    taskList.push(inputTask.value);
    updateTaskDisplay(); //Update spans with new task list
    inputTask.value = ""; //Clear input field
    totalTasks++;
    updateProgressBar();
  }
});

function updateTaskDisplay() {
  for (let i = 0; i < taskSpans.length; i++) {
    if (taskList[i]) {
      taskSpans[i].textContent = taskList[i];
    } else {
      taskSpans[i].textContent = "";
    }
  }
}

function updateProgressBar() {
  const checkedElements = document.querySelectorAll(".checked");
  const checkedCount = checkedElements.length;
  const totalTasks = taskList.length;
  const progress = checkedCount / totalTasks;

  progressBarValue.value = progress * 100;
}

speechBtn.addEventListener("click", () => {
  console.log("speech toggle is called");
  if (!speechActive) {
    console.log("Starting speech service");

    try {
      window.electronAPI.startSpeechService();
      speechActive = true;
      window.electronAPI.onSpeechFinal((text) => {
        console.log("FINAL TEXT RECEIVED:", text);
        
      });

      window.electronAPI.onSpeechPartial((partial) => {
        console.log("PARTIAL TEXT RECEIVED:", partial);
      });
    } catch (e) {
      console.log("Error starting speech service: ", e);
      speechActive = false;
    }

    // Update UI
    micIcon.classList.remove("bx-microphone-off");
    micIcon.classList.add("bx-microphone");

  } else {
    console.log("Stopping speech service...");
    try {
      window.electronAPI.stopSpeechService();
      window.electronAPI.removeAllSpeechListeners();
      speechActive = false;
      console.log("Speech service stopped");

      // Update UI
      micIcon.classList.remove("bx-microphone");
      micIcon.classList.add("bx-microphone-off");
      console.log("UI updated to stopped state");
    } catch (error) {
      console.error("Error stopping speech service:", error);
    }
  }
  console.log ("speech toggle finished");
});
