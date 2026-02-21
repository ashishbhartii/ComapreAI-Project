import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

/* ================= TYPES ================= */

type ModelKey =
  | "groq"
  | "aurora"
  | "glm"
  | "minimax"
  | "gemini"
  | "openai";

type Model = {
  key: ModelKey;
  label: string;
};

type Status =
  | "idle"
  | "loading"
  | "success"
  | "failed";

type Metrics = {
  latency: number;
  length: number;
  accuracy: number;
  overallScore: number;
  speedTier: string;
};

/* ================= MODELS ================= */

const primaryModels: Model[] = [
  { key: "groq", label: "Groq LLaMA-3.1" },
  { key: "aurora", label: "DeepSeek Chat" },
  { key: "glm", label: "GLM-5" },
  { key: "minimax", label: "MiniMax M2.5" }
];


const secondaryModels: Model[] = [
  { key: "gemini", label: "Google Gemini" },
  { key: "openai", label: "OpenAI GPT-4" }
];

const allModels: Model[] = [
  ...primaryModels,
  ...secondaryModels
];

/* ================= HELPERS ================= */

const speedColor = (tier: string) => {

  switch (tier) {

    case "fastest": return "#22c55e";
    case "fast": return "#4ade80";
    case "average": return "#3b82f6";
    case "slow": return "#f59e0b";
    case "slowest": return "#eab308";

    default: return "#2563eb";

  }

};

