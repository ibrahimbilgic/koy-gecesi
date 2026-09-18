// Köy Gecesi yasal sayfaları — dil seçimi. Dış bağımlılık yok, çerez yok.
//
// Öncelik: adresteki ?lang= → önceki seçim (localStorage) → tarayıcı dilleri → en.
// ?lang= mağaza bağlantıları içindir: App Store Connect ve Play her dil için ayrı
// gizlilik adresi kabul eder (ör. privacy.html?lang=de).
//
// JavaScript çalışmazsa sayfa ilk bölümüyle (Türkçe) okunur: o bölüm HTML'de "active"
// sınıfıyla gelir, üst şerit de Türkçe yazılıdır.
(function () {
  var ANAHTAR = 'koygecesi-yasal-dil';
  var DILLER = ['tr', 'en', 'de', 'it', 'pl', 'pt-BR', 'ko'];

  // Üst şerit ve ayak metinleri. Sayfa gövdesi HTML'deki dil bölümlerindedir.
  var SERIT = {
    tr: { marka: 'Köy Gecesi', privacy: 'Gizlilik', kvkk: 'KVKK', terms: 'Koşullar', support: 'Destek', atla: 'İçeriğe geç', dilGrubu: 'Dil' },
    en: { marka: 'Village at Night', privacy: 'Privacy', kvkk: 'KVKK', terms: 'Terms', support: 'Support', atla: 'Skip to content', dilGrubu: 'Language' },
    de: { marka: 'Dorfnacht', privacy: 'Datenschutz', kvkk: 'KVKK', terms: 'Bedingungen', support: 'Hilfe', atla: 'Zum Inhalt springen', dilGrubu: 'Sprache' },
    it: { marka: 'Notte al Villaggio', privacy: 'Privacy', kvkk: 'KVKK', terms: 'Termini', support: 'Assistenza', atla: 'Vai al contenuto', dilGrubu: 'Lingua' },
    pl: { marka: 'Noc w Wiosce', privacy: 'Prywatność', kvkk: 'KVKK', terms: 'Regulamin', support: 'Pomoc', atla: 'Przejdź do treści', dilGrubu: 'Język' },
    'pt-BR': { marka: 'Noite na Vila', privacy: 'Privacidade', kvkk: 'KVKK', terms: 'Termos', support: 'Suporte', atla: 'Pular para o conteúdo', dilGrubu: 'Idioma' },
    ko: { marka: '마을의 밤', privacy: '개인정보', kvkk: 'KVKK', terms: '이용약관', support: '고객지원', atla: '본문 바로가기', dilGrubu: '언어' }
  };

  /** "de-AT", "pt_PT", "PT" → desteklenen dil ya da null. Her Portekizce pt-BR'ye düşer (uygulamayla aynı). */
  function eslestir(kod) {
    if (!kod) return null;
    var kok = String(kod).toLowerCase().split(/[-_]/)[0];
    if (kok === 'pt') return 'pt-BR';
    for (var i = 0; i < DILLER.length; i++) {
      if (DILLER[i] === kok) return DILLER[i];
    }
    return null;
  }

  function adrestenDil() {
    var m = /[?&]lang=([^&#]+)/.exec(window.location.search);
    return m ? eslestir(decodeURIComponent(m[1])) : null;
  }

  function kayitliDil() {
    try {
      return eslestir(localStorage.getItem(ANAHTAR));
    } catch (e) {
      return null; // özel sekmede ya da engelli depoda erişim hata verebilir
    }
  }

  function tarayiciDili() {
    var liste = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < liste.length; i++) {
      var dil = eslestir(liste[i]);
      if (dil) return dil;
    }
    return null;
  }

  function uygula(dil) {
    var serit = SERIT[dil];
    document.documentElement.lang = dil;

    document.querySelectorAll('[data-lang]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-lang') === dil);
    });

    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === dil));
    });

    // Sayfalar arası geçişte dil korunur (localStorage kapalı olsa bile).
    document.querySelectorAll('[data-sayfa]').forEach(function (a) {
      var sayfa = a.getAttribute('data-sayfa');
      a.setAttribute('href', sayfa + '.html?lang=' + encodeURIComponent(dil));
      var etiket = a.querySelector('.etiket');
      if (etiket && serit[sayfa]) etiket.textContent = serit[sayfa];
    });

    document.querySelectorAll('[data-serit]').forEach(function (el) {
      var anahtar = el.getAttribute('data-serit');
      if (serit[anahtar]) el.textContent = serit[anahtar];
    });

    var grup = document.querySelector('.lang');
    if (grup) grup.setAttribute('aria-label', serit.dilGrubu);

    var baslik = document.body.getAttribute('data-title-' + dil.toLowerCase());
    if (baslik) document.title = baslik;
  }

  uygula(adrestenDil() || kayitliDil() || tarayiciDili() || 'en');

  document.addEventListener('click', function (e) {
    var dugme = e.target && e.target.closest ? e.target.closest('[data-set-lang]') : null;
    if (!dugme) return;
    var dil = eslestir(dugme.getAttribute('data-set-lang'));
    if (!dil) return;
    uygula(dil);
    try {
      localStorage.setItem(ANAHTAR, dil);
    } catch (err) {
      /* yok say */
    }
    try {
      var adres = window.location.pathname + '?lang=' + encodeURIComponent(dil) + window.location.hash;
      window.history.replaceState(null, '', adres);
    } catch (err) {
      /* file:// altında bazı tarayıcılar izin vermez */
    }
  });
})();
