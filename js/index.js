//global variables
let displayedDateInfo = getdisplayedDateInfo();
let forecast = getForecast();
let weatherData;
let displayedDates = [];

// helper functions 
let viewingDate = new Date();
//console.log(viewingDate);

function getdisplayedDateInfo(date = new Date()) {

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayOfMonth = date.getDate();
  const dayOfWeek = days[date.getDay()];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return {
    dayOfMonth,
    dayOfWeek,
    month,
    year
  };
}

//Api Calls
//Weather
async function getWeatherIcons() {
  const weatherData = await getForecast();
  const weatherIcons = {};

  // Get the date today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < displayedDates.length; i++) {
    // Get the date for the ith day from today

    const date = displayedDates[i];
    date.setDate(today.getDate() + i);
    date.setHours(12, 0, 0, 0);

    // Find the forecast for that date
    const forecast = weatherData.list.find(item => {
      const forecastDate = new Date(item.dt * 1000);

      return forecastDate.getTime() === date.getTime();
    });

    // If there is a forecast for that date, get its icon
    if (forecast) {
      const iconUrl = "http://openweathermap.org/img/w/" + forecast.weather[0].icon + ".png";
      weatherIcons[date.toISOString().split('T')[0]] = iconUrl;
      // let date = new Date();
      let monthNumber = date.getMonth(); // this will return a number between 0 and 11

      let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      let monthName = months[monthNumber]; // this will get the month's name


      // Get the day of the month for the current date
      let dayCount = date.getDate().toString();

      // Log each icon individually
      //console.log("Icon for " + date.toISOString().split('T')[0] + ": " + iconUrl);

      const cell = document.querySelector(`td[data-date='${date.toISOString().split('T')[0]}']`)
      if (cell) {
        let iconTest = document.createElement('img')
        iconTest.setAttribute("src", iconUrl);
        cell.prepend(iconTest);
      }

    }

  }

  return weatherIcons;
}

function isDaytimeForecast(forecastDate, targetDate, sunriseTime, sunsetTime) {
  const forecastDateTime = forecastDate.getTime();
  const targetDateTime = targetDate.getTime();
  const sunriseDateTime = new Date(sunriseTime * 1000).getTime();
  const sunsetDateTime = new Date(sunsetTime * 1000).getTime();

  return forecastDateTime >= sunriseDateTime && forecastDateTime <= sunsetDateTime && targetDateTime === forecastDateTime;
}


function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

