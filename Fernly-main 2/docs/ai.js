/* GitHub Pages Deployment Fix - Force rebuild to clear caches - December 2024 */
/**
 * AI Chat Functionality for Fernly Health - Self-Improving Pattern-Based AI Implementation
 * 
 * SELF-IMPROVEMENT CAPABILITIES:
 * 
 * 1. LEARNING FROM USER INTERACTIONS:
 *    - Collects user feedback after each response ("Was this helpful?")
 *    - Stores user-suggested better responses in localStorage
 *    - Learns new intent patterns when users categorize unrecognized messages
 *    - Tracks engagement metrics to optimize response selection
 * 
 * 2. ADAPTIVE PATTERN MATCHING:
 *    - Expands intent recognition with user-provided examples
 *    - Supports multi-intent detection in single messages
 *    - Handles misspellings, slang, and informal language variations
 *    - Continuously improves through user feedback
 * 
 * 3. PERSONALIZATION:
 *    - Remembers user preferences and communication styles
 *    - Prioritizes responses that have received positive feedback
 *    - Adapts to individual user's language patterns over time
 * 
 * 4. LOCAL STORAGE LEARNING (Browser-Specific):
 *    - All learning is stored locally in the user's browser
 *    - Data persists across sessions but is lost if browser cache is cleared
 *    - No external APIs or servers required - fully client-side
 * 
 * 5. FUTURE BACKEND INTEGRATION:
 *    - Code is structured for easy addition of backend sync (Firebase/Supabase)
 *    - Learning data can be easily migrated to cloud storage
 *    - Designed with API-ready data structures
 * 
 * LIMITATIONS:
 * - Learning is per-browser and resets when cache is cleared
 * - No cross-device synchronization (until backend is added)
 * - Privacy-focused: all data stays on user's device
 * 
 * EXTENDING WITH BACKEND:
 * To add backend sync, implement the syncLearningData() function and 
 * update saveLearningData()/loadLearningData() to use your chosen backend.
 */

// Smart AI Variables - no external model dependencies
let isAILoaded = false;
let isFallbackMode = false;
let conversationStarted = false;

// SELF-LEARNING AI DATA STRUCTURES
// All learning data is stored locally in the browser
let learningData = {
  // User-trained patterns for each intent
  learnedPatterns: {
    anxiety: [],
    depression: [],
    ptsd: [],
    adhd: [],
    bipolar: [],
    ocd: [],
    sleep: [],
    addiction: [],
    grief: [],
    relationships: [],
    services: [],
    help: [],
    general: []
  },
  
  // User-suggested responses with feedback scores
  learnedResponses: {
    anxiety: [],
    depression: [],
    ptsd: [],
    adhd: [],
    bipolar: [],
    ocd: [],
    sleep: [],
    addiction: [],
    grief: [],
    relationships: [],
    services: [],
    help: [],
    general: []
  },
  
  // Response effectiveness tracking
  responseMetrics: {
    // responseId: { helpfulCount: 0, notHelpfulCount: 0, engagementScore: 0 }
  },
  
  // User feedback and preferences
  userProfile: {
    preferredResponseStyle: 'supportive', // supportive, clinical, casual
    communicationPreferences: [],
    engagementHistory: [],
    lastFeedbackDate: null
  },
  
  // Unrecognized messages for learning opportunities
  unrecognizedMessages: [],
  
  // Version for future compatibility
  version: '1.0',
  lastUpdated: null
};

// Flag to track if we're waiting for user feedback
let awaitingFeedback = false;
let lastResponseId = null;


// Enhanced Conversation Context for intelligent responses
const conversationContext = {
  messages: [],
  questionCount: 0,
  mentalHealthTopics: [],
  crisisKeywords: [],
  detectedSymptoms: {},
  topicCounts: {},
  assessmentInProgress: false,
  assessmentStage: 0,
  assessmentResponses: {},
  assessmentPrompted: false,
  userPreferences: {
    communicationStyle: 'supportive', // supportive, clinical, casual
    previousTopics: [],
    needsUrgentCare: false
  },
  conversationFlow: {
    stage: 'greeting', // greeting, exploring, supporting, concluding
    lastResponseType: null,
    empathyLevel: 'high',
    lastAIQuestion: null, // Track the last question/intent the AI asked about
    lastAIIntent: null, // Track the intent of the last AI message
    shortResponseCount: 0, // Track consecutive short responses
    lastTopicDiscussed: null // Track the last substantial topic discussed
  }
};

// LEARNING DATA MANAGEMENT FUNCTIONS

/**
 * Save learning data to localStorage
 */
function saveLearningData() {
  try {
    learningData.lastUpdated = new Date().toISOString();
    localStorage.setItem('fernly_ai_learning', JSON.stringify(learningData));
    console.log('Learning data saved to localStorage');
    return true;
  } catch (error) {
    console.warn('Failed to save learning data:', error);
    return false;
  }
}

/**
 * Load learning data from localStorage
 */
function loadLearningData() {
  try {
    const stored = localStorage.getItem('fernly_ai_learning');
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Merge with default structure to handle version updates
      learningData = {
        ...learningData,
        ...parsed,
        // Ensure all required properties exist
        learnedPatterns: { ...learningData.learnedPatterns, ...(parsed.learnedPatterns || {}) },
        learnedResponses: { ...learningData.learnedResponses, ...(parsed.learnedResponses || {}) },
        responseMetrics: { ...learningData.responseMetrics, ...(parsed.responseMetrics || {}) },
        userProfile: { ...learningData.userProfile, ...(parsed.userProfile || {}) }
      };
      
      console.log('Learning data loaded from localStorage');
      return true;
    }
  } catch (error) {
    console.warn('Failed to load learning data:', error);
  }
  return false;
}

/**
 * Reset learning data to defaults (when localStorage is cleared)
 */
function resetLearningData() {
  const defaultData = {
    learnedPatterns: {
      anxiety: [],
      depression: [],
      ptsd: [],
      adhd: [],
      bipolar: [],
      ocd: [],
      sleep: [],
      grief: [],
      relationships: [],
      general: []
    },
    learnedResponses: {
      anxiety: [],
      depression: [],
      ptsd: [],
      adhd: [],
      bipolar: [],
      ocd: [],
      sleep: [],
      grief: [],
      relationships: [],
      general: []
    },
    responseMetrics: {},
    userProfile: {
      preferredResponseStyle: 'supportive',
      communicationPreferences: [],
      engagementHistory: [],
      lastFeedbackDate: null
    },
    unrecognizedMessages: [],
    version: '1.0',
    lastUpdated: null
  };
  
  learningData = defaultData;
  saveLearningData();
  console.log('Learning data reset to defaults');
}

/**
 * Placeholder for future backend sync
 * To implement backend sync, replace this with actual API calls
 */
async function syncLearningData() {
  // Future implementation for backend sync
  // Example structure:
  // try {
  //   const response = await fetch('/api/sync-learning', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(learningData)
  //   });
  //   return response.ok;
  // } catch (error) {
  //   console.warn('Backend sync failed:', error);
  //   return false;
  // }
  return Promise.resolve(true);
}

