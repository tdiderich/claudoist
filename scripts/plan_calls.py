#!/usr/bin/env python3
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, date, time
from pathlib import Path

try:
    from zoneinfo import ZoneInfo
except Exception:  # pragma: no cover
    ZoneInfo = None

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]
CLIENT_SECRET = Path("data/private/google-oauth.json")
TOKEN = Path("data/private/google-token.json")
MAP_PATH = Path("data/private/calendar_map.json")
TEMPLATE_NEXT_CALL = Path("templates/next_call.md")
ACCOUNTS_DIR = Path("accounts")
RUN_AGENT = Path("scripts/run_agent.sh")
AGENDA_PROMPT = Path("prompts/plan_agenda.md")


def load_calendar_map():
    if MAP_PATH.exists():
        with MAP_PATH.open() as f:
            return json.load(f)
    return {"domains": {}, "keywords": {}, "attendees": {}}


def get_tzinfo():
    try:
        return datetime.now().astimezone().tzinfo
    except Exception:
        return None


def business_days_from(start_date, count):
    days = []
    d = start_date
    while len(days) < count:
        if d.weekday() < 5:
            days.append(d)
        d += timedelta(days=1)
    return days


def date_range(days_arg=None):
    today = date.today()
    # If weekend, start next Monday
    if today.weekday() >= 5:
        today += timedelta(days=(7 - today.weekday()))

    if days_arg:
        days = business_days_from(today, days_arg)
        start = days[0]
        end = days[-1]
    else:
        # default: rest of work week (through Friday)
        end = today + timedelta(days=(4 - today.weekday()))
        start = today
    return start, end


def load_credentials():
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
    except ImportError:
        print("Missing Google API deps. Install:")
        print("  python3 -m pip install --user google-api-python-client google-auth-httplib2 google-auth-oauthlib")
        sys.exit(1)

    creds = None
    if TOKEN.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CLIENT_SECRET.exists():
                print("Missing OAuth client file:", CLIENT_SECRET)
                print("Create an OAuth client (Desktop app) and save it to data/private/google-oauth.json")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN.parent.mkdir(parents=True, exist_ok=True)
        TOKEN.write_text(creds.to_json())

    return creds


def fetch_events(start, end, tzinfo):
    from googleapiclient.discovery import build

    creds = load_credentials()
    service = build("calendar", "v3", credentials=creds)

    start_dt = datetime.combine(start, time.min)
    end_dt = datetime.combine(end, time.max)

    if tzinfo is None:
        tzinfo = get_tzinfo()

    if tzinfo is not None:
        start_dt = start_dt.replace(tzinfo=tzinfo)
        end_dt = end_dt.replace(tzinfo=tzinfo)

    events_result = service.events().list(
        calendarId="primary",
        timeMin=start_dt.isoformat(),
        timeMax=end_dt.isoformat(),
        singleEvents=True,
        orderBy="startTime",
    ).execute()

    return events_result.get("items", [])


def format_event_time(ev):
    start = ev.get("start", {})
    if "dateTime" in start:
        dt = datetime.fromisoformat(start["dateTime"])
        return dt
    if "date" in start:
        d = datetime.fromisoformat(start["date"])
        return d
    return None


def account_slugs():
    if not ACCOUNTS_DIR.exists():
        return []
    return sorted([p.name for p in ACCOUNTS_DIR.iterdir() if p.is_dir() and not p.name.startswith(".")])


def prompt_select(prompt, options):
    print(prompt)
    for i, opt in enumerate(options, start=1):
        print(f"  {i}) {opt}")
    while True:
        choice = input("Select number (or blank to skip): ").strip()
        if choice == "":
            return None
        if choice.isdigit() and 1 <= int(choice) <= len(options):
            return options[int(choice) - 1]


def prompt_select_events(events):
    print("\nUpcoming events:")
    for i, ev in enumerate(events, start=1):
        dt = format_event_time(ev)
        when = dt.strftime("%Y-%m-%d %H:%M") if dt else "(no time)"
        summary = ev.get("summary", "(no title)")
        print(f"  {i}) {when} - {summary}")

    raw = input("Select events (e.g., 1,3-5 or a for all): ").strip().lower()
    if raw in ("a", "all", "*"):
        return list(range(1, len(events) + 1))

    selected = set()
    for part in raw.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            if a.isdigit() and b.isdigit():
                for i in range(int(a), int(b) + 1):
                    selected.add(i)
        elif part.isdigit():
            selected.add(int(part))

    return [i for i in sorted(selected) if 1 <= i <= len(events)]


