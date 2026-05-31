/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Share2, Play, Bookmark, Clock, Flame, Users, Send, X, Gauge, Star, Search, Flag, Pause, RotateCcw, RotateCw, ChevronRight, Volume2, VolumeX, Printer, Edit3, Trash2, User } from "lucide-react";
import { Recipe, Comment } from "./types";
import { useAuth } from "./contexts/AuthContext";
import { useLanguage } from "./contexts/LanguageContext";
import * as api from "./supabaseService";
import CookingTimer from "./components/CookingTimer";

interface RecipeDetailViewProps {
  recipe: Recipe;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onAddIngredient: (name: string, detail: string) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
  onDeleteRecipe?: (id: string) => void;
  onEditRecipe?: (recipe: Recipe) => void;
  addToast: (message: string, type?: any) => void;
  soundEnabled?: boolean;
  onViewProfile?: (authorId: string) => void;
}

const scaleQuantity = (detail: string, mult: number): string => {
  if (!detail || mult === 1) return detail;
  const regex = /(\d+\s+\d+\/\d+|\d+\/\d+|\d+\.\d+|\d+)/g;
  return detail.replace(regex, (match) => {
    let val = 0;
    if (match.includes('/')) {
      if (match.includes(' ')) {
        const parts = match.split(/\s+/);
        const whole = parseFloat(parts[0]);
        const fracParts = parts[1].split('/');
        const frac = parseFloat(fracParts[0]) / parseFloat(fracParts[1]);
        val = whole + frac;
      } else {
        const parts = match.split('/');
        val = parseFloat(parts[0]) / parseFloat(parts[1]);
      }
    } else {
      val = parseFloat(match);
    }
    if (isNaN(val)) return match;
    const scaled = val * mult;
    const whole = Math.floor(scaled);
    const remainder = scaled - whole;
    const epsilon = 0.01;
    if (Math.abs(remainder) < epsilon) {
      return whole.toString();
    }
    if (Math.abs(remainder - 0.5) < epsilon) {
      return whole === 0 ? "1/2" : `${whole} 1/2`;
    }
    if (Math.abs(remainder - 0.25) < epsilon) {
      return whole === 0 ? "1/4" : `${whole} 1/4`;
    }
    if (Math.abs(remainder - 0.75) < epsilon) {
      return whole === 0 ? "3/4" : `${whole} 3/4`;
    }
    if (Math.abs(remainder - 0.33) < 0.02) {
      return whole === 0 ? "1/3" : `${whole} 1/3`;
    }
    if (Math.abs(remainder - 0.66) < 0.02) {
      return whole === 0 ? "2/3" : `${whole} 2/3`;
    }
    return parseFloat(scaled.toFixed(2)).toString();
  });
};