export default function App() {

  /* ================= STATE ================= */

  const [prompt, setPrompt] = useState("");

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const cardRefs =
    useRef<Record<string, HTMLDivElement>>({});

  const prevPositions =
    useRef<Record<string, DOMRect>>({});

  const [responses, setResponses] =
    useState<Record<ModelKey, string>>({
      groq: "",
      aurora: "",
      glm: "",
      minimax: "",
      gemini: "",
      openai: ""
    });

  const [metrics, setMetrics] =
    useState<Record<ModelKey, Metrics>>({
      groq: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
      aurora: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
      glm: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
      minimax: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
      gemini: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
      openai: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" }
    });

  /* animated metrics state */

  const [animatedMetrics, setAnimatedMetrics] =
    useState(metrics);

  const [status, setStatus] =
    useState<Record<ModelKey, Status>>({
      groq: "idle",
      aurora: "idle",
      glm: "idle",
      minimax: "idle",
      gemini: "idle",
      openai: "idle"
    });

  const [copied, setCopied] =
    useState<Record<ModelKey, boolean>>({
      groq: false,
      aurora: false,
      glm: false,
      minimax: false,
      gemini: false,
      openai: false
    });

  const [showMetrics, setShowMetrics] =
    useState(false);

  const [winnerVisible, setWinnerVisible] =
    useState<ModelKey | null>(null);

  const [winnerGlow, setWinnerGlow] =
    useState<ModelKey | null>(null);
  
/* ================= WINNER SPOTLIGHT ================= */

const [winnerSpotlight, setWinnerSpotlight] =
  useState<ModelKey | null>(null);

const spotlightTimerRef =
  useRef<number | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars

  /* ================= GLOBAL REVEAL ================= */

const [globalRevealActive, setGlobalRevealActive] =
  useState(false);
const revealStartedRef = useRef(false);

const winnerLockRef = useRef<ModelKey | null>(null);

  /* ================= TEXTAREA AUTO SIZE ================= */

  useEffect(() => {

    const ta = textareaRef.current;
    if (!ta) return;

    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";

  }, [prompt]);

  /* ================= TRUE PHYSICS SPRING ANIMATION ================= */

  type SpringState = {
    value: number;
    velocity: number;
  };

  const springRef =
    useRef<
      Record<ModelKey, {
        accuracy: SpringState;
        overallScore: SpringState;
        latency: SpringState;
      }>
    >({} as any);

  useEffect(() => {

    /* initialize spring states if empty */

    allModels.forEach(model => {

      if (!springRef.current[model.key]) {

        springRef.current[model.key] = {

          accuracy: {
            value: animatedMetrics[model.key].accuracy,
            velocity: 0
          },

          overallScore: {
            value: animatedMetrics[model.key].overallScore,
            velocity: 0
          },

          latency: {
            value: animatedMetrics[model.key].latency,
            velocity: 0
          }

        };

      }

    });

    const stiffness = 0.12;   // spring strength
    const damping = 0.80;   // friction
    const precision = 0.001;

    let frame: number;

    const animate = () => {

      let done = true;

      const nextMetrics =
        {} as Record<ModelKey, Metrics>;

      allModels.forEach(model => {

        const target =
          metrics[model.key];

        const spring =
          springRef.current[model.key];

        const step = (
          state: SpringState,
          targetValue: number
        ) => {

          const force =
            (targetValue - state.value)
            * stiffness;

          state.velocity =
            state.velocity * damping
            + force;

          state.value +=
            state.velocity;

          if (
            Math.abs(state.velocity) > precision ||
            Math.abs(targetValue - state.value) > precision
          ) done = false;

          return state.value;

        };

        const accuracy =
          step(
            spring.accuracy,
            target.accuracy
          );

        const score =
          step(
            spring.overallScore,
            target.overallScore
          );

        const latency =
          step(
            spring.latency,
            target.latency
          );

        nextMetrics[model.key] = {

          ...target,

          accuracy,
          overallScore: score,
          latency

        };

      });

      setAnimatedMetrics(nextMetrics);

      if (!done)
        frame =
          requestAnimationFrame(animate);

    };

    frame =
      requestAnimationFrame(animate);

    return () => {
  if (frame) cancelAnimationFrame(frame);
};


  }, [metrics]);





  /* ================= FETCH ================= */

  const fetchModel = async (model: ModelKey) => {

    setStatus(p => ({ ...p, [model]: "loading" }));
    setResponses(p => ({ ...p, [model]: "" }));
    /* FAIL SAFE */

setTimeout(() => {

  setStatus(p => {

    if (p[model] === "loading") {

      return {
        ...p,
        [model]: "failed"
      };

    }

    return p;

  });

}, 30000);

    try {

      const res = await fetch(
        "https://compareai-backend.onrender.com/ai/query-stream",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model })
        }
      );

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {

        const { done, value } =
          await reader.read();

        if (done) break;

        buffer += decoder.decode(value);

        const events = buffer.split("\n");

        for (let i = 0; i < events.length - 1; i++) {

          const event =
            JSON.parse(events[i]);

          if (event.type === "token") {

            setResponses(p => ({
              ...p,
              [model]: p[model] + event.token
            }));

          }

          if (event.type === "complete") {

            setShowMetrics(true);

            setMetrics(p => ({
              ...p,
              [model]: {
                latency: event.latency || 0,
                length: event.length || 0,
                accuracy: event.accuracy || 0,
                overallScore: event.overallScore || 0,
                speedTier: event.speedTier || "failed"
              }
            }));

            setStatus(p => ({
              ...p,
              [model]: event.success ? "success" : "failed"
            }));
          }

        }

        buffer = events[events.length - 1];

      }

    }
    catch {

      setStatus(p => ({
        ...p,
        [model]: "failed"
      }));

    }

  };

  /* ================= SEARCH ================= */

  const search = () => {

  if (!prompt.trim()) return;

  revealStartedRef.current = false;
  winnerLockRef.current = null;
  setStatus({
  groq: "idle",
  aurora: "idle",
  glm: "idle",
  minimax: "idle",
  gemini: "idle",
  openai: "idle"
});

  setShowMetrics(false);

  setWinnerVisible(null);
  setWinnerGlow(null);
  setWinnerSpotlight(null);


  // reset animation metrics
  setAnimatedMetrics({
    groq: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
    aurora: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
    glm: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
    minimax: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
    gemini: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" },
    openai: { latency: 0, length: 0, accuracy: 0, overallScore: 0, speedTier: "failed" }
  });
  setResponses({
  groq: "",
  aurora: "",
  glm: "",
  minimax: "",
  gemini: "",
  openai: ""
});

  allModels.forEach(m =>
    fetchModel(m.key)
  );

};

