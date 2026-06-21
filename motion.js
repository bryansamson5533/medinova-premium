/* ===== MOTION — smooth scroll (Lenis, self-hébergé) + micro-interactions premium =====
   Ajouté pour donner un feel "smooth". 100% additif, non bloquant.
   Respecte prefers-reduced-motion. Si Lenis est absent, le site reste pleinement fonctionnel. */
(function () {
  "use strict";

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var lenis = null;

  /* 1) Scroll fluide (buttery) ------------------------------------------------ */
  if (!reduce && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      lerp: 0.09,          // plus bas = plus "glissant"
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4
    });

    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    /* Parallaxe douce du fond du héros (subtile : le scale évite tout bord visible) */
    var heroBg = document.querySelector('.hero__bg');
    if (heroBg) {
      heroBg.style.willChange = 'transform';
      heroBg.style.transform = 'scale(1.16)';
      lenis.on('scroll', function (e) {
        heroBg.style.transform = 'translate3d(0,' + (e.scroll * 0.08).toFixed(1) + 'px,0) scale(1.16)';
      });
    }
  }

  /* 2) Ancres internes : défilement fluide (avec décalage pour la nav fixe) ---- */
  function goTo(target, offset) {
    if (lenis) {
      lenis.scrollTo(target, { offset: offset || 0, duration: 1.1 });
    } else {
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href.length < 2) return;          // ignore href="#" (ex. liens politique)
    a.addEventListener('click', function (e) {
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      goTo(target, -90);                            // -90 = hauteur de la nav fixe
      var links = document.querySelector('.nav__links');
      if (links) links.classList.remove('open');
    });
  });

  /* Retour en haut via Lenis (additif : la cible reste le haut de page) */
  var toTop = document.getElementById('toTop');
  if (toTop && lenis) {
    toTop.addEventListener('click', function () { lenis.scrollTo(0, { duration: 1.1 }); });
  }

  /* 3) Reveal du titre du héros, ligne par ligne (blur + montée) ------------- */
  if (!reduce) {
    var h1 = document.querySelector('.hero h1');
    if (h1 && !h1.dataset.split) {
      h1.dataset.split = '1';
      var parts = h1.innerHTML.split(/<br\s*\/?>/i);
      h1.innerHTML = parts.map(function (p, i) {
        return '<span class="line"><span class="line__in" style="animation-delay:' +
          (0.12 + i * 0.13).toFixed(2) + 's">' + p + '</span></span>';
      }).join('');
    }
  }

  /* 4) Boutons magnétiques — propulsés par Motion (vrais springs) si dispo ----- */
  if (!reduce && finePointer) {
    var STRENGTH = 0.22, MAX = 7;
    var M = window.Motion;
    var offset = function (btn, e) {
      var r = btn.getBoundingClientRect();
      var x = Math.max(-MAX, Math.min(MAX, (e.clientX - (r.left + r.width / 2)) * STRENGTH));
      var y = Math.max(-MAX, Math.min(MAX, (e.clientY - (r.top + r.height / 2)) * STRENGTH));
      return { x: x, y: y - 2 };
    };
    document.querySelectorAll('.btn--gold').forEach(function (btn) {
      if (M && M.animate) {
        /* ✦ Motion vanilla : suivi snappy + retour ÉLASTIQUE (spring physique) */
        btn.addEventListener('mousemove', function (e) {
          var o = offset(btn, e);
          M.animate(btn, { x: o.x, y: o.y }, { type: 'spring', stiffness: 350, damping: 22, mass: 0.4 });
        });
        var leave = function () {
          M.animate(btn, { x: 0, y: 0 }, { type: 'spring', stiffness: 160, damping: 12 });
        };
        btn.addEventListener('mouseleave', leave);
        btn.addEventListener('blur', leave);
      } else {
        /* Repli sans dépendance : transform direct + transition CSS (.is-magnetic) */
        btn.classList.add('is-magnetic');
        btn.addEventListener('mousemove', function (e) {
          var o = offset(btn, e);
          btn.style.transform = 'translate(' + o.x.toFixed(1) + 'px,' + o.y.toFixed(1) + 'px)';
        });
        var reset = function () { btn.style.transform = ''; };
        btn.addEventListener('mouseleave', reset);
        btn.addEventListener('blur', reset);
      }
    });
  }
})();
