const resolutionSelect = document.getElementById(`resolution`);
const frameRateSelect = document.getElementById(`frame-rate`);
const message = document.getElementById(`message-container`);
const asciiImage = document.getElementById(`ascii-image`);
const button = document.getElementById(`button`);
const canvas = document.getElementById(`canvas`);
const video = document.querySelector(`video`);
const ctx = canvas.getContext(`2d`);

let timeoutID, desiredWidth, width = 320, height = 240, frameRate = 30;
let characterRamp = ' .,:;i1tfLCG08@';

function getGrayscaleValue(r, g, b) {
    return (0.3 * r) + (0.59 * g) + (0.11 * b);
}

function getCharacter(grayscaleValue) {
    if (grayscaleValue == 255) return characterRamp[characterRamp.length - 1];

    let charIndex = Math.floor(grayscaleValue * characterRamp.length / 255);
    let retVal = characterRamp[charIndex];
    return retVal;
};

function getAscii() {
    let imageData = ctx.getImageData(0, 0, width, height), asciiText = ``;
    for (let i = 0; i < imageData.data.length; i += 4) {
        let newLine = width * 4;

        if (i % newLine === 0 && i !== 0) asciiText += `\n`;

        let grayscaleValue = getGrayscaleValue(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]);
        let char = getCharacter(grayscaleValue);

        asciiText += char;
    };

    return asciiText;
};

function produceImage() {
    let resOption = resolutionSelect.value.split(`x`);
    
    width = resOption[0]; height = resOption[1];
    canvas.width = width; canvas.height = height;

    let fontSize = 500 / height;
    
    fontSize = fontSize.toString() + `px`;
    asciiImage.style.fontSize = fontSize;

    ctx.drawImage(video, 0, 0, width, height);
    asciiImage.textContent = getAscii();

    let rateOption = Number(frameRateSelect.value);
    timeoutID = window.setTimeout(produceImage, 1000/rateOption);
};

function pauseVideo() {
    window.clearTimeout(timeoutID);
};

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

if (navigator.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((mediaStream) => {
    
        video.srcObject = mediaStream; 
        message.style.display = `none`; 
        
        produceImage();
    }).catch(error => console.error(error));
} else {
    message.textContent = `Your browser does not support getUserMedia`;
};

button.addEventListener(`click`, function () {
    if (button.value == `Resume Video`) {
        produceImage(); button.value = `Pause Video`;
    } else {
        pauseVideo(); button.value = `Resume Video`;
    };
});
