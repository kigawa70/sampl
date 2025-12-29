const textEl = document.getElementById('text');
const choicesEl = document.getElementById('choices');
const imageEl = document.getElementById('sceneImage');
const evidenceEl = document.getElementById('evidence');
const yuiTextEl = document.getElementById('yuiText');
const conclusionArea = document.getElementById('conclusionArea');
const conclusionBtn = document.getElementById('conclusionBtn');

let evidence = [];

// 状態管理
let yardChecked = false;
let artChecked = false;
let scheduleChecked = false;

/* ===== 共通処理 ===== */

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
  conclusionArea.style.display = 'none';

  textEl.innerHTML = text;
  choicesEl.innerHTML = '';
  imageEl.innerHTML = '';

  if (image) {
    imageEl.className = 'scene-image';

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

/* ===== シーン ===== */

function startEpisode2() {
  yuiSay('夜の学校……静かすぎるね。');

  setScene(
    '顧問教師が夜の校舎で転落死した。<br>警察は事故として処理しようとしている。',
    [
      { label: '現場へ向かう', onClick: showSchool }
    ]
  );
}

function showSchool() {
  yuiSay('雪が積もってる……足元、気をつけて。');

  setScene(
    '新潟市内の高校。夜の校舎。',
    [],
    'img/2話学校夜.png',
    [
      {
        label: '校庭を見る',
        x: '10%',
        y: '60%',
        w: '30%',
        h: '25%',
        onClick: inspectYard
      },
      {
        label: '校舎に入る',
        x: '60%',
        y: '35%',
        w: '25%',
        h: '30%',
        onClick: inspectInside
      }
    ]
  );
}

function inspectYard() {
  yardChecked = true;
  addEvidence('融雪装置の上に残った足跡');

  yuiSay('雪で消えるはずの足跡が……残ってる。');

  setScene(
    '校庭には、融雪装置の上にだけ足跡が残っていた。',
    [
      { label: '戻る', onClick: showSchool }
    ],
    'img/2話校庭.png'
  );
}

function inspectInside() {
  yuiSay('中は……妙に整理されてる。');

  const spots = [];

  if (!artChecked) {
    spots.push({
      label: '美術室',
      x: '10%',
      y: '30%',
      w: '30%',
      h: '30%',
      onClick: inspectArtRoom
    });
  }

  if (!scheduleChecked) {
    spots.push({
      label: '職員室',
      x: '55%',
      y: '35%',
      w: '30%',
      h: '30%',
      onClick: inspectSchedule
    });
  }

  setScene(
    '夜の校舎内部。',
    [
      { label: '外に出る', onClick: showSchool }
    ],
    'img/2話校舎内.png',
    spots
  );
}

function inspectArtRoom() {
  artChecked = true;
  addEvidence('不自然に動かされた彫刻台');

  yuiSay('これ……誰かが動かした跡がある。');

  setScene(
    '美術室。彫刻台の位置が不自然にずれている。',
    [
      { label: '戻る', onClick: inspectInside }
    ],
    'img/2話美術室.png'
  );
}

function inspectSchedule() {
  scheduleChecked = true;
  addEvidence('改ざんされた教師のスケジュール帳');

  yuiSay('この時間……書き換えられてる。');

  setScene(
    '職員室。顧問教師のスケジュール帳に改ざんの痕跡がある。',
    [
      { label: '戻る', onClick: inspectInside }
    ],
    'img/2話職員室.png'
  );
}

/* ===== 結論 ===== */

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
      '足跡は、犯人が校舎にいた証拠だった。<br>' +
      'これは事故に見せかけた殺人だ。',
      []
    );

    setTimeout(() => {
      yuiSay('……この名前。');

      setScene(
        '教師の調査資料には、いくつかの名前が記されていた。<br><br>' +
        '──その中に、あなたの名前があった。',
        [
          {
            label: '話数選択へ戻る',
            onClick: () => {
              window.location.href = 'index.html';
            }
          }
        ]
      );
    }, 1500);

  } else {
    yuiSay('それだけじゃ、事故を否定できない。');

    setScene(
      '証拠が足りない。',
      [
        { label: 'もう一度調べる', onClick: showSchool }
      ]
    );
  }
}

/* ===== 開始 ===== */
startEpisode2();
