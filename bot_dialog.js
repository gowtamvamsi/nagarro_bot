// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const {
    DialogSet,
    WaterfallDialog,
    TextPrompt,
    DateTimePrompt,
    ConfirmPrompt,
    DialogTurnStatus
} = require('botbuilder-dialogs');

// The accessor names for the conversation data and user profile state property accessors.
const CONVERSATION_DATA_PROPERTY = 'conversationData';

// Define identifiers for our state property accessors.
const DIALOG_STATE = 'dialogState';
const CHILD_DIALOG_STATE = 'childDialogState';
const USER_STATE = 'userState';
const ORIGIN_CITY_PROMPT = 'originCityPropmpt';
const DEPARTURE_CITY_PROMT = 'departureCityPrompt';
const DEPARTURE_DATE_PROMT = 'departureDatePrompt';
const RETURN_TRIP = 'returnTrip';
const RETURN_DATE = 'returnDate';

const MAIN_DAILOG = 'mainDailog';

class BotDialog {
    constructor(conversationState, userState) {
        this.conversationState = conversationState;
        this.userState = userState;

        // Create the state property accessors for the conversation data and user profile.
        this.conversationData = this.conversationState.createProperty(
            CONVERSATION_DATA_PROPERTY
        );

        this.dialogStateProp = this.conversationState.createProperty(
            DIALOG_STATE,
            CHILD_DIALOG_STATE
        );

        this.userStateProp = this.userState.createProperty(USER_STATE);

        this.dailogs = new DialogSet(this.userStateProp);
        this.dailogs.add(new TextPrompt(ORIGIN_CITY_PROMPT));
        this.dailogs.add(new TextPrompt(DEPARTURE_CITY_PROMT));
        this.dailogs.add(new DateTimePrompt(DEPARTURE_DATE_PROMT));
        this.dailogs.add(new ConfirmPrompt(RETURN_TRIP));
        this.dailogs.add(new DateTimePrompt(RETURN_DATE));
        this.dailogs.add(
            new WaterfallDialog(MAIN_DAILOG)
                .addStep(this.originCity.bind(this))
                .addStep(this.departureCity.bind(this))
                // .addStep(this.departureDate.bind(this))
                .addStep(this.returnTrip.bind(this))
                .addStep(this.confirm.bind(this))
        );
    }

    async originCity(stepContext) {
        // Ask the user to enter their name.
        return await stepContext.prompt(ORIGIN_CITY_PROMPT, 'What is your Origin City?');
    }

    async departureCity(stepContext) {
        stepContext.values.originCity = stepContext.result;
        // Ask the user to enter their name.
        return await stepContext.prompt(DEPARTURE_CITY_PROMT, 'What is your Departure City?');
    }

    async departureDate(stepContext) {
        stepContext.values.departureCity = stepContext.result;
        // Ask the user to enter their name.
        return await stepContext.prompt(DEPARTURE_DATE_PROMT, 'What is your Departure Date?');
    }

    async returnTrip(stepContext) {
        stepContext.values.departureCity = stepContext.result;
        // Ask the user to enter their name.
        return await stepContext.prompt(RETURN_TRIP, 'Is this return trip?');
    }

    // async ageStep(stepContext) {
    //     stepContext.values.name = stepContext.result;

    //     // Ask the user to enter their name.
    //     return await stepContext.prompt(AGE_PROMPT, {
    //         prompt: 'What is your age?',
    //         retryPrompt: 'Please enter a valid value for your age.'
    //     });
    // }

    async confirm(stepContext) {
        stepContext.values.returnTrip = stepContext.result;
        await stepContext.context.sendActivity(
            `We have collected your information.`
        );

        // Ask the user to enter their name.
        return await stepContext.endDialog({
            data: stepContext.values
        });
    }

    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            const dialogContext = await this.dailogs.createContext(turnContext);
            const results = await dialogContext.continueDialog();
            console.log('results.status = ', results.status);
            switch (results.status) {
            case DialogTurnStatus.cancelled:
            case DialogTurnStatus.empty:
                await dialogContext.beginDialog(MAIN_DAILOG);
                break;

            case DialogTurnStatus.waiting:
                // If there is an active dialog, we don't need to do anything here.
                break;

            case DialogTurnStatus.complete:
                // If we just finished the dialog, capture and display the results.
                const userInfo = results.result;
                const status = ` Origin City is ${ userInfo.data.originCity }, 
                    \n Departure City is ${ userInfo.data.departureCity }, 
                    \n is this return trip ${ userInfo.data.returnTrip }`;
                await turnContext.sendActivity(status);
                break;
            }
            await this.conversationState.saveChanges(turnContext);
            await this.userState.saveChanges(turnContext);
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
    }
}

module.exports.MyBot = BotDialog;
