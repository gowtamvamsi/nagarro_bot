// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, CardFactory } = require('botbuilder');
// Import AdaptiveCard content.
const FlightItineraryCard = require('../resources/FlightItineraryCard.json');
const ImageGalleryCard = require('../resources/ImageGalleryCard.json');
const LargeWeatherCard = require('../resources/LargeWeatherCard.json');
const RestaurantCard = require('../resources/RestaurantCard.json');
const SolitaireCard = require('../resources/SolitaireCard.json');

class AdaptiveCardBot {
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            const CARDS = [
                FlightItineraryCard,
                ImageGalleryCard,
                LargeWeatherCard,
                RestaurantCard,
                SolitaireCard
            ];
            // Select a random card to send.
            const randomCard =
                CARDS[Math.floor(Math.random() * CARDS.length - 1 + 1)];

            const reply = {
                text: 'Adaptive Card example',
                attachments: [CardFactory.adaptiveCard(randomCard)]
            };

            // Send hero card to the user.
            await turnContext.sendActivity(reply);
        }
    }
}

function generateWeatherAdaptiveCard(weatherData) {
    // load weather card template
    var weatherCard = require('./card-templates/weather-card');
    // set current condition icon
    weatherCard.content.body[0].columns[0].items[0].url = `https:${weatherData.current.condition.icon}`;
    // set location name + last updated time
    weatherCard.content.body[0].columns[1].items[0].text = `**${weatherData.location.name}**`;
    // set current temp in F
    weatherCard.content.body[0].columns[1].items[1].text = `${weatherData.current.temp_f}° F`;
    // set current conditions text
    weatherCard.content.body[0].columns[1].items[2].text = weatherData.current.condition.text;
    // set wind speed and direction
    weatherCard.content.body[0].columns[1].items[3].text = `Winds ${weatherData.current.wind_mph} mph ${weatherData.current.wind_dir}`;
    // set the select action URL
    weatherCard.content.body[1].columns[0].selectAction.url = `https://www.bing.com/search?q=forecast in ${weatherData.location.name}`;
    weatherCard.content.body[1].columns[1].selectAction.url = `https://www.bing.com/search?q=forecast in ${weatherData.location.name}`;
    weatherCard.content.body[1].columns[2].selectAction.url = `https://www.bing.com/search?q=forecast in ${weatherData.location.name}`;
    weatherCard.content.body[1].columns[3].selectAction.url = `https://www.bing.com/search?q=forecast in ${weatherData.location.name}`;
    // set the spoken utterance
    weatherCard.content.speak = `<s>Today the temperature is ${weatherData.current.temp_f}° F in ${weatherData.location.name}</s><s>Winds are ${weatherData.current.wind_mph} miles per hour from the ${weatherData.current.wind_dir}</s>`;
    
    // set the daily forcast info per day
    var day1 = weatherData.forecast.forecastday[0]; // today
    var day2 = weatherData.forecast.forecastday[1]; // tomorrow
    var day3 = weatherData.forecast.forecastday[2];
    var day4 = weatherData.forecast.forecastday[3];
    // DAY 1
    weatherCard.content.body[1].columns[0].items[0].text = moment(day1.date).format('llll').split(',')[0]; // day name
    weatherCard.content.body[1].columns[0].items[1].url = `https:${day1.day.condition.icon}`; // day icon
    weatherCard.content.body[1].columns[0].items[2].text = `${Math.round(day1.day.maxtemp_f)}/${Math.round(day1.day.mintemp_f)}`; // day high/low temp
    // DAY 2
    weatherCard.content.body[1].columns[1].items[0].text = moment(day2.date).format('llll').split(',')[0]; // day name
    weatherCard.content.body[1].columns[1].items[1].url = `https:${day2.day.condition.icon}`; // day icon
    weatherCard.content.body[1].columns[1].items[2].text = `${Math.round(day2.day.maxtemp_f)}/${Math.round(day2.day.mintemp_f)}`; // day high/low temp
    // DAY 3
    weatherCard.content.body[1].columns[2].items[0].text = moment(day3.date).format('llll').split(',')[0]; // day name
    weatherCard.content.body[1].columns[2].items[1].url = `https:${day3.day.condition.icon}`; // day icon
    weatherCard.content.body[1].columns[2].items[2].text = `${Math.round(day3.day.maxtemp_f)}/${Math.round(day3.day.mintemp_f)}`; // day high/low temp
    // DAY 4
    weatherCard.content.body[1].columns[3].items[0].text = moment(day4.date).format('llll').split(',')[0]; // day name
    weatherCard.content.body[1].columns[3].items[1].url = `https:${day4.day.condition.icon}`; // day icon
    weatherCard.content.body[1].columns[3].items[2].text = `${Math.round(day4.day.maxtemp_f)}/${Math.round(day4.day.mintemp_f)}`; // day high/low temp
    // return the weather card attachment data
    return weatherCard;
}


module.exports.MyBot = AdaptiveCardBot;
