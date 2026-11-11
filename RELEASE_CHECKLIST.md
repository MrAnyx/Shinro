# Shinro Pre-Release Validation Checklist

Run this checklist from top to bottom against the exact release candidate in a dedicated staging environment. Check an item only after verifying its expected result. Record the release tag/commit, tester, date, environment, browser, failures, and evidence. Never run destructive checks against production.

## Release Information

- [ ] Release/tag: ______________________________
- [ ] Commit SHA / image digest: ______________________________
- [ ] Tester and date: ______________________________
- [ ] Staging URL: ______________________________
- [ ] Browser/device: ______________________________
- [ ] Staging database backup reference: ______________________________

## 1. Prepare A Safe Test Environment

- [ ] Confirm this is a disposable or isolated staging environment, not production.
- [ ] Confirm the tested deployment was built from the release candidate commit/tag above.
- [ ] Confirm staging PostgreSQL is reachable and contains no production personal data.
- [ ] Confirm staging Redis is reachable and is not shared with production.
- [ ] Confirm all required environment values are set: `NODE_ENV`, `DATABASE_URL`, `REDIS_URL`, `TMDB_TOKEN`, `TMDB_LANGUAGE`, `TMDB_INCLUDE_NSFW`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `NUXT_PUBLIC_ALLOW_REGISTRATION`, `NUXT_PUBLIC_ENABLE_MOVIES`, `NUXT_PUBLIC_ENABLE_SERIES`, `NUXT_PUBLIC_ENABLE_MUSICS`, `NUXT_PUBLIC_ENABLE_BOOKS`, and `NUXT_PUBLIC_ENABLE_GAMES`.
- [ ] Confirm TMDb credentials are staging credentials and adult-content policy is set intentionally.
- [ ] Record the movie and TV show TMDb IDs to use for repeatable checks.
- [ ] Prepare synthetic accounts: one account for the first/admin user, one normal user, one other user for isolation checks, and one disposable account for deletion tests.
- [ ] Prepare test media with complete metadata, sparse/missing optional metadata, artwork, and punctuation/non-Latin/long titles where available.
- [ ] Prepare collections: empty, one item, multiple items, and similarly named collections.
- [ ] Take a staging database backup and confirm a restore procedure is available before migration or deletion checks.

## 2. Run Build And Repository Checks

Run from the repository root on the exact release candidate. Save command output and exit codes.

- [ ] Install dependencies from the lockfile using the pinned pnpm version and frozen lockfile mode. Expected: install completes without changing the lockfile.
- [ ] Run `pnpm db:generate`. Expected: Prisma Client generates successfully.
- [ ] Run `pnpm lint`. Expected: no lint errors.
- [ ] Run `pnpm fmt`. Expected: formatting check passes.
- [ ] Run `pnpm typecheck`. Expected: no TypeScript/Nuxt type errors.
- [ ] Run `pnpm build`. Expected: production build completes successfully.
- [ ] Review schema/migration changes. Expected: every migration is understood, reviewed, and tested on a disposable database; no unexplained destructive operation exists.
- [ ] Apply pending migrations to a disposable database using the release/deployment procedure. Expected: migrations complete and the application starts against the migrated schema.
- [ ] Confirm the CI run is green. Note: current CI runs Prisma generation, lint, format, and typecheck; it does not run a dedicated test suite or production build. Do not treat CI alone as complete release verification.
- [ ] Confirm the artifact/image being staged corresponds to the recorded commit. Note: the repository's CD workflow currently has build/publish steps commented out, so verify the actual deployment path explicitly.

## 3. Start The Release Candidate And Check The Public App

- [ ] Start/deploy the production build using production-like configuration.
- [ ] Open the application URL over HTTPS. Expected: landing page loads, no blank screen, broken assets, or application error page.
- [ ] Open browser developer tools. Expected: no unexplained console errors, failed app chunks, or repeated failing requests.
- [ ] Refresh the landing page. Expected: it still loads correctly.
- [ ] Open login and registration using both in-app links and direct URLs. Expected: both routes load when registration is enabled.
- [ ] Check the server logs. Expected: no startup errors, leaked credentials, session tokens, passwords, or unexplained 5xx errors.
- [ ] Confirm the running application can reach PostgreSQL, Redis, and TMDb.

