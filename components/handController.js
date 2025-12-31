import { detectGesture } from '../lib/gesture.js';

const HANDS_ASSETS = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/';

async function loadHands() {
  const [{ Hands }, { Camera }] = await Promise.all([
    import(`${HANDS_ASSETS}hands.js`),
    import(`${HANDS_ASSETS}camera_utils.js`)
  ]);
  return { Hands, Camera };
}

export function createHandController(videoEl, {
  onOpenPalm,
  onFist,
  onStatus,
  maxFps = 18,
  holdMs = 380
}) {
  let camera;
  let hands;
  let lastProcess = 0;
  let holdType = null;
  let holdStart = 0;

  async function start() {
    try {
      onStatus?.('loading');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      videoEl.srcObject = stream;
      const { Hands, Camera } = await loadHands();

      hands = new Hands({
        locateFile: (file) => `${HANDS_ASSETS}${file}`
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        selfieMode: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results) => {
        const now = performance.now();
        if (now - lastProcess < 1000 / maxFps) return;
        lastProcess = now;
        const landmarks = results.multiHandLandmarks?.[0];
        const detected = detectGesture(landmarks);
        if (!detected) {
          holdType = null;
          return;
        }
        if (detected !== holdType) {
          holdType = detected;
          holdStart = now;
          return;
        }
        if (now - holdStart >= holdMs) {
          if (detected === 'openPalm') onOpenPalm?.();
          if (detected === 'fist') onFist?.();
          holdStart = now + 9999;
        }
      });

      camera = new Camera(videoEl, {
        onFrame: async () => {
          await hands.send({ image: videoEl });
        },
        width: 640,
        height: 480
      });
      camera.start();
      onStatus?.('ready');
    } catch (error) {
      console.error(error);
      onStatus?.('error', error);
    }
  }

  function stop() {
    camera?.stop();
    if (videoEl?.srcObject) {
      videoEl.srcObject.getTracks().forEach((t) => t.stop());
    }
  }

  return { start, stop };
}