// Advanced response templates with multiple variations
const responseTemplates = {
  greeting: [
    "Hello! I'm here to support you with your mental health journey. How are you feeling today?",
    "Hi there! I'm glad you reached out. What's on your mind today?",
    "Welcome! I'm here to listen and provide support. What would you like to talk about?",
    "Hello! I'm your mental health support assistant. How can I help you today?"
  ],
  
  anxiety: {
    initial: [
      "I understand you're feeling anxious. Anxiety can feel overwhelming, but you're not alone. Can you tell me more about what's triggering these feelings?",
      "I hear that you're dealing with anxiety. That takes courage to share. What situations or thoughts seem to make the anxiety worse?",
      "Anxiety can be really challenging. You're taking a positive step by talking about it. Are there specific times or situations when you feel most anxious?"
    ],
    followUp: [
      "Since anxiety is still bothering you, let's explore some coping strategies. Have you tried any breathing exercises or grounding techniques?",
      "I want to help you manage this anxiety. Some people find the 4-7-8 breathing technique helpful: breathe in for 4, hold for 7, exhale for 8. Would you like to try it?",
      "Let's work on some practical anxiety management. The 5-4-3-2-1 grounding technique can help: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste."
    ]
  },
  
  depression: {
    initial: [
      "I'm sorry you're going through this difficult time. Depression can make everything feel heavy and overwhelming. Thank you for sharing this with me.",
      "It takes strength to reach out when you're feeling depressed. These feelings are real and valid, and you don't have to face them alone.",
      "I understand that you're struggling with depression. It's like carrying an invisible weight, isn't it? I'm here to support you through this."
    ],
    followUp: [
      "Depression is a real medical condition, not a personal failing. Have you been able to maintain any daily routines or activities, even small ones?",
      "I'm concerned about how depression is affecting you. Have you considered speaking with a healthcare provider about treatment options?",
      "Let's focus on small, manageable steps. Sometimes just getting through each day is an accomplishment when you're dealing with depression."
    ]
  },
  
  // NEW MENTAL HEALTH TOPIC RESPONSES
  ocd: {
    initial: [
      "I understand you're dealing with OCD. Those intrusive thoughts and compulsions can be really overwhelming and exhausting.",
      "OCD can feel like your mind is stuck in a loop. It's a real condition that affects many people, and you're not alone in this struggle.",
      "Thank you for sharing about your OCD. Those repetitive thoughts and behaviors can be incredibly distressing, and it takes courage to talk about them."
    ],
    followUp: [
      "OCD responds well to treatment, especially exposure and response prevention therapy. Have you been able to work with a therapist who specializes in OCD?",
      "I know the compulsions might feel like they provide relief, but they often make OCD stronger. Have you learned any techniques to resist the urges?",
      "OCD can be very treatable. The key is learning to tolerate the anxiety without performing the compulsions. Are you working with anyone on this?"
    ]
  },
  
  sleep: {
    initial: [
      "Sleep problems can really impact every area of your life. I'm glad you're reaching out about this - good sleep is so important for mental health.",
      "I understand you're having trouble with sleep. Whether it's falling asleep, staying asleep, or sleeping too much, it can be really frustrating.",
      "Sleep issues and mental health are closely connected. When we don't sleep well, everything else becomes harder to manage."
    ],
    followUp: [
      "Sleep hygiene can make a big difference. Things like keeping a consistent bedtime, avoiding screens before bed, and creating a calming routine can help.",
      "Sometimes sleep problems are symptoms of other conditions like anxiety or depression. Have you noticed any patterns with your mood and sleep?",
      "If sleep problems persist, it might be worth talking to a healthcare provider. There are effective treatments available for various sleep disorders."
    ]
  },
  
  // Addiction and substance use responses
  addiction: {
    initial: [
      "Thank you for having the courage to share this with me. Addiction is a medical condition, not a moral failing, and recovery is absolutely possible with the right support.",
      "I appreciate your honesty about your struggles with substances. Many people face these challenges, and there are effective treatments and recovery paths available.",
      "It takes strength to acknowledge addiction concerns. You're not alone in this - addiction affects many people, and recovery happens one day at a time with proper support.",
      "I'm glad you felt comfortable sharing this with me. Substance use disorders are real medical conditions that respond well to treatment, and asking for help is the first step."
    ],
    followUp: [
      "Recovery is a journey that looks different for everyone. Are you currently connected with any addiction treatment services, support groups, or recovery programs?",
      "There are many effective approaches to addiction treatment, including therapy, medication-assisted treatment, and peer support. Have you explored any treatment options yet?",
      "Cravings and urges are a normal part of recovery for many people. Do you have coping strategies or a support system to help during difficult moments?",
      "Recovery often works best with professional support. Would you like information about local addiction treatment services or support groups in your area?"
    ],
    resources: [
      "🔗 **Addiction Resources**: SAMHSA National Helpline: 1-800-662-4357 (free, confidential, 24/7) | Visit our Services page for local addiction treatment programs: [Fernly Addiction Services](/services#addiction)",
      "🔗 **Recovery Support**: SAMHSA Helpline 1-800-662-4357 | AA/NA meetings finder: [aa.org](https://placeholder-aa.org) | SMART Recovery: [smartrecovery.org](https://placeholder-smart.org) | Our addiction specialists: [Contact Fernly](/services#mat)",
      "🔗 **Crisis Resources**: If you're in immediate danger from substance use, call 911 | Addiction crisis support: SAMHSA 1-800-662-4357 | Local emergency services: [Fernly Crisis Support](/services#crisis)"
    ]
  },
  
  bipolar: {
    initial: [
      "I hear that you're dealing with bipolar disorder. Those mood swings between highs and lows can be really challenging to navigate.",
      "Bipolar disorder affects many people, and it's completely manageable with the right support and treatment. Thank you for sharing this with me.",
      "The extreme mood changes in bipolar disorder can feel overwhelming. It's important to know that you're not alone and that effective treatments are available."
    ],
    followUp: [
      "Mood tracking can be really helpful with bipolar disorder. Have you been able to identify any triggers or patterns in your mood cycles?",
      "Bipolar disorder typically requires ongoing treatment. Are you working with a psychiatrist or therapist who understands bipolar disorder?",
      "Managing bipolar disorder often involves medication, therapy, and lifestyle strategies. Having a good support system is also crucial."
    ]
  },

  grief: {
    initial: [
      "I'm so sorry for your loss. Grief can come in waves and feel overwhelming at times. Would you like to share a memory of your loved one?",
      "Losing someone important to us can leave a huge emptiness. I'm here to listen if you'd like to talk about what you're going through.",
      "Grief affects everyone differently. There's no right or wrong way to feel. How have you been coping so far?"
    ],
    followUp: [
      "It's normal for grief to resurface unexpectedly. Do you have any supports or rituals that help you honor your loss?",
      "Many people find that talking about their feelings or joining a support group helps. Would exploring those options be helpful?",
      "Grieving takes time and self-compassion. What small acts of self-care could you practice to help yourself through this?"
    ]
  },

  relationships: {
    initial: [
      "Relationships can be complex and sometimes painful. What's been weighing on you about your current situation?",
      "It sounds like you're dealing with some relationship stress. I'm here to listen—feel free to share what's happening.",
      "Navigating relationship challenges can stir up many emotions. What aspect feels most pressing right now?"
    ],
    followUp: [
      "Communication is often key in resolving relationship issues. Have you had a chance to express your feelings openly?",
      "Setting boundaries can help protect your well-being. Would you like to explore ways to establish healthier boundaries?",
      "Relationships evolve over time. What outcome would feel healthiest for you as you move forward?"
    ]
  },
  
  crisis: [
    "🚨 I'm very concerned about what you're going through. If you're having thoughts of harming yourself, please reach out for immediate help: Call 988 (Suicide & Crisis Lifeline) - available 24/7, or text 'HELLO' to 741741. You're not alone.",
    "This sounds like you're in a lot of pain right now. Please know that help is available. The 988 Suicide & Crisis Lifeline is available 24/7, and they have trained counselors who understand what you're going through.",
    "I'm worried about you. If you're having thoughts of suicide or self-harm, please call 988 immediately. These feelings can change with the right support - you don't have to go through this alone."
  ],
  
  // Responses for simple acknowledgments with enhanced variety and warmth
  acknowledgment: [
    "I appreciate you letting me know. What would you like to explore together next?",
    "Thanks for sharing that with me. What's feeling most important to you right now?",
    "I understand. What direction would feel most helpful for our conversation?",
    "Got it. What's been on your mind that you'd like to talk about?",
    "I hear you. What would feel most meaningful to focus on together?",
    "Thank you for that. What's drawing your attention or concern lately?",
    "I'm with you. What aspects of your experience would you like to explore?",
    "That makes sense. What feels most pressing or interesting to discuss?",
    "I appreciate your openness. What would be most supportive to talk about?",
    "Thanks for staying engaged. What feels most alive or relevant for you today?",
    "I'm grateful for your honesty. What would you like our conversation to focus on?",
    "I understand where you're coming from. What feels most important in this moment?"
  ],
  
  // Responses for clarification requests with enhanced empathy and variety
  clarification: [
    "I'd be happy to explain that more clearly. What specific part would be most helpful for me to break down?",
    "Of course! I want to make sure I'm being really clear with you. What would help me explain it better?",
    "Absolutely - let me try a different way of explaining this. What would be most helpful for me to clarify?",
    "I appreciate you asking for clarification - that shows you're really engaged. What part can I explain better?",
    "Good question! I'd rather over-explain than leave you wondering. What would you like me to go deeper on?",
    "That's totally fair to ask about. What part can I clarify or explain further?",
    "I'm glad you're comfortable asking questions - that's so important. What aspect would be most helpful to explore?",
    "Let me slow down and explain that better. What specifically would help clarify things for you?",
    "You're absolutely right to ask about that. What part can I explain in more detail to help you?",
    "I want to make sure we're on the same page. What would help clarify things for you?"
  ],
  
  // Enhanced help responses with context-awareness
  help: [
    "I'm here to help in whatever way I can. Are you looking for emotional support, information about mental health topics, or guidance to professional services?",
    "I want to provide the most helpful response possible. Can you tell me a bit more about what kind of help you're seeking today?",
    "That's what I'm here for! Help can mean many things - are you looking for someone to listen, practical strategies, or information about treatment options?",
    "I'm glad you reached out for help. What feels most pressing or important to you right now - emotional support, understanding a condition, or finding professional services?",
    "You've come to the right place for support. To give you the most helpful response, can you share what area you'd most like help with today?",
    "I'm here to support you through whatever you're facing. What would feel most helpful - talking through feelings, learning coping strategies, or connecting with professional resources?",
    "Asking for help is a sign of strength. What's been weighing on you that I might be able to support you with?",
    "I care about providing meaningful help. Are you looking for immediate emotional support, information about mental health, or guidance to treatment services?",
    "Help comes in many forms, and I want to offer what you need most. What feels most urgent or important for us to focus on together?"
  ],
  
  // Mental health services responses
  services: {
    initial: [
      "I'm here to help you understand your treatment options. Fernly Health offers several levels of care to meet different needs. What type of support are you looking for?",
      "There are many paths to getting help, and I want to guide you to the right resources. Are you looking for immediate support, ongoing therapy, or specific addiction services?",
      "I'm glad you're seeking help - that's a brave and important step. We have various services available. Can you tell me more about what kind of support would be most helpful?",
      "It sounds like you're ready to explore treatment options. That's wonderful! Would you like to know about our outpatient programs, intensive services, or specific areas like addiction treatment?"
    ],
    followUp: [
      "Based on what you've shared, I think there are several services that might be helpful. Would you like me to explain specific programs or connect you with someone who can do a proper assessment?",
      "Here are some options that might fit your needs. Would you like more details about any of these programs, or shall I connect you with our intake team?",
      "I can provide more information about these services. You can also visit our Services page at [Fernly Services](/services) or contact us directly to speak with a specialist.",
      "These services are designed to meet people where they are in their journey. Would you like to know more about the admission process or daily structure of any particular program?"
    ],
    contextual: {
      addiction: [
        "Since you mentioned substance use concerns, I want you to know that Fernly offers specialized addiction treatment including Medication Assisted Treatment (MAT) and addiction counseling. You can find more details on our [Services page](/services#addiction).",
        "For addiction-specific support, we provide comprehensive treatment including detox support, therapy, and recovery programs. Our MAT program has helped many people achieve lasting recovery. Would you like to learn more about these services?",
        "Addiction treatment is one of our specialties. We offer both intensive outpatient programs and medication-assisted treatment specifically designed for substance use recovery. Visit [Fernly Addiction Services](/services#mat) for more information."
      ],
      crisis: [
        "Given what you're going through, you might benefit from our Crisis Stabilization services for immediate support, followed by ongoing care. Please don't hesitate to contact us immediately if you need urgent help.",
        "Our Crisis Intervention services are available when you need immediate support. For ongoing care, we also offer intensive programs. You can reach our crisis line or visit [Emergency Services](/services#crisis)."
      ],
      general: [
        "We offer everything from individual therapy to intensive day programs. Our services include PHP (Partial Hospitalization), IOP (Intensive Outpatient), and regular therapy sessions. What feels most appropriate for your situation?",
        "Our Services page has detailed information about all our programs: [Fernly Services](/services). You can also call us to speak with someone who can help determine the best fit for your needs."
      ]
    }
  },
  
  // Service walkthrough responses  
  service_walkthrough: [
    "I'd be happy to walk you through what to expect. Which specific program or service would you like me to explain step by step?",
    "I can provide a detailed overview of the process. What service are you interested in learning about?",
    "Let me break that down for you step by step. Which program would you like me to explain?",
    "I can guide you through what a typical experience looks like. What service are you curious about?"
  ]
};