// /* ================= WINNER SPOTLIGHT (WORKING VERSION) ================= */

// useEffect(() => {

//   if (!winnerVisible) return;

//   /* blur cards */
//   setGlobalRevealActive(true);

//   /* show winner stats after 1.5 sec */
//   const showTimer = setTimeout(() => {

//     setWinnerSpotlight(winnerVisible);

//   }, 1500);

//   /* remove blur and hide stats after 3 sec */
//   const hideTimer = setTimeout(() => {

//     setWinnerSpotlight(null);
//     setGlobalRevealActive(false);

//   }, 3000);

//   return () => {

//     clearTimeout(showTimer);
//     clearTimeout(hideTimer);

//   };

// }, [winnerVisible]);


  /* ================= LIVE WINNER CALC (uses animated score) ================= */

  const winnerModel =
    useMemo(() => {

      const success =
  primaryModels.filter(
    m => status[m.key] === "success" && metrics[m.key].overallScore > 0
  );


      if (!success.length)
        return null;

      return success.sort(
        (a, b) =>
          animatedMetrics[b.key].overallScore -
          animatedMetrics[a.key].overallScore
      )[0].key;

    }, [animatedMetrics, status, metrics]);


/* ================= LIVE CROWN TRANSFER + AUTO CENTER (LOCKED WINNER) ================= */

useEffect(() => {

  if (!winnerModel) return;

  /* CRITICAL: prevent winner from changing once chosen */
  if (!winnerLockRef.current && status[winnerModel] === "success")
 {

    winnerLockRef.current = winnerModel;

    setWinnerVisible(winnerModel);

    /* glow after slight delay */
    const glowTimer = setTimeout(() => {

      setWinnerGlow(winnerModel);

    }, 150);

    /* AUTO CENTER WINNER */
    const centerTimer = setTimeout(() => {

      const el = cardRefs.current[winnerModel];

      if (el) {

        el.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest"
        });

      }

    }, 250);

    return () => {

      clearTimeout(glowTimer);
      clearTimeout(centerTimer);

    };

  }

}, [winnerModel]);



/* ================= WINNER SPOTLIGHT (FINAL — RUN ONLY ONCE) ================= */



useEffect(() => {

  if (!winnerVisible || !winnerLockRef.current) return;


  if (revealStartedRef.current) return;

  revealStartedRef.current = true;

  setGlobalRevealActive(true);

  const showTimer = setTimeout(() => {

    setWinnerSpotlight(winnerVisible);

  }, 1500);

  const hideTimer = setTimeout(() => {

    setWinnerSpotlight(null);

    setGlobalRevealActive(false);

  }, 4000);

  return () => {

    clearTimeout(showTimer);
    clearTimeout(hideTimer);

  };

}, [winnerVisible]);




// /* ================= SIMPLE WINNER SPOTLIGHT ================= */

// useEffect(() => {

//   if (!winnerVisible) return;

//   const completed =
//     primaryModels.filter(
//       m =>
//         status[m.key] === "success" ||
//         status[m.key] === "failed"
//     ).length;

//   if (completed === 0) return;

//   /* blur cards */
//   setGlobalRevealActive(true);

//   /* show winner card */
//   const showTimer = setTimeout(() => {

//     setWinnerSpotlight(winnerVisible);

//   }, 1200);

//   /* remove blur and hide spotlight */
//   const hideTimer = setTimeout(() => {

//     setWinnerSpotlight(null);
//     setGlobalRevealActive(false);

//   }, 4000);

//   return () => {

//     clearTimeout(showTimer);
//     clearTimeout(hideTimer);

//   };

// }, [winnerVisible]);






  /* ================= RANK (FIXED — USE ANIMATED METRICS) ================= */

