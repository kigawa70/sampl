import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {     
    apiKey: "AIzaSyAjSxFPJ0Ym8u4B0t1n8BQ52wFrfg8l-r8",
    authDomain: "niigata-game.firebaseapp.com",
    projectId: "niigata-game",
    storageBucket: "niigata-game.firebasestorage.app",
    messagingSenderId: "256281746306",
    appId: "1:256281746306:web:bb3823e7e8f7f769870d9b",
    measurementId: "G-JKCRVL23K0" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM要素の取得
const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const imageEl = document.getElementById('sceneImage');
const evidenceEl = document.getElementById('evidence');
const yuiTextEl = document.getElementById('yuiText');
const conclusionArea = document.getElementById('conclusionArea');
const conclusionBtn = document.getElementById('conclusionBtn');

let evidence = [];
let hasFilm = false;
let hasPaper = false;
let hasAuctionList = false;

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = 'index.html';
});

async function saveProgress(nextLevel) {
  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, "users", user.uid), { unlockedEpisodes: nextLevel }, { merge: true });
  }
}

function yuiSay(text) { yuiTextEl.textContent = text; }

function addEvidence(text) {
  if (!evidence.includes(text)) {
    evidence.push(text);
    evidenceEl.innerHTML = evidence.map(e => `・${e}`).join('<br>');
    if (hasFilm && hasPaper && hasAuctionList) conclusionArea.style.display = 'block';
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

function startEpisode3() {
  yuiSay('潜入成功ね。ここが噂の骨董オークション会場……。');
  setScene(
    '古町の雑居ビルの地下。高級そうな椅子が並んでいるが、奥の部屋で殺人が起きたという。',
    [{ label: '会場を調べる', onClick: inspectVenue }]
  );
}

function inspectVenue() {
  setScene(
    '争った跡がある。床には何かが散乱している。',
    [{ label: '入り口に戻る', onClick: startEpisode3 }],
    'img/3話オークション会場.png',
    [
      { label: 'ゴミ箱', x: '10%', y: '70%', w: '20%', h: '20%', onClick: inspectTrash },
      { label: '映写機', x: '70%', y: '30%', w: '20%', h: '30%', onClick: inspectProjector },
      { label: '受付', x: '40%', y: '40%', w: '20%', h: '20%', onClick: inspectDesk }
    ]
  );
}

function inspectTrash() {
  hasPaper = true;
  addEvidence('焦げた裏取引の書類');
  yuiSay('「アーカイブ」という単語が……半分焼けてる。');
  setScene('ゴミ箱の中に、不自然に焼かれた書類の残骸がある。', [{ label: '戻る', onClick: inspectVenue }]);
}

function inspectProjector() {
  hasFilm = true;
  addEvidence('50年前の8ミリフィルム');
  yuiSay('古い映像……新潟港の様子が映ってるわ。');
  setScene('映写機にセットされていたのは、当時の港の秘密取引を記録した映像だった。', [{ label: '戻る', onClick: inspectVenue }]);
}

function inspectDesk() {
  hasAuctionList = true;
  addEvidence('出品拒否されたリスト');
  yuiSay('これ、2話の顧問教師が探していた資料と同じじゃない？');
  setScene('受付の裏に、直前で出品が取り消された「極秘資料」のタイトルが記されていた。', [{ label: '戻る', onClick: inspectVenue }]);
}

conclusionBtn.onclick = () => {
  yuiSay('犯人の狙いは何だったと思う？');
  setScene(
    '現場の状況から導き出される真相は？',
    [
      { label: '金銭目的の強盗', onClick: () => showEnding3(false) },
      { label: '過去の不正の隠蔽', onClick: () => showEnding3(true) },
      { label: 'ただの痴情のもつれ', onClick: () => showEnding3(false) }
    ]
  );
};

function showEnding3(isCorrect) {
  if (isCorrect) {
    yuiSay('その通り。50年前の記録を闇に葬ろうとしたのね。');
    setScene(
      '犯人は、消えたアーカイブが公になることを恐れた権力者の代行者だった。<br>第3話 クリア！',
      [{ label: '次へ進む', onClick: () => { window.location.href = 'select.html'; } }]
    );
    saveProgress(4);
  } else {
    yuiSay('うーん、書類の内容をよく思い出して。');
  }
}

startEpisode3();