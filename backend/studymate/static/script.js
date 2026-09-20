/**
 * script.js — StudyMate AI frontend logic
 *
 * Manages three areas:
 *  1. Upload flow  → POST /upload → store session_id
 *  2. Summary tab  → GET /summarize → render Markdown
 *  3. Chat tab     → POST /ask    → message bubbles
 *  4. Quiz tab     → GET /quiz    → interactive Q&A
 *
 * No framework, no build step — plain ES2020 vanilla JS.
 * The API base URL is the same origin (FastAPI serves both frontend & API).
 */

'use strict';

/* ── Constants ─────────────────────────────────────────────────────────── */
const API_BASE = '';  // same origin; FastAPI serves static files + API

/* ── State ─────────────────────────────────────────────────────────────── */
let state = {
  sessionId: null,       // UUID returned by /upload
  docName:   'document.pdf',
  quiz:      {
    questions:    [],
    currentIndex: 0,
    score:        0,
    answered:     false,
    results:      [],    // { correct: bool, questionText: string }
  },
  summaryLoaded: false,
  quizLoaded:    false,
};

/* ── DOM refs ───────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const uploadScreen      = $('upload-screen');
const appScreen         = $('app-screen');
const dropZone          = $('drop-zone');
const fileInput         = $('file-input');
const browseBtn         = $('browse-btn');
const dzIdle            = $('drop-zone-idle');
const dzLoading         = $('drop-zone-loading');
const loadingFilename   = $('loading-filename');
const loadingStatus     = $('loading-status');
const progressFill      = $('progress-fill');
const uploadError       = $('upload-error');
const uploadErrorMsg    = $('upload-error-msg');
const errorDismissBtn   = $('error-dismiss-btn');
const newDocBtn         = $('new-doc-btn');
const navDocName        = $('nav-doc-name');
const tabBtns           = document.querySelectorAll('.tab-btn');
const tabPanels         = document.querySelectorAll('.tab-panel');

// Summary
const summaryLoading    = $('summary-loading');
const summaryError      = $('summary-error');
const summaryContent    = $('summary-content');
const summaryRetryBtn   = $('summary-retry-btn');
const summaryErrorMsg   = $('summary-error-msg');

// Chat
const chatThread        = $('chat-thread');
const chatInput         = $('chat-input');
const askBtn            = $('ask-btn');

// Quiz
const quizLoading       = $('quiz-loading');
const quizError         = $('quiz-error');
const quizErrorMsg      = $('quiz-error-msg');
const quizRetryBtn      = $('quiz-retry-btn');
const quizQuestionView  = $('quiz-question-view');
const quizScoreScreen   = $('quiz-score-screen');
const qCurrent          = $('q-current');
const qTotal            = $('q-total');
const qScore            = $('q-score');
const quizProgressFill  = $('quiz-progress-fill');
const qText             = $('q-text');
const optionsGrid       = $('options-grid');
const explanationBox    = $('explanation-box');
const resultLabel       = $('result-label');
const explanationText   = $('explanation-text');
const nextBtn           = $('next-btn');
const finalScore        = $('final-score');
const finalTotal        = $('final-total');
const scoreLabel        = $('score-label');
const scoreEmoji        = $('score-emoji');
const scoreBreakdown    = $('score-breakdown');
const retakeBtn         = $('retake-btn');

/* =========================================================================
   UPLOAD FLOW
   ========================================================================= */

/** Show the upload-screen, hide the app-screen (reset). */
function showUploadScreen() {
  appScreen.classList.add('hidden');
  appScreen.classList.remove('active');
  uploadScreen.classList.remove('hidden');
  uploadScreen.classList.add('active');
  resetDropZone();
}

/** Switch from upload-screen to the main app view. */
function showAppScreen(docName) {
  uploadScreen.classList.remove('active');
  uploadScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  appScreen.classList.add('active');
  navDocName.textContent = docName;
  // Default to Summary tab
  switchTab('summary');
}

/** Reset drop-zone back to idle state. */
function resetDropZone() {
  dzIdle.classList.remove('hidden');
  dzLoading.classList.add('hidden');
  progressFill.style.width = '0%';
  hideUploadError();
}