def pick_account_for_event(ev, slugs, cmap):
    attendees = [a.get("email", "") for a in ev.get("attendees", []) if a.get("email")]
    summary = ev.get("summary", "") or ""

    for email in attendees:
        if email in cmap.get("attendees", {}):
            return cmap["attendees"][email]

    for email in attendees:
        domain = email.split("@")[-1].lower()
        if domain in cmap.get("domains", {}):
            return cmap["domains"][domain]

    for keyword, slug in cmap.get("keywords", {}).items():
        if keyword.lower() in summary.lower():
            return slug

    if slugs:
        return prompt_select("Pick account for event: " + summary, slugs)
    return None


def ensure_next_call(slug, event_date, account_name=None):
    acct_dir = ACCOUNTS_DIR / slug
    next_call = acct_dir / "next_call.md"

    if not acct_dir.exists():
        print(f"Account folder not found: {acct_dir}")
        return None

    if not next_call.exists():
        if not TEMPLATE_NEXT_CALL.exists():
            print("Missing template: templates/next_call.md")
            return None
        content = TEMPLATE_NEXT_CALL.read_text()
        content = content.replace("date: YYYY-MM-DD", f"date: {event_date}")
        if account_name:
            content = content.replace("account: \"\"", f"account: \"{account_name}\"")
        next_call.write_text(content)
        return next_call

    return next_call


def update_next_call(next_call_path, ev):
    content = next_call_path.read_text().splitlines()
    dt = format_event_time(ev)
    summary = ev.get("summary", "(no title)")

    when = dt.strftime("%Y-%m-%d %H:%M") if dt else "(no time)"
    agenda_line = f"- {when} - {summary}"

    # Insert under Agenda section if not already present
    out = []
    in_agenda = False
    inserted = False
    for line in content:
        out.append(line)
        if line.strip().lower() == "## agenda":
            in_agenda = True
            continue
        if in_agenda:
            if line.startswith("## "):
                if not inserted:
                    out.insert(len(out) - 1, agenda_line)
                    inserted = True
                in_agenda = False
            elif line.strip() == "" and not inserted:
                out.append(agenda_line)
                inserted = True

    if in_agenda and not inserted:
        out.append(agenda_line)

    next_call_path.write_text("\n".join(out) + "\n")


def prompt_context():
    print("Add context for the agent? (optional)")
    print("Enter one or more lines, finish with an empty line:")
    lines = []
    while True:
        line = input()
        if line == "":
            break
        lines.append(line)
    return "\n".join(lines).strip()


def maybe_run_agent(next_call_path):
    if not RUN_AGENT.exists() or not AGENDA_PROMPT.exists():
        return

    print("\nCurrent next_call.md:")
    print(next_call_path.read_text())

    resp = input("Run agent to refine agenda/todos? [y/N]: ").strip().lower()
    if resp != "y":
        return

    context = prompt_context()

    try:
        cmd = [str(RUN_AGENT), str(AGENDA_PROMPT), str(next_call_path)]
        if context:
            cmd.append(context)
        result = subprocess.run(cmd)
        if result.returncode == 2:
            print("Agent not configured (AGENT=manual). Update claudoist.config to enable.")
    except Exception as e:
        print("Failed to run agent:", e)


def main():
    days = None
    if len(sys.argv) > 1:
        try:
            days = int(sys.argv[1])
        except ValueError:
            print("Invalid days argument; expected integer")
            sys.exit(1)

    start, end = date_range(days)

    try:
        events = fetch_events(start, end, get_tzinfo())
    except Exception as e:
        print("Failed to fetch calendar events:", e)
        sys.exit(1)

    if not events:
        print("No events found in date range.")
        return

    selected = prompt_select_events(events)
    if not selected:
        print("No events selected.")
        return

    slugs = account_slugs()
    cmap = load_calendar_map()

    updated_files = []

    for idx in selected:
        ev = events[idx - 1]
        dt = format_event_time(ev)
        ev_date = dt.strftime("%Y-%m-%d") if dt else date.today().isoformat()
        summary = ev.get("summary", "(no title)")

        slug = pick_account_for_event(ev, slugs, cmap)
        if not slug:
            print(f"Skipping (no account selected): {summary}")
            continue

        # Try to get account name from account.md frontmatter
        account_name = None
        acct_md = ACCOUNTS_DIR / slug / "account.md"
        if acct_md.exists():
            for line in acct_md.read_text().splitlines():
                if line.startswith("account:"):
                    account_name = line.split(":", 1)[1].strip().strip('"')
                    break

        next_call = ensure_next_call(slug, ev_date, account_name)
        if not next_call:
            continue

        update_next_call(next_call, ev)
        updated_files.append(next_call)

        maybe_run_agent(next_call)

    if updated_files:
        print("\nUpdated next_call files:")
        for f in updated_files:
            print(f"- {f}")
        print("\nOptional: run your agent with prompts/plan_agenda.md to refine agendas.")


if __name__ == "__main__":
    main()
