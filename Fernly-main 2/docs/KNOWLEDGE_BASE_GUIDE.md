# Knowledge Base Expansion Guide

This guide explains how to expand and maintain the Fernly Health AI knowledge base for mental health conditions and medications.

## Overview

The knowledge base consists of two main components:
1. **DSM-5 Conditions** (`fallback-data.js`) - Mental health condition information
2. **Medication Database** (`ai.js`) - Prescription medication details

## DSM-5 Conditions Structure

Location: `docs/fallback-data.js` → `window.fallbackData.dsm5`

### Adding a New Condition

```javascript
"Condition Name": {
  description: "Clinical description of the condition",
  criteria: "DSM-5 diagnostic criteria summary", 
  treatment: "Evidence-based treatment approaches",
  symptoms: ["Symptom 1", "Symptom 2", "Symptom 3"],
  medications: ["Medication class 1", "Specific medication 2"],
  synonyms: ["alternate name", "colloquial term", "abbreviation"]
}
```

### Required Fields

- **description**: 1-2 sentence clinical overview
- **criteria**: Key DSM-5 diagnostic requirements
- **treatment**: Primary evidence-based treatments
- **symptoms**: Array of common symptoms (6-10 items)
- **medications**: Array of medication options
- **synonyms**: Array of alternative terms users might search for

### Synonym Guidelines

Include common variations users might use:
- Abbreviations (e.g., "GAD" for Generalized Anxiety Disorder)
- Colloquial terms (e.g., "can't focus" for ADHD)
- Misspellings (e.g., "anxeity" for anxiety)
- Related phrases (e.g., "mood swings" for bipolar)

### Example Entry

```javascript
"Social Anxiety Disorder": {
  description: "Social anxiety disorder involves intense fear of social situations where the person may be judged, leading to avoidance or significant distress.",
  criteria: "Marked fear of social situations, immediate anxiety response, avoidance or endurance with distress, lasting 6+ months.",
  treatment: "Cognitive behavioral therapy, exposure therapy, social skills training, and medications like SSRIs or beta-blockers.",
  symptoms: ["Fear of social judgment", "Blushing or sweating", "Avoiding social situations", "Physical symptoms in social settings", "Difficulty making eye contact", "Fear of embarrassment"],
  medications: ["SSRIs (sertraline, paroxetine)", "Beta-blockers for performance anxiety", "Benzodiazepines (short-term)", "SNRIs (venlafaxine)"],
  synonyms: ["social phobia", "social anxiety", "fear of people", "shy", "embarrassed in public", "stage fright"]
}
```

## Medication Database Structure

Location: `docs/ai.js` → `medicationDatabase` object

### Adding a New Medication

```javascript
"generic_name": {
  name: "Brand Name (Generic Name)",
  type: "Medication Class",
  commonUses: ["Condition 1", "Condition 2"],
  commonSideEffects: ["Side effect 1", "Side effect 2"],
  importantNotes: "Key clinical information",
  warning: "Important safety information"
}
```

### Required Fields

- **name**: Brand name followed by generic name in parentheses
- **type**: Medication class (e.g., "SSRI Antidepressant", "Benzodiazepine")
- **commonUses**: Array of conditions it treats
- **commonSideEffects**: Array of frequent side effects
- **importantNotes**: Dosing, timing, or clinical pearls
- **warning**: Critical safety information

### Medication Classes

Common medication types in mental health:
- SSRI Antidepressant
- SNRI Antidepressant
- Atypical Antidepressant
- Benzodiazepine
- Mood Stabilizer
- Atypical Antipsychotic
- Stimulant
- Non-stimulant ADHD medication
- Sleep aid

### Example Entry

```javascript
"sertraline": {
  name: "Zoloft (Sertraline)",
  type: "SSRI Antidepressant",
  commonUses: ["Depression", "Anxiety", "PTSD", "OCD", "Panic Disorder"],
  commonSideEffects: ["Nausea", "Diarrhea", "Insomnia", "Sexual side effects", "Headache"],
  importantNotes: "Take with food to reduce stomach upset. Full effects may take 4-6 weeks.",
  warning: "Monitor for mood changes, especially in young adults. Do not stop abruptly."
}
```

## Response Templates Structure

Location: `docs/ai.js` → `responseTemplates` object

### Adding Response Templates for New Conditions

```javascript
condition_name: {
  initial: [
    "First-time response option 1",
    "First-time response option 2", 
    "First-time response option 3"
  ],
  followUp: [
    "Follow-up response option 1",
    "Follow-up response option 2",
    "Follow-up response option 3"
  ]
}
```

### Response Guidelines

1. **Empathetic**: Acknowledge the user's courage in sharing
2. **Validating**: Confirm their experience is real and valid
3. **Supportive**: Offer hope and remind them they're not alone
4. **Educational**: Provide helpful information without being clinical
5. **Action-oriented**: Suggest next steps or coping strategies

### Intent Pattern Mapping

When adding new conditions, also update `intentPatterns` in `ai.js`:

```javascript
new_condition: [
  /(primary keywords|common phrases)/i,
  /(alternative expressions|slang terms)/i,
  /(symptom descriptions|related terms)/i
]
```

## Data Sources and Accuracy

### Reliable Sources
- DSM-5-TR (Diagnostic and Statistical Manual)
- NIMH (National Institute of Mental Health)
- APA (American Psychiatric Association)
- FDA prescribing information
- Peer-reviewed clinical literature

### Content Guidelines
1. Use person-first language ("person with depression" not "depressive")
2. Avoid diagnostic language ("may indicate" not "you have")
3. Always recommend professional consultation
4. Include cultural sensitivity considerations
5. Update information based on latest clinical guidelines

## Testing New Entries

After adding new content:

1. **Synonym Testing**: Try various user phrasings to ensure detection
2. **Response Quality**: Check that responses are helpful and appropriate
3. **Pattern Matching**: Verify intent recognition works correctly
4. **Cross-references**: Ensure medications link to relevant conditions

## Maintenance

### Regular Updates
- Review and update medication information annually
- Add new DSM-5-TR conditions as they're recognized
- Update treatment guidelines based on latest research
- Refresh response templates to maintain variety

### Quality Assurance
- Fact-check all clinical information
- Review for cultural sensitivity and inclusivity
- Test user experience with various input styles
- Monitor user feedback for improvement opportunities

## Contributing

When contributing to the knowledge base:

1. **Research thoroughly** using reliable clinical sources
2. **Follow the structure** outlined in this guide
3. **Test your additions** with various user inputs
4. **Document your sources** in commit messages
5. **Consider accessibility** for users with different backgrounds

## Future Enhancements

Planned improvements to the knowledge base:
- Multi-language support
- Age-specific information (pediatric, geriatric)
- Comorbidity information
- Treatment outcome data
- Integration with external medical databases
- Real-time clinical guideline updates

---

*This guide ensures the Fernly Health AI maintains high-quality, accurate, and helpful mental health information while remaining accessible to users from all backgrounds.*