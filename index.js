import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase設定（他のファイルと同じもの）
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

const ep1Btn = document.getElementById('episode1');
const ep2Btn = document.getElementById('episode2');

// ログイン状態を監視して、クリア状況をチェック
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists() && userDoc.data().unlockedEpisodes >= 2) {
      // 第2話を解放
      ep2Btn.disabled = false;
      ep2Btn.textContent = '第2話 夜の校舎は雪を隠す';
      ep2Btn.onclick = () => { window.location.href = 'episode2.html'; };
    } else {
      ep2Btn.disabled = true;
      ep2Btn.textContent = '第2話（未解放）';
    }
  } else {
    // 未ログインならログイン画面へ
    window.location.href = 'index.html';
  }
});

ep1Btn.onclick = () => {
  window.location.href = 'episode1.html';
};