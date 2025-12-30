import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyAjSxFPJ0Ym8u4B0t1n8BQ52wFrfg8l-r8",
    authDomain: "niigata-game.firebaseapp.com",
    projectId: "niigata-game",
    storageBucket: "niigata-game.firebasestorage.app",
    messagingSenderId: "256281746306",
    appId: "1:256281746306:web:bb3823e7e8f7f769870d9b",
    measurementId: "G-JKCRVL23K0"
};

// 初期化
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
let yardChecked = false;
let artChecked = false;
let scheduleChecked = false;

// --- ログイン監視 ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("セッションが切れました。再度ログインしてください。");
    window.location.href = 'index.html';
  } else {
    console.log("第2話 ログイン中:", user.email);
  }
});

// --- 進捗保存 ---
async function saveProgressToFirebase(nextLevel) {
  const user = auth.currentUser;
  if (user) {
    try {
      await setDoc(doc(db, "users", user.uid), {
        unlockedEpisodes: nextLevel
      }, { merge: true });
      console.log("データベースに保存しました。解放レベル:", nextLevel);
    } catch (e) {
      console.error("保存エラー:", e);
    }
  }
}

/* --- 共通関数 --- */
function yuiSay(text) {
  yuiTextEl.textContent = text;
}

function addEvidence(text) {
  if (!evidence.includes(text)) {
    evidence.push(text);
    renderEvidence();
    checkAllEvidence(); // 証拠が揃ったか判定
  }
}

function renderEvidence() {
  evidenceEl.innerHTML = evidence.map(e => `・${e}`).join('<br>');
}

function checkAllEvidence() {
  // 全ての調査ポイントが完了したらボタンを表示
  if (yardChecked && artChecked && scheduleChecked) {
    conclusionArea.style.display = 'block';
  }
}

function setScene(text, choices = [], image = null) {
  // 結論ボタンは基本隠す(checkAllEvidenceで必要時のみ出す)
  conclusionArea.style.display = 'none';
  checkAllEvidence();

  textEl.innerHTML = text;
  choicesEl.innerHTML = '';
  imageEl.innerHTML = '';

  if (image) {
    const img = document.createElement('img');
    img.src = image;
    imageEl.appendChild(img);
  }

  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c.label;
    btn.onclick = c.onClick;
    choicesEl.appendChild(btn);
  });
}

/* --- ストーリー展開 --- */
function startEpisode2() {
  yuiSay('夜の校舎……何かが隠されている気がする。');
  setScene(
    '北越高校の校庭。雪が降り積もっている。',
    [],
      'img/2話校庭.png',
    [
      { label: '校庭を調べる',
        x: '0%',
        y: '60%',
        w: '100%',
        h: '40%', 
        onClick: inspectYard 
      },
      { label: '校舎内に入る',
        x: '30%',
        y: '20%',
        w: '40%',
        h: '20%',
        onClick: inspectInside 
      }
    ],
  );
}

function inspectYard() {
  yardChecked = true;
  addEvidence('融雪装置に残った足跡');
  yuiSay('この足跡、雪が溶ける前に付けられたものね。');
  setScene(
    '融雪装置の近くに、不自然な足跡が残っている。',
    [{ label: '戻る', onClick: startEpisode2 }],
    'img/2話足跡.png'
  );
}

function inspectInside() {
  setScene(
    '静まり返った校舎内。どこへ向かう？',
    [ { label: '校庭へ戻る', onClick: startEpisode2 }],
    'img/2話校舎内.png',
    [
      { label: '美術室へ', 
        x: '0%',
        y: '30%',
        w: '20%',
        h: '40%',
        onClick: inspectArtRoom },
      { label: '職員室へ', 
        x: '80%',
        y: '30%',
        w: '20%',
        h: '40%',
        onClick: inspectSchedule },
    ]
  );
}

function inspectArtRoom() {
  artChecked = true;
  addEvidence('不自然に動かされた彫刻台');
  yuiSay('彫刻台が動かされた跡がある。重いはずなのに。');
  setScene(
    '美術室。彫刻台の位置が不自然にずれている。',
    [{ label: '戻る', onClick: inspectInside }],
    'img/2話美術室.png'
  );
}

function inspectSchedule() {
  scheduleChecked = true;
  addEvidence('改ざんされた教師のスケジュール帳');
  yuiSay('この時間……書き換えられてる。');
  setScene(
    '職員室。顧問教師のスケジュール帳に改ざんの痕跡がある。',
    [{ label: '戻る', onClick: inspectInside }],
    'img/2話職員室.png'
  );
}

/* --- 結論パート --- */
conclusionBtn.onclick = () => {
  yuiSay('どの証拠が決め手だった？');
  setScene(
    'これは事故だったのか？',
    [
      { label: '融雪装置に残った足跡', onClick: () => showEnding2(true) },
      { label: '彫刻台の位置', onClick: () => showEnding2(false) },
      { label: '雪が多かった', onClick: () => showEnding2(false) }
    ]
  );
};

function showEnding2(isCorrect) {
  if (isCorrect) {
    yuiSay('事故じゃない……計画的だった。');
    setScene(
      '犯人は融雪装置のタイマーを逆手に取り、アリバイを作っていた。<br>第2話 クリア！',
      [{ label: '話数選択へ戻る', onClick: () => { window.location.href = 'select.html'; } }]
    );
    saveProgressToFirebase(3); // 第3話を解放
  } else {
    yuiSay('それは決定的な証拠にはならないわ。');
  }
}

// ゲーム開始
startEpisode2();