async function getForecast() {
  const key = "0c75247c1fe39a650980504aabac81fb";
  const position = await getCurrentPosition();
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=imperial`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  } else {
    const weatherData = await response.json();
    //console.log(weatherData);
    return weatherData
  }
}

//Recipes
// async function getRecipes() {
//   const key = "d48a8c04336a4d839e67423eeff508c3"; //move to .env
//   const response = await fetch(`https://api.spoonacular.com/recipes/random?number=30&tags=dinner&apiKey=${key}`)
//   if(!response.ok) {
//     throw new Error(`HTTP error! status:  ${response.status}` )
//   } else {
//     const recipeData = await response.json();
//     return recipeData;
//   }

// }

//Event handlers 
async function nextMonth() {
  if (viewingDate.getMonth() == 11) {
    viewingDate = new Date(viewingDate.getFullYear() + 1, 0, 1);
  } else {
    viewingDate = new Date(viewingDate.getFullYear(), viewingDate.getMonth() + 1, 1)
  }
  clearCalendar();
  forecast = await getForecast();
  displayedDateInfo = getdisplayedDateInfo(viewingDate);
  await buildCalendar(forecast);
  await openDayView(weatherData);
 
}

async function previousMonth() {
  if (viewingDate.getMonth() == 0) {
    viewingDate = new Date(viewingDate.getFullYear() - 1, 11, 1);
  } else {
    viewingDate = new Date(viewingDate.getFullYear(), viewingDate.getMonth() - 1, 1)
  }
  clearCalendar();
  forecast = await getForecast();
  displayedDateInfo = getdisplayedDateInfo(viewingDate);
  await buildCalendar(forecast);
  await openDayView(weatherData);
  
}
//Build the Calendar
async function buildCalendar(forecast) {

  let calendar = document.createElement("table")
  calendar.setAttribute("id", "calendar");
  calendarContainer = document.getElementById("calendarContainer");
  calendarContainer.appendChild(calendar);
  displayedDateInfo = getdisplayedDateInfo(viewingDate);
  await buildCalendarHeader(displayedDateInfo, forecast);
  await buildCalendarDays(displayedDateInfo, forecast);
  await getWeatherIcons();
  displayEvents();
  //identifyToday(displayedDateInfo);

  return calendar;

}
//calendarHeader
function buildCalendarHeader(displayedDateInfo, forecast) {
  let currentDate = new Date();
 //console.log(currentDate);
  let header = document.createElement("thead");
  let daysRow = document.createElement("tr");
  daysRow.setAttribute("scope", "col");
  daysRow.classList.add("daysRow");

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 0; i < daysOfWeek.length; i++) {
    let th = document.createElement("th");
    th.setAttribute("scope", "col");
    th.textContent = daysOfWeek[i];
    daysRow.appendChild(th);
  }




  let calendarContainer = document.getElementById("calendarContainer");
  let headerContainer = document.createElement("div");
  headerContainer.setAttribute("id", "headerContainer");
  header.setAttribute("id", "calendarHeader");
  header.classList.add("monthTitle");
  
  let calendar = document.getElementById("calendar");
  let displayedDate = document.createElement("h2");
  displayedDate.setAttribute("id", "dateDisplay");
  displayedDate.textContent = `${displayedDateInfo.month} ${displayedDateInfo.year}`;


  calendar.appendChild(header);
  header.appendChild(daysRow);
  calendarContainer.prepend(headerContainer);
  headerContainer.appendChild(displayedDate);


  //place currentWeather
  weatherData = forecast;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  today = new Date();
  if (displayedDateInfo.month == months[today.getMonth()] && displayedDateInfo.year == today.getFullYear()) {
   // console.log(weatherData);
    //console.log(weatherData.list[0].main.temp);
    //console.log(weatherData.list[0].weather[0].icon);
    let currentIcon = weatherData.list[0].weather[0].icon;
    let currentIconUrl = `http://openweathermap.org/img/wn/${currentIcon}@2x.png`;

    let weatherContent = document.createElement("div");
    weatherContent.textContent = `${weatherData.list[0].main.temp} °F`;
    headerContainer.appendChild(weatherContent)


    // console.log(weatherToday);
  }

  //console.log(displayedDate)
  initializeCalendarControls();

  return header;
}
function addEvent(e) {
  // Create modal elements
  e.preventDefault();
  const modalContainer = document.createElement('div');
  modalContainer.setAttribute('id', 'modalContainer');
  const form = document.createElement('form');
  const formTitle = document.createElement("h2");
  formTitle.textContent = "Plan your Day!";

  formTitle.classList.add("event-form-title");
  form.classList.add("event-form");

  form.appendChild(formTitle);

  const dateInput = document.createElement('input');
  dateInput.setAttribute('type', 'date');
  dateInput.setAttribute('id', 'dateInput');
  dateInput.setAttribute('name', 'dateInput');
  dateInput.setAttribute('pattern', '\\d{2}/\\d{2}/\\d{4}');
  dateInput.setAttribute('required', '');


  const clickedDate = e.target.dataset.date;
  if (clickedDate) {
    dateInput.setAttribute("value", clickedDate);
  }


  const eventTitle = document.createElement('input');
  eventTitle.setAttribute("type", "text");
  eventTitle.setAttribute("placeholder", "Event");

  const descInput = document.createElement('input');
  descInput.setAttribute('id', 'desc');
  descInput.setAttribute("type", "text");
  descInput.setAttribute("placeholder", "Description");

  const locInput = document.createElement('input');
  locInput.setAttribute("id", "location");
  locInput.setAttribute("type", "text");
  locInput.setAttribute("placeholder", "Address, City, State Zipcode");


  const timeInput = document.createElement("input");
  timeInput.setAttribute("type", "time");
  timeInput.setAttribute("value", "12:00");



  const submitBtn = document.createElement('input');
  submitBtn.setAttribute('type', 'submit');
  submitBtn.setAttribute("id", "submitBtn");
  const closeModalBtn = document.createElement('button');
  closeModalBtn.setAttribute("id", "closeEventBtn");
  closeModalBtn.textContent = '\u2716';

  // Append elements to the form
  form.appendChild(eventTitle);
  form.appendChild(descInput);
  form.appendChild(locInput);
  form.appendChild(dateInput);
  form.appendChild(timeInput);
  form.appendChild(submitBtn);

  // Append form and close button to the modal
  modalContainer.appendChild(form);
  modalContainer.appendChild(closeModalBtn);

  // Append modal to the body (or wherever you want it to appear)
  document.body.appendChild(modalContainer);

  // Add event listener to close button
  closeModalBtn.addEventListener('click', function () {
    modalContainer.remove();
  });

  // Add event listener to form
  form.addEventListener('submit', storeEvents);

  async function storeEvents(event) {
    event.preventDefault(); // Prevent form from being submitted
  
    // Get form values
    const myEvent = eventTitle.value;
    const description = descInput.value;
    const date = dateInput.value;
    const location = locInput.value;
    const time = timeInput.value;
    const convertedTime = convertTo12HourFormat(time);
    
    function convertTo12HourFormat(time) {
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      const period = hours >= 12 ? 'PM' : 'AM';
  
      if(hours > 12){
        hours -= 12;
      }
      else if(hours === 0){
        hours = 12;
      }
  
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
  
    const eventKey = `event_${Date.now()}`;
  
    const eventObject = {
      name: myEvent,
      description: description,
      date: date,
      location: location,
      time: convertedTime
    };
  
    const eventJSON = JSON.stringify(eventObject);
  
    localStorage.setItem(eventKey, eventJSON);
  
    // Optionally, clear the form
    form.reset();
  
    // Close the modal
    modalContainer.remove();
  };
  
}




//Calendar Body call calendar parts in buildCalendar and pass appropriate helper functions
async function buildCalendarDays(displayedDateInfo) {
  const calendarBody = document.createElement("tbody");

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const monthNumber = monthNames.indexOf(displayedDateInfo.month);

  // Months are 0-indexed in JavaScript
  const firstDay = new Date(displayedDateInfo.year, monthNumber, 1).getDay();
  // console.log(firstDay);
  const lastDay = new Date(displayedDateInfo.year, monthNumber + 1, 0).getDate();
  // console.log(lastDay);

  let dayCount = 1;

  displayedDates = [];

  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");

      if ((i === 0 && j < firstDay) || dayCount > lastDay) {
        cell.textContent = "";
        cell.className = "empty";


      } else {
        const date = new Date(displayedDateInfo.year, monthNumber, dayCount);
        const isoDate = date.toISOString().split('T')[0];
        displayedDates.push(date);
        cell.dataset.date = isoDate;
        cell.id = isoDate;
        //console.log(displayedDates);
        cell.addEventListener('click', addEvent);

        cell.textContent = dayCount;
        dayCount++;
      }



      row.appendChild(cell);
    }

    calendarBody.appendChild(row);
  }



  const calendar = document.getElementById("calendar");
  calendar.appendChild(calendarBody);

  identifyToday(displayedDateInfo);

  return calendarBody;
}


