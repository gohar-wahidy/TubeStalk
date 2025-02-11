let video;
let stream;
let faceVisible = true;
let lastFaceState = null;
let lastDetectionTime = Date.now(); // Track the last time a face was detected
let faceDetectionCooldown = 1000; // 1 second cooldown to determine if face is really not detected

window.addEventListener("message", (event) => {
    if (event.source !== window) return; // Ensure the message is from this window

    if (event.data.action === "enableCamera") {
        enableCamera();
    } else if (event.data.action === "disableCamera") {
        disableCamera();
    }
});

// Function to check if the current URL is YouTube (on any page in youtube.com)
function checkYouTubeVideoURL() {
    return window.location.href.includes("youtube.com");
}

// Function to enable the camera and start face detection
async function enableCamera() {
    if (video) return; // Don't initialize the camera again if it's already running

    video = document.createElement("video");
    video.style.position = "fixed";
    video.style.top = "-1000px"; // Hide the video
    document.body.appendChild(video);

    // Request camera access
    await navigator.mediaDevices.getUserMedia({ video: true })
        .then((camStream) => {
            stream = camStream;
            video.srcObject = stream;
        })
        .catch((err) => console.error("Webcam access denied", err));

    // Wait for the video to load and start playing before initializing canvas and face detection
    video.onloadedmetadata = async () => {
        video.play();

        // Load the models after the video has started playing
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(chrome.runtime.getURL("models")),
            faceapi.nets.faceLandmark68Net.loadFromUri(chrome.runtime.getURL("models")),
            faceapi.nets.faceRecognitionNet.loadFromUri(chrome.runtime.getURL("models")),
        ]);

        checkFace(); // Start face detection once the video is ready
    };
}

// Function to disable the camera
async function disableCamera() {
    if (!video) return; // No video to stop if it's not running

    // Stop the camera stream and disable the video element
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.remove();
    video = null;
}

// Function to check if face is detected and control YouTube video playback
async function checkFace() {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    
    // Set canvas size same as video feed
    canvas.width = video.width;
    canvas.height = video.height;

    console.log('Starting face detection...');

    setInterval(async () => {
        if (video && video.readyState === 4 && !video.paused && !video.ended) {
            console.log('Detecting faces...');
            const detections = await faceapi.detectAllFaces(video)
                .withFaceLandmarks()
                .withFaceDescriptors();

            console.log(`Detections found: ${detections.length}`);

            // Clear the canvas before drawing
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

            let keyLandmarksVisible = false;

            detections.forEach(face => {
                const landmarks = face.landmarks;

                // Safely check if the necessary landmarks exist before accessing them
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                const nose = landmarks.getNose();
                const mouth = landmarks.getMouth();
                const leftEyebrow = landmarks.getLeftEyebrow ? landmarks.getLeftEyebrow() : null;
                const rightEyebrow = landmarks.getRightEyebrow ? landmarks.getRightEyebrow() : null;

                // Check if the eyes, nose, mouth, and eyebrows are visible
                const eyesVisible = leftEye.length > 0 && rightEye.length > 0;
                const noseVisible = nose.length > 0;
                const mouthVisible = mouth.length > 0;
                const eyebrowsVisible = (leftEyebrow && rightEyebrow) ? leftEyebrow.length > 0 && rightEyebrow.length > 0 : false;

                // If at least one key landmark (eyes, nose, mouth, or eyebrows) is visible, we consider the face detected
                if (eyesVisible || noseVisible || mouthVisible || eyebrowsVisible) {
                    keyLandmarksVisible = true;
                }
            });

            // If face is detected, resume the video
            if (keyLandmarksVisible) {
                console.log("Face detected");
                const youtubeVideo = document.querySelector('video');
                if (youtubeVideo.paused) {
                    youtubeVideo.play(); // Play the video if paused
                }
            } 
            // If no face detected, pause the video
            else {
                console.log("No face detected");
                const youtubeVideo = document.querySelector('video');
                if (!youtubeVideo.paused) {
                    youtubeVideo.pause(); // Pause the video if playing
                }
            }
        }
    }, 750); // Update the interval to 2000ms (2 seconds)
}

// Run the extension only if on any YouTube page
if (checkYouTubeVideoURL()) {
    console.log("YouTube page detected, running extension...");
    enableCamera(); // Start the extension's main functionality
} else {
    console.log("Not a YouTube page, extension inactive.");
}
