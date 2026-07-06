(function () {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function closeMobileMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  initResourcesHub();
  initScrollReveal();
})();

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(function (el) {
    observer.observe(el);
  });
}

function initResourcesHub() {
  const hub = document.querySelector('.resources-hub');
  if (!hub) return;

  const tabs = Array.from(hub.querySelectorAll('.resources-tab'));
  const panels = Array.from(hub.querySelectorAll('.resource-panel'));
  const select = hub.querySelector('.resources-nav-select');
  const topics = tabs.map(function (tab) {
    return tab.getAttribute('data-topic');
  });
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getTopicFromHash() {
    const hash = window.location.hash.replace(/^#/, '');
    return topics.includes(hash) ? hash : topics[0];
  }

  function activateTopic(topic, updateHash) {
    if (!topics.includes(topic)) return;

    tabs.forEach(function (tab) {
      const isActive = tab.getAttribute('data-topic') === topic;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach(function (panel) {
      const panelTopic = panel.id.replace(/^panel-/, '');
      const isActive = panelTopic === topic;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });

    if (select) {
      select.value = topic;
    }

    const activeTab = tabs.find(function (tab) {
      return tab.getAttribute('data-topic') === topic;
    });

    if (activeTab && window.innerWidth < 900) {
      activeTab.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }

    if (updateHash) {
      const nextUrl = topic === topics[0]
        ? window.location.pathname + window.location.search
        : '#' + topic;
      history.replaceState(null, '', nextUrl);
    }
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      activateTopic(tab.getAttribute('data-topic'), true);
    });

    tab.addEventListener('keydown', function (e) {
      let nextIndex = null;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex === null) return;

      e.preventDefault();
      tabs[nextIndex].focus();
      activateTopic(tabs[nextIndex].getAttribute('data-topic'), true);
    });
  });

  if (select) {
    select.addEventListener('change', function () {
      activateTopic(select.value, true);
    });
  }

  window.addEventListener('hashchange', function () {
    activateTopic(getTopicFromHash(), false);
  });

  activateTopic(getTopicFromHash(), false);
}