## 4. Verify Registration And User Roles

Use only the disposable staging database/accounts.

- [ ] Set `NUXT_PUBLIC_ALLOW_REGISTRATION=true` and open the registration page.
- [ ] Register the first test user with valid credentials. Expected: account creation succeeds and user is signed in.
- [ ] Verify the first account has ADMIN role using an approved test/admin inspection method.
- [ ] Sign out, then register a second account. Expected: it is created with USER role, not ADMIN.
- [ ] Try registering a username that already exists. Expected: request is rejected with a useful error; no second account is created.
- [ ] Try blank, too-short, too-long, and otherwise invalid usernames/passwords at the UI. Expected: field validation explains the problem and no account is created.
- [ ] Repeat invalid registration attempts through the server/API boundary if available. Expected: server validation also rejects them; client checks alone are not relied upon.
- [ ] Try matching and mismatched password confirmations during registration and profile updates. Expected: mismatches appear on the confirmation field and valid passwords save normally.
- [ ] Confirm an action both with and without password re-verification, including an incorrect password. Expected: password is required only when re-verification is needed, and an incorrect password does not run the action.
- [ ] Set `NUXT_PUBLIC_ALLOW_REGISTRATION=false` and try the registration route directly.
- [ ] Try registration through the server/API while registration is disabled. Expected: registration is rejected server-side, not merely hidden in the UI.
- [ ] Restore the release's intended registration flag after testing.

## Series/Season Cleanup Checks

- [ ] Open a season form with and without a preselected series. Expected: the selected series name or the placeholder remains visible; opening the selector without typing does not request the complete series list.
- [ ] Search for internal series, type rapidly, clear the search, and simulate a failed request. Expected: only the first matching page is offered, stale results do not replace newer ones, and errors are visible.
- [ ] Exercise table action buttons and dropdowns across movies, series, seasons, and collections. Expected: the action runs without triggering row navigation; clicking the row still navigates normally.
- [ ] Check My List toggle columns in movie and series search results, movie saga, series seasons, and season episodes. Expected: no visible column header, and the toggles remain usable without triggering row navigation.
- [ ] Navigate between internal and external series and season routes, including missing items. Expected: details, collections, episodes, credits, and not-found states match the current route without stale data.
- [ ] Select user-created and TMDB-imported seasons from the season listing, including season 0. Expected: user-created seasons open their internal IDs; imported seasons open the external series ID and season number. If an imported season has no TMDB series ID, an error is shown instead of navigating to an invalid URL.
- [ ] Create and update media with empty, null, omitted, and invalid optional fields and collection IDs. Expected: valid inputs retain existing normalization and invalid IDs or fields are rejected at the server boundary.

## 5. Verify Login, Session, And Route Protection

- [ ] Sign in with a known correct username and password. Expected: authentication succeeds and the app opens.
- [ ] Sign in using a correct username and incorrect password. Expected: authentication fails and no session is created.
- [ ] Try a nonexistent username and invalid/empty credentials. Expected: login fails safely without an unhandled error or session.
- [ ] Inspect browser cookies. Expected: `session_id` is HttpOnly, SameSite=Strict, scoped to `/`, expires according to policy, and Secure in production HTTPS.
- [ ] Inspect browser storage and network activity. Expected: session ID is not stored in localStorage/sessionStorage or exposed to application JavaScript; password is not echoed or logged.
- [ ] Refresh a protected page while signed in. Expected: session remains valid and private data loads.
- [ ] Open a second tab while signed in. Expected: both tabs use the same authenticated session.
- [ ] Open `/app`, `/app/movies`, `/app/series`, and a private API route in a logged-out browser. Expected: pages redirect or show the logged-out state; private APIs reject without returning data.
- [ ] Try protected requests with a random session cookie and an expired session. Expected: requests are rejected and private data remains unavailable.
- [ ] Make an authenticated request near session expiry. Expected: session refresh behavior matches the configured policy.
- [ ] Sign out in one tab, then try an action in both tabs. Expected: server-side session is invalidated and protected actions require login again.
- [ ] While signed in, open login and registration directly. Expected: guest-only routes redirect appropriately and do not create another session/account.