// Enhanced pattern matching with fuzzy matching and synonyms
const intentPatterns = {
  greeting: [
    /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
    /^(how are you|what's up|sup|whats up|wassup)/i,
    /^(hiya|heya|hallo|helo|hai)/i, // Common misspellings
    /^(howdy|greetings|salutations)/i
  ],
  
  anxiety: [
    /(anxious|anxiety|worried|worry|panic|fear|nervous|stress|overwhelm|tense)/i,
    /(on edge|restless|can't relax|uptight|freaking out|scared|frightened)/i,
    /(heart racing|can't breathe|shaking|trembling|sweating)/i,
    /(GAD|general anxiety|social anxiety|performance anxiety)/i,
    /(catastrophic thinking|worst case scenario|what if)/i
  ],
  
  depression: [
    /(depress|sad|down|low|hopeless|empty|worthless|despair)/i,
    /(can't get out of bed|no motivation|don't care|numb|disconnected)/i,
    /(crying|tears|weeping|melancholy|blue|gloomy)/i,
    /(suicidal|end it all|better off dead|no point|give up)/i,
    /(major depression|clinical depression|seasonal depression)/i
  ],
  
  adhd: [
    /(adhd|attention deficit|hyperactive|can't focus|can't concentrate)/i,
    /(easily distracted|scattered|forgetful|procrastinate|disorganized)/i,
    /(restless|fidgety|impulsive|interrupt|can't sit still)/i,
    /(hyperfocus|zoning out|daydreaming|mind wandering)/i,
    /(\ba\.d\.d\b|\ba\.d\.h\.d\b)/i  // Word boundaries for ADD/ADHD abbreviations
  ],
  
  ptsd: [
    /(ptsd|trauma|flashback|nightmare|triggered|hypervigilant)/i,
    /(can't forget|haunted|reliving|vivid memories|startled)/i,
    /(avoidance|numb|detached|on guard|jumpy)/i,
    /(combat|assault|accident|abuse|violence|disaster)/i
  ],
  
  bipolar: [
    /(bipolar|manic|mania|mood swings|high and low|up and down)/i,
    /(grandiose|racing thoughts|no sleep|euphoric|irritable)/i,
    /(spending spree|risky behavior|hypomanic|mixed episode)/i,
    /(mood disorder|cyclothymia)/i
  ],
  
  ocd: [
    /(ocd|obsessive|compulsive|ritual|checking|counting)/i,
    /(intrusive thoughts|contamination|germs|symmetry|order)/i,
    /(can't stop|have to do|over and over|perfect|exactly)/i,
    /(hand washing|door checking|hoarding|trichotillomania)/i
  ],
  
  sleep: [
    /(insomnia|can't sleep|trouble sleeping|sleepless|restless)/i,
    /(nightmares|night terrors|sleep paralysis|sleepwalking)/i,
    /(tired|exhausted|fatigue|drowsy|sleep deprived)/i,
    /(sleep schedule|circadian|melatonin|sleep hygiene)/i
  ],

  grief: [
    /(grief|grieving|loss of|passed away|mourning|bereavement)/i,
    /(lost my|lost a|dealing with loss|coping with death)/i,
    /(sad about losing|can't believe they're gone|miss them so much)/i
  ],

  relationships: [
    /(relationship|breakup|partner|spouse|divorce|argument|couple)/i,
    /(fight with|conflict with|my boyfriend|my girlfriend|my husband|my wife)/i,
    /(communication issues|trust issues|cheating|infidelity)/i
  ],
  
  // Addiction and substance use patterns
  addiction: [
    /(addiction|addicted|substance use|substance abuse|alcoholism)/i,
    /(drinking problem|alcohol problem|drug problem|substance problem)/i,
    /(recovery|sobriety|sober|clean|relapse|relapsed)/i,
    /(cravings|urges|temptation|withdrawal|detox)/i,
    /(aa|na|alcoholics anonymous|narcotics anonymous|12 step)/i,
    /(rehab|rehabilitation|treatment center|inpatient treatment)/i,
    /(cocaine|heroin|opioids|meth|marijuana|cannabis)/i,
    /(drinking too much|can't stop drinking|need to quit)/i,
    /(using substances|using drugs|drug habit|dependency|dependent)/i,
    /(alcohol|booze|getting high|getting drunk)/i,
    /(intervention|enabling|rock bottom|hit bottom)/i,
    /(overdose|od|blackout|binge drinking|daily drinking)/i,
    /(addicted to drugs|drug addiction|using cocaine|using heroin)/i,
    /(substance dependency|chemical dependency|drug dependency)/i
  ],
  
  medication: [
    /(medication|pills|prescription|side effects)/i,
    /(ssri|snri|antidepressant|mood stabilizer|antipsychotic)/i,
    /(prozac|zoloft|lexapro|xanax|adderall|lithium)/i,
    /(dosage|withdrawal|tapering|stopping|starting)/i,
    /(prescribed drugs|prescription drugs|medical drugs)/i
  ],
  
  crisis: [
    /(suicide|kill myself|end my life|better off dead|no point living)/i,
    /(self harm|cutting|hurt myself|overdose|jump|gun)/i,
    /(can't go on|give up|hopeless|no way out|emergency)/i,
    /(crisis|help me|save me|dying|planning to)/i
  ],
  
  // Simple acknowledgments and responses
  acknowledgment: [
    /^(ok|okay|kay|k)$/i,
    /^(yes|yeah|yep|yup|sure|alright|right)$/i,
    /^(no|nope|nah|not really)$/i,
    /^(maybe|perhaps|i guess|sort of|kinda)$/i,
    /^(thanks|thank you|thx)$/i
  ],
  
  // Simple questions needing clarification
  clarification: [
    /^(why|what|how|when|where)$/i,
    /^(what's that|whats that)$/i,
    /^(what does that mean|what do you mean)$/i,
    /^(i don't understand|i dont understand|huh|what)$/i,
    /^(can you explain|explain|tell me more)$/i
  ],
  
  // Help requests - general and context-aware
  help: [
    /^(help|help me|i need help)$/i,
    /(can you help|need your help|help please|please help)/i,
    /(what can you help with|how can you help|help with)/i,
    /(assistance|support|guidance)/i,
    /(don't know what to do|need guidance|lost|confused)/i
  ],
  
  // Mental health services and programs
  services: [
    /(php|partial hospitalization program|partial hospitalization)/i,
    /(iop|intensive outpatient program|intensive outpatient)/i,
    /(outpatient program|outpatient treatment|op\b)/i,
    /(crisis stabilization|crisis intervention|crisis support)/i,
    /(inpatient program|inpatient treatment|inpatient care)/i,
    /(residential treatment|residential care|residential program)/i,
    /(mat|medication assisted treatment|medication-assisted)/i,
    /(telehealth|teletherapy|online therapy|virtual therapy)/i,
    /(aftercare|relapse prevention|continuing care)/i,
    /(services|help|i need help|where can i get help|need support)/i,
    /(treatment|therapy|counseling|what services|available services)/i,
    /(mental health services|getting help|find help|seek help)/i,
    /(what help|help me|support services|care services)/i
  ],
  
  // Service walkthroughs and process questions  
  service_walkthrough: [
    /(walk me through|how does.*work|what happens in|what to expect)/i,
    /(step by step|process|procedure|what's it like)/i,
    /(daily schedule|typical day|routine)/i,
    /(admissions|intake|getting started)/i
  ]
};

// Fuzzy matching function for more flexible pattern recognition
function fuzzyMatch(text, pattern) {
  const words = text.toLowerCase().split(/\s+/);
  const patternWords = pattern.toLowerCase().split(/\s+/);
  
  let matchScore = 0;
  for (const word of words) {
    for (const pWord of patternWords) {
      // Exact match
      if (word === pWord) {
        matchScore += 1;
      }
      // Partial match (contains)
      else if (word.includes(pWord) || pWord.includes(word)) {
        matchScore += 0.7;
      }
      // Levenshtein distance for typos
      else if (levenshteinDistance(word, pWord) <= 2 && Math.min(word.length, pWord.length) > 3) {
        matchScore += 0.5;
      }
    }
  }
  
  return matchScore / Math.max(words.length, patternWords.length);
}

// Simple Levenshtein distance function for typo detection
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

// Enhanced synonym matching using fallback data
function checkSynonyms(message, intent) {
  if (!window.fallbackData || !window.fallbackData.dsm5) return false;
  
  const lowerMessage = message.toLowerCase();
  for (const condition in window.fallbackData.dsm5) {
    const conditionData = window.fallbackData.dsm5[condition];
    if (conditionData.synonyms) {
      for (const synonym of conditionData.synonyms) {
        // Use word boundaries for short synonyms like "add"
        let synonymRegex;
        if (synonym.length <= 3) {
          synonymRegex = new RegExp(`\\b${synonym.toLowerCase()}\\b`, 'i');
        } else {
          synonymRegex = new RegExp(synonym.toLowerCase(), 'i');
        }
        
        if (synonymRegex.test(lowerMessage)) {
          // Map condition to intent
          const conditionToIntent = {
            'ADHD': 'adhd',
            'Depression': 'depression', 
            'Anxiety': 'anxiety',
            'PTSD': 'ptsd',
            'Bipolar': 'bipolar',
            'OCD': 'ocd',
            'Insomnia': 'sleep'
          };
          if (conditionToIntent[condition] === intent) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// Retrieve quick DSM-5 disorder details
function getDisorderInfo(query) {
  if (!window.dsm5Disorders) return null;
  const lowerQuery = query.toLowerCase();

  // Match against synonyms first for better accuracy
  for (const info of Object.values(window.dsm5Disorders)) {
    if (info.synonyms && info.synonyms.some(s => {
      // Use word boundaries for short synonyms like "add"
      if (s.length <= 3) {
        const synonymRegex = new RegExp(`\\b${s.toLowerCase()}\\b`, 'i');
        return synonymRegex.test(lowerQuery);
      } else {
        return lowerQuery.includes(s.toLowerCase());
      }
    })) {
      return info;
    }
  }

  // Match against full disorder names
  for (const info of Object.values(window.dsm5Disorders)) {
    if (info.name && lowerQuery.includes(info.name.toLowerCase())) {
      return info;
    }
  }

  // Fallback: match by key substring
  const key = Object.keys(window.dsm5Disorders).find(d => lowerQuery.includes(d));
  return key ? window.dsm5Disorders[key] : null;
}

// Fuzzy matching function for more flexible pattern recognition
function fuzzyMatch(text, pattern) {
  const words = text.toLowerCase().split(/\s+/);
  const patternWords = pattern.toLowerCase().split(/\s+/);
  
  let matchScore = 0;
  for (const word of words) {
    for (const pWord of patternWords) {
      // Exact match
      if (word === pWord) {
        matchScore += 1;
      }
      // Partial match (contains)
      else if (word.includes(pWord) || pWord.includes(word)) {
        matchScore += 0.7;
      }
      // Levenshtein distance for typos
      else if (levenshteinDistance(word, pWord) <= 2 && Math.min(word.length, pWord.length) > 3) {
        matchScore += 0.5;
      }
    }
  }
  
  return matchScore / Math.max(words.length, patternWords.length);
}

// Simple Levenshtein distance function for typo detection
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

const extraIntentPatterns = {
  anxiety: [
    /(can't stop thinking|racing thoughts|catastrophizing|overthinking)/i,
    /(heart racing|shortness of breath|sweating|trembling)/i,
    // Variations and misspellings
    /(anxios|anxitey|panik|stres|overwelm|overwelmed)/i,
    /(freaking out|stressed out|wound up|on edge|butterflies)/i,
    /(cant sleep|tossing and turning|mind racing|spiraling)/i,
    // Slang and informal
    /(buggin|bugging|trippin|tripping|losing it|going crazy)/i
  ],
  
  depression: [
    /(depressed|depression|sad|hopeless|empty|numb|worthless|guilty)/i,
    /(no energy|tired|fatigue|sleep problems|can't sleep|sleeping too much)/i,
    /(no interest|no pleasure|don't enjoy|nothing matters)/i,
    /(want to die|better off dead|no point|can't go on)/i,
    // Variations and misspellings
    /(depresed|depress|hopless|worthles|exausted|exhasted)/i,
    /(feeling down|down in dumps|blue|low|rock bottom)/i,
    /(dont care|nothing matters|whats the point|why bother)/i,
    // Slang and informal
    /(bummed out|super down|really low|feeling like crap|hate myself)/i
  ],
  
  crisis: [
    /(suicide|kill myself|want to die|end it all|better off dead)/i,
    /(can't go on|no point|hurt myself|self harm|overdose)/i,
    /(suicidal|suicidal thoughts|ending my life|not worth living)/i,
    // Variations and coded language
    /(dont want to be here|tired of living|ready to go|cant take it)/i,
    /(everyone would be better without me|burden|waste of space)/i
  ],
  
  medication: [
    /(medication|medicine|pill|drug|prescription|antidepressant)/i,
    /(side effect|dose|dosage|taking|prescribed)/i,
    // Variations and misspellings
    /(meds|medicaton|perscription|prescripion|anti-depressant)/i,
    /(pills|tablets|capsules|pharma|pharmacy)/i
  ],
  
  ptsd: [
    /(ptsd|trauma|flashback|nightmare|triggered|hypervigilant)/i,
    /(can't forget|keeps happening|reliving|avoidance)/i,
    // Variations and informal language
    /(post traumatic|traumatic stress|flash back|night mare)/i,
    /(cant get it out of my head|haunts me|keeps replaying)/i,
    /(jumpy|startled|on guard|cant relax|hyperaware)/i
  ],
  
  adhd: [
    /(adhd|attention deficit|hyperactive|can't focus|distracted)/i,
    /(fidgeting|restless|impulsive|disorganized|forgetful)/i,
    // Variations and informal language
    /(\ba\.d\.d\b|\ba\.d\.h\.d\b|cant focus|cant concentrate|scattered)/i,
    /(hyper|bouncing off walls|all over the place|spacey)/i,
    /(procrastinating|putting things off|cant sit still)/i
  ],
  
  // NEW MENTAL HEALTH TOPICS
  ocd: [
    /(ocd|obsessive|compulsive|rituals|checking|counting)/i,
    /(intrusive thoughts|unwanted thoughts|contamination|germs)/i,
    /(have to do|cant stop|over and over|perfectly|exactly right)/i,
    // Variations and informal language
    /(o\.c\.d|obsesive|compulsiv|ritualistic|repetitive)/i,
    /(checking locks|washing hands|counting|organizing)/i,
    /(thoughts stuck|cant get thoughts out|bothering me)/i
  ],
  
  sleep: [
    /(insomnia|can't sleep|sleep problems|sleeping too much)/i,
    /(tired|exhausted|fatigue|no energy|sleepy)/i,
    /(nightmares|night terrors|sleep walking|restless sleep)/i,
    // Variations and informal language
    /(cant fall asleep|tossing turning|up all night|sleep schedule)/i,
    /(wiped out|drained|burnt out|running on empty)/i,
    /(bad dreams|scary dreams|waking up tired|never rested)/i
  ],

  grief: [
    /(grieving|lost my|lost someone|mourning|bereaved)/i,
    /(funeral|passed away|after the loss|coping with grief)/i,
    /(can't move on|miss them|feels empty without)/i
  ],

  relationships: [
    /(breakup|broken up|ended things|split up|separation)/i,
    /(arguing|fighting|can't communicate|trust issues)/i,
    /(cheated|infidelity|jealous|controlling partner)/i
  ],
  
  bipolar: [
    /(bipolar|manic|mood swings|elevated mood|grandiose)/i,
    /(up and down|high and low|mood changes|euphoric)/i,
    /(racing thoughts|talking fast|impulsive|reckless)/i,
    // Variations and informal language
    /(bi-polar|mood disorder|manic depressive|mixed episodes)/i,
    /(feeling invincible|on top of world|crash|coming down)/i,
    /(emotional rollercoaster|all over the place emotionally)/i
  ]
};

for (const [intent, patterns] of Object.entries(extraIntentPatterns)) {
  if (!intentPatterns[intent]) {
    intentPatterns[intent] = [];
  }
  intentPatterns[intent].push(...patterns);
}

// Initialize Smart AI System with Learning Data
async function initializeAI() {
  try {
    updateAIStatusIndicator('loading', 'Initializing Smart AI System...');
    showAILoading();
    updateProgress(20, 'Loading AI patterns...');
    
    // Load learning data from localStorage
    const learningLoaded = loadLearningData();
    if (learningLoaded) {
      console.log('Previous learning data loaded successfully');
      updateProgress(35, 'Learning data loaded...');
    } else {
      console.log('No previous learning data found, starting fresh');
      updateProgress(35, 'Initializing learning systems...');
    }
    
    // Simulate initialization time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProgress(50, 'Configuring mental health database...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProgress(80, 'Optimizing response generation...');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProgress(100, 'Smart AI Ready!');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    hideAILoading();
    isAILoaded = true;
    console.log('Smart AI System initialized successfully!');
    updateAIStatusIndicator('ai-active', 'Smart AI Active');
    showAISuccessNotification();
    
    // Show learning status if data was loaded
    if (learningLoaded) {
      showLearningDataNotification();
    }
    
  } catch (error) {
    console.error('Smart AI initialization failed:', error);
    hideAILoading();
    isFallbackMode = true;
    updateAIStatusIndicator('fallback-active', 'Enhanced Support Mode Active');
    showAIErrorNotification('AI system is running in enhanced support mode with full mental health capabilities.');
    showFallbackModeNotification();
  }
}

/**
 * Show notification about loaded learning data
 */
function showLearningDataNotification() {
  const totalLearned = Object.values(learningData.learnedPatterns).reduce((sum, patterns) => sum + patterns.length, 0);
  const totalResponses = Object.values(learningData.learnedResponses).reduce((sum, responses) => sum + responses.length, 0);
  
  if (totalLearned > 0 || totalResponses > 0) {
    console.log(`AI loaded with ${totalLearned} learned patterns and ${totalResponses} improved responses`);
    
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      const learningDiv = document.createElement('div');
      learningDiv.className = 'message bot learning-info';
      learningDiv.innerHTML = `
        <div class="message-content">
          <div class="message-text">
            <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
              <strong>🎓 Learning Data Loaded!</strong><br>
              <small style="color: #2e7d32;">
                I've remembered ${totalLearned} patterns and ${totalResponses} improved responses from our previous conversations. I'm getting smarter!
              </small>
            </div>
            <small style="color: #666;"><em>Note: This learning data is stored locally in your browser and will be lost if you clear your browser cache.</em></small>
          </div>
        </div>
      `;
      chatMessages.appendChild(learningDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
}

// Advanced Intent Recognition with Multi-Intent Detection and Learning
function recognizeIntent(message) {
  const lowerMessage = message.toLowerCase();
  const detectedIntents = [];
  
  // Crisis detection has highest priority - always check first
  for (const pattern of intentPatterns.crisis) {
    if (pattern.test(lowerMessage)) {
      return 'crisis'; // Crisis overrides all other intents
    }
  }
  
  // Check built-in patterns for all intents with enhanced matching
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (intent === 'crisis') continue; // Already checked
    
    for (const pattern of patterns) {
      if (pattern.test(lowerMessage)) {
        detectedIntents.push(intent);
        break; // One match per intent type is enough
      }
    }
    
    // Additional fuzzy matching and synonym checking
    if (!detectedIntents.includes(intent)) {
      if (checkSynonyms(message, intent)) {
        detectedIntents.push(intent);
      }
    }
  }
  
  // Check learned patterns from user training
  for (const [intent, learnedPatterns] of Object.entries(learningData.learnedPatterns)) {
    if (learnedPatterns.length === 0) continue;
    
    for (const learnedPattern of learnedPatterns) {
      try {
        const regex = new RegExp(learnedPattern.pattern, 'i');
        if (regex.test(lowerMessage)) {
          if (!detectedIntents.includes(intent)) {
            detectedIntents.push(intent);
          }
          // Track successful use of learned pattern
          learnedPattern.useCount = (learnedPattern.useCount || 0) + 1;
          learnedPattern.lastUsed = new Date().toISOString();
          saveLearningData();
          break;
        }
      } catch (error) {
        console.warn('Invalid learned pattern:', learnedPattern.pattern);
      }
    }
  }
  
  // Return primary intent (most specific or most recently learned)
  if (detectedIntents.length === 0) {
    // Store unrecognized message for learning opportunity
    storeUnrecognizedMessage(message);
    return 'general';
  }
  
  // If multiple intents detected, prioritize based on specificity and user interaction history
  if (detectedIntents.length > 1) {
    // Store multi-intent information for context
    conversationContext.multiIntents = detectedIntents;
    
    // Prioritize mental health conditions and medication questions
    // Medication is checked right after crisis to ensure users get drug information when requested
    const priorityOrder = ['crisis', 'medication', 'addiction', 'services', 'help', 'ptsd', 'ocd', 'bipolar', 'depression', 'anxiety', 'adhd', 'sleep', 'greeting', 'acknowledgment', 'clarification', 'general'];
    for (const priority of priorityOrder) {
      if (detectedIntents.includes(priority)) {
        return priority;
      }
    }
  }
  
  return detectedIntents[0];
}

/**
 * Store unrecognized messages for learning opportunities
 */
function storeUnrecognizedMessage(message) {
  // Don't store very short messages or repeated messages
  if (message.length < 5) return;
  
  const existing = learningData.unrecognizedMessages.find(m => 
    m.message.toLowerCase() === message.toLowerCase()
  );
  
  if (existing) {
    existing.count = (existing.count || 1) + 1;
    existing.lastSeen = new Date().toISOString();
  } else {
    learningData.unrecognizedMessages.push({
      message: message,
      count: 1,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      needsCategorization: true
    });
  }
  
  // Limit storage to prevent bloat
  if (learningData.unrecognizedMessages.length > 100) {
    learningData.unrecognizedMessages = learningData.unrecognizedMessages
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);
  }
  
  saveLearningData();
}

/**
 * Enhanced clarification logic for uncertain matches
 */
function handleUncertainMatch(message, potentialIntents) {
  if (potentialIntents.length === 0) {
    return generateClarificationResponse(message);
  }
  
  if (potentialIntents.length === 1) {
    const confidence = calculateMatchConfidence(message, potentialIntents[0]);
    if (confidence < 0.6) {
      return generateClarificationResponse(message, potentialIntents[0]);
    }
  }
  
  // Multiple potential matches - ask for clarification
  if (potentialIntents.length > 1) {
    return generateMultiOptionResponse(potentialIntents);
  }
  
  return null; // No clarification needed
}

/**
 * Calculate confidence score for a match
 */
function calculateMatchConfidence(message, intent) {
  const patterns = intentPatterns[intent] || [];
  let maxScore = 0;
  
  for (const pattern of patterns) {
    if (pattern.test(message.toLowerCase())) {
      maxScore = Math.max(maxScore, 0.8); // Regex match
    }
  }
  
  // Check synonym matches
  if (checkSynonyms(message, intent)) {
    maxScore = Math.max(maxScore, 0.7);
  }
  
  return maxScore;
}

/**
 * Generate clarification response for uncertain matches
 */
function generateClarificationResponse(message, suggestedIntent = null) {
  const clarificationPrompts = [
    "I want to help you the best I can. Could you clarify a bit more about what you're experiencing?",
    "I'm here to help, and I want to give you the most relevant support. Can you share more details about what's on your mind?",
    "To better assist you, could you help me understand what specific area you'd like to focus on?",
    "I'm listening and want to provide the best support. Could you clarify what you're feeling or experiencing?"
  ];
  
  let response = clarificationPrompts[Math.floor(Math.random() * clarificationPrompts.length)];
  
  if (suggestedIntent) {
    const intentLabels = {
      'anxiety': 'anxiety or worry',
      'depression': 'depression or low mood',
      'adhd': 'attention or focus issues',
      'ptsd': 'trauma or difficult memories',
      'bipolar': 'mood changes',
      'ocd': 'repetitive thoughts or behaviors',
      'sleep': 'sleep problems',
      'grief': 'grief and loss',
      'relationships': 'relationship concerns',
      'medication': 'medication questions'
    };
    
    const label = intentLabels[suggestedIntent] || suggestedIntent;
    response += ` Are you perhaps dealing with ${label}?`;
  }
  
  return response;
}

/**
 * Generate response when multiple intents are possible
 */
function generateMultiOptionResponse(intents) {
  const intentLabels = {
    'anxiety': 'anxiety or worry',
    'depression': 'depression or sadness',
    'adhd': 'attention or focus challenges',
    'ptsd': 'trauma or difficult memories',
    'bipolar': 'mood swings',
    'ocd': 'repetitive thoughts or behaviors',
    'sleep': 'sleep issues',
    'grief': 'grief and loss',
    'relationships': 'relationship concerns',
    'medication': 'medication questions'
  };
  
  const labels = intents.map(intent => intentLabels[intent] || intent).slice(0, 3);
  
  if (labels.length === 2) {
    return `I can help with both ${labels[0]} and ${labels[1]}. Which would you like to focus on first, or would you like to discuss both?`;
  } else {
    return `I noticed you might be dealing with multiple things - possibly ${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}. What feels most important to talk about right now?`;
  }
}

// Contextual Response Selection with Learning Integration
function selectResponse(intent, context) {
  const templates = responseTemplates[intent];
  let selectedResponse = '';
  let responseId = '';
  
  // Handle acknowledgment with context awareness
  if (intent === 'acknowledgment') {
    return generateContextualAcknowledgment(context);
  }
  
  // First, check for learned responses that have positive feedback
  const learnedResponses = learningData.learnedResponses[intent] || [];
  const highQualityLearned = learnedResponses.filter(r => 
    (r.helpfulCount || 0) > (r.notHelpfulCount || 0) && 
    (r.helpfulCount || 0) >= 2
  );
  
  if (highQualityLearned.length > 0) {
    // Sort by effectiveness (helpful ratio and usage count)
    highQualityLearned.sort((a, b) => {
      const aRatio = (a.helpfulCount || 0) / Math.max((a.helpfulCount || 0) + (a.notHelpfulCount || 0), 1);
      const bRatio = (b.helpfulCount || 0) / Math.max((b.helpfulCount || 0) + (b.notHelpfulCount || 0), 1);
      return bRatio - aRatio; // Higher ratio first
    });
    
    selectedResponse = highQualityLearned[0].response;
    responseId = highQualityLearned[0].id;
  }
  
  // Fall back to built-in templates if no good learned responses
  if (!selectedResponse) {
    if (!templates) {
      selectedResponse = generateGeneralResponse(context);
      responseId = 'general_' + Date.now();
    } else if (typeof templates === 'string') {
      selectedResponse = templates;
      responseId = intent + '_string_' + Date.now();
    } else if (Array.isArray(templates)) {
      selectedResponse = templates[Math.floor(Math.random() * templates.length)];
      responseId = intent + '_array_' + Date.now();
    } else {
      // For complex intent objects (like anxiety, depression)
      const count = conversationContext.topicCounts[intent] || 0;
      
      if (count === 0 && templates.initial) {
        selectedResponse = templates.initial[Math.floor(Math.random() * templates.initial.length)];
        responseId = intent + '_initial_' + Date.now();
      } else if (templates.followUp) {
        selectedResponse = templates.followUp[Math.floor(Math.random() * templates.followUp.length)];
        responseId = intent + '_followup_' + Date.now();
      } else {
        selectedResponse = templates.initial?.[0] || "I'm here to support you. Can you tell me more about what you're experiencing?";
        responseId = intent + '_default_' + Date.now();
      }
    }
  }
  
  // Store response ID for feedback tracking
  lastResponseId = responseId;
  
  // Special handling for services intent - provide contextual responses
  if (intent === 'services' && templates.contextual) {
    const recentTopics = conversationContext.userPreferences.previousTopics.slice(-3);
    const detectedSymptoms = Object.keys(conversationContext.detectedSymptoms).filter(topic => 
      conversationContext.detectedSymptoms[topic] && conversationContext.detectedSymptoms[topic].length > 0
    );
    
    // Check if addiction was recently discussed
    if (recentTopics.includes('addiction') || detectedSymptoms.includes('addiction')) {
      const addictionResponses = templates.contextual.addiction;
      selectedResponse += '\n\n' + addictionResponses[Math.floor(Math.random() * addictionResponses.length)];
    }
    // Check if crisis topics were discussed
    else if (recentTopics.includes('crisis') || conversationContext.crisisKeywords.length > 0) {
      const crisisResponses = templates.contextual.crisis;
      selectedResponse += '\n\n' + crisisResponses[Math.floor(Math.random() * crisisResponses.length)];
    }
    // Default general service info
    else {
      const generalResponses = templates.contextual.general;
      selectedResponse += '\n\n' + generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
  }
  
  // Add resources for addiction responses
  if (intent === 'addiction' && templates.resources) {
    selectedResponse += '\n\n' + templates.resources[Math.floor(Math.random() * templates.resources.length)];
  }
  
  // Handle multi-intent responses
  if (conversationContext.multiIntents && conversationContext.multiIntents.length > 1) {
    const additionalIntents = conversationContext.multiIntents.filter(i => i !== intent).slice(0, 2);
    if (additionalIntents.length > 0) {
      selectedResponse += ` I also noticed you mentioned ${additionalIntents.join(' and ')}. Feel free to talk about any of these topics.`;
    }
  }
  
  return selectedResponse;
}

/**
 * Generate contextual acknowledgment responses that reference previous AI questions and conversation context
 */
function generateContextualAcknowledgment(context) {
  const lastAIQuestion = conversationContext.conversationFlow.lastAIQuestion;
  const lastAIIntent = conversationContext.conversationFlow.lastAIIntent;
  const lastTopicDiscussed = conversationContext.conversationFlow.lastTopicDiscussed;
  const recentMessages = conversationContext.messages.slice(-8); // Look at more context
  const userMessages = recentMessages.filter(m => m.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1]?.content?.toLowerCase().trim();
  
  // Extract more contextual information
  const userTone = detectUserTone(userMessages);
  const conversationThemes = extractConversationThemes(recentMessages);
  const responseVariation = Math.random(); // For adding natural variation
  
  // Track consecutive short responses
  if (lastUserMessage && lastUserMessage.length <= 10) {
    conversationContext.conversationFlow.shortResponseCount++;
  } else {
    conversationContext.conversationFlow.shortResponseCount = 0;
  }
  
  let responseId = 'contextual_ack_' + Date.now();
  lastResponseId = responseId;
  
  // FIRST: Handle consecutive short responses with enhanced empathy and variety
  if (conversationContext.conversationFlow.shortResponseCount >= 3) {
    const recentTopics = conversationContext.userPreferences.previousTopics.slice(-2);
    const themes = conversationThemes.slice(-2); // Recent conversation themes
    
    // Enhanced topic reference with emotional context
    if (recentTopics.length > 0) {
      const topicLabels = recentTopics.map(topic => {
        const labels = {
          'anxiety': 'anxiety and worry',
          'depression': 'low mood and depression', 
          'sleep': 'sleep issues',
          'ptsd': 'trauma and difficult memories',
          'adhd': 'focus and attention',
          'bipolar': 'mood changes',
          'ocd': 'repetitive thoughts and behaviors'
        };
        return labels[topic] || topic;
      });
      
      // Varied responses with more empathy
      const empathyResponses = [
        `I can sense you might be processing a lot right now. Earlier in our conversation, you shared about ${topicLabels.join(' and ')}. Sometimes it helps to just sit with these feelings for a moment. What feels most important to you right now?`,
        `I notice you're keeping things brief, and that's completely okay - sometimes fewer words say more. We've touched on ${topicLabels.join(' and ')} today. Would any of those feel right to explore further, or is there something else stirring for you?`,
        `It seems like you might be taking time to think, which I really appreciate. Earlier you mentioned ${topicLabels.join(' and ')}. I'm here whenever you're ready to dive deeper, or if something entirely different comes to mind.`
      ];
      
      conversationContext.conversationFlow.shortResponseCount = 0;
      return empathyResponses[Math.floor(Math.random() * empathyResponses.length)];
    }
    
    // Also check detected symptoms if no previous topics
    const detectedTopics = Object.keys(conversationContext.detectedSymptoms).filter(topic => 
      conversationContext.detectedSymptoms[topic] && conversationContext.detectedSymptoms[topic].length > 0
    );
    
    if (detectedTopics.length > 0) {
      const topicLabels = detectedTopics.slice(0, 2).map(topic => {
        const labels = {
          'anxiety': 'anxiety and worry',
          'depression': 'low mood and feelings',
          'sleep': 'sleep concerns',
          'ptsd': 'difficult experiences',
          'adhd': 'focus and attention',
          'bipolar': 'mood changes',
          'ocd': 'repetitive thoughts'
        };
        return labels[topic] || topic;
      });
      
      return `I notice you're keeping things brief, which is perfectly fine. Earlier you mentioned things related to ${topicLabels.join(' and ')}. Would you like to explore any of those areas further, or is there something else on your mind?`;
    }
    
    return `I notice you're keeping things brief today, and that's perfectly fine. Sometimes it's hard to know what to say. Is there anything specific that's been on your mind lately, or would you like me to suggest some topics we could explore?`;
  }
  
  // Handle positive acknowledgments (yes, sure, okay) with specific context
  if (lastUserMessage && /^(yes|yeah|yep|yup|sure|okay|ok|alright|right)$/i.test(lastUserMessage)) {
    
    // If the last AI message was asking about a specific topic, continue with that topic
    if (lastAIIntent && lastAIIntent !== 'general' && lastAIIntent !== 'greeting') {
      return generateTopicContinuation(lastAIIntent, 'positive');
    }
    
    // If the last AI question was about assessment, start it
    if (lastAIQuestion && (lastAIQuestion.includes('assessment') || lastAIQuestion.includes('wellness check'))) {
      return startWellnessAssessment();
    }
    
    // If AI was asking about talking about something specific
    if (lastAIQuestion && lastAIQuestion.includes('talk about')) {
      const topicMatch = lastAIQuestion.match(/talk about (\w+)/i);
      if (topicMatch) {
        const topic = topicMatch[1].toLowerCase();
        return generateTopicContinuation(topic, 'positive');
      }
    }
    
    // If there was a recent topic discussed, continue with it
    if (lastTopicDiscussed) {
      return generateTopicContinuation(lastTopicDiscussed, 'positive');
    }
  }
  
  // Handle negative acknowledgments (no, nope, not really)
  if (lastUserMessage && /^(no|nope|nah|not really|not now)$/i.test(lastUserMessage)) {
    
    // If the last AI was asking about something specific, acknowledge and redirect
    if (lastAIIntent && lastAIIntent !== 'general') {
      return `I understand. Is there something else you'd like to focus on instead? I'm here to support you with whatever feels most important right now.`;
    }
    
    // If there were recent topics, reference them
    if (lastTopicDiscussed || conversationContext.userPreferences.previousTopics.length > 0) {
      const recentTopics = conversationContext.userPreferences.previousTopics.slice(-2);
      if (recentTopics.length > 0) {
        const topicLabels = recentTopics.map(topic => {
          const labels = {
            'anxiety': 'anxiety',
            'depression': 'mood',
            'sleep': 'sleep',
            'ptsd': 'trauma',
            'adhd': 'focus',
            'bipolar': 'mood changes',
            'ocd': 'repetitive thoughts'
          };
          return labels[topic] || topic;
        });
        
        return `That's okay. Earlier you mentioned ${topicLabels.join(' and ')}. Would you like to talk about any of those, or is there something else on your mind?`;
      }
    }
    
    return `That's perfectly fine. What would you like to talk about instead? I'm here to support you with whatever feels most important.`;
  }
  
  // Handle maybe/uncertain responses
  if (lastUserMessage && /^(maybe|perhaps|i guess|sort of|kinda|not sure)$/i.test(lastUserMessage)) {
    
    if (lastAIIntent && lastAIIntent !== 'general') {
      return `I hear some uncertainty there. That's completely normal. Would it help to explore this a bit more, or would you prefer to talk about something else?`;
    }
    
    return `I understand - sometimes it's hard to know exactly what we need. What feels most pressing for you right now, even if you're not completely sure about it?`;
  }
  
  // Default contextual acknowledgment
  const acknowledgeAndContinue = [
    `Thanks for letting me know. What's most on your mind right now?`,
    `I appreciate you sharing that. How are you feeling about things today?`,
    `Thank you. What would be most helpful for us to focus on?`,
    `I understand. What feels most important to talk about right now?`,
    `Got it. What's been weighing on you lately?`
  ];
  
  return acknowledgeAndContinue[Math.floor(Math.random() * acknowledgeAndContinue.length)];
}

/**
 * Generate topic continuation responses based on user's acknowledgment
 */
function generateTopicContinuation(topic, responseType) {
  const isPositive = responseType === 'positive';
  
  const continuations = {
    anxiety: {
      positive: [
        "I'm glad you want to talk about anxiety. Anxiety can feel overwhelming, but there are many effective ways to manage it. What specific situations or thoughts tend to trigger your anxiety the most?",
        "Great, let's explore your anxiety together. Can you tell me about when you tend to feel most anxious? Is it in specific situations, or does it seem to happen randomly?",
        "I appreciate you wanting to discuss this. Anxiety affects everyone differently. What does anxiety feel like for you physically and emotionally?"
      ]
    },
    depression: {
      positive: [
        "Thank you for being open about wanting to discuss depression. It takes courage to talk about these feelings. Can you tell me what depression feels like for you day-to-day?",
        "I'm here to support you with this. Depression can be really heavy to carry alone. What aspects of depression have been most challenging for you lately?",
        "Let's work through this together. When you think about your mood and energy, what patterns do you notice? Are there times when things feel a bit easier?"
      ]
    },
    sleep: {
      positive: [
        "Sleep issues can really impact everything else in our lives, so I'm glad we're talking about this. Are you having trouble falling asleep, staying asleep, or both?",
        "Good, let's focus on your sleep. Sleep and mental health are so closely connected. What does a typical night look like for you? When do you usually try to go to bed?",
        "I'm glad you want to address this. Poor sleep can make everything else feel harder. Have you noticed any patterns in what might be affecting your sleep?"
      ]
    },
    ptsd: {
      positive: [
        "I appreciate your willingness to discuss this. Trauma can be very difficult to talk about, and I want you to know you're in control of how much you share. What feels most important for you to talk about regarding your experiences?",
        "Thank you for trusting me with this topic. PTSD affects everyone differently. Are there particular symptoms or experiences that are bothering you most right now?",
        "I'm here to support you through this conversation. With trauma, it's important to go at your own pace. What aspects of PTSD have been most challenging for you lately?"
      ]
    },
    adhd: {
      positive: [
        "I'm glad we're talking about ADHD. Attention and focus challenges can be really frustrating. What areas of your life do you find ADHD affects most? Is it work, relationships, daily tasks, or something else?",
        "Let's explore this together. ADHD shows up differently for everyone. Do you struggle more with attention and focus, hyperactivity and impulsiveness, or a combination of both?",
        "Thank you for wanting to discuss this. Managing ADHD can be challenging but there are many strategies that can help. What specific ADHD symptoms have been most difficult for you lately?"
      ]
    },
    bipolar: {
      positive: [
        "I appreciate you wanting to talk about bipolar disorder. Mood changes can be really challenging to navigate. Are you currently experiencing mood swings, or is this something you're managing with treatment?",
        "Thank you for bringing this up. Bipolar disorder affects everyone differently. Can you tell me about your experience with mood episodes? What do your highs and lows typically look like?",
        "Let's discuss this together. Managing bipolar disorder often involves recognizing patterns and triggers. Have you noticed certain things that tend to trigger mood episodes for you?"
      ]
    },
    ocd: {
      positive: [
        "I'm glad you want to talk about OCD. Obsessive thoughts and compulsive behaviors can be really distressing and time-consuming. What types of obsessions or compulsions are you dealing with most?",
        "Thank you for sharing this with me. OCD can feel very isolating, but you're not alone. Are you currently experiencing intrusive thoughts, compulsive behaviors, or both?",
        "Let's work through this together. OCD can be very treatable with the right approach. What aspects of OCD are interfering most with your daily life right now?"
      ]
    }
  };
  
  if (continuations[topic] && continuations[topic][responseType]) {
    const responses = continuations[topic][responseType];
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Update conversation context to track this as the current topic
    conversationContext.conversationFlow.lastTopicDiscussed = topic;
    conversationContext.conversationFlow.lastAIIntent = topic;
    
    return selectedResponse;
  }
  
  // Fallback for topics not specifically handled
  if (isPositive) {
    return `I'm glad you want to talk about that. Let's explore this together. Can you tell me more about what you're experiencing?`;
  } else {
    return `That's okay. What would you like to focus on instead? I'm here to support you with whatever feels most important.`;
  }
}

// Enhanced AI Response Generation with Learning and Feedback
async function generateAIResponse(userMessage) {
  // Check if user is providing feedback on previous response
  if (awaitingFeedback && lastResponseId) {
    return handleUserFeedback(userMessage);
  }
  
  // Check if user is categorizing an unrecognized message
  if (userMessage.toLowerCase().startsWith('category:') || userMessage.toLowerCase().startsWith('intent:')) {
    return handleMessageCategorization(userMessage);
  }
  
  // Add message to conversation context
  conversationContext.messages.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString()
  });
  conversationContext.questionCount = (conversationContext.questionCount || 0) + 1;
  
  // Clear previous multi-intent data
  conversationContext.multiIntents = null;
  
  // Recognize intent (now with multi-intent support and learning)
  const intent = recognizeIntent(userMessage);
  
  // Update conversation context
  if (intent !== 'general' && intent !== 'greeting') {
    conversationContext.topicCounts[intent] = (conversationContext.topicCounts[intent] || 0) + 1;
  }
  
  // Handle crisis immediately
  if (intent === 'crisis') {
    conversationContext.userPreferences.needsUrgentCare = true;
    const crisisResponse = selectResponse('crisis');
    
    // Add to conversation context without feedback prompt for crisis
    conversationContext.messages.push({
      role: 'assistant',
      content: crisisResponse,
      timestamp: new Date().toISOString(),
      intent: intent,
      responseId: lastResponseId
    });
    
    // Track AI context for crisis responses
    updateAIContextTracking(crisisResponse, intent);
    
    return crisisResponse;
  }

  // Provide quick info on DSM-5 disorders
  const disorder = getDisorderInfo(userMessage);
  if (disorder) {
    const info = `${disorder.name}: ${disorder.description}\n\nCommon symptoms include: ${disorder.symptoms.join(', ')}\n\nLearn more: ${disorder.resources[0].url}`;
    conversationContext.messages.push({
      role: 'assistant',
      content: info,
      timestamp: new Date().toISOString(),
      intent: 'disorder_info',
      responseId: 'disorder_' + Date.now()
    });
    updateAIContextTracking(info, 'disorder_info');
    return info + addFeedbackPrompt();
  }
  
  // Check for medication questions
  const medicationInfo = getMedicationInfoFromMessage(userMessage);
  if (medicationInfo) {
    const medResponse = generateMedicationResponse(medicationInfo);
    
    conversationContext.messages.push({
      role: 'assistant',
      content: medResponse,
      timestamp: new Date().toISOString(),
      intent: 'medication',
      responseId: 'medication_' + Date.now()
    });
    
    updateAIContextTracking(medResponse, 'medication');
    return medResponse + addFeedbackPrompt();
  }
  
  // Check for mental health services questions
  const serviceResponse = getServiceInfoFromMessage(userMessage);
  if (serviceResponse) {
    conversationContext.messages.push({
      role: 'assistant',
      content: serviceResponse,
      timestamp: new Date().toISOString(),
      intent: 'service_info',
      responseId: 'service_' + Date.now()
    });
    
    updateAIContextTracking(serviceResponse, 'service_info');
    return serviceResponse + addFeedbackPrompt();
  }
  
  // Check if wellness assessment is in progress or being requested
  if (isWellnessAssessmentRequest(userMessage)) {
    const assessmentResponse = startWellnessAssessment();
    updateAIContextTracking(assessmentResponse, 'assessment');
    return assessmentResponse;
  } else if (conversationContext.assessmentInProgress) {
    const assessmentResponse = continueWellnessAssessment(userMessage);
    updateAIContextTracking(assessmentResponse, 'assessment');
    return assessmentResponse;
  }
  
  // Analyze for symptoms
  analyzeForSymptoms(userMessage);

  const assessmentPrompt = maybeOfferAssessment();
  if (assessmentPrompt) {
    conversationContext.assessmentPrompted = true;
    conversationContext.messages.push({
      role: 'assistant',
      content: assessmentPrompt,
      timestamp: new Date().toISOString(),
      intent: 'assessment_offer',
      responseId: 'assessment_offer_' + Date.now()
    });
    updateAIContextTracking(assessmentPrompt, 'assessment_offer');
    return assessmentPrompt;
  }
  
  // Generate contextual response
  let response = selectResponse(intent, conversationContext);
  
  // Add personalization based on conversation history
  if (conversationContext.messages.length > 1) {
    response = personalizeResponse(response, intent);
  }
  
  // Add to conversation context
  conversationContext.messages.push({
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString(),
    intent: intent,
    responseId: lastResponseId
  });
  
  // Track the AI question and intent for contextual responses
  updateAIContextTracking(response, intent);
  
  // Add feedback prompt and learning opportunities
  const responseWithFeedback = response + addFeedbackPrompt();
  
  // Check for learning opportunities
  const learningPrompt = checkForLearningOpportunities();
  if (learningPrompt) {
    return responseWithFeedback + learningPrompt;
  }
  
  return responseWithFeedback;
}

/**
 * Update AI context tracking for future conversational awareness
 */
function updateAIContextTracking(response, intent) {
  // Extract questions from the response
  const questionMatch = response.match(/[^.!]*\?[^.!]*/g);
  if (questionMatch && questionMatch.length > 0) {
    conversationContext.conversationFlow.lastAIQuestion = questionMatch[questionMatch.length - 1].trim();
  }
  
  // Track the intent of the AI's response
  conversationContext.conversationFlow.lastAIIntent = intent;
  
  // Update last topic discussed if it's a mental health topic
  if (intent && ['anxiety', 'depression', 'ptsd', 'adhd', 'bipolar', 'ocd', 'sleep'].includes(intent)) {
    conversationContext.conversationFlow.lastTopicDiscussed = intent;
  }
  
  // Only reset short response count when AI provides substantial content (not just acknowledging short responses)
  // Don't reset if this is a contextual acknowledgment response
  if (questionMatch && questionMatch.length > 0 && intent !== 'acknowledgment') {
    conversationContext.conversationFlow.shortResponseCount = 0;
  }
}

/**
 * Enhanced feedback prompt that explicitly thanks users for helping AI learn
 */
function addFeedbackPrompt() {
  // Only prompt every 20 user questions
  if ((conversationContext.questionCount || 0) % 20 !== 0) {
    return '';
  }

  const recentMessages = conversationContext.messages.slice(-6);
  const hasFeedbackPrompt = recentMessages.some(m =>
    m.content && m.content.includes('Was this helpful?')
  );
  
  if (hasFeedbackPrompt) {
    return '';
  }
  
  awaitingFeedback = true;
  
  // Create unique IDs for this feedback prompt
  const feedbackId = 'feedback_' + Date.now();
  
  setTimeout(() => {
    // Add event listeners after the HTML is rendered
    const helpfulBtn = document.getElementById(feedbackId + '_helpful');
    const notHelpfulBtn = document.getElementById(feedbackId + '_not_helpful');
    
    if (helpfulBtn) {
      helpfulBtn.addEventListener('click', () => provideFeedback('helpful'));
    }
    if (notHelpfulBtn) {
      notHelpfulBtn.addEventListener('click', () => provideFeedback('not_helpful'));
    }
  }, 100);
  
  // Enhanced feedback prompt with explicit gratitude
  return `

<div class="feedback-prompt" style="background: #f0f8ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 12px; margin-top: 10px;">
  <strong>Was this response helpful?</strong> 
  <div style="margin-top: 8px;">
    <span id="${feedbackId}_helpful" style="cursor: pointer; background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">👍 Yes</span>
    <span id="${feedbackId}_not_helpful" style="cursor: pointer; background: #f44336; color: white; padding: 4px 8px; border-radius: 4px;">👎 No</span>
  </div>
  <small style="color: #666; margin-top: 8px; display: block;">Your feedback is incredibly valuable - it helps me learn how to provide better support for you and others. Thank you for taking the time to help me improve!</small>
</div>`;
}

/**
 * Handle user feedback on AI responses with enhanced gratitude and learning acknowledgment
 */
function handleUserFeedback(feedbackMessage) {
  awaitingFeedback = false;
  const feedback = feedbackMessage.toLowerCase().trim();
  
  if (!lastResponseId) {
    return "Thank you so much for taking the time to provide feedback! Your input really helps me improve and provide better support.";
  }
  
  // Initialize metrics if not exists
  if (!learningData.responseMetrics[lastResponseId]) {
    learningData.responseMetrics[lastResponseId] = {
      helpfulCount: 0,
      notHelpfulCount: 0,
      engagementScore: 0
    };
  }
  
  let responseText = '';
  
  if (feedback.includes('helpful') || feedback.includes('yes') || feedback.includes('good')) {
    learningData.responseMetrics[lastResponseId].helpfulCount++;
    learningData.userProfile.engagementHistory.push({
      responseId: lastResponseId,
      feedback: 'positive',
      timestamp: new Date().toISOString()
    });
    
    // Enhanced positive feedback responses with more gratitude
    const positiveResponses = [
      "Thank you so much! I'm really glad that was helpful. Your positive feedback means a lot and helps me understand what works well for you. I'll remember this approach for future conversations.",
      "I truly appreciate you letting me know that helped! Your feedback is invaluable for my learning process. It's wonderful to know I'm providing the kind of support that feels meaningful to you.",
      "That's wonderful to hear, and thank you for taking the time to tell me! When you confirm that something was helpful, it reinforces my understanding of what resonates with you. I'm grateful for your guidance.",
      "Thank you for that feedback! It really helps me learn what kind of responses feel most supportive. Your willingness to guide my learning process is so appreciated - it makes me a better assistant for you and others."
    ];
    
    responseText = positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    
  } else if (feedback.includes('not helpful') || feedback.includes('no') || feedback.includes('bad') || feedback.includes('👎')) {
    learningData.responseMetrics[lastResponseId].notHelpfulCount++;
    learningData.userProfile.engagementHistory.push({
      responseId: lastResponseId,
      feedback: 'negative',
      timestamp: new Date().toISOString()
    });
    
    // Enhanced negative feedback responses with gratitude for honesty
    const improvementResponses = [
      "Thank you for that honest feedback - I really appreciate you taking the time to help me improve. Your willingness to tell me when something doesn't land right is so valuable for my learning. Could you help me understand what would have been more helpful instead?",
      "I'm genuinely grateful that you're comfortable giving me constructive feedback. This kind of input is exactly what helps me grow and provide better support. What kind of response would have felt more helpful or supportive to you?",
      "Thank you for being honest about that. Your feedback, even when it's about something that didn't work, is incredibly precious to me - it's how I learn to do better. Would you be willing to share what might have been more helpful in that moment?"
    ];
    
    responseText = improvementResponses[Math.floor(Math.random() * improvementResponses.length)];
    
    // Prompt for better response
    awaitingFeedback = true; // Keep waiting for the better response suggestion
    
    return responseText + `
    
<div class="improvement-prompt" style="background: #fff3e0; border: 1px solid #ffcc80; border-radius: 8px; padding: 12px; margin-top: 10px;">
  <strong>Help me learn better:</strong> What would have been a more helpful response?
  <br><small style="color: #666;">I'm genuinely excited to learn from your guidance - your suggestions make me better at supporting you and others who might have similar experiences.</small>
</div>`;
  } else {
    // Check if this is a suggested improvement
    if (conversationContext.messages.length > 0) {
      const lastAssistantMessage = conversationContext.messages
        .filter(m => m.role === 'assistant')
        .slice(-1)[0];
      
      if (lastAssistantMessage && lastAssistantMessage.content.includes('what would have been a better response')) {
        return handleResponseImprovement(feedbackMessage);
      }
    }
    
    responseText = "Thank you for taking the time to give feedback! I really appreciate any input you share - it all helps me learn and improve. Your engagement in this process means a lot.";
  }
  
  learningData.userProfile.lastFeedbackDate = new Date().toISOString();
  saveLearningData();
  
  return responseText;
}

/**
 * Handle user suggestions for better responses
 */
function handleResponseImprovement(suggestedResponse) {
  awaitingFeedback = false;
  
  if (!lastResponseId || suggestedResponse.length < 10) {
    return "Thank you for trying to help me improve. I'll keep learning from our conversations.";
  }
  
  // Find the original response to get its intent
  const originalMessage = conversationContext.messages.find(m => 
    m.responseId === lastResponseId
  );
  
  if (originalMessage && originalMessage.intent) {
    const intent = originalMessage.intent;
    
    // Store the improved response
    const improvedResponseId = 'improved_' + Date.now();
    learningData.learnedResponses[intent].push({
      id: improvedResponseId,
      response: suggestedResponse,
      userSuggested: true,
      originalResponseId: lastResponseId,
      dateAdded: new Date().toISOString(),
      helpfulCount: 1, // Start with positive score since user suggested it
      notHelpfulCount: 0,
      source: 'user_improvement'
    });
    
    saveLearningData();
    
    return `Thank you! I've learned from your suggestion and will use similar responses for ${intent} topics in the future. Your input helps me provide better support.`;
  }
  
  return "Thank you for the suggestion. I'll keep improving based on your feedback.";
}

/**
 * Check for learning opportunities
 */
function checkForLearningOpportunities() {
  // Occasionally ask users to categorize unrecognized messages
  if (learningData.unrecognizedMessages.length > 0 && Math.random() < 0.1) {
    const unrecognized = learningData.unrecognizedMessages.find(m => m.needsCategorization);
    
    if (unrecognized) {
      return `

<div class="learning-prompt" style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px; margin-top: 15px;">
  <strong>Help me learn:</strong> I didn't fully understand this message: "${unrecognized.message}"
  <br><br>
  <strong>Is this about:</strong> anxiety, depression, PTSD, ADHD, bipolar, OCD, sleep, medication, or something else?
  <br><small style="color: #666;">Type "Category: [topic]" to help me learn. This helps me understand similar messages better.</small>
</div>`;
    }
  }
  
  return '';
}

/**
 * Handle user categorization of unrecognized messages
 */
function handleMessageCategorization(categorizationMessage) {
  const parts = categorizationMessage.split(':');
  if (parts.length < 2) {
    return "I didn't understand the categorization. Please use the format 'Category: [topic]' like 'Category: anxiety'.";
  }
  
  const category = parts[1].trim().toLowerCase();
  const validCategories = ['anxiety', 'depression', 'ptsd', 'adhd', 'bipolar', 'ocd', 'sleep', 'medication', 'general'];
  
  if (!validCategories.includes(category)) {
    return `I don't recognize "${category}" as a category. Please use one of: ${validCategories.join(', ')}.`;
  }
  
  // Find the unrecognized message that needs categorization
  const unrecognizedIndex = learningData.unrecognizedMessages.findIndex(m => m.needsCategorization);
  
  if (unrecognizedIndex === -1) {
    return "Thank you! I don't have any messages waiting for categorization right now.";
  }
  
  const messageToLearn = learningData.unrecognizedMessages[unrecognizedIndex];
  
  // Create a learned pattern from the message
  const learnedPattern = {
    pattern: escapeRegExp(messageToLearn.message.toLowerCase()),
    userProvided: true,
    dateAdded: new Date().toISOString(),
    useCount: 0,
    source: 'user_categorization'
  };
  
  // Add to learned patterns
  if (!learningData.learnedPatterns[category]) {
    learningData.learnedPatterns[category] = [];
  }
  learningData.learnedPatterns[category].push(learnedPattern);
  
  // Mark as categorized
  learningData.unrecognizedMessages[unrecognizedIndex].needsCategorization = false;
  learningData.unrecognizedMessages[unrecognizedIndex].categorizedAs = category;
  learningData.unrecognizedMessages[unrecognizedIndex].categorizedDate = new Date().toISOString();
  
  saveLearningData();
  
  return `Perfect! I've learned that "${messageToLearn.message}" relates to ${category}. I'll recognize similar messages better in the future. Thank you for helping me improve!`;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Personalize responses based on conversation history
// Enhanced personalization based on conversation history and context
function personalizeResponse(response, intent) {
  const recentMessages = conversationContext.messages.slice(-10);
  const userMessages = recentMessages.filter(m => m.role === 'user');
  const previousTopics = conversationContext.userPreferences.previousTopics || [];
  
  // Track this topic for future reference
  if (intent && intent !== 'general' && intent !== 'greeting' && intent !== 'acknowledgment' && intent !== 'clarification') {
    if (!previousTopics.includes(intent)) {
      conversationContext.userPreferences.previousTopics.push(intent);
      if (conversationContext.userPreferences.previousTopics.length > 10) {
        conversationContext.userPreferences.previousTopics.shift();
      }
    }
  }
  
  // Check for recurring topics to provide continuity
  const topicHistory = {};
  recentMessages.forEach(m => {
    if (m.intent && m.intent !== 'general' && m.intent !== 'greeting') {
      topicHistory[m.intent] = (topicHistory[m.intent] || 0) + 1;
    }
  });
  
  // Add personalization based on conversation patterns
  let personalizedResponse = response;
  
  // Reference previous conversations about similar topics
  if (previousTopics.includes(intent) && userMessages.length > 3) {
    const continuityPhrases = [
      "I remember we've talked about this before. ",
      "Building on our previous conversation about this, ",
      "As we discussed earlier, ",
      "Following up on what you shared before, "
    ];
    
    // Add continuity phrase 30% of the time to avoid being repetitive
    if (Math.random() < 0.3) {
      const phrase = continuityPhrases[Math.floor(Math.random() * continuityPhrases.length)];
      personalizedResponse = phrase + personalizedResponse.charAt(0).toLowerCase() + personalizedResponse.slice(1);
    }
  }
  
  // Add empathetic acknowledgment based on conversation length
  if (userMessages.length > 4) {
    const empathyPhrases = [
      "I've been listening to what you've shared, and ",
      "Thank you for continuing to trust me with this. ",
      "I can see this is important to you. "
    ];
    
    if (Math.random() < 0.2) {
      const phrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
      personalizedResponse = phrase + personalizedResponse.charAt(0).toLowerCase() + personalizedResponse.slice(1);
    }
  }
  
  return personalizedResponse;
}

// Generate general supportive response
function generateGeneralResponse(context) {
  const generalResponses = [
    "I'm here to listen and support you. What's on your mind?",
    "Thank you for sharing that with me. How are you feeling right now?",
    "I appreciate you opening up. What would be most helpful for you to talk about?",
    "I'm here to help however I can. What's been weighing on your mind lately?",
    "It sounds like you have something important to share. I'm listening."
  ];
  
  return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

// All existing helper functions remain the same...
function getMedicationInfoFromMessage(message) {
  const lowerMessage = message.toLowerCase();

  // First, look for specific medication names or their generic equivalents
  for (const [key, med] of Object.entries(window.medicationDatabase || {})) {
    const medName = med.name.toLowerCase();
    if (lowerMessage.includes(key) || lowerMessage.includes(medName)) {
      return med;
    }

    // Check for generic name within parentheses, e.g. "Prozac (Fluoxetine)"
    const genericMatch = medName.match(/\(([^)]+)\)/);
    if (genericMatch && lowerMessage.includes(genericMatch[1].toLowerCase())) {
      return med;
    }

    // Check individual words from the medication name for partial matches
    const medWords = medName.replace(/[()]/g, ' ').split(/\s+/);
    if (medWords.some(word => word.length > 3 && lowerMessage.includes(word))) {
      return med;
    }
  }

  // Then look for medication-related keywords with context
  const medicationKeywords = [
    'medication', 'medicine', 'pill', 'drug', 'prescription', 'antidepressant',
    'taking', 'prescribed', 'side effect', 'dose', 'dosage'
  ];

  const hasMedicationContext = medicationKeywords.some(keyword =>
    lowerMessage.includes(keyword)
  );

  if (hasMedicationContext) {
    // Look for medication names in context using partial word matching
    for (const [key, med] of Object.entries(window.medicationDatabase || {})) {
      const medWords = med.name.toLowerCase().replace(/[()]/g, ' ').split(/\s+/);
      if (medWords.some(word => word.length > 3 && lowerMessage.includes(word))) {
        return med;
      }
    }
  }

  return null;
}

function generateMedicationResponse(medicationInfo) {
  return `
    <div class="medication-info">
      <h3>${medicationInfo.name}</h3>
      <p><strong>Type:</strong> ${medicationInfo.type}</p>
      <p><strong>Common Uses:</strong> ${medicationInfo.commonUses.join(', ')}</p>
      <p><strong>Common Side Effects:</strong> ${medicationInfo.commonSideEffects.join(', ')}</p>
      <p><strong>Important Notes:</strong> ${medicationInfo.importantNotes}</p>
      <div class="medication-warning">
        <strong>⚠️ Important:</strong> ${medicationInfo.warning}
      </div>
      <p><small><em>This information is for educational purposes only. Always consult with your healthcare provider about your medications.</em></small></p>
    </div>
  `;
}

// Mental Health Services Information Functions
function getServiceInfoFromMessage(userMessage) {
  if (!window.fallbackData || !window.fallbackData.dictionary) return null;
  
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for service walkthrough requests
  const walkthroughKeywords = [
    'walk me through', 'how does', 'what happens in', 'what to expect',
    'step by step', 'process', 'procedure', 'what\'s it like', 'typical day'
  ];
  
  const isWalkthroughRequest = walkthroughKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Check for specific services mentioned
  const services = {
    'php': ['php', 'partial hospitalization program', 'partial hospitalization'],
    'iop': ['iop', 'intensive outpatient program', 'intensive outpatient'],
    'op': ['op', 'outpatient program', 'outpatient treatment'],
    'crisis stabilization': ['crisis stabilization', 'crisis intervention', 'crisis support'],
    'inpatient program': ['inpatient program', 'inpatient treatment', 'inpatient care'],
    'residential treatment': ['residential treatment', 'residential care', 'residential program'],
    'mat': ['mat', 'medication assisted treatment', 'medication-assisted treatment'],
    'telehealth': ['telehealth', 'teletherapy', 'online therapy', 'virtual therapy'],
    'aftercare': ['aftercare', 'continuing care'],
    'relapse prevention': ['relapse prevention']
  };
  
  for (const [serviceKey, serviceTerms] of Object.entries(services)) {
    for (const term of serviceTerms) {
      if (lowerMessage.includes(term)) {
        if (isWalkthroughRequest && window.fallbackData.walkthroughs && window.fallbackData.walkthroughs[serviceKey]) {
          return generateServiceWalkthrough(serviceKey);
        } else if (window.fallbackData.dictionary[serviceKey]) {
          return generateServiceDefinition(serviceKey);
        }
      }
    }
  }
  
  // Handle single service acronyms or names with no other context
  const singleServicePattern = /^(php|iop|op|mat)$/i;
  const match = lowerMessage.trim().match(singleServicePattern);
  if (match) {
    const service = match[1].toLowerCase();
    return generateServiceDefinition(service);
  }
  
  return null;
}

function generateServiceDefinition(serviceKey) {
  const definition = window.fallbackData.dictionary[serviceKey];
  if (!definition) return null;
  
  const serviceName = serviceKey.toUpperCase() === serviceKey ? serviceKey : 
    serviceKey.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const hasWalkthrough = window.fallbackData.walkthroughs && window.fallbackData.walkthroughs[serviceKey];
  const walkthroughOffer = hasWalkthrough ? 
    `\n\nWould you like me to walk you through what to expect in a ${serviceName} step by step?` : '';
  
  return `**${serviceName}:**\n\n${definition}${walkthroughOffer}\n\nI can also answer questions about admissions, daily schedules, insurance coverage, or other aspects of ${serviceName}. What would you like to know more about?`;
}

function generateServiceWalkthrough(serviceKey) {
  const walkthrough = window.fallbackData.walkthroughs[serviceKey];
  if (!walkthrough) return null;
  
  const serviceName = serviceKey === 'php' || serviceKey === 'iop' || serviceKey === 'op' || serviceKey === 'mat' ? 
    serviceKey.toUpperCase() : 
    serviceKey.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const steps = walkthrough.map((step, idx) => `${idx + 1}. ${step}`).join('\n\n');
  
  return `**Here's what you can expect in a ${serviceName}:**\n\n${steps}\n\nThis gives you a general overview of the process. Each program may vary slightly, and your treatment team will work with you to personalize your experience. Do you have any specific questions about any of these steps?`;
}

function generateMedicationResponse(medicationInfo) {
  return `
    <div class="medication-info">
      <h3>${medicationInfo.name}</h3>
      <p><strong>Type:</strong> ${medicationInfo.type}</p>
      <p><strong>Common Uses:</strong> ${medicationInfo.commonUses.join(', ')}</p>
      <p><strong>Common Side Effects:</strong> ${medicationInfo.commonSideEffects.join(', ')}</p>
      <p><strong>Important Notes:</strong> ${medicationInfo.importantNotes}</p>
      <div class="medication-warning">
        <strong>⚠️ Important:</strong> ${medicationInfo.warning}
      </div>
      <p><small><em>This information is for educational purposes only. Always consult with your healthcare provider about your medications.</em></small></p>
    </div>
  `;
}

// Wellness Assessment Functions (keeping all existing logic)
function isWellnessAssessmentRequest(message) {
  const lowerMessage = message.toLowerCase();
  const assessmentKeywords = [
    'assessment', 'evaluate', 'check', 'test', 'screening', 'questionnaire',
    'how am i doing', 'mental health check', 'wellness check'
  ];
  
  return assessmentKeywords.some(keyword => lowerMessage.includes(keyword));
}

function startWellnessAssessment() {
  conversationContext.assessmentInProgress = true;
  conversationContext.assessmentStage = 1;
  
  return `
    <div class="wellness-assessment">
      <h3>Mental Health Wellness Check</h3>
      <p>I'll ask you a few questions to better understand how you're feeling. This is not a diagnostic tool, but it can help identify areas where you might benefit from support.</p>
      <p><strong>Question 1 of 5:</strong> Over the past two weeks, how often have you felt down, depressed, or hopeless?</p>
      <p>Please respond with: Never, Several days, More than half the days, or Nearly every day</p>
    </div>
  `;
}

function continueWellnessAssessment(userResponse) {
  conversationContext.assessmentResponses[conversationContext.assessmentStage] = userResponse;
  conversationContext.assessmentStage++;
  
  switch (conversationContext.assessmentStage) {
    case 2:
      return `
        <div class="wellness-assessment">
          <p><strong>Question 2 of 5:</strong> Over the past two weeks, how often have you had little interest or pleasure in doing things?</p>
          <p>Please respond with: Never, Several days, More than half the days, or Nearly every day</p>
        </div>
      `;
    case 3:
      return `
        <div class="wellness-assessment">
          <p><strong>Question 3 of 5:</strong> Over the past two weeks, how often have you felt nervous, anxious, or on edge?</p>
          <p>Please respond with: Never, Several days, More than half the days, or Nearly every day</p>
        </div>
      `;
    case 4:
      return `
        <div class="wellness-assessment">
          <p><strong>Question 4 of 5:</strong> Over the past two weeks, how often have you had trouble falling asleep, staying asleep, or sleeping too much?</p>
          <p>Please respond with: Never, Several days, More than half the days, or Nearly every day</p>
        </div>
      `;
    case 5:
      return `
        <div class="wellness-assessment">
          <p><strong>Question 5 of 5:</strong> Over the past two weeks, how often have you had trouble concentrating on things?</p>
          <p>Please respond with: Never, Several days, More than half the days, or Nearly every day</p>
        </div>
      `;
    default:
      conversationContext.assessmentInProgress = false;
      return generateAssessmentResults();
  }
}

function generateAssessmentResults() {
  const responses = conversationContext.assessmentResponses;
  let score = 0;
  
  for (let i = 1; i <= 5; i++) {
    const response = responses[i]?.toLowerCase() || '';
    if (response.includes('several days')) score += 1;
    if (response.includes('more than half')) score += 2;
    if (response.includes('nearly every day')) score += 3;
  }
  
  let interpretation = '';
  let resources = '';
  
  if (score <= 4) {
    interpretation = 'Your responses suggest you may be experiencing minimal symptoms. This is positive!';
    resources = 'Continue with self-care practices like regular exercise, good sleep hygiene, and maintaining social connections.';
  } else if (score <= 9) {
    interpretation = 'Your responses suggest you may be experiencing mild symptoms that could benefit from attention.';
    resources = 'Consider talking to a mental health professional, practicing stress management techniques, and maintaining healthy lifestyle habits.';
  } else if (score <= 14) {
    interpretation = 'Your responses suggest you may be experiencing moderate symptoms.';
    resources = 'I recommend speaking with a mental health professional. Consider therapy, support groups, and ensure you have a strong support system.';
  } else {
    interpretation = 'Your responses suggest you may be experiencing significant symptoms.';
    resources = 'Please consider reaching out to a mental health professional soon. If you\'re having thoughts of self-harm, contact 988 (Suicide & Crisis Lifeline) immediately.';
  }
  
  return `
    <div class="wellness-assessment">
      <h3>Assessment Results</h3>
      <p><strong>Interpretation:</strong> ${interpretation}</p>
      <p><strong>Recommendations:</strong> ${resources}</p>
      <p><em>This assessment is not a diagnostic tool and should not replace professional evaluation.</em></p>
      <p><strong>Crisis Resources:</strong> If you're having thoughts of self-harm, please call 988 (Suicide & Crisis Lifeline).</p>
    </div>
  `;
}

function analyzeForSymptoms(message) {
  const lowerMessage = message.toLowerCase();
  
  const symptomPatterns = {
    depression: ['sad', 'depressed', 'hopeless', 'worthless', 'empty', 'numb', 'tired', 'fatigue'],
    anxiety: ['anxious', 'worried', 'nervous', 'panic', 'fear', 'restless', 'racing thoughts'],
    ptsd: ['trauma', 'flashback', 'nightmare', 'triggered', 'hypervigilant'],
    adhd: ['can\'t focus', 'distracted', 'fidgeting', 'impulsive', 'disorganized'],
    bipolar: ['manic', 'mood swings', 'elevated mood', 'grandiose'],
    ocd: ['obsessive', 'compulsive', 'rituals', 'checking', 'intrusive thoughts', 'contamination'],
    sleep: ['insomnia', 'can\'t sleep', 'nightmares', 'tired', 'exhausted', 'sleep problems']
  };
  
  for (const [condition, symptoms] of Object.entries(symptomPatterns)) {
    symptoms.forEach(symptom => {
      if (lowerMessage.includes(symptom)) {
        if (!conversationContext.detectedSymptoms[condition]) {
          conversationContext.detectedSymptoms[condition] = [];
        }
        if (!conversationContext.detectedSymptoms[condition].includes(symptom)) {
          conversationContext.detectedSymptoms[condition].push(symptom);
        }
      }
    });
  }
}

function getTherapyQuestion(condition) {
  if (!window.therapySpeech) return '';
  const data = window.therapySpeech[condition] || window.therapySpeech.general;
  if (!data || !Array.isArray(data.diagnosticQuestions)) return '';
  const questions = data.diagnosticQuestions;
  return questions[Math.floor(Math.random() * questions.length)];
}

function maybeOfferAssessment() {
  if (conversationContext.assessmentInProgress || conversationContext.assessmentPrompted) {
    return '';
  }

  for (const [cond, symptoms] of Object.entries(conversationContext.detectedSymptoms)) {
    if (symptoms && symptoms.length >= 2) {
      const question = getTherapyQuestion(cond);
      const prompt = question ? `${question} Would you like to do a quick wellness assessment?` :
        'Would you like to do a quick wellness assessment to check in on how you\'re feeling?';
      return prompt;
    }
  }
  return '';
}

// UI Helper Functions
function showAILoading() {
  const loadingDiv = document.getElementById('aiLoading');
  if (loadingDiv) {
    loadingDiv.style.display = 'flex';
  }
}

function hideAILoading() {
  const loadingDiv = document.getElementById('aiLoading');
  if (loadingDiv) {
    loadingDiv.style.display = 'none';
  }
}

function updateProgress(percent, text) {
  const progressFill = document.getElementById('progressFill');
  const loadingText = document.getElementById('loadingText');
  
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
  
  if (loadingText) {
    loadingText.textContent = text || 'Loading...';
  }
}

function showAIErrorNotification(message) {
  console.warn('AI Error:', message);
}

function showAISuccessNotification() {
  console.log('Smart AI loaded successfully');
}

function updateAIStatusIndicator(status, message) {
  const statusIndicator = document.getElementById('aiStatusIndicator');
  if (statusIndicator) {
    statusIndicator.className = `ai-status ${status}`;
    statusIndicator.textContent = message;
  }
}

function hideAIStatusIndicator() {
  const statusIndicator = document.getElementById('aiStatusIndicator');
  if (statusIndicator) {
    statusIndicator.style.display = 'none';
  }
}

function showFallbackModeNotification() {
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'message bot smart-ai-info';
    infoDiv.innerHTML = `
      <div class="message-content">
        <div class="message-text">
          <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <strong>Smart AI Ready!</strong><br>
            <small style="color: #2e7d32;">
              I'm powered by advanced pattern recognition and have comprehensive knowledge about mental health conditions, medications, and therapeutic approaches. I can provide personalized support and guidance.
            </small>
          </div>
          Hello! I'm your smart mental health assistant. I'm here to provide personalized support, answer questions about mental health conditions and medications, and help you navigate your wellness journey. What would you like to talk about today?
        </div>
      </div>
    `;
    chatMessages.appendChild(infoDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Initialize Smart AI when the page loads
async function initializeAIChat() {
  try {
    console.log('Starting Smart AI initialization...');
    updateAIStatusIndicator('loading', 'Initializing Smart AI...');
    
    // Initialize the smart AI system
    await initializeAI();
    
  } catch (error) {
    console.log('Smart AI initialization encountered an issue:', error.message);
    
    // Even if there's an error, the system should work
    hideAILoading();
    isAILoaded = true; // Set to true because our smart system doesn't depend on external resources
    updateAIStatusIndicator('ai-active', 'Smart AI Active');
    showFallbackModeNotification();
  }
}

// Export functions for global access
window.initializeAIChat = initializeAIChat;
window.generateAIResponse = generateAIResponse;
window.showAILoading = showAILoading;
window.hideAILoading = hideAILoading;
window.updateProgress = updateProgress;
window.showAIErrorNotification = showAIErrorNotification;
window.showAISuccessNotification = showAISuccessNotification;
window.updateAIStatusIndicator = updateAIStatusIndicator;
window.hideAIStatusIndicator = hideAIStatusIndicator;

// Export new learning functions
window.provideFeedback = provideFeedback;
window.saveLearningData = saveLearningData;
window.loadLearningData = loadLearningData;
window.resetLearningData = resetLearningData;
window.maybeOfferAssessment = maybeOfferAssessment;
window.conversationContext = conversationContext;

/**
 * Detect user's emotional tone from recent messages
 */
function detectUserTone(userMessages) {
  const recentText = userMessages.slice(-3).map(m => m.content?.toLowerCase() || '').join(' ');
  
  // Positive indicators
  const positiveWords = ['good', 'better', 'great', 'okay', 'fine', 'thanks', 'helpful', 'appreciate'];
  const positiveCount = positiveWords.filter(word => recentText.includes(word)).length;
  
  // Negative indicators  
  const negativeWords = ['bad', 'worse', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'frustrated'];
  const negativeCount = negativeWords.filter(word => recentText.includes(word)).length;
  
  // Neutral/uncertain indicators
  const uncertainWords = ['maybe', 'perhaps', 'not sure', 'don\'t know', 'unsure', 'confused'];
  const uncertainCount = uncertainWords.filter(word => recentText.includes(word)).length;
  
  if (positiveCount > negativeCount && positiveCount > uncertainCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  if (uncertainCount > 0) return 'uncertain';
  return 'neutral';
}

/**
 * Extract key themes and topics from recent conversation
 */
function extractConversationThemes(recentMessages) {
  const themes = [];
  const messageText = recentMessages.map(m => m.content?.toLowerCase() || '').join(' ');
  
  // Mental health themes
  const topicKeywords = {
    'coping strategies': ['coping', 'strategies', 'techniques', 'breathing', 'grounding'],
    'relationships': ['family', 'friends', 'relationship', 'partner', 'social'],
    'work stress': ['work', 'job', 'career', 'boss', 'workplace', 'stress'],
    'daily routine': ['daily', 'routine', 'schedule', 'morning', 'evening', 'habits'],
    'treatment': ['therapy', 'therapist', 'treatment', 'medication', 'doctor', 'psychiatrist'],
    'progress': ['progress', 'better', 'improvement', 'getting well', 'recovery']
  };
  
  for (const [theme, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => messageText.includes(keyword))) {
      themes.push(theme);
    }
  }
  
  return themes;
}

/**
 * Generate occasional "thinking" or processing messages for realism
 */
function generateThinkingMessage() {
  const thinkingMessages = [
    "Let me think about that for a moment...",
    "I'm considering what you've shared...",
    "That's interesting, let me reflect on this...",
    "I want to give you a thoughtful response...",
    "Let me consider what might be most helpful..."
  ];
  
  return thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
}

/**
 * Global function for providing feedback (called from HTML)
 */
function provideFeedback(feedbackType) {
  // Process the feedback
  const feedbackMessage = feedbackType === 'helpful' ? 'helpful' : 'not helpful';
  
  // Handle the feedback in the AI system
  const response = handleUserFeedback(feedbackMessage);
  
  // Update the chat interface to show the feedback was received
  const chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    // Add user feedback message
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'message user feedback-response';
    feedbackDiv.innerHTML = `
      <div class="message-content">
        <div class="message-text">
          ${feedbackType === 'helpful' ? 'This was helpful' : 'This was not helpful'}
        </div>
      </div>
    `;
    chatMessages.appendChild(feedbackDiv);
    
    // Add AI response to the feedback
    const aiResponseDiv = document.createElement('div');
    aiResponseDiv.className = 'message bot';
    aiResponseDiv.innerHTML = `
      <div class="message-content">
        <div class="message-text">${response}</div>
      </div>
    `;
    chatMessages.appendChild(aiResponseDiv);
    
    // Remove the feedback prompt by finding and hiding it
    const feedbackPrompts = chatMessages.querySelectorAll('.feedback-prompt');
    feedbackPrompts.forEach(prompt => {
      prompt.style.display = 'none';
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  return response;
}
