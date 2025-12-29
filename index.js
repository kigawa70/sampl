const ep1Btn = document.getElementById('episode1');
const ep2Btn = document.getElementById('episode2');

const ep1Cleared = localStorage.getItem('ep1Cleared') === 'true';

ep1Btn.onclick = () => {
  window.location.href = 'episode1.html';
};

if (ep1Cleared) {
  ep2Btn.disabled = false;
  ep2Btn.textContent = '第2話 夜の校舎は雪を隠す';
  ep2Btn.onclick = () => {
    window.location.href = 'episode2.html';
  };
} else {
  ep2Btn.disabled = true;
  ep2Btn.textContent = '第2話（未解放）';
}
