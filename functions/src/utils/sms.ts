const Nexmo = require("nexmo");
import * as functions from "firebase-functions";


const nexmo = new Nexmo({
    apiKey: functions.config().nexmo.key,
    apiSecret: functions.config().nexmo.secret,
});

export const sendSMS = (from: string, text: string, to: string) => {
    return new Promise((resolve) => {
        // @ts-ignore
        nexmo.message.sendSms(from, "4550334072", text, (err, responseData) => {
            if (err) {
                resolve({ status: "NOT OK" });
            } else {
                if (responseData.messages[0]["status"] === "0") {
                    resolve({ status: "OK" });
                } else {
                    // @ts-ignore
                    console.log(
                        `Message failed with error: ${responseData.messages[0]["error-text"]}`
                    );
                    resolve({ status: "NOT OK" });
                }
            }
        });
    });
};
