// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const dotenv = require('dotenv');
const path = require('path');
const restify = require('restify');
const {
    BotFrameworkAdapter,
    MemoryStorage,
    ConversationState,
    UserState
} = require('botbuilder');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
// const { BotFrameworkAdapter } = require('botbuilder');

// Import required bot configuration.
const { BotConfiguration } = require('botframework-config');

// This bot's main dialog.
const { MyBot } = require('./bot');

// Read botFilePath and botFileSecret from .env file
// Note: Ensure you have a .env file and include botFilePath and botFileSecret.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// bot endpoint name as defined in .bot file
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.
const DEV_ENVIRONMENT = 'development';

// bot name as defined in .bot file
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open Test1.bot file in the Emulator`);
});

// .bot file path
const BOT_FILE = path.join(__dirname, (process.env.botFilePath || ''));

// Read bot configuration from .bot file.
let botConfig;
try {
    botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {
    console.error(`\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`);
    console.error(`\n - The botFileSecret is available under appsettings for your Azure Bot Service bot.`);
    console.error(`\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.`);
    console.error(`\n - See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.\n\n`);
    process.exit();
}

// Get bot endpoint configuration by service name
const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: endpointConfig.appId || process.env.microsoftAppID,
    appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);

    // Clear out conversation state
    await conversationState.delete(context);

    // Clear out user state
    await userState.delete(context);
};

// Create conversation and user state with in-memory storage provider.
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the main dialog.
// const myBot = new MyBot(conversationState, userState);
// const myBot = new MyBot(conversationState, userState);


// Get bot endpoint configuration by service name
// Language Understanding (LUIS) service name as defined in the .bot file.
const LUIS_CONFIGURATION = process.env.luisAppName;
const luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);

// Map the contents to the required format for `LuisRecognizer`.
const luisApplication = {
    applicationId: luisConfig.appId,
    endpointKey: luisConfig.subscriptionKey || luisConfig.authoringKey,
    azureRegion: luisConfig.region
};

// Create configuration for LuisRecognizer's runtime behavior.
const luisPredictionOptions = {
    includeAllIntents: true,
    log: true,
    staging: false
};

const myBot = new MyBot(luisApplication, luisPredictionOptions, userState, conversationState);

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await myBot.onTurn(context);
    });
});

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// //--------------------
// // Copyright (c) Microsoft Corporation. All rights reserved.
// // Licensed under the MIT License.

// const { ActivityTypes } = require('botbuilder');
// const {
//     DialogSet,
//     TextPrompt,
//     WaterfallDialog
// } = require('botbuilder-dialogs');

// // state properties
// const DIALOG_STATE_PROPERTY = 'dialogState';
// const USER_NAME_PROP = 'user_name';

// // dialog names
// const WHO_ARE_YOU = 'who_are_you';
// const HELLO_USER = 'hello_user';

// // prompt name
// const NAME_PROMPT = 'name_prompt';

// class DialogBot {
//     /**
//      *
//      * @param {Object} conversationState
//      * @param {Object} userState
//      */
//     constructor(conversationState, userState) {
//         // creates a new state accessor property.
//         this.conversationState = conversationState;
//         this.userState = userState;

//         this.dialogState = this.conversationState.createProperty(
//             DIALOG_STATE_PROPERTY
//         );

//         this.userName = this.userState.createProperty(USER_NAME_PROP);

//         this.dialogs = new DialogSet(this.dialogState);

//         // Add prompts
//         this.dialogs.add(new TextPrompt(NAME_PROMPT));

//         // Create a dialog that asks the user for their name.
//         this.dialogs.add(
//             new WaterfallDialog(WHO_ARE_YOU, [
//                 this.askForName.bind(this),
//                 this.collectAndDisplayName.bind(this)
//             ])
//         );

//         // Create a dialog that displays a user name after it has been collected.
//         this.dialogs.add(
//             new WaterfallDialog(HELLO_USER, [this.displayName.bind(this)])
//         );
//     }

//     // The first step in this waterfall asks the user for their name.
//     async askForName(dc) {
//         await dc.prompt(NAME_PROMPT, `What is your name, human?`);
//     }

//     // The second step in this waterfall collects the response, stores it in
//     // the state accessor, then displays it.
//     async collectAndDisplayName(step) {
//         await this.userName.set(step.context, step.result);
//         await step.context.sendActivity(`Got it. You are ${ step.result }.`);
//         await step.endDialog();
//     }

//     // This step loads the user's name from state and displays it.
//     async displayName(step) {
//         const userName = await this.userName.get(step.context, null);
//         await step.context.sendActivity(`Your name is ${ userName }.`);
//         await step.endDialog();
//     }

//     /**
//      *
//      * @param {Object} context on turn context object.
//      */
//     async onTurn(turnContext) {
//         // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
//         if (turnContext.activity.type === ActivityTypes.Message) {
//             console.log('Message ...');
//             // Create dialog context
//             const dc = await this.dialogs.createContext(turnContext);

//             // Continue the current dialog
//             await dc.continueDialog();
//             console.log('turnContext.responded = ', turnContext.responded);
//             // Show menu if no response sent
//             if (!turnContext.responded) {
//                 const userName = await this.userName.get(dc.context, null);
//                 console.log('userName = ', userName);
//                 if (userName) {
//                     await dc.beginDialog(HELLO_USER);
//                 } else {
//                     await dc.beginDialog(WHO_ARE_YOU);
//                 }
//             }
//         }

//         // Save changes to the user name.
//         await this.userState.saveChanges(turnContext);

//         // End this turn by saving changes to the conversation state.
//         await this.conversationState.saveChanges(turnContext);
//     }
// }

// module.exports.MyBot = DialogBot;