function identifyToday(displayedDateInfo) {
  const dayCells = document.getElementsByTagName("td");
  let date = new Date();
  let monthNumber = date.getMonth(); // this will return a number between 0 and 11

  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  let monthName = months[monthNumber]; // this will get the month's name

  // Get the day of the month for the current date
  let dayCount = date.getDate().toString();

  for (let i = 0; i < dayCells.length; i++) {
    const dayCell = dayCells[i];
    if (dayCell.textContent === dayCount && displayedDateInfo.month == monthName) { //check for year 
      dayCell.classList.add("currentDate");
    }
  }
}


async function initializeCalendarControls() {

  let calendarHeader = document.getElementById("headerContainer");


  let nextButton = document.createElement("button");
  nextButton.classList.add("controls")
  nextButton.setAttribute("id", "nextButton");
  nextButton.innerHTML = "Next Month";
  nextButton.addEventListener("click", nextMonth);
  calendarHeader.prepend(nextButton);

  let prevButton = document.createElement("button");
  prevButton.setAttribute("id", "prevButton");
  prevButton.classList.add("controls")
  prevButton.innerHTML = "Previous Month";
  prevButton.addEventListener("click", previousMonth);
  calendarHeader.prepend(prevButton);

  let dayView = document.createElement("button");
  dayView.classList.add("controls");
  dayView.setAttribute("id", "dayViewBtn");
  dayView.innerHTML = "Day View";
  dayView.addEventListener("click", openDayView);
  calendarHeader.prepend(dayView);


}

