"use client";

import { useEffect, useRef, useState } from "react";

const THEMES = {
  pastelCafe: {
    label: "Pastel Café",
    focusBg: "linear-gradient(180deg, #FFF9F2 0%, #FFF1D6 100%)",
    breakBg: "linear-gradient(180deg, #E4FBFF 0%, #C2F3FF 100%)",
    primaryButtonBg: "#333333",
    primaryButtonColor: "#FFFFFF",
    secondaryButtonBg: "#FFFFFF",
    secondaryButtonColor: "#333333",
    cupBackground: "rgba(255,255,255,0.4)",
    confettiColors: ["#F9E076", "#F8A5C2", "#7FB77E", "#FFD1DC"],
  },
  softGirlPink: {
    label: "Soft Girl Pink",
    focusBg: "linear-gradient(180deg, #FFE5F1 0%, #FFD1E8 100%)",
    breakBg: "linear-gradient(180deg, #FFEAF5 0%, #FFE0F0 100%)",
    primaryButtonBg: "#E06AA3",
    primaryButtonColor: "#FFFFFF",
    secondaryButtonBg: "#FFFFFF",
    secondaryButtonColor: "#E06AA3",
    cupBackground: "rgba(255,255,255,0.7)",
    confettiColors: ["#FFC6E0", "#FFE4F2", "#E06AA3", "#FFB8D2"],
  },
  darkAcademia: {
    label: "Dark Academia",
    focusBg: "linear-gradient(180deg, #2B2520 0%, #1A1714 100%)",
    breakBg: "linear-gradient(180deg, #242221 0%, #181716 100%)",
    primaryButtonBg: "#C0A074",
    primaryButtonColor: "#1A1714",
    secondaryButtonBg: "#3A332D",
    secondaryButtonColor: "#F5E6C8",
    cupBackground: "rgba(50,45,40,0.85)",
    confettiColors: ["#C0A074", "#F5E6C8", "#7A5C3E", "#4B4035"],
  },
  stardewValley: {
    label: "Stardew Valley 🌾",
    focusBgStart: "linear-gradient(180deg, #FDF8ED 0%, #F5EBD4 35%, #E8D4A8 70%, #D4B87A 100%)",
    focusBgMid: "linear-gradient(180deg, #F5E8C8 0%, #E8D090 35%, #D4B060 70%, #B8954A 100%)",
    focusBgEnd: "linear-gradient(180deg, #E8D8B0 0%, #C8A060 35%, #A07840 70%, #8A6838 100%)",
    breakBg: "linear-gradient(180deg, #E8F4DC 0%, #C8E0B0 40%, #A8D090 70%, #88B870 100%)",
    primaryButtonBg: "#5A8A3E",
    primaryButtonColor: "#FFFFFF",
    secondaryButtonBg: "#E8D8A8",
    secondaryButtonColor: "#3A4A30",
    cupBackground: "rgba(253,248,235,0.75)",
    starColor: "#E9C46A",
    woodFrame: "#8B7355",
    woodHighlight: "#C4A574",
    woodShadow: "#5C4A38",
  },
} as const;

type ThemeKey = keyof typeof THEMES;