function showUploadError(msg) {
  uploadErrorMsg.textContent = msg;
  uploadError.classList.remove('hidden');
}
function hideUploadError() {
  uploadError.classList.add('hidden');
}

/** Animate the progress bar through fake stages while uploading. */
function animateProgress(stages) {
  // stages = [{ pct, label, delay }]
  stages.forEach(({ pct, label, delay }) => {
    setTimeout(() => {
      progressFill.style.width = pct + '%';
      loadingStatus.textContent = label;
    }, delay);
  });
}

/**
 * Upload a PDF file to POST /upload.
 * Extracts text, embeds chunks, stores them — may take 5–20s.
 */
async function uploadFile(file) {
  // Switch to loading UI
  dzIdle.classList.add('hidden');
  dzLoading.classList.remove('hidden');
  loadingFilename.textContent = file.name;
  loadingStatus.textContent = 'Reading PDF…';
  progressFill.style.width = '5%';
  hideUploadError();

  // Fake progress animations (real work is server-side)
  animateProgress([
    { pct: 15, label: 'Extracting text from PDF…',      delay: 400 },
    { pct: 35, label: 'Splitting into smart chunks…',    delay: 1200 },
    { pct: 55, label: 'Generating AI embeddings…',       delay: 2800 },
    { pct: 75, label: 'Building your knowledge index…',  delay: 5000 },
    { pct: 90, label: 'Almost ready…',                   delay: 9000 },
  ]);

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed.' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    progressFill.style.width = '100%';
    loadingStatus.textContent = 'Done! Loading your study tools…';

    // Small pause so the user sees 100%
    await sleep(500);

    // Store session
    state.sessionId      = data.session_id;
    state.docName        = file.name;
    state.summaryLoaded  = false;
    state.quizLoaded     = false;
    state.quiz           = { questions: [], currentIndex: 0, score: 0, answered: false, results: [] };

    // Reset chat
    chatThread.innerHTML = '';
    addWelcomeBubble(file.name);

    showAppScreen(file.name);

  } catch (err) {
    resetDropZone();
    showUploadError(err.message || 'Upload failed. Please try again.');
    console.error('[upload]', err);
  }
}

// ── Drag & drop wiring ────────────────────────────────────────────────── //

dropZone.addEventListener('click', (e) => {
  if (e.target === browseBtn || browseBtn.contains(e.target)) return; // handled separately
  fileInput.click();
});

browseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

dropZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files?.[0]) uploadFile(fileInput.files[0]);
  fileInput.value = ''; // allow re-upload of same file
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showUploadError('Only PDF files are accepted.');
      return;
    }
    uploadFile(file);
  }
});

errorDismissBtn.addEventListener('click', hideUploadError);
newDocBtn.addEventListener('click', showUploadScreen);

/* =========================================================================
   TAB SWITCHING
   ========================================================================= */

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(tabId) {
  tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
  tabPanels.forEach(p => {
    const isActive = p.id === `tab-${tabId}`;
    p.classList.toggle('active',  isActive);
    p.classList.toggle('hidden', !isActive);
  });

  // Lazy-load content when first switched to
  if (tabId === 'summary' && !state.summaryLoaded) loadSummary();
  if (tabId === 'quiz'    && !state.quizLoaded)    loadQuiz();
}

/* =========================================================================
   SUMMARY TAB
   ========================================================================= */

