// Helmamay Studios social profiles. Add confirmed profile URLs here.
(function () {
  'use strict';
  const profiles = [
    { name: 'Instagram', url: 'https://www.instagram.com/helmamaystudios/' },
    { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61595458545423' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/susan-hollandsworth-bb8b162b3/' }
  ];
  const footer = document.querySelector('.studio-footer');
  if (!footer) return;
  const nav = document.createElement('nav');
  nav.className = 'studio-social-links';
  nav.setAttribute('aria-label', 'Follow Helmamay Studios');
  profiles.filter(profile => profile.url).forEach(profile => {
    const link = document.createElement('a');
    link.href = profile.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = profile.name;
    link.setAttribute('aria-label', profile.name + ' (opens in a new tab)');
    nav.append(link);
  });
  if (nav.childElementCount) footer.prepend(nav);
})();
