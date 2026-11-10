window.__ModuleLoader__.load({
  id: "@local/dsh-workforce",
  factory(require) {
    const React = require("react");
    const h = React.createElement;

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

    const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

    function useStatus() {
      const [state, setState] = React.useState({ loading: true, error: null, data: null });
      const load = React.useCallback((quiet) => {
        if (!quiet) setState((s) => ({ ...s, loading: true, error: null }));
        fetch("/api/workforce/status", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
          .then((data) => setState({ loading: false, error: null, data }))
          .catch((error) =>
            setState((s) => ({ loading: false, error, data: s.data }))
          );
      }, []);
      React.useEffect(() => {
        load();
        const timer = setInterval(() => load(true), 15000);
        return () => clearInterval(timer);
      }, [load]);
      return { ...state, reload: () => load(true) };
    }

    function Header({ at, loading, onReload }) {
      return h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 22px",
            borderBottom: "1px solid " + C.border,
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: C.bg,
          },
        },
        h(
          "div",
          null,
          h("div", { style: { fontSize: 16, fontWeight: 600, color: C.text } }, "Workforce console"),
          h(
            "div",
            { style: { fontSize: 12, color: C.sub, marginTop: 2 } },
            "desks · claude sessions · workspace seats"
          )
        ),
        h("div", { style: { flex: 1 } }),
        h(
          "span",
          {
            style: {
              fontSize: 10.5,
              color: C.ok,
              border: "1px solid " + C.ok,
              borderRadius: 999,
              padding: "2px 8px",
              opacity: 0.9,
            },
          },
          "auto 15s"
        ),
        h(
          "span",
          { style: { fontSize: 11, color: C.sub, fontFamily: mono } },
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
          loading ? "Refreshing…" : "Refresh"
        )
      );
    }

    function Section({ title, count, children }) {
      return h(
        "div",
        { style: { padding: "14px 22px 2px" } },
        h(
          "div",
          {
            style: {
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.sub,
              marginBottom: 8,
            },
          },
          title + (count == null ? "" : " · " + count)
        ),
        children
      );
    }

    function Card({ children, style }) {
      return h(
        "div",
        {
          style: {
            background: C.layer,
            border: "1px solid " + C.border,
            borderRadius: 10,
            padding: "10px 12px",
            ...style,
          },
        },
        children
      );
    }

    function DeskCard({ desk }) {
      return h(
        Card,
        null,
        h("div", { style: { fontSize: 13, color: C.text, fontFamily: mono } }, desk.name),
        h(
          "div",
          { style: { fontSize: 11, color: C.sub, marginTop: 4 } },
          "board " + desk.boardKB + " KB" + (desk.lastLog ? " · log " + desk.lastLog : " · no log")
        )
      );
    }

    function Row({ selected, onClick, children }) {
      return h(
        "div",
        {
          onClick,
          style: {
            display: "grid",
            gridTemplateColumns: "10px 1fr auto",
            gap: 10,
            alignItems: "center",
            padding: "7px 8px",
            borderBottom: "1px solid " + C.border,
            cursor: "pointer",
            borderRadius: 6,
            background: selected ? C.layer2 : "transparent",
            boxShadow: selected ? "inset 2px 0 0 " + C.accent : "none",
          },
        },
        children
      );
    }

    function SessionRow({ agent, selected, onSelect }) {
      const color =
        agent.status === "busy" ? C.ok : agent.status === "waiting" ? C.warn : C.sub;
      return h(
        Row,
        { selected, onClick: () => onSelect({ kind: "session", name: agent.name }) },
        h("span", {
          style: { width: 7, height: 7, borderRadius: 99, background: color, display: "block" },
        }),
        h(
          "div",
          null,
          h(
            "div",
            { style: { fontSize: 12.5, color: C.text, fontFamily: mono } },
            agent.name || "(unnamed)"
          ),
          h("div", { style: { fontSize: 10.5, color: C.sub, marginTop: 1 } }, agent.cwd || "")
        ),
        h(
          "span",
          { style: { fontSize: 10.5, color: color, fontFamily: mono } },
          agent.status || "?"
        )
      );
    }

    function SeatRow({ seat, selected, onSelect }) {
      const deep = seat.engine === "deepseek";
      return h(
        Row,
        { selected, onClick: () => onSelect({ kind: "seat", name: seat.name }) },
        h("span", {
          style: {
            width: 7,
            height: 7,
            borderRadius: 99,
            background: deep ? C.accent : C.sub,
            display: "block",
          },
        }),
        h(
          "div",
          null,
          h(
            "span",
            { style: { fontSize: 12.5, color: C.text, fontFamily: mono } },
            (deep ? "☾ " : "") + seat.name
          ),
          h("span", { style: { fontSize: 10.5, color: C.sub, marginLeft: 8 } }, seat.role)
        ),
        h(
          "span",
          {
            style: {
              fontSize: 10.5,
              color: seat.pending ? C.warn : C.sub,
              fontFamily: mono,
            },
          },
          seat.pending ? seat.pending + " REQUEST" : seat.present ? "idle" : "missing"
        )
      );
    }

    function Composer({ selected, onDone, reload }) {
      const [text, setText] = React.useState("");
      const [busy, setBusy] = React.useState(false);
      const [result, setResult] = React.useState(null);

      React.useEffect(() => {
        setText("");
        setResult(null);
      }, [selected && selected.name]);

      if (!selected) return null;
      const isSeat = selected.kind === "seat";

      const send = () => {
        if (!text.trim() || busy) return;
        setBusy(true);
        setResult(null);
        fetch("/api/workforce/status", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            isSeat
              ? { action: "request", seat: selected.name, text }
              : { action: "send", target: selected.name, text }
          ),
        })
          .then((r) => r.json())
          .then((value) => {
            setResult(value);
            setBusy(false);
            setText("");
            reload();
            onDone && onDone(value);
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
            padding: "12px 22px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          },
        },
        h(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.sub } },
          h("span", { style: { color: C.accent, fontFamily: mono } }, "→ " + selected.name),
          h(
            "span",
            null,
            isSeat
              ? "deepseek seat · will write a REQUEST at the workspace root"
              : "claude session · sends through SendMessage (one small turn)"
          )
        ),
        h(
          "div",
          { style: { display: "flex", gap: 8 } },
          h("textarea", {
            value: text,
            onChange: (e) => setText(e.target.value),
            placeholder: isSeat ? "REQUEST ถึง " + selected.name + "…" : "พิมพ์ถึง " + selected.name + "…",
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
              fontSize: 12.5,
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
                fontSize: 12.5,
                fontWeight: 700,
                cursor: busy ? "default" : "pointer",
                opacity: busy ? 0.7 : 1,
              },
            },
            busy ? "Sending…" : isSeat ? "Drop REQUEST" : "Send"
          )
        ),
        result &&
          h(
            "div",
            { style: { fontSize: 11.5, color: okColor, fontFamily: mono, whiteSpace: "pre-wrap" } },
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
        h(Header, { at: data && data.generatedAt, loading, onReload: reload }),
        error &&
          h(
            "div",
            {
              style: {
                margin: 18,
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid " + C.err,
                color: C.err,
                fontSize: 12,
              },
            },
            "Cannot read the workforce snapshot: " + (error.message || String(error))
          ),
        data &&
          h(
            "div",
            { style: { flex: 1 } },
            h(
              Section,
              { title: "Desks", count: data.desks.length },
              h(
                "div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 8,
                  },
                },
                data.desks.map((desk) => h(DeskCard, { key: desk.name, desk }))
              )
            ),
            h(
              Section,
              { title: "Claude sessions", count: data.claude.length },
              h(
                "div",
                { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" } },
                data.claude.map((agent) =>
                  h(SessionRow, {
                    key: agent.sessionId || agent.name,
                    agent,
                    selected: selected && selected.kind === "session" && selected.name === agent.name,
                    onSelect: setSelected,
                  })
                )
              )
            ),
            h(
              Section,
              { title: "Workspace seats", count: data.seats.length },
              h(
                "div",
                { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" } },
                data.seats.map((seat) =>
                  h(SeatRow, {
                    key: seat.name,
                    seat,
                    selected: selected && selected.kind === "seat" && selected.name === seat.name,
                    onSelect: setSelected,
                  })
                )
              )
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
          ctx.slots.register(
            { name: "sidebar.panellist", id: "workforce", order: 30, label: "Workforce" },
            Icon
          )
        );
        ctx.slots.inject("main", () =>
          ctx.slots.register({ name: "main", key: "workforce" }, Page)
        );
      },
    };
  },
});