async function loadSummary() {
  showSummaryState('loading');

  try {
    const res = await fetch(`${API_BASE}/summarize?session_id=${state.sessionId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Summary failed.' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();

    // Render Markdown → HTML using marked.js
    summaryContent.innerHTML = marked.parse(data.summary);
    showSummaryState('content');
    state.summaryLoaded = true;

  } catch (err) {
    summaryErrorMsg.textContent = err.message;
    showSummaryState('error');
    console.error('[summary]', err);
  }
}

function showSummaryState(s) {
  summaryLoading.classList.toggle('hidden', s !== 'loading');
  summaryError.classList.toggle('hidden',   s !== 'error');
  summaryContent.classList.toggle('hidden', s !== 'content');
}

summaryRetryBtn.addEventListener('click', () => {
  state.summaryLoaded = false;
  loadSummary();
});

/* =========================================================================
   CHAT TAB
   ========================================================================= */

/** Add the initial assistant greeting. */
function addWelcomeBubble(docName) {
  appendMessage('assistant', `👋 I've finished reading **${docName}**. Ask me anything about it — I'll answer strictly from the document content.`);
}

/**
 * Append a message bubble to the chat thread.
 * @param {'user'|'assistant'} role
 * @param {string} text  — supports **bold** markdown-lite for assistant
 * @param {boolean} isTyping — show animated dots instead of text
 */
function appendMessage(role, text, isTyping = false) {
  const msg = document.createElement('div');
  msg.className = `msg ${role}${isTyping ? ' typing' : ''}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'user' ? '🧑' : '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  if (isTyping) {
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  } else {
    // Simple inline markdown: **bold**
    bubble.innerHTML = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  chatThread.appendChild(msg);
  chatThread.scrollTop = chatThread.scrollHeight;

  return msg; // returned so typing indicator can be removed
}

/** Send the user's question to /ask and stream the response into the chat. */
async function sendQuestion() {
  const question = chatInput.value.trim();
  if (!question) return;
  if (!state.sessionId) return;

  chatInput.value = '';
  resizeTextarea();

  // Show user bubble
  appendMessage('user', question);

  // Disable input while waiting
  chatInput.disabled = true;
  askBtn.disabled = true;

  // Show typing indicator
  const typingMsg = appendMessage('assistant', '', true);

  try {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: state.sessionId, question }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed.' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();

    // Remove typing indicator, add answer
    typingMsg.remove();
    appendMessage('assistant', data.answer);

  } catch (err) {
    typingMsg.remove();
    appendMessage('assistant', `⚠️ Error: ${err.message}`);
    console.error('[ask]', err);
  } finally {
    chatInput.disabled = false;
    askBtn.disabled    = false;
    chatInput.focus();
  }
}

askBtn.addEventListener('click', sendQuestion);

chatInput.addEventListener('keydown', (e) => {
  // Shift+Enter = newline, Enter = send
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendQuestion();
  }
});

chatInput.addEventListener('input', resizeTextarea);

/** Auto-grow textarea to fit content. */
function resizeTextarea() {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
}

/* =========================================================================
   QUIZ TAB
   ========================================================================= */

