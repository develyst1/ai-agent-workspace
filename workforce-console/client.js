window.__ModuleLoader__.load({
  id: "@local/dsh-workforce",
  factory(require) {
    const React = require("react");
    const h = React.createElement;

    // ASCII-only source: special characters are \u escapes so a Windows re-save
    // cannot double-encode the file again (see PLUGINS.md, 0.4.0).
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

    const GAP = 8;
    const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
    const NODE_W = 118;
    const NODE_H = 52;
    const COL_W = 280;
    const COL_PITCH = 300;
    const LEFT = 40;

    const GATE = { PASS: C.ok, WARN: C.warn, FAIL: C.err };

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

    function teamKey(team) {
      const match = /^[A-Za-z0-9]+/.exec(String(team || "").trim());
      return match ? match[0].toUpperCase() : "ALL";
    }

    function linkMail(desk, from, to) {
      const person = (desk.people || []).find(
        (candidate) => candidate.name.toLowerCase() === String(to).toLowerCase()
      );
      if (!person || !person.messages) return { count: 0, fresh: false };
      const hit = person.messages.find(
        (message) => String(message.from).toLowerCase() === String(from).toLowerCase()
      );
      return { count: hit ? hit.count : 0, fresh: Boolean(person.newMail) };
    }

    function initial(name) {
      return String(name || "?").slice(0, 1).toUpperCase();
    }

    function Node({ person, x, y, stuck, onSelect, desk, selected }) {
      const state = person ? person.status || "no session" : "no session";
      const hollow = state === "no session" || state === "no live view";
      const edge = stuck ? C.warn : state === "busy" ? C.ok : state === "waiting" ? C.warn : C.border2;
      const canSend = Boolean(person && person.sessionName);
      const noName = Boolean(person && !person.session);
      const isSelected = Boolean(selected && person && selected.target === person.sessionName);
      return h(
        "div",
        {
          title: person
            ? [
                person.name + " - " + person.role + (person.team ? " " + person.team : ""),
                canSend ? person.sessionName + " - click to send your words" : "no session open",
                noName ? "TEAMS.md has no session name for " + person.name : "",
                person.mail ? person.mail.lines + " message line(s) in " + person.inbox : "",
                stuck ? "NEW mail since they last moved" : "",
              ]
                .filter(Boolean)
                .join("\n")
            : "",
          onClick: canSend
            ? () =>
                onSelect({
                  mode: "send",
                  target: person.sessionName,
                  label: person.sessionName,
                  name: person.name,
                  desk,
                })
            : undefined,
          style: {
            position: "absolute",
            left: x,
            top: y,
            width: NODE_W,
            height: NODE_H,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 10px",
            borderRadius: 8,
            border: isSelected ? "1.5px solid " + C.accent : "1px solid " + C.border,
            borderLeft: "3px solid " + edge,
            boxShadow: isSelected ? "0 0 0 2px " + C.accent : "none",
            background: C.layer2,
            opacity: hollow ? 0.45 : 1,
            overflow: "hidden",
            cursor: canSend ? "pointer" : "default",
          },
        },
        h(
          "span",
          {
            style: {
              width: 20,
              height: 20,
              flex: "0 0 auto",
              borderRadius: 99,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#16130c",
              background: hollow ? C.border2 : C.accent,
              fontFamily: SANS,
            },
          },
          initial(person && person.name)
        ),
        h(
          "span",
          { style: { minWidth: 0, display: "flex", flexDirection: "column", lineHeight: 1.25 } },
          h(
            "span",
            { style: { display: "flex", alignItems: "center", gap: 4, minWidth: 0 } },
            h(
              "span",
              {
                style: {
                  fontSize: 12.5,
                  color: C.text,
                  fontFamily: SANS,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              },
              person ? person.name : "?"
            ),
            noName
              ? h(
                  "span",
                  {
                    title: "TEAMS.md has no session name for " + person.name,
                    style: {
                      fontSize: 9,
                      color: C.warn,
                      border: "1px solid " + C.warn,
                      borderRadius: 3,
                      padding: "0 2px",
                      lineHeight: "12px",
                    },
                  },
                  "?"
                )
              : null
          ),
          h(
            "span",
            { style: { fontSize: 9.5, color: C.sub, fontFamily: SANS, whiteSpace: "nowrap" } },
            person ? person.role + (person.team && person.team !== "all" ? " \u00b7 " + teamKey(person.team) : "") : ""
          )
        )
      );
    }

    function ChainView({ desk, onSelect, selected }) {
      const people = desk.people || [];
      const pm = people.find((person) => person.role === "PM");
      if (!pm) return h("div", { style: { fontSize: 11, color: C.sub } }, "no PM row in TEAMS.md");

      const qas = people.filter((person) => person.role === "QA");
      const sas = people.filter((person) => person.role === "SA");
      const teams = sas.map((sa) => ({
        key: teamKey(sa.team),
        sa,
        members: people.filter(
          (person) => (person.role === "BE" || person.role === "FE") && teamKey(person.team) === teamKey(sa.team)
        ),
      }));

      const width = LEFT * 2 + Math.max(1, teams.length) * COL_PITCH - (COL_PITCH - COL_W);
      const centre = width / 2;
      const pmX = centre - NODE_W / 2;
      const pmY = 46;
      const ownerY = 10;
      const qaY = pmY;
      const teamTop = 170;
      const memberTop = 258;
      const height = memberTop + NODE_H + 16;

      const lines = [];
      let key = 0;
      const line = (x1, y1, x2, y2, mail, arrowed) => {
        const fresh = mail && mail.fresh && mail.count > 0;
        lines.push(
          h("path", {
            key: "l" + key++,
            d: "M" + x1 + " " + y1 + " L" + x2 + " " + y2,
            stroke: fresh ? C.warn : C.border2,
            strokeWidth: 1.5,
            fill: "none",
            markerEnd: arrowed === false ? undefined : fresh ? "url(#arrow-fresh)" : "url(#arrow)",
          })
        );
        if (fresh) {
          lines.push(
            h(
              "text",
              {
                key: "t" + key++,
                x: (x1 + x2) / 2 + 6,
                y: (y1 + y2) / 2 - 4,
                fill: C.warn,
                fontSize: 10,
                fontFamily: SANS,
                fontWeight: 700,
              },
              String(mail.count)
            )
          );
        }
      };

      // owner -> PM
      line(centre, ownerY + 12, centre, pmY, linkMail(desk, "owner", pm.name));

      // PM -> each QA (short branch to the right)
      qas.forEach((qa, index) => {
        const qaX = pmX + NODE_W + 28 + index * (NODE_W + 20);
        line(pmX + NODE_W, pmY + NODE_H / 2, qaX, qaY + NODE_H / 2, linkMail(desk, pm.name, qa.name));
      });

      // PM -> each team's SA, one elbow per column
      const elbowY = pmY + NODE_H + 42;
      line(centre, pmY + NODE_H, centre, elbowY, null, false);
      teams.forEach((team, index) => {
        const colX = LEFT + index * COL_PITCH;
        const colCentre = colX + COL_W / 2;
        line(centre, elbowY, colCentre, elbowY, null, false);
        line(colCentre, elbowY, colCentre, teamTop, linkMail(desk, pm.name, team.sa.name));

        // SA -> BE / FE fork
        const memberY = memberTop;
        const beX = colX + 10;
        const feX = colX + COL_W - NODE_W - 10;
        const firstX = beX + NODE_W / 2;
        const lastX = feX + NODE_W / 2;
        line(colCentre, teamTop + NODE_H, colCentre, teamTop + NODE_H + 18, null, false);
        if (team.members.length) {
          line(firstX, teamTop + NODE_H + 18, lastX, teamTop + NODE_H + 18, null, false);
          team.members.forEach((member, memberIndex) => {
            const targetX = memberIndex === 0 ? firstX : lastX;
            line(targetX, teamTop + NODE_H + 18, targetX, memberY, linkMail(desk, team.sa.name, member.name));
          });
        }
      });

      const nodes = [];
      nodes.push(
        h(
          "div",
          {
            key: "owner",
            style: {
              position: "absolute",
              left: centre - 30,
              top: ownerY,
              width: 60,
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.sub,
              fontFamily: SANS,
            },
          },
          "owner"
        )
      );
      nodes.push(h(Node, { key: "pm", person: pm, x: pmX, y: pmY, stuck: pm.stuck, onSelect, desk: desk.name, selected }));
      qas.forEach((qa, index) => {
        nodes.push(
          h(Node, {
            key: qa.name,
            person: qa,
            x: pmX + NODE_W + 28 + index * (NODE_W + 20),
            y: qaY,
            stuck: qa.stuck,
            onSelect,
          })
        );
      });

      teams.forEach((team, index) => {
        const colX = LEFT + index * COL_PITCH;
        const colCentre = colX + COL_W / 2;
        const active = [team.sa, ...team.members].some(
          (person) => person.status === "busy" || person.status === "waiting" || person.stuck
        );
        nodes.push(
          h(
            "div",
            {
              key: "h" + team.key,
              style: {
                position: "absolute",
                left: colX + 10,
                top: teamTop - 20,
                fontSize: 9,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: active ? C.accent : C.sub,
                fontFamily: SANS,
              },
            },
            "team " + team.key
          )
        );
        nodes.push(
          h(Node, {
            key: "sa" + team.key,
            person: team.sa,
            x: colCentre - NODE_W / 2,
            y: teamTop,
            stuck: team.sa.stuck,
            onSelect,
          })
        );
        const beX = colX + 10;
        const feX = colX + COL_W - NODE_W - 10;
        team.members.forEach((member, memberIndex) => {
          nodes.push(
            h(Node, {
              key: "m" + member.name,
              person: member,
              x: memberIndex === 0 ? beX : feX,
              y: memberTop,
              stuck: member.stuck,
              onSelect,
            })
          );
        });
      });

      // The block must be as wide as the tree really is, or `margin: auto` has
      // nothing to centre. Measure the drawn elements, then shift the whole
      // group so the tree's own bounding box sits in the middle of the card.
      let minX = Infinity;
      let maxX = -Infinity;
      const mark = (value) => {
        if (typeof value === "number" && Number.isFinite(value)) {
          minX = Math.min(minX, value);
          maxX = Math.max(maxX, value);
        }
      };
      for (const element of nodes) {
        const props = element.props || {};
        if (typeof props.x === "number") {
          mark(props.x);
          mark(props.x + NODE_W);
        } else if (props.style && typeof props.style.left === "number") {
          mark(props.style.left);
          mark(props.style.left + 60);
        }
      }
      for (const element of lines) {
        const props = element.props || {};
        if (typeof props.x === "number") mark(props.x);
        if (typeof props.d === "string") {
          const numbers = props.d.match(/-?\d+(?:\.\d+)?/g) || [];
          for (let index = 0; index + 1 < numbers.length; index += 2) {
            mark(Number(numbers[index]));
          }
        }
      }
      if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
        minX = 0;
        maxX = width;
      }
      const padX = 12;
      const bboxWidth = Math.max(1, maxX - minX) + padX * 2;
      const offsetX = padX - minX;

      return h(
        "div",
        {
          style: {
            position: "relative",
            width: bboxWidth,
            maxWidth: "100%",
            height: height,
            margin: "6px auto 0",
          },
        },
        h(
          "div",
          {
            style: {
              position: "absolute",
              left: offsetX,
              top: 0,
              width: width,
              height: height,
            },
          },
          h(
            "svg",
            {
              width: width,
              height: height,
              viewBox: "0 0 " + width + " " + height,
              style: { position: "absolute", left: 0, top: 0, overflow: "visible" },
            },
          h(
            "defs",
            null,
            h(
              "marker",
              {
                id: "arrow",
                viewBox: "0 0 6 6",
                refX: 5,
                refY: 3,
                markerWidth: 6,
                markerHeight: 6,
                orient: "auto",
              },
              h("path", { d: "M0 0 L6 3 L0 6 z", fill: C.border2 })
            ),
            h(
              "marker",
              {
                id: "arrow-fresh",
                viewBox: "0 0 6 6",
                refX: 5,
                refY: 3,
                markerWidth: 6,
                markerHeight: 6,
                orient: "auto",
              },
              h("path", { d: "M0 0 L6 3 L0 6 z", fill: C.warn })
            )
          ),
          lines
        ),
          nodes
        )
      );
    }

    function DeskTile({ desk, live, onSelect, onOpen }) {
      const gateColor = desk.gate && GATE[desk.gate.verdict] ? GATE[desk.gate.verdict] : null;
      const stuckPeople = (desk.people || []).filter((person) => person.stuck);
      const age =
        desk.logAgeDays == null ? "no log" : desk.logAgeDays <= 0 ? "today" : desk.logAgeDays + "d ago";
      return h(
        "div",
        {
          onClick: onOpen,
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
            minWidth: 0,
            padding: "7px 10px",
            borderRadius: 8,
            border: "1px solid " + C.border,
            borderLeft: "2px solid " + (live ? C.ok : C.border),
            background: C.layer,
            cursor: "pointer",
          },
        },
        h("span", { style: { fontSize: 10, color: C.sub, width: 10 } }, "\u25b8"),
        gateColor &&
          h("span", {
            title: (desk.gate && desk.gate.line) || "the gate reported no FAIL or WARN line",
            style: { width: 7, height: 7, borderRadius: 99, background: gateColor, flex: "0 0 auto" },
          }),
        h(
          "span",
          {
            style: {
              fontSize: 12.5,
              fontWeight: 600,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          },
          desk.name
        ),
        h(
          "span",
          { style: { fontSize: 10.5, color: C.sub, marginLeft: "auto", whiteSpace: "nowrap" } },
          live ? desk.live + " live \u00b7 " + stuckPeople.length + " stuck" : age
        ),
        live &&
          stuckPeople.map((person) =>
            h(
              "span",
              {
                key: person.name,
                title: "NEW mail from " + ((person.messages || []).map((m) => m.from).join(", ") || "?"),
                onClick: (event) => {
                  event.stopPropagation();
                  if (person.sessionName) {
                    onSelect({
                      mode: "send",
                      target: person.sessionName,
                      label: person.sessionName,
                      name: person.name,
                      desk: desk.name,
                    });
                  }
                },
                style: {
                  fontSize: 10.5,
                  color: C.warn,
                  border: "1px solid " + C.warn,
                  borderRadius: 999,
                  padding: "0 7px",
                  cursor: person.sessionName ? "pointer" : "default",
                },
              },
              person.name
            )
          )
      );
    }

    function DeskCard({ desk, onSelect, onToggle, selected }) {
      const chainRef = React.useRef(null);
      const [geometry, setGeometry] = React.useState(null);
      React.useEffect(() => {
        const element = chainRef.current;
        if (!element || !element.parentElement) return undefined;
        const measure = () => {
          const rect = element.getBoundingClientRect();
          const parent = element.parentElement.getBoundingClientRect();
          setGeometry({
            treeCentre: Math.round((rect.left + rect.right) / 2),
            cardCentre: Math.round((parent.left + parent.right) / 2),
            width: Math.round(rect.width),
          });
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
      }, [desk.name]);
      const age =
        desk.logAgeDays == null ? "no log" : desk.logAgeDays <= 0 ? "log today" : "log " + desk.logAgeDays + "d ago";
      const gateColor = desk.gate && GATE[desk.gate.verdict] ? GATE[desk.gate.verdict] : null;
      const stuckPeople = (desk.people || []).filter((person) => person.stuck);
      const gateDot =
        gateColor &&
        h("span", {
          title: (desk.gate && desk.gate.line) || "the gate reported no FAIL or WARN line",
          style: { width: 7, height: 7, borderRadius: 99, background: gateColor, flex: "0 0 auto" },
        });
      const toggle = h(
        "span",
        { style: { color: C.sub, fontSize: 10, width: 10, display: "inline-block" } },
        "\u25be"
      );


      return h(
        "div",
        {
          style: {
            background: C.layer,
            border: "1px solid " + C.border,
            borderRadius: 10,
            padding: "16px 20px 8px",
            marginBottom: 16,
            minWidth: 0,
            overflowX: "auto",
          },
        },
        h(
          "div",
          {
            onClick: onToggle,
            style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
          },
          toggle,
          gateDot,
          h("span", { style: { fontSize: 13.5, fontWeight: 600, fontFamily: SANS } }, desk.name),
          h(
            "span",
            { style: { fontSize: 10, color: C.sub, fontFamily: SANS } },
            (desk.chain && desk.chain.derived ? "default chain" : "own chain") + " \u00b7 " + age
          )
        ),
        desk.dark && desk.dark.length > 0
          ? h(
              "div",
              { style: { fontSize: 11, color: C.warn, marginTop: 4 } },
              desk.dark.length +
                " live session(s) not matched \u2014 TEAMS.md has no session names (" +
                desk.dark.map((session) => session.name).join(", ") +
                ")"
            )
          : null,
        h(
          "div",
          {
            ref: chainRef,
            title: geometry
              ? "tree centre " + geometry.treeCentre + " px \u00b7 card centre " + geometry.cardCentre + " px \u00b7 tree width " + geometry.width + " px"
              : "",
          },
          h(ChainView, { desk, onSelect, selected })
        )
      );
    }

    function StuckStrip({ desks, onSelect }) {
      const stuck = [];
      for (const desk of desks) {
        for (const person of desk.people || []) if (person.stuck) stuck.push({ desk, person });
      }
      if (!stuck.length) {
        return h(
          "div",
          { style: { fontSize: 11, color: C.sub, marginBottom: 16 } },
          "Nothing is stuck: no live desk has mail newer than its person's last move."
        );
      }
      return h(
        "div",
        { style: { marginBottom: 16 } },
        h(
          "div",
          {
            style: {
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.warn,
              marginBottom: 6,
            },
          },
          "\u0e15\u0e49\u0e2d\u0e07\u0e14\u0e39 \u00b7 " + stuck.length
        ),
        h(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 6 } },
          stuck.map((item) => {
            const senders = (item.person.messages || []).map((m) => m.from + " \u00d7" + m.count).join(", ");
            const canSend = Boolean(item.person.sessionName);
            return h(
              "span",
              {
                key: item.desk.name + item.person.name,
                title:
                  (item.person.inbox || "") +
                  "\nnew mail " +
                  (item.person.mail ? item.person.mail.ageMinutes : "?") +
                  " min old",
                onClick: canSend
                  ? () =>
                      onSelect({
                        mode: "send",
                        target: item.person.sessionName,
                        label: item.person.sessionName,
                        name: item.person.name,
                        desk: item.desk.name,
                      })
                  : undefined,
                style: {
                  padding: "3px 9px",
                  borderRadius: 999,
                  border: "1px solid " + C.warn,
                  color: C.text,
                  cursor: canSend ? "pointer" : "default",
                  whiteSpace: "nowrap",
                },
              },
              item.desk.name +
                " \u00b7 " +
                item.person.name +
                " \u00b7 " +
                (item.person.mail ? item.person.mail.lines : "?") +
                " from " +
                (senders || "?") +
                (item.person.mail ? " \u00b7 " + item.person.mail.ageMinutes + "m" : "")
            );
          })
        )
      );
    }

    function SeatRow({ seats, selected, onSelect }) {
      return h(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 6 } },
        seats.map((seat) => {
          const state = seat.state;
          const canSend = seat.engine !== "deepseek" && Boolean(seat.sessionName);
          const isSel = selected && selected.name === seat.name;
          return h(
            "span",
            {
              key: seat.name,
              title: seat.role + " \u00b7 " + seat.engine + " \u00b7 " + state,
              onClick: () =>
                onSelect(
                  canSend
                    ? { mode: "send", target: seat.sessionName, label: seat.sessionName, name: seat.name }
                    : { mode: "request", target: seat.name, label: seat.name, name: seat.name }
                ),
              style: {
                fontSize: 11,
                fontFamily: SANS,
                padding: "3px 9px",
                borderRadius: 6,
                cursor: "pointer",
                border: "1px solid " + (isSel ? C.accent : C.border),
                background: C.layer,
                color: C.text,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              },
            },
            seat.name,
            h("span", {
              style: {
                width: 6,
                height: 6,
                borderRadius: 99,
                background:
                  state === "busy" ? C.ok : state === "waiting" ? C.warn : state === "idle" || state === "live" ? C.sub : "transparent",
                border: "1px solid " + (state === "no session" || state === "no live view" ? C.border2 : "transparent"),
              },
            }),
            seat.open > 0 ? h("span", { style: { color: C.warn } }, seat.open + " open") : null
          );
        })
      );
    }

    function ensureSpinner() {
      if (typeof document === "undefined") return;
      if (document.getElementById("wf-spin-style")) return;
      const style = document.createElement("style");
      style.id = "wf-spin-style";
      style.textContent = "@keyframes wfspin{to{transform:rotate(360deg)}}";
      document.head.appendChild(style);
    }

    function Composer({ selected, reload, onClose, draft, onDraft }) {
      const [text, setText] = React.useState(draft || "");
      const [busy, setBusy] = React.useState(false);
      const [toast, setToast] = React.useState(null);
      const barRef = React.useRef(null);
      const [barGeometry, setBarGeometry] = React.useState(null);

      React.useEffect(() => {
        const element = barRef.current;
        if (!element || !element.parentElement) return undefined;
        const measure = () => {
          const rect = element.getBoundingClientRect();
          const parent = element.parentElement.getBoundingClientRect();
          setBarGeometry({
            bar: Math.round((rect.left + rect.right) / 2),
            pane: Math.round((parent.left + parent.right) / 2),
          });
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
      }, [selected]);

      React.useEffect(() => {
        const onKey = (event) => {
          if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
      }, [onClose]);

      React.useEffect(() => {
        if (!toast || !toast.ok) return;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
      }, [toast]);

      if (!selected) return null;
      ensureSpinner();
      const isRequest = selected.mode === "request";
      const canSend = text.trim() !== "" && !busy;
      const rows = Math.min(6, Math.max(1, text.split("\n").length));

      const send = () => {
        if (!canSend) return;
        setBusy(true);
        setToast(null);
        fetch("/api/workforce/status", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            isRequest
              ? { action: "request", seat: selected.name, text }
              : { action: "send", target: selected.target, text }
          ),
        })
          .then((response) => response.json())
          .then((value) => {
            setBusy(false);
            if (value.ok) {
              setText("");
              onDraft("");
              setToast({
                ok: true,
                message:
                  value.action === "request"
                    ? "REQUEST written: " + value.file
                    : "Sent to " + selected.name,
              });
            } else {
              setToast({ ok: false, message: String(value.error || "delivery failed") });
            }
            reload();
          })
          .catch((error) => {
            setBusy(false);
            setToast({ ok: false, message: String(error.message || error) });
          });
      };

      const chipLabel = isRequest
        ? "\u2192 REQUEST to " + selected.label
        : selected.name + (selected.desk ? " \u00b7 " + selected.desk : "");

      return h(
        "div",
        {
          style: {
            position: "sticky",
            bottom: 16,
            margin: "0 auto",
            width: "min(720px, calc(100% - 32px))",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          },
        },
        toast &&
          h(
            "div",
            {
              style: {
                alignSelf: "center",
                display: "flex",
                alignItems: "center",
                gap: 8,
                maxWidth: "100%",
                padding: "7px 14px",
                borderRadius: 999,
                fontSize: 12,
                color: toast.ok ? "#0d1a13" : "#fff",
                background: toast.ok ? C.ok : C.err,
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                opacity: 0.96,
              },
            },
            h("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, toast.message),
            toast.ok
              ? null
              : h(
                  "span",
                  {
                    onClick: () => setToast(null),
                    style: { cursor: "pointer", fontWeight: 700, paddingLeft: 6 },
                  },
                  "\u00d7"
                )
          ),
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              padding: "8px 10px",
              background: C.layer,
              border: "1px solid " + C.border2,
              borderRadius: 12,
              boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
            },
          },
          h(
            "span",
            {
              style: {
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                borderRadius: 8,
                background: C.layer2,
                border: "1px solid " + C.border,
                fontSize: 11,
                whiteSpace: "nowrap",
                maxWidth: 260,
                overflow: "hidden",
              },
            },
            h(
              "span",
              {
                style: {
                  width: 18,
                  height: 18,
                  flex: "0 0 auto",
                  borderRadius: 99,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#16130c",
                  background: C.accent,
                },
              },
              initial(selected.name)
            ),
            h("span", { style: { overflow: "hidden", textOverflow: "ellipsis" } }, chipLabel),
            h(
              "span",
              {
                onClick: onClose,
                title: "Close (Esc)",
                style: { cursor: "pointer", color: C.sub, paddingLeft: 2 },
              },
              "\u00d7"
            )
          ),
          h("textarea", {
            value: text,
            rows: rows,
            onChange: (event) => {
              setText(event.target.value);
              onDraft(event.target.value);
            },
            onKeyDown: (event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            },
            placeholder: isRequest ? "REQUEST to " + selected.name + "\u2026" : "Message " + selected.name + "\u2026",
            style: {
              flex: 1,
              minWidth: 0,
              resize: "none",
              background: "transparent",
              color: C.text,
              border: "none",
              outline: "none",
              padding: "6px 2px",
              fontSize: 12.5,
              lineHeight: "18px",
              fontFamily: "inherit",
            },
          }),
          h(
            "span",
            {
              title: "one-way \u00b7 starts a short Claude run \u00b7 not an approval",
              style: { color: C.sub, fontSize: 13, cursor: "help", paddingBottom: 6 },
            },
            "\u24d8"
          ),
          h(
            "button",
            {
              onClick: send,
              disabled: !canSend,
              title: isRequest ? "Write the REQUEST" : "Send",
              style: {
                width: 34,
                height: 34,
                flex: "0 0 auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 99,
                border: "none",
                background: C.accent,
                color: "#16130c",
                cursor: canSend ? "pointer" : "default",
                opacity: canSend ? 1 : 0.4,
              },
            },
            busy
              ? h("span", {
                  style: {
                    width: 14,
                    height: 14,
                    borderRadius: 99,
                    border: "2px solid rgba(22,19,12,0.35)",
                    borderTopColor: "#16130c",
                    animation: "wfspin 0.8s linear infinite",
                  },
                })
              : h(
                  "svg",
                  { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true },
                  isRequest
                    ? h("path", {
                        d: "M7 3h7l4 4v14H7z",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        strokeLinejoin: "round",
                      })
                    : h("path", {
                        d: "M12 19V5M6 11l6-6 6 6",
                        stroke: "currentColor",
                        strokeWidth: 2,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      })
                )
          )
        )
      );
    }
    function Page() {
      const { data, error, loading, reload } = useStatus();
      const [selected, setSelected] = React.useState(null);
      const [drafts, setDrafts] = React.useState({});
      const pick = (value) =>
        setSelected((current) => (current && value && current.target === value.target ? null : value));
      const rootRef = React.useRef(null);
      const [quietOpen, setQuietOpen] = React.useState(() => {
        try {
          return localStorage.getItem("workforce.quietOpen") === "1";
        } catch {
          return false;
        }
      });
      const toggleQuiet = () =>
        setQuietOpen((value) => {
          const next = !value;
          try {
            localStorage.setItem("workforce.quietOpen", next ? "1" : "0");
          } catch {}
          return next;
        });
      const [collapsed, setCollapsed] = React.useState(() => {
        try {
          return JSON.parse(localStorage.getItem("workforce.collapsed") || "{}");
        } catch {
          return {};
        }
      });
      const toggleDesk = (name) =>
        setCollapsed((previous) => {
          const next = { ...previous, [name]: !previous[name] };
          try {
            localStorage.setItem("workforce.collapsed", JSON.stringify(next));
          } catch {}
          return next;
        });
      const [openQuiet, setOpenQuiet] = React.useState(() => {
        try {
          return JSON.parse(localStorage.getItem("workforce.quietDesk") || "{}");
        } catch {
          return {};
        }
      });
      const toggleQuietDesk = (name) =>
        setOpenQuiet((previous) => {
          const next = { ...previous, [name]: !previous[name] };
          try {
            localStorage.setItem("workforce.quietDesk", JSON.stringify(next));
          } catch {}
          return next;
        });

      const desks = (data && data.desks) || [];
      const seats = (data && data.seats) || [];
      const sessions = (data && data.claude) || [];
      const harness = (data && data.harness) || [];
      const liveDesks = desks.filter((desk) => desk.live > 0 || (desk.dark && desk.dark.length > 0));
      const stillDesks = desks.filter((desk) => !(desk.live > 0) && !(desk.dark && desk.dark.length > 0));

      const matched = new Set();
      for (const desk of desks) {
        for (const person of desk.people || []) if (person.sessionName) matched.add(person.sessionName);
        for (const session of desk.dark || []) matched.add(session.name);
      }
      for (const seat of seats) if (seat.sessionName) matched.add(seat.sessionName);
      const otherClaude = sessions.filter((session) => !matched.has(session.name));
      const otherHarness = harness.filter((session) => !(session.title && matched.has(session.title)));

      const summary =
        desks.length + " desks \u00b7 " + sessions.length + " live sessions \u00b7 " + seats.length + " seats";

      return h(
        "div",
        {
          ref: rootRef,
          style: {
            height: "100%",
            overflow: "auto",
            background: C.bg,
            color: C.text,
            fontFamily: SANS,
            display: "flex",
            flexDirection: "column",
          },
        },
        h(
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
            h("div", { style: { fontSize: 15, fontWeight: 600 } }, "Workforce"),
            h(
              "div",
              {
                title: (data && data.claudeError) || (data && data.claudeBin) || "",
                style: { fontSize: 11, color: C.sub, marginTop: 2, cursor: "help" },
              },
              summary
            )
          ),
          h(
            "span",
            { style: { fontSize: 11, color: C.sub, fontFamily: MONO } },
            data && data.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : ""
          ),
          h(
            "button",
            {
              onClick: reload,
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
        ),
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
            {
              onClick: (event) => {
                if (event.target === event.currentTarget) setSelected(null);
              },
              style: { padding: "16px 24px " + (selected ? 104 : 24) + "px", flex: 1 },
            },
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
            h(StuckStrip, { desks, onSelect: pick }),
            liveDesks
              .filter((desk) => !collapsed[desk.name])
              .map((desk) =>
                h(DeskCard, {
                  key: desk.name,
                  desk,
                  onSelect: pick,
                  onToggle: () => toggleDesk(desk.name),
                })
              ),
            liveDesks.some((desk) => collapsed[desk.name]) &&
              h(
                "div",
                {
                  style: {
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 8,
                    marginBottom: 16,
                  },
                },
                liveDesks
                  .filter((desk) => collapsed[desk.name])
                  .map((desk) =>
                    h(DeskTile, {
                      key: desk.name,
                      desk,
                      live: true,
                      onSelect: pick,
                      onOpen: () => toggleDesk(desk.name),
                    })
                  )
              ),
            stillDesks.length > 0 &&
              h(
                "div",
                { style: { marginBottom: 16 } },
                h(
                  "div",
                  {
                    onClick: toggleQuiet,
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                      fontSize: 11,
                      color: C.sub,
                      padding: "4px 0",
                    },
                  },
                  "Other desks \u00b7 " + stillDesks.length + " (no live session)",
                  h("span", null, quietOpen ? "\u25be" : "\u25b8")
                ),
                quietOpen &&
                  h(
                    "div",
                    {
                      style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: 8,
                        marginTop: 6,
                      },
                    },
                    stillDesks.map((desk) =>
                      h(DeskTile, {
                        key: desk.name,
                        desk,
                        live: false,
                        onSelect: pick,
                        onOpen: () => toggleQuietDesk(desk.name),
                      })
                    )
                  ),
                quietOpen &&
                  stillDesks
                    .filter((desk) => openQuiet[desk.name])
                    .map((desk) =>
                      h(DeskCard, {
                        key: "open-" + desk.name,
                        desk,
                        onSelect: pick,
                        onToggle: () => toggleQuietDesk(desk.name),
                      })
                    )
              ),
            (otherClaude.length > 0 || otherHarness.length > 0) &&
              h(
                "div",
                { style: { marginBottom: 16, fontSize: 11, color: C.sub } },
                "Other live sessions: " +
                  [
                    ...otherClaude.map((session) => session.name + " (" + (session.status || "?") + ")"),
                    ...otherHarness.map((session) => (session.title || "untitled harness session") + " (harness)"),
                  ].join(" \u00b7 ")
              ),
            h(
              "div",
              {
                style: {
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.sub,
                  marginBottom: 6,
                },
              },
              "Workspace seats"
            ),
            h(SeatRow, { seats, selected, onSelect: pick })
          ),
        h(Composer, {
          key: selected ? selected.target : "idle",
          selected,
          reload,
          draft: selected ? drafts[selected.target] || "" : "",
          onDraft: (value) => {
            if (selected) setDrafts((current) => ({ ...current, [selected.target]: value }));
          },
          onClose: () => setSelected(null),
        })
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
