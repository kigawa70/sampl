const narrationEl = document.getElementById("narration");
const choicesEl = document.getElementById("choices");
const logEl = document.getElementById("log");

const state = {
  step: "start",
  clues: new Set(),
};

function log(text) {
  const time = new Date().toLocaleTimeString();
  logEl.innerHTML = `<div>[${time}] ${text}</div>` + logEl.innerHTML;
}

function setScene(text, choices = []) {
  narrationEl.innerHTML = text;
  choicesEl.innerHTML = "";

  choices.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.label;
    btn.onclick = c.onClick;
    choicesEl.appendChild(btn);
  });
}

function start() {
  setScene(
    "あなたは新潟県警の新人アナリスト。助手の雪村ユイと共に、関屋浜近くの民宿へ向かった。<br>" +
    "観光客の女性が『密室でネックレスが消えた』と通報してきたのだ。",
    [
      { label: "部屋を調べる", onClick: inspectRoom },
      { label: "オーナーに聞く", onClick: talkOwner }
    ]
  );
  log("現場到着");
}

function inspectRoom() {
  state.clues.add("sand");
  setScene(
    "部屋の入口付近の畳に、白い砂が薄く付着している。<br>" +
    "窓は内側から施錠され、外に足跡は見当たらない。",
    [
      { label: "砂を調べる", onClick: inspectSand },
      { label: "推理する", onClick: deduce }
    ]
  );
  log("部屋を調査。白砂を確認");
}

function inspectSand() {
  state.clues.add("wind");
  setScene(
    "砂は関屋浜特有の白砂だが、量が不自然に少ない。<br>" +
    "海風は海側から室内へ吹き込んでいる。",
    [
      { label: "聞き取りを続ける", onClick: talkGuest },
      { label: "推理する", onClick: deduce }
    ]
  );
  log("砂と風向きを確認");
}

function talkOwner() {
  state.clues.add("owner");
  setScene(
    "オーナーは『誰も入っていない』と主張するが、鍵の扱いについて曖昧な点がある。",
    [
      { label: "部屋に戻る", onClick: inspectRoom }
    ]
  );
  log("オーナーの証言に矛盾");
}

function talkGuest() {
  setScene(
    "被害者の女性は動揺している。<br>" +
    "『私は盗まれたんじゃない…』と、かすかに呟いた。",
    [
      { label: "推理する", onClick: deduce }
    ]
  );
  log("被害者の反応に違和感");
}

function deduce() {
  if (state.clues.has("sand") && state.clues.has("wind")) {
    setScene(
      "あなたは結論に至った。<br>" +
      "ネックレスは外部から盗まれたのではない。<br>" +
      "海難事故のショックで、彼女自身が隠してしまったのだ。<br><br>" +
      "そして彼女の目的は、<strong>『ある調査資料（アーカイブ）』</strong>を探すことだった。",
      [
        { label: "第1話 終", onClick: () => location.reload() }
      ]
    );
    log("事件の真相に到達");
  } else {
    setScene(
      "まだ情報が足りない。もう少し調査が必要だ。",
      [
        { label: "部屋を調べる", onClick: inspectRoom }
      ]
    );
  }
}

// フッターボタン（簡易ショートカット）
document.getElementById("observeBtn").onclick = inspectRoom;
document.getElementById("talkBtn").onclick = talkOwner;
document.getElementById("deduceBtn").onclick = deduce;

start();
