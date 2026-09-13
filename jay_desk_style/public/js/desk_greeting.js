/* Desk Custom Style — Greeting
   Loaded on every Desk page via hooks.py -> app_include_js
   ------------------------------------------------------------
   EDIT THIS SECTION TO CUSTOMIZE — everything else below is
   just plumbing and shouldn't normally need changes.
   ------------------------------------------------------------ */

// Wellness / reminder tips — add, remove, or edit freely.
// These rotate in order (not randomly) every TIP_ROTATE_MINUTES.
const DESK_WELLNESS_TIPS = [
	"Don't forget to drink water 💧",
	"Sit up straight, check your posture 🪑",
	"Blink and look away from the screen for 20 seconds 👀",
	"Roll your wrists and neck gently for a moment ✋",
	"Do a bit of chair exercise — stretch those shoulders 🧘",
	"Take a short walk if you can — even 2 minutes helps 🚶",
];

// How often the greeting/tip text refreshes on its own (no reload needed).
const REFRESH_INTERVAL_MINUTES = 1;

// How many refresh cycles to wait before showing the FIRST tip.
// e.g. 5 means: just the greeting for the first 5 minutes, then tips start.
const CYCLES_BEFORE_FIRST_TIP = 5;

/* ------------------------------------------------------------
   Plumbing — no need to edit below this line
   ------------------------------------------------------------ */

let tipIndex = -1; // -1 = no tip shown yet
let cycleCount = 0;

frappe.after_ajax(function () {
	try {
		initDeskGreeting();
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

	let text = `<strong>${greeting}</strong> ${subtext}`;

	cycleCount++;
	if (cycleCount > CYCLES_BEFORE_FIRST_TIP) {
		tipIndex = (tipIndex + 1) % DESK_WELLNESS_TIPS.length;
		text += ` &nbsp;·&nbsp; ${DESK_WELLNESS_TIPS[tipIndex]}`;
	}

	return text;
}

function initDeskGreeting() {
	const tryInject = setInterval(() => {
		const $pageHead = $(".page-head:visible").first();
		if (!$pageHead.length) return;

		clearInterval(tryInject);

		let $greeting = $pageHead.find(".jay-desk-greeting");
		if (!$greeting.length) {
			$greeting = $(`
				<div class="jay-desk-greeting" style="
					flex: 1;
		    text-align: right;
    font-size: 15px;
    color: #db00a0 !important;
    padding: 0 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
				"></div>
			`);
			const $actions = $pageHead.find(".page-actions, .standard-actions").first();
			if ($actions.length) {
				$actions.prepend($greeting);
			} else {
				$pageHead.append($greeting);
			}
		}

		$greeting.html(buildGreetingText());
		setInterval(() => {
			const $current = $(".page-head:visible .jay-desk-greeting").first();
			if ($current.length) {
				$current.html(buildGreetingText());
			}
		}, REFRESH_INTERVAL_MINUTES * 60 * 1000);
	}, 300);

	setTimeout(() => clearInterval(tryInject), 10000);
}
