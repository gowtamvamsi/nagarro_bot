// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActionTypes, ActivityTypes, CardFactory } = require('botbuilder');

class CardBot {
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            // build buttons to display.
            const buttons = [
                {
                    type: ActionTypes.ImBack,
                    title: '1. Inline Attachment',
                    value: '1'
                },
                {
                    type: ActionTypes.ImBack,
                    title: '2. Internet Attachment',
                    value: '2'
                },
                {
                    type: ActionTypes.ImBack,
                    title: '3. Uploaded Attachment',
                    value: '3'
                }
            ];

            // construct hero card.
            const card = CardFactory.heroCard(
                'Attachment',
                undefined,
                buttons,
                {
                    text:
                        'You can upload an image or select one of the following choices.'
                }
            );

            console.log(card);
            // add card to Activity.
            const reply = { type: ActivityTypes.Message };
            reply.attachments = [card];
            reply.text = 'SDsdsdsd';

            // Send hero card to the user.
            await turnContext.sendActivity(reply);
        }
    }
}

module.exports.MyBot = CardBot;
