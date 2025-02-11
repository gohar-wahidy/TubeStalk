let video;
let stream;
let faceVisible = true;
let lastFaceState = null;
let lastDetectionTime = Date.now(); // Track the last time a face was detected
let faceDetectionCooldown = 1000; // 1 second cooldown to determine if face is really not detected

window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data.action === "enableCamera") {
        enableCamera();
    } else if (event.data.action === "disableCamera") {
        disableCamera();
    }
});

function checkYouTubeVideoURL() {
    return window.location.href.includes("youtube.com");
}

async function enableCamera() {
    if (video) return;

    video = document.createElement("video");
    video.style.position = "fixed";
    video.style.top = "-1000px";
    document.body.appendChild(video);

    await navigator.mediaDevices.getUserMedia({ video: true })
        .then((camStream) => {
            stream = camStream;
            video.srcObject = stream;
        })
        .catch((err) => console.error("Webcam access denied", err));

    video.onloadedmetadata = async () => {
        video.play();

        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(chrome.runtime.getURL("models")),
            faceapi.nets.faceLandmark68Net.loadFromUri(chrome.runtime.getURL("models")),
            faceapi.nets.faceRecognitionNet.loadFromUri(chrome.runtime.getURL("models")),
        ]);

        checkFace();
    };
}

async function disableCamera() {
    if (!video) return;

    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.remove();
    video = null;
}

async function checkFace() {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    
    canvas.width = video.width;
    canvas.height = video.height;

    // console.log('Starting face detection...');

    setInterval(async () => {
        if (video && video.readyState === 4 && !video.paused && !video.ended) {
            // console.log('Detecting faces...');
            const detections = await faceapi.detectAllFaces(video)
                .withFaceLandmarks()
                .withFaceDescriptors();

            // console.log(`Detections found: ${detections.length}`);

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

            let keyLandmarksVisible = false;

            detections.forEach(face => {
                const landmarks = face.landmarks;

                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();

                const eyesVisible = leftEye.length > 0 && rightEye.length > 0;

                if (eyesVisible) {
                    keyLandmarksVisible = true;
                }
            });

            if (keyLandmarksVisible) {
                // console.log("Face detected");
                const youtubeVideo = document.querySelector('video');
                if (youtubeVideo.paused) {
                    youtubeVideo.play();
                }
            } 

            else {
                // console.log("No face detected");
                const youtubeVideo = document.querySelector('video');
                if (!youtubeVideo.paused) {
                    youtubeVideo.pause();
                }
            }
        }
    }, 1000);
}

if (checkYouTubeVideoURL()) {
    // console.log("YouTube page detected, running extension...");
    enableCamera();
} else {
    // console.log("Not a YouTube page, extension inactive.");
}