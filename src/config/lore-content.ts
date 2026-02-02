// ============================================================================
// Lore Content & Data Configuration
// ============================================================================

/**
 * Loading Screen Random Tips / Lore
 */
export const LOADING_TIPS = [
    "Tip: The DNA sequence holds the key to the galaxy's creation.",
    "Data: Kuiper belt density is increasing in Sector 7.",
    "Lore: The KPIA System was originally designed to catalog chaos.",
    "Hint: Use the Map to quickly navigate between distant stars.",
    "System: Optimization algorithms run best in low-latency environments.",
    "Note: Anomalous signals detected in the Taboo Sector.",
] as const;

export const RESEARCH_LOGS = [
    { id: 101, date: "2026.01.23", target: "GALAXY \"WESTERN\"", message: "FREQUENCY SHIFT DETECTED" },
    { id: 102, date: "2026.01.22", target: "GALAXY \"GAGAKU\"", message: "EROSION STABILIZED AT 45.2%" },
    { id: 103, date: "2026.01.20", target: "SYSTEM REBOOT", message: "CORE INTEGRITY 100%" },
    { id: 104, date: "2026.01.18", target: "OBSERVATION", message: "NEW ASTEROID BELT MAPPED" },
    { id: 105, date: "2026.01.15", target: "SIGNAL LOST", message: "CONNECTION RETRY... FAILED" },

];

/**
 * Random System Logs for DNA Analysis
 */
export const SYSTEM_LOGS = {
    STATUS_SCANNING: "[ SCANNING... ]",
    STATUS_ERROR: "[ ERROR: NONE ]",
    // Random technical parameters
    PARAMETERS: [
        "SIMPLEX_NOISE", "FBM_OCTAVES", "TIME_SCALE", "PERSISTENCE", "LACUNARITY",
        "VORONOI_DISPLACEMENT", "CELLULAR_AUTOMATA", "FLUID_DYNAMICS", "PARTICLE_LIFETIME",
        "GRAVITATIONAL_CONSTANT", "ENTROPY_LEVEL", "DARK_MATTER_RATIO", "QUANTUM_FLUX",
        "WAVE_FUNCTION_COLLAPSE", "EIGENVALUE_REAL", "EIGENVALUE_IMAG", "TENSOR_FLOW",
        "NEURAL_PATHWAY", "SYNAPTIC_WEIGHT", "HEBBIAN_LEARNING", "BACKPROPAGATION",
        "GRADIENT_DESCENT", "STOCHASTIC_PROCESS", "MARKOV_CHAIN", "MONTE_CARLO",
        "FOURIER_TRANSFORM", "LAPLACE_OPERATOR", "HAMILTONIAN_ENERGY", "LAGRANGIAN_MECHANICS",
        "SCHRODINGER_EQ", "HEISENBERG_UNCERTAINTY", "PLANCK_LENGTH", "LIGHT_SPEED_C",
    ]
} as const;

/**
 * Detailed Galaxy Descriptions (Mapped by ID)
 * Used for Lore displays or enhanced tooltips
 */
export const GALAXY_DESCRIPTIONS: Record<string, string> = {
    'g-order': "A perfectly ordered system where geometry dictates gravity.",
    'g-ring': "A massive ring structure surrounding a dying neutron star.",
    'g-chaos': "A forbidden sector where laws of physics are merely suggestions.",
    'g-africa': "A rhythmic constellation pulsing with ancient energy.",
    'g-irish': "Spiraling nebulae resembling ancient Celtic knots.",
    'g-spiral': "The classic vortex structure, home to billions of stars.",
};

// Functions to help select random content
export const getRandomTip = () => LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];
export const getRandomLogParam = () => SYSTEM_LOGS.PARAMETERS[Math.floor(Math.random() * SYSTEM_LOGS.PARAMETERS.length)];
