/* Desk Custom Style — Greeting
   Loaded on every Desk page via hooks.py -> app_include_js
   ------------------------------------------------------------
   EDIT THIS SECTION TO CUSTOMIZE — everything else below is
   just plumbing and shouldn't normally need changes.
   ------------------------------------------------------------ */

// Wellness / reminder tips — add, remove, or edit freely.
// One is picked at random each day.
const DESK_WELLNESS_TIPS = [
	"Don't forget to drink water 💧",
	"Do a bit of chair exercise — stretch those shoulders 🧘",
	"Sit up straight, check your posture 🪑",
	"Blink and look away from the screen for 20 seconds 👀",
	"Take a short walk if you can — even 2 minutes helps 🚶",
	"Roll your wrists and neck gently for a moment ✋",
];

/* ------------------------------------------------------------
   Plumbing — no need to edit below this line
   ------------------------------------------------------------ */

frappe.after_ajax(function () {
	try {
		showDeskGreeting();
	} catch (e) {
		console.error("jay_desk_style: greeting init failed", e);
	}
});

function buildGreetingText() {
	const userName = (frappe.boot && frappe.boot.user && frappe.boot.user.first_name)
		? frappe.boot.user.first_name
		: (frappe.session.user_fullname || "there");

	const hour = new Date().getHours();
	let greeting, subtext;

	if (hour < 12) {
		greeting = `Good Morning, ${userName}!`;
		subtext = "Have a good day ahead.";
	} else if (hour < 17) {
		greeting = `Good Afternoon, ${userName}!`;
		subtext = "How is the day progressing?";
	} else {
		greeting = `Good Evening, ${userName}!`;
		subtext = "Hope today went well.";
	}

	const tip = DESK_WELLNESS_TIPS[Math.floor(Math.random() * DESK_WELLNESS_TIPS.length)];
	return `<strong>${greeting}</strong> ${subtext} &nbsp;·&nbsp; ${tip}`;
}

function showDeskGreeting() {
	// Only show once per day.
	const today = frappe.datetime.get_today();
	const storageKey = "jay_desk_style_greeting_shown_" + today;
	if (localStorage.getItem(storageKey)) return;

	// Wait for the page header to exist, then inject once.
	const tryInject = setInterval(() => {
		const $pageHead = $(".page-head:visible").first();
		if (!$pageHead.length) return;

		if ($pageHead.find(".jay-desk-greeting").length) {
			clearInterval(tryInject);
			return;
		}

		const $greeting = $(`
			<div class="jay-desk-greeting" style="
				flex: 1;
				text-align: right;
				font-size: 12px;
				color: var(--text-muted, #8d99a6);
				padding: 0 12px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			">${buildGreetingText()}</div>
		`);

		const $actions = $pageHead.find(".page-actions, .standard-actions").first();
		if ($actions.length) {
			$actions.prepend($greeting);
		} else {
			$pageHead.append($greeting);
		}

		localStorage.setItem(storageKey, "1");
		clearInterval(tryInject);
	}, 300);

	setTimeout(() => clearInterval(tryInject), 10000);
}
