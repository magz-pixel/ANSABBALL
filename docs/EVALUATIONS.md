# Player evaluations (1–5 rubric)

## Database

In Supabase **SQL Editor**, open the file **`supabase/migrations/20260321000000_player_evaluations.sql`** in your project, **copy the entire file**, and paste it into the editor.

**Important:** SQL comments must start with two dashes `--`, not a single `-` (markdown bullets will cause `syntax error at or near "-"`). Paste the `.sql` file only, not a bullet list from this doc.

This creates:

- `player_evaluations` — one row per submitted form (date, coach, experience text, comments, jersey #, grade, optional height/weight/DOB, overall strengths).
- `player_evaluation_scores` — one row per metric (`metric_key`, `value` 1–5).

## Coach workflow

1. Open **Dashboard → Players → [player]**.
2. Fill **Player performance evaluation** (all sections, 1–5 buttons).
3. **Submit evaluation** — saves a snapshot. The **category radar** and **trends** chart update from saved data.

## Legacy data

Older **`progress_logs`** (0–10, six skills) still appear under **Legacy progress logs** for history only. New work should use evaluations.

## PDF

**Download PDF report** uses the **latest** formal evaluation (if any), plus attendance. Without an evaluation, the PDF explains that none is on file yet.
