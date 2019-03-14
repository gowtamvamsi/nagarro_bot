const { ActivityTypes } = require('botbuilder');
const {
    DialogSet,
    WaterfallDialog,
    TextPrompt,
    NumberPrompt,
    DialogTurnStatus
} = require('botbuilder-dialogs');

const DIALOG_STATE = 'dialogState';
const USER_STATE = 'userState';
const NAME_PROMPT = 'cityPropmpt';
const AGE_PROMPT = 'agePrompt';
const MAIN_DAILOG = 'mainDailog';

class DialogBot {
    constructor(conversationstate, userState) {
        this.conversationstate = conversationstate;
        this.userState = userState;
        this.dialogStateProp = this.conversationstate.createProperty(
            DIALOG_STATE
        );

        this.userStateProp = this.userState.createProperty(USER_STATE);

        this.dailogs = new DialogSet(this.userStateProp);
        this.dailogs.add(new TextPrompt(NAME_PROMPT));
        this.dailogs.add(new NumberPrompt(AGE_PROMPT));
        this.dailogs.add(
            new WaterfallDialog(MAIN_DAILOG)
                .addStep(this.nameStep.bind(this))
                .addStep(this.ageStep.bind(this))
                .addStep(this.confirm.bind(this))
        );
    }

    async onTurn(turnContext) {
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
                const status = `${ userInfo.data.name }, your age is ${
                    userInfo.data.age
                }`;
                await turnContext.sendActivity(status);
                break;
            }
            await this.conversationstate.saveChanges(turnContext);
            await this.userState.saveChanges(turnContext);
        }
    }

    async nameStep(stepContext) {
        // Ask the user to enter their name.
        return await stepContext.prompt(NAME_PROMPT, 'What is your name');
    }

    async ageStep(stepContext) {
        stepContext.values.name = stepContext.result;

        // Ask the user to enter their name.
        return await stepContext.prompt(AGE_PROMPT, {
            prompt: 'What is your age?',
            retryPrompt: 'Please enter a valid value for your age.'
        });
    }

    async confirm(stepContext) {
        stepContext.values.age = stepContext.result;
        await stepContext.context.sendActivity(
            `We have collected your information.`
        );

        // Ask the user to enter their name.
        return await stepContext.endDialog({
            data: stepContext.values
        });
    }
}

module.exports.MyBot = DialogBot;
