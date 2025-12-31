const fingerIndices = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20]
};

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function isFingerExtended(landmarks, key) {
  const [mcp, pip, dip, tip] = fingerIndices[key].map((i) => landmarks[i]);
  if (!mcp || !pip || !dip || !tip) return false;
  const vertical = mcp.y - tip.y > 0.1;
  const straight = distance(tip, pip) > distance(pip, mcp) * 0.8;
  return vertical && straight;
}

function isThumbOpen(landmarks) {
  const wrist = landmarks[0];
  const tip = landmarks[4];
  const ip = landmarks[3];
  if (!wrist || !tip || !ip) return false;
  const deltaX = Math.abs(tip.x - wrist.x);
  const deltaY = Math.abs(tip.y - wrist.y);
  return deltaX > deltaY && distance(tip, wrist) > distance(ip, wrist) * 1.05;
}

export function detectGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const thumb = isThumbOpen(landmarks);
  const index = isFingerExtended(landmarks, 'index');
  const middle = isFingerExtended(landmarks, 'middle');
  const ring = isFingerExtended(landmarks, 'ring');
  const pinky = isFingerExtended(landmarks, 'pinky');

  const openPalm = thumb && index && middle && ring && pinky;

  const fistDistance =
    distance(landmarks[8], landmarks[0]) +
    distance(landmarks[12], landmarks[0]) +
    distance(landmarks[16], landmarks[0]) +
    distance(landmarks[20], landmarks[0]);
  const fistReference =
    distance(landmarks[5], landmarks[0]) +
    distance(landmarks[9], landmarks[0]) +
    distance(landmarks[13], landmarks[0]) +
    distance(landmarks[17], landmarks[0]);

  const fist = fistDistance < fistReference * 0.7;

  if (openPalm) return 'openPalm';
  if (fist) return 'fist';
  return null;
}
