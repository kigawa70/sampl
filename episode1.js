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
    const docRef = doc(db, "users", user.uid);
    
    try {
      // 1. 現在の進捗を取得
      const docSnap = await getDoc(docRef);
      let currentUnlockedLevel = 1;
      
      if (docSnap.exists()) {
        currentUnlockedLevel = docSnap.data().unlockedEpisodes || 1;
      }

      // 2. 新しいレベルが現在の進捗より高い場合のみ更新
      if (nextLevel > currentUnlockedLevel) {
        await setDoc(docRef, { 
          unlockedEpisodes: nextLevel 
        }, { merge: true });
        console.log(`進捗をレベル ${nextLevel} に更新しました。`);
      } else {
        console.log(`現在の進捗 (${currentUnlockedLevel}) が維持されました。`);
      }
    } catch (e) {
      console.error("進捗保存エラー:", e);
    }
  }
}

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
  if (sandChecked && kazeChecked) {
    conclusionArea.style.display = 'block';
  }
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

/* ===== シーン定義 ===== */

function startEpisode() {
  yuiSay('通報が入ったみたい。');

  setScene(
    '観光客の女性から通報が入った。<br>' +
    '「大切なネックレスが、施錠された部屋から消えたんです」',
    [
      { label: '現場へ向かう', onClick: showInn }
    ]
  );
}

function showInn() {
  yuiSay('ここが民宿だね。部屋はあそこかな。');

  setScene(
    '新潟市・関屋浜近くの民宿。',
    [],
    'img/1話昼.png',
    [
      {
        label: '客室に入る',
        x: '60%',
        y: '40%',
        w: '40%',
        h: '24%',
        onClick: inspectRoom
      },
      {
        label: '海を見る',
        x: '20%',
        y: '38%',
        w: '16%',
        h: '24%',
        onClick: inspectVeranda
      }
    ]
  );
}

function inspectRoom() {
  yuiSay('畳の部屋……窓の外はすぐ海だね。');

  setScene(
    '施錠された客室。<br>ネックレスはどこへ消えたのか。',
    [{label: '戻る', onClick: showInn}],
    'img/1話客室.png',
    [
      {
        label: '床を調べる',
        x: '0%',
        y: '70%',
        w: '100%',
        h: '30%',
        onClick: inspectFloor
      }
    ]
  );
}

function inspectFloor() {
  sandChecked = true;
  addEvidence('床に残った不自然な砂');
  yuiSay('風向きと逆……これは自然じゃない。');

  setScene(
    '床の隅に、乾いた白砂が集まっている。<br>' +
    'まるで、誰かがここで何かを落としたかのようだ。',
    [{label: '戻る', onClick: inspectRoom}],
    'img/1話砂.png'
  );
}




function inspectVeranda() {
  kazeChecked = true;
  addEvidence('海風と逆方向に残る砂');

  yuiSay('風は海から陸に吹いてる……なのに砂は逆。');

  setScene(
    'ベランダに出ると、強い海風が吹き抜ける。<br>' +
    '砂の流れは、室内のものと一致しない。',
    [{label: '戻る', onClick: showInn}],
    'img/1話ベランダ.png'
  );
}


conclusionBtn.onclick = () => {
  yuiSay('どの証拠が決め手だった？');

  setScene(
    '密室は、本当に成立していたのか？',
    [
      { label: '床の砂', onClick: () => showEnding(true) },
      { label: '海風の向き', onClick: () => showEnding(false) },
      { label: '関係ない', onClick: () => showEnding(false) }
    ]
  );
};


function showEnding(isCorrect) {
  if (isCorrect) {
    // ✅ 正解：第1話終了
    yuiSay('そう……あの砂が決定的だった。');

    setScene(
      '床に残った砂は、自然に入り込んだものではなかった。<br>' +
      '密室は最初から成立していなかったのだ。<br><br>' +
      '女性は、事故のショックでネックレスを隠していたことを認めた。',
      []
    );


    
    conclusionArea.style.display = 'none';

    saveProgressToFirebase(2);
    
    setTimeout(() => {
      yuiSay('この事件は、まだ序章にすぎない。');

      setScene(
        '第1話「白砂のネックレス」 完<br><br>' +
        '彼女が新潟に来た本当の目的――<br>' +
        'それは「失われたアーカイブ」を探すことだった。',
        [
          {
            label: '話数選択へ戻る',
            onClick: () => {
              window.location.href = 'select.html';
           }
          }
        ]
      );
    }, 1500);

  } else {
    // ❌ 不正解：進まない
    yuiSay('……それだけじゃ、決め手にはならないかな。');

    setScene(
      'その証拠だけでは、密室を崩すには不十分だ。',
      [
        {
          label: 'もう一度考える',
          onClick: showInn
        }
      ]
    );
  }
}

/* ===== 開始 ===== */
startEpisode();