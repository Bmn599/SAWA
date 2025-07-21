const dsm5Disorders = {
  adhd: {
    name: "Attention-Deficit/Hyperactivity Disorder (ADHD)",
    description: "ADHD is characterized by persistent inattention and/or hyperactivity-impulsivity that interferes with functioning.",
    symptoms: [
      "Difficulty sustaining attention",
      "Fidgeting",
      "Interrupting others"
    ],
    synonyms: ["attention deficit hyperactivity disorder", "add", "attention deficit disorder"],
    resources: [
      { name: "CDC ADHD", url: "https://www.cdc.gov/ncbddd/adhd/index.html" }
    ]
  },
  depression: {
    name: "Major Depressive Disorder",
    description: "Major depressive disorder involves persistent sadness and loss of interest in activities once enjoyed.",
    symptoms: [
      "Persistent sadness",
      "Loss of interest",
      "Fatigue"
    ],
    synonyms: ["major depressive disorder", "clinical depression"],
    resources: [
      { name: "NIMH Depression", url: "https://www.nimh.nih.gov/health/topics/depression" }
    ]
  },
  anxiety: {
    name: "Generalized Anxiety Disorder",
    description: "Generalized anxiety disorder features excessive worry occurring more days than not for at least six months.",
    symptoms: [
      "Excessive worry",
      "Restlessness",
      "Fatigue"
    ],
    synonyms: ["generalized anxiety disorder", "gad", "anxiety"],
    resources: [
      { name: "NIMH Anxiety", url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" }
    ]
  },
  bipolar: {
    name: "Bipolar Disorder",
    description: "Bipolar disorder includes episodes of mania and depression with periods of normal mood.",
    symptoms: [
      "Manic episodes",
      "Depressive episodes",
      "Mood swings"
    ],
    synonyms: ["bipolar disorder", "manic depression"],
    resources: [
      { name: "NIMH Bipolar Disorder", url: "https://www.nimh.nih.gov/health/topics/bipolar-disorder" }
    ]
  },
  ocd: {
    name: "Obsessive-Compulsive Disorder",
    description: "OCD features intrusive thoughts and repetitive behaviors that the person feels driven to perform.",
    symptoms: ["Obsessions", "Compulsions", "Anxiety when rituals are resisted"],
    synonyms: ["obsessive compulsive disorder", "ocd"],
    resources: [
      { name: "NIMH OCD", url: "https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd" }
    ]
  },
  ptsd: {
    name: "Post-Traumatic Stress Disorder",
    description: "PTSD arises after exposure to traumatic events with intrusive memories and heightened arousal.",
    symptoms: ["Flashbacks", "Avoidance", "Hypervigilance"],
    synonyms: ["post traumatic stress disorder", "ptsd"],
    resources: [
      { name: "NIMH PTSD", url: "https://www.nimh.nih.gov/health/topics/post-traumatic-stress-disorder-ptsd" }
    ]
  },
  schizophrenia: {
    name: "Schizophrenia",
    description: "Schizophrenia includes delusions, hallucinations, and disorganized behavior.",
    symptoms: ["Hallucinations", "Delusions", "Disorganized speech"],
    synonyms: ["schizophrenia"],
    resources: [
      { name: "NIMH Schizophrenia", url: "https://www.nimh.nih.gov/health/topics/schizophrenia" }
    ]
  },
  schizoaffective: {
    name: "Schizoaffective Disorder",
    description: "Schizoaffective disorder combines psychotic symptoms with mood episodes.",
    symptoms: ["Delusions", "Mood episodes", "Disorganized thinking"],
    synonyms: ["schizoaffective disorder"],
    resources: [
      { name: "NIMH Schizoaffective", url: "https://www.nimh.nih.gov/health/topics/schizoaffective-disorder" }
    ]
  },
  dysthymia: {
    name: "Persistent Depressive Disorder",
    description: "A chronic form of depression lasting for at least two years.",
    symptoms: ["Low mood", "Hopelessness", "Low self-esteem"],
    synonyms: ["persistent depressive disorder", "dysthymia"],
    resources: [
      { name: "NIMH Depression", url: "https://www.nimh.nih.gov/health/topics/depression" }
    ]
  },
  panic: {
    name: "Panic Disorder",
    description: "Panic disorder involves recurrent unexpected panic attacks and fear of more attacks.",
    symptoms: ["Panic attacks", "Fear of dying", "Chest pain"],
    synonyms: ["panic disorder"],
    resources: [
      { name: "NIMH Panic Disorder", url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" }
    ]
  },
  agoraphobia: {
    name: "Agoraphobia",
    description: "Agoraphobia is intense fear of situations where escape may be difficult.",
    symptoms: ["Avoiding crowds", "Fear of leaving home", "Dependence on others"],
    synonyms: ["agoraphobia"],
    resources: [
      { name: "NIMH Agoraphobia", url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" }
    ]
  },
  socialAnxiety: {
    name: "Social Anxiety Disorder",
    description: "Marked fear of social situations where scrutiny by others is possible.",
    symptoms: ["Fear of embarrassment", "Avoiding social situations", "Blushing"],
    synonyms: ["social anxiety disorder", "social phobia"],
    resources: [
      { name: "NIMH Social Anxiety", url: "https://www.nimh.nih.gov/health/topics/social-phobia" }
    ]
  },
  specificPhobia: {
    name: "Specific Phobia",
    description: "Excessive fear of a specific object or situation, leading to avoidance.",
    symptoms: ["Intense fear", "Avoidance", "Panic reactions"],
    synonyms: ["specific phobia"],
    resources: [
      { name: "NIMH Phobias", url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" }
    ]
  },
  separationAnxiety: {
    name: "Separation Anxiety Disorder",
    description: "Developmentally inappropriate fear about being separated from attachment figures.",
    symptoms: ["Distress when separated", "Fear of losing major attachment figures", "Refusal to be alone"],
    synonyms: ["separation anxiety disorder"],
    resources: [
      { name: "NIMH Separation Anxiety", url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" }
    ]
  },
  illnessAnxiety: {
    name: "Illness Anxiety Disorder",
    description: "Preoccupation with having or acquiring a serious illness despite mild or no symptoms.",
    symptoms: ["Health-related anxiety", "Repeated health checks", "Preoccupation with disease"],
    synonyms: ["illness anxiety disorder", "hypochondriasis"],
    resources: [
      { name: "NIMH Illness Anxiety", url: "https://www.nimh.nih.gov/health/topics/somatic-symptom-disorders" }
    ]
  },
  somaticSymptom: {
    name: "Somatic Symptom Disorder",
    description: "Excessive focus on physical symptoms causing distress and disruption.",
    symptoms: ["Multiple physical complaints", "High health anxiety", "Frequent medical visits"],
    synonyms: ["somatic symptom disorder"],
    resources: [
      { name: "NIMH Somatic Symptom", url: "https://www.nimh.nih.gov/health/topics/somatic-symptom-disorders" }
    ]
  },
  conduct: {
    name: "Conduct Disorder",
    description: "A pattern of violating societal norms and the rights of others.",
    symptoms: ["Aggression", "Destruction of property", "Deceitfulness"],
    synonyms: ["conduct disorder"],
    resources: [
      { name: "NIMH Conduct Disorder", url: "https://www.nimh.nih.gov/health/topics/child-and-adolescent-mental-health" }
    ]
  },
  odd: {
    name: "Oppositional Defiant Disorder",
    description: "ODD features a pattern of angry, defiant, or vindictive behavior toward authority figures.",
    symptoms: ["Frequent temper loss", "Argumentative", "Deliberately annoying others"],
    synonyms: ["oppositional defiant disorder", "odd"],
    resources: [
      { name: "NIMH ODD", url: "https://www.nimh.nih.gov/health/topics/child-and-adolescent-mental-health" }
    ]
  },
  autism: {
    name: "Autism Spectrum Disorder",
    description: "Autism involves deficits in social communication and restricted, repetitive behaviors.",
    symptoms: ["Social difficulties", "Repetitive behaviors", "Sensitivity to change"],
    synonyms: ["autism spectrum disorder", "asd"],
    resources: [
      { name: "CDC Autism", url: "https://www.cdc.gov/ncbddd/autism/index.html" }
    ]
  },
  anorexia: {
    name: "Anorexia Nervosa",
    description: "Characterized by restriction of energy intake leading to significantly low body weight and intense fear of gaining weight.",
    symptoms: ["Extreme dieting", "Fear of weight gain", "Distorted body image"],
    synonyms: ["anorexia nervosa"],
    resources: [
      { name: "NIMH Eating Disorders", url: "https://www.nimh.nih.gov/health/topics/eating-disorders" }
    ]
  },
  bulimia: {
    name: "Bulimia Nervosa",
    description: "Bulimia involves binge eating followed by compensatory behaviors like vomiting or excessive exercise.",
    symptoms: ["Binge eating", "Purging", "Self-esteem tied to body shape"],
    synonyms: ["bulimia nervosa"],
    resources: [
      { name: "NIMH Eating Disorders", url: "https://www.nimh.nih.gov/health/topics/eating-disorders" }
    ]
  },
  bingeEating: {
    name: "Binge-Eating Disorder",
    description: "Recurrent episodes of eating large quantities of food with a sense of loss of control.",
    symptoms: ["Eating rapidly", "Eating when not hungry", "Guilt after overeating"],
    synonyms: ["binge eating disorder"],
    resources: [
      { name: "NIMH Eating Disorders", url: "https://www.nimh.nih.gov/health/topics/eating-disorders" }
    ]
  },
  adjustment: {
    name: "Adjustment Disorder",
    description: "Emotional or behavioral symptoms in response to a specific stressor.",
    symptoms: ["Marked distress", "Impaired functioning", "Symptoms begin within 3 months of stressor"],
    synonyms: ["adjustment disorder"],
    resources: [
      { name: "NIMH Adjustment Disorder", url: "https://www.nimh.nih.gov/health" }
    ]
  },
  borderlinePD: {
    name: "Borderline Personality Disorder",
    description: "BPD is characterized by unstable relationships, self-image, and emotions.",
    symptoms: ["Fear of abandonment", "Impulsive behavior", "Emotional instability"],
    synonyms: ["borderline personality disorder", "bpd"],
    resources: [
      { name: "NIMH Borderline Personality", url: "https://www.nimh.nih.gov/health/topics/borderline-personality-disorder" }
    ]
  },
  antisocialPD: {
    name: "Antisocial Personality Disorder",
    description: "A pattern of disregard for the rights of others and violation of social norms.",
    symptoms: ["Deceitfulness", "Impulsivity", "Lack of remorse"],
    synonyms: ["antisocial personality disorder", "aspd"],
    resources: [
      { name: "NIMH Personality Disorders", url: "https://www.nimh.nih.gov/health/topics/personality-disorders" }
    ]
  },
  narcissisticPD: {
    name: "Narcissistic Personality Disorder",
    description: "Characterized by grandiosity, need for admiration, and lack of empathy.",
    symptoms: ["Sense of superiority", "Need for praise", "Lack of empathy"],
    synonyms: ["narcissistic personality disorder", "npd"],
    resources: [
      { name: "NIMH Personality Disorders", url: "https://www.nimh.nih.gov/health/topics/personality-disorders" }
    ]
  },
  histrionicPD: {
    name: "Histrionic Personality Disorder",
    description: "Excessive emotionality and attention seeking.",
    symptoms: ["Discomfort when not the center of attention", "Rapidly shifting emotions", "Theatrical behavior"],
    synonyms: ["histrionic personality disorder"],
    resources: [
      { name: "NIMH Personality Disorders", url: "https://www.nimh.nih.gov/health/topics/personality-disorders" }
    ]
  },
  dependentPD: {
    name: "Dependent Personality Disorder",
    description: "Characterized by pervasive and excessive need to be taken care of.",
    symptoms: ["Difficulty making decisions", "Fear of separation", "Urgently seeking new relationships"],
    synonyms: ["dependent personality disorder"],
    resources: [
      { name: "NIMH Personality Disorders", url: "https://www.nimh.nih.gov/health/topics/personality-disorders" }
    ]
  },
  ocpd: {
    name: "Obsessive-Compulsive Personality Disorder",
    description: "Preoccupation with orderliness, perfectionism, and control.",
    symptoms: ["Perfectionism", "Inflexibility", "Excessive devotion to work"],
    synonyms: ["obsessive compulsive personality disorder", "ocpd"],
    resources: [
      { name: "NIMH Personality Disorders", url: "https://www.nimh.nih.gov/health/topics/personality-disorders" }
    ]
  },
  avoidantPD: {
    name: "Avoidant Personality Disorder",
    description: "Social inhibition and feelings of inadequacy leading to avoidance of social interaction.",
    symptoms: ["Fear of criticism", "Feeling inadequate", "Avoidance of social activities"],
    synonyms: ["avoidant personality disorder"],
    resources: [
      { name: "NIMH Personality Disorders", url: "https://www.nimh.nih.gov/health/topics/personality-disorders" }
    ]
  },
  schizoidPD: {
    name: "Schizoid Personality Disorder",
    description: "Detachment from social relationships and restricted emotional expression.",
    symptoms: ["Prefers solitary activities", "Little interest in sex", "Emotional coldness"],
    synonyms: ["schizoid personality disorder"],
    resources: [
      { name: "NIMH Personality Disorders", url: "https://www.nimh.nih.gov/health/topics/personality-disorders" }
    ]
  },
  schizotypalPD: {
    name: "Schizotypal Personality Disorder",
    description: "Acute discomfort in close relationships, cognitive or perceptual distortions, and eccentric behavior.",
    symptoms: ["Odd beliefs", "Social anxiety", "Magical thinking"],
    synonyms: ["schizotypal personality disorder"],
    resources: [
      { name: "NIMH Personality Disorders", url: "https://www.nimh.nih.gov/health/topics/personality-disorders" }
    ]
  },
  paranoidPD: {
    name: "Paranoid Personality Disorder",
    description: "Pervasive distrust and suspiciousness of others.",
    symptoms: ["Suspects exploitation", "Reluctant to confide", "Reads hidden meaning"],
    synonyms: ["paranoid personality disorder"],
    resources: [
      { name: "NIMH Personality Disorders", url: "https://www.nimh.nih.gov/health/topics/personality-disorders" }
    ]
  },
  alcoholUse: {
    name: "Alcohol Use Disorder",
    description: "Problematic pattern of alcohol consumption leading to impairment or distress.",
    symptoms: ["Craving", "Loss of control", "Withdrawal"],
    synonyms: ["alcohol use disorder", "aud"],
    resources: [
      { name: "NIAAA Alcohol Use", url: "https://www.niaaa.nih.gov/alcohols-effects-health/alcohol-use-disorder" }
    ]
  },
  opioidUse: {
    name: "Opioid Use Disorder",
    description: "Problematic opioid use leading to impairment or distress.",
    symptoms: ["Strong cravings", "Tolerance", "Withdrawal"],
    synonyms: ["opioid use disorder"],
    resources: [
      { name: "NIDA Opioid Use", url: "https://nida.nih.gov/publications/drugfacts/heroin" }
    ]
  },
  gambling: {
    name: "Gambling Disorder",
    description: "Persistent and recurrent problematic gambling behavior.",
    symptoms: ["Preoccupation with gambling", "Chasing losses", "Jeopardizing relationships"],
    synonyms: ["gambling disorder", "pathological gambling"],
    resources: [
      { name: "NCPG Gambling", url: "https://www.ncpgambling.org/help-treatment/faq" }
    ]
  },
  insomnia: {
    name: "Insomnia Disorder",
    description: "Dissatisfaction with sleep quantity or quality despite adequate opportunity to sleep.",
    symptoms: ["Difficulty falling asleep", "Frequent awakenings", "Daytime fatigue"],
    synonyms: ["insomnia disorder"],
    resources: [
      { name: "Sleep Foundation", url: "https://www.sleepfoundation.org/insomnia" }
    ]
  },
  nightmare: {
    name: "Nightmare Disorder",
    description: "Repeated occurrences of frightening dreams that cause distress or impairment.",
    symptoms: ["Vivid dreams", "Awakenings", "Distress about dreams"],
    synonyms: ["nightmare disorder"],
    resources: [
      { name: "Sleep Foundation", url: "https://www.sleepfoundation.org/nightmares" }
    ]
  },
  genderDysphoria: {
    name: "Gender Dysphoria",
    description: "Marked incongruence between experienced gender and assigned gender, causing distress.",
    symptoms: ["Desire to be another gender", "Dysphoria", "Significant distress"],
    synonyms: ["gender dysphoria"],
    resources: [
      { name: "APA Gender Dysphoria", url: "https://psychiatry.org/patients-families/gender-dysphoria" }
    ]
  },
  dissociativeID: {
    name: "Dissociative Identity Disorder",
    description: "Presence of two or more distinct personality states causing gaps in memory.",
    symptoms: ["Memory gaps", "Identity confusion", "Distinct personality states"],
    synonyms: ["dissociative identity disorder", "multiple personality"],
    resources: [
      { name: "NIMH Dissociative Disorders", url: "https://www.nimh.nih.gov/health/topics/dissociative-disorders" }
    ]
  }
};

window.dsm5Disorders = dsm5Disorders;
