
(function () {
  "use strict";
  var cfg = window.SITE_CONFIG || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. רצף הפתיחה ---------- */
  var curtain = document.getElementById("curtain");
  function startIntro() {
    document.body.classList.add("ready");
    var mask = document.getElementById("heroMask");
    if (mask) setTimeout(function () { mask.classList.add("in"); }, 350);
  }
  var leaving = false;
  function lift() {
    if (leaving) return;
    if (!curtain) { startIntro(); return; }
    curtain.classList.remove("fast");
    curtain.classList.add("lift");
    startIntro();
  }
  if (reduce) { if (curtain) curtain.classList.add("lift"); startIntro(); }
  else {
    window.addEventListener("load", function () { setTimeout(lift, 900); });
    setTimeout(lift, 3200); /* רשת ביטחון אם load מתעכב */
  }

  window.addEventListener("pageshow", function (e) {
    if (e.persisted && curtain) { leaving = false; curtain.classList.remove("fast"); curtain.classList.add("lift"); }
  });

  /* ---------- 1b. מעבר בין עמודים ---------- */
  function sameOrigin(a) {
    return a.hostname === location.hostname && a.protocol === location.protocol;
  }
  function leaveTo(url) {
    if (reduce || !curtain) { location.href = url; return; }
    leaving = true;
    curtain.classList.add("fast");
    curtain.classList.remove("lift");
    setTimeout(function () { location.href = url; }, 620);
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|https?:\/\/)/i.test(href) && !sameOrigin(a)) return;
    if (!sameOrigin(a)) return;
    if (a.pathname === location.pathname && a.hash) return;
    e.preventDefault();
    if (menu && menu.classList.contains("open")) {
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("locked");
    }
    leaveTo(a.href);
  });

  /* ---------- 2. תפריט מסך מלא ---------- */
  var menu = document.getElementById("menu"),
      menuBtn = document.getElementById("menuBtn");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "סגירת התפריט" : "פתיחת התפריט");
    document.body.classList.toggle("locked", open);
  }
  menuBtn.addEventListener("click", function () {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- 3. כותרת נסתרת בגלילה + סרגל התקדמות ---------- */
  var hdr = document.getElementById("hdr"), bar = document.getElementById("bar"), last = 0;
  function onScroll() {
    var y = window.scrollY || 0;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (!menu.classList.contains("open")) {
      hdr.classList.toggle("hide", y > last && y > 260);
    }
    last = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 3b. פרלקסה עדינה בהירו ---------- */
  if (!reduce) {
    var heroIn = document.querySelector(".hero-in"),
        heroGhost = document.querySelector(".hero-ghost"),
        heroSec = document.querySelector(".hero"),
        ticking = false;
    function parallax() {
      ticking = false;
      var y = window.scrollY || 0;
      if (!heroSec || y > heroSec.offsetHeight) return;
      if (heroIn) heroIn.style.transform = "translate3d(0," + (y * -0.13) + "px,0)";
      if (heroGhost) heroGhost.style.transform = "translate3d(-50%," + (y * 0.22) + "px,0)";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
    }, { passive: true });
  }

  /* ---------- 4. חשיפה בגלילה ---------- */
  var targets = document.querySelectorAll(".rv, .rv-fade, .rv-mask");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
        var counters = e.target.querySelectorAll("[data-count]");
        counters.forEach(runCount);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
    document.querySelectorAll("[data-count]").forEach(runCount);
  }

  /* ---------- 5. מונים ---------- */
  function runCount(el) {
    var to = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = to + suffix; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 6. מחליף ציטוטים ---------- */
  var qs = Array.prototype.slice.call(document.querySelectorAll("#quotes .q")),
      dots = document.getElementById("qDots"), qi = 0, qTimer;
  if (qs.length && dots) {
    qs.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "ציטוט " + (i + 1));
      b.addEventListener("click", function () { showQ(i); restart(); });
      dots.appendChild(b);
    });
    function showQ(i) {
      qi = i;
      qs.forEach(function (q, n) { q.classList.toggle("on", n === i); });
      dots.querySelectorAll("button").forEach(function (b, n) {
        b.setAttribute("aria-current", n === i ? "true" : "false");
      });
    }
    function restart() {
      clearInterval(qTimer);
      if (!reduce) qTimer = setInterval(function () { showQ((qi + 1) % qs.length); }, 6500);
    }
    showQ(0); restart();
  }

  /* ---------- 7. שאלות נפוצות — אחת פתוחה בכל פעם ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* ---------- 8. סמן מותאם (מסך גדול בלבד) ---------- */
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
    var cur = document.getElementById("cur"), dot = document.getElementById("curDot");
    var cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = "translate(" + tx + "px," + ty + "px)";
      document.body.classList.add("has-cursor");
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      cur.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) {
      var hit = e.target && e.target.closest && e.target.closest("a, button, summary, input, textarea");
      cur.classList.toggle("big", !!hit);
    });
  }

  /* ---------- 8b. גלגול טקסט בקישורי הפוטר ---------- */
  document.querySelectorAll(".foot nav a").forEach(function (a) {
    var t = a.textContent.trim();
    a.innerHTML = '<span class="roll"><i></i><i></i></span>';
    a.querySelectorAll("i").forEach(function (n) { n.textContent = t; });
  });

  /* ---------- 8c. תוכן עניינים בעמוד התקנון ---------- */
  var tocLinks = document.querySelectorAll(".legal-toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var secs = [];
    tocLinks.forEach(function (a) {
      var t = document.querySelector(a.getAttribute("href"));
      if (t) secs.push({ a: a, el: t });
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        secs.forEach(function (s) { s.a.classList.toggle("active", s.el === en.target); });
      });
    }, { rootMargin: "-18% 0px -70% 0px" });
    secs.forEach(function (s) { spy.observe(s.el); });
    tocLinks.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var t = document.querySelector(a.getAttribute("href"));
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", a.getAttribute("href"));
      });
    });
  }

  /* ---------- 9. שנה בפוטר ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 10. טופס יצירת קשר ---------- */
  var supa = null;
  function getSupa() {
    if (supa) return supa;
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) return null;
    supa = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    return supa;
  }

  var form = document.getElementById("leadForm"),
      statusEl = document.getElementById("formStatus"),
      submitBtn = document.getElementById("submitBtn");

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  var TARGET_EMAIL = cfg.formEmail || cfg.fallbackEmail || cfg.contactEmail || "";

  function mailtoFallback(p) {
    var body = "שם: " + p.full_name + "\n" + "אימייל: " + p.email + "\n" +
               "טלפון: " + (p.phone || "-") + "\n\nהודעה:\n" + (p.message || "");
    window.location.href = "mailto:" + TARGET_EMAIL +
      "?subject=" + encodeURIComponent("פנייה מהאתר — " + p.full_name) +
      "&body=" + encodeURIComponent(body);
  }

  function emailForm(p) {
    return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(TARGET_EMAIL), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        "שם": p.full_name, "אימייל": p.email, "טלפון": p.phone || "-",
        "הודעה": p.message || "",
        "_subject": "פנייה חדשה מהאתר — " + p.full_name,
        "_template": "table", "_captcha": "false"
      })
    }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); });
  }

  function storeLead(p) {
    var client = getSupa();
    if (!client) return;
    try { client.from("roey_leads").insert(p).then(function () {}, function () {}); } catch (e) {}
  }

  var shell = document.getElementById("formShell"),
      sentPanel = document.getElementById("sentPanel"),
      againBtn = document.getElementById("againBtn"),
      consent = document.getElementById("f-consent");

  function flagBad(el, on) {
    var box = el && el.closest ? el.closest(".fld, .consent") : null;
    if (box) box.classList.toggle("bad", !!on);
  }
  ["f-name", "f-email", "f-phone", "f-message"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", function () { flagBad(el, false); });
  });
  if (consent) consent.addEventListener("change", function () { flagBad(consent, false); });

  function showSent() {
    if (!form || !sentPanel) return;
    form.setAttribute("hidden", "");
    form.style.display = "none";
    sentPanel.removeAttribute("hidden");
    if (shell) shell.scrollIntoView({ block: "nearest" });
  }
  if (againBtn) {
    againBtn.addEventListener("click", function () {
      sentPanel.setAttribute("hidden", "");
      form.removeAttribute("hidden");
      form.style.display = "";
      setStatus("", "");
      var first = document.getElementById("f-name");
      if (first) first.focus();
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = {
        full_name: (form.full_name.value || "").trim(),
        email: (form.email.value || "").trim(),
        phone: (form.phone.value || "").trim() || null,
        kind: "general",
        message: (form.message.value || "").trim() || null,
        user_agent: navigator.userAgent
      };
      if (!p.full_name) {
        setStatus("נא למלא שם מלא.", "err"); flagBad(form.full_name, true); form.full_name.focus(); return;
      }
      if (!p.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        setStatus("נא למלא כתובת אימייל תקינה.", "err"); flagBad(form.email, true); form.email.focus(); return;
      }
      if (consent && !consent.checked) {
        setStatus("נא לאשר את תנאי השימוש כדי לשלוח.", "err"); flagBad(consent, true); consent.focus(); return;
      }
      submitBtn.disabled = true;
      setStatus("שולח…", "");
      storeLead(p);
      emailForm(p).then(function () {
        submitBtn.disabled = false;
        form.reset();
        setStatus("", "");
        showSent();
      }).catch(function () {
        submitBtn.disabled = false;
        setStatus("פותח את תוכנת הדוא״ל שלכם להשלמת השליחה…", "");
        setTimeout(function () { mailtoFallback(p); }, 700);
      });
    });
  }

  /* ---------- 11. הצגת הדוא"ל מתוך ההגדרות ---------- */
  var displayEmail = cfg.contactEmail || cfg.fallbackEmail;
  if (displayEmail) {
    document.querySelectorAll(".js-email").forEach(function (el) {
      var target = el.querySelector("span") || el;
      target.textContent = displayEmail;
      el.href = "mailto:" + displayEmail;
    });
  }
})();
