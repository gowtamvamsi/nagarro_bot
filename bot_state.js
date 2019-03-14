// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

// The accessor names for the conversation data and user profile state property accessors.
const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

class BotState {
    constructor(conversationState, userState) {
        // Create the state property accessors for the conversation data and user profile.
        this.conversationData = conversationState.createProperty(
            CONVERSATION_DATA_PROPERTY
        );
        this.userProfile = userState.createProperty(USER_PROFILE_PROPERTY);

        this.conversationState = conversationState;
        this.userState = userState;
    }

    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            // await turnContext.sendActivity(`You said '${ turnContext.activity.text }'`);
            await turnContext.sendActivity(`[${ CONVERSATION_DATA_PROPERTY }]`);
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
    }
}

module.exports.MyBot = BotState;
