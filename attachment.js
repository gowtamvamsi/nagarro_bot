// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

class AttachmentBot {
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Call function to get an attachment.
            const reply = { type: ActivityTypes.Message };
            reply.attachments = [this.getInternetAttachment()];
            reply.text = 'This is an internet attachment.';

            // Send hero card to the user.
            await turnContext.sendActivity(reply);
        }
    }

    /* function getInternetAttachment - Returns an attachment to be sent to the user from a HTTPS URL */
    getInternetAttachment() {
        return {
            name: 'online-image.png',
            contentType: 'image/png',
            contentUrl:
                'https://pngimage.net/wp-content/uploads/2018/06/online-png-2.png'
        };
    }
}

module.exports.MyBot = AttachmentBot;