**Mandatory stop condition:** the current code in `server/trpc/routers/user.ts` appears to reject a password when `bcrypt.compare()` returns true, and continue when it returns false. If the correct-password test fails or an incorrect-password test succeeds, mark this section failed and stop release testing for a NO-GO decision until fixed and retested.

## 6. Check Dashboard And Navigation

- [ ] Open the dashboard with an empty account. Expected: useful empty state, no runtime errors.
- [ ] Open the dashboard with populated data. Expected: totals, recent media, and favorite collections match saved records.
- [ ] Add/remove media and favorite/unfavorite a collection; revisit the dashboard. Expected: dashboard values update and remain correct after refresh.
- [ ] Use all shipped sidebar links. Expected: correct page opens and selected navigation state is accurate.
- [ ] Use browser back/forward and direct URLs for shipped pages. Expected: navigation works and private data does not flash before authentication finishes.
- [ ] Inspect Books, Music, Games, and Stats entries. Expected: incomplete/disabled features are clearly presented as unavailable and do not masquerade as working flows.

## 7. Check Movies

- [ ] Open the movie library with no movies. Expected: correct empty state.
- [ ] Open the populated movie library. Expected: records and totals match the account's saved data.
- [ ] Search by full title, partial title, mixed case, punctuation, and a title that is not present. Expected: correct local results and useful no-results state.
- [ ] Clear the search. Expected: full list returns.
- [ ] Move through first, middle, and last pages. Expected: no missing/duplicated records; page controls behave correctly at boundaries.
- [ ] Search TMDb for a known movie. Expected: correct result identity, title, release date, poster, and available metadata are shown.
- [ ] Add the movie from TMDb. Expected: it appears once in the library and remains after refresh.
- [ ] Attempt to add the same TMDb movie again. Expected: duplicate is rejected or handled idempotently; no duplicate record appears.
- [ ] Open the movie detail page. Expected: correct metadata/credits/franchise information when available; absent optional data and missing artwork use graceful fallbacks.
- [ ] Open the detail page of an external movie (`/app/movies/external/<tmdbId>`) both in and not in the library. Expected: one details request (`movie.getExternalDetails`) returns TMDb data plus the saved movie and its collections when it is in the library, and no saved movie or collections otherwise; "Add to My List" or the edit/remove/status/collection/rating controls match that state.
- [ ] Open an external movie ID that does not exist in TMDb. Expected: `movie.getExternalDetails` returns `NOT_FOUND` and the page shows "Movie not found"; TMDb authentication, rate-limit, and service errors are not reported as missing movies.
- [ ] Simulate TMDb 404 responses for other resource requests, including TV details, credits, and movie collections. Expected: each returns `NOT_FOUND`; non-404 TMDb errors remain distinguishable.
- [ ] On an external movie detail page with a saga, use the saga table to add the currently displayed unsaved movie. Expected: its row switches to added and the sidebar immediately switches from "Add to My List" to the edit/remove/status/collection/rating controls; the saved state remains correct after refresh.
- [ ] On an external movie detail page with a saga, remove both the current movie and another saga movie through their table controls. Expected: each row switches to unadded without an error; removing the current movie also switches the sidebar back to "Add to My List".
- [ ] On the movie detail page, select and deselect collections, including clearing all of them, and open the edit modal to change them. Expected: the selection updates immediately, matches the collections returned by the server once the update completes, stays correct after refresh, and resets when the movie is removed; a failed update shows an error toast and reverts to the previous selection.
- [ ] Open the detail page of an internal movie (`/app/movies/internal/<id>`). Expected: one details request (`movie.getInternalDetails`) returns the saved movie and its collections; no TMDb-only sections (credits, saga, genres, badges) appear; another user's or unknown ID gives a controlled not-found state.
- [ ] On the movie detail page, add, remove, edit, and change collections, then refresh. Expected: the page updates immediately and the state after refresh matches; selected collections reflect saved memberships.
- [ ] Change the movie's status, rating (including minimum, maximum, and cleared value), and note. Expected: the rating control updates immediately and saves after a short debounce, with rapid changes sending only the last value; the status control updates immediately and settles on the server response; valid changes persist after refresh; invalid values are rejected. On a failed status or rating update, an error toast appears and the last server-confirmed value remains displayed.
- [ ] Edit available movie metadata. Expected: changes show in list and detail without creating a second record.
- [ ] Create a movie manually with valid required fields and optional fields. Expected: record is saved and rendered consistently.
- [ ] Try invalid manual movie values at the UI and server boundary. Expected: validation rejects them without partial records.
- [ ] Assign a movie to a collection, move it to another collection, and remove the assignment. Expected: membership updates correctly without deleting the movie or creating duplicate links.
- [ ] Remove a movie and confirm the action. Expected: only the intended movie and associated links are removed; dashboard totals update.
- [ ] Search for an unknown title in TMDb. Expected: clear empty state and no bogus saved record.
- [ ] Simulate TMDb timeout, rate limit, invalid credentials, or unavailable response in staging. Expected: recoverable error, retry works, no false success, and no credential leakage.
- [ ] Repeat a TMDb request, then clear cache as ADMIN and repeat. Expected: cached data is correct; cache clearing does not delete user data or library records.
- [ ] Test adult-content results with the configured policy. Expected: results obey `TMDB_INCLUDE_NSFW` and the intended content policy.
- [ ] Open an unknown or malformed movie ID. Expected: controlled not-found state; app remains usable and does not expose another user's record.

