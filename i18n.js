(function () {
  var KEY = 'rt-lang';
  function store(v){ try { localStorage.setItem(KEY, v); } catch(e){} }
  function recall(){ try { return localStorage.getItem(KEY); } catch(e){ return null; } }

  function setLang(lang) {
    var nodes = document.querySelectorAll('[data-hi]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.getAttribute('data-en')) el.setAttribute('data-en', el.innerHTML);
      el.innerHTML = (lang === 'hi') ? el.getAttribute('data-hi') : el.getAttribute('data-en');
    }
    var ph = document.querySelectorAll('[data-hi-ph]');
    for (var j = 0; j < ph.length; j++) {
      var f = ph[j];
      if (!f.getAttribute('data-en-ph')) f.setAttribute('data-en-ph', f.getAttribute('placeholder') || '');
      f.setAttribute('placeholder', lang === 'hi' ? f.getAttribute('data-hi-ph') : f.getAttribute('data-en-ph'));
    }
    document.documentElement.lang = (lang === 'hi') ? 'hi' : 'en';
    document.body.classList.toggle('lang-hi', lang === 'hi');
    var btns = document.querySelectorAll('.lang-btn');
    for (var k = 0; k < btns.length; k++) {
      var on = btns[k].getAttribute('data-lang') === lang;
      btns[k].classList.toggle('is-on', on);
      btns[k].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    store(lang);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btns = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        setLang(this.getAttribute('data-lang'));
      });
    }
    setLang(recall() || 'en');
  });
})();