function clearCalendar() {
  let calendar = document.getElementById('calendarContainer')

  while (calendar.firstChild) {
    calendar.removeChild(calendar.firstChild);
  };
}

async function openDayView() {
  const weatherData =  await getForecast();
  console.log("openDayView Started");
  console.log("WeatherData: ", weatherData);
  //currentDate not modified
  function getCurrentDate() {
    return new Date();
  }
  
  function formatDateForDisplay(date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  }
  function formatDateForId(date) {
    let dateForId = new Date();
    let yearForId = date.getFullYear();
    let monthForId = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    let dayForId = String(date.getDate()).padStart(2, '0');
    console.log(`${yearForId}-${monthForId}-${dayForId}`);
    return `${yearForId}-${monthForId}-${dayForId}`;
  }
  
  
  let currentDate = getCurrentDate();
  let formattedDate = formatDateForDisplay(currentDate);
  //console.log(formattedDate);
  let dateForId = formatDateForId(currentDate);
  //console.log(dateForId);
  
  
  
  const dayViewTitle = document.createElement("h2");
  dayViewTitle.setAttribute("id", "dayViewTitle");
  dayViewTitle.textContent = `${formattedDate}`
  const dayViewBtn = document.getElementById("dayViewBtn");
  dayViewBtn.disabled = true;
  const modalContainer = document.createElement("div");
  const closeModalBtn = document.createElement("button");
  
  const nextDayBtn = document.createElement("button");
  nextDayBtn.setAttribute("id", "nextDayBtn");
  nextDayBtn.textContent = "Next Day";
  
  const prevDayBtn = document.createElement("button");
  prevDayBtn.setAttribute("id", "prevDayBtn");
  prevDayBtn.textContent = "Previous Day";
  
  closeModalBtn.setAttribute("id", "closeModalBtn");
  modalContainer.setAttribute("id", "modalContainer");
  closeModalBtn.textContent = '\u2716';
  
  calendarContainer.prepend(modalContainer);
  
  modalContainer.appendChild(closeModalBtn);
  modalContainer.appendChild(dayViewTitle);
  modalContainer.appendChild(prevDayBtn);
  modalContainer.appendChild(nextDayBtn);
  closeModalBtn.addEventListener("click", function () {
    modalContainer.remove(); // Remove the modal from the DOM
    dayViewBtn.disabled = false; // Enable the dayViewBtn button again
  });
  nextDayBtn.addEventListener("click", function () {
    // clearTable(eventTable);
    currentDate.setDate(currentDate.getDate() + 1);
    dayViewTitle.textContent = formatDateForDisplay(currentDate);
    dateForId = formatDateForId(currentDate);
    // clearTable();
    placeDayEventDetails(dateForId, weatherData);
  });
  
  prevDayBtn.addEventListener("click", function () {
    // clearTable(eventTable);
    currentDate.setDate(currentDate.getDate() - 1);
    dayViewTitle.textContent = formatDateForDisplay(currentDate);
    dateForId = formatDateForId(currentDate);
    // clearTable();
    placeDayEventDetails(dateForId);
  });
  
  placeDayEventDetails(dateForId);
}