## 8. Check Series

- [ ] Repeat the movie list checks for empty/populated states, local search, clearing search, and pagination.
- [ ] Search TMDb for a known TV series. Expected: correct series identity, metadata, credits, and artwork where available.
- [ ] Add the series and refresh. Expected: exactly one series is saved.
- [ ] Attempt to add the same series again. Expected: duplicate is rejected or handled idempotently.
- [ ] Open its detail page, then test missing artwork/optional metadata. Expected: fallbacks render and the page remains usable.
- [ ] Check external series badges with populated, missing, and zero-valued season/episode metadata. Expected: last-air date and status appear only when present; counts show their values (or "No season"/"No episode" for zero) and are hidden when absent.
- [ ] Check the series release badge with a future, past, and missing first-air date. Expected: it displays Upcoming, Released, and Unknown respectively.
- [ ] Create a series manually and edit it. Expected: valid fields persist; invalid values are rejected without partial records.
- [ ] Change each supported status/rating/note field. Expected: data persists after refresh and remains associated with the correct account.
- [ ] Assign and unassign the series from collections. Expected: membership is correct and no duplicate links appear.
- [ ] Simulate TMDb empty results, timeout/rate limit, and unavailable service. Expected: useful recoverable state and no leaked token.
- [ ] Set `NUXT_PUBLIC_ENABLE_SERIES=false`; try navigation, direct series URLs, and authenticated `serie`, `season`, and `tmdbSerie` queries and mutations. Expected: navigation is hidden, pages and procedures return not found, and the dashboard and enabled movie feature still initialize.
- [ ] Apply the media external-ID migration on an isolated database with existing data. Verify all rows remain and a user can save a movie and a series with the same TMDB ID, but cannot save a duplicate of the same type; verify movie and series external-ID and collection lookups return the correct type and owner.
- [ ] Create, edit, rate, set status, organize and delete internal and TMDB series; check listing/search pagination, saved badges, counts, dashboard and collections. Verify both details routes use the same page, with TMDB-only metadata shown only for external series.
- [ ] Check series access as another user and logged out, malformed IDs, missing TMDB fields, empty search and TMDB errors. Expected: no cross-user data, controlled errors, and no fabricated saved state.
- [ ] Delete a series with saved seasons and episodes in an isolated database. Verify all descendant media and collection links are removed atomically; mismatched descendant ownership rejects the deletion without removing anything.
- [ ] Check series pages and controls with keyboard navigation and narrow/mobile viewports; ensure labels, focus, confirmation dialogs and responsive layout remain usable.
- [ ] Set `NUXT_PUBLIC_ENABLE_MOVIES=false`; try navigation, direct movie URLs, and authenticated `movie` and `tmdbMovie` queries and mutations. Expected: navigation is hidden, pages and procedures return not found, and the dashboard and enabled series feature still initialize. Repeat with both flags disabled.
- [ ] Restore the release's intended movie/series flags and verify enabled routes work again.
- [ ] Open an external series with multiple seasons, specials (season 0), missing artwork and an empty season list. Expected: the Seasons tab shows TMDB metadata and saved state, including after refresh; it remains usable by keyboard and on narrow screens.
- [ ] With an older cached series-details response present, open its external details page. Expected: the season list loads from the new cache entry without waiting for the old entry to expire.
- [ ] Add and remove seasons on saved and unsaved series. Expected: adding the first season also saves its series atomically; rows, sidebar and library counts update and persist after refresh. Canceling removal changes nothing; confirming removes the season, its owned episodes and collection links, but not the series or other seasons. Deleting the series clears all season rows and counts.
- [ ] Delete a series while the season count request fails. Expected: the series remains deleted, the page reflects the deletion, and an error explains that the season count could not be refreshed.
- [ ] Try duplicate, nonexistent and another user's seasons, mismatched descendant ownership, and TMDB failures. Expected: controlled errors, no cross-user changes or partial records, and no false saved state.
- [ ] Open Seasons from the sidebar with an empty list and with saved seasons across multiple pages. Search by title, overview and series name, clear the search, refresh, and select a row. Expected: only the current user's seasons appear, pagination works, and each row opens its saved-season details without requiring TMDB.
- [ ] Edit a season from the list and details, including status, rating, note and collections; refresh and verify persistence. Reject invalid titles and ratings, and verify failed requests report errors without claiming success.
- [ ] Cancel and confirm season deletion from the list and details, including the last row on a later page. Expected: cancellation changes nothing; confirmation removes the season and its saved episodes, updates the count and list, and leaves its series intact.
- [ ] Check season pages with another user's ID, while logged out, and with series disabled; verify no data is exposed or modified. Exercise the list and edit/delete controls by keyboard and on narrow screens.
- [ ] Open saved external seasons, including season 0, and check the Episodes and Credits tabs against TMDB. Verify episode order, saved episode overrides, missing artwork and dates, empty results, credit links, keyboard navigation and narrow-screen layout. Internal seasons show only owned saved episodes and an empty credits state.
- [ ] Check episode durations on external season details and saved external seasons opened through their internal route. Expected: available TMDB runtimes are displayed; missing or null runtimes and episodes without stored runtimes leave the duration cell empty.
- [ ] Simulate a TMDB episode or credits failure independently. Expected: the affected tab shows a retry action without hiding the season or the other tab; retry works. Verify logged-out users, another user's season ID, and disabled series cannot retrieve either endpoint.
- [ ] Open saved and unsaved episode details from a season and the paginated episode library. Verify parent links, duration, missing artwork and keyboard/mobile use; no episode search is offered.
- [ ] Add an episode with unsaved, partially saved and saved parents. Verify atomic creation, persistence, duplicate handling, ownership, disabled series and TMDB failures. Remove it and verify parents remain; check status, rating and collections persist.
- [ ] Toggle episodes in a season's Episodes tab on and off, including season 0, unsaved parents, saved external seasons opened internally, and internal seasons. Verify persisted membership, parent counts, cancellation, deletion of personal episode data, failure states, keyboard labels and concurrent clicks.
- [ ] Check season release and TMDB vote badges on external routes and saved external seasons opened internally, including upcoming, released, season 0 and missing metadata. Internal-only seasons must not show TMDB badges; metadata failures on internal routes show a retry without hiding the season.
- [ ] Click different cells of episode rows in the library and on internal and external season pages, and focus rows and activate them with Enter or Space. Expected: each opens the correct episode without a separate title link; the My List toggle does not navigate away.
- [ ] Open episode details from the library and season rows, refresh and directly visit `/app/series/{series-id}/seasons/{season-number}/episodes/{episode-number}` for TMDB and owned internal series, including season 0. Check parent links, nonexistent or another user's episodes, malformed parameters, feature flags, and My List actions.
- [ ] Check season and episode breadcrumbs on external, internal, and saved external routes, including season 0 and missing names. Expected: series and season ancestors link to the correct details, the current item is not a link, and breadcrumbs work by keyboard and on narrow screens.
- [ ] Visit previously shared `/app/episodes/internal/...` and `/app/episodes/external/...` episode links. Expected: they redirect to the corresponding series/season episode URL; missing episodes and failed lookups do not navigate to another user's data.
- [ ] Check the episode sidebar and My List counts after sign-in, reload, adding and removing episodes, and deleting seasons or series with episodes. Verify canceled or failed mutations do not change counts, concurrent loads do not restore stale totals, failures to refresh after deletion are reported, other users' episodes are excluded, and disabled series does not load counts.

