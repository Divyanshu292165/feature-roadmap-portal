# Demo Recording Script — Feature Request & Public Roadmap Portal

A feature-by-feature walkthrough for a screen recording. Record with any screen
recorder (Windows: **Win + G** Game Bar, or OBS / Loom). Aim for **4–6 minutes**.
Narrate in your own words — the lines below are prompts, not a script to read verbatim.

## Before you record
1. Start the backend: in `server/` run `npm run dev` (uses your Atlas DB).
2. Start the frontend: in `client/` run `npm run dev`, open `http://localhost:5173`.
3. Have two things ready:
   - Your **admin** account (2921.divyanshus@gmail.com).
   - A second **regular** account (or register one live in Scene 3).
4. Close extra tabs; set browser zoom to 100%.

---

## Scene 1 — Public landing (no login) · ~30s
- Open `http://localhost:5173` **while logged out**.
- Say: "The roadmap and feature feed are fully public — no login needed to browse."
- Point out: hero banner, the **Submit a Feature** button, search, and filters.
- Scroll the feature list; hover a card to show vote counts and status badges.

## Scene 2 — Browse, search & filter · ~40s
- Type in the search box; say: "Search is debounced and matches title and description."
- Use the **category** and **status** filters; change **sort** (Newest / Most Upvoted).
- Open a feature to show the **detail page**: description (Markdown), metadata, comments.

## Scene 3 — Login prompt on action · ~40s
- Still logged out, click the **upvote** arrow on a feature.
- Say: "Voting requires an account, so a login modal appears instead of blocking the page."
- Click **Sign up**, register a new regular user live (name, email, password).
- Say: "Registration also simulates email verification — the link is logged server-side."

## Scene 4 — Submit a feature (modal) · ~50s
- Logged in as the regular user, click **Submit a Feature**.
- Say: "Submission is a modal form, not a separate page."
- Fill Title + Category, type a Markdown description, click the **Preview** tab to show rendering.
- Submit; land on the new feature's detail page. Note the status is **Under Review**.

## Scene 5 — Voting & comments · ~40s
- Upvote the feature; say: "Votes are atomic — one per user, enforced by a unique index."
- Upvote again to show the toggle (removes the vote).
- Post a comment; reply to it (1-level threading). Show Markdown in a comment.
- Edit and delete your own comment.

## Scene 6 — Admin: approve & move on the roadmap · ~50s
- Log out, log in as **admin**. Point out the **Admin** link now in the navbar.
- Go to **Admin → Manage Features**. Change the new feature's status
  Under Review → **Planned** → **In Progress** → **Completed** via the dropdown.
- Say: "Only admins can change status — the routes are protected by role-based access control."
- Open **Roadmap**: show the 3-column Kanban (Planned / In Progress / Completed) and that
  the feature now appears in the column you set.

## Scene 7 — Admin moderation · ~20s
- Go to **Admin → Comments**; delete a comment to show moderation.
- Briefly show the **Admin Dashboard** stats.

## Scene 8 — Wrap · ~20s
- Return to the public home page.
- Recap: "Public roadmap and voting, account-gated actions, atomic voting, threaded
  comments, admin RBAC, and a Kanban roadmap — built on the MERN stack with Coss UI."

---

### Quick shot list (if you only have 2 minutes)
1. Public feed (logged out) → 2. Login modal on upvote → 3. Submit-feature modal →
4. Vote + comment → 5. Admin status change → 6. Roadmap Kanban update.
