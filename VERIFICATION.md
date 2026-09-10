# Verification record

Verified on September 10, 2026, using the actual HTML/CSS/JavaScript in a browser served over local HTTP.

## Live API and visual checks

- Successfully searched `octocat` against the public GitHub REST API.
- Confirmed the profile, eight loaded repositories, language summary, six repository cards, and GitHub links rendered.
- Reviewed desktop light and dark layouts and the narrow mobile profile, statistics, language bar, and repository cards.
- Corrected large overview totals wrapping awkwardly on narrow screens by using compact notation with exact-value tooltips and accessible labels.

## Controlled browser checks: 25 passed

An isolated test page loaded the real application in an iframe with controlled GitHub responses; test fixtures were not added to the production application.

1. Loading skeleton visibility.
2. Stars and forks totals across multiple repository pages.
3. Ranking a high-star repository from a later page first.
4. Language percentages excluding repositories without a primary language.
5. Untrusted API text displayed literally without interpreting HTML.
6. Missing bio and location fallbacks.
7. Five-minute memory cache and `@` prefix normalization.
8. Retry bypassing the cache.
9. Theme toggle changing the active theme.
10. Saving the selected theme preference.
11. Blank input validation.
12. Profile URL input validation.
13. Missing-user (404) message.
14. Rate-limit message including GitHub's reset time.
15. Network failure guidance.
16. Server failure handling.
17. Timeout handling (timer shortened in the isolated test).
18. Repository-page failure hiding incomplete totals.
19. Zero totals and empty states for accounts without repositories.
20. An old request finishing after a newer search cannot overwrite it.
21. Pagination-cap warning and partial-coverage label.
22–25. No horizontal document overflow at 320, 390, 768, and 1440 CSS pixels.

## Limits

Error cases and pagination edge cases were tested with controlled responses, not by deliberately exhausting GitHub's live rate limit. This is a focused browser check, not a full cross-browser or assistive-technology certification. GitHub Pages deployment is documented and ready, but no repository was created or published as part of this local project delivery.
