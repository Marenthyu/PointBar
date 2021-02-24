"use strict";
let sheet = window.document.styleSheets[window.document.styleSheets.length-1];
let initialPositionForCssRules = sheet.cssRules.length;
let hasCreatedOnce = false;
let clientID = "nxkxsr40pk41esg5hs2kiwjxmfpsce";
let hash = document.location.hash;
let token = localStorage.getItem("twitchToken");
let twitchBtn = document.getElementsByClassName("btn-twitch")[0];
let twitchBtnInner = twitchBtn.innerHTML;
let initialized = false;

function hideDecay() {
    document.getElementById("nodecayModeCheckbox").checked = false;
    document.getElementById("decayDiv").style.display = "none";
}

function showDecay() {
    document.getElementById("decayDiv").style.display = "";
}

let explanationDict = {
    "jump": "Slowly drains the bar, triggering a sound effect when empty, then resets to full.",
    "hype": "Slowly drains the bar, triggering a sound effect if the bar gets completely filled, then resets to empty.",
    "tug": "Let your viewers choose a side and battle it out in a Tug of War - triggering a sound depending on the winning side, then resetting to 50/50.\n\n-----NOT YET IMPLEMENTED------\n"
}

function refreshOutput() {
    if (!initialized) {
        let savedType = localStorage.getItem("savedType") ? localStorage.getItem("savedType") : "jump";
        setType(savedType);
        document.getElementById("startInput").value = localStorage.getItem("savedStart") ? parseInt(localStorage.getItem("savedStart")) : 50;
        document.getElementById("soundFileLinkInput").value = localStorage.getItem("savedFile") ? localStorage.getItem("savedFile") : "https://lowee.de/2021-02-02_03-19-35.mp3";
        document.getElementById("intervalInput").value = localStorage.getItem("savedInterval") ? parseInt(localStorage.getItem("savedInterval")) : 1800;
        document.getElementById("redemptionPercentInput").value = localStorage.getItem("savedIncrease") ? parseFloat(localStorage.getItem("savedIncrease")) : 1;
        let savedBitsAllowed = localStorage.getItem("savedBitsAllowed") ? localStorage.getItem("savedBitsAllowed") : "false";
        document.getElementById("allowBitsCheckbox").checked = savedBitsAllowed === "true";
        document.getElementById("bitPercentInput").value = localStorage.getItem("savedPercentPerBit") ? parseFloat(localStorage.getItem("savedPercentPerBit")) : 1;
        document.getElementById("barTextInput").value = localStorage.getItem("savedText") ? localStorage.getItem("savedText") : "Jumpscare...?";
        let savedNoDecay = localStorage.getItem("savedNoDecay") ? localStorage.getItem("savedNoDecay") : "false";
        document.getElementById("nodecayModeCheckbox").checked = savedNoDecay === "true";

        document.getElementById("fillColor").value = localStorage.getItem("savedFillColor") ? localStorage.getItem("savedFillColor") : "#0d6efd";
        document.getElementById("bgColor").value = localStorage.getItem("savedBgColor") ? localStorage.getItem("savedBgColor") : "#808080";
        document.getElementById("textColor").value = localStorage.getItem("savedTextColor") ? localStorage.getItem("savedTextColor") : "#ffffff";
        document.getElementById("opacitySlider").value = localStorage.getItem("savedOpacity") ? localStorage.getItem("savedOpacity") : 0.5;

        initialized = true;
    }
    let location = document.location.toString().substring(0, document.location.toString().lastIndexOf("/"));
    let type = getType();
    switch (type) {
        case "tug": {
            hideDecay();
            break;
        }
        case "jump": {
            hideDecay();
            break;
        }
        case "hype": {
            showDecay();
            break;
        }
    }
    document.getElementById("modeExplanation").innerText = explanationDict[type];
    document.getElementById("output").value = location
        + "?start=" + document.getElementById("startInput").value
        + "&soundFile=" + encodeURIComponent(document.getElementById("soundFileLinkInput").value)
        + "&totalTime=" + document.getElementById("intervalInput").value
        + "&increase=" + document.getElementById("redemptionPercentInput").value
        + "&bits=" + document.getElementById("allowBitsCheckbox").checked.toString()
        + "&percentPerBit=" + document.getElementById("bitPercentInput").value
        + "&text=" + encodeURIComponent(document.getElementById("barTextInput").value)
        + "&type=" + type
        + "&nodecay=" + document.getElementById("nodecayModeCheckbox").checked.toString()
        + (token !== null && token !== "null" ? "#initial_token=" + token : "");

    if (hasCreatedOnce) {
        sheet.deleteRule(initialPositionForCssRules);
        sheet.deleteRule(initialPositionForCssRules);
        sheet.deleteRule(initialPositionForCssRules);
    }
    sheet.insertRule("#jumpBar {background-color: " + document.getElementById("fillColor").value + "}", initialPositionForCssRules);
    sheet.insertRule("#jumpBar {color: " + document.getElementById("textColor").value + "}", initialPositionForCssRules);
    sheet.insertRule(".progress {background-color: " + document.getElementById("bgColor").value + "}", initialPositionForCssRules);
    hasCreatedOnce = true;
    //console.log(sheet.cssRules[initialPositionForCssRules].cssText);
    let oldText = sheet.cssRules[initialPositionForCssRules].cssText;
    sheet.deleteRule(initialPositionForCssRules);
    sheet.insertRule(oldText.replace("rgb", "rgba").replace(");", "," + document.getElementById("opacitySlider").value + ");"), initialPositionForCssRules)
    //console.log(sheet.cssRules[initialPositionForCssRules].cssText);
    //console.log(sheet.cssRules[initialPositionForCssRules + 1].cssText);
    //console.log(sheet.cssRules[initialPositionForCssRules + 2].cssText);
    document.getElementById("cssOutput").value =
        sheet.cssRules[initialPositionForCssRules].cssText + " "
        + sheet.cssRules[initialPositionForCssRules + 1].cssText + " "
        + sheet.cssRules[initialPositionForCssRules + 2].cssText;

    localStorage.setItem("savedType", type);
    localStorage.setItem("savedStart", document.getElementById("startInput").value);
    localStorage.setItem("savedFile", document.getElementById("soundFileLinkInput").value);
    localStorage.setItem("savedInterval", document.getElementById("intervalInput").value);
    localStorage.setItem("savedIncrease", document.getElementById("redemptionPercentInput").value );
    localStorage.setItem("savedBitsAllowed", document.getElementById("allowBitsCheckbox").checked);
    localStorage.setItem("savedPercentPerBit", document.getElementById("bitPercentInput").value);
    localStorage.setItem("savedText", document.getElementById("barTextInput").value);
    localStorage.setItem("savedNoDecay", document.getElementById("nodecayModeCheckbox").checked);

    localStorage.setItem("savedFillColor", document.getElementById("fillColor").value);
    localStorage.setItem("savedBgColor", document.getElementById("bgColor").value);
    localStorage.setItem("savedTextColor", document.getElementById("textColor").value);
    localStorage.setItem("savedOpacity", document.getElementById("opacitySlider").value);

}

