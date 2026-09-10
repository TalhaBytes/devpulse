/* DevPulse: no dependencies, authentication, or build step. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const number = new Intl.NumberFormat('en');
  const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
  const cache = new Map();
  const CACHE_TTL = 5 * 60 * 1000;
  const MAX_PAGES = 10;
  let activeSearch;
  let lastUsername = '';
  const colors = { JavaScript: '#e5c85a', TypeScript: '#67a5e8', Python: '#77b4cd', HTML: '#ee8b66', CSS: '#b496e4', Java: '#dd9b68', Go: '#73d6d1', Rust: '#dea283', C: '#a9b4c4', 'C++': '#e697b1', Ruby: '#e88183', Shell: '#b6d984', Swift: '#f3a46a', Kotlin: '#c59afb', PHP: '#a0a5e4' };
  const fallbackColors = ['#8dcf9b', '#c1abeb', '#eda793', '#8fbce5', '#d4c979'];
  function colorFor(language) {
    return colors[language] || fallbackColors[Array.from(language).reduce((sum, c) => sum + c.charCodeAt(0), 0) % fallbackColors.length];
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function setStatistic(id, value) {
    $(id).textContent = value >= 10000 ? compactNumber.format(value) : number.format(value);
    $(id).title = number.format(value);
    $(id).setAttribute('aria-label', number.format(value));
  }
  function dot(language) {
    const node = element('span', 'dot');
    node.style.backgroundColor = colorFor(language);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $('theme-toggle').textContent = theme === 'dark' ? '☀' : '☾';
    $('theme-toggle').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    try { localStorage.setItem('devpulse-theme', theme); } catch { /* Storage is optional. */ }
  }
  let savedTheme;
  try { savedTheme = localStorage.getItem('devpulse-theme'); } catch { /* Use device preference. */ }
  setTheme(['dark', 'light'].includes(savedTheme) ? savedTheme : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  $('theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  class ApiError extends Error {
    constructor(title, message) { super(message); this.title = title; }
  }
  async function request(path, signal) {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) controller.abort();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    try {
      const response = await fetch(`https://api.github.com${path}`, { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } });
      if (response.status === 404) throw new ApiError('Profile not found', 'We couldn’t find that GitHub username. Check the spelling and try another profile.');
      if (response.status === 403 || response.status === 429) {
        const reset = Number(response.headers.get('x-ratelimit-reset'));
        const time = reset > 0 ? ` Try again after ${new Date(reset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : ' Please wait a few minutes before trying again.';
        throw new ApiError('GitHub is limiting requests', 'GitHub temporarily restricted this request.' + time);
      }
      if (!response.ok) throw new ApiError('GitHub is unavailable', 'GitHub couldn’t complete this request. Please try again shortly.');
      return { data: await response.json(), more: /rel="next"/.test(response.headers.get('link') || '') };
    } catch (error) {
      if (signal.aborted) throw error;
      if (timedOut) throw new ApiError('The request timed out', 'GitHub took too long to respond. Please check your connection and try again.');
      if (error instanceof ApiError) throw error;
      throw new ApiError('Couldn’t connect to GitHub', 'Check your internet connection and try again. GitHub may also be temporarily unavailable.');
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
    }
  }
  function showState(state) {
    $('loading').hidden = state !== 'loading';
    $('dashboard').hidden = state !== 'success';
    $('welcome').hidden = state !== 'welcome';
    $('error-panel').hidden = state !== 'error';
    $('dashboard').setAttribute('aria-busy', String(state === 'loading'));
  }
  function showError(error) {
    showState('error');
    $('status').textContent = '';
    $('error-title').textContent = error.title || 'Something went wrong';
    $('error-message').textContent = error.message;
  }
  async function search(raw, force = false) {
    activeSearch?.abort();
    const controller = new AbortController();
    activeSearch = controller;
    const username = raw.trim().replace(/^@/, '');
    $('username').value = username;
    if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) || username.includes('--')) {
      $('username').setAttribute('aria-invalid', 'true');
      $('retry').hidden = true;
      showError(new ApiError('Enter a GitHub username', 'Use 1–39 letters, numbers, or single hyphens. Enter a username, such as octocat, rather than a profile URL.'));
      $('username').focus();
      return;
    }
    $('username').removeAttribute('aria-invalid');
    $('retry').hidden = false;
    lastUsername = username;
    showState('loading');
    $('status').textContent = `Finding @${username}…`;
    try {
      let result = cache.get(username.toLowerCase());
      if (force || !result || Date.now() - result.time > CACHE_TTL) {
        const { data: user } = await request(`/users/${encodeURIComponent(username)}`, controller.signal);
        let repositories = [], more = false;
        for (let page = 1; page <= MAX_PAGES; page++) {
          const response = await request(`/users/${encodeURIComponent(user.login)}/repos?type=owner&sort=updated&per_page=100&page=${page}`, controller.signal);
          repositories.push(...response.data);
          more = response.more;
          if (!more) break;
          if (!controller.signal.aborted) $('status').textContent = `Loading @${user.login} · ${number.format(repositories.length)} repositories so far…`;
        }
        // Pagination can overlap if a repository changes while pages are being fetched.
        repositories = [...new Map(repositories.map(repo => [repo.id, repo])).values()];
        result = { user, repositories, limited: more, time: Date.now() };
        if (!controller.signal.aborted) {
          if (cache.size >= 15) cache.delete(cache.keys().next().value);
          cache.set(username.toLowerCase(), result);
        }
      }
      if (controller.signal.aborted) return;
      render(result);
      showState('success');
      $('status').textContent = result.limited
        ? `Showing the ${number.format(result.repositories.length)} most recently updated repositories. Stars, forks, languages, and rankings cover this subset.`
        : `@${result.user.login} · ${number.format(result.repositories.length)} public repositories loaded.`;
    } catch (error) {
      if (!controller.signal.aborted) showError(error);
    }
  }
  function render({ user, repositories, limited }) {
    $('profile-name').textContent = user.name || user.login;
    $('profile-handle').textContent = `@${user.login}`;
    const profileUrl = `https://github.com/${encodeURIComponent(user.login)}`;
    $('profile-handle').href = profileUrl;
    $('github-link').href = profileUrl;
    $('avatar').alt = `${user.login}'s avatar`;
    $('avatar').onerror = () => { $('avatar').onerror = null; $('avatar').src = 'assets/favicon.svg'; };
    $('avatar').src = user.avatar_url || 'assets/favicon.svg';
    $('bio').textContent = user.bio || 'This developer is letting their code do the talking. No bio added yet.';
    $('location').textContent = user.location ? `⌖  ${user.location}` : '⌖  Location not shared';
    const joined = new Date(user.created_at);
    $('joined').textContent = Number.isNaN(joined.getTime()) ? 'Join date unavailable' : `◷  Joined ${joined.toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })}`;
    for (const key of ['followers', 'following']) $(key).textContent = number.format(user[key] || 0);
    setStatistic('repo-count', user.public_repos || 0);
    setStatistic('star-count', repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0));
    setStatistic('fork-count', repositories.reduce((sum, repo) => sum + (repo.forks_count || 0), 0));
    $('data-note').textContent = limited ? 'PARTIAL REPOSITORY COVERAGE' : 'PUBLIC GITHUB DATA';
    renderLanguages(repositories);
    const top = [...repositories].sort((a, b) => (b.stargazers_count - a.stargazers_count) || (b.forks_count - a.forks_count) || a.name.localeCompare(b.name)).slice(0, 6);
    $('shown-count').textContent = top.length;
    $('repositories').replaceChildren();
    if (!top.length) $('repositories').append(element('p', 'empty-repos', 'No public repositories yet. A fresh canvas for something great.'));
    for (const repo of top) {
      const card = element('article', 'repo-card');
      const heading = element('div', 'repo-topline');
      const title = element('h3');
      const link = element('a', '', repo.name);
      link.href = `https://github.com/${encodeURIComponent(user.login)}/${encodeURIComponent(repo.name)}`;
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      title.append(link);
      heading.append(element('span', 'repo-symbol', '▤'), title);
      if (repo.archived || repo.fork) heading.append(element('span', 'repo-badge', repo.archived ? 'Archived' : 'Fork'));
      const metadata = element('div', 'repo-metadata');
      const language = element('span', 'repo-language');
      if (repo.language) language.append(dot(repo.language));
      language.append(document.createTextNode(repo.language || 'Unclassified'));
      const stars = element('span', '', `☆ ${number.format(repo.stargazers_count || 0)}`);
      stars.setAttribute('aria-label', `${repo.stargazers_count || 0} stars`);
      const forks = element('span', '', `⑂ ${number.format(repo.forks_count || 0)}`);
      forks.setAttribute('aria-label', `${repo.forks_count || 0} forks`);
      metadata.append(language, stars, forks);
      card.append(heading, element('p', 'repo-description', repo.description || 'No description provided. Explore the repository on GitHub.'), metadata);
      $('repositories').append(card);
    }
  }
  function renderLanguages(repositories) {
    const counts = new Map();
    repositories.forEach(repo => { if (repo.language) counts.set(repo.language, (counts.get(repo.language) || 0) + 1); });
    const languages = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const total = languages.reduce((sum, entry) => sum + entry[1], 0);
    $('language-bar').replaceChildren();
    $('language-list').replaceChildren();
    if (!total) $('language-list').append(element('span', '', 'No language data available for these repositories.'));
    for (const [language, count] of languages) {
      const percent = count / total * 100;
      const segment = element('span', 'language-segment');
      segment.style.width = `${percent}%`;
      segment.style.backgroundColor = colorFor(language);
      $('language-bar').append(segment);
      const item = element('span', 'language-item');
      item.title = `${count} ${count === 1 ? 'repository' : 'repositories'}`;
      item.append(dot(language), document.createTextNode(language), element('span', 'percentage', `${percent.toFixed(1)}%`));
      $('language-list').append(item);
    }
  }
  $('search-form').addEventListener('submit', event => { event.preventDefault(); search($('username').value); });
  document.querySelectorAll('[data-user]').forEach(button => button.addEventListener('click', () => search(button.dataset.user)));
  $('retry').addEventListener('click', () => search(lastUsername, true));
})();