const rankedModels =
  useMemo(() =>
    [...primaryModels]
      .sort(
        (a, b) =>
          animatedMetrics[b.key].overallScore -
          animatedMetrics[a.key].overallScore
      ),
    [animatedMetrics]
  );
  void rankedModels;


  const [displayOrder,
    setDisplayOrder] =
    useState([
      ...primaryModels,
      ...secondaryModels
    ]);

  /* ================= RANK MAP ================= */

const rankMap =
  useMemo(() => {

    const map =
      {} as Record<ModelKey, number>;

    displayOrder.forEach(
      (model, index) => {

        map[model.key] =
          index + 1;

      });

    return map;

  }, [displayOrder]);

  /* ================= LIVE DISPLAY ORDER (SAFE + PHYSICS SYNCED) ================= */

  useEffect(() => {

  const hasStarted =
    primaryModels.some(
      m => status[m.key] !== "idle"
    );

  if (!hasStarted)
    return;

  const timer =
    setTimeout(() => {

      /* create unique ordered list */

      const success =
        primaryModels
          .filter(m => status[m.key] === "success")
          .sort(
            (a, b) =>
              animatedMetrics[b.key].overallScore -
              animatedMetrics[a.key].overallScore
          );

      const loading =
        primaryModels.filter(
          m => status[m.key] === "loading"
        );

      const failed =
        primaryModels.filter(
          m => status[m.key] === "failed"
        );

      setDisplayOrder([

        ...success,
        ...loading,
        ...failed,
        ...secondaryModels

      ]);

    }, 120);

  return () =>
    clearTimeout(timer);

}, [animatedMetrics, status]);


  /* ================= FLIP ================= */

  useLayoutEffect(() => {

    const newPos: Record<string, DOMRect> = {};

    displayOrder.forEach(model => {

      const el =
        cardRefs.current[model.key];

      if (!el) return;

      newPos[model.key] =
        el.getBoundingClientRect();

      const prev =
        prevPositions.current[model.key];

      if (!prev) return;

      const dx =
        prev.left -
        newPos[model.key].left;

      if (Math.abs(dx) < 1)
        return;

      el.style.transition = "none";

      el.style.transform =
        `translate3d(${dx}px,0,0)`;

      requestAnimationFrame(() => {

        el.style.transition =
          "transform 600ms cubic-bezier(.22,.61,.36,1)";

        el.style.transform =
          "translate3d(0,0,0)";

      });

    });

    prevPositions.current =
      newPos;

  }, [displayOrder]);

  /* ================= COPY ================= */

  const copy =
    async (model: ModelKey) => {

      await navigator.clipboard.writeText(
        responses[model]
      );

      setCopied(p => ({
        ...p,
        [model]: true
      }));

      setTimeout(() =>
        setCopied(p => ({
          ...p,
          [model]: false
        })),
        1500
      );

    };

  /* ================= CARD ================= */

  const renderCard =
    (model: Model) => {

      const m =
        metrics[model.key];

      const isVisible =
        winnerVisible === model.key;void isVisible;

      const isGlow =
        winnerGlow === model.key;

      const isWinner = winnerVisible === model.key;void isWinner;

      let border = "#374151";

      if (status[model.key] === "loading")
        border = "#6b7280";

      else if (status[model.key] === "failed")
        border = "#ef4444";

      else if (status[model.key] === "success")
        border = speedColor(m.speedTier);

      return (

        <div
  key={model.key}

  ref={el => {
    if (el)
      cardRefs.current[model.key] = el;
  }}



className={`card
${status[model.key]}
${winnerVisible === model.key ? "winnerVisible" : ""}
${winnerGlow === model.key ? "winnerGlow" : ""}
${globalRevealActive && winnerSpotlight !== model.key
  ? "globalBlur"
  : ""}


`}





  style={{
    borderColor: border
  }}
>


          <div className="cardHeader">
              <div className="rankBadge">
    #{rankMap[model.key]}
  </div>
            <div className="modelName">

              {model.label}

              {isGlow && <span> 👑</span>}

              <span className="badge">

                {status[model.key] === "success"
                  ? `${Math.round(animatedMetrics[model.key].latency)} ms`
                  : "—"}

              </span>

            </div>

            <button
              className="copyBtn"
              onClick={() => copy(model.key)}
            >
              {copied[model.key]
                ? "Copied ✓"
                : "Copy"}
            </button>

          </div>
          {/* test section starts */}
          <div className="scoreRow">

            <div className="scoreValue">
              {status[model.key] === "success"
                ? animatedMetrics[model.key].overallScore.toFixed(2)
                : "--"}
            </div>

            <div className="scoreBarContainer">

              <div
                className="scoreBarFill"
                style={{
                  width: `${animatedMetrics[model.key].overallScore * 10}%`,
                  background:
                    status[model.key] === "success"
                      ? speedColor(metrics[model.key].speedTier)
                      : "#374151"
                }}
              />

            </div>

          </div>

          {/* test section ends */}

          {/* Another test for response starts headers */}

          {winnerSpotlight === model.key && (
  <div className="winnerRevealOverlay">

    <div className="winnerRevealCard">

      <div className="revealTitle">🏆 Best Response</div>

      <div className="revealModel">{model.label}</div>

      <div className="revealMetrics">
        Score: {metrics[model.key].overallScore.toFixed(2)}<br/>
        Accuracy: {metrics[model.key].accuracy.toFixed(1)}<br/>
        Speed: {metrics[model.key].speedTier}<br/>
        Latency: {Math.round(metrics[model.key].latency)} ms
      </div>

    </div>

  </div>
)}

          {/* Ends here */}

          <div
  className="responseBox"
  style={{
    maxHeight: "320px",
    overflowY: "auto"
  }}
>

            {status[model.key] === "loading"
              ? "Typing..."
              :
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {responses[model.key] || "Ready"}
              </ReactMarkdown>
            }

          </div>

        </div>

      );

    };

  /* ================= UI ================= */

  return (

    <div className="page" style={{
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden"
}}>

      <div
  className="container"
  style={{
    flex: 1,
    overflowY: "auto",
    paddingBottom: "140px"
  }}
>

        <h1 className="title">
          CompareAI
        </h1>

        <div
  className="cardGrid"
  style={{
    alignItems: "start"
  }}
>
          {displayOrder.map(renderCard)}
        </div>





      </div>

      {showMetrics && (

        <div className="metricsPanel show">

          <table className="metricsTable">

            <thead>
              <tr>
                <th>Model</th>
                <th>Latency</th>
                <th>Accuracy</th>
                <th>Score</th>
                <th>Speed</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {displayOrder.map(m => (

                <tr key={m.key}>

                  <td>{m.label}</td>

                  <td>
                    {Math.round(animatedMetrics[m.key].latency) || "—"}
                  </td>

                  <td>
                    {animatedMetrics[m.key].accuracy.toFixed(1)}
                  </td>

                  <td>
                    {animatedMetrics[m.key].overallScore.toFixed(2)}
                  </td>

                  <td style={{
                    color:
                      speedColor(metrics[m.key].speedTier)
                  }}>
                    {metrics[m.key].speedTier}
                  </td>

                  <td>{status[m.key]}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

      <div
  className="searchSticky"
  style={{
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(900px, 92%)",
    zIndex: 1000
  }}
>

        <div className="plusBtn">+</div>

        <textarea
          ref={textareaRef}
          className="searchInput"
          value={prompt}
          placeholder="Ask anything..."
          onChange={e =>
            setPrompt(e.target.value)
          }
          onKeyDown={e => {

            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {

              e.preventDefault();
              search();

            }

          }}
        />

        <div className="voiceBtn">🎤</div>

        <div
          className="sendBtn"
          onClick={search}
        >
          ↑
        </div>

      </div>

    </div>

  );

}
