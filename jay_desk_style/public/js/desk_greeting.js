/* Desk Custom Style — Greeting & Notifications
   Loaded on every Desk page via hooks.py -> app_include_js
   ------------------------------------------------------------
   EDIT THESE TWO SECTIONS TO CUSTOMIZE — everything else below
   is just plumbing and shouldn't normally need changes.
   ------------------------------------------------------------ */

// 1) Wellness / reminder tips — add, remove, or edit freely.
//    One is picked at random each day.
const DESK_WELLNESS_TIPS = [
	"Don't forget to drink water 💧",
	"Do a bit of chair exercise — stretch those shoulders 🧘",
	"Sit up straight, check your posture 🪑",
	"Blink and look away from the screen for 20 seconds 👀",
	"Take a short walk if you can — even 2 minutes helps 🚶",
	"Roll your wrists and neck gently for a moment ✋",
];

// 2) Custom one-off notices — add an object per notice.
//    "date" is optional (YYYY-MM-DD). If set, it only shows on that date.
//    If omitted, it shows every day until you remove it.
const DESK_CUSTOM_NOTICES = [
	// Example (uncomment and edit):
	// { text: "Team meeting at 3 PM today", date: "2026-09-20" },
];

/* ------------------------------------------------------------
   Plumbing — no need to edit below this line
   ------------------------------------------------------------ */

frappe.after_ajax(function () {
	try {
		initDeskGreeting();
	} catch (e) {
		console.error("jay_desk_style: greeting init failed", e);
	}
});

function initDeskGreeting() {
	const today = frappe.datetime.get_today(); // YYYY-MM-DD
	const storageKey = "jay_desk_style_greeting_shown_" + today;

	if (localStorage.getItem(storageKey)) {
		return; // already shown today
	}

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
		subtext = "Hope today went well — almost time to wind down.";
	}

	const tip = DESK_WELLNESS_TIPS[Math.floor(Math.random() * DESK_WELLNESS_TIPS.length)];

	const lines = [`<strong>${greeting}</strong> ${subtext}`, tip];

	// Custom notices for today (or dateless/always-on ones)
	DESK_CUSTOM_NOTICES.forEach((notice) => {
		if (!notice.date || notice.date === today) {
			lines.push(notice.text);
		}
	});

	renderGreetingBanner(lines, storageKey);
	checkHolidays();
}

function renderGreetingBanner(lines, storageKey) {
	const bannerHtml = `
		<div id="desk-greeting-banner" style="
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			z-index: 9999;
			background: linear-gradient(90deg, #2c3e50, #4a6785);
			color: #fff;
			padding: 10px 20px;
			font-size: 13px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			box-shadow: 0 2px 6px rgba(0,0,0,0.15);
		">
			<div style="line-height: 1.5;">
				${lines.map((l) => `<div>${l}</div>`).join("")}
			</div>
			<div id="desk-greeting-dismiss" style="
				cursor: pointer;
				font-size: 18px;
				padding: 0 8px;
				opacity: 0.8;
			">&times;</div>
		</div>
	`;

	$("body").prepend(bannerHtml);

	// Push page content down so banner doesn't overlap the top bar
	const bannerHeight = $("#desk-greeting-banner").outerHeight();
	$("body").css("padding-top", bannerHeight + "px");

	$("#desk-greeting-dismiss").on("click", function () {
		$("#desk-greeting-banner").remove();
		$("body").css("padding-top", "");
		localStorage.setItem(storageKey, "1");
	});
}

function checkHolidays() {
	// Looks up the default Holiday List (set in HR Settings) and flags
	// today or the next 3 days if a holiday falls in that window.
	frappe.db.get_single_value("HR Settings", "default_holiday_list").then((holidayListName) => {
		if (!holidayListName) return;

		frappe.call({
			method: "frappe.client.get",
			args: { doctype: "Holiday List", name: holidayListName },
			callback: function (r) {
				if (!r || !r.message || !r.message.holidays) return;

				const today = frappe.datetime.get_today();
				const in3Days = frappe.datetime.add_days(today, 3);

				const upcoming = r.message.holidays.find(
					(h) => h.holiday_date >= today && h.holiday_date <= in3Days
				);

				if (upcoming) {
					const isToday = upcoming.holiday_date === today;
					const label = isToday
						? `🎉 Today is a holiday: ${upcoming.description || "Holiday"}`
						: `📅 Upcoming holiday on ${frappe.datetime.str_to_user(upcoming.holiday_date)}: ${upcoming.description || "Holiday"}`;

					frappe.show_alert({ message: label, indicator: "green" }, 8);
				}
			},
		});
	});
}
