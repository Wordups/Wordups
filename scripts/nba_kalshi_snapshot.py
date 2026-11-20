#!/usr/bin/env python3
"""Snapshot tonight's NBA slate (ESPN) alongside Kalshi game markets.

Usage:
    python3 scripts/nba_kalshi_snapshot.py [YYYY-MM-DD] [--out DIR]

Defaults to today's date (UTC-based ESPN day, Eastern game dates).
Writes nba_kalshi_<date>.json and nba_kalshi_<date>.md into --out
(default: ./nba_snapshots). Uses only public, unauthenticated endpoints.
"""
import argparse
import datetime as dt
import json
import os
import sys
import urllib.parse
import urllib.request

ESPN_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"
KALSHI_MARKETS = "https://api.elections.kalshi.com/trade-api/v2/markets"
KALSHI_SERIES = "KXNBAGAME"  # Kalshi NBA game-winner series
UA = "nba-kalshi-snapshot/1.0"


def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def espn_games(day):
    url = f"{ESPN_SCOREBOARD}?dates={day.strftime('%Y%m%d')}"
    data = get_json(url)
    games = []
    for ev in data.get("events", []):
        comp = ev["competitions"][0]
        teams = {}
        for c in comp["competitors"]:
            teams[c["homeAway"]] = {
                "name": c["team"]["displayName"],
                "abbr": c["team"]["abbreviation"],
                "score": c.get("score"),
            }
        odds = (comp.get("odds") or [{}])[0]
        games.append({
            "id": ev["id"],
            "start_utc": ev["date"],
            "away": teams.get("away"),
            "home": teams.get("home"),
            "status": ev["status"]["type"]["detail"],
            "espn_spread_line": odds.get("details"),
            "espn_over_under": odds.get("overUnder"),
        })
    return games


def kalshi_markets(day):
    """Open KXNBAGAME markets whose event ticker carries this game date (e.g. 26NOV20)."""
    code = day.strftime("%y%b%d").upper()  # 26NOV20
    out, cursor = [], None
    for _ in range(20):  # page cap
        params = {"series_ticker": KALSHI_SERIES, "status": "open", "limit": 200}
        if cursor:
            params["cursor"] = cursor
        data = get_json(f"{KALSHI_MARKETS}?{urllib.parse.urlencode(params)}")
        out.extend(m for m in data.get("markets", []) if code in m.get("event_ticker", ""))
        cursor = data.get("cursor")
        if not cursor:
            break
    return out


def summarize_kalshi(markets):
    events = {}
    for m in markets:
        ev = events.setdefault(m["event_ticker"], {"event_ticker": m["event_ticker"],
                                                   "close_time": m.get("close_time"),
                                                   "markets": []})
        ev["markets"].append({
            "ticker": m["ticker"],
            "team": m.get("yes_sub_title"),
            "yes_bid": m.get("yes_bid_dollars"),
            "yes_ask": m.get("yes_ask_dollars"),
            "no_bid": m.get("no_bid_dollars"),
            "no_ask": m.get("no_ask_dollars"),
            "last_price": m.get("last_price_dollars"),
            "volume": m.get("volume_fp"),
            "open_interest": m.get("open_interest_fp"),
        })
    return list(events.values())


def render_md(day, games, kevents):
    lines = [f"# NBA slate and Kalshi markets, {day.isoformat()}", ""]
    if not games:
        lines.append("No ESPN games found for this date.")
    for g in games:
        a, h = g["away"], g["home"]
        lines.append(f"## {a['name']} at {h['name']}")
        lines.append(f"- Tip (UTC): {g['start_utc']}  |  Status: {g['status']}")
        if g.get("espn_spread_line"):
            lines.append(f"- ESPN line: {g['espn_spread_line']} (O/U {g.get('espn_over_under')})")
        lines.append("")
    lines.append("## Kalshi game-winner markets")
    if not kevents:
        lines.append("No open Kalshi KXNBAGAME markets matched this date.")
    for ev in kevents:
        lines.append(f"### {ev['event_ticker']} (closes {ev.get('close_time')})")
        lines.append("| Team | Yes bid | Yes ask | No bid | No ask | Last | Volume |")
        lines.append("|---|---|---|---|---|---|---|")
        for m in ev["markets"]:
            lines.append(f"| {m['team']} | {m['yes_bid']} | {m['yes_ask']} | {m['no_bid']} | "
                         f"{m['no_ask']} | {m['last_price']} | {m['volume']} |")
        lines.append("")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("date", nargs="?", help="YYYY-MM-DD (default: today, UTC)")
    ap.add_argument("--out", default="nba_snapshots")
    args = ap.parse_args()
    day = dt.date.fromisoformat(args.date) if args.date else dt.datetime.now(dt.timezone.utc).date()

    games = espn_games(day)
    kevents = summarize_kalshi(kalshi_markets(day))
    os.makedirs(args.out, exist_ok=True)
    base = os.path.join(args.out, f"nba_kalshi_{day.isoformat()}")
    with open(base + ".json", "w") as f:
        json.dump({"date": day.isoformat(), "espn_games": games, "kalshi_events": kevents}, f, indent=2)
    md = render_md(day, games, kevents)
    with open(base + ".md", "w") as f:
        f.write(md + "\n")
    print(md)
    print(f"\nWrote {base}.json and {base}.md", file=sys.stderr)


if __name__ == "__main__":
    main()
