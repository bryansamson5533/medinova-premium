/* ===== Diagnostic beauté — quiz interactif (moteur local) ===== */
(function () {
  const quiz = document.getElementById('quiz');
  const stage = document.getElementById('quizStage');
  const progress = document.getElementById('quizProgress');
  const startBtn = document.getElementById('diagStart');
  if (!quiz || !startBtn) return;

  const QUESTIONS = [
    {
      q: "Quel est votre objectif principal ?",
      a: [
        { t: "Affiner ma silhouette", s: { bfreeze: 2, madero: 1 } },
        { t: "Raffermir / réduire la cellulite", s: { madero: 2, bfreeze: 1 } },
        { t: "Sublimer mon regard", s: { cils: 3 } },
        { t: "Mon bien-être après bébé", s: { bpulse: 3 } }
      ]
    },
    {
      q: "Quelle zone vous préoccupe le plus ?",
      a: [
        { t: "Ventre & taille", s: { bfreeze: 2 } },
        { t: "Cuisses & fessiers", s: { madero: 2 } },
        { t: "Mes yeux & mes cils", s: { cils: 3 } },
        { t: "Périnée & intimité", s: { bpulse: 3 } }
      ]
    },
    {
      q: "Vous préférez avant tout…",
      a: [
        { t: "Des résultats rapides", s: { bfreeze: 1 } },
        { t: "Un soin tout en douceur", s: { madero: 1, bpulse: 1 } },
        { t: "Un effet beauté immédiat", s: { cils: 1 } }
      ]
    }
  ];

  const RESULTS = {
    bfreeze: { name: "B-Freeze Yura", price: "dès 150 $", img: "assets/soin-bfreeze.jpg", desc: "Le body sculpting chaud-froid pour affiner et raffermir votre silhouette, sans chirurgie ni temps de récupération." },
    madero: { name: "Madérothérapie", price: "dès 85 $", img: "assets/soin-madero.jpg", desc: "Le massage sculptant aux outils de bois qui draine, lisse la peau et atténue la cellulite." },
    cils: { name: "Extensions de cils", price: "dès 120 $", img: "assets/soin-cils.jpg", desc: "Un regard intense et naturel, posé cil à cil, pour réveiller vos yeux sans mascara." },
    bpulse: { name: "B-Pulse", price: "dès 90 $", img: "assets/soin-bpulse.jpg", desc: "Le renforcement du plancher pelvien, en douceur et tout habillée — idéal après un accouchement." }
  };
  const ORDER = ['cils', 'bpulse', 'bfreeze', 'madero']; // priorité en cas d'égalité

  let step = 0;
  let scores = { bfreeze: 0, madero: 0, cils: 0, bpulse: 0 };

  const renderProgress = () => {
    progress.innerHTML = QUESTIONS.map((_, i) =>
      '<span class="' + (i < step ? 'done' : i === step ? 'active' : '') + '"></span>').join('');
  };

  const renderQuestion = () => {
    renderProgress();
    const Q = QUESTIONS[step];
    stage.innerHTML =
      '<p class="quiz__step">Question ' + (step + 1) + ' / ' + QUESTIONS.length + '</p>' +
      '<h3 class="quiz__q">' + Q.q + '</h3>' +
      '<div class="quiz__opts">' +
      Q.a.map((o, i) => '<button class="quiz__opt" data-i="' + i + '">' + o.t + '</button>').join('') +
      '</div>';
    stage.querySelectorAll('.quiz__opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const opt = Q.a[btn.dataset.i];
        for (const k in opt.s) scores[k] += opt.s[k];
        step++;
        if (step < QUESTIONS.length) renderQuestion();
        else renderResult();
      });
    });
  };

  const winner = () => {
    let best = ORDER[0], max = -1;
    ORDER.forEach(k => { if (scores[k] > max) { max = scores[k]; best = k; } });
    return RESULTS[best];
  };

  const renderResult = () => {
    progress.innerHTML = QUESTIONS.map(() => '<span class="done"></span>').join('');
    const r = winner();
    stage.innerHTML =
      '<div class="quiz__result">' +
      '<p class="quiz__step">Votre soin idéal ✦</p>' +
      '<div class="quiz__rimg" style="background-image:url(\'' + r.img + '\')"></div>' +
      '<h3 class="quiz__rname">' + r.name + '</h3>' +
      '<p class="quiz__rprice">' + r.price + '</p>' +
      '<p class="quiz__rdesc">' + r.desc + '</p>' +
      '<a href="#contact" class="btn btn--gold btn--lg" data-quiz-book>Réserver ma consultation offerte →</a>' +
      '<button class="quiz__again" id="quizAgain">↺ Refaire le test</button>' +
      '</div>';
    stage.querySelector('#quizAgain').addEventListener('click', restart);
    stage.querySelector('[data-quiz-book]').addEventListener('click', close);
  };

  const restart = () => { step = 0; scores = { bfreeze: 0, madero: 0, cils: 0, bpulse: 0 }; renderQuestion(); };
  const open = () => { restart(); quiz.hidden = false; document.body.classList.add('modal-open'); };
  const close = () => { quiz.hidden = true; document.body.classList.remove('modal-open'); };

  startBtn.addEventListener('click', open);
  quiz.querySelectorAll('[data-quiz-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !quiz.hidden) close(); });
})();
