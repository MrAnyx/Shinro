<template>
	<UPageHero
		title="Only the data your library needs"
		description="We need a little data to keep your media library running—not a dossier on every show you abandoned halfway through."
		:ui="{ container: 'py-16 sm:py-20 lg:py-24', footer: 'mt-6' }"
	>
		<template #headline>
			<UBadge label="Privacy Policy" color="primary" variant="subtle" size="lg" />
		</template>

		<template #footer>
			<p class="text-sm text-muted">Last updated: <time datetime="2026-11-08">November 8, 2026</time></p>
		</template>
	</UPageHero>

	<div class="mx-auto mb-20 max-w-6xl px-4 sm:px-6 lg:px-8">
		<section aria-labelledby="short-version" class="mb-20">
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<UPageCard
					title="What we store"
					description="Your username, password hash, and the library data you add. Yes, even that abandoned watchlist."
					icon="i-lucide-database"
					variant="subtle"
				/>
				<UPageCard
					title="One cookie"
					description="An essential session cookie keeps you signed in. Your display preference may also be saved in your browser."
					icon="i-lucide-cookie"
					variant="subtle"
				/>
				<UPageCard
					title="Public API"
					description="Movie searches and details may be requested from TMDB; instance hosting and logs depend on the operator."
					icon="i-lucide-globe"
					variant="subtle"
				/>
				<UPageCard
					title="Delete any time"
					description="Delete your account in Settings to remove its records from the live database. Backups and logs may remain."
					icon="i-lucide-user-round-x"
					variant="subtle"
				/>
			</div>
		</section>

		<article class="mx-auto max-w-6xl space-y-10">
			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted">
					<span class="text-primary">1.</span> Who is responsible?
				</h3>
				<p class="text-default leading-7">
					Shinro is open-source software and can be self-hosted. The person or organization operating the
					instance you use is responsible for that instance and is generally the point of contact for privacy
					requests. They choose the hosting, database, backups, and logging setup, so those details can vary
					between instances.
				</p>
			</section>

			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted">
					<span class="text-primary">2.</span> Information the app handles
				</h3>
				<ul class="list-disc space-y-2 pl-5 text-default leading-7">
					<li>
						<strong>Account information:</strong> your username and password. Passwords are hashed before
						storage; registration does not ask for your email address.
					</li>
					<li>
						<strong>Your library:</strong> collections and media records you create or save, such as titles,
						status, ratings, notes, and external catalogue identifiers.
					</li>
					<li>
						<strong>Sign-in information:</strong> a session identifier and its expiry are stored to
						authenticate your requests.
					</li>
					<li>
						<strong>Technical information:</strong> the instance's hosting provider, reverse proxy, or
						logging setup may record information such as IP addresses, request times, and errors. What is
						recorded and for how long depends on the operator's configuration.
					</li>
				</ul>
				<p class="text-default leading-7">
					Please don't put sensitive personal information in media notes. Shinro is a media shelf, not a
					secure journal with a dramatic soundtrack.
				</p>
			</section>

			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted">
					<span class="text-primary">3.</span> Why information is used
				</h3>
				<p class="text-default leading-7">
					The app uses this information to create and secure your account, save and display your library,
					provide search and catalogue details, and keep the service reliable. Depending on the operator and
					applicable law, processing may be necessary to provide the service you request, protect it from
					misuse, or meet legal obligations.
				</p>
			</section>

			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted">
					<span class="text-primary">4.</span> Cookies and browser storage
				</h3>
				<p class="text-default leading-7">
					Shinro uses an essential, HTTP-only <code>session_id</code> cookie for sign-in. It is marked
					SameSite Strict and, in production, Secure. The cookie has a fixed lifetime; the server-side session
					expiry is refreshed while you use the app. The color-mode feature may also save your display
					preference in browser storage. These are for core functionality, not ad tracking; the app currently
					has no advertising trackers.
				</p>
			</section>

			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted">
					<span class="text-primary">5.</span> Sharing and third-party services
				</h3>
				<p class="text-default leading-7">
					Shinro does not sell your personal information. Your instance's operator and infrastructure
					providers (hosting, database, and cache services) may process information to run the service.
				</p>
				<p class="text-default leading-7">
					When you search for or view movie information, the server may request search terms, catalogue
					identifiers, or metadata from
					<a
						href="https://www.themoviedb.org/privacy-policy"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary underline underline-offset-4"
					>
						TMDB
					</a>
					. The project also contains a Spotify API helper; if an operator enables related functionality,
					requests may be made to Spotify under its own terms and privacy policy. Shinro does not use Spotify
					account credentials for this integration. Third-party services handle data under their own policies.
				</p>
				<p class="text-default leading-7">
					The current app does not include advertising or analytics trackers. Operators may add their own
					tools, which they should disclose separately.
				</p>
			</section>

			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted">
					<span class="text-primary">6.</span> Retention and deletion
				</h3>
				<p class="text-default leading-7">
					Account and library data are kept while your account exists. You can permanently delete your account
					from Settings; this deletes the account and its associated sessions, collections, and media records
					from the live database. The deletion cannot be undone. Copies in backups and operational logs may
					remain until they are removed under the instance operator's retention practices or as required by
					law.
				</p>
			</section>

			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted"><span class="text-primary">7.</span> Security</h3>
				<p class="text-default leading-7">
					Passwords are stored as hashes, and sign-in sessions use an HTTP-only cookie. Operators are
					responsible for securing their deployment, connections, infrastructure, and backups. No online
					service can promise perfect security (if one does, perhaps don't give it your password).
				</p>
			</section>

			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted">
					<span class="text-primary">8.</span> Your choices and privacy rights
				</h3>
				<p class="text-default leading-7">
					You can update your username or password and delete your account in Settings. Depending on where you
					live, you may also have rights to access, correct, export, restrict, object to, or request deletion
					of personal information. Contact your instance operator to make a request or raise a concern; you
					may also contact your local data-protection authority where applicable.
				</p>
			</section>

			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted">
					<span class="text-primary">9.</span> Children and international use
				</h3>
				<p class="text-default leading-7">
					Shinro is a general media-management app, not a service designed for children. The operator should
					not knowingly process children's personal information in a way that violates applicable law. Because
					instances can be hosted in different countries, your information may be processed where the operator
					and its providers run their infrastructure.
				</p>
			</section>

			<section class="space-y-3">
				<h3 class="text-2xl font-semibold text-highlighted">
					<span class="text-primary">10.</span> Changes and contact
				</h3>
				<p class="text-default leading-7">
					This policy may change as Shinro changes. The instance operator should update it when their data
					practices change. For questions or requests about your account, contact the operator of the instance
					you use. For questions about the open-source project, visit the
					<a
						href="https://github.com/MrAnyx/Shinro"
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary underline underline-offset-4"
					>
						Shinro repository
					</a>
					. Please don't post personal information or account details in public issues.
				</p>
			</section>
		</article>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "landing",
});
</script>
