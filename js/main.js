"use strict";
let clientID = "nxkxsr40pk41esg5hs2kiwjxmfpsce";
let token = localStorage.getItem("twitchToken");
let rewardID = localStorage.getItem("rewardID");
let params = new URLSearchParams(window.location.search);
let userID;
let hash = document.location.hash;
let pubSub;
let bar = document.getElementById("jumpBar");
let percent = params.get("start") ? parseInt(params.get("start")) : 50;
let soundFile = params.get("soundFile") ? params.get("soundFile") : "https://lowee.de/2021-02-02_03-19-35.mp3";
let totalInterval = params.get("totalTime") ? parseInt(params.get("totalTime")) * 1000 : 30 * 60 * 1000;
let percentIncrease = params.get("increase") ? parseInt(params.get("increase")) : 5;
let allowBits = params.get("bits") === "true";
let percentPerBit = params.get("percentPerBit") ? parseInt(params.get("percentPerBit")) : 1;
let jumpText = params.get("text") ? params.get("text") : "Jumpscare....?"
let reverse = params.get("reverse") === "true";
let refreshRate = 10;
let rewardsText = "Refill Point Bar";
let rewardDescription = "Refills the \"Point Bar\" by " + percentIncrease + "%";
let debugStop = false;
let duration = 3;
bar.innerText = jumpText;
//bar.style.animationDuration = /*(1 / refreshRate) + */"0s";
//bar.style.animation = "none !important";

function redirectToAuth() {
    window.location = "https://id.twitch.tv/oauth2/authorize" +
        "?client_id=" + clientID +
        "&redirect_uri=" + encodeURI("https://marenthyu.de/twitch/jump") +
        "&response_type=token" +
        "&scope=channel:manage:redemptions+channel:read:redemptions+bits:read"
}

async function updateProgress(change) {
    let wasReset = false;
    percent = percent + change

    async function playSound() {
        let audio = new Audio("" + soundFile);
        await audio.play();
        duration = audio.duration;
    }

    if (!reverse) {
        if (percent <= 0) {
            // In default mode, hit 0. Play sound, reset progress.
            await playSound();
            percent = percent + 100;
            wasReset = true;
        }
        percent = Math.min(100, percent);
    }
    if (reverse) {
        if (percent >= 100) {
            // we are in reverse mode and hit 100
            await playSound();
            percent = percent - 100;
            bar.style.width = "100%";
            return true; // return prematurely to allow bar to sit at 100% for a moment
        } else if (percent <= 0) {
            percent = 0;
        }
    }
    bar.style.width = (percent).toString() + "%";
    return wasReset;
}

async function ping() {
    setTimeout(ping, 275000);
    try {
        pubSub.send(JSON.stringify({type: "PING"}));
    } catch (e) {
        //whetever
    }

}

async function main() {
    console.log("hash: " + hash);
    if (hash !== null && hash.startsWith("#")) {
        hash = hash.substr(1);
        for (let part of hash.split("&")) {
            let subparts = part.split("=");
            let key = subparts[0];
            let value = subparts[1];
            console.log(key + " = " + value);
            switch (key) {
                case "access_token": {
                    token = value;
                    localStorage.setItem("twitchToken", token);
                    break;
                }
            }
        }
    }
    if (token === null) {
        console.log("TOKEN WAS NULL");
        redirectToAuth();
    } else {
        console.log("Got a token, verifying...");
        try {
            let response = await fetch("https://id.twitch.tv/oauth2/validate", {headers: {"Authorization": "OAuth " + token}});
            let j = await response.json();
            console.log("Auth response: ");
            console.log(JSON.stringify(j));
            userID = j.user_id;
            let hascpRead = false, hascpWrite = false, hasBitRead = false;
            for (let scope of j.scopes) {
                if (scope === "bits:read") {
                    hasBitRead = true;
                } else if (scope === "channel:read:redemptions") {
                    hascpRead = true;
                } else if (scope === "channel:manage:redemptions") {
                    hascpWrite = true;
                }
            }
            if (!(hascpRead && hascpWrite && hasBitRead)) {
                redirectToAuth();
                return
            }
        } catch (e) {
            console.log("Error verifying...");
            console.error(e);
            redirectToAuth();
            return;
        }
        await setup();

    }
}

async function setup() {
    let found = false;
    if (rewardID !== null) {
        let rewardsResponse = await fetch("https://api.twitch.tv/helix/channel_points/custom_rewards?only_manageable_rewards=true&broadcaster_id=" + userID, {
            headers: {
                Authorization: "Bearer " + token,
                "Client-ID": clientID
            }
        });
        let j = await rewardsResponse.json();
        for (let d of j.data) {
            if (d.id === rewardID) {
                found = true;
                break;
            }
        }
    }
    if (!found) {
        try {
            let rewardsCreationResponse = await fetch("https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=" + userID, {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token,
                    "Client-ID": clientID,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: rewardsText,
                    cost: 1000,
                    is_enabled: false,
                    should_redemptions_skip_request_queue: true,
                    prompt: rewardDescription
                })
            });
            let j = await rewardsCreationResponse.json();
            rewardID = j.data[0].id;
            localStorage.setItem("rewardID", rewardID);
        } catch (e) {
            console.log("Something went wrong.");
            console.error(e);
            document.body.innerHTML = "Error setting up Channel Point Reward. Please make sure no reward with the name \"" + rewardsText + "\" exists!";
        }
    }
    if (rewardID === null) {
        return
    }
    pubSub = new WebSocket("wss://pubsub-edge.twitch.tv");
    pubSub.onmessage = async (event) => {
        // console.log(event.data);
        let data = JSON.parse(event.data);
        if (data.type === "MESSAGE") {
            let innerData = data.data;
            let message = JSON.parse(innerData.message);
            if (message.type === "reward-redeemed") {
                let redeemedData = message.data;
                let redemption = redeemedData.redemption;
                let reward = redemption.reward;
                if (reward.id === rewardID) {
                    console.log("Saved reward redeemed! Should increase progress bar now...");
                    percent = percent + percentIncrease;
                }
            } else if (message.message_type === "bits_event" && allowBits) {
                console.log("Cheer!");
                console.log(JSON.stringify(message));
                console.log(message.data.bits_used);
                percent = percent + (message.data.bits_used * percentPerBit);
            }
        }
    };
    pubSub.onopen = async (event) => {
        console.log("Connected to pubsub...");
        pubSub.send(JSON.stringify({
            type: "LISTEN",
            data: {topics: ["channel-points-channel-v1." + userID], auth_token: token}
        }));
        if (allowBits) {
            pubSub.send(JSON.stringify({
                type: "LISTEN",
                data: {topics: ["channel-bits-events-v2." + userID], auth_token: token}
            }));
        }
        setTimeout(ping, 275000);
        setTimeout(updateLoop, 1000);
        await updateProgress(0);
    };
}

async function updateLoop() {
    let wasReset = true;
    if (!debugStop) {
        wasReset = await updateProgress((-1 / refreshRate) * (100 / (totalInterval / 1000)));
    }
    setTimeout(updateLoop, wasReset ? (duration * 1000) : (1000 / refreshRate));
}

let p = new Promise(main);
p.then();