let form = document.getElementById("configForm");
form.addEventListener("input", refreshOutput);
refreshOutput();

document.addEventListener("dragstart", e => {
    e.dataTransfer.setDragImage(document.querySelector('#obsDrag'), 30, 30);
    let url = new URL(document.getElementById("output").value);
    url.searchParams.append("layer-name", "PointBar");
    url.searchParams.append("layer-width", "1200");
    url.searchParams.append("layer-height", "150");
    url.searchParams.append("layer-css", document.getElementById("cssOutput").value);
    e.dataTransfer.setData("text/uri-list",  url.toString());
});

function copyOutput() {
    /* Get the text field */
    let copyText = document.getElementById("output");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
}

function copyCSSOutput() {
    /* Get the text field */
    let copyText = document.getElementById("cssOutput");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
}

function getType() {
    let types = document.getElementsByName("modeRadio");
    for (let type of types) {
        if (type.checked) {
            return type.value;
        }
    }
}

function setType(type) {
    let types = document.getElementsByName("modeRadio");
    for (let t of types) {
        t.checked = t.value === type;
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
    } else {
        console.log("Got a token, verifying...");
        let verified = await verifyToken(token);
        if (verified) {
            console.log("Yay, we got a valid token!");
            document.getElementsByClassName("btn-twitch")[0].classList.add("btn-twitch-remove");
            twitchBtn.innerText = "Remove Twitch Login";
        } else {
            token = null;
            localStorage.setItem("twitchToken", token);
        }
    }
    refreshOutput();
}

let p = new Promise(main);
p.then();

async function verifyToken(tokenToVerify) {
    // noinspection DuplicatedCode
    try {
        let response = await fetch("https://id.twitch.tv/oauth2/validate", {headers: {"Authorization": "OAuth " + tokenToVerify}});
        let j = await response.json();
        console.log("Auth response: ");
        console.log(JSON.stringify(j));
        let hascpRead = false, hascpWrite = false, hasBitRead = false;
        if (j.status === 401) {
            return false
        }
        for (let scope of j.scopes) {
            if (scope === "bits:read") {
                hasBitRead = true;
            } else if (scope === "channel:read:redemptions") {
                hascpRead = true;
            } else if (scope === "channel:manage:redemptions") {
                hascpWrite = true;
            }
        }
        return hascpRead && hascpWrite && hasBitRead;

    } catch (e) {
        console.log("Error verifying...");
        console.error(e);
        return false;
    }
}

function addTwitchLogin() {
    if (token !== null) {
        token = null;
        localStorage.setItem("twitchToken", null);
        twitchBtn.classList.remove("btn-twitch-remove");
        twitchBtn.innerHTML = twitchBtnInner;

    } else {
        window.location = "https://id.twitch.tv/oauth2/authorize" +
            "?client_id=" + clientID +
            "&redirect_uri=" + encodeURI("https://marenthyu.de/twitch/jump/config") +
            "&response_type=token" +
            "&scope=channel:manage:redemptions+channel:read:redemptions+bits:read"
    }
    refreshOutput();

}

function testPlay(){
    try {
        let audio = new Audio(document.getElementById("soundFileLinkInput").value);
        audio.play().then(() => {
            document.getElementById("testBtn").innerText = "Playing...";
            let duration = audio.duration;
            setTimeout(() => {
                document.getElementById("testBtn").innerText = "Test this!";
            }, duration*1000)
        }).catch((e) => {
            playErrorHandler(e);
        });
    } catch(e) {
        playErrorHandler(e);
    }
    return false;
}

function playErrorHandler(e) {
    console.error(e);
    document.getElementById("testBtn").innerText = "ERROR. Try something else.";
    document.getElementById("testBtn").classList.remove("btn-primary");
    document.getElementById("testBtn").classList.add("btn-danger");
    setTimeout(() => {
        document.getElementById("testBtn").innerText = "Test this!";
        document.getElementById("testBtn").classList.remove("btn-danger");
        document.getElementById("testBtn").classList.add("btn-primary");
    }, 5000)
}
