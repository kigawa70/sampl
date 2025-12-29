const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const imageEl = document.getElementById('sceneImage');
const evidenceEl = document.getElementById('evidence');
const yuiTextEl = document.getElementById('yuiText');
const conclusionArea = document.getElementById('conclusionArea');
const conclusionBtn = document.getElementById('conclusionBtn');


let evidence = [];

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
      }

    ]
  );
}

function inspectRoom() {
  yuiSay('畳の部屋……窓の外はすぐ海だね。');

  setScene(
    '施錠された客室。<br>ネックレスはどこへ消えたのか。',
    [],
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
  addEvidence('床に残った不自然な砂');
  yuiSay('風向きと逆……これは自然じゃない。');

  setScene(
    '床の隅に、乾いた白砂が集まっている。<br>' +
    'まるで、誰かがここで何かを落としたかのようだ。',
    [],
    'img/1話客室.png',
    [
      {
        label: '戻る',
        x: '0%',
        y: '0%',
        w: '100%',
        h: '100%',
        onClick: showInn2
      }
    ]
  );
}

function showInn2() {
  yuiSay('ここが民宿だね。部屋はあそこかな。');

  setScene(
    '新潟市・関屋浜近くの民宿。',
    [],
    'img/1話昼.png',
    [
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


function inspectVeranda() {
  addEvidence('海風と逆方向に残る砂');

  yuiSay('風は海から陸に吹いてる……なのに砂は逆。');

  setScene(
    'ベランダに出ると、強い海風が吹き抜ける。<br>' +
    '砂の流れは、室内のものと一致しない。',
    [],
    'img/1話ベランダ.png',
    [
      {
        label: '戻る',
        x: '0%',
        y: '0%',
        w: '100%',
        h: '100%',
        onClick: showInn3
      }
    ]
  );
}

function showInn3() {
  yuiSay('ここが民宿だね。部屋はあそこかな。');

  setScene(
    '新潟市・関屋浜近くの民宿。',
    [],
    'img/1話昼.png'
  );
  conclusionArea.style.display = 'block';
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

    // 🏆 第2話をアンロックする処理を追加
    const saveKey = 'niigata_progress';
    const progress = JSON.parse(localStorage.getItem(saveKey)) || { unlockedEpisodes: 1 };
    
    // 現在のアンロック数が1なら、2に更新する
    if (progress.unlockedEpisodes < 2) {
      progress.unlockedEpisodes = 2;
      localStorage.setItem(saveKey, JSON.stringify(progress));
    }
    // ------------------------------------

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
          onClick: showInn3
        }
      ]
    );
  }
}

/* ===== 開始 ===== */
startEpisode();