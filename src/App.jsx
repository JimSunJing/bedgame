import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const AUTO_STEP_DELAY_MS = 260;
const FLIP_DURATION_S = 0.56;
const RANDOM_NAMES = ["Alex", "Mia", "Kai", "Nora", "Eve", "Lio", "Rey", "Sia"];

const createTask = (id, title, duration, intensity, notes = "") => ({
  id,
  title,
  duration,
  durationSec: duration,
  intensity,
  notes,
});

const TASKS = {
  duo: {
    light: [
      createTask("d-l-1", "十指紧扣对视", 120, "light"),
      createTask("d-l-2", "轮流在对方耳边说一句\"今晚想听到的话\"", 60, "light"),
      createTask("d-l-3", "用指尖在对方手心写字，让对方猜", 90, "light"),
      createTask("d-l-4", "拥抱不说话，同步深呼吸", 120, "light"),
      createTask("d-l-5", "轮流夸对方\"最让你心动的细节\"各 2 条", 120, "light"),
      createTask("d-l-6", "一方闭眼，另一方用声音引导放松", 60, "light"),
      createTask("d-l-7", "贴近站立 20 秒，不许后退", 20, "light"),
      createTask("d-l-8", "互相整理衣领或头发，保持眼神接触", 60, "light"),
      createTask("d-l-9", "回答问题：你最想我先做什么？", 60, "light"),
      createTask("d-l-10", "慢速贴身舞步", 120, "light"),
    ],
    intimate: [
      createTask("d-i-1", "深吻挑战", 180, "intimate"),
      createTask("d-i-2", "从额头到锁骨的慢吻路线", 30, "intimate"),
      createTask("d-i-3", "蒙眼触碰猜部位", 180, "intimate"),
      createTask("d-i-4", "一方主导 3 分钟，另一方只能配合", 180, "intimate"),
      createTask("d-i-5", "贴耳低语 3 句只对彼此说的话", 90, "intimate"),
      createTask("d-i-6", "接受对方舔耳朵", 60, "intimate"),
      createTask("d-i-7", "坐在对方腿上拥抱", 120, "intimate"),
      createTask("d-i-8", "用嘴叼住内裤传递，掉落重来", 120, "intimate"),
      createTask("d-i-9", "告诉对方最敏感区域，轻触 30 秒", 30, "intimate"),
      createTask("d-i-10", "被对方舔乳头", 60, "intimate"),
      createTask("d-i-11", "脱光衣服完成后续游戏", 90, "intimate"),
      createTask("d-i-12", "忍受对方挠痒痒", 60, "intimate"),
      createTask("d-i-13", "不许说话亲密互动", 60, "intimate"),
      createTask("d-i-14", "舔对方乳沟或被对方舔乳沟（由对方选择）", 90, "intimate"),
      createTask("d-i-15", "轮流说一句你现在最想我做的事", 60, "intimate"),
      createTask("d-i-16", "抽到此项可逃避一次游戏，让对方继续转转盘", 20, "intimate", "special:skip_once"),
    ],
    playful: [
      createTask("d-p-1", "由对方指定完成一个 30 秒挑逗动作", 30, "playful"),
      createTask("d-p-2", "给对方口交", 180, "playful"),
      createTask("d-p-3", "扮演作弊被抓到的学生，被老师打屁股 3 下", 60, "playful"),
      createTask("d-p-4", "禁用词挑战：后续说出禁词就接受小惩罚", 120, "playful"),
      createTask("d-p-5", "扮演小狗，用嘴玩追球游戏（可用网球或内裤、袜子）", 120, "playful"),
      createTask("d-p-6", "帮对方揉脚", 180, "playful"),
      createTask("d-p-7", "抽到此项可逃避一次游戏，让对方继续转转盘", 20, "playful", "special:skip_once"),
      createTask("d-p-8", "戴上乳头夹（或用对方的手夹）双手放头后等待结束", 60, "playful"),
      createTask("d-p-9", "脱光衣服完成后续游戏", 90, "playful"),
      createTask("d-p-10", "表演 30 秒大腿舞 lap dance", 30, "playful"),
      createTask("d-p-11", "一方闭眼，另一方用声音和呼吸挑逗 30 秒", 30, "playful"),
      createTask("d-p-12", "挠痒痒折磨", 60, "playful"),
      createTask("d-p-13", "自慰到快高潮时停止，继续游戏", 180, "playful"),
      createTask("d-p-14", "趴在床上，让对方用一只脚抚摸你的后脑勺", 60, "playful"),
      createTask("d-p-15", "变成坐骑", 60, "playful"),
      createTask("d-p-16", "使用跳蛋或肛塞", 180, "playful"),
    ],
  },
  solo: [
    createTask("s-1", "录下自拍，告诉镜头自己的敏感带", 60, "solo"),
    createTask("s-2", "闭眼进行 1 分钟呼吸与身体扫描", 60, "solo"),
    createTask("s-3", "用手指在大腿内侧做慢触觉练习", 30, "solo"),
    createTask("s-4", "录一段只给自己听的暧昧语音", 15, "solo"),
    createTask("s-5", "写下我最想被一个气场比我强的人怎样对待", 60, "solo"),
    createTask("s-6", "放一首歌，完成 1 分钟身体律动", 60, "solo"),
    createTask("s-7", "观察并记录当下情绪和身体反应", 60, "solo"),
    createTask("s-8", "用一句话写下今晚的欲望关键词", 45, "solo"),
    createTask("s-9", "蒙上自己的眼睛，触摸身体", 30, "solo"),
    createTask("s-10", "拍一张好看的身体私密照收藏", 60, "solo"),
  ],
};

