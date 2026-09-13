# Jay's Desk Style

A minimal Frappe app that loads custom CSS and JS on the Desk (admin)
interface for indigoerp.frappe.cloud.

## What it does
- Adds font-family, heading, link, and widget-label styling to the Desk
  via `app_include_css` in `hooks.py`. Does NOT affect the public website.
- Shows a dismissible greeting banner once per day: time-based greeting
  (Good Morning/Afternoon/Evening + a message), a rotating wellness tip,
  and any custom notices you've configured.
- Shows a small alert if today or the next 3 days include a holiday from
  your default Holiday List (set in HR Settings).

## Customizing the greeting, tips, and notices
Edit `jay_desk_style/public/js/desk_greeting.js`:
- `DESK_WELLNESS_TIPS` — add/remove/edit the rotating tips array.
- `DESK_CUSTOM_NOTICES` — add `{ text: "...", date: "YYYY-MM-DD" }` entries.
  Omit `date` to show a notice every day until you remove it.

After editing, commit + push to GitHub, then trigger a redeploy from
Frappe Cloud (see below).

## Install on Frappe Cloud
1. Push this repo to GitHub.
2. In Frappe Cloud: Benches -> Indigo -> Apps -> Install App from GitHub.
3. Paste this repo's URL, select the branch (main).
4. Deploy the bench.
5. On indigoerp.frappe.cloud: Apps -> Install "Jay's Desk Style" on the site.
6. Hard-refresh the Desk (Ctrl+Shift+R) to see the change.

## Editing the styling later
Edit `jay_desk_style/public/css/desk_custom.css`, commit, push to GitHub,
then trigger a new deploy from Frappe Cloud (Benches -> Indigo -> Deploys).

## Editing the greeting/tips/notices later
Edit `jay_desk_style/public/js/desk_greeting.js` as described above,
commit, push to GitHub, then trigger a new deploy the same way.
