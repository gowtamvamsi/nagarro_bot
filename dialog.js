// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const {
    DialogSet,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');

// state properties
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_NAME_PROP = 'user_name';

// dialog names
const WHO_ARE_YOU = 'who_are_you';
const HELLO_USER = 'hello_user';

// prompt name
const NAME_PROMPT = 'name_prompt';

class DialogBot {
    /**
     *
     * @param {Object} conversationState
     * @param {Object} userState
     */
    constructor(conversationState, userState) {
        // creates a new state accessor property.
        this.conversationState = conversationState;
        this.userState = userState;

        this.dialogState = this.conversationState.createProperty(
            DIALOG_STATE_PROPERTY
        );

        this.userName = this.userState.createProperty(USER_NAME_PROP);

        this.dialogs = new DialogSet(this.dialogState);

        // Add prompts
        this.dialogs.add(new TextPrompt(NAME_PROMPT));

        // Create a dialog that asks the user for their name.
        this.dialogs.add(
            new WaterfallDialog(WHO_ARE_YOU, [
                this.askForName.bind(this),
                this.collectAndDisplayName.bind(this)
            ])
        );

        // Create a dialog that displays a user name after it has been collected.
        this.dialogs.add(
            new WaterfallDialog(HELLO_USER, [this.displayName.bind(this)])
        );
    }

    // The first step in this waterfall asks the user for their name.
    async askForName(dc) {
        await dc.prompt(NAME_PROMPT, `What is your name, human?`);
    }

    // The second step in this waterfall collects the response, stores it in
    // the state accessor, then displays it.
    async collectAndDisplayName(step) {
        await this.userName.set(step.context, step.result);
        await step.context.sendActivity(`Got it. You are ${ step.result }.`);
        await step.endDialog();
    }

    // This step loads the user's name from state and displays it.
    async displayName(step) {
        const userName = await this.userName.get(step.context, null);
        await step.context.sendActivity(`Your name is ${ userName }.`);
        await step.endDialog();
    }

    /**
     *
     * @param {Object} context on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            console.log('Message ...');
            // Create dialog context
            const dc = await this.dialogs.createContext(turnContext);

            // Continue the current dialog
            await dc.continueDialog();
            console.log('turnContext.responded = ', turnContext.responded);
            // Show menu if no response sent
            if (!turnContext.responded) {
                const userName = await this.userName.get(dc.context, null);
                console.log('userName = ', userName);
                if (userName) {
                    await dc.beginDialog(HELLO_USER);
                } else {
                    await dc.beginDialog(WHO_ARE_YOU);
                }
            }
        }

        // Save changes to the user name.
        await this.userState.saveChanges(turnContext);

        // End this turn by saving changes to the conversation state.
        await this.conversationState.saveChanges(turnContext);
    }
}

module.exports.MyBot = DialogBot;
