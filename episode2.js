import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js"; // 追加

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
const auth = getAuth(app); // 先に定義しておく
const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const imageEl = document.getElementById('sceneImage');
const evidenceEl = document.getElementById('evidence');
const yuiTextEl = document.getElementById('yuiText');
const conclusionArea = document.getElementById('conclusionArea');
const conclusionBtn = document.getElementById('conclusionBtn');

// 【重要】ログイン状態を監視する処理を追加
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // ログインしていない場合はログイン画面に戻す
    alert("セッションが切れました。再度ログインしてください。");
    window.location.href = 'index.html';
  } else {
    console.log("ログイン中:", user.email);
  }
});

let evidence = [];

async function saveProgressToFirebase(nextLevel) {
  // 動的にFirebaseの機能をインポート（既存のHTML構造を壊さないため）
  const { getFirestore, doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js");
  const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js");

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  if (user) {
    try {
      // データベースの users/ユーザーID の場所にある unlockedEpisodes を更新
      await setDoc(doc(db, "users", user.uid), {
        unlockedEpisodes: nextLevel
      }, { merge: true });
      console.log("データベースに保存しました。解放レベル:", nextLevel);
    } catch (e) {
      console.error("保存に失敗しました:", e);
    }
  } else {
    console.error("ログインしていないため保存できませんでした。");
  }
}

function yuiSay(text) {
  yuiTextEl.textContent = text;
}

function addEvidence(text) {
  if (!evidence.includes(text)) {
    evidence.push(text);
    renderEvidence();
  }
}

function renderEvidence() {
  evidenceEl.innerHTML = evidence.map(e => `・${e}`).join('<br>');
}

function setScene(text, choices = [], image = null, hotspots = []) {
  textEl.innerHTML = text;
  choicesEl.innerHTML = '';
  imageEl.innerHTML = '';
  imageEl.className = '';

  if (image) {
    imageEl.classList.add('scene-image');

    const img = document.createElement('img');
    img.src = image;
    imageEl.appendChild(img);

    hotspots.forEach(h => {
      const btn = document.createElement('button');
      btn.className = 'hotspot';
      btn.style.left = h.x;
      btn.style.top = h.y;
      btn.style.width = h.w;
      btn.style.height = h.h;
      btn.title = h.label;
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


/* --- ゲーム展開 --- */
function startEpisode2() {
  yuiSay('夜の校舎……何かが隠されている気がする。');
  setScene(
    '北越高校の校庭。雪が降り積もっている。',
    [
      { label: '校庭を調べる', onClick: inspectYard },
      { label: '校舎内に入る', onClick: inspectInside }
    ],
    'img/2話校庭.png'
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
    [
      { label: '美術室へ', onClick: inspectArtRoom },
      { label: '職員室へ', onClick: inspectSchedule },
      { label: '校庭へ戻る', onClick: startEpisode2 }
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