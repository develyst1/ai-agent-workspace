window.__ModuleLoader__.load({
  id: "@local/dsh-workforce",
  factory(require) {
    const React = require("react");
    const h = React.createElement;

    // Every literal stays ASCII; characters such as the middle dot are \u
    // escapes so a Windows re-save of this file cannot double-encode them.
    const C = {
      bg: "var(--dsw-alias-bg-base, #0f1115)",
      layer: "var(--dsw-alias-bg-layer-1, #151922)",
      layer2: "var(--dsw-alias-bg-layer-2, #1a1f2a)",
      border: "var(--dsw-alias-border-l1, #262d3a)",
      border2: "var(--dsw-alias-border-l2, #333b4a)",
      text: "var(--dsw-alias-label-primary, #e9edf4)",
      sub: "var(--dsw-alias-label-secondary, #8d97a8)",
      accent: "var(--dsw-alias-brand-primary, #f5b14c)",
      ok: "var(--dsw-alias-state-success-primary, #3ddc97)",
      warn: "var(--dsw-alias-state-warn-primary, #f5b14c)",
      err: "var(--dsw-alias-state-error-primary, #ff6464)",
    };

    const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
    const GAP = 8;

    const STATE = {
      busy: { color: C.ok, label: "busy" },
      waiting: { color: C.warn, label: "waiting" },
      idle: { color: C.sub, label: "idle" },
      live: { color: C.sub, label: "live" },
      "no session": { color: "transparent", label: "no session" },
      "no live view": { color: "transparent", label: "no live view" },
    };

    const GATE = {
      PASS: { color: C.ok },
      WARN: { color: C.warn },
      FAIL: { color: C.err },
    };

    function useStatus() {
      const [state, setState] = React.useState({ loading: true, error: null, data: null });
      const load = React.useCallback((quiet) => {
        if (!quiet) setState((s) => ({ ...s, loading: true, error: null }));
        fetch("/api/workforce/status", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
          .then((data) => setState({ loading: false, error: null, data }))
          .catch((error) => setState((s) => ({ loading: false, error, data: s.data })));
      }, []);
      React.useEffect(() => {
        load();
        const timer = setInterval(() => load(true), 15000);
        return () => clearInterval(timer);
      }, [load]);
      return { ...state, reload: () => load(true) };
    }

    function Dot({ state }) {
      const look = STATE[state] || STATE["no session"];
      const hollow = state === "no session" || state === "no live view";
      return h("span", {
        style: {
          width: 6,
          height: 6,
          borderRadius: 99,
          flex: "0 0 auto",
          background: hollow ? "transparent" : look.color,
          border: "1px solid " + (hollow ? C.border2 : look.color),
        },
      });
    }

    function Legend() {
      const items = [
        ["busy", "busy"],
        ["waiting", "waiting"],
        ["idle", "idle"],
        ["no session", "no session"],
      ];
      return h(
        "div",
        { style: { display: "flex", gap: 16, alignItems: "center", marginBottom: GAP, fontSize: 11, color: C.sub } },
        items.map((item) =>
          h(
            "span",
            { key: item[0], style: { display: "inline-flex", alignItems: "center", gap: 6 } },
            h(Dot, { state: item[0] }),
            item[1]
          )
        ),
        h(
          "span",
          { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
          h("span", {
            style: { width: 6, height: 6, borderRadius: 99, border: "1px solid " + C.warn, background: "transparent" },
          }),
          "mail waiting"
        )
      );
    }

    function Header({ at, loading, onReload, desks, sessions, seats, claudeBin, claudeError, harnessCount }) {
      const summary =
        desks + " desks \u00b7 " + (sessions + harnessCount) + " live sessions \u00b7 " + seats + " seats";
      return h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 24px",
            borderBottom: "1px solid " + C.border,
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: C.bg,
          },
        },
        h(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          h("div", { style: { fontSize: 15, fontWeight: 600, color: C.text } }, "Workforce"),
          h(
            "div",
            {
              title: claudeError ? claudeError : claudeBin || "",
              style: { fontSize: 11, color: C.sub, marginTop: 2, cursor: "help" },
            },
            summary
          )
        ),
        h(
          "span",
          { style: { fontSize: 11, color: C.sub, fontFamily: MONO, whiteSpace: "nowrap" } },
          at ? new Date(at).toLocaleTimeString() : ""
        ),
        h(
          "button",
          {
            onClick: onReload,
            style: {
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid " + C.border2,
              background: C.layer2,
              color: C.text,
              cursor: "pointer",
            },
          },
          loading ? "Refreshing\u2026" : "Refresh"
        )
      );
    }

    function Person({ person, onSelect }) {
      const state = person.status || "no session";
      const look = STATE[state] || STATE["no session"];
      const canSend = Boolean(person.sessionName);
      const lines = [
        person.name + " \u2014 " + person.role + (person.team ? " " + person.team : ""),
        canSend ? person.sessionName + " \u2014 click to send your words" : "no session open",
        "state: " + look.label,
      ];
      if (person.mail) {
        lines.push(
          "mail waiting: " +
            person.mail.lines +
            " line(s), file touched " +
            person.mail.ageMinutes +
            " min ago (" +
            person.inbox +
            ")"
        );
      }
      return h(
        "span",
        {
          title: lines.join("\n"),
          onClick: canSend
            ? () =>
                onSelect({
                  mode: "send",
                  target: person.sessionName,
                  label: person.sessionName,
                  name: person.name,
                })
            : undefined,
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "2px 8px",
            borderRadius: 999,
            border: "1px solid " + (person.ball ? C.warn : C.border),
            background: C.layer2,
            fontSize: 11,
            color: canSend ? C.text : C.sub,
            fontFamily: MONO,
            whiteSpace: "nowrap",
            cursor: canSend ? "pointer" : "default",
            opacity: canSend ? 1 : 0.75,
          },
        },
        h(Dot, { state }),
        person.role === "PM" &&
          h(
            "span",
            {
              style: {
                fontSize: 9,
                letterSpacing: "0.06em",
                color: C.accent,
                border: "1px solid " + C.accent,
                borderRadius: 4,
                padding: "0 3px",
              },
            },
            "PM"
          ),
        person.name
      );
    }

    function GateBadge({ gate }) {
      if (!gate || !gate.verdict) return null;
      const look = GATE[gate.verdict] || { color: C.sub };
      return h(
        "span",
        {
          title: gate.line || "the gate reported no FAIL or WARN line",
          style: {
            fontSize: 11,
            fontFamily: MONO,
            color: look.color,
            border: "1px solid " + look.color,
            borderRadius: 999,
            padding: "1px 8px",
            whiteSpace: "nowrap",
          },
        },
        gate.verdict
      );
    }

    function DeskCard({ desk, onSelect }) {
      const people = (desk.people || []).slice().sort((a, b) => {
        const rank = (person) => (person.role === "PM" ? 0 : person.role === "QA" ? 1 : 2);
        const diff = rank(a) - rank(b);
        return diff !== 0 ? diff : 0;
      });
      const age =
        desk.logAgeDays == null
          ? "no log"
          : desk.logAgeDays <= 0
          ? "log today"
          : "log " + desk.logAgeDays + "d ago";
      return h(
        "div",
        {
          style: {
            background: C.layer,
            border: "1px solid " + C.border,
            borderRadius: 10,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: GAP,
            minWidth: 0,
          },
        },
        h(
          "div",
          { style: { display: "flex", alignItems: "baseline", gap: GAP } },
          h(
            "div",
            {
              style: {
                fontSize: 13,
                color: C.text,
                fontFamily: MONO,
                flex: 1,
                minWidth: 0,
                wordBreak: "break-word",
              },
            },
            desk.name
          ),
          h(GateBadge, { gate: desk.gate })
        ),
        h(
          "div",
          { style: { fontSize: 11, color: C.sub, fontFamily: MONO } },
          "board " + desk.boardKB + " KB \u00b7 " + age
        ),
        people.length > 0 &&
          h(
            "div",
            { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
            people.map((person) => h(Person, { key: person.name + person.role, person, onSelect }))
          ),
        people.length === 0 && h("div", { style: { fontSize: 11, color: C.sub } }, "no TEAMS.md roster")
      );
    }

    function Seats({ seats, selected, onSelect }) {
      return h(
        "div",
        { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" } },
        seats.map((seat) => {
          const isSel = selected && selected.name === seat.name;
          const canSend = seat.engine !== "deepseek" && Boolean(seat.sessionName);
          return h(
            "div",
            {
              key: seat.name,
              title: canSend
                ? "sends your words to " + seat.sessionName
                : "writes a REQUEST at the workspace root",
              onClick: () =>
                onSelect(
                  canSend
                    ? { mode: "send", target: seat.sessionName, label: seat.sessionName, name: seat.name }
                    : { mode: "request", target: seat.name, label: seat.name, name: seat.name }
                ),
              style: {
                display: "grid",
                gridTemplateColumns: "10px 1fr auto auto",
                alignItems: "center",
                gap: GAP,
                padding: "6px 8px",
                borderRadius: 6,
                cursor: "pointer",
                background: isSel ? C.layer2 : "transparent",
                borderLeft: "2px solid " + (isSel ? C.accent : "transparent"),
              },
            },
            h(Dot, { state: seat.state }),
            h(
              "div",
              { style: { minWidth: 0 } },
              h("span", { style: { fontSize: 12, color: C.text, fontFamily: MONO } }, seat.name),
              h(
                "span",
                { style: { fontSize: 11, color: C.sub, marginLeft: 8 } },
                seat.role + " \u00b7 " + (seat.engine === "deepseek" ? "deepseek" : "claude")
              )
            ),
            h(
              "span",
              {
                style: {
                  fontSize: 11,
                  color: seat.open > 0 ? C.warn : C.sub,
                  fontFamily: MONO,
                  whiteSpace: "nowrap",
                },
              },
              seat.open > 0 ? seat.open + " open" : ""
            ),
            h(
              "span",
              {
                style: {
                  fontSize: 11,
                  color: seat.state === "busy" ? C.ok : C.sub,
                  fontFamily: MONO,
                  whiteSpace: "nowrap",
                  minWidth: 74,
                  textAlign: "right",
                },
              },
              STATE[seat.state] ? STATE[seat.state].label : seat.state
            )
          );
        })
      );
    }

    function Composer({ selected, reload }) {
      const [text, setText] = React.useState("");
      const [busy, setBusy] = React.useState(false);
      const [result, setResult] = React.useState(null);

      React.useEffect(() => {
        setText("");
        setResult(null);
      }, [selected && selected.name]);

      if (!selected) return null;
      const isSeat = selected.mode === "request";

      const send = () => {
        if (!text.trim() || busy) return;
        setBusy(true);
        setResult(null);
        fetch("/api/workforce/status", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            isSeat
              ? { action: "request", seat: selected.target, text }
              : { action: "send", target: selected.target, text }
          ),
        })
          .then((r) => r.json())
          .then((value) => {
            setResult(value);
            setBusy(false);
            setText("");
            reload();
          })
          .catch((error) => {
            setResult({ ok: false, error: String(error.message || error) });
            setBusy(false);
          });
      };

      const okColor = result ? (result.ok ? C.ok : C.err) : C.sub;

      return h(
        "div",
        {
          style: {
            position: "sticky",
            bottom: 0,
            borderTop: "1px solid " + C.border2,
            background: C.layer,
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: GAP,
          },
        },
        h(
          "div",
          { style: { fontSize: 11, color: C.sub, display: "flex", gap: GAP, flexWrap: "wrap" } },
          h("span", { style: { color: C.accent, fontFamily: MONO } }, "\u2192 " + selected.label),
          h(
            "span",
            null,
            isSeat
              ? "writes REQUEST-owner-to-" +
                  selected.name.toLowerCase() +
                  "-<date>-<slug>.md at the workspace root (a seat with no live session reads it there)"
              : "sends your words to this Claude session, unchanged (starts a short Claude run)"
          )
        ),
        h(
          "div",
          { style: { display: "flex", gap: GAP } },
          h("textarea", {
            value: text,
            onChange: (e) => setText(e.target.value),
            placeholder: isSeat ? "REQUEST to " + selected.name + "\u2026" : "Message " + selected.name + "\u2026",
            rows: 2,
            onKeyDown: (e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            },
            style: {
              flex: 1,
              resize: "vertical",
              background: C.bg,
              color: C.text,
              border: "1px solid " + C.border2,
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 12,
              fontFamily: "inherit",
              outline: "none",
            },
          }),
          h(
            "button",
            {
              onClick: send,
              disabled: busy,
              style: {
                padding: "0 16px",
                borderRadius: 8,
                border: "1px solid " + C.accent,
                background: C.accent,
                color: "#16130c",
                fontSize: 12,
                fontWeight: 700,
                cursor: busy ? "default" : "pointer",
                opacity: busy ? 0.7 : 1,
              },
            },
            busy ? "Sending\u2026" : isSeat ? "Drop REQUEST" : "Send"
          )
        ),
        result &&
          h(
            "div",
            {
              style: {
                fontSize: 11,
                color: okColor,
                fontFamily: MONO,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              },
            },
            result.ok
              ? result.action === "request"
                ? "REQUEST written: " + result.file
                : "sent: " + (result.result || "ok")
              : "failed: " + (result.error || "unknown")
          )
      );
    }

    function Page() {
      const { data, error, loading, reload } = useStatus();
      const [selected, setSelected] = React.useState(null);
      const [showQuiet, setShowQuiet] = React.useState(false);

      const desks = (data && data.desks) || [];
      const active = desks.filter((desk) => !desk.quiet);
      const quiet = desks.filter((desk) => desk.quiet);
      const seats = (data && data.seats) || [];
      const sessions = (data && data.claude) || [];
      const harness = (data && data.harness) || [];

      const matched = new Set();
      for (const desk of desks) {
        for (const person of desk.people || []) if (person.sessionName) matched.add(person.sessionName);
      }
      for (const seat of seats) if (seat.sessionName) matched.add(seat.sessionName);
      const otherClaude = sessions.filter((session) => !matched.has(session.name));
      const otherHarness = harness.filter((session) => !(session.title && matched.has(session.title)));

      const grid = (list) =>
        h(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: GAP,
            },
          },
          list.map((desk) => h(DeskCard, { key: desk.name, desk, onSelect: setSelected }))
        );

      return h(
        "div",
        {
          style: {
            height: "100%",
            overflow: "auto",
            background: C.bg,
            color: C.text,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            display: "flex",
            flexDirection: "column",
          },
        },
        h(Header, {
          at: data && data.generatedAt,
          loading,
          onReload: reload,
          desks: desks.length,
          sessions: sessions.length,
          harnessCount: harness.length,
          seats: seats.length,
          claudeBin: data && data.claudeBin,
          claudeError: data && data.claudeError,
        }),
        error &&
          h(
            "div",
            {
              style: {
                margin: 16,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid " + C.err,
                color: C.err,
                fontSize: 12,
              },
            },
            "Cannot read the snapshot: " + (error.message || String(error))
          ),
        data &&
          h(
            "div",
            { style: { padding: "16px 24px 24px", flex: 1 } },
            data.claudeError &&
              h(
                "div",
                {
                  style: {
                    marginBottom: 16,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid " + C.warn,
                    color: C.warn,
                    fontSize: 12,
                  },
                },
                "No live Claude sessions: " + data.claudeError
              ),
            active.length > 0 &&
              h(
                "div",
                { style: { marginBottom: 16 } },
                h(
                  "div",
                  {
                    style: {
                      fontSize: 11,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: C.sub,
                      marginBottom: GAP,
                    },
                  },
                  "Desks \u00b7 " + active.length
                ),
                h(Legend),
                grid(active)
              ),
            quiet.length > 0 &&
              h(
                "div",
                { style: { marginBottom: 16 } },
                h(
                  "button",
                  {
                    onClick: () => setShowQuiet((value) => !value),
                    style: {
                      background: "transparent",
                      border: "1px solid " + C.border,
                      borderRadius: 8,
                      color: C.sub,
                      fontSize: 11,
                      padding: "4px 10px",
                      cursor: "pointer",
                      marginBottom: GAP,
                    },
                  },
                  (showQuiet ? "Hide" : "Show") + " quiet desks \u00b7 " + quiet.length + " (no log for 21+ days)"
                ),
                showQuiet && grid(quiet)
              ),
            (otherClaude.length > 0 || otherHarness.length > 0) &&
              h(
                "div",
                { style: { marginBottom: 16, fontSize: 11, color: C.sub, fontFamily: MONO } },
                "Other live sessions: " +
                  [
                    ...otherClaude.map((session) => session.name + " (" + (session.status || "?") + ")"),
                    ...otherHarness.map((session) => (session.title || session.id) + " (harness)"),
                  ].join(" \u00b7 ")
              ),
            h(
              "div",
              { style: { marginBottom: 16 } },
              h(
                "div",
                {
                  style: {
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: C.sub,
                    marginBottom: GAP,
                  },
                },
                "Workspace seats \u00b7 " + seats.length
              ),
              h(Seats, { seats, selected, onSelect: setSelected })
            )
          ),
        h(Composer, { selected, reload })
      );
    }

    function Icon({ size }) {
      const s = size || 18;
      return h(
        "svg",
        {
          width: s,
          height: s,
          viewBox: "0 0 24 24",
          fill: "none",
          "aria-hidden": true,
          style: { display: "block" },
        },
        h("rect", { x: 3, y: 3, width: 7, height: 7, rx: 2, fill: "currentColor", opacity: 0.95 }),
        h("rect", { x: 14, y: 3, width: 7, height: 7, rx: 2, fill: "currentColor", opacity: 0.55 }),
        h("rect", { x: 3, y: 14, width: 7, height: 7, rx: 2, fill: "currentColor", opacity: 0.55 }),
        h("rect", { x: 14, y: 14, width: 7, height: 7, rx: 2, fill: "currentColor", opacity: 0.3 })
      );
    }

    return {
      inject: ["slots"],
      apply(ctx) {
        ctx.slots.inject("sidebar.panellist", () =>
          ctx.slots.register({ name: "sidebar.panellist", id: "workforce", order: 30, label: "Workforce" }, Icon)
        );
        ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: "workforce" }, Page));
      },
    };
  },
});
