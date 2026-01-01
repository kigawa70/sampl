import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase設定（episode3.jsと同様）
const firebaseConfig = { 
    apiKey: "AIzaSyAjSxFPJ0Ym8u4B0t1n8BQ52wFrfg8l-r8",
    authDomain: "niigata-game.firebaseapp.com",
    projectId: "niigata-game",
    storageBucket: "niigata-game.firebasestorage.app",
    messagingSenderId: "256281746306",
    appId: "1:256281746306:web:bb3823e7e8f7f769870d9b",
    measurementId: "G-JKCRVL23K0"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const imageEl = document.getElementById('sceneImage');
const evidenceEl = document.getElementById('evidence');
const yuiTextEl = document.getElementById('yuiText');
const conclusionArea = document.getElementById('conclusionArea');
const conclusionBtn = document.getElementById('conclusionBtn');

let evidence = [];
let hasTape = false;
let hasTicket = false;
let hasPhoto = false;

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'index.html';
});

async function saveProgress(nextLevel) {
  const user = auth.currentUser;
  if (user) {
    const docRef = doc(db, "users", user.uid);
    try {
      const docSnap = await getDoc(docRef);
      let currentUnlockedLevel = docSnap.exists() ? docSnap.data().unlockedEpisodes || 1 : 1;
      if (nextLevel > currentUnlockedLevel) {
        await setDoc(docRef, { unlockedEpisodes: nextLevel }, { merge: true });
      }
    } catch (e) { console.error("保存失敗:", e); }
  }
}

function yuiSay(text) { yuiTextEl.textContent = text; }

function addEvidence(text) {
  if (!evidence.includes(text)) {
    evidence.push(text);
    evidenceEl.innerHTML = evidence.map(e => `・${e}`).join('<br>');
    if (hasTape && hasTicket && hasPhoto) conclusionArea.style.display = 'block';
  }
}

function setScene(text, choices = [], image = null, hotspots = []) {
  textEl.innerHTML = text;
  choicesEl.innerHTML = '';
  imageEl.innerHTML = '';
  if (image) {
    imageEl.classList.add('scene-image');
    const img = document.createElement('img');
    img.src = image;
    imageEl.appendChild(img);
    hotspots.forEach(h => {
      const btn = document.createElement('button');
      btn.className = 'hotspot';
      Object.assign(btn.style, { left: h.x, top: h.y, width: h.w, height: h.h });
      btn.onclick = h.onClick;
      imageEl.appendChild(btn);
    });
  }
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c.label;
    btn.onclick = c.onClick;
    choicesEl.appendChild(btn);
  });
}

/* --- シーン展開 --- */

function startEpisode4() {
  yuiSay('信越本線沿線で保護された男性……。何か重大なことを知っていそうね。');
  setScene(
    '病院の一室。男性は窓の外を眺めながら「アーカイブ…届けないと…」と呟いている。',
    [],
    'img/4話病院.png',
    [
      { label: '男性と話す', x: '40%', y: '30%', w: '20%', h: '40%', onClick: talkToMan }
    ]
  );
}

function talkToMan() {
  setScene(
    '彼は混乱している。持ち物を調べれば何か思い出してくれるかもしれない。',
    [{ label: '病室を出る', onClick: startEpisode4 }],
    'img/4話持ち物.png',
    [
      { label: 'カバン', x: '20%', y: '60%', w: '20%', h: '20%', onClick: inspectBag },
      { label: '古いテープレコーダー', x: '50%', y: '50%', w: '20%', h: '20%', onClick: inspectRecorder },
      { label: '上着のポケット', x: '70%', y: '40%', w: '15%', h: '20%', onClick: inspectPocket }
    ]
  );
}

function inspectRecorder() {
  hasTape = true;
  addEvidence('1964年新潟地震の証言音声');
  yuiSay('「地盤沈下が始まった…あの資料を隠せ」……これ、事件の核心じゃない？');
  setScene('レコーダーを再生すると、騒音と共に緊迫した男の声が聞こえてきた。', [{ label: '戻る', onClick: talkToMan }],'img/4話レコーダー.png');
}

function inspectPocket() {
  hasTicket = true;
  addEvidence('1964年の日付の切符');
  yuiSay('50年以上前の切符を、なぜ今も持っているのかしら…？');
  setScene('ボロボロになった切符には、昭和39年の日付が刻印されている。', [{ label: '戻る', onClick: talkToMan }],'img/4話切符.png');
}

function inspectBag() {
  hasPhoto = true;
  addEvidence('主人公の家族が写った写真');
  yuiSay('ちょっと待って、これあなたの家族じゃない！？どうして彼が…？');
  setScene('写真の裏には「1964年 港湾倉庫にて」と記されていた。', [{ label: '戻る', onClick: talkToMan }],'img/4話写真.png');
}

conclusionBtn.onclick = () => {
  yuiSay('この男性は何をしようとしていたんだと思う？');
  setScene(
    '全ての証拠から導き出される、彼の正体と目的は？',
    [
      { label: '単なる歴史愛好家', onClick: () => showEnding4(false) },
      { label: 'アーカイブの守護者', onClick: () => showEnding4(true) },
      { label: '地震の被害者遺族', onClick: () => showEnding4(false) }
    ]
  );
};

function showEnding4(isCorrect) {
  if (isCorrect) {
    yuiSay('そうね。彼は震災から現代まで、アーカイブを命がけで守ってきたのよ。');
    setScene(
      'しかし、背後に忍び寄る影が…。男性が命を狙われている理由が判明した。<br>第4話 クリア！',
      [{ label: '最終話へ進む', onClick: () => { window.location.href = 'select.html'; } }]
    );
    saveProgress(5);
  } else {
    yuiSay('彼の持っていた「写真」の意味をもう一度考えてみて。');
  }
}

startEpisode4();