const clampStep = (step) => Math.max(0, Math.min(3, step));

const weightedIntensity = () => {
  const rand = Math.random();
  if (rand < 0.4) return "light";
  if (rand < 0.8) return "intimate";
  return "playful";
};

const getCurrentPlayerName = (mode, turnMode, round, players) => {
  if (mode !== "duo") return players.a;
  if (turnMode === "startB") {
    return round % 2 === 1 ? players.b : players.a;
  }
  return round % 2 === 1 ? players.a : players.b;
};

const sampleTasks = ({ mode, intensity, lastTaskIds }) => {
  const cards = [];
  const used = new Set(lastTaskIds);

  while (cards.length < 3) {
    let pool = [];
    if (mode === "solo") {
      pool = TASKS.solo;
    } else if (intensity === "random") {
      pool = TASKS.duo[weightedIntensity()];
    } else {
      pool = TASKS.duo[intensity || "intimate"];
    }

    const available = pool.filter((task) => !used.has(task.id) && !cards.some((picked) => picked.id === task.id));
    const fallback = pool.filter((task) => !cards.some((picked) => picked.id === task.id));
    const pickPool = available.length ? available : fallback;
    if (!pickPool.length) break;

    const picked = pickPool[Math.floor(Math.random() * pickPool.length)];
    cards.push(picked);
  }

  return cards;
};

const formatMs = (ms) => {
  const sec = Math.floor(ms / 1000);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

const formatDurationLabel = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;

  if (minutes > 0 && remainSeconds > 0) return `${minutes}分${remainSeconds}秒`;
  if (minutes > 0) return `${minutes}分钟`;
  return `${remainSeconds}秒`;
};

const createInitialGameState = () => ({
  screen: "gate",
  consentChecked: false,
  setupStep: 0,
  mode: null,
  intensity: null,
  turnMode: null,
  players: { a: "Alex", b: "Mia" },
  round: 1,
  currentDrawCards: [],
  lastTaskIds: [],
  revealedTaskId: null,
  isRevealingCard: false,
  modal: {
    open: false,
    task: null,
    running: false,
    elapsedMs: 0,
  },
});