export default function Home() {
  const TOTAL_TIME = 1500; // 25 minutes
  const BUBBLE_TRIGGER = 900; // 15 minutes passed

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break" | "complete">("focus");
  const [selectedDrink, setSelectedDrink] =
    useState<"Latte" | "Lemonade" | "Strawberry Matcha">("Latte");
  const [selectedAnimal, setSelectedAnimal] =
    useState<"Cat" | "Dog" | "Rabbit">("Cat");
  const [themeKey, setThemeKey] = useState<ThemeKey>("pastelCafe");

  const [soundOn, setSoundOn] = useState(false);
  const [rainVolume, setRainVolume] = useState(0.5);
  const [lofiVolume, setLofiVolume] = useState(0.5);

  const [smallTaskIce, setSmallTaskIce] = useState(0);
  const [mediumTaskIce, setMediumTaskIce] = useState(0);

  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const lofiAudioRef = useRef<HTMLAudioElement | null>(null);
  const windAudioRef = useRef<HTMLAudioElement | null>(null);

  const theme = THEMES[themeKey];
  const isStardew = themeKey === "stardewValley";

  const motivationalMessages = [
    "You’re literally building your dream life.",
    "That degree isn’t gonna earn itself.",
    "Stay delulu. It works.",
  ];

  const [messageIndex, setMessageIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [celebrationKey, setCelebrationKey] = useState(0);

  const drinkColors: Record<string, string> = {
    Latte: "#C69C6D",
    Lemonade: "#F9E076",
    "Strawberry Matcha": "#F8A5C2",
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);

          if (mode === "focus") {
            setMode("complete");
            return 0;
          }

          if (mode === "break") {
            setMode("focus");
            return TOTAL_TIME;
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  // Load theme and ambience from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedTheme = window.localStorage.getItem("pomodoroTheme");
      if (storedTheme && storedTheme in THEMES) {
        setThemeKey(storedTheme as ThemeKey);
      }

      const storedSound = window.localStorage.getItem("pomodoroSound");
      if (storedSound) {
        const parsed = JSON.parse(storedSound);
        if (typeof parsed.soundOn === "boolean") setSoundOn(parsed.soundOn);
        if (typeof parsed.rainVolume === "number")
          setRainVolume(Math.min(1, Math.max(0, parsed.rainVolume)));
        if (typeof parsed.lofiVolume === "number")
          setLofiVolume(Math.min(1, Math.max(0, parsed.lofiVolume)));
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Persist theme and ambience
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("pomodoroTheme", themeKey);
  }, [themeKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "pomodoroSound",
      JSON.stringify({ soundOn, rainVolume, lofiVolume })
    );
  }, [soundOn, rainVolume, lofiVolume]);

  // Rotate motivational messages
  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 8000);
    return () => clearInterval(id);
  }, [motivationalMessages.length]);

  // Trigger single-burst celebration on completion
  useEffect(() => {
    if (mode === "complete") setCelebrationKey((k) => k + 1);
  }, [mode]);

  // Timer tick micro-interaction (only when running)
  const [timerTick, setTimerTick] = useState(false);
  useEffect(() => {
    if (!isRunning) return;
    setTimerTick(true);
    const id = setTimeout(() => setTimerTick(false), 160);
    return () => clearTimeout(id);
  }, [timeLeft, isRunning]);

  // Layered audio: rain and lofi separately adjustable; stops when paused
  useEffect(() => {
    const lofi = lofiAudioRef.current;
    const rain = rainAudioRef.current;
    const wind = windAudioRef.current;

    const lofiVol = soundOn && mode === "focus" && isRunning ? lofiVolume : 0;
    const rainVol = soundOn && isRunning ? rainVolume : 0;
    const windVol = soundOn && mode === "break" && isRunning ? rainVolume * 0.2 : 0;

    if (lofi) {
      lofi.volume = lofiVol;
      if (lofiVol > 0) void lofi.play().catch(() => {});
      else lofi.pause();
    }
    if (rain) {
      rain.volume = rainVol;
      if (rainVol > 0) void rain.play().catch(() => {});
      else rain.pause();
    }
    if (wind) {
      wind.volume = windVol;
      if (windVol > 0) void wind.play().catch(() => {});
      else wind.pause();
    }
  }, [soundOn, rainVolume, lofiVolume, mode, isRunning]);

  const progress = (TOTAL_TIME - timeLeft) / TOTAL_TIME;
  const showBubbles = TOTAL_TIME - timeLeft >= BUBBLE_TRIGGER;
  const lastFiveMinutes = timeLeft <= 300 && mode === "focus" && isRunning;

  const getBackground = () => {
    if (mode === "break") {
      if (themeKey === "darkAcademia") {
        return "linear-gradient(180deg, #242221 0%, #181716 100%)";
      }
      if (themeKey === "pastelCafe") {
        return "linear-gradient(180deg, #FFF9F2 0%, #FFF1D6 100%)";
      }
      if (themeKey === "softGirlPink") {
        return "linear-gradient(180deg, #FFE5F1 0%, #FFD1E8 50%, #FFE0F0 100%)";
      }
      return "linear-gradient(180deg, #B8D4E8 0%, #D8E8E0 25%, #E8DCC8 50%, #D0E0C0 75%, #A8C898 100%)";
    }
    if (themeKey === "stardewValley") {
      const t = THEMES.stardewValley;
      if (progress < 0.33) return t.focusBgStart;
      if (progress < 0.66) return t.focusBgMid;
      return t.focusBgEnd;
    }
    const t = theme as { focusBg?: string; breakBg?: string };
    return t.focusBg ?? "";
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const getBubbleColor = () => {
    if (selectedDrink === "Latte") return "rgba(120, 80, 40, 0.5)";
    if (selectedDrink === "Lemonade") return "rgba(255, 240, 120, 0.6)";
    return "rgba(248, 165, 194, 0.6)";
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(isStardew ? styles.stardewContainer : {}),
        background: getBackground(),
        transition: "background 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      <div
        style={{
          ...styles.grainOverlay,
          opacity: isStardew ? 0.38 : 0.08,
        }}
        aria-hidden
      />
      {soundOn && rainVolume > 0 && (
        <div
          style={{
            ...styles.rainBlurOverlay,
            opacity: Math.min(0.12, rainVolume * 0.2),
          }}
          aria-hidden
        />
      )}
      {isStardew && (mode === "break" || mode === "focus") && (
        <div style={styles.stardewParallaxOverlay} className="stardewParallaxGradient" aria-hidden />
      )}
      {(mode === "break" || mode === "focus") && (
        <div style={styles.particleLayer} aria-hidden>
          {Array.from({
            length: isStardew
              ? (mode === "break" ? 5 : 4)
              : mode === "break"
              ? 16
              : 8,
          }).map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.ambientParticle,
                ...(isStardew ? styles.stardewAmbientParticle : {}),
                left: `${(i * (isStardew ? 22 : 11)) % 100}%`,
                animationDelay: `${(i * (isStardew ? 2.4 : 1.2)) % 8}s`,
                animationDuration: `${isStardew ? 18 + (i % 4) : 12 + (i % 5)}s`,
                opacity: isStardew
                  ? mode === "break"
                    ? 0.35
                    : 0.12
                  : mode === "break"
                  ? 0.6
                  : 0.25,
              }}
            />
          ))}
        </div>
      )}
      {showIntro && (
        <div style={styles.introOverlay} className="introOverlay">
          <div style={{ ...styles.introCard, ...(isStardew ? styles.stardewIntroCard : {}) }} className="introCard">
            <h2 style={{ ...styles.introTitle, ...(isStardew ? styles.stardewIntroTitle : {}) }}>Welcome to Café Focus☕</h2>
            <p style={{ ...styles.introSubtitle, ...(isStardew ? styles.stardewIntroSubtitle : {}) }}>
              What are we brewing today?
            </p>
            <div style={styles.introDrinksRow}>
              {(["Latte", "Lemonade", "Strawberry Matcha"] as const).map(
                (drink) => (
                  <button
                    key={drink}
                    className={isStardew ? "appButton stardewButton" : "appButton"}
                    onClick={() => {
                      setSelectedDrink(drink);
                      setShowIntro(false);
                    }}
                    style={{
                      ...styles.introDrinkCard,
                      ...(isStardew ? styles.stardewIntroDrinkCard : {}),
                      ...(selectedDrink === drink
                        ? isStardew ? styles.stardewIntroDrinkSelected : styles.introDrinkSelected
                        : {}),
                    }}
                  >
                    <span style={styles.introDrinkEmoji}>
                      {drink === "Latte"
                        ? "☕"
                        : drink === "Lemonade"
                        ? "🍋"
                        : "🍓"}
                    </span>
                    <span>{drink}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ ...styles.topRow, ...(isStardew ? styles.stardewTopRow : {}) }}>
        <div style={styles.headerCenter}>
          <div style={styles.brandBlock}>
            <h1
              style={{
                ...styles.title,
                ...(isStardew ? styles.stardewTitle : {}),
                color:
                  themeKey === "darkAcademia"
                    ? "#FFFFFF"
                    : themeKey === "stardewValley"
                    ? "#3A3528"
                    : "#222222",
              }}
            >
              {mode === "break" ? "Break Time 🌿" : "Café Focus ☕"}
            </h1>
          </div>
        </div>

        <div style={styles.themeSwitcher}>
          <label style={{ ...styles.themeLabel, ...(isStardew ? styles.stardewThemeLabel : {}) }}>Theme</label>
          <select
            value={themeKey}
            onChange={(e) =>
              setThemeKey(e.target.value as ThemeKey)
            }
            className={!isStardew ? "themeSelectHover" : undefined}
            style={{ ...styles.themeSelect, ...(isStardew ? styles.stardewThemeSelect : {}) }}
          >
            {Object.entries(THEMES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mode === "break" ? (
        <>
        <div style={{ ...styles.animalButtons, ...(isStardew ? styles.stardewAnimalButtons : {}) }}>
          {[
            { key: "Cat" as const, emoji: "🐱" },
            { key: "Dog" as const, emoji: "🐶" },
            { key: "Rabbit" as const, emoji: "🐰" },
          ].map((animal) => (
            <button
              key={animal.key}
              onClick={() => setSelectedAnimal(animal.key)}
              className={`appButton animalButton ${isStardew ? "stardewButton" : ""}`}
              style={{
                ...styles.button,
                ...(isStardew ? styles.stardewButton : {}),
                ...(selectedAnimal === animal.key
                  ? isStardew ? styles.stardewButtonSelected : styles.buttonSelected
                  : {}),
              }}
            >
              {animal.emoji} {animal.key}
            </button>
          ))}
        </div>
        <div style={{ ...styles.breakSceneContainer, ...(isStardew ? styles.stardewBreakSceneContainer : {}) }} className="breakSceneFloat">
          <div style={styles.gardenSky}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.cloud,
                  left: `${12 + i * 28}%`,
                  top: `${14 + (i % 2) * 8}%`,
                  animationDelay: `${i * 2}s`,
                }}
              />
            ))}
          </div>
          <div style={styles.gardenGrass} />
          <div style={styles.gardenSparklesLayer}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.gardenSparkle,
                  left: `${10 + (i * 7) % 80}%`,
                  animationDelay: `${(i * 0.4) % 4}s`,
                }}
              />
            ))}
          </div>
          <div style={styles.animalCenterLayer} className="animalCenterFadeIn">
            <div
              className={`selectedAnimalDisplay animalChilling${selectedAnimal}`}
              style={styles.selectedAnimalDisplay}
            >
              {selectedAnimal === "Cat" && (
                <img src="/animals/marie.png" alt="Marie from The Aristocats" style={styles.animalCartoon} />
              )}
              {selectedAnimal === "Dog" && (
                <img src="/animals/pluto.png" alt="Pluto" style={styles.animalCartoon} />
              )}
              {selectedAnimal === "Rabbit" && (
                <img src="/animals/thumper.png" alt="Thumper from Bambi" style={styles.animalCartoon} />
              )}
            </div>
          </div>
        </div>
        </>
      ) : (
        <>
        <div style={{ ...styles.drinkButtons, ...(isStardew ? styles.stardewDrinkButtons : {}) }}>
          {(["Latte", "Lemonade", "Strawberry Matcha"] as const).map(
            (drink) => (
              <button
                key={drink}
                className={`appButton drinkButton ${isStardew ? "stardewButton" : ""}`}
                onClick={() => setSelectedDrink(drink)}
                style={{
                  ...styles.button,
                  ...(isStardew ? styles.stardewButton : {}),
                  ...(themeKey === "darkAcademia"
                    ? (selectedDrink === drink
                      ? { background: "#FFFFFF", color: "#000000" }
                      : { background: "#000000", color: "#FFFFFF" })
                    : (selectedDrink === drink
                      ? (isStardew ? styles.stardewButtonSelected : styles.buttonSelected)
                      : {})),
                }}
              >
                {drink}
              </button>
            )
          )}
        </div>
        {mode === "focus" && (
          <div style={styles.taskIceRow}>
            <span style={{ ...styles.taskIceLabel, ...(themeKey === "darkAcademia" ? { color: "#F5E6C8" } : {}) }}>
              Add ice cubes when you finish a task:
            </span>
            <div style={styles.taskIceButtons}>
              <button
                type="button"
                onClick={() => setSmallTaskIce((n) => Math.min(n + 1, 6))}
                className={isStardew ? "appButton stardewButton" : "appButton"}
                style={{
                  ...styles.taskIceButton,
                  ...(themeKey === "darkAcademia" ? styles.taskIceButtonDark : {}),
                }}
              >
                🧊 Small task
              </button>
              <button
                type="button"
                onClick={() => setMediumTaskIce((n) => Math.min(n + 1, 4))}
                className={isStardew ? "appButton stardewButton" : "appButton"}
                style={{
                  ...styles.taskIceButton,
                  ...(themeKey === "darkAcademia" ? styles.taskIceButtonDark : {}),
                }}
              >
                ⭐ Medium task
              </button>
            </div>
          </div>
        )}
        <div
          style={{
            ...styles.cup,
            ...(isStardew ? styles.stardewCup : {}),
            transform: isRunning ? "scale(1.02)" : "scale(1)",
            background: theme.cupBackground,
            animation:
              mode === "complete"
                ? "bounceCup 0.6s ease-in-out infinite"
                : isRunning
                ? "cupRunningPulse 1.8s ease-in-out infinite"
                : "gentleFloat 5s ease-in-out infinite",
          }}
        >
        <div
          style={{
            ...styles.liquid,
            height: `${progress * 100}%`,
              transform: "rotate(0deg)",
              ...(selectedDrink === "Strawberry Matcha"
                ? {
                    backgroundImage:
                      "linear-gradient(to top, #F8A5C2 0%, #F8A5C2 50%, #7FB77E 50%, #7FB77E 100%)",
                  }
                : {
                    backgroundImage: `linear-gradient(to top, ${
                      drinkColors[selectedDrink]
                    } 0%, ${
                      selectedDrink === "Latte"
                        ? "#CCAE88"
                        : selectedDrink === "Lemonade"
                        ? "#F4D35E"
                        : "#F8A5C2"
                    } 100%)`,
                  }),
            }}
          >
            <div style={styles.liquidWave} />
            <div style={styles.liquidReflection} aria-hidden />
            {/* Surface foam interface — physics-level integration */}
            <div style={styles.surfaceFoamInterface} aria-hidden />
          </div>

          {isRunning && selectedDrink === "Latte" && mode === "focus" && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.steam,
                    left: `${40 + i * 10}%`,
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              ))}
            </>
          )}

          {isRunning && selectedDrink === "Lemonade" && mode === "focus" && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.iceCube,
                    left: `${30 + i * 15}%`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </>
          )}

          {isRunning &&
            selectedDrink === "Strawberry Matcha" &&
            mode === "focus" && (
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.sparkle,
                      left: `${20 + (i * 7) % 60}%`,
                      animationDelay: `${(i * 0.3) % 3}s`,
                    }}
                  />
                ))}
              </>
            )}

          {/* Earned task ice cubes — positioned inside liquid, drop animation on add */}
          {mode === "focus" &&
            Array.from({ length: smallTaskIce }).map((_, i) => {
              const liquidHeightPct = progress * 100;
              const maxBottom = Math.max(8, liquidHeightPct - 12);
              const minBottom = 6;
              const bottomPct = minBottom + (i * 11) % Math.max(10, maxBottom - minBottom);
              return (
                <div
                  key={`small-${i}`}
                  className="iceCubeDrop"
                  style={{
                    ...styles.iceCube,
                    left: `${18 + (i * 18) % 64}%`,
                    bottom: `${bottomPct}%`,
                    animationDelay: `${(i * 0.2) % 2}s`,
                  }}
                />
              );
            })}
          {mode === "focus" &&
            Array.from({ length: mediumTaskIce }).map((_, i) => {
              const liquidHeightPct = progress * 100;
              const maxBottom = Math.max(8, liquidHeightPct - 14);
              const minBottom = 6;
              const bottomPct = minBottom + (i * 12) % Math.max(10, maxBottom - minBottom);
              return (
                <div
                  key={`medium-${i}`}
                  className="iceCubeDrop"
                  style={{
                    ...styles.iceCubeStar,
                    left: `${24 + (i * 22) % 52}%`,
                    bottom: `${bottomPct}%`,
                    animationDelay: `${(i * 0.25) % 2}s`,
                  }}
                />
              );
            })}

          {/* Last 5 min drink toppers — realistic foam/light material rendering */}
          {lastFiveMinutes && selectedDrink === "Latte" && (
            <div style={styles.latteArtContainer} className="drinkTopperFadeIn drinkTopperCentered drinkTopperBreathing">
              <div style={styles.latteFoamSurface} aria-hidden>
                <div style={styles.latteFoamReflectionDot} aria-hidden />
      </div>
            </div>
          )}
          {lastFiveMinutes && selectedDrink === "Lemonade" && (
            <div style={styles.lemonadeTopperContainer} className="drinkTopperFadeIn drinkTopperBreathing">
              <div style={styles.citrusReflectionZone} aria-hidden />
              <div style={styles.citrusSpecularDot} aria-hidden />
            </div>
          )}
          {lastFiveMinutes && selectedDrink === "Strawberry Matcha" && (
            <div style={styles.strawberryTopperContainer} className="drinkTopperFadeIn drinkTopperBreathing">
              <div style={{ ...styles.berryShadowBlob, left: "24%", top: "20%", transform: "rotate(-14deg)" }} aria-hidden />
              <div style={{ ...styles.berryShadowBlob, left: "50%", top: "18%", transform: "rotate(12deg)" }} aria-hidden />
              <div style={{ ...styles.berryShadowBlob, left: "72%", top: "22%", transform: "rotate(-6deg)" }} aria-hidden />
            </div>
          )}

          {/* BUBBLES */}
          {showBubbles &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.bubble,
                  left: `${Math.random() * 80 + 10}%`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  background: getBubbleColor(),
                }}
              />
            ))}
        </div>
        </>
      )}

      <div
        className={`timerHero ${timerTick ? "timerTick" : ""} ${isRunning ? "timerRunning" : ""}`}
        style={{
          ...styles.timerHero,
          ...(themeKey === "darkAcademia"
            ? { background: "rgba(0,0,0,0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)" }
            : {}),
        }}
      >
        <p
          style={{
            ...styles.timer,
            ...(isStardew ? styles.stardewTimer : {}),
            color:
              themeKey === "darkAcademia"
                ? "#FFFFFF"
                : themeKey === "stardewValley"
                ? "#3A3528"
                : "#222222",
          }}
        >
          {formatTime()}
        </p>
      </div>

      <p
        style={{
          ...styles.motivationText,
          ...(isStardew ? styles.stardewMotivationText : {}),
          color:
            themeKey === "darkAcademia"
              ? "#FFFFFF"
              : themeKey === "stardewValley"
              ? "#4A4538"
              : "#333333",
        }}
      >
        {motivationalMessages[messageIndex]}
      </p>

      <div style={styles.controlRow}>
        {mode === "break" && (
          <button
            onClick={() => {
              setMode("focus");
              setTimeLeft(TOTAL_TIME);
              setIsRunning(false);
            }}
            className={isStardew ? "appButton stardewButton stardewPrimary" : "appButton"}
            style={{
              ...styles.primaryButton,
              ...(isStardew ? styles.stardewPrimaryButton : {}),
              backgroundColor: theme.primaryButtonBg,
              color: theme.primaryButtonColor,
            }}
          >
            Back to Work
          </button>
        )}
        <button
          onClick={() => setIsRunning((prev) => !prev)}
          className={isStardew ? "appButton stardewButton stardewPrimary" : "appButton"}
          style={{
            ...styles.primaryButton,
            ...(isStardew ? styles.stardewPrimaryButton : {}),
            backgroundColor: theme.primaryButtonBg,
            color: theme.primaryButtonColor,
          }}
        >
          {isRunning
            ? "Pause"
            : (mode === "focus" && timeLeft === TOTAL_TIME) ||
              (mode === "break" && timeLeft === 300)
            ? "Start"
            : "Resume"}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(mode === "break" ? 300 : TOTAL_TIME);
          }}
          className={isStardew ? "appButton stardewButton stardewSecondary" : "appButton"}
          style={{
            ...styles.secondaryButton,
            ...(isStardew ? styles.stardewSecondaryButton : {}),
            backgroundColor: theme.secondaryButtonBg,
            color: theme.secondaryButtonColor,
          }}
        >
          Reset
        </button>
      </div>

      <div
        className="ambiencePanelHover"
        style={{ ...styles.ambiencePanel, ...(isStardew ? styles.stardewAmbiencePanel : {}) }}
      >
        <div style={styles.ambienceHeaderRow}>
          <span style={{ ...styles.ambienceTitle, ...(isStardew ? styles.stardewAmbienceTitle : {}) }}>Sound</span>
          <button
            role="switch"
            aria-checked={soundOn}
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              if (next) {
                const lofi = lofiAudioRef.current;
                const rain = rainAudioRef.current;
                const wind = windAudioRef.current;
                if (lofi) {
                  lofi.volume = mode === "focus" ? lofiVolume : 0;
                  void lofi.play().catch(() => {});
                }
                if (rain) {
                  rain.volume = rainVolume;
                  void rain.play().catch(() => {});
                }
                if (wind) {
                  wind.volume = mode === "break" ? rainVolume * 0.2 : 0;
                  void wind.play().catch(() => {});
                }
              }
            }}
            className={`soundToggle ${soundOn ? "soundToggleOn" : ""} ${isStardew ? "soundToggleStardew" : ""}`}
            style={{
              ...styles.soundToggle,
              ...(soundOn
                ? { backgroundColor: theme.primaryButtonBg ?? "#5A8A3E" }
                : isStardew
                ? { backgroundColor: "#C8A878" }
                : { backgroundColor: "rgba(0,0,0,0.12)" }),
            }}
          >
            <span
              className="soundToggleThumb"
              style={{
                ...styles.soundToggleThumb,
                transform: soundOn ? "translateX(18px)" : "translateX(2px)",
              }}
            />
          </button>
        </div>
        <div style={styles.ambienceSliders}>
          <div style={{ ...styles.ambienceRow, ...(mode === "break" ? { marginBottom: 0 } : {}) }}>
            <span style={{ ...styles.volumeLabel, ...(isStardew ? styles.stardewVolumeLabel : {}) }}>🌧 Rain</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={rainVolume}
              onChange={(e) => setRainVolume(Number(e.target.value))}
              className={isStardew ? "stardewSlider" : undefined}
              style={{ ...styles.volumeSlider, ...(isStardew ? styles.stardewVolumeSlider : {}) }}
              aria-label="Rain volume"
            />
          </div>
          {mode !== "break" && (
            <div style={{ ...styles.ambienceRow, marginBottom: 0 }}>
              <span style={{ ...styles.volumeLabel, ...(isStardew ? styles.stardewVolumeLabel : {}) }}>🎧 Lofi</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={lofiVolume}
                onChange={(e) => setLofiVolume(Number(e.target.value))}
                className={isStardew ? "stardewSlider" : undefined}
                style={{ ...styles.volumeSlider, ...(isStardew ? styles.stardewVolumeSlider : {}) }}
                aria-label="Lofi volume"
              />
            </div>
          )}
        </div>
      </div>

      {mode === "complete" && (
        <>
          <div key={celebrationKey} style={styles.screenFlashOverlay} className="celebrationFlash" aria-hidden />
          <div key={celebrationKey} style={styles.starBurstContainer}>
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.starBurstRay,
                  transform: `rotate(${i * (360 / 28)}deg)`,
                }}
              >
                <div
                  style={{
                    ...styles.starSparkle,
                    animation: "starBurst 1.2s ease-out 1 forwards",
                    animationDelay: `${i * 0.02}s`,
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ ...styles.modalOverlay, ...(isStardew ? styles.stardewModalOverlay : {}) }} className="modalOverlay">
            <div style={{ ...styles.modalContent, ...(isStardew ? styles.stardewModalContent : {}) }} className="modalContent">
              <h2 style={{ ...styles.modalTitle, ...(isStardew ? styles.stardewModalTitle : {}) }}>
                🍋 You finished a focus session!
              </h2>
              <p style={{ ...styles.modalSubtitle, ...(isStardew ? styles.stardewModalSubtitle : {}) }}>
                Ready for a 5-minute break?
              </p>
              <div style={styles.modalButtonRow}>
                <button
                  onClick={() => {
                    setMode("break");
                    setTimeLeft(300);
                    setIsRunning(true);
                  }}
                  className={isStardew ? "appButton stardewButton stardewPrimary" : "appButton"}
                  style={{
                    ...styles.primaryButton,
                    ...(isStardew ? styles.stardewPrimaryButton : {}),
                    backgroundColor: theme.primaryButtonBg,
                    color: theme.primaryButtonColor,
                  }}
                >
                  Start Break
                </button>
                <button
                  onClick={() => {
                    setMode("focus");
                    setTimeLeft(TOTAL_TIME);
                    setIsRunning(false);
                  }}
                  className={isStardew ? "appButton stardewButton stardewSecondary" : "appButton"}
                  style={{
                    ...styles.secondaryButton,
                    ...(isStardew ? styles.stardewSecondaryButton : {}),
                    backgroundColor: theme.secondaryButtonBg,
                    color: theme.secondaryButtonColor,
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bubble Animation Keyframes */}
      <style>
        {`
        @keyframes floatUp {
          0% {
            transform: translateY(0);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-200px);
            opacity: 0;
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes bounceCup {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes steamUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-28px) scale(1.1);
            opacity: 0;
          }
        }

        @keyframes iceBob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes iceDrop {
          0% {
            transform: translateY(-70px);
            opacity: 0.9;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .iceCubeDrop {
          animation: iceDrop 0.55s ease-out forwards, iceBob 3s ease-in-out 0.55s infinite !important;
        }

        @keyframes sparkleTwinkle {
          0%,
          100% {
            opacity: 0;
            transform: translateY(0) scale(0.8);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-6px) scale(1);
          }
        }

        @keyframes cloudDrift {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(18px);
          }
        }

        @keyframes grassWave {
          0%,
          100% {
            transform: skewX(0deg);
          }
          50% {
            transform: skewX(-1.2deg);
          }
        }

        @keyframes breathing {
          0%,
          100% {
            transform: scale(0.96);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes motivationFade {
          0%,
          100% {
            opacity: 0;
          }
          10%,
          90% {
            opacity: 1;
          }
        }

        @keyframes screenFlash {
          0% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes cupRunningPulse {
          0%,
          100% {
            box-shadow: 0 15px 40px rgba(0,0,0,0.10);
          }
          50% {
            box-shadow: 0 20px 55px rgba(0,0,0,0.18);
          }
        }

        .introOverlay {
          animation: overlayFadeIn 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }

        .introCard {
          animation: cardScaleIn 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) 0.08s both;
        }

        .modalOverlay {
          animation: overlayFadeIn 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }

        .modalContent {
          animation: cardScaleIn 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) 0.06s both;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cardScaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .appButton {
          transition: transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1),
            box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1),
            background-color 0.35s ease;
        }

        .appButton:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 24px rgba(0,0,0,0.1);
        }

        .appButton:active {
          transition-duration: 0.1s;
          transform: translateY(0) scale(0.98);
        }

        .stardewButton {
          border: 2px solid rgba(0,0,0,0.15) !important;
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.35), 0 3px 0 rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1) !important;
          transition: transform 0.1s ease, box-shadow 0.1s ease !important;
        }

        .stardewButton:hover {
          transform: translateY(-1px) scale(1.02) !important;
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.4), 0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.12) !important;
        }

        .stardewButton:active {
          transform: translateY(1px) scale(0.98) !important;
          box-shadow: inset 0 -1px 0 rgba(0,0,0,0.2), 0 1px 0 rgba(0,0,0,0.1) !important;
        }

        .stardewPrimary {
          border-color: rgba(0,0,0,0.2) !important;
        }

        .stardewSecondary {
          border-color: rgba(0,0,0,0.12) !important;
        }

        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .breakSceneFloat {
          animation: gentleFloat 6s ease-in-out infinite;
        }

        .animalCenterFadeIn {
          animation: animalFadeIn 0.5s ease-out forwards;
        }

        @keyframes animalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes citrusFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.7; }
          50% { transform: translateY(-2px) translateX(1px); opacity: 1; }
        }

        .stardewParallaxGradient {
          animation: stardewParallaxShift 16s ease-in-out infinite;
        }

        @keyframes stardewParallaxShift {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        @keyframes fireflyFloat {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          6% { opacity: 0.4; }
          50% { transform: translateY(-45vh) translateX(4px); opacity: 0.55; }
          94% { opacity: 0.25; }
          100% {
            transform: translateY(-95vh) translateX(-3px);
            opacity: 0;
          }
        }

        @keyframes starBurst {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          15% { opacity: 0.95; transform: translateY(-4px) scale(0.4); }
          50% { opacity: 0.8; transform: translateY(-28px) scale(0.85); }
          100% {
            transform: translateY(-52px) scale(1);
            opacity: 0;
          }
        }

        .celebrationFlash {
          animation: celebrationFlash 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }

        @keyframes celebrationFlash {
          0% { opacity: 0; }
          15% { opacity: 0.4; }
          100% { opacity: 0; }
        }

        .timerHero {
          transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .timerRunning {
          animation: timerRunningPulse 2.5s ease-in-out infinite;
        }

        @keyframes timerRunningPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.008); }
        }

        .timerTick {

          animation: timerPulse 0.16s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes timerPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.018); }
          100% { transform: scale(1); }
        }

        .ambiencePanelHover:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
        }

        .themeSelectHover:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }

        .drinkButton {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.2s ease, background-color 0.2s ease;
        }

        .drinkButton:hover {
          transform: translateY(-2px) scale(1.02);
        }

        .animalButton {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.2s ease, background-color 0.2s ease;
        }

        .animalButton:hover {
          transform: translateY(-2px) scale(1.02);
        }

        .animalCardButton:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
        }

        .animalCardButton.animalCardButton:active {
          transform: translateY(-1px);
        }

        .animalCardButton.stardewAnimalCard:hover {
          transform: translateY(-3px);
          box-shadow: inset 0 2px 0 rgba(255,255,255,0.6), 0 5px 0 rgba(92,74,56,0.3), 0 12px 32px rgba(0,0,0,0.14);
        }

        .animalCardCat {
          animation: animalCatBreathing 6s ease-in-out infinite;
        }

        .animalCardDog {
          animation: animalDogWag 5s ease-in-out infinite;
        }

        .animalCardRabbit {
          animation: animalRabbitTwitch 5.5s ease-in-out infinite;
        }

        @keyframes animalCatBreathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes animalDogWag {
          0%, 100% { transform: rotate(-0.8deg); }
          50% { transform: rotate(0.8deg); }
        }

        @keyframes animalRabbitTwitch {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.015); }
          50% { transform: scale(1); }
          75% { transform: scale(1.01); }
        }

        .animalChillingCat {
          animation: catChilling 6s ease-in-out infinite;
        }

        .animalChillingDog {
          animation: dogChilling 5s ease-in-out infinite;
        }

        .animalChillingRabbit {
          animation: rabbitChilling 5.5s ease-in-out infinite;
        }

        @keyframes catChilling {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes dogChilling {
          0%, 100% { transform: scale(1) rotate(-1deg); }
          50% { transform: scale(1.05) rotate(1deg); }
        }

        @keyframes rabbitChilling {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.06) translateY(-2px); }
        }

        .mascotBubbleHover:hover {
          box-shadow: 0 14px 36px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
        }

        @keyframes mascotBreathing {
          0%, 100% { transform: scale(1) translateY(0) translateX(0); }
          33% { transform: scale(1.02) translateY(-2px) translateX(1px); }
          66% { transform: scale(1.015) translateY(-1px) translateX(-1px); }
        }

        .soundToggle {
          width: 44px;
          height: 26px;
          border-radius: 13px;
          border: none;
          cursor: pointer;
          padding: 0;
          position: relative;
          transition: background-color 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .soundToggleThumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .soundToggleStardew .soundToggleThumb {
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        }

        .drinkTopperFadeIn:not(.drinkTopperBreathing) {
          animation: drinkTopperFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes drinkTopperFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .drinkTopperCentered.drinkTopperFadeIn {
          animation-name: drinkTopperFadeInCentered;
        }

        @keyframes drinkTopperFadeInCentered {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .drinkTopperBreathing {
          animation: drinkTopperFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards,
            topperBreathing 6s ease-in-out 0.6s infinite;
        }

        .drinkTopperCentered.drinkTopperBreathing {
          animation: drinkTopperFadeInCentered 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards,
            topperBreathingCentered 6s ease-in-out 0.6s infinite;
        }

        @keyframes topperBreathing {
          0%, 100% { transform: translateY(0) scale(0.995); }
          50% { transform: translateY(0) scale(1.005); }
        }

        @keyframes topperBreathingCentered {
          0%, 100% { transform: translateX(-50%) translateY(0) scale(0.995); }
          50% { transform: translateX(-50%) translateY(0) scale(1.005); }
        }
      `}
      </style>

      {/* Ambient audio elements */}
      <audio
        ref={rainAudioRef}
        src="/sounds/rain.mp3"
        loop
        preload="auto"
        style={{ display: "none" }}
      />
      <audio
        ref={lofiAudioRef}
        src="/sounds/lofi.mp3"
        loop
        preload="auto"
        style={{ display: "none" }}
      />
      <audio
        ref={windAudioRef}
        src="/sounds/wind.mp3"
        loop
        preload="auto"
        style={{ display: "none" }}
      />

      <div style={styles.mascotContainer}>
        <div
          className="mascotBubbleHover"
          style={{
            ...styles.mascotBubble,
            ...(isStardew ? styles.stardewMascotBubble : {}),
            transition: "box-shadow 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
            animation:
              mode === "complete"
                ? "sparkleTwinkle 1.6s ease-in-out infinite"
                : "mascotBreathing 7s ease-in-out infinite",
          }}
        >
          <span style={styles.mascotEmoji}>
            {mode === "break"
              ? "😴"
              : mode === "complete"
              ? "⭐"
              : isRunning
              ? "🌱"
              : "🌿"}
          </span>
          <span style={styles.mascotText}>
            {mode === "break"
              ? "Rest well"
              : mode === "complete"
              ? "You did it!"
              : isRunning
              ? "You've got this"
              : "Ready?"}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "100px 24px 24px",
    boxSizing: "border-box",
    background:
      "linear-gradient(180deg, #FFF9F2 0%, #FFF1D6 100%)",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },

  stardewContainer: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
  },

  title: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    fontSize: "38px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    margin: 0,
    marginBottom: "20px",
    lineHeight: 1.2,
  },

  stardewTitle: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    textShadow: "0 1px 2px rgba(255,255,255,0.5)",
  },

  topRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "20px 24px",
    boxSizing: "border-box",
    marginBottom: "0",
    zIndex: 10,
  },

  headerCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  stardewTopRow: {
    padding: "20px 24px",
  },

  themeSwitcher: {
    position: "absolute",
    right: "24px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },

  themeLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    opacity: 0.7,
  },

  stardewThemeLabel: {
    color: "#4A4538",
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontWeight: 600,
  },

  themeSelect: {
    fontSize: "13px",
    padding: "8px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.95)",
    cursor: "pointer",
    fontWeight: 500,
    transition: "box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  },

  stardewThemeSelect: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    padding: "6px 14px",
    borderRadius: "8px",
    border: "2px solid #8B7355",
    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4), 0 2px 0 rgba(0,0,0,0.1)",
    background: "linear-gradient(180deg, #E8D8A8 0%, #C8A878 100%)",
    color: "#3A3528",
    fontWeight: 600,
  },

  drinkButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "28px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  stardewDrinkButtons: {
    gap: "12px",
  },

  animalButtons: {
    display: "flex",
    gap: "12px",
    marginBottom: "28px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  stardewAnimalButtons: {
    gap: "12px",
  },

  selectedAnimalDisplay: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },

  animalCartoon: {
    width: "100px",
    height: "auto",
    maxHeight: "120px",
    objectFit: "contain",
  },

  animalCard: {
    padding: "14px 18px",
    borderRadius: "20px",
    border: "none",
    background: "rgba(255,255,255,0.7)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },

  stardewAnimalCard: {
    background: "rgba(253,248,235,0.85)",
    borderRadius: "16px",
    border: "2px solid rgba(139,115,85,0.4)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.08)",
  },

  animalSelected: {
    transform: "translateY(-3px)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.95)",
  },

  stardewAnimalSelected: {
    transform: "translateY(-3px)",
    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.6), 0 6px 0 rgba(92,74,56,0.25), 0 10px 28px rgba(0,0,0,0.12)",
    background: "linear-gradient(180deg, #FDF8ED 0%, #E8D8A8 100%)",
    border: "2px solid #8B7355",
  },

  animalCardInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },

  animalEmoji: {
    fontSize: "26px",
    lineHeight: 1,
  },

  animalLabel: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#333333",
  },

  stardewAnimalLabel: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontWeight: 600,
    color: "#3A3528",
  },

  button: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  },

  stardewButton: {
    padding: "10px 20px",
    borderRadius: "10px",
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontWeight: 600,
    fontSize: "14px",
  },

  buttonSelected: {
    background: "#333",
    color: "white",
  },

  stardewButtonSelected: {
    background: "linear-gradient(180deg, #5A8A3E 0%, #4A7A2E 100%)",
    color: "#FFFFFF",
    border: "2px solid #3A5A28",
  },

  ambiencePanel: {
    width: "100%",
    maxWidth: "560px",
    padding: "22px 26px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.5)",
    marginTop: "28px",
    marginBottom: "24px",
    boxSizing: "border-box",
    transition: "box-shadow 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
  },

  stardewAmbiencePanel: {
    padding: "18px 22px",
    borderRadius: "14px",
    background: "linear-gradient(180deg, rgba(232,216,168,0.95) 0%, rgba(200,168,120,0.9) 100%)",
    border: "3px solid #8B7355",
    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4), 0 4px 0 rgba(92,74,56,0.3), 0 10px 28px rgba(0,0,0,0.14)",
  },

  stardewAmbienceTitle: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontWeight: 700,
    color: "#3A3528",
  },

  stardewMuteButton: {
    padding: "6px 14px",
    borderRadius: "8px",
    fontWeight: 600,
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
  },

  ambienceHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },

  ambienceTitle: {
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    opacity: 0.95,
  },

  soundToggle: {
    width: "44px",
    height: "26px",
    borderRadius: "13px",
  },

  soundToggleThumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#fff",
  },

  muteAllButton: {
    fontSize: "13px",
    padding: "8px 16px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  ambienceSliders: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  ambienceRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "12px",
  },

  ambienceToggle: {
    flexShrink: 0,
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid transparent",
    fontSize: "12px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    background: "rgba(255,255,255,0.6)",
  },

  volumeSlider: {
    flexGrow: 1,
  },

  stardewVolumeSlider: {
    flexGrow: 1,
  },

  stardewVolumeLabel: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontWeight: 600,
    color: "#4A4538",
  },

  cup: {
    width: "170px",
    height: "270px",
    borderRadius: "0 0 44px 44px",
    background: "rgba(255,255,255,0.4)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 24px 56px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5), inset 0 1px 0 rgba(255,255,255,0.6)",
    position: "relative",
    overflow: "hidden",
    marginBottom: "28px",
    transition: "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.5s ease",
  },

  stardewCup: {
    border: "3px solid #8B7355",
    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.5), 0 4px 0 rgba(92,74,56,0.3), 0 18px 40px rgba(0,0,0,0.12)",
  },

  liquid: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    transition: "height 0.95s linear",
  },

  bubble: {
    position: "absolute",
    bottom: "0",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    animationName: "floatUp",
    animationTimingFunction: "ease-in",
    animationIterationCount: "infinite",
  },

  latteArtContainer: {
    position: "absolute",
    top: "6%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    height: "22%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },

  latteFoamSurface: {
    width: "56px",
    height: "48px",
    background: "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(255,253,248,0.9) 0%, rgba(250,245,235,0.85) 25%, rgba(240,232,218,0.78) 50%, rgba(228,218,200,0.4) 75%, transparent 100%)",
    borderRadius: "50%",
    transform: "rotate(-5deg)",
    filter: "blur(0.5px)",
    boxShadow: "0 1px 12px rgba(139,115,85,0.04), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 3px rgba(139,115,85,0.03)",
  },

  lemonadeTopperContainer: {
    position: "absolute",
    top: "4%",
    left: 0,
    right: 0,
    height: "32%",
    pointerEvents: "none",
  },

  citrusReflectionZone: {
    position: "absolute",
    left: "50%",
    top: "20%",
    width: "52px",
    height: "44px",
    marginLeft: "-26px",
    borderRadius: "50%",
    background: "radial-gradient(ellipse 65% 60% at 50% 45%, rgba(255,252,220,0.75) 0%, rgba(255,245,180,0.55) 35%, rgba(250,230,140,0.35) 60%, rgba(245,210,100,0.12) 85%, transparent 100%)",
    filter: "blur(0.8px)",
    boxShadow: "0 2px 12px rgba(255,235,180,0.08)",
  },

  citrusSpecularDot: {
    position: "absolute",
    left: "48%",
    top: "26%",
    width: "4px",
    height: "4px",
    marginLeft: "-2px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)",
    boxShadow: "0 0 3px rgba(255,255,255,0.5)",
  },

  strawberryTopperContainer: {
    position: "absolute",
    top: "4%",
    left: 0,
    right: 0,
    height: "32%",
    pointerEvents: "none",
  },

  berryShadowBlob: {
    position: "absolute",
    width: "22px",
    height: "20px",
    borderRadius: "48% 52% 51% 49% / 52% 48% 52% 48%",
    background: "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(120,55,60,0.22) 0%, rgba(95,50,55,0.18) 40%, rgba(75,45,50,0.12) 70%, transparent 100%)",
    filter: "blur(1.2px)",
    boxShadow: "0 1px 6px rgba(80,40,45,0.06)",
  },

  timerHero: {
    padding: "24px 40px",
    marginBottom: "8px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
  },

  timer: {
    fontSize: "64px",
    fontWeight: 600,
    margin: 0,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.04em",
    transition: "color 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)",
  },

  stardewTimer: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontWeight: 700,
    textShadow: "0 2px 4px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.08)",
  },

  stardewMotivationText: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontWeight: 500,
  },

  controlRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  primaryButton: {
    padding: "12px 28px",
    borderRadius: "14px",
    border: "none",
    background: "#333",
    color: "white",
    fontSize: "15px",
    fontWeight: 600,
    margin: "6px",
    cursor: "pointer",
  },

  stardewPrimaryButton: {
    padding: "12px 28px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
  },

  secondaryButton: {
    padding: "12px 28px",
    borderRadius: "14px",
    border: "none",
    background: "white",
    fontSize: "15px",
    fontWeight: 500,
    margin: "6px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  },

  stardewSecondaryButton: {
    padding: "12px 28px",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
  },

  motivationText: {
    fontSize: "15px",
    opacity: 0.85,
    marginBottom: "20px",
    textAlign: "center",
    maxWidth: "340px",
    lineHeight: 1.5,
    animation: "motivationFade 8s ease-in-out infinite",
  },

  breakSceneContainer: {
    width: "280px",
    height: "280px",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.4)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 20px 56px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.4)",
    position: "relative",
    overflow: "hidden",
    marginBottom: "24px",
  },

  stardewBreakSceneContainer: {
    border: "3px solid #8B7355",
    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.4), 0 4px 0 rgba(92,74,56,0.3), 0 18px 40px rgba(0,0,0,0.12)",
  },

  gardenSky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "58%",
    zIndex: 1,
    background:
      "linear-gradient(180deg, rgba(184,212,232,0.95) 0%, rgba(232,220,200,0.4) 50%, rgba(208,224,192,0.2) 100%)",
  },

  cloud: {
    position: "absolute",
    top: "18%",
    width: "44px",
    height: "20px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.85)",
    boxShadow:
      "12px 0 0 rgba(255,255,255,0.8), 24px 2px 0 rgba(255,255,255,0.7)",
    animationName: "cloudDrift",
    animationDuration: "12s",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    animationTimingFunction: "ease-in-out",
  },

  gardenGrass: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "42%",
    zIndex: 2,
    background:
      "linear-gradient(180deg, rgba(180,200,165,0.95) 0%, rgba(150,180,140,0.98) 100%)",
    animationName: "grassWave",
    animationDuration: "6s",
    animationIterationCount: "infinite",
  },

  gardenSparklesLayer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 2,
  },

  animalCenterLayer: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
    zIndex: 3,
  },

  gardenSparkle: {
    position: "absolute",
    bottom: "18%",
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.9)",
    opacity: 0.18,
    animationName: "sparkleTwinkle",
    animationDuration: "4s",
    animationIterationCount: "infinite",
  },

  liquidWave: {
    position: "absolute",
    top: "-6px",
    left: "-10%",
    width: "120%",
    height: "16px",
    background:
      "radial-gradient(circle at 20% 120%, rgba(255,255,255,0.5) 0, transparent 55%)",
    opacity: 0.6,
  },

  liquidReflection: {
    position: "absolute",
    top: "8%",
    left: "12%",
    width: "30%",
    height: "20%",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 65%)",
    pointerEvents: "none",
  },

  surfaceFoamInterface: {
    position: "absolute",
    top: 0,
    left: "-2%",
    width: "104%",
    height: "14%",
    background: "linear-gradient(180deg, rgba(255,252,248,0.55) 0%, rgba(255,248,240,0.25) 50%, transparent 100%)",
    borderRadius: "0 0 50% 50%",
    pointerEvents: "none",
  },

  latteFoamReflectionDot: {
    position: "absolute",
    top: "22%",
    right: "18%",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 70%)",
    boxShadow: "0 0 2px rgba(255,255,255,0.6)",
  },

  steam: {
    position: "absolute",
    bottom: "82%",
    width: "10px",
    height: "26px",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0))",
    animationName: "steamUp",
    animationDuration: "2.2s",
    animationIterationCount: "infinite",
  },

  iceCube: {
    position: "absolute",
    bottom: "38%",
    width: "18px",
    height: "18px",
    borderRadius: "5px",
    background:
      "linear-gradient(135deg, #FFFFFF 0%, #F7F7F7 100%)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.6)",
    animationName: "iceBob",
    animationDuration: "3s",
    animationIterationCount: "infinite",
  },

  iceCubeStar: {
    position: "absolute",
    width: "26px",
    height: "26px",
    background: "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(230,245,255,0.85) 40%, rgba(200,230,255,0.7) 100%)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(255,255,255,0.6), inset -1px -1px 2px rgba(180,210,230,0.3)",
    clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    animationName: "iceBob",
    animationDuration: "3.2s",
    animationIterationCount: "infinite",
  },

  taskIceRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },

  taskIceLabel: {
    fontSize: "13px",
    opacity: 0.85,
    color: "#333",
  },

  taskIceButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  taskIceButton: {
    padding: "8px 14px",
    borderRadius: "12px",
    border: "none",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },

  taskIceButtonDark: {
    background: "rgba(255,255,255,0.15)",
    color: "#F5E6C8",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  },

  sparkle: {
    position: "absolute",
    bottom: "60%",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 0 8px rgba(255,255,255,0.8)",
    animationName: "sparkleTwinkle",
    animationDuration: "3s",
    animationIterationCount: "infinite",
  },

  introOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8,
    pointerEvents: "auto",
    backgroundColor: "rgba(0,0,0,0.1)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },

  introCard: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRadius: "24px",
    padding: "32px 34px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.6)",
    maxWidth: "400px",
    textAlign: "center",
    transition: "opacity 0.5s ease, transform 0.5s ease",
  },

  stardewIntroCard: {
    background: "linear-gradient(180deg, #FDF8ED 0%, #E8D8A8 50%, #D4B87A 100%)",
    borderRadius: "16px",
    padding: "28px 30px",
    border: "4px solid #8B7355",
    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.5), 0 6px 0 rgba(92,74,56,0.4), 0 20px 50px rgba(0,0,0,0.2)",
  },

  introTitle: {
    fontFamily: "var(--font-heading), 'Cormorant Garamond', Georgia, serif",
    fontSize: "26px",
    fontWeight: 600,
    marginBottom: "8px",
    letterSpacing: "0.02em",
  },

  stardewIntroTitle: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontSize: "24px",
    fontWeight: 700,
    color: "#3A3528",
  },

  introSubtitle: {
    fontSize: "14px",
    opacity: 0.8,
    marginBottom: "18px",
  },

  stardewIntroSubtitle: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    color: "#4A4538",
    fontWeight: 500,
  },

  introDrinksRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },

  introDrinkCard: {
    flex: 1,
    minWidth: 0,
    padding: "10px 6px",
    borderRadius: "18px",
    border: "1px solid rgba(0,0,0,0.04)",
    background: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },

  stardewIntroDrinkCard: {
    padding: "12px 8px",
    borderRadius: "10px",
    border: "2px solid #8B7355",
    background: "linear-gradient(180deg, #F5E8C8 0%, #E8D8A8 100%)",
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontWeight: 600,
    color: "#3A3528",
  },

  introDrinkSelected: {
    boxShadow: "0 0 0 2px rgba(0,0,0,0.14)",
  },

  stardewIntroDrinkSelected: {
    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.5), 0 0 0 2px #5A8A3E",
    background: "linear-gradient(180deg, #6A994E 0%, #5A8A3E 100%)",
    color: "#FFFFFF",
    borderColor: "#3A5A28",
  },

  introDrinkEmoji: {
    fontSize: "18px",
  },

  mascotContainer: {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    zIndex: 7,
  },

  mascotBubble: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 10px 28px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
    fontSize: "13px",
    backdropFilter: "blur(10px)",
  },

  stardewMascotBubble: {
    padding: "10px 14px",
    borderRadius: "12px",
    background: "linear-gradient(180deg, #F5E8C8 0%, #E8D8A8 100%)",
    border: "2px solid #8B7355",
    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.5), 0 3px 0 rgba(92,74,56,0.3), 0 8px 20px rgba(0,0,0,0.12)",
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontWeight: 600,
    color: "#3A3528",
  },

  mascotEmoji: {
    fontSize: "18px",
  },

  mascotText: {
    fontSize: "12px",
    opacity: 0.8,
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.15)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  stardewModalOverlay: {
    backgroundColor: "rgba(58,53,40,0.3)",
    backdropFilter: "blur(8px)",
  },

  modalContent: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "32px 36px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.6)",
    textAlign: "center",
    maxWidth: "360px",
  },

  stardewModalContent: {
    background: "linear-gradient(180deg, #FDF8ED 0%, #E8D8A8 50%, #D4B87A 100%)",
    borderRadius: "16px",
    padding: "28px 32px",
    border: "4px solid #8B7355",
    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.5), 0 6px 0 rgba(92,74,56,0.4), 0 20px 50px rgba(0,0,0,0.25)",
  },

  modalTitle: {
    fontFamily: "var(--font-heading), 'Cormorant Garamond', Georgia, serif",
    fontSize: "24px",
    fontWeight: 600,
    marginBottom: "10px",
    letterSpacing: "0.02em",
  },

  stardewModalTitle: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    fontSize: "22px",
    fontWeight: 700,
    color: "#3A3528",
  },

  modalSubtitle: {
    fontSize: "14px",
    marginBottom: "18px",
  },

  stardewModalSubtitle: {
    fontFamily: "var(--font-quicksand), 'Quicksand', sans-serif",
    color: "#4A4538",
    fontWeight: 500,
  },

  modalButtonRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "4px",
  },

  grainOverlay: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1,
    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,0,0,0.04) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(0,0,0,0.03) 0%, transparent 50%),
      repeating-conic-gradient(from 0deg at 50% 50%, rgba(0,0,0,0.02) 0deg 1deg, transparent 1deg 2deg)`,
    backgroundSize: "200% 200%, 200% 200%, 3px 3px",
  },

  rainBlurOverlay: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1.5,
    backdropFilter: "blur(1px)",
    WebkitBackdropFilter: "blur(1px)",
    background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(180,220,255,0.08) 0%, transparent 70%)",
    transition: "opacity 0.8s ease",
  },

  stardewParallaxOverlay: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1.2,
    background: "radial-gradient(ellipse 120% 80% at 30% 20%, rgba(255,248,230,0.07) 0%, transparent 50%), radial-gradient(ellipse 100% 120% at 70% 80%, rgba(200,220,180,0.05) 0%, transparent 50%)",
  },

  brandBlock: {
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    gap: "12px",
  },

  brandMark: {
    fontSize: "28px",
    opacity: 0.92,
    lineHeight: 1,
    height: "1em",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    flexShrink: 0,
  },

  particleLayer: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 2,
    overflow: "hidden",
  },

  ambientParticle: {
    position: "absolute",
    bottom: "-8px",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: "#E9E6A0",
    boxShadow: "0 0 8px 2px rgba(233,230,160,0.6)",
    animationName: "fireflyFloat",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },

  stardewAmbientParticle: {
    width: "3px",
    height: "3px",
    background: "rgba(233,200,120,0.8)",
    boxShadow: "0 0 6px 1px rgba(233,200,120,0.4)",
    animationTimingFunction: "ease-in-out",
  },

  screenFlashOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
    pointerEvents: "none",
    zIndex: 4,
  },

  starBurstContainer: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  starBurstRay: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "8px",
    height: "8px",
    marginLeft: "-4px",
    marginTop: "-4px",
  },

  starSparkle: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #F4E2B8 0%, #E9C46A 70%)",
    boxShadow: "0 0 10px 2px rgba(233,196,106,0.6)",
  },

  volumeLabel: {
    fontSize: "13px",
    fontWeight: 500,
    opacity: 0.9,
    minWidth: "64px",
  },
};