async function loadQuiz() {
  showQuizState('loading');

  try {
    const res = await fetch(`${API_BASE}/quiz?session_id=${state.sessionId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Quiz generation failed.' }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    const data = await res.json();

    if (!data.questions || data.questions.length === 0) {
      throw new Error('No questions were generated. Try a longer document.');
    }

    // Reset quiz state
    state.quiz = {
      questions:    data.questions,
      currentIndex: 0,
      score:        0,
      answered:     false,
      results:      [],
    };

    showQuizState('question');
    renderCurrentQuestion();
    state.quizLoaded = true;

  } catch (err) {
    quizErrorMsg.textContent = err.message;
    showQuizState('error');
    console.error('[quiz]', err);
  }
}

function showQuizState(s) {
  quizLoading.classList.toggle('hidden',       s !== 'loading');
  quizError.classList.toggle('hidden',         s !== 'error');
  quizQuestionView.classList.toggle('hidden',  s !== 'question');
  quizScoreScreen.classList.toggle('hidden',   s !== 'score');
}

/** Render the question at state.quiz.currentIndex. */
function renderCurrentQuestion() {
  const { questions, currentIndex, score } = state.quiz;
  const q = questions[currentIndex];
  const total = questions.length;

  // Progress bar + counters
  qCurrent.textContent = currentIndex + 1;
  qTotal.textContent   = total;
  qScore.textContent   = score;
  quizProgressFill.style.width = `${((currentIndex) / total) * 100}%`;

  // Question text
  qText.textContent = q.question;

  // Clear previous options & explanation
  optionsGrid.innerHTML = '';
  explanationBox.classList.add('hidden');
  nextBtn.classList.add('hidden');

  // Determine option labels (A/B/C/D) from options array
  const letters = ['A', 'B', 'C', 'D'];

  q.options.forEach((optionText, idx) => {
    const letter = letters[idx] || String.fromCharCode(65 + idx);

    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.letter = letter;

    btn.innerHTML = `
      <span class="option-label">${letter}</span>
      <span>${escapeHtml(optionText)}</span>
    `;

    btn.addEventListener('click', () => handleAnswer(letter, q));
    optionsGrid.appendChild(btn);
  });

  state.quiz.answered = false;
}

/**
 * Handle the user selecting an answer.
 * Marks the button correct/wrong, reveals explanation, shows Next button.
 */
function handleAnswer(selectedLetter, question) {
  if (state.quiz.answered) return; // prevent double-click
  state.quiz.answered = true;

  const correct = question.correct_answer.toUpperCase().charAt(0);
  const isCorrect = selectedLetter === correct;

  if (isCorrect) state.quiz.score++;

  // Record result for the score screen
  state.quiz.results.push({ correct: isCorrect, questionText: question.question });

  // Style all option buttons
  const allBtns = optionsGrid.querySelectorAll('.option-btn');
  allBtns.forEach(btn => {
    btn.disabled = true;
    const ltr = btn.dataset.letter;
    if (ltr === correct) {
      btn.classList.add('correct');
    } else if (ltr === selectedLetter && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  // Show explanation
  resultLabel.textContent = isCorrect ? '✅ Correct!' : `❌ Wrong — the answer is ${correct}`;
  resultLabel.style.color = isCorrect ? 'var(--success)' : 'var(--danger)';
  explanationText.textContent = question.explanation;
  explanationBox.classList.remove('hidden');
  explanationBox.className = `explanation-box ${isCorrect ? 'correct-exp' : 'wrong-exp'}`;

  // Update live score badge
  qScore.textContent = state.quiz.score;

  // Show next / finish button
  const isLast = state.quiz.currentIndex === state.quiz.questions.length - 1;
  nextBtn.textContent = isLast ? 'Finish Quiz 🏁' : 'Next Question →';
  nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
  const { currentIndex, questions } = state.quiz;
  if (currentIndex < questions.length - 1) {
    state.quiz.currentIndex++;
    renderCurrentQuestion();
    // Scroll the panel back to top
    nextBtn.closest('.panel-inner').scrollTop = 0;
  } else {
    showScoreScreen();
  }
});

/** Display the final score card with a breakdown of all questions. */
function showScoreScreen() {
  const { score, questions, results } = state.quiz;
  const total = questions.length;
  const pct   = Math.round((score / total) * 100);

  finalScore.textContent = score;
  finalTotal.textContent = `/${total}`;

  // Dynamic feedback
  let emoji = '😔', label = 'Keep practicing!';
  if (pct >= 90) { emoji = '🏆'; label = 'Outstanding!'; }
  else if (pct >= 70) { emoji = '🎉'; label = 'Great work!'; }
  else if (pct >= 50) { emoji = '👍'; label = 'Good effort!'; }

  scoreEmoji.textContent = emoji;
  scoreLabel.textContent = `${pct}% — ${label}`;

  // Update progress bar to 100%
  quizProgressFill.style.width = '100%';

  // Build breakdown list
  scoreBreakdown.innerHTML = '';
  results.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = `breakdown-item ${r.correct ? 'correct' : 'wrong'}`;
    item.innerHTML = `
      <span class="breakdown-icon">${r.correct ? '✅' : '❌'}</span>
      <span class="breakdown-text">Q${i + 1}: ${escapeHtml(r.questionText.slice(0, 80))}${r.questionText.length > 80 ? '…' : ''}</span>
    `;
    scoreBreakdown.appendChild(item);
  });

  showQuizState('score');
}

/** Reset and restart the quiz from question 1. */
retakeBtn.addEventListener('click', () => {
  state.quiz.currentIndex = 0;
  state.quiz.score        = 0;
  state.quiz.answered     = false;
  state.quiz.results      = [];
  showQuizState('question');
  renderCurrentQuestion();
});

quizRetryBtn.addEventListener('click', () => {
  state.quizLoaded = false;
  loadQuiz();
});

/* =========================================================================
   UTILITIES
   ========================================================================= */

/** Simple HTML escape to prevent XSS from document content. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Promise-based sleep. */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/* ── Init ───────────────────────────────────────────────────────────────── */
// Make sure we start on the upload screen
showUploadScreen();
