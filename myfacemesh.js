

var pos_right_eye_up = [173, 157, 158, 159, 160, 161, 246];
var pos_right_eye_down = [155, 154, 153, 145, 144, 163, 7];

var pos_left_eye_up = [398, 384, 385, 386, 387, 388, 466];
var pos_left_eye_down = [382, 381, 380, 374, 373, 390, 249];

var pos_right_eyebrow = [107, 66, 105, 63, 70, 46, 53, 52, 65, 55];
//var pos_right_eye = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
var pos_right_eye = [243, 190, 56, 28, 27, 29, 30, 247, 130, 25, 110, 24, 23, 22, 26, 112];
var pos_left_eyebrow = [336, 296, 334, 293, 300, 276, 283, 283, 295, 285];
//var pos_left_eye = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];
var pos_left_eye = [463, 414, 286, 258, 257, 259, 260, 467, 359, 255, 339, 254, 253, 252, 256, 341];

var pos_mouth = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
var pos_nose = [2, 429, 6, 131];

var pos_face_outline = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 215, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

function onResults(results) {
    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            g_landmarks = landmarks;
            g_eye_openness.left = 0.0;
            g_eye_openness.right = 0.0;
            for (let i = 0; i < pos_right_eye_up.length; i++) {
                g_eye_openness.right +=
                    pow(landmarks[pos_right_eye_up[i]].x - landmarks[pos_right_eye_down[i]].x, 2) +
                    pow(landmarks[pos_right_eye_up[i]].y - landmarks[pos_right_eye_down[i]].y, 2)
                g_eye_openness.left +=
                    pow(landmarks[pos_left_eye_up[i]].x - landmarks[pos_left_eye_down[i]].x, 2) +
                    pow(landmarks[pos_left_eye_up[i]].y - landmarks[pos_left_eye_down[i]].y, 2)
            }

            g_eye_openness.right = sqrt(g_eye_openness.right);
            g_eye_openness.right_buffer.push(g_eye_openness.right);
            g_eye_openness.right_smooth = g_eye_openness.right_smooth + (g_eye_openness.right - g_eye_openness.right_smooth) * g_eye_openness.sensitivity;

            g_eye_openness.left_buffer.push(g_eye_openness.left);
            g_eye_openness.left = sqrt(g_eye_openness.left);
            g_eye_openness.left_smooth = g_eye_openness.left_smooth + (g_eye_openness.left - g_eye_openness.left_smooth) * g_eye_openness.sensitivity;
        }
        //console.log(g_eye_openness.isClosed());
        // console.log(g_eye_openness.left_smooth,
        //     g_eye_openness.right_smooth);
    }
}




// const camera = new Camera(videoElement, {
//     onFrame: async () => {
//         await faceMesh.send({ image: videoElement });
//     },
//     width: 1280,
//     height: 720
// });
var faceMesh;
var videoElement;
function startMediaPipeFaceMesh() {
    videoElement = document.createElement('video');// document.getElementsByClassName('input_video')[0];
    //videoElement = document.getElementsByClassName('input_video')[0];
    document.querySelector('body').appendChild(videoElement);
    videoElement.hidden = true;
    faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    faceMesh.onResults(onResults);

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await faceMesh.send({ image: videoElement });
        },
        audio: false,
        width: 1280,
        height: 720
        //deviceId: _deviceId
    });
    stream = camera.start();


}

function stopMediaPipeFaceMesh() {
    if (document.querySelector('video')) {
        let stream = videoElement.srcObject;
        window.cancelAnimationFrame(id_callback_camera_utils);
        stream.getTracks().forEach(track => track.stop())
        faceMesh.close();
        videoElement.remove();
        console.log('ended');
        console.log(document.querySelector('body'));
    }

}