export default function RecipeDetailView({ 
  recipe, 
  onBack, 
  isSaved, 
  onToggleSave,
  onAddIngredient,
  onUpdateRecipe,
  onDeleteRecipe,
  onEditRecipe,
  addToast,
  soundEnabled = true,
  onViewProfile
}: RecipeDetailViewProps) {
  const { user, isGuest, signInWithGoogle } = useAuth();
  const { t, language } = useLanguage();
  
  const playCompletionSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playChime = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = ctx.currentTime;
      playChime(523.25, now, 0.25); // C5
      playChime(659.25, now + 0.08, 0.35); // E5
    } catch (e) {
      console.warn("Failed to play audio cue:", e);
    }
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);

  useEffect(() => {
    if (recipe.authorId) {
      api.getProfile(recipe.authorId).then((profile) => {
        if (profile) {
          setCreatorProfile(profile);
        } else {
          setCreatorProfile({
            id: recipe.authorId,
            display_name: recipe.authorName || 'Anonymous Chef',
          });
        }
      });
    } else {
      setCreatorProfile({
        id: 'default',
        display_name: recipe.authorName || 'Nusa Culinary',
      });
    }
  }, [recipe.authorId, recipe.authorName]);
  
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    const saved = localStorage.getItem("culinary_autoplay");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [servingCount, setServingCount] = useState(() => {
    const original = parseInt(recipe.servings) || 2;
    return original;
  });

  const originalServings = parseInt(recipe.servings) || 1;
  const multiplier = servingCount / originalServings;

  const [sortBy, setSortBy] = useState<"newest" | "helpful" | "replies">("newest");
  useEffect(() => {
    if (autoplayEnabled) {
      setIsPlaying(true);
    }
  }, [autoplayEnabled]);

  const [newComment, setNewComment] = useState("");
  const [visibleComments, setVisibleComments] = useState(2);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const COMMENT_LIMIT = 200;

  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [activeTimerMinutes, setActiveTimerMinutes] = useState<number | null>(null);
  const [timerRecipeTitle, setTimerRecipeTitle] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isAuthor = !isGuest && user && recipe.authorId === user.id;

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const numbers = timeStr.match(/\d+/g);
    if (!numbers) return 0;
    const num = parseInt(numbers[0]);
    if (timeStr.toLowerCase().includes("hr") || timeStr.toLowerCase().includes("hour")) {
      return num * 60;
    }
    return num;
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?recipe=${recipe.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this delicious ${recipe.title} recipe on Nusa Culinary!`,
        url: shareUrl,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          addToast("Link copied to clipboard!", "success");
        })
        .catch(err => {
          console.error("Could not copy text: ", err);
          addToast("Failed to copy link", "error");
        });
    }
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleStep = (index: number) => {
    const isCompleting = !completedSteps.includes(index);
    setCompletedSteps(prev => 
      isCompleting ? [...prev, index] : prev.filter(i => i !== index)
    );
    if (isCompleting) {
      playCompletionSound();
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.muted = isMuted;
      if (isPaused) {
        videoRef.current.pause();
      } else if (isPlaying) {
        videoRef.current.play().catch(e => console.log("Video play interrupted:", e));
      }
    }
  }, [playbackSpeed, isPaused, isPlaying, isMuted]);

  useEffect(() => {
    if (isPlaying && !isPaused && videoRef.current) {
        videoRef.current.play().catch(e => console.log("Autoplay failed:", e));
    }
  }, [isPlaying]);

  const handleRewind = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const handleFastForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  const speeds = [0.5, 1, 1.5, 2];

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedPercentage = x / rect.width;
      videoRef.current.currentTime = clickedPercentage * duration;
    }
  };

  // Fetch comments from Supabase
  const [dbComments, setDbComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    const loadComments = async () => {
      setCommentsLoading(true);
      const comments = await api.fetchComments(recipe.id);
      setDbComments(comments);
      setCommentsLoading(false);
    };
    loadComments();
  }, [recipe.id]);

  const currentComments = dbComments;

  const sortedComments = [...currentComments].sort((a, b) => {
    if (sortBy === "newest") return b.timestamp - a.timestamp;
    if (sortBy === "helpful") return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return (b.repliesCount || 0) - (a.repliesCount || 0);
  });

  const handlePostComment = async () => {
    if (!newComment.trim() || isGuest || !user) return;
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const commentText = replyingTo ? `@${replyingTo.name} ${newComment}` : newComment;

    const created = await api.createComment(
      recipe.id,
      user.id,
      displayName,
      commentText,
      avatarUrl
    );

    if (created) {
      setDbComments(prev => [created, ...prev]);
      
      if (replyingTo) {
        const parentId = replyingTo.id;
        const parentComment = dbComments.find(c => c.id === parentId);
        if (parentComment) {
          // Increment locally
          setDbComments(prev => 
            prev.map(c => c.id === parentId ? { ...c, repliesCount: (c.repliesCount || 0) + 1 } : c)
          );
          // Increment in Supabase
          api.incrementCommentReplies(parentId, parentComment.repliesCount || 0);
        }
      }

      setNewComment("");
      setReplyingTo(null);
      addToast("Comment posted successfully!");
    } else {
      addToast("Failed to post comment", "error");
    }
  };

  const handleUpdateRating = (newRating: number) => {
    setUserRating(newRating);
    setRatingSubmitted(true);
    
    const currentRating = recipe.rating || 0;
    const currentCount = recipe.ratingCount || 0;
    const newCount = currentCount + 1;
    const calculatedRating = Number(((currentRating * currentCount + newRating) / newCount).toFixed(1));

    onUpdateRecipe({
      ...recipe,
      rating: calculatedRating,
      ratingCount: newCount
    });

    setTimeout(() => setRatingSubmitted(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface text-on-surface z-50 overflow-y-auto pb-32 transition-colors duration-500 print-view"
    >
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-outline-variant/10 no-print">
        <button 
          onClick={onBack} 
          className="transition-all duration-300 ease-in-out active:scale-95 text-primary"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black text-on-surface tracking-tight">Nusa Culinary</h1>
        <div className="flex items-center gap-1.5">
          {isAuthor && (
            <>
              <button 
                onClick={() => onEditRecipe && onEditRecipe(recipe)}
                className="transition-all duration-300 ease-in-out active:scale-95 text-primary p-2 hover:bg-surface-container rounded-full"
                aria-label="Edit recipe"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="transition-all duration-300 ease-in-out active:scale-95 text-secondary p-2 hover:bg-surface-container rounded-full"
                aria-label="Delete recipe"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
          <button 
            onClick={() => window.print()}
            className="transition-all duration-300 ease-in-out active:scale-95 text-primary p-2 hover:bg-surface-container rounded-full"
            aria-label="Print recipe"
          >
            <Printer className="w-6 h-6" />
          </button>
          <button 
            onClick={handleShare}
            className="transition-all duration-300 ease-in-out active:scale-95 text-primary p-2 hover:bg-surface-container rounded-full"
            aria-label="Share recipe"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto pt-16">
        <section className="relative w-full max-w-4xl mx-auto aspect-video bg-surface-container-highest overflow-hidden no-print">
          <AnimatePresence mode="wait">
            {!isPlaying ? (
              <motion.div 
                key="thumbnail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 group"
                >
                  <div className="flex items-center gap-6">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setIsPlaying(true);
                        setIsPaused(false);
                      }}
                      className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-2xl hover:bg-white/40 transition-colors"
                      aria-label="Play video"
                    >
                      <Play className="w-10 h-10 text-white fill-current" />
                    </motion.button>
                    
                    {recipe.youtubeUrl && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.share) {
                            navigator.share({
                              title: recipe.title,
                              text: `Check out this ${recipe.title} video!`,
                              url: recipe.youtubeUrl
                            });
                          } else {
                            navigator.clipboard.writeText(recipe.youtubeUrl!);
                            addToast("Video link copied to clipboard!");
                          }
                        }}
                        className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl hover:bg-black/60 transition-colors"
                        aria-label="Share video link"
                      >
                        <Share2 className="w-6 h-6 text-white" />
                      </motion.button>
                    )}
                  </div>
                </div>
                {/* Autoplay Toggle Overlay */}
                <div className="absolute top-4 left-4 z-20">
                  <button 
                    onClick={() => {
                      const newValue = !autoplayEnabled;
                      setAutoplayEnabled(newValue);
                      localStorage.setItem("culinary_autoplay", JSON.stringify(newValue));
                    }}
                    className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-black/60"
                    role="switch"
                    aria-checked={autoplayEnabled}
                    aria-label="Toggle autoplay"
                  >
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${autoplayEnabled ? 'bg-primary' : 'bg-white/20'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${autoplayEnabled ? 'left-4.5' : 'left-0.5'}`} />
                    </div>
                    Autoplay {autoplayEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="player"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {(() => {
                  // Normalize YouTube URL to embed format
                  const getYoutubeEmbedUrl = (url?: string): string | null => {
                    if (!url) return null;
                    // Already embed format
                    if (url.includes('/embed/')) return url;
                    // youtube.com/watch?v=VIDEO_ID
                    const watchMatch = url.match(/[?&]v=([^&#]+)/);
                    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
                    // youtu.be/VIDEO_ID
                    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
                    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
                    return null;
                  };

                  const getYoutubeWatchUrl = (url?: string): string | null => {
                    if (!url) return null;
                    // Already watch format
                    if (url.includes('watch?v=')) return url;
                    if (url.includes('youtu.be/')) return url;
                    // Extract ID from embed format
                    const embedMatch = url.match(/\/embed\/([^?&#]+)/);
                    if (embedMatch) return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
                    return url;
                  };

                  const youtubeEmbedUrl = getYoutubeEmbedUrl(recipe.youtubeUrl);
                  const youtubeWatchUrl = getYoutubeWatchUrl(recipe.youtubeUrl);
                  const hasVideoUrl = recipe.videoUrl && recipe.videoUrl.trim() !== '';

                  // Priority: YouTube > mp4 video > fallback image
                  if (youtubeEmbedUrl) {
                    return (
                      <div className="w-full h-full relative">
                        <iframe 
                          className="w-full h-full"
                          src={`${youtubeEmbedUrl}?autoplay=${autoplayEnabled ? 1 : 0}&mute=${autoplayEnabled ? 1 : 0}&rel=0&modestbranding=1`} 
                          title="Recipe Video" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          allowFullScreen
                        ></iframe>
                        {/* Watch on YouTube button */}
                        {youtubeWatchUrl && (
                          <a
                            href={youtubeWatchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-4 right-4 z-30 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Watch on YouTube
                          </a>
                        )}
                      </div>
                    );
                  } else if (hasVideoUrl) {
                    return (
                      <div className="w-full h-full relative cursor-pointer" onClick={() => setIsPaused(!isPaused)}>
                        <video 
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay={autoplayEnabled}
                          muted={isMuted}
                          loop
                          playsInline
                          controls={false}
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleLoadedMetadata}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPaused(!isPaused);
                          }}
                          onError={() => {
                            // If mp4 fails, stop playing and show thumbnail
                            setIsPlaying(false);
                            setIsPaused(false);
                          }}
                        >
                          <source src={recipe.videoUrl} type="video/mp4" />
                        </video>

                        {/* Center Playback Controls */}
                        <AnimatePresence>
                          {(isPaused || isHovering) && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none"
                              role="group"
                              aria-label="Playback controls"
                            >
                              <div className="flex items-center gap-8 pointer-events-auto">
                                <button 
                                  onClick={handleRewind}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleRewind(e as any);
                                    }
                                  }}
                                  className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-black/60 transition-all active:scale-90 focus:ring-2 focus:ring-primary focus:outline-none"
                                  aria-label="Rewind 10 seconds"
                                >
                                  <RotateCcw className="w-6 h-6" aria-hidden="true" />
                                  <span className="text-[8px] font-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-0.5" aria-hidden="true">10</span>
                                </button>

                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPaused(!isPaused);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setIsPaused(!isPaused);
                                    }
                                  }}
                                  className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl text-white border border-white/40 flex items-center justify-center hover:bg-white/30 transition-all active:scale-95 shadow-2xl focus:ring-4 focus:ring-primary focus:outline-none"
                                  aria-label={isPaused ? "Play video" : "Pause video"}
                                >
                                  {isPaused ? (
                                    <Play className="w-10 h-10 fill-current ml-1" aria-hidden="true" />
                                  ) : (
                                    <Pause className="w-10 h-10 fill-current" aria-hidden="true" />
                                  )}
                                </button>

                                <button 
                                  onClick={handleFastForward}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      handleFastForward(e as any);
                                    }
                                  }}
                                  className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 hover:bg-black/60 transition-all active:scale-90 focus:ring-2 focus:ring-primary focus:outline-none"
                                  aria-label="Fast forward 10 seconds"
                                >
                                  <RotateCw className="w-6 h-6" aria-hidden="true" />
                                  <span className="text-[8px] font-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-0.5" aria-hidden="true">10</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  } else {
                    // No video available — show recipe image with message
                    return (
                      <div className="w-full h-full relative">
                        <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Play className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-bold opacity-70">No video available</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
                
                {/* Custom Overlay Controls */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
                  {/* Mute Toggle */}
                  {!recipe.youtubeUrl && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full active:scale-95 transition-all border border-white/10 hover:bg-black/70"
                      aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}
                  
                  {/* Speed Selector (Only for local video) */}
                  {!recipe.youtubeUrl && (
                    <div className="flex bg-black/50 backdrop-blur-md rounded-full border border-white/10 p-0.5">
                      {speeds.map((s) => (
                        <button
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaybackSpeed(s);
                      }}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all focus:outline-none focus:ring-1 focus:ring-white ${playbackSpeed === s ? 'bg-primary text-white' : 'text-white/60 hover:text-white'}`}
                      aria-pressed={playbackSpeed === s}
                      aria-label={`Set playback speed to ${s} times`}
                    >
                      {s}x
                    </button>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying(false);
                    }}
                    className="bg-black/50 backdrop-blur-md text-white p-2 rounded-full active:scale-95 transition-all border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none"
                    aria-label="Close video player"
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {!recipe.youtubeUrl && (
                  <div className="absolute bottom-10 left-6 right-6 flex items-center gap-3 z-30 pointer-events-auto">
                    <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm" aria-label="Current time">
                      {formatTime(currentTime)}
                    </span>
                    <div 
                      className="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer relative group focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-black"
                      onClick={handleSeek}
                      role="slider"
                      aria-label="Video progress"
                      aria-valuemin={0}
                      aria-valuemax={Math.floor(duration)}
                      aria-valuenow={Math.floor(currentTime)}
                      aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (videoRef.current) {
                          if (e.key === 'ArrowRight') {
                            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
                          } else if (e.key === 'ArrowLeft') {
                            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
                          }
                        }
                      }}
                    >
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-100 relative"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 group-focus:scale-100 transition-transform" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm" aria-label="Total duration">
                      {formatTime(duration)}
                    </span>
                  </div>
                )}

                {!recipe.youtubeUrl && (
                  <div className="absolute bottom-18 left-6 flex items-center gap-2 pointer-events-none">
                    <Gauge className="w-4 h-4 text-white/60" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      Speed: {playbackSpeed}x
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20 z-10">
            <div className={`h-full bg-primary-container transition-all duration-300 ${isPlaying ? (recipe.youtubeUrl ? 'w-full' : 'hidden') : 'w-1/3'}`}></div>
          </div>
        </section>

        <section className="px-6 py-8 -mt-6 relative z-10 bg-surface rounded-t-3xl transition-colors max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-tertiary-container text-on-tertiary-container px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">{t(recipe.region)}</span>
            <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">{t(recipe.difficulty)} {t("Difficulty")}</span>
          </div>
          <h2 className="text-4xl font-extrabold text-on-surface leading-tight mb-4">{recipe.title}</h2>
          
          {/* Creator Profile Section */}
          <div className="flex items-center gap-3 mb-6 bg-surface-container-low p-3 rounded-2xl border border-outline-variant/10 max-w-sm no-print">
            <button 
              onClick={() => recipe.authorId && onViewProfile && onViewProfile(recipe.authorId)}
              className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/10 overflow-hidden flex items-center justify-center cursor-pointer transition-transform active:scale-95 shrink-0"
              aria-label="View chef profile"
            >
              {creatorProfile?.avatar_url ? (
                <img src={creatorProfile.avatar_url} alt={recipe.authorName || ""} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </button>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[9px] font-bold uppercase tracking-widest text-outline">{t("Created by")}</p>
              <button 
                onClick={() => recipe.authorId && onViewProfile && onViewProfile(recipe.authorId)}
                className="font-black text-sm text-on-surface hover:text-primary transition-colors cursor-pointer text-left truncate block w-full bg-transparent border-none p-0"
              >
                {recipe.authorName || 'Nusa Culinary'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-6 no-print">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleUpdateRating(star)}
                  className="p-1 transition-transform active:scale-90"
                  aria-label={`Rate ${star} out of 5 stars`}
                  aria-pressed={userRating === star}
                >
                  <Star 
                    className={`w-5 h-5 transition-colors ${
                      (hoverRating || userRating) >= star 
                        ? 'fill-tertiary text-tertiary' 
                        : 'text-outline-variant'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <AnimatePresence>
              {ratingSubmitted && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-bold text-tertiary uppercase tracking-widest"
                >
                  Rating Saved!
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-sm font-bold text-on-surface ml-auto">
              {recipe.rating && recipe.rating > 0 ? recipe.rating.toFixed(1) : "0.0"}
            </span>
            <span className="text-xs text-on-surface-variant">
              ({recipe.ratingCount || 0} {t("ratings")})
            </span>
          </div>

      <div className="flex items-center gap-3 md:gap-4 mb-8 text-on-surface-variant overflow-x-auto no-scrollbar pb-2 no-print">
        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl border border-outline-variant/10 min-w-[120px] md:min-w-[145px]">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-outline">{t("Prep Time")}</span>
            <span className="text-xs md:text-sm font-black text-on-surface whitespace-nowrap">{recipe.prepTime}</span>
          </div>
          {parseTimeToMinutes(recipe.prepTime) > 0 && (
            <button
              onClick={() => {
                setActiveTimerMinutes(parseTimeToMinutes(recipe.prepTime));
                setTimerRecipeTitle(`${recipe.title} (Prep)`);
                addToast(t("Prep timer started!"), "success");
              }}
              className="ml-auto p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-95 flex items-center justify-center"
              title={t("Start Prep Timer")}
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl border border-outline-variant/10 min-w-[120px] md:min-w-[145px]">
          <Clock className="w-4 h-4 text-secondary shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-outline">{t("Cook Time")}</span>
            <span className="text-xs md:text-sm font-black text-on-surface whitespace-nowrap">{recipe.cookTime}</span>
          </div>
          {parseTimeToMinutes(recipe.cookTime) > 0 && (
            <button
              onClick={() => {
                setActiveTimerMinutes(parseTimeToMinutes(recipe.cookTime));
                setTimerRecipeTitle(`${recipe.title} (Cook)`);
                addToast(t("Cook timer started!"), "success");
              }}
              className="ml-auto p-1.5 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary transition-all active:scale-95 flex items-center justify-center"
              title={t("Start Cook Timer")}
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl border border-outline-variant/10 min-w-[110px] md:min-w-[130px]">
          <Flame className="w-4 h-4 text-tertiary shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-outline">{t("Calories")}</span>
            <span className="text-xs md:text-sm font-black text-on-surface whitespace-nowrap">{recipe.calories}</span>
          </div>
        </div>
      </div>

      {/* Simple Printable Meta (only visible when printing) */}
      <div className="print-only mb-6 border-b border-black/25 pb-4">
        <img src={recipe.image} alt={recipe.title} className="w-full h-64 object-cover mb-4 rounded-lg" />
        <p><strong>{t("Prep Time")}:</strong> {recipe.prepTime} | <strong>{t("Cook Time")}:</strong> {recipe.cookTime} | <strong>{t("Calories")}:</strong> {recipe.calories}</p>
        <p><strong>{t("Difficulty")}:</strong> {t(recipe.difficulty)} | <strong>{t("Preferred Region")}:</strong> {t(recipe.region)}</p>
      </div>

      {recipe.nutrition && (
        <section className="mb-8 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-4 flex items-center gap-2">
            <Flame className="w-3 h-3 text-tertiary" /> {t("Nutrition per Serving")}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 bg-surface rounded-xl border border-outline-variant/5">
              <span className="text-lg font-black text-on-surface">{recipe.nutrition.protein}</span>
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Protein</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-surface rounded-xl border border-outline-variant/5">
              <span className="text-lg font-black text-on-surface">{recipe.nutrition.fat}</span>
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Fat</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-surface rounded-xl border border-outline-variant/5">
              <span className="text-lg font-black text-on-surface">{recipe.nutrition.carbs}</span>
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Carbs</span>
            </div>
          </div>
        </section>
      )}

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          onToggleSave(recipe.id);
          if (soundEnabled && !isSaved) {
            playCompletionSound();
          }
        }}
        className={`w-full py-4 px-8 rounded-full font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all ${
          isSaved 
            ? 'bg-secondary text-on-secondary shadow-secondary/20' 
            : 'bg-linear-to-br from-primary to-primary-container text-on-primary shadow-primary/20'
        }`}
        aria-label={isSaved ? "Remove from saved recipes" : "Save to my recipes"}
      >
            <motion.div
              animate={isSaved ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </motion.div>
            {isSaved ? t("Saved Collection") : t("Save to My Recipes")}
          </motion.button>
        </section>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 px-4 lg:px-6">
          <div className="lg:col-span-5 space-y-8">
            <section className="py-8 px-6 bg-surface-container-low rounded-xl">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-on-surface">{t("Ingredients")}</h3>
              <div className="flex items-center gap-3 bg-surface-container-high px-3 py-1 rounded-full border border-outline-variant/10">
                <button 
                  onClick={() => setServingCount(Math.max(1, servingCount - 1))}
                  className="w-6 h-6 flex items-center justify-center font-bold text-lg hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-bold min-w-[80px] text-center">{servingCount} {t("Servings")}</span>
                <button 
                  onClick={() => setServingCount(servingCount + 1)}
                  className="w-6 h-6 flex items-center justify-center font-bold text-lg hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="relative group no-print">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input 
                type="text" 
                placeholder="Search ingredients..."
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                className="w-full bg-surface-container-highest border-none rounded-full pl-11 pr-12 py-3 text-base md:text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                aria-label="Search ingredients"
              />
              {ingredientSearch && (
                <button 
                  onClick={() => setIngredientSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-secondary bg-surface-container-highest rounded-full transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            {recipe.ingredients.filter(ing => 
              ingredientSearch.trim() === "" || 
              ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
            ).map((ing, i) => {
              const isMatch = ingredientSearch.trim() !== "";
              
              return (
                <motion.div 
                  key={i} 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col"
                >
                  <label className={`flex items-center gap-4 group cursor-pointer p-3 rounded-xl transition-all duration-300 ${isMatch ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-surface-container-lowest'} ${checkedIngredients.includes(i) ? 'opacity-60' : ''}`}>
                    <input 
                      className="w-6 h-6 rounded-md border-outline-variant text-primary focus:ring-primary/20 cursor-pointer transition-all no-print" 
                      type="checkbox"
                      checked={checkedIngredients.includes(i)}
                      onChange={() => toggleIngredient(i)}
                      aria-label={`Mark ${ing.name} as acquired`}
                    />
                    <div className="flex justify-between w-full items-center">
                      <div className="flex flex-col">
                        <span className={`font-medium transition-colors ${isMatch ? 'text-primary' : 'text-on-surface'} ${checkedIngredients.includes(i) ? 'line-through' : ''}`}>
                          {ing.name}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddIngredient(ing.name, scaleQuantity(ing.detail, multiplier));
                          }}
                          className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 hover:underline text-left"
                        >
                          Add to List +
                        </button>
                      </div>
                      <span className="text-on-surface-variant text-sm">{scaleQuantity(ing.detail, multiplier)}</span>
                    </div>
                  </label>
                  
                  <AnimatePresence>
                    {isMatch && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-13 pr-3 pb-2">
                          <div className="bg-primary/5 p-3 rounded-lg border-l-4 border-primary">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">{t("Ingredient Role")}</span>
                            <p className="text-xs text-on-surface-variant leading-relaxed italic">{ing.role}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            <button 
              onClick={() => {
                recipe.ingredients.forEach(ing => onAddIngredient(ing.name, scaleQuantity(ing.detail, multiplier)));
              }}
              className="mt-4 w-full py-3 rounded-2xl border border-primary/20 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-all active:scale-95 no-print"
            >
              {t("Add Ingredients to Shopping List")}
            </button>
            
            {ingredientSearch.trim() !== "" && recipe.ingredients.filter(ing => 
              ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
            ).length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center"
              >
                <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-outline" />
                </div>
                <p className="text-on-surface-variant font-medium">
                  {language === "id" ? (
                    <>Tidak ada bahan ditemukan untuk "{ingredientSearch}"</>
                  ) : (
                    <>No ingredients found for "{ingredientSearch}"</>
                  )}
                </p>
                <button 
                  onClick={() => setIngredientSearch("")}
                  className="text-primary text-sm font-bold mt-2 hover:underline"
                >
                  Clear search and show all
                </button>
              </motion.div>
            )}
          </div>
        </section>
          </div>
          <div className="lg:col-span-7 space-y-8">
        <section className="px-6 py-8">
          <h3 className="text-2xl font-bold text-on-surface mb-8">Instructions</h3>
          <div className="space-y-10">
            {recipe.instructions.map((step, i) => (
              <motion.div 
                key={i} 
                whileHover={{ x: 4 }}
                onClick={() => toggleStep(i)}
                className={`flex gap-6 cursor-pointer group transition-all p-2 rounded-2xl ${completedSteps.includes(i) ? 'opacity-50 grayscale bg-surface-container-low' : ''}`}
              >
                <div className={`flex-none w-10 h-10 rounded-full flex items-center justify-center font-black border transition-all ${completedSteps.includes(i) ? 'bg-outline text-white border-transparent' : 'bg-primary-fixed text-on-primary-fixed border-primary/20'}`}>
                  {completedSteps.includes(i) ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>
                  ) : i + 1}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-lg mb-2 transition-all ${completedSteps.includes(i) ? 'line-through text-outline' : ''}`}>{step.title}</h4>
                  <p className={`text-on-surface-variant leading-relaxed transition-all ${completedSteps.includes(i) ? 'line-through' : ''}`}>{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

            <section className="py-12 bg-surface border-t border-outline-variant/10 no-print">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h3 className="text-2xl font-bold text-on-surface">{t("Chef Discussion")}</h3>
                <div className="flex items-center gap-2 bg-surface-container p-1 rounded-full border border-outline-variant/20 overflow-x-auto no-scrollbar max-w-full" role="radiogroup" aria-label="Sort comments">
              <button 
                onClick={() => setSortBy("newest")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none whitespace-nowrap ${sortBy === "newest" ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                role="radio"
                aria-checked={sortBy === "newest"}
              >
                {t("Newest")}
              </button>
              <button 
                onClick={() => setSortBy("helpful")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none whitespace-nowrap ${sortBy === "helpful" ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                role="radio"
                aria-checked={sortBy === "helpful"}
              >
                {t("Most Helpful")}
              </button>
              <button 
                onClick={() => setSortBy("replies")}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all focus:ring-2 focus:ring-primary/20 focus:outline-none whitespace-nowrap ${sortBy === "replies" ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                role="radio"
                aria-checked={sortBy === "replies"}
              >
                {t("Most Replies")}
              </button>
            </div>
          </div>
          
          <div className="space-y-8 mb-8">
            <AnimatePresence initial={false} mode="popLayout">
              {sortedComments.slice(0, visibleComments).map((comment) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-4"
                >
                  <div className={`w-12 h-12 rounded-full overflow-hidden flex-none ${comment.initial ? 'bg-primary/10 flex items-center justify-center text-primary font-bold' : ''}`}>
                    {comment.avatar ? (
                      <img src={comment.avatar} alt={comment.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{comment.initial}</span>
                    )}
                  </div>
                  <div className="flex-1 p-4 md:p-5 rounded-2xl bg-surface-container overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-on-surface truncate pr-2">{comment.name}</span>
                      <span className="text-[10px] text-on-surface-variant font-medium tracking-wide uppercase shrink-0">{comment.time}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-4 wrap-break-word">{comment.text}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-3 border-t border-outline-variant/10">
                      <button 
                        onClick={() => {
                          setReplyingTo({ id: comment.id, name: comment.name });
                          document.getElementById('comment')?.focus();
                        }}
                        className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-md px-1"
                        aria-label={`Reply to ${comment.name}`}
                      >
                        Reply
                      </button>
                      <button 
                        onClick={async () => {
                          setDbComments(prev => 
                            prev.map(c => c.id === comment.id ? { ...c, helpfulCount: (c.helpfulCount || 0) + 1 } : c)
                          );
                          const success = await api.incrementCommentHelpful(comment.id, comment.helpfulCount || 0);
                          if (!success) {
                            setDbComments(prev => 
                              prev.map(c => c.id === comment.id ? { ...c, helpfulCount: comment.helpfulCount } : c)
                            );
                            addToast("Failed to mark comment as helpful", "error");
                          }
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-tertiary transition-colors active:scale-95 focus:ring-2 focus:ring-tertiary/20 focus:outline-none rounded-md px-1"
                        aria-label={`Mark comment by ${comment.name} as helpful. Current helpful count: ${comment.helpfulCount}`}
                      >
                        <Star className="w-3 h-3 fill-current text-tertiary" />
                        <span>{comment.helpfulCount} Helpful</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `Comment by ${comment.name} on ${recipe.title}`,
                              text: comment.text,
                              url: window.location.href
                            });
                          } else {
                            navigator.clipboard.writeText(`"${comment.text}" - ${comment.name}`);
                            addToast("Comment text copied to clipboard!");
                          }
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors active:scale-95 focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-md px-1"
                        aria-label={`Share comment by ${comment.name}`}
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share</span>
                      </button>
                      <button 
                        onClick={() => {
                          console.log(`Comment by ${comment.name} (ID: ${comment.id}) has been reported for review.`);
                          addToast("Thank you for your report. This comment has been flagged for review.", "info");
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-secondary transition-colors active:scale-95 focus:ring-2 focus:ring-secondary/20 focus:outline-none rounded-md px-1"
                        aria-label={`Report comment by ${comment.name}`}
                      >
                        <Flag className="w-3 h-3" />
                        <span>Report</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        <span>{comment.repliesCount || 0} Replies</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {visibleComments < currentComments.length && (
            <button 
              onClick={() => setVisibleComments(prev => prev + 2)}
              className="w-full py-4 text-sm font-bold text-primary hover:bg-primary/5 rounded-2xl transition-colors mb-10 border border-dashed border-primary/20 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              aria-label="Load more comments"
            >
              {t("Load More Comments")} ({currentComments.length - visibleComments} {t("hidden")})
            </button>
          )}
          
          <div className="relative">
            {replyingTo && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-surface-container-high px-4 py-2 rounded-t-2xl mb-px border-b border-white/20"
              >
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {t("Replying to")} <span className="text-primary">{replyingTo.name}</span>
                </span>
                <button 
                  onClick={() => setReplyingTo(null)} 
                  className="text-outline hover:text-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none rounded-sm"
                  aria-label="Cancel reply"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
            <div className={`flex items-center justify-between mb-3 px-2 ${replyingTo ? 'mt-2' : ''}`}>
              <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="comment">
                {isGuest ? t('Login to join the discussion') : (replyingTo ? t('Write your reply') : t('Leave a comment'))}
              </label>
              {!isGuest && (
                <span className={`text-[10px] font-bold ${newComment.length >= COMMENT_LIMIT ? 'text-secondary' : 'text-outline-variant'}`}>
                  {newComment.length} / {COMMENT_LIMIT}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                {isGuest ? (
                  <button 
                    onClick={signInWithGoogle}
                    className="w-full bg-primary/5 border border-dashed border-primary/30 rounded-full px-6 py-4 text-primary font-bold text-sm text-left hover:bg-primary/10 transition-all flex items-center justify-between group"
                  >
                    <span>{t("Click here to sign in with Google")}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <input 
                    className={`w-full bg-surface-container-high border-none rounded-full px-6 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant text-base outline-none transition-all ${newComment.length >= COMMENT_LIMIT ? 'ring-2 ring-secondary/20' : ''}`}
                    id="comment" 
                    placeholder={t("Share your cooking experience...")} 
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value.slice(0, COMMENT_LIMIT))}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                  />
                )}
              </div>
              {!isGuest && (
                <button 
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white transition-all active:scale-90 disabled:opacity-50 disabled:grayscale disabled:scale-100 focus:ring-4 focus:ring-primary/30 focus:outline-none"
                  aria-label="Post comment"
                >
                  <Send className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </section>
        </div>
        </div>
      </main>
      {activeTimerMinutes !== null && (
        <CookingTimer
          initialMinutes={activeTimerMinutes}
          recipeTitle={timerRecipeTitle}
          onClose={() => setActiveTimerMinutes(null)}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-6 no-print">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-lowest max-w-sm w-full p-6 rounded-3xl border border-outline-variant/10 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-on-surface">{t("Delete Recipe?")}</h3>
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                  {language === "id" ? (
                    <>Apakah Anda yakin ingin menghapus <strong>{recipe.title}</strong>? Tindakan ini tidak dapat dibatalkan.</>
                  ) : (
                    <>Are you sure you want to delete <strong>{recipe.title}</strong>? This action cannot be undone.</>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant font-bold rounded-2xl transition-all active:scale-95 text-sm"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    if (onDeleteRecipe) onDeleteRecipe(recipe.id);
                  }}
                  className="flex-1 py-3 bg-secondary text-white font-bold rounded-2xl shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all active:scale-95 text-sm"
                >
                  {t("Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