## 9. Check Collections

- [ ] Open the collections page with zero collections. Expected: correct empty state.
- [ ] Create a collection with a valid name and available optional values such as color. Expected: it appears once and persists after refresh.
- [ ] Try blank, whitespace-only, duplicate, too-short/too-long, and special-character names. Expected: validation/duplicate rules are enforced without corrupt records.
- [ ] Search collections by full/partial name and no-match value. Expected: correct results and useful no-results state.
- [ ] Paginate through collections. Expected: correct records and page boundaries.
- [ ] Edit a collection. Expected: changes persist; media membership and favorite state remain intact.
- [ ] Favorite the collection. Expected: favorite state is visible and dashboard reflects it.
- [ ] Unfavorite the collection. Expected: state changes and dashboard no longer lists it as a favorite.
- [ ] Assign multiple movies and series to a collection. Expected: each membership is reflected accurately.
- [ ] Remove one media item from the collection. Expected: membership is removed but the media item remains in the library.
- [ ] Delete an empty collection after confirmation. Expected: only that collection is removed.
- [ ] Delete a populated collection after confirmation. Expected: collection/membership links are removed per product behavior; underlying media remains.
- [ ] Cancel a deletion confirmation. Expected: no data changes.
- [ ] Open the collection detail URL. Expected: recognize this is currently a placeholder, not a supported collection-detail workflow; report a defect if navigation presents it as functional.

