
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes, CardFactory, ActionTypes } = require('botbuilder');
// const card1 = require('D:\\BotWS1\\test-1\\Resources\\Card1.json');
const allHolidaysCard = require('./Resources/All_Holidays.json');
const holidayCard = require('./Resources/holiday.json');
const appliedHolidays = require('./Resources/appliedHolidays.json');
// const flexiHolidaysCard=require('./Resources/Flexible_HOlidays.json');

const { LuisRecognizer } = require('botbuilder-ai');
const holidays = {
    flexible: [],
    leaves: []
};
let flexiCount = 0;
let leaveCount = 0;
let publicHolidays = [new Date(2019, 1, 1), new Date(2019, 3, 21), new Date(2019, 8, 15), new Date(2019, 10, 2), new Date(2019, 10, 8), new Date(2019, 10, 28), new Date(2019, 12, 25)];

// Supported LUIS Entities, defined in ./dialogs/greeting/resources/greeting.lu
class MyBot {
    constructor(application, luisPredictionOptions, userState) {
        this.luisRecognizer = new LuisRecognizer(
            application,
            luisPredictionOptions,
            true
        );
    }
    /**
     *
     * @param {TurnContext} on turn context object.
     */

    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.

        if (turnContext.activity.type === ActivityTypes.Message) {
            const results = await this.luisRecognizer.recognize(turnContext);

            // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
            const topIntent = results.luisResult.topScoringIntent;
            if (topIntent.intent === 'All Holidays') {
                const reply = {
                    text: 'List of All Holidays in Nagarro',
                    attachments: [CardFactory.adaptiveCard(allHolidaysCard)]
                };
                await turnContext.sendActivity(reply);
            } else if (topIntent.intent === 'Partial Holidays') {
                this.getPartialHolidays(results, allHolidaysCard, turnContext);
            } else if (topIntent.intent === 'Flexi Holidays') {
                this.getFlexibleHolidays(results, allHolidaysCard, turnContext);
            } else if (topIntent.intent === 'Flexible leave application') {
                this.applyForFlexi(turnContext, results);
            } else if (topIntent.intent === 'Leave application') {
                this.applyForLeave(turnContext, results);
            } else if (topIntent.intent === 'Show applied holidays') {
                this.showAppliedHolidays(turnContext);
            }
        }
    }
    async showAppliedHolidays(turnContext) {
        let cardToDisplay = {};
        cardToDisplay.body = [];
        cardToDisplay['type'] = appliedHolidays.type;
        cardToDisplay['$schema'] = appliedHolidays.$schema;
        cardToDisplay['version'] = appliedHolidays.version;
        cardToDisplay.body[0] = appliedHolidays.body[1];
        for (let i = 0; i < holidays.leaves.length; i++) {
            let leave = {
                'type': 'TextBlock',
                'text': 'Test Text',
                'size': 'medium',
                'weight': 'bolder'
            };
            leave.text = holidays.leaves[i];
            leave.id = i;
            cardToDisplay.body[i] = leave;
        }

        for (let i = 0; i < holidays.flexible.length; i++) {
            let leave = {
                'type': 'TextBlock',
                'text': 'Test Text',
                'size': 'medium',
                'weight': 'bolder'
            };
            leave.text = holidays.flexible[i] + ' (Flexible)';
            leave.id = i;
            cardToDisplay.body[i + cardToDisplay.body.length] = leave;
        }
        if (cardToDisplay.body.length > 0) {
            const reply = {
                text: 'Your applied leaves are:',
                attachments: [CardFactory.adaptiveCard(cardToDisplay)]
            };
    
            // Send hero card to the user.
            await turnContext.sendActivity(reply);
        } else {
            const reply = {
                text: `Your don't have any applied leaves yet.`,
            };
    
            // Send hero card to the user.
            await turnContext.sendActivity(reply);
        }
    }
    async applyForLeave(turnContext, results) {
        let totalCount = 0;
        let canApply = true;
        let reply = '';
        for (var i = 0; i < results.luisResult.entities.length; i++) {
            var entity = results.luisResult.entities[i];
            // console.log(entity.entity);
            var dateRange = entity.resolution.values[entity.resolution.values.length - 1];
            console.log(dateRange);
            if (dateRange.start !== undefined && dateRange.end !== undefined) {
                let numOfDays = this.datediff(this.parseDate(dateRange.start), this.parseDate(dateRange.end), publicHolidays) + 1;
                totalCount = totalCount + numOfDays;
                if (leaveCount + totalCount > 27) {
                    canApply = false;
                    break;
                }
            } else {
                totalCount++;
            }
        }
        if (canApply) {
            leaveCount = leaveCount + totalCount;
            reply = 'You succesfully applied for ';
            for (var i = 0; i < results.luisResult.entities.length; i++) {
                var entity = results.luisResult.entities[i];
                holidays.leaves[holidays.leaves.length] = entity.entity;
                reply = reply + entity.entity;
                if (i < results.luisResult.entities.length - 1) {
                    reply = reply + ', ';
                } else {
                    reply = reply + '. ';
                }
            }
            let leaveBalance = 27 - leaveCount;
            reply = reply + ' Remaining leave balance is ' + leaveBalance + ' days.';
        } else {
            reply = 'Sorry, You don\'t have sufficient leave balance';
        }
        await turnContext.sendActivity(reply);
    }
    parseDate(str) {
        console.log('parse');
        console.log(str);
        var mdy = str.split('-');
        return new Date(mdy[0], mdy[1] - 1, mdy[2]);
    }

    datediff(dDate1, dDate2, publicHolidays) {
        var iWeeks; var iDateDiff; var iAdjust = 0; var i;
        if (dDate2 < dDate1) return -1;
        var iWeekday1 = dDate1.getDay();
        var iWeekday2 = dDate2.getDay();
        iWeekday1 = (iWeekday1 === 0) ? 7 : iWeekday1;
        iWeekday2 = (iWeekday2 === 0) ? 7 : iWeekday2;
        if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1;
        iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1;
        iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;
        iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000);

        if (iWeekday1 <= iWeekday2) {
            iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1);
        } else {
            iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2);
        }

        iDateDiff -= iAdjust;

        for (i = 0; i < publicHolidays.length; i++) {
            if (publicHolidays[i] >= dDate1 && publicHolidays[i] <= dDate2 && publicHolidays[i].getDay() != 0 && publicHolidays[i].getDay() != 6) {
                iDateDiff--;
            }
        }

        return (iDateDiff);
    }

    async applyForFlexi(turnContext, results) {
        let index = results.luisResult.entities[0].resolution.values.length - 1;
        let dateResult = results.luisResult.entities[0].resolution.values[index];
        let reply = 'Sorry, you already applied for 3 flexible leaves';
        if (flexiCount < 3) {
            holidays.flexible[holidays.flexible.length] = results.luisResult.entities[0].entity;
            reply = 'you application for flexible leave on ' + dateResult.value + ' is success';
            flexiCount++;
        }
        await turnContext.sendActivity(reply);
    }
    async getPartialHolidays(results, allHolidaysCard, turnContext) {
        let currDate = new Date();
        let startMonth = currDate.getMonth() + 1; ;
        let endMonth = 12;
        let endDate = 31;
        let startDate = 1;
        let fromDate = new Date();
        let toDate = new Date();

        if (results.luisResult.entities.length > 0) {
            let index = results.luisResult.entities[0].resolution.values.length - 1;
            let dateResult = results.luisResult.entities[0].resolution.values[index];
            if (dateResult.start !== undefined && dateResult.end !== undefined) {
                fromDate = dateResult.start;
                toDate = dateResult.end;
                var tempStart = dateResult.start.split('-');
                var tempEnd = dateResult.end.split('-');
                startMonth = parseInt(tempStart[1]);
                endMonth = parseInt(tempEnd[1]);
                startDate = parseInt(tempStart[2]);
                endDate = parseInt(tempEnd[2]);
            }
        }

        let cardToDisplay = {};
        cardToDisplay.body = [];
        cardToDisplay['type'] = allHolidaysCard.type;
        cardToDisplay['$schema'] = allHolidaysCard.$schema;
        cardToDisplay['version'] = allHolidaysCard.version;
        cardToDisplay.body[0] = allHolidaysCard.body[0];
        let count = 0;
        let cardIndex = 0;
        let currMonth = 1;
        while (currMonth <= endMonth) {

            if ((allHolidaysCard.body[count].month === startMonth)) {
                if (allHolidaysCard.body[count].columns[1].date >= startDate) {
                    cardToDisplay.body[cardIndex] = allHolidaysCard.body[count];
                    cardIndex++;
                }
            } else if (allHolidaysCard.body[count].month === endMonth) {
                if (allHolidaysCard.body[count].columns[1].date <= endDate) {
                    cardToDisplay.body[cardIndex] = allHolidaysCard.body[count];
                    cardIndex++;
                }
            } else if (allHolidaysCard.body[count].month > startMonth && allHolidaysCard.body[count].month < endMonth) {
                cardToDisplay.body[cardIndex] = allHolidaysCard.body[count];
                cardIndex++;
            }
            count++;
            if (allHolidaysCard.body[count].month !== currMonth) {
                currMonth = allHolidaysCard.body[count].month;
            }
        }

        const reply = {
            text: `List of holidays from ${ fromDate } to ${ toDate } are: `,
            attachments: [CardFactory.adaptiveCard(cardToDisplay)]
        };

        // Send hero card to the user.
        await turnContext.sendActivity(reply);
        // return cardToDisplay;
    }
    async getFlexibleHolidays(results, flexiHolidaysCard, turnContext) {
        let currDate = new Date();
        let startMonth = currDate.getMonth(); ;
        let endMonth = 12;
        let endDate = 31;
        let startDate = 1;

        if (results.luisResult.entities.length > 0) {
            let index = results.luisResult.entities[0].resolution.values.length - 1;
            let dateResult = results.luisResult.entities[0].resolution.values[index];
            if (dateResult.start !== undefined && dateResult.end !== undefined) {
                var tempStart = dateResult.start.split('-');
                var tempEnd = dateResult.end.split('-');
                startMonth = parseInt(tempStart[1]);
                endMonth = parseInt(tempEnd[1]);
                startDate = parseInt(tempStart[2]);
                endDate = parseInt(tempEnd[2]);
            }
        }

        let cardToDisplay = {};
        cardToDisplay.body = [];
        cardToDisplay['type'] = allHolidaysCard.type;
        cardToDisplay['$schema'] = allHolidaysCard.$schema;
        cardToDisplay['version'] = allHolidaysCard.version;
        cardToDisplay.body[0] = allHolidaysCard.body[0];
        let count = 0;
        let cardIndex = 0;
        let currMonth = 1;
        const flexiHolidays = [];
        while (currMonth <= endMonth) {
            if ((flexiHolidaysCard.body[count].month === startMonth)) {
                if (flexiHolidaysCard.body[count].columns[1].date >= startDate && flexiHolidaysCard.body[count].columns[3].items[0].text === 'Flexible') {
                    let tempHoliday = {
                        type: ActionTypes.ImBack,
                        title: '',
                        value: ''
                    };
                    tempHoliday.title = flexiHolidaysCard.body[count].columns[2].items[0].text + ' (' + flexiHolidaysCard.body[count].columns[1].items[0].text + ')';
                    tempHoliday.value = 'I want to apply for flexible leave on ' + flexiHolidaysCard.body[count].columns[1].items[0].text;
                    flexiHolidays[cardIndex] = tempHoliday;
                    cardIndex++;
                }
            } else if (flexiHolidaysCard.body[count].month === endMonth) {
                if (flexiHolidaysCard.body[count].columns[1].date <= endDate && flexiHolidaysCard.body[count].columns[3].items[0].text === 'Flexible') {
                    let tempHoliday = {
                        type: ActionTypes.ImBack,
                        title: '',
                        value: ''
                    };
                    tempHoliday.title = flexiHolidaysCard.body[count].columns[2].items[0].text + ' (' + flexiHolidaysCard.body[count].columns[1].items[0].text + ')';
                    tempHoliday.value = 'I want to apply for flexible leave on ' + flexiHolidaysCard.body[count].columns[1].items[0].text;
                    flexiHolidays[cardIndex] = tempHoliday;
                    cardIndex++;
                }
            } else if (allHolidaysCard.body[count].month >= startMonth && allHolidaysCard.body[count].month <= endMonth) {
                if (flexiHolidaysCard.body[count].columns[3].items[0].text === 'Flexible') {
                    let tempHoliday = {
                        type: ActionTypes.ImBack,
                        title: '',
                        value: ''
                    };
                    tempHoliday.title = flexiHolidaysCard.body[count].columns[2].items[0].text + ' (' + flexiHolidaysCard.body[count].columns[1].items[0].text + ')';
                    tempHoliday.value = 'I want to apply for flexible leave on ' + flexiHolidaysCard.body[count].columns[1].items[0].text;
                    flexiHolidays[cardIndex] = tempHoliday;
                    cardIndex++;
                }
            }

            count++;
            if (flexiHolidaysCard.body[count].month !== currMonth) {
                currMonth = flexiHolidaysCard.body[count].month;
            }
        }
        const card = CardFactory.heroCard(
            'Here is the list of flexible holidays in Nagarro',
            undefined,
            CardFactory.actions(flexiHolidays),
            {
                text:
                'Note: You can apply for maximum of 3 flexible holidays'
            }
        );
        const reply = { type: ActivityTypes.Message };
        reply.attachments = [card];
        await turnContext.sendActivity(reply);
    }
}

module.exports.MyBot = MyBot;
