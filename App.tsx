/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, useState, useEffect } from "react";
import { LogOut, Zap, Shield, Activity, Dumbbell, RotateCcw, Layers, User as UserIcon, ChevronLeft, Plus, Weight, ChevronRight, Calendar, Clock, Mail, Lock, UserPlus, LogIn, Pencil, Trash2, Check, X, Users, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Screen = "auth-role" | "auth-choice" | "auth-register" | "auth-login" | "home" | "low-volume" | "submodule-detail" | "add-exercise" | "muscle-group-view" | "profile" | "history-view" | "history-detail" | "free-mode" | "students-view" | "student-profile-view" | "upload-workout-student-select" | "upload-workout-style-select" | "upload-workout-submodule-select" | "upload-workout-muscle-select" | "upload-workout-exercise-add" | "guided-workout-view" | "guided-workout-detail";

interface Exercise {
  id: string;
  type: string;
  name: string;
  weight: string;
  date: string;
  time: string;
}

interface GuidedExercise {
  id: string;
  type: string; // Muscle group
  name: string;
  style: string; // Low Volume / Modo Free
  subModule: string; // e.g. PPL, Full Body, Tradicional
  progression: Series[];
  professorEmail: string;
  maxWeight?: string;
}

interface WorkoutSession {
  id: string;
  date: string;
  time: string;
  exercises: Exercise[];
}

interface UserAccount {
  name: string;
  lastName?: string;
  email: string;
  password?: string;
  role: "ATLETA" | "PROFESSOR";
  cref?: string;
  photo?: string;
  serialNumber: string;
}

interface Series {
  reps: string;
  percentage: string;
  label?: string;
  type: 'warmup' | 'recognition' | 'work';
}

const getProgression = (module: string, isFirst: boolean): Series[] => {
  const m = module.toLowerCase();
  if (m === "tradicional") return [];
  if (m.includes("full body")) {
    if (isFirst) {
      return [
        { reps: "10–12", percentage: "50%", label: "Aquecimento", type: 'warmup' },
        { reps: "6–8", percentage: "65%", label: "Reconhecimento", type: 'recognition' },
        { reps: "4–6", percentage: "75–80%", label: "Trabalho", type: 'work' },
        { reps: "4–6", percentage: "80–85%", label: "Trabalho Principal", type: 'work' },
      ];
    }
    return [
      { reps: "8–12", percentage: "60–65%", type: 'warmup' },
      { reps: "8–12", percentage: "65–75%", type: 'work' },
      { reps: "8–12", percentage: "65–75%", type: 'work' },
    ];
  }
  if (m.includes("ppl")) {
    if (isFirst) {
      return [
        { reps: "8–10", percentage: "50–55%", type: 'warmup' },
        { reps: "5–6", percentage: "65–70%", type: 'recognition' },
        { reps: "4–6", percentage: "80–85%", type: 'work' },
        { reps: "3–5", percentage: "85–90%", type: 'work' },
      ];
    }
    return [
      { reps: "8–12", percentage: "60–70%", type: 'warmup' },
      { reps: "8–12", percentage: "65–75%", type: 'work' },
      { reps: "8–12", percentage: "65–75%", type: 'work' },
      { reps: "10–12", percentage: "60–70%", type: 'work' },
    ];
  }
  if (m.includes("upper") || m.includes("lower")) {
    if (isFirst) {
      return [
        { reps: "8–10", percentage: "50–55%", type: 'warmup' },
        { reps: "5–6", percentage: "65–70%", type: 'recognition' },
        { reps: "4–6", percentage: "75–85%", type: 'work' },
        { reps: "4–6", percentage: "80–87%", type: 'work' },
      ];
    }
    return [
      { reps: "8–10", percentage: "60–70%", type: 'warmup' },
      { reps: "8–10", percentage: "65–75%", type: 'work' },
      { reps: "8–10", percentage: "65–75%", type: 'work' },
    ];
  }
  if (m.includes("torso") || m.includes("limbs")) {
    return [
      { reps: "10–12", percentage: "55–60%", type: 'warmup' },
      { reps: "8–10", percentage: "65–70%", type: 'recognition' },
      { reps: "8–10", percentage: "70–75%", type: 'work' },
      { reps: "10–12", percentage: "60–65%", type: 'work' },
    ];
  }
  return [];
};

const SeriesGroup: React.FC<{ 
  type: 'warmup' | 'recognition' | 'work'; 
  series: (Series & { index: number })[];
  maxWeight: string;
}> = ({ type, series, maxWeight }) => {
  const config = {
    warmup: { icon: <Zap className="w-3 h-3" />, label: "Aquecimento", color: "text-orange-500", border: "border-orange-500/20" },
    recognition: { icon: <ChevronRight className="w-3 h-3" />, label: "Reconhecimento", color: "text-blue-500", border: "border-blue-500/20" },
    work: { icon: <Activity className="w-3 h-3" />, label: "Unidades de Trabalho", color: "text-brand-red", border: "border-brand-red/20" },
  }[type];

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 ${config.color} text-[10px] font-black uppercase tracking-[0.2em]`}>
        {config.icon}
        {config.label}
      </div>
      <div className="flex flex-wrap gap-3">
        {series.map((s) => (
          <div 
            key={s.index} 
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all bg-brand-gray/50
              ${type === 'work' ? 'border-brand-red shadow-[0_0_15px_rgba(255,28,28,0.2)]' : config.border} text-white
            `}
          >
            <span className="text-[10px] font-black text-white/40">S{s.index + 1}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black">{s.percentage}</span>
            </div>
            <div className="px-2 py-0.5 rounded-md text-[11px] font-black bg-white/5">
              {calculateWeight(maxWeight, s.percentage)}
            </div>
            <span className="text-[10px] font-bold text-white/40">{s.reps}R</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const calculateWeight = (maxWeight: string, percentage: string) => {
  const max = parseFloat(maxWeight);
  if (isNaN(max) || max <= 0) return "";
  
  const cleanPercent = percentage.replace("%", "").split("–").map(p => parseFloat(p.trim()));
  if (cleanPercent.length === 1) {
    return `${(max * cleanPercent[0] / 100).toFixed(1)} kg`;
  } else if (cleanPercent.length === 2) {
    return `${(max * cleanPercent[0] / 100).toFixed(1)} – ${(max * cleanPercent[1] / 100).toFixed(1)} kg`;
  }
  return "";
};

const generateSerialNumber = (existingUsers: UserAccount[]) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let serial = "";
  let isUnique = false;

  while (!isUnique) {
    serial = "#";
    for (let i = 0; i < 6; i++) {
      serial += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!existingUsers.find(u => u.serialNumber === serial)) {
      isUnique = true;
    }
  }
  return serial;
};