## 10. Check Profile, Appearance, Cache, And Account Deletion

- [ ] Change username to a valid unused name. Expected: new name persists after refresh and can be used to log in.
- [ ] Try to change username to another user's name and to invalid boundary values. Expected: update is rejected and existing username remains unchanged.
- [ ] Change password with matching confirmation. Expected: new password works; old password no longer works; password fields clear after success.
- [ ] Submit mismatched password confirmation and invalid password values. Expected: clear validation error and no password change.
- [ ] Change theme/appearance setting and navigate/reload. Expected: theme is applied consistently and text remains readable.
- [ ] As normal USER, try cache clear via UI and direct API. Expected: operation is forbidden.
- [ ] As ADMIN, clear cache after confirmation. Expected: operation succeeds and clears cached data only; library, accounts, and sessions remain intact.
- [ ] Start account deletion on the disposable account and cancel. Expected: account and data remain intact.
- [ ] Start account deletion and enter an incorrect password. Expected: deletion is rejected and account remains usable.
- [ ] Start account deletion and confirm with the correct password. Expected: account is deleted, session is invalidated, and account-owned data is cascaded/deleted as designed.
- [ ] Try the deleted account's old session cookie against protected routes/APIs. Expected: access is rejected.
- [ ] Verify other test accounts and their data still work after deletion.

## 11. Verify Authorization And Data Isolation

- [ ] Sign in as `T-USER`; record IDs for that user's media and collections.
- [ ] Sign in as `T-OTHER`; attempt to read `T-USER` records through UI routes and direct API requests. Expected: no private data or existence details are exposed.
- [ ] As `T-OTHER`, attempt to edit, favorite, assign, or delete `T-USER` records. Expected: all operations are denied or return not-found; no data changes.
- [ ] Call protected operations with no cookie, a random cookie, expired cookie, and deleted-user cookie. Expected: unauthorized responses and no side effects.
- [ ] Call admin-only cache clear as USER and ADMIN. Expected: USER is forbidden; ADMIN succeeds.
- [ ] Submit malformed IDs, oversized strings, unsupported enum values, unexpected fields, and malformed payloads directly to tRPC. Expected: server validation rejects all invalid input safely.
- [ ] Inspect production API errors. Expected: no stack traces, filesystem paths, database details, environment values, passwords, or third-party secrets are returned.
- [ ] Verify duplicate constraints and delete/cascade behavior. Expected: no orphaned, duplicated, or cross-owned records.

