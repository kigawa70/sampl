import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase設定 (既存のものを利用)
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

// DOM要素
const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const imageEl = document.getElementById('sceneImage');
const evidenceEl = document.getElementById('evidence');
const yuiTextEl = document.getElementById('yuiText');
const conclusionArea = document.getElementById('conclusionArea');
const conclusionBtn = document.getElementById('conclusionBtn');

let evidence = [];
let hasKey = false;
let hasAudio = false;
let hasPendant = false;

// ログイン監視
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'index.html';
});

function yuiSay(text) { yuiTextEl.textContent = text; }

function addEvidence(text) {
  if (!evidence.includes(text)) {
    evidence.push(text);
    evidenceEl.innerHTML = evidence.map(e => `・${e}`).join('<br>');
    if (hasKey && hasAudio && hasPendant) conclusionArea.style.display = 'block';
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

function startFinalEpisode() {
  yuiSay('ついにここまで来たわね。信濃川河口、あの古い倉庫が全ての終着点よ。');
  setScene(
    '雪の降る港湾地区。霧の向こうに黒い影が見える。',
    [{ label: '倉庫へ近づく', onClick: inspectWarehouse }],
    'img/5話倉庫外観.png'
  );
}

function inspectWarehouse() {
  setScene(
    '内部は冷え切っている。何者かの気配がする…。',
    [],
    'img/5話倉庫内部.png',
    [
      { label: '古い金庫', x: '10%', y: '60%', w: '20%', h: '30%', onClick: findKey },
      { label: 'PC端末', x: '40%', y: '40%', w: '20%', h: '20%', onClick: findAudio },
      { label: '倒れた机', x: '70%', y: '65%', w: '20%', h: '20%', onClick: findPendant }
    ]
  );
}

function findKey() {
  hasKey = true;
  addEvidence('アーカイブ保管庫の鍵');
  yuiSay('4話の男性が言っていたのは、このことだったのね！');
  setScene('埃を被った金庫の中に、重厚な真鍮の鍵が入っていた。', [{ label: '戻る', onClick: inspectWarehouse }], 'img/5話鍵.png');
}

function findAudio() {
  hasAudio = true;
  addEvidence('黒幕の指示音声');
  yuiSay('この声…3話のオークション会場にいたあの男よ！');
  setScene('放置されたPCから、証拠隠滅を指示する音声データが見つかった。', [{ label: '戻る', onClick: inspectWarehouse }], 'img/5話音声.png');
}

function findPendant() {
  hasPendant = true;
  addEvidence('家族の古いペンダント');
  yuiSay('1話のネックレスと同じ模様…これがアーカイブの暗号を解く鍵なんだわ。');
  setScene('瓦礫の下から、主人公の家族が持っていたはずの遺品が見つかった。', [{ label: '戻る', onClick: inspectWarehouse }], 'img/5話ペンダント.png');
}

/* --- クライマックス --- */

conclusionBtn.onclick = () => {
  yuiSay('犯人が現れたわ！全ての証拠を突きつけて！');
  setScene(
    '黒幕「そのアーカイブを渡せ。それは闇に葬られるべき過去だ」',
    [
      { label: '真実を公表する', onClick: () => showEnding5('GOOD') },
      { label: 'アーカイブを破壊する', onClick: () => showEnding5('BITTER') },
      { label: '逃走を許す', onClick: () => showEnding5('BAD') }
    ]
  );
};

function showEnding5(type) {
  if (type === 'GOOD') {
    yuiSay('真実は雪の下には隠しきれない！');
    setScene(
      '【真相ルート：GOOD END】<br>アーカイブは保護され、50年前の不正が暴かれた。新潟の街に、本当の春が訪れる。',
      [{ label: 'タイトルへ戻る', onClick: () => { window.location.href = 'index.html'; } }]
    );
  } else if (type === 'BITTER') {
    yuiSay('これが犠牲を防ぐ唯一の道なの…？');
    setScene(
      '【代償ルート：BITTER END】<br>アーカイブは失われた。不正の証拠も消えたが、さらなる悲劇は防がれた。苦い勝利だ。',
      [{ label: 'タイトルへ戻る', onClick: () => { window.location.href = 'index.html'; } }]
    );
  } else {
    yuiSay('しまっ、逃げられた！？');
    setScene(
      '【誤推理ルート：BAD END】<br>黒幕はアーカイブと共に姿を消した。事件は迷宮入りとなり、真実は再び雪に埋もれた。',
      [{ label: 'もう一度挑戦', onClick: startFinalEpisode }]
    );
  }
}

startFinalEpisode();