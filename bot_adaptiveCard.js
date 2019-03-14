// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, CardFactory } = require('botbuilder');
// const card1 = require('D:\\BotWS1\\test-1\\Resources\\Card1.json');
const allHolidaysCard = require('D:\\BotWS1\\test-1\\Resources\\All_Holidays.json');
const pHolidays = require('D:\\BotWS1\\test-1\\Resources\\P_Holidays.json');

class MyBotAdpativeCard {
    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // await turnContext.sendActivity(`You said '${ turnContext.activity.text }'`);
            if (turnContext.activity.text === 'Show All Holidays') {
                const reply = {
                    text: 'All Holidays List',
                    attachments: [CardFactory.adaptiveCard(allHolidaysCard)]
                };
                await turnContext.sendActivity(reply);
            } else {
                // let reply = pHolidays.body[0];
                let cardToDisplay = {};
                cardToDisplay.body = [];
                cardToDisplay.type = pHolidays.type;
                cardToDisplay.$schema = pHolidays.$schema;
                cardToDisplay.version = pHolidays.version;
                cardToDisplay.body[0] = pHolidays.body[0];
                cardToDisplay.body[1] = pHolidays.body[1];

                const reply = {
                    text: 'Some Holidays List',
                    attachments: [CardFactory.adaptiveCard(cardToDisplay)]
                };
                await turnContext.sendActivity(reply);

                // await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
                // if (pHolidays.body[0].tag === 'Jan') {
                //     reply += pHolidays.body[0];
                // }
            }
        }
    }
}

module.exports.MyBot = MyBotAdpativeCard;
