import { ref } from "vue";

/**
 * 消息提示音 + 语音播报
 *
 * 设计要点：
 * - 音效用 Web Audio 现场合成，不落地任何音频文件，也不引入播放器库
 * - 语音用浏览器内置 Web Speech API，离线可用、不联网、无费用
 * - AudioContext 与语音引擎都是模块级单例：每次调用都 new 一个会被浏览器限流
 * - 浏览器要求页面先发生过用户手势才允许出声，因此模块加载时挂一次性的
 *   解锁监听，播放失败一律静默吞掉，不弹提示
 */

const MUTE_STORAGE_KEY = "message-sound-muted";
const SOUND_THROTTLE = 1500;
const SPEECH_THROTTLE = 3000;
const SPEECH_DELAY = 550;

/**
 * 播报文案写死在前端：后端下发的 content 是「订单催单提醒」这类短标签，
 * 直接朗读不通顺，且后端改文案不该影响播报措辞
 */
const SPEECH_TEXT: Record<number, string> = {
  1: "您有新的订单，请及时处理",
  2: "有顾客催单了，请尽快处理",
};

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const isMuted = ref(readMuted());

let audioCtx: AudioContext | null = null;
let unlocked = false;
let lastSoundAt = 0;
let lastSpeakText = "";
let lastSpeakAt = 0;
let zhVoice: SpeechSynthesisVoice | null = null;
const timers = new Set<ReturnType<typeof setTimeout>>();

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function unlock() {
  unlocked = true;
  ensureContext()
    ?.resume()
    .catch(() => {});
  document.removeEventListener("pointerdown", unlock);
  document.removeEventListener("keydown", unlock);
}

/**
 * 单个音符：正弦波 + 音量包络，避免方波那种刺耳的电子音
 */
function tone(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(0.18, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

function playTone(type: number) {
  const ctx = ensureContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  if (!unlocked) unlock();

  try {
    const t0 = ctx.currentTime + 0.02;
    if (type === 1) {
      // 新订单：双音上扬，更醒目
      tone(ctx, 880, t0, 0.18);
      tone(ctx, 1320, t0 + 0.18, 0.28);
    } else {
      // 催单：三连急促音
      tone(ctx, 1046, t0, 0.1);
      tone(ctx, 1046, t0 + 0.14, 0.1);
      tone(ctx, 1046, t0 + 0.28, 0.1);
    }
  } catch {
    // 出声失败不影响业务
  }
}

function refreshVoices() {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const voices = synth.getVoices();
  const found =
    voices.find((v) => v.lang === "zh-CN") ??
    voices.find((v) => v.lang?.toLowerCase().startsWith("zh"));
  if (found) zhVoice = found;
}

/**
 * 播报：先 cancel 再 resume，规避 Chrome 长期不播报后引擎挂起的老问题
 */
function speak(text: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  const voices = synth.getVoices();
  if (voices.length > 0) {
    refreshVoices();
    // 系统没装中文语音包时只保留音效，不做任何提示
    if (!zhVoice) return;
  }

  try {
    synth.cancel();
    synth.resume();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    if (zhVoice) utterance.voice = zhVoice;
    synth.speak(utterance);
  } catch {
    // 播报失败不影响业务
  }
}

/**
 * 语音独立节流：同一句话 3 秒内不重复播报；
 * 不同内容则打断当前播报立刻替换，保证语音永远反映最新事件
 */
function speakIfNeeded(text: string) {
  const now = Date.now();
  if (text === lastSpeakText && now - lastSpeakAt < SPEECH_THROTTLE) return;
  lastSpeakText = text;
  lastSpeakAt = now;
  speak(text);
}

function clearTimers() {
  timers.forEach((id) => clearTimeout(id));
  timers.clear();
}

/**
 * 播放提醒：先音效抓注意力，再语音报内容
 * @param type 1=新订单 2=催单
 */
function play(type: number) {
  if (isMuted.value) return;

  const now = Date.now();
  if (now - lastSoundAt >= SOUND_THROTTLE) {
    lastSoundAt = now;
    playTone(type);
  }

  const text = SPEECH_TEXT[type];
  if (!text) return;

  const timer = setTimeout(() => {
    timers.delete(timer);
    speakIfNeeded(text);
  }, SPEECH_DELAY);
  timers.add(timer);
}

function setMuted(value: boolean) {
  isMuted.value = value;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // 隐私模式下写不进去，仅本次会话生效
  }
  if (value) {
    clearTimers();
    window.speechSynthesis?.cancel();
  }
}

function toggleMute() {
  setMuted(!isMuted.value);
}

/**
 * 解锁监听只在模块加载时挂一次；刷新页面后若用户还没点过任何东西，
 * 第一条消息的出声会被浏览器拦截，这里靠首次手势补上
 */
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}

export function useNotificationSound() {
  return { isMuted, play, setMuted, toggleMute };
}
