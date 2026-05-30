/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, X, Plus, Minus, Minimize2, Maximize2, Volume2, VolumeX, Bell } from "lucide-react";

interface CookingTimerProps {
  initialMinutes: number;
  recipeTitle: string;
  onClose: () => void;
  soundEnabled?: boolean;
}

export default function CookingTimer({
  initialMinutes,
  recipeTitle,
  onClose,
  soundEnabled = true,
}: CookingTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(!soundEnabled);
  const [isCompleted, setIsCompleted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const beepIntervalRef = useRef<number | null>(null);

  // Sync initialMinutes change if it changes
  useEffect(() => {
    const secs = initialMinutes * 60;
    setTotalSeconds(secs);
    setSecondsRemaining(secs);
    setIsRunning(true);
    setIsCompleted(false);
    stopBeeping();
  }, [initialMinutes]);

  // Main countdown timer logic
  useEffect(() => {
    let timer: number;
    if (isRunning && secondsRemaining > 0) {
      timer = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            triggerCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining]);

  // Stop sound when component unmounts
  useEffect(() => {
    return () => {
      stopBeeping();
    };
  }, []);

  const triggerCompletion = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const playBeep = () => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 frequency
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      };

      // Play initially
      playBeep();
      
      // Repeat beep every 1.5 seconds until dismissed
      beepIntervalRef.current = window.setInterval(() => {
        playBeep();
      }, 1500);

    } catch (e) {
      console.warn("Failed to play timer completion audio:", e);
    }
  };

  const stopBeeping = () => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  const handleDismiss = () => {
    stopBeeping();
    onClose();
  };

  const formatTime = (totalSecs: number) => {
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Timer adjustment controls
  const adjustTime = (amount: number) => {
    if (isCompleted) return;
    setSecondsRemaining((prev) => {
      const newSecs = Math.max(10, prev + amount);
      // If we increase time past totalSeconds, update totalSeconds to adjust the circle progress
      if (newSecs > totalSeconds) {
        setTotalSeconds(newSecs);
      }
      return newSecs;
    });
  };

  const handleReset = () => {
    stopBeeping();
    setSecondsRemaining(totalSeconds);
    setIsRunning(false);
    setIsCompleted(false);
  };

  // Circular progress calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = isCompleted ? 1 : secondsRemaining / totalSeconds;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <AnimatePresence>
      {!isMinimized ? (
        // Expanded Panel View
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 w-80 bg-surface-container/95 border border-outline-variant/20 backdrop-blur-xl rounded-3xl shadow-2xl p-6 transition-colors duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-primary animate-pulse" : "bg-outline"}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline truncate max-w-[150px]">
                {recipeTitle}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                title={isMuted ? "Unmute Timer" : "Mute Timer"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                title="Minimize Timer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                title="Close Timer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Circle Timer */}
          <div className="relative flex flex-col items-center justify-center my-6">
            <svg className="w-36 h-36 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-surface-container-highest"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Foreground circle */}
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className={`${isCompleted ? "stroke-secondary animate-pulse" : "stroke-primary"}`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
            </svg>

            {/* Time / State overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isCompleted ? (
                <div className="text-center animate-bounce">
                  <Bell className="w-8 h-8 text-secondary mx-auto mb-1" />
                  <span className="text-sm font-black text-secondary uppercase tracking-wider">Done!</span>
                </div>
              ) : (
                <>
                  <span className="text-3xl font-black text-on-surface tracking-tighter">
                    {formatTime(secondsRemaining)}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-outline mt-0.5">
                    remaining
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Adjustment Controls */}
          {!isCompleted && (
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => adjustTime(-60)}
                className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                title="Subtract 1 minute"
              >
                -1m
              </button>
              <button
                onClick={() => adjustTime(-10)}
                className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                title="Subtract 10 seconds"
              >
                -10s
              </button>
              <div className="w-2" />
              <button
                onClick={() => adjustTime(10)}
                className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                title="Add 10 seconds"
              >
                +10s
              </button>
              <button
                onClick={() => adjustTime(60)}
                className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                title="Add 1 minute"
              >
                +1m
              </button>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex gap-3">
            {isCompleted ? (
              <button
                onClick={handleDismiss}
                className="flex-1 py-3 px-6 rounded-2xl bg-secondary text-white font-bold text-sm shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all active:scale-95 text-center uppercase tracking-wider"
              >
                Dismiss Timer
              </button>
            ) : (
              <>
                <button
                  onClick={handleReset}
                  className="px-4 py-3 rounded-2xl bg-surface-container-highest border border-outline-variant/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all active:scale-95"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 uppercase tracking-wider ${
                    isRunning
                      ? "bg-surface-container-highest text-primary hover:bg-surface-container-high"
                      : "bg-primary text-white shadow-primary/20 hover:bg-primary/95"
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" /> Resume
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      ) : (
        // Minimized Floating Circle View
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMinimized(false)}
          className={`fixed bottom-24 right-6 z-50 w-16 h-16 rounded-full bg-surface-container/95 border border-outline-variant/30 backdrop-blur-xl shadow-xl flex items-center justify-center cursor-pointer transition-colors duration-300 ${
            isCompleted ? "border-secondary animate-bounce bg-secondary/10" : ""
          }`}
          title="Restore Timer"
        >
          {/* Progress circle background */}
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="24"
              className="stroke-surface-container-highest"
              strokeWidth="3"
              fill="transparent"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="24"
              className={isCompleted ? "stroke-secondary" : "stroke-primary"}
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 24}
              animate={{ strokeDashoffset: (2 * Math.PI * 24) - progress * (2 * Math.PI * 24) }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </svg>

          {/* Central status / time */}
          <div className="z-10 flex flex-col items-center justify-center">
            {isCompleted ? (
              <Bell className="w-5 h-5 text-secondary animate-pulse" />
            ) : (
              <span className="text-[10px] font-black text-on-surface leading-none">
                {formatTime(secondsRemaining)}
              </span>
            )}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