const RetractableExerciseCard: React.FC<{ 
  exercise: Exercise;
  moduleTitle: string;
  isFirst: boolean;
  onUpdate: (id: string, subModuleTitle: string, updates: Partial<Exercise>) => void;
  onDelete: (id: string, subModuleTitle: string) => void;
}> = ({ exercise, moduleTitle, isFirst, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({ name: exercise.name, weight: exercise.weight });
  const series = getProgression(moduleTitle, isFirst);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(exercise.id, moduleTitle, { name: editForm.name, weight: editForm.weight });
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm({ name: exercise.name, weight: exercise.weight });
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete(exercise.id, moduleTitle);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={`
        relative bg-brand-gray border border-white/5 rounded-[32px] 
        overflow-hidden cursor-pointer transition-shadow duration-500
        ${isExpanded ? 'shadow-2xl ring-1 ring-white/10' : 'h-20 shadow-lg hover:bg-brand-gray/80'}
      `}
      onClick={() => !isEditing && setIsExpanded(!isExpanded)}
    >
      {/* Background glow */}
      <motion.div 
        layout
        className="absolute inset-0 bg-brand-red pointer-events-none"
        animate={{ opacity: isExpanded ? 0.03 : 0 }}
      />

      <div className="relative z-10">
        {/* Header / Collapsed View */}
        <motion.div 
          layout="position"
          className={`px-8 flex items-center justify-between ${isExpanded ? 'pt-8 mb-8' : 'h-20'}`}
        >
          <div className="flex flex-col">
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold mb-1.5"
              >
                Carga Máxima
              </motion.span>
            )}
            <motion.span 
              layoutId={`name-${exercise.id}`}
              className={`font-bold text-white uppercase tracking-wider ${isExpanded ? 'text-xl' : 'text-base'}`}
            >
              {exercise.name}
            </motion.span>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] uppercase tracking-[0.3em] text-brand-red font-black mt-1"
              >
                {exercise.type}
              </motion.span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {!isExpanded ? (
              <div className="flex items-baseline gap-2">
                <motion.span 
                  layoutId={`weight-${exercise.id}`}
                  className="text-2xl font-black text-brand-red leading-none"
                >
                  {exercise.weight || "0"}
                </motion.span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  KG
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                      className="p-2.5 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleDeleteClick}
                      className={`p-2.5 rounded-full transition-all flex items-center gap-2 ${showDeleteConfirm ? 'bg-brand-red text-white px-4' : 'bg-white/5 text-brand-red/40 hover:text-brand-red hover:bg-brand-red/10'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                      {showDeleteConfirm && <span className="text-[10px] font-black uppercase tracking-widest">Confirmar?</span>}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleSave}
                      className="p-2.5 bg-brand-red/20 rounded-full text-brand-red hover:bg-brand-red hover:text-white transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="p-2.5 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-8 flex flex-col items-center overflow-hidden"
            >
              {/* Editable Content */}
              <div className="w-full flex flex-col items-center gap-8 mb-10">
                {isEditing ? (
                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-white/30 font-bold ml-1">Nome do Exercício</label>
                      <input 
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-brand-red focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase tracking-widest text-white/30 font-bold ml-1">Carga Máxima (KG)</label>
                      <input 
                        type="number"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-brand-red focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <motion.span 
                      layoutId={`weight-${exercise.id}`}
                      className="text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      {exercise.weight || "0"}
                    </motion.span>
                    <span className="text-base font-bold text-brand-red uppercase tracking-[0.2em] mt-6">
                      KG
                    </span>
                  </div>
                )}
              </div>

              {/* Series Progression */}
              <div className="w-full space-y-8 pb-4">
                {(['warmup', 'recognition', 'work'] as const).map(type => {
                  const groupSeries = series
                    .map((s, i) => ({ ...s, index: i }))
                    .filter(s => s.type === type);
                  
                  if (groupSeries.length === 0) return null;

                  return (
                    <SeriesGroup 
                      key={type} 
                      type={type} 
                      series={groupSeries} 
                      maxWeight={isEditing ? editForm.weight : exercise.weight} 
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const RetractableGuidedExerciseCard: React.FC<{
  exercise: GuidedExercise;
  onUpdate: (id: string, updates: Partial<GuidedExercise>) => void;
}> = ({ exercise, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ weight: exercise.maxWeight || "" });

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(exercise.id, { maxWeight: editForm.weight });
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm({ weight: exercise.maxWeight || "" });
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      className={`
        relative bg-brand-gray border border-white/5 rounded-[32px] 
        overflow-hidden cursor-pointer transition-shadow duration-500
        ${isExpanded ? 'shadow-2xl ring-1 ring-white/10' : 'h-20 shadow-lg hover:bg-brand-gray/80'}
      `}
      onClick={() => !isEditing && setIsExpanded(!isExpanded)}
    >
      <motion.div 
        layout
        className="absolute inset-0 bg-brand-red pointer-events-none"
        animate={{ opacity: isExpanded ? 0.03 : 0 }}
      />

      <div className="relative z-10">
        <motion.div 
          layout="position"
          className={`px-8 flex items-center justify-between ${isExpanded ? 'pt-8 mb-8' : 'h-20'}`}
        >
          <div className="flex flex-col">
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold mb-1.5"
              >
                Carga Máxima
              </motion.span>
            )}
            <motion.span 
              layoutId={`guided-name-${exercise.id}`}
              className={`font-bold text-white uppercase tracking-wider ${isExpanded ? 'text-xl' : 'text-base'}`}
            >
              {exercise.name}
            </motion.span>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] uppercase tracking-[0.3em] text-brand-red font-black mt-1"
              >
                {exercise.type}
              </motion.span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {!isExpanded ? (
              <div className="flex items-baseline gap-2">
                <motion.span 
                  layoutId={`guided-weight-${exercise.id}`}
                  className="text-2xl font-black text-brand-red leading-none"
                >
                  {exercise.maxWeight || "0"}
                </motion.span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  KG
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                {!isEditing ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    className="p-2.5 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleSave}
                      className="p-2.5 bg-brand-red/20 rounded-full text-brand-red hover:bg-brand-red hover:text-white transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="p-2.5 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-8 flex flex-col items-center overflow-hidden"
            >
              <div className="w-full flex flex-col items-center gap-8 mb-10">
                {isEditing ? (
                  <div className="w-full space-y-2">
                    <label className="text-[8px] uppercase tracking-widest text-white/30 font-bold ml-1">Carga Máxima (KG)</label>
                    <input 
                      type="number"
                      value={editForm.weight}
                      onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-brand-red focus:outline-none transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <motion.span 
                      layoutId={`guided-weight-${exercise.id}`}
                      className="text-8xl font-black text-white leading-tight tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      {exercise.maxWeight || "0"}
                    </motion.span>
                    <span className="text-base font-bold text-brand-red uppercase tracking-[0.2em] mt-6">
                      KG
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full space-y-8 pb-8">
                <div className="space-y-3">
                  {exercise.progression.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-brand-black/40 rounded-2xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">{step.label || `Série ${idx + 1}`}</span>
                        <span className="text-sm font-black text-white">{step.reps} Reps</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">{step.percentage}</span>
                        <span className="text-sm font-black text-brand-red">
                          {exercise.maxWeight ? calculateWeight(exercise.maxWeight, step.percentage) : "---"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("auth-role");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeSubModule, setActiveSubModule] = useState<string>("");
  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"ATLETA" | "PROFESSOR">("ATLETA");
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem("load-x-users");
    return saved ? JSON.parse(saved) : [];
  });
  const [allUserExercises, setAllUserExercises] = useState<Record<string, Record<string, Exercise[]>>>(() => {
    const saved = localStorage.getItem("load-x-exercises");
    return saved ? JSON.parse(saved) : {};
  });
  const [allUserHistory, setAllUserHistory] = useState<Record<string, Record<string, WorkoutSession[]>>>(() => {
    const saved = localStorage.getItem("load-x-history");
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedHistorySession, setSelectedHistorySession] = useState<WorkoutSession | null>(null);
  const [historyFilterDate, setHistoryFilterDate] = useState<string>("");
  const [professorStudents, setProfessorStudents] = useState<Record<string, { name: string, serialNumber: string }[]>>(() => {
    const saved = localStorage.getItem("load-x-professor-students");
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedStudent, setSelectedStudent] = useState<UserAccount | null>(null);
  const [studentForm, setStudentForm] = useState({ name: "", serialNumber: "" });
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [allUserGuidedWorkouts, setAllUserGuidedWorkouts] = useState<Record<string, GuidedExercise[]>>(() => {
    const saved = localStorage.getItem("load-x-guided-workouts");
    return saved ? JSON.parse(saved) : {};
  });
  const [uploadWorkoutState, setUploadWorkoutState] = useState<{
    studentEmail: string;
    style: string;
    subModule: string;
    muscleGroup: string;
    exercises: GuidedExercise[];
  }>({
    studentEmail: "",
    style: "",
    subModule: "",
    muscleGroup: "",
    exercises: []
  });
  const [guidedExerciseForm, setGuidedExerciseForm] = useState({
    name: ""
  });
  const [selectedGuidedWorkout, setSelectedGuidedWorkout] = useState<{ muscle: string, exercises: GuidedExercise[] } | null>(null);

  // Auth Form State
  const [authForm, setAuthForm] = useState({
    name: "",
    lastName: "",
    email: "",
    cref: "",
    password: "",
    confirmPassword: ""
  });
  const [authError, setAuthError] = useState("");

  // Persist data
  useEffect(() => {
    localStorage.setItem("load-x-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("load-x-exercises", JSON.stringify(allUserExercises));
  }, [allUserExercises]);

  useEffect(() => {
    localStorage.setItem("load-x-history", JSON.stringify(allUserHistory));
  }, [allUserHistory]);

  useEffect(() => {
    localStorage.setItem("load-x-professor-students", JSON.stringify(professorStudents));
  }, [professorStudents]);

  useEffect(() => {
    localStorage.setItem("load-x-guided-workouts", JSON.stringify(allUserGuidedWorkouts));
  }, [allUserGuidedWorkouts]);

  // Derived Data state
  const exercises = currentUser ? (allUserExercises[currentUser.email] || {}) : {};
  const history = currentUser ? (allUserHistory[currentUser.email] || {}) : {};
  
  // Form state
  const [exerciseForm, setExerciseForm] = useState({
    type: "",
    name: "",
    weight: ""
  });
  const [addStep, setAddStep] = useState(1);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const navigateTo = (screen: Screen, subModuleTitle: string = "", muscleGroup: string = "") => {
    if (subModuleTitle) setActiveSubModule(subModuleTitle);
    if (muscleGroup) setActiveMuscleGroup(muscleGroup);
    setCurrentScreen(screen);
    setAddStep(1);
    setExerciseForm({ type: "", name: "", weight: "" });
    setAuthForm({ name: "", lastName: "", email: "", cref: "", password: "", confirmPassword: "" });
    setAuthError("");
    if (screen === "home") {
      setUploadWorkoutState({ studentEmail: "", style: "", muscleGroup: "", exercises: [] });
      setGuidedExerciseForm({ name: "", sets: "", reps: "" });
    }
    window.scrollTo(0, 0);
  };

  const handleRegister = () => {
    const { name, lastName, email, cref, password, confirmPassword } = authForm;
    
    if (selectedRole === "ATLETA") {
      if (!name || !email || !password) {
        setAuthError("Preencha todos os campos.");
        return;
      }
    } else {
      if (!name || !lastName || !email || !cref || !password || !confirmPassword) {
        setAuthError("Preencha todos os campos.");
        return;
      }
      if (password !== confirmPassword) {
        setAuthError("As senhas não coincidem.");
        return;
      }
    }

    // Password strength check: min 8 chars, 1 upper, 1 lower, 1 number, 1 special
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setAuthError("A senha deve ser forte: mínimo 8 caracteres, maiúsculas, minúsculas, números e símbolos.");
      return;
    }

    if (users.find(u => u.email === email)) {
      setAuthError("Este e-mail já está cadastrado.");
      return;
    }

    const newUser: UserAccount = {
      name,
      lastName: selectedRole === "PROFESSOR" ? lastName : undefined,
      email,
      password,
      role: selectedRole,
      cref: selectedRole === "PROFESSOR" ? cref : undefined,
      serialNumber: generateSerialNumber(users)
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    navigateTo("home");
  };

  const handleLogin = () => {
    const user = users.find(u => u.email === authForm.email && u.password === authForm.password);
    if (user) {
      setCurrentUser(user);
      navigateTo("home");
    } else {
      setAuthError("E-mail ou senha incorretos.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigateTo("auth-role");
  };

  const handleUpdatePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedUser = { ...currentUser, photo: base64String };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = () => {
    if (!currentUser || currentUser.role !== "PROFESSOR") return;
    if (!studentForm.name || !studentForm.serialNumber) {
      setAuthError("Preencha o nome e o número de série.");
      return;
    }

    const studentUser = users.find(u => u.serialNumber === studentForm.serialNumber);
    if (!studentUser) {
      setAuthError("Aluno não encontrado com este número de série.");
      return;
    }

    setProfessorStudents(prev => {
      const currentStudents = prev[currentUser.email] || [];
      if (currentStudents.find(s => s.serialNumber === studentForm.serialNumber)) {
        setAuthError("Este aluno já está cadastrado.");
        return prev;
      }
      return {
        ...prev,
        [currentUser.email]: [...currentStudents, { name: studentForm.name, serialNumber: studentForm.serialNumber }]
      };
    });

    setStudentForm({ name: "", serialNumber: "" });
    setShowAddStudent(false);
    setAuthError("");
  };

  const handleSendWorkout = () => {
    if (!currentUser || currentUser.role !== "PROFESSOR") return;
    const { studentEmail, exercises } = uploadWorkoutState;
    
    if (!studentEmail || exercises.length === 0) {
      setAuthError("Preencha todos os dados e adicione pelo menos um exercício.");
      return;
    }

    setAllUserGuidedWorkouts(prev => ({
      ...prev,
      [studentEmail]: exercises
    }));

    navigateTo("home");
  };

  const handleUpdateExercise = (id: string, subModuleTitle: string, updates: Partial<Exercise>) => {
    if (!currentUser) return;
    setAllUserExercises(prev => {
      const userEx = prev[currentUser.email] || {};
      const subEx = userEx[subModuleTitle] || [];
      const updatedSubEx = subEx.map(ex => ex.id === id ? { ...ex, ...updates } : ex);
      return {
        ...prev,
        [currentUser.email]: {
          ...userEx,
          [subModuleTitle]: updatedSubEx
        }
      };
    });
  };

  const handleDeleteExercise = (id: string, subModuleTitle: string) => {
    if (!currentUser) return;
    setAllUserExercises(prev => {
      const userEx = prev[currentUser.email] || {};
      const subEx = userEx[subModuleTitle] || [];
      const updatedSubEx = subEx.filter(ex => ex.id !== id);
      return {
        ...prev,
        [currentUser.email]: {
          ...userEx,
          [subModuleTitle]: updatedSubEx
        }
      };
    });
  };

  const handleFinishWorkout = () => {
    if (!currentUser || !activeSubModule) return;
    const currentExercises = exercises[activeSubModule] || [];
    if (currentExercises.length === 0) return;

    const now = new Date();
    const newSession: WorkoutSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      exercises: [...currentExercises]
    };

    setAllUserHistory(prev => {
      const userHistory = prev[currentUser.email] || {};
      const subHistory = userHistory[activeSubModule] || [];
      return {
        ...prev,
        [currentUser.email]: {
          ...userHistory,
          [activeSubModule]: [newSession, ...subHistory]
        }
      };
    });

    // Clear current exercises for this submodule
    setAllUserExercises(prev => {
      const userEx = prev[currentUser.email] || {};
      return {
        ...prev,
        [currentUser.email]: {
          ...userEx,
          [activeSubModule]: []
        }
      };
    });

    navigateTo("home");
    alert("Treino finalizado e salvo no histórico!");
  };

  const handleClearHistory = () => {
    setShowClearHistoryConfirm(true);
  };

  const confirmClearHistory = () => {
    if (!currentUser || !activeSubModule) return;

    setAllUserHistory(prev => {
      const userHistory = prev[currentUser.email] || {};
      return {
        ...prev,
        [currentUser.email]: {
          ...userHistory,
          [activeSubModule]: []
        }
      };
    });
    setShowClearHistoryConfirm(false);
  };

  const handleDeleteHistorySession = (sessionId: string) => {
    setSessionToDelete(sessionId);
  };

  const confirmDeleteSession = () => {
    if (!currentUser || !activeSubModule || !sessionToDelete) return;

    setAllUserHistory(prev => {
      const userHistory = prev[currentUser.email] || {};
      const subHistory = userHistory[activeSubModule] || [];
      const updatedSubHistory = subHistory.filter(s => s.id !== sessionToDelete);
      return {
        ...prev,
        [currentUser.email]: {
          ...userHistory,
          [activeSubModule]: updatedSubHistory
        }
      };
    });
    setSessionToDelete(null);
  };

  const handleSaveExercise = () => {
    if (!exerciseForm.name.trim() || !currentUser) return;

    const now = new Date();
    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      type: exerciseForm.type,
      name: exerciseForm.name,
      weight: exerciseForm.weight,
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setAllUserExercises(prev => {
      const userEx = prev[currentUser.email] || {};
      const subEx = userEx[activeSubModule] || [];
      return {
        ...prev,
        [currentUser.email]: {
          ...userEx,
          [activeSubModule]: [...subEx, newExercise]
        }
      };
    });

    navigateTo("submodule-detail");
  };

  // Get unique muscle groups for the active submodule
  const getUniqueMuscleGroups = (): string[] => {
    if (!currentUser) return [];
    const submoduleExercises = (allUserExercises[currentUser.email]?.[activeSubModule]) || [];
    const groups = submoduleExercises.map(ex => ex.type);
    return [...new Set(groups)] as string[];
  };

  const muscleGroups = [
    "Peito", "Costas", "Pernas", "Ombros", 
    "Bíceps", "Tríceps", "Antebraço", "Abdominais", 
    "Cardio", "Outros"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-black selection:bg-brand-red/30">
      <Header 
        onLogoClick={() => currentUser ? navigateTo("home") : navigateTo("auth-role")} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onProfileClick={() => navigateTo("profile")}
      />

      <main className="flex-1 pt-24 px-6 pb-12 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {currentScreen === "auth-role" && (
            <motion.div
              key="auth-role"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Bem-vindo ao LOAD-X</h2>
                <p className="text-white/40 text-sm">Escolha seu perfil para continuar</p>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedRole("ATLETA");
                    navigateTo("auth-choice");
                  }}
                  className="w-full p-8 bg-brand-gray border border-brand-red/20 rounded-3xl flex flex-col items-center gap-4 group hover:border-brand-red transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all">
                    <Dumbbell className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-black text-white uppercase tracking-widest">Atleta</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Treine e evolua</span>
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedRole("PROFESSOR");
                    navigateTo("auth-choice");
                  }}
                  className="w-full p-8 bg-brand-gray border border-brand-red/20 rounded-3xl flex flex-col items-center gap-4 group hover:border-brand-red transition-all"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <span className="block text-lg font-black text-white uppercase tracking-widest">Professor</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Gerencie seus alunos</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentScreen === "auth-choice" && (
            <motion.div
              key="auth-choice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigateTo("auth-role")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Acesso {selectedRole === "PROFESSOR" ? "Professor" : "Atleta"}</h2>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo("auth-register")}
                  className="w-full p-6 bg-brand-red rounded-2xl flex items-center justify-between group shadow-[0_0_20px_rgba(255,28,28,0.2)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white uppercase tracking-widest">Criar Conta</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo("auth-login")}
                  className="w-full p-6 bg-brand-gray border border-white/5 rounded-2xl flex items-center justify-between group hover:border-brand-red/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white uppercase tracking-widest">Fazer Login</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/20" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentScreen === "auth-register" && (
            <motion.div
              key="auth-register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigateTo("auth-choice")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Criar Conta {selectedRole === "PROFESSOR" ? "Professor" : "Atleta"}</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Nome</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input 
                        type="text"
                        placeholder="Seu nome"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        className="w-full bg-brand-gray border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {selectedRole === "PROFESSOR" && (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Sobrenome</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                          type="text"
                          placeholder="Seu sobrenome"
                          value={authForm.lastName}
                          onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                          className="w-full bg-brand-gray border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="email"
                      placeholder="seu@email.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full bg-brand-gray border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {selectedRole === "PROFESSOR" && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">CREF</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input 
                        type="text"
                        placeholder="000000-G/UF"
                        value={authForm.cref}
                        onChange={(e) => setAuthForm({ ...authForm, cref: e.target.value })}
                        className="w-full bg-brand-gray border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full bg-brand-gray border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {selectedRole === "PROFESSOR" && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={authForm.confirmPassword}
                        onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                        className="w-full bg-brand-gray border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {authError && <p className="text-brand-red text-xs font-bold text-center">{authError}</p>}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  className="w-full py-4 bg-brand-red rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,28,28,0.3)] mt-4"
                >
                  Cadastrar
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentScreen === "auth-login" && (
            <motion.div
              key="auth-login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigateTo("auth-choice")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Fazer Login</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="email"
                      placeholder="seu@email.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full bg-brand-gray border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full bg-brand-gray border border-white/10 rounded-xl p-4 pl-12 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {authError && <p className="text-brand-red text-xs font-bold text-center">{authError}</p>}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className="w-full py-4 bg-brand-red rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,28,28,0.3)] mt-4"
                >
                  Entrar
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentScreen === "profile" && currentUser && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigateTo("home")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Meu Perfil</h2>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-brand-gray border-2 border-brand-red/30 overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(255,28,28,0.15)]">
                    {currentUser.photo ? (
                      <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-12 h-12 text-white/20" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-brand-red rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpdatePhoto} />
                  </label>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">{currentUser.name}</h3>
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20">
                      <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">{currentUser.role}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-white/30 tracking-widest">{currentUser.serialNumber || "#------"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-brand-gray border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-white/30" />
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">E-mail</span>
                    </div>
                    <span className="text-sm font-medium text-white/80">{currentUser.email}</span>
                  </div>
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-white/30" />
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total de Treinos</span>
                    </div>
                    <span className="text-sm font-medium text-white/80">
                      {Object.values(allUserExercises[currentUser.email] || {}).reduce((acc: number, curr) => acc + (curr as Exercise[]).length, 0)}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full py-4 bg-brand-gray border border-white/10 rounded-xl font-bold uppercase tracking-widest text-xs text-brand-red hover:bg-brand-red/5 hover:border-brand-red/30 transition-all"
                >
                  Sair da Conta
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentScreen === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90 mb-6">
                  {currentUser?.role === "PROFESSOR" ? "Painel do Professor" : "Módulos"}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {currentUser?.role === "PROFESSOR" ? (
                    <>
                      <ModuleCard 
                        title="Alunos" 
                        icon={<Users className="w-8 h-8" />} 
                        isSelected={false}
                        onClick={() => navigateTo("students-view")}
                      />
                      <ModuleCard 
                        title="Subir Treino" 
                        icon={<Upload className="w-8 h-8" />} 
                        isSelected={false}
                        onClick={() => navigateTo("upload-workout-student-select")}
                      />
                    </>
                  ) : (
                    <>
                      <ModuleCard 
                        title="Low Volume" 
                        icon={<Zap className="w-8 h-8" />} 
                        isSelected={selectedModule === "low-volume"}
                        onClick={() => {
                          setSelectedModule("low-volume");
                          setTimeout(() => navigateTo("low-volume"), 300);
                        }}
                      />
                      <ModuleCard 
                        title="Modo Free" 
                        icon={<Shield className="w-8 h-8" />} 
                        isSelected={selectedModule === "modo-free"}
                        onClick={() => {
                          setSelectedModule("modo-free");
                          setTimeout(() => navigateTo("free-mode"), 300);
                        }}
                      />
                    </>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {currentScreen === "free-mode" && (
            <motion.div
              key="free-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <button 
                  onClick={() => navigateTo("home")}
                  className="p-1 -ml-2 hover:bg-brand-gray rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                  Modo Free
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SubModuleCard 
                  title="Treino Guiado" 
                  icon={<Zap className="w-7 h-7" />} 
                  onClick={() => navigateTo("guided-workout-view")}
                />
                <SubModuleCard 
                  title="Tradicional" 
                  icon={<Dumbbell className="w-7 h-7" />} 
                  onClick={() => navigateTo("submodule-detail", "Tradicional")}
                />
              </div>
            </motion.div>
          )}

          {currentScreen === "low-volume" && (
            <motion.div
              key="low-volume"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <button 
                  onClick={() => navigateTo("home")}
                  className="p-1 -ml-2 hover:bg-brand-gray rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                  Low Volume
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SubModuleCard 
                  title="Full Body" 
                  icon={<Dumbbell className="w-7 h-7" />} 
                  onClick={() => navigateTo("submodule-detail", "Full Body")}
                />
                <SubModuleCard 
                  title="PPL" 
                  icon={<RotateCcw className="w-7 h-7" />} 
                  onClick={() => navigateTo("submodule-detail", "PPL")}
                />
                <SubModuleCard 
                  title="Upper e Lower" 
                  icon={<Layers className="w-7 h-7" />} 
                  onClick={() => navigateTo("submodule-detail", "Upper e Lower")}
                />
                <SubModuleCard 
                  title="Torso e Limbs" 
                  icon={<UserIcon className="w-7 h-7" />} 
                  onClick={() => navigateTo("submodule-detail", "Torso e Limbs")}
                />
              </div>
            </motion.div>
          )}

          {currentScreen === "submodule-detail" && (
            <motion.div
              key="submodule-detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => activeSubModule === "Tradicional" ? navigateTo("free-mode") : navigateTo("low-volume")}
                    className="p-1 -ml-2 hover:bg-brand-gray rounded-full transition-colors text-white/50 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                    {activeSubModule}
                  </h2>
                </div>
                <button
                  onClick={() => navigateTo("history-view")}
                  className="p-2 bg-brand-gray border border-white/5 rounded-xl text-white/50 hover:text-brand-red hover:border-brand-red/30 transition-all group"
                >
                  <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="space-y-4">
                <motion.button
                  onClick={() => navigateTo("add-exercise")}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-8 bg-brand-gray border border-dashed border-brand-red/40 rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-brand-red transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
                    Adicionar Módulo
                  </span>
                </motion.button>

                {/* List of muscle groups that have exercises */}
                <div className="space-y-3">
                  {getUniqueMuscleGroups().map((group) => {
                    const groupExercises = exercises[activeSubModule].filter(ex => ex.type === group);
                    const latest = groupExercises[groupExercises.length - 1];
                    
                    return (
                      <motion.button
                        key={group}
                        onClick={() => navigateTo("muscle-group-view", "", group)}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-brand-gray border border-white/5 p-5 rounded-2xl flex items-center justify-between group transition-all hover:border-brand-red/30"
                      >
                        <div className="flex flex-col text-left">
                          <motion.span 
                            layoutId={`group-title-${group}`}
                            className="text-base font-bold text-white mb-1 group-hover:text-brand-red transition-colors uppercase tracking-wider"
                          >
                            {group}
                          </motion.span>
                          <div className="flex items-center gap-3 text-[10px] text-white/40 font-medium uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {latest.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {latest.time}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-red transition-colors" />
                      </motion.button>
                    );
                  })}
                </div>

                {(exercises[activeSubModule]?.length || 0) > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinishWorkout}
                    className="w-full py-4 mt-8 bg-brand-red/10 border border-brand-red/30 rounded-xl font-bold uppercase tracking-widest text-xs text-brand-red hover:bg-brand-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,28,28,0.1)] hover:shadow-[0_0_20px_rgba(255,28,28,0.3)]"
                  >
                    Finalizar Treino
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {currentScreen === "muscle-group-view" && (
            <motion.div
              key="muscle-group-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-8">
                <button 
                  onClick={() => navigateTo("submodule-detail")}
                  className="p-1 -ml-2 hover:bg-brand-gray rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <motion.h2 
                  className="text-sm font-bold uppercase tracking-[0.2em] text-white/90"
                  layoutId={`group-title-${activeMuscleGroup}`}
                >
                  {activeMuscleGroup}
                </motion.h2>
              </div>

              <div className="space-y-4">
                {exercises[activeSubModule]
                  ?.filter(ex => ex.type === activeMuscleGroup)
                  .map((ex) => {
                    const fullList = exercises[activeSubModule] || [];
                    const indexInFullList = fullList.findIndex(e => e.id === ex.id);
                    return (
                      <RetractableExerciseCard 
                        key={ex.id} 
                        exercise={ex} 
                        moduleTitle={activeSubModule}
                        isFirst={indexInFullList === 0}
                        onUpdate={handleUpdateExercise}
                        onDelete={handleDeleteExercise}
                      />
                    );
                  })}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setExerciseForm({ ...exerciseForm, type: activeMuscleGroup });
                    setAddStep(2);
                    setCurrentScreen("add-exercise");
                  }}
                  className="w-full p-6 bg-brand-gray/50 border border-dashed border-white/10 rounded-[32px] flex items-center justify-center gap-3 group hover:border-brand-red/50 transition-all mt-4"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center group-hover:bg-brand-red/20 transition-colors">
                    <Plus className="w-4 h-4 text-brand-red" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
                    Adicionar Exercício
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentScreen === "upload-workout-student-select" && currentUser && (
            <motion.div
              key="upload-workout-student-select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-8">
                <button onClick={() => navigateTo("home")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Selecionar Aluno</h2>
              </div>

              <div className="space-y-4">
                {(professorStudents[currentUser.email] || []).map((student, idx) => {
                  const studentData = users.find(u => u.serialNumber === student.serialNumber);
                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setUploadWorkoutState({ ...uploadWorkoutState, studentEmail: studentData?.email || "" });
                        navigateTo("upload-workout-style-select");
                      }}
                      className="w-full bg-brand-gray border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-brand-red/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-black border border-white/10 overflow-hidden flex items-center justify-center">
                          {studentData?.photo ? (
                            <img src={studentData.photo} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-white/20" />
                          )}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-white uppercase tracking-wider">{student.name}</span>
                          <span className="text-[10px] font-mono text-white/30 tracking-widest">{student.serialNumber}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-red transition-colors" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {currentScreen === "upload-workout-style-select" && (
            <motion.div
              key="upload-workout-style-select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-8">
                <button onClick={() => navigateTo("upload-workout-student-select")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Estilo de Treino</h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <ModuleCard 
                  title="Low Volume" 
                  icon={<Zap className="w-8 h-8" />} 
                  isSelected={uploadWorkoutState.style === "low-volume"}
                  onClick={() => {
                    setUploadWorkoutState({ ...uploadWorkoutState, style: "low-volume" });
                    navigateTo("upload-workout-submodule-select");
                  }}
                />
                <ModuleCard 
                  title="Modo Free" 
                  icon={<Shield className="w-8 h-8" />} 
                  isSelected={uploadWorkoutState.style === "modo-free"}
                  onClick={() => {
                    setUploadWorkoutState({ ...uploadWorkoutState, style: "modo-free", subModule: "Tradicional" });
                    navigateTo("upload-workout-muscle-select");
                  }}
                />
              </div>
            </motion.div>
          )}

          {currentScreen === "upload-workout-submodule-select" && (
            <motion.div
              key="upload-workout-submodule-select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-8">
                <button onClick={() => navigateTo("upload-workout-style-select")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Selecione o Treino</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ModuleCard 
                  title="Full Body" 
                  icon={<Dumbbell className="w-8 h-8" />} 
                  isSelected={uploadWorkoutState.subModule === "Full Body"}
                  onClick={() => {
                    setUploadWorkoutState({ ...uploadWorkoutState, subModule: "Full Body" });
                    navigateTo("upload-workout-muscle-select");
                  }}
                />
                <ModuleCard 
                  title="PPL" 
                  icon={<RotateCcw className="w-8 h-8" />} 
                  isSelected={uploadWorkoutState.subModule === "PPL"}
                  onClick={() => {
                    setUploadWorkoutState({ ...uploadWorkoutState, subModule: "PPL" });
                    navigateTo("upload-workout-muscle-select");
                  }}
                />
                <ModuleCard 
                  title="Upper e Lower" 
                  icon={<Layers className="w-8 h-8" />} 
                  isSelected={uploadWorkoutState.subModule === "Upper e Lower"}
                  onClick={() => {
                    setUploadWorkoutState({ ...uploadWorkoutState, subModule: "Upper e Lower" });
                    navigateTo("upload-workout-muscle-select");
                  }}
                />
                <ModuleCard 
                  title="Torso e Limbs" 
                  icon={<UserIcon className="w-8 h-8" />} 
                  isSelected={uploadWorkoutState.subModule === "Torso e Limbs"}
                  onClick={() => {
                    setUploadWorkoutState({ ...uploadWorkoutState, subModule: "Torso e Limbs" });
                    navigateTo("upload-workout-muscle-select");
                  }}
                />
              </div>
            </motion.div>
          )}

          {currentScreen === "upload-workout-muscle-select" && (
            <motion.div
              key="upload-workout-muscle-select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-8">
                <button 
                  onClick={() => {
                    if (uploadWorkoutState.style === "low-volume") navigateTo("upload-workout-submodule-select");
                    else navigateTo("upload-workout-style-select");
                  }} 
                  className="p-1 -ml-2 text-white/50 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Tipo de Treino</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {["Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps", "Antebraço", "Abdominais", "Cardio", "Outros"].map((muscle) => (
                  <button
                    key={muscle}
                    onClick={() => {
                      setUploadWorkoutState({ ...uploadWorkoutState, muscleGroup: muscle });
                      navigateTo("upload-workout-exercise-add");
                    }}
                    className={`p-4 rounded-2xl border transition-all text-center ${
                      uploadWorkoutState.muscleGroup === muscle 
                        ? "bg-brand-red border-brand-red text-white" 
                        : "bg-brand-gray border-white/5 text-white/60 hover:border-brand-red/30"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">{muscle}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentScreen === "upload-workout-exercise-add" && (
            <motion.div
              key="upload-workout-exercise-add"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigateTo("upload-workout-muscle-select")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Adicionar Exercícios</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20">
                  <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">{uploadWorkoutState.muscleGroup}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-brand-gray border border-white/5 rounded-2xl space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Nome do Exercício</label>
                    <input 
                      type="text"
                      placeholder="Ex: Supino Reto"
                      value={guidedExerciseForm.name}
                      onChange={(e) => setGuidedExerciseForm({ ...guidedExerciseForm, name: e.target.value })}
                      className="w-full bg-brand-black border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (!guidedExerciseForm.name) return;
                      const isFirst = uploadWorkoutState.exercises.length === 0;
                      const progression = getProgression(uploadWorkoutState.subModule, isFirst);
                      
                      const newEx: GuidedExercise = {
                        id: Math.random().toString(36).substr(2, 9),
                        type: uploadWorkoutState.muscleGroup,
                        name: guidedExerciseForm.name,
                        style: uploadWorkoutState.style,
                        subModule: uploadWorkoutState.subModule,
                        progression: progression,
                        professorEmail: currentUser?.email || ""
                      };
                      setUploadWorkoutState({ ...uploadWorkoutState, exercises: [...uploadWorkoutState.exercises, newEx] });
                      setGuidedExerciseForm({ name: "" });
                    }}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
                  >
                    Salvar Exercício
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Lista de Exercícios</h3>
                  {uploadWorkoutState.exercises.map((ex) => (
                    <div key={ex.id} className="p-4 bg-brand-gray/30 border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{ex.name}</span>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{ex.progression.length} Séries</span>
                      </div>
                      <button 
                        onClick={() => setUploadWorkoutState({ ...uploadWorkoutState, exercises: uploadWorkoutState.exercises.filter(e => e.id !== ex.id) })}
                        className="p-2 text-white/20 hover:text-brand-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {authError && <p className="text-brand-red text-[10px] font-bold text-center">{authError}</p>}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendWorkout}
                  className="w-full py-4 bg-brand-red rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,28,28,0.3)]"
                >
                  Enviar Treino
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentScreen === "guided-workout-view" && currentUser && (
            <motion.div
              key="guided-workout-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigateTo("home")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Treino Guiado</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(
                  (allUserGuidedWorkouts[currentUser.email] || []).reduce((acc, ex) => {
                    if (!acc[ex.type]) acc[ex.type] = [];
                    acc[ex.type].push(ex);
                    return acc;
                  }, {} as Record<string, GuidedExercise[]>)
                ).map(([muscle, exercises]) => (
                  <button
                    key={muscle}
                    onClick={() => {
                      setSelectedGuidedWorkout({ muscle, exercises });
                      navigateTo("guided-workout-detail");
                    }}
                    className="p-6 bg-brand-gray border border-white/5 rounded-[32px] flex flex-col items-center gap-4 hover:border-brand-red/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center group-hover:bg-brand-red/20 transition-colors">
                      <Dumbbell className="w-6 h-6 text-brand-red" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/80">{muscle}</span>
                  </button>
                ))}

                {(!allUserGuidedWorkouts[currentUser.email] || allUserGuidedWorkouts[currentUser.email].length === 0) && (
                  <div className="col-span-2 py-20 text-center">
                    <Activity className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-xs uppercase tracking-widest text-white/30 font-bold">
                      Nenhum treino guiado disponível
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentScreen === "guided-workout-detail" && selectedGuidedWorkout && currentUser && (
            <motion.div
              key="guided-workout-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigateTo("guided-workout-view")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">{selectedGuidedWorkout.muscle}</h2>
              </div>

              <div className="space-y-6">
                {selectedGuidedWorkout.exercises.map((ex) => (
                  <RetractableGuidedExerciseCard
                    key={ex.id}
                    exercise={ex}
                    onUpdate={(id, updates) => {
                      setAllUserGuidedWorkouts(prev => {
                        const userWorkouts = prev[currentUser.email] || [];
                        const updated = userWorkouts.map(w => w.id === id ? { ...w, ...updates } : w);
                        return { ...prev, [currentUser.email]: updated };
                      });
                      // Update local state too
                      setSelectedGuidedWorkout(prev => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          exercises: prev.exercises.map(w => w.id === id ? { ...w, ...updates } : w)
                        };
                      });
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {currentScreen === "students-view" && currentUser && (
            <motion.div
              key="students-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigateTo("home")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Meus Alunos</h2>
                </div>
                <button 
                  onClick={() => setShowAddStudent(true)}
                  className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {(professorStudents[currentUser.email] || []).map((student, idx) => {
                  const studentData = users.find(u => u.serialNumber === student.serialNumber);
                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (studentData) {
                          setSelectedStudent(studentData);
                          navigateTo("student-profile-view");
                        }
                      }}
                      className="w-full bg-brand-gray border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-brand-red/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-black border border-white/10 overflow-hidden flex items-center justify-center">
                          {studentData?.photo ? (
                            <img src={studentData.photo} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-white/20" />
                          )}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-white uppercase tracking-wider">{student.name}</span>
                          <span className="text-[10px] font-mono text-white/30 tracking-widest">{student.serialNumber}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-red transition-colors" />
                    </motion.button>
                  );
                })}

                {(!professorStudents[currentUser.email] || professorStudents[currentUser.email].length === 0) && (
                  <div className="py-20 text-center">
                    <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-xs uppercase tracking-widest text-white/30 font-bold">
                      Nenhum aluno cadastrado
                    </p>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {showAddStudent && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="w-full max-w-sm bg-brand-gray border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl"
                    >
                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Novo Aluno</h3>
                        <p className="text-xs text-white/40">Insira os dados do aluno para vincular</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Nome do Aluno</label>
                          <input 
                            type="text"
                            placeholder="Ex: João Silva"
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                            className="w-full bg-brand-black border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Número de Série (#)</label>
                          <input 
                            type="text"
                            placeholder="#ABC123"
                            value={studentForm.serialNumber}
                            onChange={(e) => setStudentForm({ ...studentForm, serialNumber: e.target.value.toUpperCase() })}
                            className="w-full bg-brand-black border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      {authError && <p className="text-brand-red text-[10px] font-bold text-center">{authError}</p>}

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            setShowAddStudent(false);
                            setAuthError("");
                          }}
                          className="py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleAddStudent}
                          className="py-4 bg-brand-red rounded-2xl text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,28,28,0.3)] hover:shadow-[0_0_30px_rgba(255,28,28,0.5)] transition-all"
                        >
                          Cadastrar
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentScreen === "student-profile-view" && selectedStudent && (
            <motion.div
              key="student-profile-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => navigateTo("students-view")} className="p-1 -ml-2 text-white/50 hover:text-white transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Perfil do Aluno</h2>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-brand-gray border-2 border-brand-red/30 overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(255,28,28,0.15)]">
                  {selectedStudent.photo ? (
                    <img src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-white/20" />
                  )}
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">{selectedStudent.name}</h3>
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/20">
                      <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em]">{selectedStudent.role}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-white/30 tracking-widest">{selectedStudent.serialNumber}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-brand-gray border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-white/30" />
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">E-mail</span>
                    </div>
                    <span className="text-sm font-medium text-white/80">{selectedStudent.email}</span>
                  </div>
                  <div className="h-px bg-white/5 w-full" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-white/30" />
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total de Treinos</span>
                    </div>
                    <span className="text-sm font-medium text-white/80">
                      {Object.values(allUserExercises[selectedStudent.email] || {}).reduce((acc: number, curr) => acc + (curr as Exercise[]).length, 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const studentWorkouts = allUserGuidedWorkouts[selectedStudent.email] || [];
                    if (studentWorkouts.length > 0) {
                      const firstEx = studentWorkouts[0];
                      setUploadWorkoutState({
                        studentEmail: selectedStudent.email,
                        style: firstEx.style,
                        subModule: firstEx.subModule,
                        muscleGroup: firstEx.type,
                        exercises: studentWorkouts
                      });
                      navigateTo("upload-workout-exercise-add");
                    } else {
                      setUploadWorkoutState({
                        studentEmail: selectedStudent.email,
                        style: "",
                        subModule: "",
                        muscleGroup: "",
                        exercises: []
                      });
                      navigateTo("upload-workout-style-select");
                    }
                  }}
                  className="w-full py-4 bg-brand-red rounded-xl font-bold uppercase tracking-widest text-xs text-white shadow-[0_0_20px_rgba(255,28,28,0.2)] hover:shadow-[0_0_30px_rgba(255,28,28,0.4)] transition-all"
                >
                  {(allUserGuidedWorkouts[selectedStudent.email] || []).length > 0 ? "Editar Treino" : "Lançar Treino"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {currentScreen === "history-view" && (
            <motion.div
              key="history-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-8">
                <button 
                  onClick={() => navigateTo("submodule-detail")}
                  className="p-1 -ml-2 hover:bg-brand-gray rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                  Histórico: {activeSubModule}
                </h2>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 relative mr-4">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input 
                    type="date"
                    value={historyFilterDate}
                    onChange={(e) => setHistoryFilterDate(e.target.value)}
                    className="w-full bg-brand-gray border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-brand-red/50 outline-none transition-all appearance-none"
                  />
                </div>
                {(history[activeSubModule] || []).length > 0 && (
                  <button 
                    onClick={handleClearHistory}
                    className="px-4 py-3 bg-brand-red/10 border border-brand-red/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-red hover:bg-brand-red hover:text-white transition-all"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {historyFilterDate && (
                <div className="mb-6">
                  <button 
                    onClick={() => setHistoryFilterDate("")}
                    className="text-[10px] uppercase tracking-widest text-brand-red font-bold"
                  >
                    Limpar Filtro
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {(history[activeSubModule] || [])
                  .filter(session => !historyFilterDate || session.date === new Date(historyFilterDate + 'T00:00:00').toLocaleDateString('pt-BR'))
                  .map((session) => {
                    const sessionGroups = [...new Set(session.exercises.map(ex => ex.type))];
                    const displayName = sessionGroups.length > 0 ? sessionGroups.join(' + ') : activeSubModule;
                    
                    let longPressTimer: any;

                    return (
                      <motion.button
                        key={session.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedHistorySession(session);
                          navigateTo("history-detail");
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistorySession(session.id);
                        }}
                        onPointerDown={() => {
                          longPressTimer = setTimeout(() => {
                            handleDeleteHistorySession(session.id);
                          }, 800);
                        }}
                        onPointerUp={() => clearTimeout(longPressTimer)}
                        onPointerLeave={() => clearTimeout(longPressTimer)}
                        className="w-full bg-brand-gray border border-white/5 p-5 rounded-2xl flex items-center justify-between group transition-all hover:border-brand-red/30 select-none"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-white mb-1 group-hover:text-brand-red transition-colors uppercase tracking-wider">
                            {displayName} - {session.date}
                          </span>
                          <div className="flex items-center gap-3 text-[10px] text-white/40 font-medium uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Dumbbell className="w-3 h-3" />
                              {session.exercises.length} Exercícios
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-red transition-colors" />
                      </motion.button>
                    );
                  })}

                {(!history[activeSubModule] || history[activeSubModule].length === 0) && (
                  <div className="py-20 text-center">
                    <Clock className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-xs uppercase tracking-widest text-white/30 font-bold">
                      Nenhum histórico encontrado
                    </p>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {showClearHistoryConfirm && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="w-full max-w-sm bg-brand-gray border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl"
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red">
                          <Trash2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Limpar Histórico?</h3>
                          <p className="text-sm text-white/40 leading-relaxed">
                            Deseja realmente limpar todo o histórico de <span className="text-white font-bold">{activeSubModule}</span>? Esta ação não pode ser desfeita.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setShowClearHistoryConfirm(false)}
                          className="py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={confirmClearHistory}
                          className="py-4 bg-brand-red rounded-2xl text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,28,28,0.3)] hover:shadow-[0_0_30px_rgba(255,28,28,0.5)] transition-all"
                        >
                          Confirmar
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {sessionToDelete && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="w-full max-w-sm bg-brand-gray border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl"
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red">
                          <Trash2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Excluir Treino?</h3>
                          <p className="text-sm text-white/40 leading-relaxed">
                            Deseja realmente excluir este treino do histórico? Esta ação não pode ser desfeita.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setSessionToDelete(null)}
                          className="py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={confirmDeleteSession}
                          className="py-4 bg-brand-red rounded-2xl text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,28,28,0.3)] hover:shadow-[0_0_30px_rgba(255,28,28,0.5)] transition-all"
                        >
                          Confirmar
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {currentScreen === "history-detail" && selectedHistorySession && (
            <motion.div
              key="history-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-8">
                <button 
                  onClick={() => navigateTo("history-view")}
                  className="p-1 -ml-2 hover:bg-brand-gray rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                    Detalhes do Treino
                  </h2>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                    {selectedHistorySession.date} às {selectedHistorySession.time}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {selectedHistorySession.exercises.map((ex, idx) => {
                  const progression = getProgression(activeSubModule, idx === 0);
                  return (
                    <div 
                      key={ex.id}
                      className="bg-brand-gray border border-white/5 p-6 rounded-[32px] space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-red font-black mb-1">
                            {ex.type}
                          </span>
                          <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                            {ex.name}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">
                            Carga Máxima
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white leading-none">
                              {ex.weight}
                            </span>
                            <span className="text-xs font-bold text-white/40 uppercase">KG</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 pt-4 border-t border-white/5">
                        {(['warmup', 'recognition', 'work'] as const).map(type => {
                          const groupSeries = progression
                            .map((s, i) => ({ ...s, index: i }))
                            .filter(s => s.type === type);
                          
                          if (groupSeries.length === 0) return null;

                          return (
                            <SeriesGroup 
                              key={type} 
                              type={type} 
                              series={groupSeries} 
                              maxWeight={ex.weight} 
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {currentScreen === "add-exercise" && (
            <motion.div
              key="add-exercise"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-8">
                <button 
                  onClick={() => addStep === 1 ? navigateTo("submodule-detail") : setAddStep(1)}
                  className="p-1 -ml-2 hover:bg-brand-gray rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">
                  {addStep === 1 ? "Selecione o Treino" : "Detalhes do Exercício"}
                </h2>
              </div>

              {addStep === 1 ? (
                <div className="grid grid-cols-2 gap-3">
                  {muscleGroups.map((group) => (
                    <motion.button
                      key={group}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setExerciseForm({ ...exerciseForm, type: group });
                        setAddStep(2);
                      }}
                      className="p-4 bg-brand-gray border border-white/5 rounded-xl text-sm font-medium text-white/80 hover:border-brand-red/50 hover:text-white transition-all"
                    >
                      {group}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">
                        Nome do Exercício
                      </label>
                      <input 
                        type="text"
                        autoFocus
                        placeholder="Ex: Supino Reto"
                        value={exerciseForm.name}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                        className="w-full bg-brand-gray border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:border-brand-red focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 ml-1 font-bold">
                        Carga Máxima
                      </label>
                      <div className="relative h-44 bg-brand-gray border border-white/10 rounded-[32px] flex items-center justify-center overflow-hidden p-6 focus-within:border-brand-red transition-colors">
                        {/* Top Left Label */}
                        <div className="absolute top-6 left-8 flex flex-col">
                          <span className="text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold mb-1">
                            Registro de Carga
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-red font-black">
                            {exerciseForm.type}
                          </span>
                        </div>

                        {/* Center Input Area */}
                        <div className="flex items-center justify-center gap-2">
                          <input 
                            type="number"
                            placeholder="0"
                            value={exerciseForm.weight}
                            onChange={(e) => setExerciseForm({ ...exerciseForm, weight: e.target.value })}
                            className="w-48 bg-transparent text-7xl font-black text-white text-center focus:outline-none placeholder:text-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none leading-tight"
                          />
                          <span className="text-sm font-bold text-brand-red uppercase tracking-widest mt-4">
                            KG
                          </span>
                        </div>

                        {/* Bottom Right Preview */}
                        <div className="absolute bottom-6 right-8 text-right">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">
                            Exercício
                          </span>
                          <span className="text-sm font-bold text-white uppercase tracking-wider">
                            {exerciseForm.name || "---"}
                          </span>
                        </div>
                      </div>

                      {/* Progression Preview in Add Screen */}
                      {exerciseForm.weight && getProgression(activeSubModule, (exercises[activeSubModule]?.length || 0) === 0).length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-brand-gray border border-white/5 rounded-2xl p-6 space-y-8"
                        >
                          {(['warmup', 'recognition', 'work'] as const).map(type => {
                            const progression = getProgression(activeSubModule, (exercises[activeSubModule]?.length || 0) === 0);
                            const groupSeries = progression
                              .map((s, i) => ({ ...s, index: i }))
                              .filter(s => s.type === type);
                            
                            if (groupSeries.length === 0) return null;

                            return (
                              <SeriesGroup 
                                key={type} 
                                type={type} 
                                series={groupSeries} 
                                maxWeight={exerciseForm.weight} 
                              />
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveExercise}
                    disabled={!exerciseForm.name.trim()}
                    className="w-full py-4 bg-brand-red rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(255,28,28,0.3)] disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    Salvar Exercício
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
          R&A Company ®
        </p>
      </footer>
    </div>
  );
}

function Header({ onLogoClick, currentUser, onLogout, onProfileClick }: { onLogoClick: () => void; currentUser: UserAccount | null; onLogout: () => void; onProfileClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-black px-6 py-4 flex items-center justify-between border-b border-brand-gray">
      <button onClick={onLogoClick} className="flex items-center gap-3 active:opacity-70 transition-opacity">
        <div className="w-8 h-8 bg-brand-red rounded-sm flex items-center justify-center shadow-[0_0_10px_rgba(255,28,28,0.5)]">
          <Activity className="text-white w-5 h-5" />
        </div>
        <div className="flex flex-col items-start leading-none">
          <h1 className="text-xl font-bold tracking-tighter text-white">
            LOAD <span className="text-brand-red">- X</span>
          </h1>
        </div>
      </button>
      
      <div className="flex items-center gap-2">
        {currentUser && (
          <button 
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full bg-brand-gray border border-white/10 overflow-hidden flex items-center justify-center hover:border-brand-red/50 transition-colors"
          >
            {currentUser.photo ? (
              <img src={currentUser.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-white/40" />
            )}
          </button>
        )}
        {currentUser && (
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-brand-gray rounded-full transition-colors group"
          >
            <LogOut className="w-5 h-5 text-white/70 group-hover:text-brand-red transition-colors" />
          </button>
        )}
      </div>
    </header>
  );
}

interface ModuleCardProps {
  key?: string | number;
  title: string;
  icon: ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

function ModuleCard({ title, icon, isSelected, onClick }: ModuleCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative aspect-square flex flex-col items-center justify-center gap-4 
        rounded-2xl transition-all duration-300 group overflow-hidden
        card-led-border
        ${isSelected 
          ? 'neon-card-glow' 
          : 'opacity-90 hover:opacity-100'}
      `}
    >
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-10 group-active:opacity-20 transition-opacity duration-500
        ${isSelected ? 'bg-brand-red' : 'bg-white'}
      `} />

      <div className={`
        transition-transform duration-500 group-hover:scale-110
        ${isSelected ? 'text-brand-red drop-shadow-[0_0_8px_rgba(255,28,28,0.6)]' : 'text-white/80'}
      `}>
        {icon}
      </div>
      
      <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isSelected ? 'text-white' : 'text-white/60'}`}>
        {title}
      </span>
    </motion.button>
  );
}

function SubModuleCard({ title, icon, onClick }: { title: string; icon: ReactNode; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className="relative aspect-square flex flex-col items-center justify-center gap-4 bg-brand-gray border border-brand-red/20 rounded-2xl transition-all duration-300 group overflow-hidden active:border-brand-red active:shadow-[0_0_15px_rgba(255,28,28,0.3)]"
    >
      <div className="absolute inset-0 bg-brand-red opacity-0 group-active:opacity-5 transition-opacity duration-300" />
      <div className="text-white/80 group-active:text-brand-red group-active:drop-shadow-[0_0_8px_rgba(255,28,28,0.4)] transition-all duration-300">
        {icon}
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
        {title}
      </span>
    </motion.button>
  );
}
