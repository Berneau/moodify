$(document).ready(function() {
  $('.modal').modal();
  getLocation();
});

let weatherObj;
let currentActivity = 0;

// temperature: freezing, cold, warm, hot
// weather: rain, snow, extreme, misty, clear
let activities = [
  { highlight: 'watch a movie in the cinema.', text: 'go gather a bunch of friends and drive to your local cinema.', icon: 'movie', tags: { } },
  { highlight: 'build a snowman.', text: 'put on your snowsuit and best gloves. time to show some fine craftsmanship.', icon: 'snowman', tags: { temperature: ['freezing'], weather: ['snow', 'misty'] } },
  { highlight: 'watch a movie at home.', text: 'get your dearest one, put some tea on the stove and do some netflix and chill.', icon: 'movie', tags: { temperature: ['freezing', 'cold'], weather: ['extreme', 'rain', 'snow'] } },
  { highlight: 'play some volleyball.', text: 'go gather a bunch of motivated friends and head down to the local volleyball court.', icon: null, tags: { temperature: ['warm', 'hot'], weather: ['clear']} },
  { highlight: 'go ice skating.', text: 'recommendation: burgers afterwards.', icon: null, tags: { temperature: ['freezing', 'cold'] } },
  { highlight: 'bake a cake.', text: 'if not for you, there is always somebody who has their birthday today.', icon: 'cake', tags: { } },
  { highlight: 'go snowboarding.', text: '', icon: null, tags: { temperature: ['freezing', 'cold'], weather: ['snow', 'clear', 'misty'] } },
  { highlight: 'go for a walk.', text: '', icon: 'walk', tags: { temperature: ['cold', 'warm'], weather: ['misty', 'clear'] } },
  { highlight: 'binge watch a series.', text: 'there is nothing to achieve outside today. better stay warm and cosy inside.', icon: 'filmstrip', tags: { temperature: ['freezing', 'cold'], weather: ['rain', 'extreme'] } },
  { highlight: 'puzzle? puzzle.', text: 'work on your relationship with your dearest one by progressing further on a jigsaw puzzle.', icon: 'puzzle', tags: { temperature: ['freezing', 'cold'], weather: ['snow', 'rain', 'extreme', 'misty'] } },
  { highlight: 'go hiking.', text: 'maybe stay overnight at a cabin in the mountains?', icon: 'hiking', tags: { temperature: ['warm', 'cold'], weather: ['clear'] } },
  { highlight: 'boulderbar.', text: 'only one word is needed. there is always time for that 7a you are working on.', icon: null, tags: { } },
  { highlight: 'climbing.', text: 'find yourself a nice climbable rock in the nature', icon: null, tags: { temperature: ['warm',  'hot'], weather: ['clear'] } },
  { highlight: 'play some pc-games.', text: 'caution: only do this if there is nothing else to do.', icon: 'laptop', tags: { } },
  { highlight: 'visit a museum.', text: 'feeling the thirst for education? pay the local museum a visit. maybe bring some friends?', icon: 'bank', tags: { } },
  { highlight: 'visit the zoo.', text: 'if you are lucky, you will see bigfoot.', icon: null, tags: { temperature: ['warm', 'hot', 'cold'], weather: ['clear', 'misty'] } },
  { highlight: 'go to the beach.', text: 'what about a day at the beach and get some tan?', icon: 'beach', tags: { temperature: ['warm', 'hot'], weather: ['clear'] } }
]

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getWeatherDataByCoords, getWeatherDataByCity);
  } else {
    getWeatherDataByCity(null);
  }
}

function getWeatherDataByCoords(position) {

  // get data according to position
  $.ajax({
    url: 'https://api.openweathermap.org/data/2.5/weather?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&units=metric&APPID=6ea610329e6fe2efc7e43d4b50dbdafc',
    success: function(data) {
      prepareData(data);
    },
    error: function(error) {
      console.log('Error getting Weatherdata', error);
    }
  })
}

function getWeatherDataByCity(error) {

  // fallback if no position is given
  console.log('Falling back to Salzburg', error);
  $.ajax({
    url: 'http://api.openweathermap.org/data/2.5/weather?q=Salzburg&units=metric&APPID=6ea610329e6fe2efc7e43d4b50dbdafc',
    success: function(data) {
      prepareData(data);
    },
    error: function(error) {
      console.log('Error getting Weatherdata', error);
    }
  })
}
 
function prepareData(data) {
  if (data.weather.length === 0) return;

  // turn weather into criteria
  let tags = parseCode(data.weather[0].id, data.main.temp);
  
  let filteredActivities = activities.filter(function(value) {
    // filter by temperature
    if (value.tags.temperature) {
      if (!value.tags.temperature.includes(tags.temperature)) return null;
    }
    
    // filter by weather
    if (value.tags.weather) {
      if (!value.tags.weather.includes(tags.weather)) return null;
    }
    
    // TODO: modifiers eg. alone, with friends, mood
    
    // criteria was fulfilled
    return value;
  })
  
  // shuffle array
  filteredActivities = shuffleArray(filteredActivities);

  weatherObj = {
    city: data.name,
    temperature: data.main.temp,
    humidity: data.main.humidity,
    weather: data.weather[0].main,
    activities: filteredActivities,
    tags: {
      temperature: tags.temperature,
      weather: tags.weather
    }
  }

  update(currentActivity)
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function parseCode(code, temp) {
  
  let temperature = null;
  let weather = null;
  
  if (temp <= 5) temperature = 'freezing';
  else if (temp > 5 && temp <= 10) temperature = 'cold';
  else if (temp >= 20 && temp <= 30) temperature = 'warm';
  else if (temp > 30) temperature = 'hot';
  
  if (code >= 200 && code < 600) weather = 'rain';
  else if (code >= 600 && code < 700) weather = 'snow';
  else if (code >= 700 && code <= 761) weather = 'misty';
  else if (code >= 800 && code <= 802) weather = 'clear';
  else if (code >= 803 && code <= 804) weather = 'misty';
  else if (code >= 900 && code <= 999) weather = 'extreme';
  
  console.log('temperature:', temperature || temp);
  console.log('weather:', weather || code);
  
  return { temperature: temperature, weather: weather };
}

function next() {
  update(currentActivity);
}

function update(index) {
  
  let activity = weatherObj.activities[index];
  
  // remove existing activity
  $('#target p').remove();
  $('#bg-image img').remove();
  
  // write activity to dom
  $('#target').append('<p class="animated fadeInUp"><span>' +
  activity.highlight +
  ' </span><span class="text">' +
  activity.text +
  '<span></p>');
  
  // write svg to dom if available
  if (activity.icon) {
    $('#bg-image').append('<img src="assets/' +
    activity.icon+
    '.svg" alt="' +
    activity.icon+
    '-icon">');
  }
  
  // up currentActivity one if not at max
  if (currentActivity < (weatherObj.activities.length - 1)) {
    currentActivity += 1;
  } else {
    currentActivity = 0;
  }
  
  hideOverlay();
}

function hideOverlay() {
  $('#overlay').addClass('fade-out');
  
  setTimeout(function() {
    $('#overlay').addClass('hide').removeClass('fade-out')
  }, 700)
}

function showOverlay() {
  $('#overlay').removeClass('hide');
}
