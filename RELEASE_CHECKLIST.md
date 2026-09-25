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
- [ ] Set `NUXT_PUBLIC_ALLOW_REGISTRATION=false` and try the registration route directly.
- [ ] Try registration through the server/API while registration is disabled. Expected: registration is rejected server-side, not merely hidden in the UI.
- [ ] Restore the release's intended registration flag after testing.

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
- [ ] Change the movie's status, rating (including minimum, maximum, and cleared value), and note. Expected: valid changes persist after refresh; invalid values are rejected.
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
- [ ] Create a series manually and edit it. Expected: valid fields persist; invalid values are rejected without partial records.
- [ ] Change each supported status/rating/note field. Expected: data persists after refresh and remains associated with the correct account.
- [ ] Assign and unassign the series from collections. Expected: membership is correct and no duplicate links appear.
- [ ] Simulate TMDb empty results, timeout/rate limit, and unavailable service. Expected: useful recoverable state and no leaked token.
- [ ] Set `NUXT_PUBLIC_ENABLE_SERIES=false`; try navigation, direct series URLs, and direct series APIs. Expected: series are inaccessible through UI and server/API paths.
- [ ] Set `NUXT_PUBLIC_ENABLE_MOVIES=false`; try navigation, direct movie URLs, and direct movie APIs. Expected: movies are inaccessible through UI and server/API paths.
- [ ] Restore the release's intended movie/series flags and verify enabled routes work again.
- [ ] Inspect season rows and season add/remove/detail controls. Expected: treat season/episode management as incomplete; an active control leading to a dead route or false success is a defect, not a passed workflow.

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
- Series season/episode controls are incomplete and should not be accepted as functional.
- There is currently no dedicated test/spec suite or test script; manual staging validation remains necessary until automated coverage is added.
