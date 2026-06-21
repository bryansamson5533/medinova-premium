/* ===== Clavardage — Agente IA conseillère « Léa » (moteur local) ===== */
(function () {
  const chat = document.getElementById('chat');
  const toggle = document.getElementById('chatToggle');
  const panel = document.getElementById('chatPanel');
  const closeBtn = document.getElementById('chatClose');
  const body = document.getElementById('chatBody');
  const quick = document.getElementById('chatQuick');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  if (!chat) return;

  const CTA = '<a class="msg-cta" href="#contact" data-chat-cta>Réserver ma consultation offerte →</a>';

  /* Base de connaissances des soins */
  const S = {
    bfreeze: "<b>B-Freeze Yura</b> (dès 150&nbsp;$) — un body sculpting chaud-froid qui cible la graisse localisée et raffermit la peau&nbsp;: idéal pour le ventre, les cuisses et les poignées d'amour. Résultats visibles en quelques semaines, sans chirurgie ni temps de récupération.",
    madero: "<b>Madérothérapie</b> (dès 85&nbsp;$) — un massage sculptant aux outils de bois qui draine, atténue la cellulite et lisse la peau. Parfait seul ou en complément du B-Freeze Yura.",
    cils: "<b>Extensions de cils</b> (dès 120&nbsp;$) — un regard intense et naturel, posé cil à cil, pour réveiller vos yeux sans mascara.",
    bpulse: "<b>B-Pulse</b> (dès 90&nbsp;$) — renforce le plancher pelvien en douceur (idéal après un accouchement ou en cas de petites fuites urinaires). Vous restez habillée, c'est confortable et non invasif."
  };

  /* Intentions (mots-clés → réponse) */
  const INTENTS = [
    { k: ['bonjour','salut','allo','coucou','bonsoir','hey','hello'],
      r: () => "Bonjour&nbsp;! 😊 Je suis Léa, votre conseillère MédiNova. Dites-moi votre objectif (silhouette, peau, regard, après bébé…) et je vous oriente vers le soin idéal." },
    { k: ['ventre','silhouette','graisse','mincir','maigrir','perdre','sculpt','poignées','cuisses','amour','bourrelet','mollet','bras'],
      r: () => "Pour <b>affiner et sculpter la silhouette</b>, je recommande le " + S.bfreeze + "<br><br>On l'associe souvent à la " + S.madero + "<br>" + CTA },
    { k: ['cellulite','peau d\'orange','capiton','drain','jambes lourdes','circulation','rétention'],
      r: () => "Contre la <b>cellulite</b> et pour drainer, la " + S.madero + "<br><br>Pour un effet plus marqué sur la graisse, on combine avec le " + S.bfreeze + "<br>" + CTA },
    { k: ['raffermir','ferme','peau','tonifier','relâch','flasque'],
      r: () => "Pour <b>raffermir et tonifier la peau</b>, le " + S.bfreeze + "<br><br>La " + S.madero + " complète très bien le résultat.<br>" + CTA },
    { k: ['cils','regard','yeux','mascara','oeil','œil','volume russe'],
      r: () => "Pour sublimer votre regard&nbsp;: " + S.cils + "<br>" + CTA },
    { k: ['plancher','pelvien','périnée','perinee','fuite','fuites','bébé','bebe','accouch','grossesse','incontinence','pipi','vessie'],
      r: () => "Le soin parfait pour vous&nbsp;: " + S.bpulse + "<br>" + CTA },
    { k: ['massage','détente','detente','relax','bois'],
      r: () => "Vous aimeriez un moment sculptant et relaxant&nbsp;? La " + S.madero + "<br>" + CTA },
    { k: ['prix','tarif','coût','cout','combien','cher','budget','forfait'],
      r: () => "Voici nos tarifs de départ&nbsp;:<br>• B-Pulse — dès 90&nbsp;$<br>• Madérothérapie — dès 85&nbsp;$<br>• Extensions de cils — dès 120&nbsp;$<br>• B-Freeze Yura — dès 150&nbsp;$<br><br>La <b>première consultation est offerte</b> 💛<br>" + CTA },
    { k: ['rendez','rdv','réserv','reserv','consult','booking','disponib','prendre'],
      r: () => "Avec plaisir&nbsp;! La <b>consultation diagnostique est offerte</b> et sans engagement.<br>" + CTA },
    { k: ['adresse','où','ou ','localis','situé','situe','ville','beauce','joseph'],
      r: () => "Nous sommes au <b>772 Avenue du Palais, Saint-Joseph-de-Beauce (QC)</b>. Les soins sont sur rendez-vous.<br>" + CTA },
    { k: ['heure','ouvert','horaire'],
      r: () => "Nous recevons <b>sur rendez-vous</b>. Réservez le moment qui vous convient et nous confirmons rapidement.<br>" + CTA },
    { k: ['merci','parfait','super','génial','genial'],
      r: () => "Avec grand plaisir&nbsp;! 💛 Souhaitez-vous que je réserve votre consultation offerte&nbsp;?<br>" + CTA },
    { k: ['humain','personne','vrai','téléphone','telephone','appeler','contact','courriel','email'],
      r: () => "Bien sûr&nbsp;! Écrivez-nous à <b>medinovasantebeaute@outlook.com</b>, ou laissez vos coordonnées et Roxanne ou Véronique vous rappellent.<br>" + CTA }
  ];

  const fallback = () => "Bonne question&nbsp;! Pour bien vous conseiller, dites-moi votre objectif principal&nbsp;: <b>affiner la silhouette</b>, <b>raffermir la peau</b>, <b>sublimer le regard</b> ou un soin <b>après bébé</b>&nbsp;? Vous pouvez aussi réserver une consultation offerte où l'on évalue tout ensemble.<br>" + CTA;

  const QUICK = [
    ['Affiner ma silhouette', 'Je veux affiner ma silhouette'],
    ['Cellulite', 'J\'aimerais réduire ma cellulite'],
    ['Raffermir ma peau', 'Je veux raffermir ma peau'],
    ['Mon regard ✨', 'Je m\'intéresse aux extensions de cils'],
    ['Après bébé', 'Un soin pour le plancher pelvien après bébé'],
    ['Voir les prix', 'Quels sont vos prix ?'],
    ['Prendre rendez-vous', 'Je veux prendre rendez-vous']
  ];

  const scroll = () => { body.scrollTop = body.scrollHeight; };

  const addMsg = (html, who) => {
    const d = document.createElement('div');
    d.className = 'msg ' + who;
    d.innerHTML = html;
    body.appendChild(d);
    scroll();
  };

  const botReply = (text) => {
    const t = document.createElement('div');
    t.className = 'typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    scroll();
    const delay = 500 + Math.min(text.length * 8, 900);
    setTimeout(() => { t.remove(); addMsg(text, 'bot'); }, delay);
  };

  const answer = (msg) => {
    const q = ' ' + msg.toLowerCase() + ' ';
    const hit = INTENTS.find(i => i.k.some(k => q.includes(k)));
    botReply(hit ? hit.r() : fallback());
  };

  const renderQuick = () => {
    quick.innerHTML = '';
    QUICK.forEach(([label, phrase]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', () => { addMsg(phrase, 'user'); answer(phrase); });
      quick.appendChild(b);
    });
  };

  /* Ouverture / fermeture */
  let greeted = false;
  const open = () => {
    panel.hidden = false;
    chat.classList.add('open');
    if (!greeted) {
      greeted = true;
      botReply("Bonjour, je suis <b>Léa</b>, votre conseillère beauté chez MédiNova ✦<br>Quel est votre objectif aujourd'hui&nbsp;? Je vous oriente vers le soin parfait.");
      renderQuick();
    }
    setTimeout(() => input.focus(), 300);
  };
  const close = () => { panel.hidden = true; chat.classList.remove('open'); };

  toggle.addEventListener('click', () => panel.hidden ? open() : close());
  closeBtn.addEventListener('click', close);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    addMsg(v, 'user');
    input.value = '';
    answer(v);
  });

  /* CTA dans une bulle → ferme le chat et défile vers le formulaire */
  body.addEventListener('click', (e) => {
    if (e.target.closest('[data-chat-cta]')) close();
  });
})();
