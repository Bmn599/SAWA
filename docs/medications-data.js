// Comprehensive Medication Information Database
const medicationDatabase = {
  // ANTIDEPRESSANTS - SSRIs
  "prozac": {
    name: "Prozac (Fluoxetine)",
    type: "SSRI Antidepressant",
    commonUses: ["Depression", "Anxiety", "OCD", "Panic Disorder"],
    commonSideEffects: ["Nausea", "Headache", "Insomnia", "Dry mouth", "Dizziness"],
    importantNotes: "Usually taken in the morning. May take 4-6 weeks to feel full effects.",
    warning: "Do not stop suddenly. Consult your doctor before making any changes."
  },
  "zoloft": {
    name: "Zoloft (Sertraline)",
    type: "SSRI Antidepressant",
    commonUses: ["Depression", "Anxiety", "PTSD", "OCD"],
    commonSideEffects: ["Nausea", "Diarrhea", "Dry mouth", "Insomnia", "Sexual side effects"],
    importantNotes: "Take with food to reduce stomach upset. Effects may take several weeks.",
    warning: "Monitor for mood changes, especially in young adults. Consult doctor before stopping."
  },
  "lexapro": {
    name: "Lexapro (Escitalopram)",
    type: "SSRI Antidepressant",
    commonUses: ["Depression", "Generalized Anxiety Disorder"],
    commonSideEffects: ["Nausea", "Fatigue", "Insomnia", "Increased sweating"],
    importantNotes: "Often well-tolerated. Can be taken with or without food.",
    warning: "May cause withdrawal symptoms if stopped abruptly. Taper under medical supervision."
  },
  "paxil": {
    name: "Paxil (Paroxetine)",
    type: "SSRI Antidepressant",
    commonUses: ["Depression", "Anxiety", "Panic Disorder", "PTSD"],
    commonSideEffects: ["Drowsiness", "Nausea", "Dry mouth", "Weight gain"],
    importantNotes: "May cause more sedation than other SSRIs. Take as directed.",
    warning: "Has higher risk of withdrawal symptoms. Should be tapered slowly."
  },
  "celexa": {
    name: "Celexa (Citalopram)",
    type: "SSRI Antidepressant",
    commonUses: ["Depression", "Anxiety"],
    commonSideEffects: ["Nausea", "Dry mouth", "Drowsiness", "Insomnia"],
    importantNotes: "Similar to other SSRIs but may have fewer drug interactions.",
    warning: "Higher doses may affect heart rhythm. Regular monitoring recommended."
  },
  "luvox": {
    name: "Luvox (Fluvoxamine)",
    type: "SSRI Antidepressant",
    commonUses: ["OCD", "Depression", "Anxiety"],
    commonSideEffects: ["Nausea", "Sleepiness", "Dry mouth", "Weakness"],
    importantNotes: "Often used for OCD. May interact with many medications.",
    warning: "Consult your doctor about drug interactions."
  },
  // ANTIDEPRESSANTS - SNRIs
  "effexor": {
    name: "Effexor (Venlafaxine)",
    type: "SNRI Antidepressant",
    commonUses: ["Depression", "Anxiety", "Panic Disorder"],
    commonSideEffects: ["Nausea", "Dizziness", "Dry mouth", "Sweating"],
    importantNotes: "Works on both serotonin and norepinephrine. Take with food.",
    warning: "Can cause withdrawal symptoms. Should be tapered slowly when stopping."
  },
  "cymbalta": {
    name: "Cymbalta (Duloxetine)",
    type: "SNRI Antidepressant",
    commonUses: ["Depression", "Anxiety", "Chronic pain", "Fibromyalgia"],
    commonSideEffects: ["Nausea", "Dry mouth", "Drowsiness", "Fatigue"],
    importantNotes: "Also helps with chronic pain conditions. Take with food.",
    warning: "May cause liver problems in rare cases. Regular monitoring recommended."
  },
  "pristiq": {
    name: "Pristiq (Desvenlafaxine)",
    type: "SNRI Antidepressant",
    commonUses: ["Depression"],
    commonSideEffects: ["Nausea", "Dizziness", "Dry mouth", "Sweating"],
    importantNotes: "Active form of venlafaxine. May raise blood pressure.",
    warning: "Do not stop abruptly without medical guidance."
  },
  // ANTIDEPRESSANTS - TCAs
  "elavil": {
    name: "Elavil (Amitriptyline)",
    type: "Tricyclic Antidepressant",
    commonUses: ["Depression", "Chronic pain"],
    commonSideEffects: ["Dry mouth", "Constipation", "Drowsiness", "Weight gain"],
    importantNotes: "Often taken at night due to sedation.",
    warning: "Can affect heart rhythm. Overdose can be dangerous."
  },
  "pamelor": {
    name: "Pamelor (Nortriptyline)",
    type: "Tricyclic Antidepressant",
    commonUses: ["Depression", "Chronic pain"],
    commonSideEffects: ["Dry mouth", "Constipation", "Blurred vision", "Drowsiness"],
    importantNotes: "Lower side effect burden than amitriptyline.",
    warning: "May cause heart rhythm changes."
  },
  "tofranil": {
    name: "Tofranil (Imipramine)",
    type: "Tricyclic Antidepressant",
    commonUses: ["Depression", "Bedwetting"],
    commonSideEffects: ["Dry mouth", "Blurred vision", "Constipation", "Weight gain"],
    importantNotes: "Sometimes used for childhood enuresis.",
    warning: "Overdose can be serious. Use exactly as prescribed."
  },
  "anafranil": {
    name: "Anafranil (Clomipramine)",
    type: "Tricyclic Antidepressant",
    commonUses: ["OCD", "Depression"],
    commonSideEffects: ["Dry mouth", "Constipation", "Drowsiness", "Blurred vision"],
    importantNotes: "Particularly effective for OCD symptoms.",
    warning: "May cause heart rhythm changes and requires monitoring."
  },
  // ANTIDEPRESSANTS - MAOIs
  "nardil": {
    name: "Nardil (Phenelzine)",
    type: "MAOI Antidepressant",
    commonUses: ["Depression"],
    commonSideEffects: ["Dizziness", "Dry mouth", "Weight gain", "Sleep problems"],
    importantNotes: "Requires dietary restrictions to avoid tyramine reactions.",
    warning: "Serious interactions with many medications and foods."
  },
  "parnate": {
    name: "Parnate (Tranylcypromine)",
    type: "MAOI Antidepressant",
    commonUses: ["Depression"],
    commonSideEffects: ["Insomnia", "Dizziness", "Dry mouth"],
    importantNotes: "Typically used when other treatments fail.",
    warning: "Strict dietary restrictions required."
  },
  "marplan": {
    name: "Marplan (Isocarboxazid)",
    type: "MAOI Antidepressant",
    commonUses: ["Depression"],
    commonSideEffects: ["Dizziness", "Dry mouth", "Headache"],
    importantNotes: "Less commonly prescribed MAOI.",
    warning: "Avoid foods high in tyramine to prevent hypertensive crisis."
  },
  // ATYPICAL ANTIDEPRESSANTS
  "wellbutrin": {
    name: "Wellbutrin (Bupropion)",
    type: "Atypical Antidepressant",
    commonUses: ["Depression", "Smoking cessation", "ADHD"],
    commonSideEffects: ["Dry mouth", "Nausea", "Insomnia", "Dizziness", "Constipation"],
    importantNotes: "Less likely to cause sexual side effects or weight gain. May increase energy.",
    warning: "Can lower seizure threshold. Avoid in people with eating disorders."
  },
  "remeron": {
    name: "Remeron (Mirtazapine)",
    type: "Atypical Antidepressant",
    commonUses: ["Depression", "Anxiety", "Insomnia"],
    commonSideEffects: ["Increased appetite", "Weight gain", "Drowsiness"],
    importantNotes: "Often taken at night due to sedation and appetite increase.",
    warning: "Can raise cholesterol levels in some people."
  },
  "trazodone": {
    name: "Trazodone",
    type: "Atypical Antidepressant (used off-label for sleep)",
    commonUses: ["Depression", "Insomnia"],
    commonSideEffects: ["Drowsiness", "Dizziness", "Dry mouth", "Constipation"],
    importantNotes: "Commonly used off-label for sleep due to sedating effects.",
    warning: "May cause priapism (prolonged erection) in men. Seek immediate medical help."
  },
  // ANTI-ANXIETY - BENZODIAZEPINES
  "xanax": {
    name: "Xanax (Alprazolam)",
    type: "Benzodiazepine",
    commonUses: ["Anxiety", "Panic Disorder"],
    commonSideEffects: ["Drowsiness", "Dizziness", "Memory problems", "Coordination issues"],
    importantNotes: "Fast-acting for anxiety relief. Should be used short-term.",
    warning: "Can be habit-forming. Do not stop suddenly. Avoid alcohol."
  },
  "ativan": {
    name: "Ativan (Lorazepam)",
    type: "Benzodiazepine",
    commonUses: ["Anxiety", "Panic attacks", "Insomnia"],
    commonSideEffects: ["Sedation", "Dizziness", "Weakness", "Confusion"],
    importantNotes: "Intermediate-acting benzodiazepine. Can be used as needed.",
    warning: "Risk of dependence. Taper slowly to discontinue."
  },
  "klonopin": {
    name: "Klonopin (Clonazepam)",
    type: "Benzodiazepine",
    commonUses: ["Anxiety", "Panic Disorder", "Seizures"],
    commonSideEffects: ["Drowsiness", "Dizziness", "Fatigue", "Memory problems"],
    importantNotes: "Longer-acting than other benzodiazepines. Good for consistent anxiety.",
    warning: "High potential for dependence. Requires careful monitoring."
  },
  "valium": {
    name: "Valium (Diazepam)",
    type: "Benzodiazepine",
    commonUses: ["Anxiety", "Muscle spasms", "Seizures"],
    commonSideEffects: ["Drowsiness", "Fatigue", "Coordination problems"],
    importantNotes: "Long half-life. Useful for muscle relaxation.",
    warning: "Risk of dependence and sedation."
  },
  "librium": {
    name: "Librium (Chlordiazepoxide)",
    type: "Benzodiazepine",
    commonUses: ["Anxiety", "Alcohol withdrawal"],
    commonSideEffects: ["Drowsiness", "Dizziness", "Confusion"],
    importantNotes: "Often used to manage alcohol detox symptoms.",
    warning: "Use with caution in liver impairment."
  },
  // NON-BENZO ANXIOLYTICS
  "buspar": {
    name: "BuSpar (Buspirone)",
    type: "Anti-anxiety medication",
    commonUses: ["Generalized Anxiety Disorder"],
    commonSideEffects: ["Dizziness", "Nausea", "Headache", "Nervousness"],
    importantNotes: "Non-benzodiazepine anti-anxiety medication. Takes 2-4 weeks to work.",
    warning: "Not effective for panic attacks. May interact with MAOIs."
  },
  // MOOD STABILIZERS
  "lithium": {
    name: "Lithium (Lithobid, Eskalith)",
    type: "Mood Stabilizer",
    commonUses: ["Bipolar Disorder", "Depression (augmentation)"],
    commonSideEffects: ["Tremor", "Increased urination", "Weight gain", "Nausea"],
    importantNotes: "Requires regular blood monitoring. Stay well-hydrated.",
    warning: "Narrow therapeutic window. Regular lab monitoring essential."
  },
  "lamictal": {
    name: "Lamictal (Lamotrigine)",
    type: "Mood Stabilizer/Anticonvulsant",
    commonUses: ["Bipolar Disorder", "Epilepsy"],
    commonSideEffects: ["Dizziness", "Nausea", "Fatigue", "Headache"],
    importantNotes: "Particularly effective for bipolar depression. Start with low dose.",
    warning: "Rare but serious skin reactions. Seek medical attention for rash."
  },
  "depakote": {
    name: "Depakote (Divalproex/Valproic Acid)",
    type: "Mood Stabilizer/Anticonvulsant",
    commonUses: ["Bipolar Disorder", "Epilepsy", "Migraine prevention"],
    commonSideEffects: ["Weight gain", "Hair loss", "Nausea", "Tremor"],
    importantNotes: "Effective for mania and mixed episodes. Requires blood monitoring.",
    warning: "Can cause liver toxicity. Regular lab monitoring required."
  },
  "tegretol": {
    name: "Tegretol (Carbamazepine)",
    type: "Mood Stabilizer/Anticonvulsant",
    commonUses: ["Bipolar Disorder", "Seizure disorders"],
    commonSideEffects: ["Dizziness", "Blurred vision", "Nausea", "Skin rash"],
    importantNotes: "Requires blood level and liver monitoring.",
    warning: "Can cause serious skin reactions in certain ethnic groups."
  },
  "trileptal": {
    name: "Trileptal (Oxcarbazepine)",
    type: "Mood Stabilizer/Anticonvulsant",
    commonUses: ["Bipolar Disorder", "Seizure disorders"],
    commonSideEffects: ["Dizziness", "Double vision", "Fatigue"],
    importantNotes: "Similar to carbamazepine but with fewer interactions.",
    warning: "May lower sodium levels; periodic labs recommended."
  },
  // ANTIPSYCHOTICS
  "abilify": {
    name: "Abilify (Aripiprazole)",
    type: "Atypical Antipsychotic",
    commonUses: ["Schizophrenia", "Bipolar Disorder", "Depression (augmentation)", "Autism irritability"],
    commonSideEffects: ["Nausea", "Vomiting", "Constipation", "Headache", "Dizziness"],
    importantNotes: "Partial dopamine agonist. Lower risk of weight gain than some antipsychotics.",
    warning: "May cause movement disorders. Monitor for tardive dyskinesia."
  },
  "seroquel": {
    name: "Seroquel (Quetiapine)",
    type: "Atypical Antipsychotic",
    commonUses: ["Schizophrenia", "Bipolar Disorder", "Depression (augmentation)", "Insomnia"],
    commonSideEffects: ["Drowsiness", "Weight gain", "Dizziness", "Dry mouth"],
    importantNotes: "Sedating effects often used for sleep. Extended-release available.",
    warning: "May cause metabolic changes. Monitor blood sugar and weight."
  },
  "risperdal": {
    name: "Risperdal (Risperidone)",
    type: "Atypical Antipsychotic",
    commonUses: ["Schizophrenia", "Bipolar Disorder", "Autism irritability"],
    commonSideEffects: ["Weight gain", "Sedation", "Movement disorders", "Increased prolactin"],
    importantNotes: "Available in long-acting injection form. Effective for positive symptoms.",
    warning: "May cause movement disorders and metabolic changes."
  },
  "zyprexa": {
    name: "Zyprexa (Olanzapine)",
    type: "Atypical Antipsychotic",
    commonUses: ["Schizophrenia", "Bipolar Disorder"],
    commonSideEffects: ["Significant weight gain", "Sedation", "Increased appetite", "Dry mouth"],
    importantNotes: "Very effective but high risk of weight gain and metabolic effects.",
    warning: "High risk of diabetes and weight gain. Regular monitoring required."
  },
  "geodon": {
    name: "Geodon (Ziprasidone)",
    type: "Atypical Antipsychotic",
    commonUses: ["Schizophrenia", "Bipolar Disorder"],
    commonSideEffects: ["Drowsiness", "Nausea", "Dizziness"],
    importantNotes: "Take with food for proper absorption.",
    warning: "May affect heart rhythm."
  },
  "haldol": {
    name: "Haldol (Haloperidol)",
    type: "Typical Antipsychotic",
    commonUses: ["Schizophrenia", "Acute psychosis", "Tics"],
    commonSideEffects: ["Muscle stiffness", "Restlessness", "Tremor"],
    importantNotes: "Often used for severe agitation or psychosis.",
    warning: "High risk of movement disorders with long-term use."
  },
  // ADHD MEDICATIONS
  "adderall": {
    name: "Adderall (Mixed Amphetamine Salts)",
    type: "Stimulant",
    commonUses: ["ADHD", "Narcolepsy"],
    commonSideEffects: ["Decreased appetite", "Insomnia", "Nervousness", "Increased heart rate"],
    importantNotes: "Available in immediate and extended-release formulations.",
    warning: "Can be habit-forming. Monitor blood pressure and heart rate."
  },
  "ritalin": {
    name: "Ritalin (Methylphenidate)",
    type: "Stimulant",
    commonUses: ["ADHD", "Narcolepsy"],
    commonSideEffects: ["Decreased appetite", "Sleep problems", "Nervousness", "Headache"],
    importantNotes: "Short-acting formulation. Take 30-45 minutes before meals.",
    warning: "Can affect growth in children. Monitor height and weight."
  },
  "concerta": {
    name: "Concerta (Methylphenidate Extended-Release)",
    type: "Stimulant",
    commonUses: ["ADHD"],
    commonSideEffects: ["Decreased appetite", "Sleep problems", "Mood changes", "Tics"],
    importantNotes: "Long-acting formulation lasting 12 hours. Take in morning.",
    warning: "May worsen existing psychiatric conditions. Monitor mood carefully."
  },
  "vyvanse": {
    name: "Vyvanse (Lisdexamfetamine)",
    type: "Stimulant",
    commonUses: ["ADHD", "Binge eating disorder"],
    commonSideEffects: ["Decreased appetite", "Dry mouth", "Insomnia", "Anxiety"],
    importantNotes: "Prodrug converted to dextroamphetamine in the body.",
    warning: "Potential for abuse and dependence."
  },
  "focalin": {
    name: "Focalin (Dexmethylphenidate)",
    type: "Stimulant",
    commonUses: ["ADHD"],
    commonSideEffects: ["Decreased appetite", "Dry mouth", "Anxiety"],
    importantNotes: "Isomer of methylphenidate, may be better tolerated for some.",
    warning: "Monitor blood pressure and weight."
  },
  "strattera": {
    name: "Strattera (Atomoxetine)",
    type: "Non-stimulant ADHD medication",
    commonUses: ["ADHD"],
    commonSideEffects: ["Nausea", "Fatigue", "Decreased appetite", "Mood swings"],
    importantNotes: "Non-stimulant option. Takes 2-4 weeks to reach full effect.",
    warning: "May increase suicidal thoughts in children and adolescents."
  },
  "intuniv": {
    name: "Intuniv (Guanfacine)",
    type: "Non-stimulant ADHD medication",
    commonUses: ["ADHD"],
    commonSideEffects: ["Sleepiness", "Low blood pressure", "Dry mouth"],
    importantNotes: "Also used for high blood pressure. Extended-release for ADHD.",
    warning: "Do not stop suddenly due to blood pressure changes."
  },
  "kapvay": {
    name: "Kapvay (Clonidine)",
    type: "Non-stimulant ADHD medication",
    commonUses: ["ADHD", "Hypertension"],
    commonSideEffects: ["Sleepiness", "Dry mouth", "Constipation"],
    importantNotes: "Often taken at night for hyperactivity and sleep.",
    warning: "Taper gradually to avoid rebound high blood pressure."
  },
  // SLEEP MEDICATIONS
  "ambien": {
    name: "Ambien (Zolpidem)",
    type: "Sleep aid",
    commonUses: ["Insomnia"],
    commonSideEffects: ["Drowsiness", "Dizziness", "Diarrhea", "Drugged feeling"],
    importantNotes: "Short-term use only. Take immediately before bedtime.",
    warning: "May cause complex sleep behaviors. Risk of dependence with long-term use."
  },
  "lunesta": {
    name: "Lunesta (Eszopiclone)",
    type: "Sleep aid",
    commonUses: ["Insomnia"],
    commonSideEffects: ["Metallic taste", "Dizziness", "Headache", "Nausea"],
    importantNotes: "Can be used longer-term than other sleep medications.",
    warning: "May cause next-day impairment. Avoid alcohol."
  },
  "rozerem": {
    name: "Rozerem (Ramelteon)",
    type: "Sleep aid",
    commonUses: ["Insomnia"],
    commonSideEffects: ["Dizziness", "Fatigue", "Nausea"],
    importantNotes: "Melatonin receptor agonist with low abuse potential.",
    warning: "Avoid taking with alcohol or high-fat meals."
  },
  "belsomra": {
    name: "Belsomra (Suvorexant)",
    type: "Sleep aid",
    commonUses: ["Insomnia"],
    commonSideEffects: ["Daytime drowsiness", "Headache", "Dizziness"],
    importantNotes: "Orexin receptor antagonist. Take 30 minutes before bed.",
    warning: "May cause sleep paralysis or complex sleep behaviors."
  },
  "melatonin": {
    name: "Melatonin",
    type: "OTC Sleep aid",
    commonUses: ["Insomnia", "Jet lag"],
    commonSideEffects: ["Drowsiness", "Headache", "Dizziness"],
    importantNotes: "Available over the counter. Useful for circadian rhythm issues.",
    warning: "May interact with other sedating medications."
  }
};

window.medicationDatabase = medicationDatabase;
