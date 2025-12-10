// 進行状況管理
// 初期状態では第1話のみ解放
const saveKey = "niigata_progress";

const defaultProgress = {
  unlockedEpisodes: 1
};

function loadProgress() {
  const data = localStorage.getItem(saveKey);
  if (!data) return defaultProgress;
  try {
    return JSON.parse(data);
  } catch {
    return defaultProgress;
  }
}

function saveProgress(progress) {
  localStorage.setItem(saveKey, JSON.stringify(progress));
}

const progress = loadProgress();

// 話数解放処理
const episodeElements = document.querySelectorAll('.episode');

episodeElements.forEach(ep => {
  const epNum = Number(ep.dataset.ep);
  const button = ep.querySelector('button');

  if (epNum <= progress.unlockedEpisodes) {
    ep.classList.remove('locked');
    ep.classList.add('unlocked');
    button.disabled = false;

    button.addEventListener('click', () => {
      // 将来ここで各話のHTMLへ遷移
      alert(`第${epNum}話を開始します（※未実装）`);
    });
  } else {
    ep.classList.add('locked');
    button.disabled = true;
  }
});

// デバッグ用：進行リセット（必要なら）
// localStorage.removeItem(saveKey);