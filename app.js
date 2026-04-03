let stages = [];
let unlockedStages = [];
let currentStageId = 1;

const STORAGE_KEY = "egg_progress";
const CURRENT_STAGE_KEY = "egg_current_stage";

// 載入資料
fetch('stages.json')
  .then(res => res.json())
  .then(data => {
    stages = data.stages || [];
    loadProgress();
    updateProgressUI();
  });

// 讀取進度
function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    unlockedStages = JSON.parse(saved);
  }

  const savedCurrent = localStorage.getItem(CURRENT_STAGE_KEY);
  if (savedCurrent) {
    currentStageId = Number(savedCurrent);
  }
}

function saveCurrentStage() {
  localStorage.setItem(CURRENT_STAGE_KEY, String(currentStageId));
}

// 儲存進度
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedStages));
}

// 更新進度 UI
function updateProgressUI() {
  const total = stages.length || 32;
  const current = unlockedStages.length;

  document.getElementById('progressText').innerText =
    `🚀 目前進度：${current} / ${total} 🚀`;

  const percent = total > 0 ? (current / total) * 100 : 0;
  document.getElementById('progressFill').style.width = percent + "%";
}



// confetti
function launchConfetti() {
  for (let i = 0; i < 80; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.background = `hsl(${Math.random()*360},100%,60%)`;
    conf.style.animationDuration = (Math.random() * 2 + 1) + "s";
    document.body.appendChild(conf);

    setTimeout(() => conf.remove(), 2000);
  }
}

// 注入動畫
const injectedStyle = document.createElement("style");
injectedStyle.innerHTML = `
.confetti {
  position: fixed;
  top: -10px;
  width: 8px;
  height: 8px;
  opacity: 0.8;
  animation: fall linear forwards;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
  }
}
`;
document.head.appendChild(injectedStyle);

// 綁定事件
document.getElementById('submitBtn').addEventListener('click', checkCode);
document.getElementById('codeInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    checkCode();
  }
});

// ⭐ 統一訊息控制（核心）
function setBanner(message, type) {
  const banner = document.getElementById('responseBanner');
  banner.innerText = message;
  banner.className = `response-banner ${type}`;
}

// 解鎖邏輯
function checkCode() {
  const input = document.getElementById('codeInput').value.replace(/\D/g, '').slice(0, 4);
  document.getElementById('codeInput').value = input;

  const expectedStage = stages.find(s => s.id === currentStageId);
  const stage = expectedStage && String(expectedStage.unlock_code) === input
    ? expectedStage
    : null;

  const resultDiv = document.getElementById('result');
  const stageTitle = document.getElementById('stageTitle');
  const clue = document.getElementById('clue');

  if (!stage) {
    // 顯示錯誤訊息
    setBanner('❌ 密碼不對，再看看紙條喔！', 'error');
  
    // 顯示 resultDiv（提示仍可看到）
    const resultDiv = document.getElementById('result');
    const stageTitle = document.getElementById('stageTitle');
    const clue = document.getElementById('clue');
  
    // // 顯示當前應該的下一關提示
    // const expectedStage = stages.find(s => s.id === currentStageId);
    // stageTitle.innerText = expectedStage ? expectedStage.title : '🎉 終點';
    // clue.innerText = expectedStage ? expectedStage.clue_text : '';
  
    resultDiv.classList.remove('hidden');
  
    return;
  }

  const nextStage = stages.find(s => s.id === stage.next_stage_id);

  if (unlockedStages.includes(stage.id)) {
    setBanner(`🚨 你已經到過 ${stage.title} 這關囉 🚨`, 'repeat');

    stageTitle.innerText = nextStage ? `${nextStage.title}` : '🎉 終點';
    clue.innerText = stage.clue_text;

    resultDiv.classList.remove('hidden');
    return;
  }

  unlockedStages.push(stage.id);
  saveProgress();
  updateProgressUI();

  if (stage.next_stage_id !== null) {
    currentStageId = stage.next_stage_id;
  } else {
    currentStageId = stage.id;
  }
  saveCurrentStage();

  setBanner('✅ 太好了！前往下一個提示的地點吧 ✅', 'guide');

  stageTitle.innerText = nextStage ? `${nextStage.title}` : '🎉 終點';
  clue.innerText = stage.clue_text;

  resultDiv.classList.remove('hidden');

  launchConfetti();

  document.getElementById('codeInput').value = "";
}

document.getElementById('resetBtn').addEventListener('click', resetGame);

function resetGame() {
  if (!confirm("確定要重新開始嗎？所有進度會消失喔！")) return;

  // 清除進度
  localStorage.removeItem(STORAGE_KEY);
  unlockedStages = [];

  // 重置 UI
  document.getElementById('codeInput').value = "";

  // 清空 banner
  const banner = document.getElementById('responseBanner');
  banner.innerText = "";
  banner.className = "response-banner hidden";

  // 隱藏結果
  document.getElementById('result').classList.add('hidden');

  // 重置進度條
  updateProgressUI();

  localStorage.removeItem(CURRENT_STAGE_KEY);
  currentStageId = 1;
}