"use strict";
let sheet = window.document.styleSheets[0];
let initialPositionForCssRules = sheet.cssRules.length;
let hasCreatedOnce = false;

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

function listener() {
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
        + "&nodecay=" + document.getElementById("nodecayModeCheckbox").checked.toString();
    if (hasCreatedOnce) {
        sheet.deleteRule(initialPositionForCssRules);
        sheet.deleteRule(initialPositionForCssRules);
        sheet.deleteRule(initialPositionForCssRules);
    }
    sheet.insertRule("#jumpBar {background-color: " + document.getElementById("fillColor").value + "}", initialPositionForCssRules);
    sheet.insertRule("#jumpBar {color: " + document.getElementById("textColor").value + "}", initialPositionForCssRules);
    sheet.insertRule(".progress {background-color: " + document.getElementById("bgColor").value + "}", initialPositionForCssRules);
    hasCreatedOnce = true;
    console.log(sheet.cssRules[initialPositionForCssRules].cssText);
    console.log(sheet.cssRules[initialPositionForCssRules + 1].cssText);
    console.log(sheet.cssRules[initialPositionForCssRules + 2].cssText);
    document.getElementById("cssOutput").value =
        sheet.cssRules[initialPositionForCssRules].cssText + " "
        + sheet.cssRules[initialPositionForCssRules + 1].cssText + " "
        + sheet.cssRules[initialPositionForCssRules + 2].cssText;
}

let form = document.getElementById("configForm");
form.addEventListener("input", listener);
listener();

document.addEventListener("dragstart", e => {
    e.dataTransfer.setDragImage(document.querySelector('#obsDrag'), 30, 30);
    e.dataTransfer.setData("text/uri-list", document.getElementById("output").value + "&layer-name=Point Bar&layer-width=1200&layer-height=150")
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