## 12. Check Responsive And Accessible Use

Repeat core flows on current Chrome/Edge and Firefox; use Safari/WebKit when included in the supported browser matrix. Check desktop, tablet, and narrow mobile viewports.

- [ ] Landing, dashboard, movie/series lists, details, collections, and settings fit without horizontal overflow or clipped controls.
- [ ] Text and controls do not overlap at narrow widths or when titles are long.
- [ ] Complete login, search, create/edit, modal confirmation, and navigation using keyboard only.
- [ ] Confirm every interactive control has visible focus and a meaningful accessible name.
- [ ] Confirm modal focus is managed correctly; Escape/cancel behavior is safe; focus returns after closing.
- [ ] Confirm form errors are associated with inputs and understandable without relying only on color.
- [ ] Check contrast and readability in each supported theme.
- [ ] Use a screen reader spot check on login, a form with validation errors, a detail page, and a confirmation dialog.
- [ ] Simulate slow network and image failures. Expected: loading/fallback states appear; app remains navigable; repeated submissions do not create duplicates.

## 13. Check Service Failure, Scale, And Recovery

Perform these only in isolated staging and coordinate any service disruption.

- [ ] Make Redis unavailable during a request. Expected: controlled error/fallback according to policy; app recovers after Redis returns.
- [ ] Make PostgreSQL unavailable during a request. Expected: no false success; controlled failure; app recovers after database returns.
- [ ] Make TMDb unavailable or rate-limited. Expected: recoverable user-facing error, retry behavior, and no credential leakage.
- [ ] Use a representative large library (hundreds of media records and dozens of collections). Expected: search/pagination remain correct with no missing or duplicated rows and acceptable response/render time.
- [ ] Restart the application/container. Expected: application returns to service; persistent data remains intact; sessions behave according to policy.
- [ ] Inspect the scheduled `hello` task, configured every minute. Expected: it is harmless and does not create noisy or unexpected work.
- [ ] Review logs/monitoring after these checks. Expected: errors are observable and correlated without exposing sensitive data.

## 14. Verify Migration And Recovery

- [ ] Confirm a pre-migration backup exists and its restore has been tested on a separate disposable database.
- [ ] Apply the release migration to a copy of representative prior-release data.
- [ ] Compare record counts and sample user, session, collection, media, movie, and series relationships before and after migration.
- [ ] Test populated, empty, nullable, and boundary-value data affected by the migration.
- [ ] Start the release candidate against the migrated data and repeat smoke checks.
- [ ] Write down the recovery approach: forward fix, restore, or other reviewed procedure. Do not assume Prisma migrations automatically roll back.
- [ ] Confirm no one ran `pnpm db:reset` or `pnpm db:push` against production. Use only the approved production migration process.

## 15. Final Release Decision

- [ ] All build/repository checks pass.
- [ ] All smoke checks pass.
- [ ] All P0 and P1 cases pass; no P0/P1 defect remains open.
- [ ] P2/P3 exceptions have an owner and explicit approval.
- [ ] Login accepts correct credentials and rejects incorrect credentials.
- [ ] User isolation, account deletion, and backup/recovery checks pass.
- [ ] Enabled/disabled feature flags match the intended release configuration.
- [ ] Logs and monitoring have no unexplained critical errors or sensitive data.
- [ ] The production artifact is the same artifact/commit tested in staging.
- [ ] Record decision: **GO / NO-GO** ______________________________
- [ ] Approver: ______________________________

After deployment, run only non-destructive production smoke checks: open the app, sign in with an approved test account, load dashboard and lists, open a detail page, and review health/error monitoring. Do not delete accounts, clear cache, create bulk test data, or experiment with migrations in production.

## Known Product Limitations To Track

- Books, music, games, statistics, and Spotify-backed workflows are not currently complete user features.
- Collection detail is currently a placeholder; verify collection CRUD, favorites, and media assignment rather than treating the detail page as complete.
- Season detail and episode management are incomplete and should not be accepted as functional.
- There is currently no dedicated test/spec suite or test script; manual staging validation remains necessary until automated coverage is added.
