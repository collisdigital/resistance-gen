export type BodyArea = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Abs' | 'Corrective';

export type ExerciseType = 'Push' | 'Pull' | 'Legs' | 'Core' | 'Corrective' | 'Other';

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: BodyArea;
  secondaryMuscles?: BodyArea[];
  type: ExerciseType;
  description: string;
  tips: string[];
}

export const exercises: Exercise[] = [
  // CHEST
  {
    id: 'chest-weighted-dip',
    name: 'Weighted Dip',
    targetMuscle: 'Chest',
    type: 'Push',
    description: 'Perform a dip on parallel bars with added weight via a belt or vest. Lean forward slightly to target the chest.',
    tips: [
      'Lean forward to hit the chest more than triceps.',
      'Go to 90 degrees at the elbow.',
      'Control the descent.'
    ]
  },
  {
    id: 'chest-db-bench-press',
    name: 'Dumbbell Bench Press',
    targetMuscle: 'Chest',
    type: 'Push',
    description: 'Flat bench press using dumbbells. Allows for greater range of motion and independent arm stabilization.',
    tips: [
      'Bring dumbbells down deep for a stretch.',
      'Converge them slightly at the top but don’t clang them together.',
      'Keep your feet planted.'
    ]
  },
  {
    id: 'chest-crossover',
    name: 'Cable Crossover',
    targetMuscle: 'Chest',
    type: 'Push',
    description: 'Standing cable fly movement. Great for getting a peak contraction on the chest.',
    tips: [
      'Focus on crossing your hands over each other at the end.',
      'Keep a slight bend in the elbows.',
      'Don’t use momentum.'
    ]
  },
  {
    id: 'chest-incline-db-press',
    name: 'Incline Dumbbell Press',
    targetMuscle: 'Chest',
    type: 'Push',
    description: 'Bench press on an incline (approx 30 degrees) to target the upper clavicular head of the pecs.',
    tips: [
      'Low incline (30 degrees) is better than steep (45) to avoid too much front delt.',
      'Control the weights.',
      'Full range of motion.'
    ]
  },
  {
    id: 'chest-pushup',
    name: 'Pushup (Standard or Weighted)',
    targetMuscle: 'Chest',
    type: 'Push',
    description: 'The classic pushup. Add weight on back if too easy.',
    tips: [
      'Keep core tight (plank position).',
      'Elbows tucked at 45 degrees, not flared out.',
      'Full extension at top.'
    ]
  },

  // BACK
  {
    id: 'back-pullup',
    name: 'Pullup',
    targetMuscle: 'Back',
    type: 'Pull',
    description: 'Overhand grip pullup. The king of back exercises.',
    tips: [
      'Full hang at the bottom.',
      'Chin over bar at top.',
      'Drive elbows down to hips.'
    ]
  },
  {
    id: 'back-face-pull',
    name: 'Face Pull',
    targetMuscle: 'Back',
    secondaryMuscles: ['Shoulders', 'Corrective'],
    type: 'Pull',
    description: 'Cable exercise pulling rope to forehead. targets rear delts, rotator cuff, and traps. A Jeff Cavalier staple.',
    tips: [
      'Lead with the hands, not the elbows.',
      'Beat the "cheater" by externally rotating at the end.',
      'Do these every workout if possible.'
    ]
  },
  {
    id: 'back-barbell-row',
    name: 'Barbell Row',
    targetMuscle: 'Back',
    type: 'Pull',
    description: 'Bent over row with a barbell. Big compound movement for thickness.',
    tips: [
      'Keep back straight, hinge at hips.',
      'Pull to lower chest/upper stomach.',
      'Don’t yank the weight with your lower back.'
    ]
  },
  {
    id: 'back-lat-pulldown',
    name: 'Lat Pulldown',
    targetMuscle: 'Back',
    type: 'Pull',
    description: 'Vertical pulling movement using a cable machine.',
    tips: [
      'Lean back slightly.',
      'Pull bar to upper chest.',
      'Focus on using lats, not arms.'
    ]
  },
  {
    id: 'back-straight-arm-pushdown',
    name: 'Straight Arm Pushdown',
    targetMuscle: 'Back',
    type: 'Pull',
    description: 'Cable isolation exercise for the lats.',
    tips: [
      'Keep arms straight but not locked.',
      'Focus on the stretch at the top.',
      'Drive down with lats.'
    ]
  },

  // LEGS
  {
    id: 'legs-barbell-squat',
    name: 'Barbell Squat',
    targetMuscle: 'Legs',
    type: 'Legs',
    description: 'High bar or low bar back squat.',
    tips: [
      'Depth is key - break parallel.',
      'Knees track over toes.',
      'Keep chest up.'
    ]
  },
  {
    id: 'legs-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    targetMuscle: 'Legs',
    type: 'Legs',
    description: 'Single leg squat with rear foot elevated.',
    tips: [
      'Hate yourself while doing them, thank yourself later.',
      'Keep torso upright for quads, lean forward for glutes.',
      'Don’t let front knee cave in.'
    ]
  },
  {
    id: 'legs-rdl',
    name: 'Romanian Deadlift (RDL)',
    targetMuscle: 'Legs',
    type: 'Legs',
    description: 'Hip hinge movement targeting hamstrings and glutes.',
    tips: [
      'Slight bend in knees, movement comes from hips.',
      'Keep bar close to shins.',
      'Feel the stretch in hamstrings.'
    ]
  },
  {
    id: 'legs-lunge',
    name: 'Walking Lunge',
    targetMuscle: 'Legs',
    type: 'Legs',
    description: 'Dynamic single leg movement.',
    tips: [
      'Take long steps to target glutes/hams, shorter for quads.',
      'Keep torso controlled.',
      'Touch back knee gently to ground.'
    ]
  },
  {
    id: 'legs-glute-ham-raise',
    name: 'Glute Ham Raise (or Nordic Curl)',
    targetMuscle: 'Legs',
    type: 'Legs',
    description: 'Bodyweight hamstring exercise.',
    tips: [
      'Control the descent.',
      'Use hands to push up if you can’t pull yourself up yet.',
      'Keep hips extended.'
    ]
  },

  // SHOULDERS
  {
    id: 'shoulders-ohp',
    name: 'Overhead Press (Barbell or DB)',
    targetMuscle: 'Shoulders',
    type: 'Push',
    description: 'Standing overhead press.',
    tips: [
      'Tight core, squeeze glutes.',
      'Press strictly, no leg drive (unless Push Press).',
      'Head through the window at the top.'
    ]
  },
  {
    id: 'shoulders-side-lateral',
    name: 'Side Lateral Raise',
    targetMuscle: 'Shoulders',
    type: 'Push',
    description: 'Isolation for side delts.',
    tips: [
      'Pour the pitcher (internal rotation) slightly.',
      'Lead with elbows.',
      'Don’t swing the weight.'
    ]
  },
  {
    id: 'shoulders-rear-delt-fly',
    name: 'Rear Delt Fly (Reverse Pec Deck or Bent Over)',
    targetMuscle: 'Shoulders',
    type: 'Pull',
    description: 'Isolation for rear delts.',
    tips: [
      'Don’t squeeze shoulder blades together too early, focus on the arm movement.',
      'Thumbs down can help target rear delt.'
    ]
  },
  {
    id: 'shoulders-arnold-press',
    name: 'Arnold Press',
    targetMuscle: 'Shoulders',
    type: 'Push',
    description: 'Dumbbell press with rotation.',
    tips: [
      'Start palms facing you, end palms facing away.',
      'Smooth rotation.',
      'Hits all heads of the delt.'
    ]
  },

  // ARMS
  {
    id: 'arms-chinup',
    name: 'Chin Up',
    targetMuscle: 'Arms',
    secondaryMuscles: ['Back'],
    type: 'Pull',
    description: 'Underhand grip pullup focusing on biceps.',
    tips: [
      'Supinated grip (palms facing you).',
      'Focus on the squeeze at the top.',
      'Control the negative.'
    ]
  },
  {
    id: 'arms-skullcrusher',
    name: 'Skullcrusher / Lying Tricep Extension',
    targetMuscle: 'Arms',
    type: 'Push',
    description: 'Tricep isolation with EZ bar or dumbbells.',
    tips: [
      'Keep elbows pointed up.',
      'Bring bar behind head for better stretch.',
      'Don’t flare elbows too much.'
    ]
  },
  {
    id: 'arms-spider-curl',
    name: 'Spider Curl',
    targetMuscle: 'Arms',
    type: 'Pull',
    description: 'Bicep curl on an incline bench, chest supported.',
    tips: [
      'Prevents cheating with body momentum.',
      'Focus on the peak contraction.',
      'Full extension at bottom.'
    ]
  },
  {
    id: 'arms-tricep-pushdown',
    name: 'Tricep Pushdown (Rope or Bar)',
    targetMuscle: 'Arms',
    type: 'Push',
    description: 'Cable pushdown for triceps.',
    tips: [
      'Pin elbows to sides.',
      'Spread the rope at the bottom if using rope.',
      'Squeeze triceps hard.'
    ]
  },
  {
    id: 'arms-waiter-curl',
    name: 'Waiter Curl',
    targetMuscle: 'Arms',
    type: 'Pull',
    description: 'Single dumbbell held with both hands, wrists bent back.',
    tips: [
      'Great for the long head of the bicep.',
      'Keep tension on the muscle.',
      'Don’t let the weight rest at the bottom.'
    ]
  },

  // ABS
  {
    id: 'abs-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    targetMuscle: 'Abs',
    type: 'Core',
    description: 'Hanging from a bar, raising legs to 90 degrees or toes to bar.',
    tips: [
      'Don’t swing.',
      'Curl the pelvis up to engage lower abs.',
      'Straight legs is harder, bent knees easier.'
    ]
  },
  {
    id: 'abs-ab-wheel',
    name: 'Ab Wheel Rollout',
    targetMuscle: 'Abs',
    type: 'Core',
    description: 'Rolling out on knees using an ab wheel.',
    tips: [
      'Posterior pelvic tilt (tuck tailbone).',
      'Don’t let lower back sag.',
      'Go only as far as you can control.'
    ]
  },
  {
    id: 'abs-cable-crunch',
    name: 'Cable Crunch',
    targetMuscle: 'Abs',
    type: 'Core',
    description: 'Kneeling crunch using cable rope.',
    tips: [
      'Don’t use hips to sit back.',
      'Curl your spine like a shrimp.',
      'Exhale hard on the crunch.'
    ]
  },
  {
    id: 'abs-plank',
    name: 'RKC Plank',
    targetMuscle: 'Abs',
    type: 'Core',
    description: 'Standard plank but with high tension.',
    tips: [
      'Squeeze glutes, quads, and fists.',
      'Pull elbows towards toes.',
      'Hold for shorter time with higher intensity.'
    ]
  }
];