function DrawCard({ task, index, isFlipped, isGlowing, disabled, reducedMotion, onReveal }) {
  const durationLabel = formatDurationLabel(task.durationSec);

  return (
    <motion.button
      type="button"
      className={`draw-card${isFlipped ? " is-flipped is-selected" : ""}${isGlowing ? " is-glowing" : ""}`}
      data-task-id={task.id}
      disabled={disabled}
      onClick={onReveal}
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.34, delay: index * 0.05, ease: "easeOut" }}
      whileHover={disabled || reducedMotion ? undefined : { y: -1, scale: 1.015 }}
      whileTap={disabled || reducedMotion ? undefined : { scale: 0.985 }}
    >
      <motion.span
        className="draw-card-inner"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: reducedMotion ? 0.01 : FLIP_DURATION_S,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span className="draw-card-face draw-card-front">
          <span className="draw-card-front-label">点击翻牌</span>
        </span>
        <span className="draw-card-face draw-card-back">
          <span className="draw-card-duration">{durationLabel}</span>
          <span className="draw-card-title">{task.title}</span>
        </span>
      </motion.span>
    </motion.button>
  );
}

export default function App() {
  const reduceMotion = useReducedMotion();
  const [game, setGame] = useState(createInitialGameState);
  const setupStepTimerRef = useRef(null);
  const revealTimerRef = useRef(null);

  const currentPlayer = useMemo(
    () => getCurrentPlayerName(game.mode, game.turnMode, game.round, game.players),
    [game.mode, game.turnMode, game.round, game.players]
  );

  const setupSummary = useMemo(() => {
    const modeMap = { duo: "双人", solo: "单人" };
    const intensityMap = {
      light: "清水",
      intimate: "亲密",
      playful: "调皮",
      random: "随机",
      solo: "自我探索",
    };
    const turnMap = {
      alternate: "轮流",
      startA: "A 先手",
      startB: "B 先手",
      solo: "单人模式",
    };

    return `模式：${modeMap[game.mode] || "--"} · 强度：${intensityMap[game.intensity] || "--"} · 回合：${turnMap[game.turnMode] || "--"}`;
  }, [game.mode, game.intensity, game.turnMode]);

  const scheduleSetupStep = useCallback((nextStep) => {
    if (setupStepTimerRef.current) {
      window.clearTimeout(setupStepTimerRef.current);
    }
    setupStepTimerRef.current = window.setTimeout(() => {
      setGame((prev) => ({ ...prev, setupStep: clampStep(nextStep) }));
    }, AUTO_STEP_DELAY_MS);
  }, []);

  const refreshDrawCards = useCallback((prev) => {
    return sampleTasks({
      mode: prev.mode,
      intensity: prev.intensity,
      lastTaskIds: prev.lastTaskIds,
    });
  }, []);

  const handleDrawCardReveal = useCallback(
    (taskId) => {
      setGame((prev) => {
        if (prev.modal.open || prev.isRevealingCard || prev.revealedTaskId) return prev;
        return {
          ...prev,
          revealedTaskId: taskId,
          isRevealingCard: true,
        };
      });

      if (revealTimerRef.current) {
        window.clearTimeout(revealTimerRef.current);
      }

      const waitMs = reduceMotion ? 80 : Math.round(FLIP_DURATION_S * 1000) + 260;
      revealTimerRef.current = window.setTimeout(() => {
        setGame((prev) => {
          const task = prev.currentDrawCards.find((item) => item.id === taskId);
          if (!task) {
            return { ...prev, isRevealingCard: false, revealedTaskId: null };
          }
          return {
            ...prev,
            isRevealingCard: false,
            modal: {
              open: true,
              task,
              running: false,
              elapsedMs: 0,
            },
          };
        });
      }, waitMs);
    },
    [reduceMotion]
  );

  useEffect(() => {
    return () => {
      if (setupStepTimerRef.current) window.clearTimeout(setupStepTimerRef.current);
      if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!game.modal.open || !game.modal.running) return undefined;

    const timer = window.setInterval(() => {
      setGame((prev) => {
        if (!prev.modal.open || !prev.modal.running) return prev;
        return {
          ...prev,
          modal: {
            ...prev.modal,
            elapsedMs: prev.modal.elapsedMs + 1000,
          },
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [game.modal.open, game.modal.running]);

  useEffect(() => {
    const renderGameToText = () => {
      return JSON.stringify({
        coordinateSystem: "UI flow state only (no spatial canvas)",
        screen: game.screen,
        setupStep: game.setupStep,
        config: {
          mode: game.mode,
          intensity: game.intensity,
          turnMode: game.turnMode,
          players: game.players,
        },
        draw: {
          round: game.round,
          currentPlayer,
          revealedTaskId: game.revealedTaskId,
          isRevealingCard: game.isRevealingCard,
          cards: game.currentDrawCards.map((task) => ({
            id: task.id,
            title: task.title,
            duration: task.duration,
            durationSec: task.durationSec,
            intensity: task.intensity,
            notes: task.notes,
          })),
          cooldown: game.lastTaskIds,
        },
        modal: {
          open: game.modal.open,
          running: game.modal.running,
          task: game.modal.task ? game.modal.task.title : null,
          elapsedMs: game.modal.elapsedMs,
        },
      });
    };

    window.render_game_to_text = renderGameToText;
    window.advanceTime = (ms) => {
      const steps = Math.max(1, Math.round(ms / 100));
      const deltaMs = steps * 100;
      setGame((prev) => {
        if (!prev.modal.open || !prev.modal.running) return prev;
        return {
          ...prev,
          modal: {
            ...prev.modal,
            elapsedMs: prev.modal.elapsedMs + deltaMs,
          },
        };
      });
    };

    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, [game, currentPlayer]);

  const startGame = () => {
    setGame((prev) => {
      if (!prev.mode) return prev;
      if (prev.mode === "duo" && (!prev.intensity || !prev.turnMode)) return prev;
      const next = {
        ...prev,
        screen: "draw",
        round: 1,
        lastTaskIds: [],
        revealedTaskId: null,
        isRevealingCard: false,
        modal: {
          open: false,
          task: null,
          running: false,
          elapsedMs: 0,
        },
      };
      next.currentDrawCards = refreshDrawCards(next);
      return next;
    });
  };

  const closeTaskAndAdvance = () => {
    setGame((prev) => {
      const doneTask = prev.modal.task;
      const nextLastTaskIds = [...prev.lastTaskIds];
      let nextRound = prev.round;

      if (doneTask) {
        nextLastTaskIds.push(doneTask.id);
        if (nextLastTaskIds.length > 2) nextLastTaskIds.shift();
        nextRound += 1;
      }

      const next = {
        ...prev,
        round: nextRound,
        lastTaskIds: nextLastTaskIds,
        revealedTaskId: null,
        isRevealingCard: false,
        modal: {
          open: false,
          task: null,
          running: false,
          elapsedMs: 0,
        },
      };
      next.currentDrawCards = refreshDrawCards(next);
      return next;
    });
  };

  const closeTaskAndResetDraw = () => {
    setGame((prev) => {
      const next = {
        ...prev,
        revealedTaskId: null,
        isRevealingCard: false,
        modal: {
          open: false,
          task: null,
          running: false,
          elapsedMs: 0,
        },
      };
      next.currentDrawCards = refreshDrawCards(next);
      return next;
    });
  };

  const resetToGate = () => {
    setGame(createInitialGameState());
  };

  const renderScreen = () => {
    if (game.screen === "gate") {
      return (
        <motion.section
          key="gate"
          id="screen-gate"
          className="screen"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p className="tag">18+ · CONSENT FIRST</p>
          <h1 className="title">Bed Game</h1>
          <p className="subtle">更亲密，也更尊重边界。</p>
          <div className="hero-card">
            <p className="hero-text">关键词</p>
            <p className="hero-text">暧昧 · 挑战 · 心跳</p>
          </div>
          <div className="rule-card">
            <p>- 任意时刻可叫停</p>
            <p>- 每人每局可跳过 1 次</p>
            <p>- 超出边界的任务自动过滤</p>
          </div>
          <label className="consent-row">
            <input
              id="consent-check"
              type="checkbox"
              checked={game.consentChecked || false}
              onChange={(event) => {
                const checked = event.target.checked;
                setGame((prev) => ({ ...prev, consentChecked: checked }));
              }}
            />
            <span>我已同意规则并确认成年</span>
          </label>
          <motion.button
            id="start-flow-btn"
            className="neon-side-btn"
            disabled={!game.consentChecked}
            whileHover={game.consentChecked && !reduceMotion ? { y: -1, scale: 1.01 } : undefined}
            whileTap={game.consentChecked && !reduceMotion ? { scale: 0.99 } : undefined}
            onClick={() => {
              setGame((prev) => ({ ...prev, screen: "setup", setupStep: 0 }));
            }}
          >
            开始
          </motion.button>
        </motion.section>
      );
    }

    if (game.screen === "setup") {
      return (
        <motion.section
          key="setup"
          id="screen-setup"
          className="screen"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="setup-header">
            <p className="tag">快速配置</p>
            <p id="setup-step-text" className="subtle">
              选项 {game.setupStep + 1}/4
            </p>
          </div>

          <div className="progress-dots">
            {[0, 1, 2, 3].map((idx) => (
              <span key={idx} className={`dot${idx === game.setupStep ? " active" : ""}`} />
            ))}
          </div>

          <div className="setup-viewport">
            <div id="setup-track" className="setup-track" style={{ transform: `translateX(-${game.setupStep * 100}%)` }}>
              <article className="setup-step">
                <h2>今晚你想怎么玩？</h2>
                <button
                  className="option-card neon-gradient-1"
                  data-action="select-mode"
                  data-value="duo"
                  onClick={() => {
                    setGame((prev) => ({
                      ...prev,
                      mode: "duo",
                      intensity: null,
                      turnMode: null,
                      setupStep: 1,
                    }));
                  }}
                >
                  双人游玩
                </button>
                <button
                  className="option-card neon-gradient-2"
                  data-action="select-mode"
                  data-value="solo"
                  onClick={() => {
                    setGame((prev) => ({
                      ...prev,
                      mode: "solo",
                      intensity: "solo",
                      turnMode: "solo",
                      setupStep: 3,
                    }));
                  }}
                >
                  单人游玩
                </button>
                <p className="hint">点击后自动滑到下一页</p>
              </article>

              <article className="setup-step">
                <h2>今晚强度想要到哪里？</h2>
                <button
                  className="option-card neon-gradient-2"
                  data-action="select-intensity"
                  data-value="light"
                  onClick={() => {
                    setGame((prev) => ({ ...prev, intensity: "light" }));
                    scheduleSetupStep(2);
                  }}
                >
                  清水 · 破冰 / 暧昧
                </button>
                <button
                  className="option-card neon-gradient-1"
                  data-action="select-intensity"
                  data-value="intimate"
                  onClick={() => {
                    setGame((prev) => ({ ...prev, intensity: "intimate" }));
                    scheduleSetupStep(2);
                  }}
                >
                  亲密 · 升温 / 贴近
                </button>
                <button
                  className="option-card neon-gradient-3"
                  data-action="select-intensity"
                  data-value="playful"
                  onClick={() => {
                    setGame((prev) => ({ ...prev, intensity: "playful" }));
                    scheduleSetupStep(2);
                  }}
                >
                  调皮 · 火花 / 游戏感
                </button>
                <button
                  className="option-card neon-gradient-4"
                  data-action="select-intensity"
                  data-value="random"
                  onClick={() => {
                    setGame((prev) => ({ ...prev, intensity: "random" }));
                    scheduleSetupStep(2);
                  }}
                >
                  随机 · 偏向清水与亲密
                </button>
                <p className="hint">点击后自动滑到下一页</p>
              </article>

              <article className="setup-step">
                <h2>回合顺序怎么来？</h2>
                <button
                  className="option-card neon-gradient-2"
                  data-action="select-turn"
                  data-value="alternate"
                  onClick={() => {
                    setGame((prev) => ({ ...prev, turnMode: "alternate" }));
                    scheduleSetupStep(3);
                  }}
                >
                  轮流进行
                </button>
                <button
                  className="option-card neon-gradient-1"
                  data-action="select-turn"
                  data-value="startA"
                  onClick={() => {
                    setGame((prev) => ({ ...prev, turnMode: "startA" }));
                    scheduleSetupStep(3);
                  }}
                >
                  A 先手（后续轮流）
                </button>
                <button
                  className="option-card neon-gradient-3"
                  data-action="select-turn"
                  data-value="startB"
                  onClick={() => {
                    setGame((prev) => ({ ...prev, turnMode: "startB" }));
                    scheduleSetupStep(3);
                  }}
                >
                  B 先手（后续轮流）
                </button>
                <p className="hint">点击后自动滑到下一页</p>
              </article>

              <article className="setup-step">
                <h2>怎么称呼彼此？</h2>
                <div className="name-editor">
                  <div className="name-row">
                    <span>A</span>
                    <input
                      id="name-a"
                      type="text"
                      maxLength={16}
                      value={game.players.a}
                      onChange={(event) => {
                        const value = event.target.value.trim();
                        setGame((prev) => ({ ...prev, players: { ...prev.players, a: value || "Alex" } }));
                      }}
                    />
                    <button
                      className="tiny-random"
                      data-action="random-name"
                      data-target="a"
                      type="button"
                      onClick={() => {
                        const picked = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
                        setGame((prev) => ({ ...prev, players: { ...prev.players, a: picked } }));
                      }}
                    >
                      随机
                    </button>
                  </div>
                  <div className="name-row">
                    <span>B</span>
                    <input
                      id="name-b"
                      type="text"
                      maxLength={16}
                      value={game.players.b}
                      onChange={(event) => {
                        const value = event.target.value.trim();
                        setGame((prev) => ({ ...prev, players: { ...prev.players, b: value || "Mia" } }));
                      }}
                    />
                    <button
                      className="tiny-random"
                      data-action="random-name"
                      data-target="b"
                      type="button"
                      onClick={() => {
                        const picked = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
                        setGame((prev) => ({ ...prev, players: { ...prev.players, b: picked } }));
                      }}
                    >
                      随机
                    </button>
                  </div>
                </div>
                <p id="setup-summary" className="hint">
                  {setupSummary}
                </p>
                <motion.button
                  id="go-game-btn"
                  className="neon-side-btn"
                  whileHover={!reduceMotion ? { y: -1, scale: 1.01 } : undefined}
                  whileTap={!reduceMotion ? { scale: 0.99 } : undefined}
                  onClick={startGame}
                >
                  进入游戏
                </motion.button>
              </article>
            </div>
          </div>
        </motion.section>
      );
    }

    if (game.screen === "draw") {
      return (
        <motion.section
          key="draw"
          id="screen-draw"
          className="screen"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <p id="round-indicator" className="tag">
            回合 {String(game.round).padStart(2, "0")} · 当前玩家 {currentPlayer}
          </p>
          <div className="draw-panel">
            <h2>抽一张任务卡</h2>
            <p className="subtle">点选一张卡后，弹出任务窗口</p>
            <div id="draw-cards" className="draw-cards">
              {game.currentDrawCards.map((task, index) => {
                const isFlipped = game.revealedTaskId === task.id;
                const isGlowing = game.revealedTaskId === task.id;
                const anotherCardIsOpen = Boolean(game.revealedTaskId && !isFlipped);
                const disabled = game.modal.open || game.isRevealingCard || anotherCardIsOpen;

                return (
                  <DrawCard
                    key={task.id}
                    task={task}
                    index={index}
                    isFlipped={isFlipped}
                    isGlowing={isGlowing}
                    disabled={disabled}
                    reducedMotion={Boolean(reduceMotion)}
                    onReveal={() => handleDrawCardReveal(task.id)}
                  />
                );
              })}
            </div>
            <p className="hint">完成任务并点击停止后，返回此页刷新三张卡</p>
          </div>
          <motion.button
            id="refresh-draw-btn"
            className="neon-side-btn"
            whileHover={!reduceMotion ? { y: -1, scale: 1.01 } : undefined}
            whileTap={!reduceMotion ? { scale: 0.99 } : undefined}
            onClick={() => {
              setGame((prev) => {
                if (prev.modal.open) return prev;
                const next = {
                  ...prev,
                  revealedTaskId: null,
                  isRevealingCard: false,
                };
                next.currentDrawCards = refreshDrawCards(next);
                return next;
              });
            }}
          >
            抽取任务卡
          </motion.button>
          <button
            id="end-game-btn"
            className="ghost-btn"
            type="button"
            onClick={() => {
              setGame((prev) => ({
                ...prev,
                screen: "aftercare",
                modal: {
                  open: false,
                  task: null,
                  running: false,
                  elapsedMs: 0,
                },
              }));
            }}
          >
            结束游戏 → 自动进入 Aftercare
          </button>
        </motion.section>
      );
    }

    return (
      <motion.section
        key="aftercare"
        id="screen-aftercare"
        className="screen"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <p className="tag">Aftercare</p>
        <h2>慢下来，确认彼此都舒适。</h2>
        <div className="rule-card">
          <p id="aftercare-q1">{game.players.a}：刚才最喜欢的瞬间是什么？</p>
          <p id="aftercare-q2">{game.players.b}：有没有需要下次调整的边界？</p>
        </div>
        <div className="hero-card">
          <p className="hero-text">拥抱倒计时</p>
          <p className="hero-text">02:00</p>
        </div>
        <motion.button
          id="play-again-btn"
          className="neon-side-btn"
          whileHover={!reduceMotion ? { y: -1, scale: 1.01 } : undefined}
          whileTap={!reduceMotion ? { scale: 0.99 } : undefined}
          onClick={resetToGate}
        >
          再来一局
        </motion.button>
      </motion.section>
    );
  };

  return (
    <>
      <motion.div
        className="bg-orb orb-a"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 12, -8, 0],
                y: [0, -10, 8, 0],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="bg-orb orb-b"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -10, 10, 0],
                y: [0, 6, -6, 0],
              }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.main
        className="app-shell"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">{renderScreen()}</AnimatePresence>

        <AnimatePresence>
          {game.modal.open && game.modal.task ? (
            <motion.div
              key="task-modal"
              id="task-modal"
              className="task-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.div className="task-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                  className="task-window"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  <p className="tag">任务名称</p>
                  <h3 id="modal-task-title">{game.modal.task.title}</h3>
                  <p id="modal-task-duration" className="task-duration">
                    限时：{formatDurationLabel(game.modal.task.durationSec)}
                  </p>
                  <motion.button
                    id="modal-start-btn"
                    className="neon-side-btn"
                    whileHover={!reduceMotion ? { y: -1, scale: 1.01 } : undefined}
                    whileTap={!reduceMotion ? { scale: 0.99 } : undefined}
                    onClick={() => {
                      setGame((prev) => {
                        if (!prev.modal.open || !prev.modal.task || prev.modal.running) return prev;
                        return {
                          ...prev,
                          modal: {
                            ...prev.modal,
                            running: true,
                          },
                        };
                      });
                    }}
                  >
                    开始任务
                  </motion.button>
                  <div className="timer-card">
                    <motion.p
                      id="modal-timer"
                      className={game.modal.running ? "timer-running" : ""}
                      animate={
                        game.modal.running && !reduceMotion
                          ? { scale: [1, 1.04, 1] }
                          : { scale: 1 }
                      }
                      transition={
                        game.modal.running && !reduceMotion
                          ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                          : { duration: 0.2 }
                      }
                    >
                      {formatMs(game.modal.elapsedMs)}
                    </motion.p>
                    <small>
                      按下开始任务后计时（目标时长：{formatMs(game.modal.task.durationSec * 1000)}）
                    </small>
                  </div>
                  <motion.button
                    id="modal-stop-btn"
                    className="neon-side-btn"
                    whileHover={!reduceMotion ? { y: -1, scale: 1.01 } : undefined}
                    whileTap={!reduceMotion ? { scale: 0.99 } : undefined}
                    onClick={closeTaskAndAdvance}
                  >
                    停止任务：开始下一次抽卡
                  </motion.button>
                  <button id="modal-close-btn" className="ghost-btn" type="button" onClick={closeTaskAndResetDraw}>
                    关闭弹窗（返回抽卡页）
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.main>
    </>
  );
}
