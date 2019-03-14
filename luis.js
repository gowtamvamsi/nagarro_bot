// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');

class LuisBot {
    /**
     *
     * @param {Object} conversationState
     * @param {Object} userState
     */
    constructor(application, luisPredictionOptions) {
        this.luisRecognizer = new LuisRecognizer(
            application,
            luisPredictionOptions,
            true
        );
    }

    /**
     *
     * @param {Object} context on turn context object.
     */
    async onTurn(turnContext) {
        // By checking the incoming Activity type, the bot only calls LUIS in appropriate cases.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Perform a call to LUIS to retrieve results for the user's message.
            const results = await this.luisRecognizer.recognize(turnContext);

            // Since the LuisRecognizer was configured to include the raw results, get the `topScoringIntent` as specified by LUIS.
            const topIntent = results.luisResult.topScoringIntent;

            if (topIntent.intent !== 'None') {
                await turnContext.sendActivity(
                    `LUIS Top Scoring Intent: ${ topIntent.intent }, Score: ${
                        topIntent.score
                    }`
                );
            } else {
                // If the top scoring intent was "None" tell the user no valid intents were found and provide help.
                await turnContext.sendActivity(`No LUIS intents were found.
                                                \nThis sample is about identifying two user intents:
                                                \n - 'Calendar.Add'
                                                \n - 'Calendar.Find'
                                                \nTry typing 'Add Event' or 'Show me tomorrow'.`);
            }
        } else if (
            turnContext.activity.type === ActivityTypes.ConversationUpdate &&
            turnContext.activity.recipient.id !==
                turnContext.activity.membersAdded[0].id
        ) {
            // If the Activity is a ConversationUpdate, send a greeting message to the user.
            await turnContext.sendActivity(
                'Welcome to the NLP with LUIS sample! Send me a message and I will try to predict your intent.'
            );
        } else if (
            turnContext.activity.type !== ActivityTypes.ConversationUpdate
        ) {
            // Respond to all other Activity types.
            await turnContext.sendActivity(
                `[${ turnContext.activity.type }]-type activity detected.`
            );
        }
    }
}

module.exports.MyBot = LuisBot;