async function placeDayEventDetails(dateForId) {
  console.log("date to compare: " ,dateForId);
  const weatherData =  await getForecast();
  const eventKeys = Object.keys(localStorage).filter(key => key.startsWith('event_'));
  const dayViewElement = document.getElementById("modalContainer");
  const eventTable = document.getElementById("eventTable");
  const eventsForDate = [];
  const filteredWeatherData = [];

  if (!eventTable) {
    // Create the table only if it doesn't exist
    const eventTable = document.createElement('table');
    eventTable.setAttribute("id", "eventTable");
    dayViewElement.appendChild(eventTable);
  } else {
    // Clear existing rows if the table already exists
    while (eventTable.firstChild) {
      eventTable.removeChild(eventTable.firstChild);
    }
  }


  for (let i = 0; i < eventKeys.length; i++){
    const key = eventKeys[i];
    const eventJSON = localStorage.getItem(key);
    const event = JSON.parse(eventJSON);
    //console.log(event);
    
    const eventDate = new Date(event.date).toISOString().split('T')[0];
    console.log(eventDate);

    if(eventDate == dateForId){
      eventsForDate.push(event);
      console.log("We have arrived");
      console.log(weatherData);
    }
  }

  eventsForDate.sort((a, b) => {
    const timeA = a.time;
    const timeB = b.time;
    const dateA = new Date(`1970-01-01 ${timeA}`);
    const dateB = new Date(`1970-01-01 ${timeB}`);
    
    return dateA - dateB;
  });
  for (const event of eventsForDate) {
    const table = document.getElementById("eventTable");
    const row = table.insertRow();
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    const cell3 = row.insertCell();

    cell1.textContent = event.name;
    cell2.textContent = event.location;
    cell3.textContent = event.time;
  }

console.log("Starting loop to filter weather data");
console.log("Weather Data length: ", weatherData.list.length);
for(const weatherItem of weatherData.list){
  const dateTime = weatherItem.dt_txt.split(' ');
  console.log("dateTime variable: " , dateTime);
  const date = dateTime[0];
  const time = dateTime[1];
  console.log("looped Dates: ", date);
  console.log("looped times: ", time);

  if (date == dateForId && time == "00:00:00") {
    filteredWeatherData.push(weatherItem);
    console.log("Filtered Weather Item: ", weatherItem);
  }

}
console.log("Finished loop to filter weather data")

}


function displayEvents() {
  const eventKeys = Object.keys(localStorage).filter(key => key.startsWith('event_'));

  for (let i = 0; i < eventKeys.length; i++) {
    const key = eventKeys[i];
    const eventJSON = localStorage.getItem(key);
    const event = JSON.parse(eventJSON);


    const eventDate = new Date(event.date);

    const isoEventDate = eventDate.toISOString().split('T')[0];
    //console.log(isoEventDate);

    const calendarCell = document.getElementById(isoEventDate);

    if (calendarCell) {
      const eventElement = document.createElement('div');
      eventElement.classList.add('event');
      eventElement.innerHTML = `
        <div class="event-title" id = "${event.name} ${event.date}" >${event.name}</div>
      `;
      calendarCell.appendChild(eventElement);
    }
  }
}


document.addEventListener("DOMContentLoaded", async function () {
  displayedDateInfo = await getdisplayedDateInfo();
  forecast = await getForecast();
  //recipes = await getRecipes();
  await buildCalendar(forecast);
  //getWeatherIcons();
  //fillCalendar();




  //console.log(displayedDateInfo);
  //console.log(forecast.list[0]);
  //console.log(recipes.recipes[0]); 

  //const calendarContainer = document.getElementById('calendarContainer');
  //calendarContainer.appendChild(calendar);


})
