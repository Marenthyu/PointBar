"use strict";

function listener()  {
    let location = document.location.toString().substring(0, document.location.toString().lastIndexOf("/"));
    document.getElementById("output").value = location
        + "?start=" + document.getElementById("startInput").value
        + "&soundFile=" + encodeURIComponent(document.getElementById("soundFileLinkInput").value)
        + "&totalTime=" + document.getElementById("intervalInput").value
        + "&increase=" + document.getElementById("redemptionPercentInput").value
        + "&bits=" + document.getElementById("allowBitsCheckbox").checked.toString()
        + "&percentPerBit=" + document.getElementById("bitPercentInput").value
        + "&text=" + encodeURIComponent(document.getElementById("barTextInput").value)
        + "&reverse=" + document.getElementById("reverseModeCheckbox").checked.toString();
}

let form = document.getElementById("configForm");
form.addEventListener("input", listener);
listener();

function copyOutput() {
    /* Get the text field */
    let copyText = document.getElementById("output");

    /* Select the text field */
    copyText.select();

    /* Copy the text inside the text field */
    document.execCommand("copy");
}
