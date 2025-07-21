// Therapy style prompts and diagnostic questions
const therapySpeech = {
  general: {
    phrases: [
      "Thank you for sharing that with me.",
      "It sounds like this has been challenging."],
    diagnosticQuestions: [
      "How long have these concerns been present?",
      "How are these feelings affecting your daily life?",
      "Have you been able to talk with a professional about this?"
    ]
  },
  depression: {
    diagnosticQuestions: [
      "When did you first notice your mood starting to decline?",
      "Have you lost interest in activities you usually enjoy?",
      "How have your energy levels been recently?"
    ]
  },
  anxiety: {
    diagnosticQuestions: [
      "Are there specific situations that trigger your anxiety?",
      "How do you typically cope when you feel anxious?",
      "Do physical symptoms accompany your worries?"
    ]
  },
  bipolar: {
    diagnosticQuestions: [
      "Have you experienced periods of unusually high energy or euphoria?",
      "How often do your mood shifts occur?",
      "Have you noticed patterns or triggers for these changes?"
    ]
  },
  adhd: {
    diagnosticQuestions: [
      "Do you find it difficult to stay focused on tasks?",
      "Are you often restless or fidgety?",
      "How do attention challenges impact your daily responsibilities?"
    ]
  },
  ocd: {
    diagnosticQuestions: [
      "Do you experience repetitive thoughts that are hard to control?",
      "Are there rituals or routines you feel compelled to perform?",
      "How much time do these thoughts or behaviors take each day?"
    ]
  },
  ptsd: {
    diagnosticQuestions: [
      "Have you gone through a traumatic event that still bothers you?",
      "Do you have nightmares or flashbacks related to that event?",
      "Are you avoiding reminders of the trauma?"
    ]
  }
};

window.therapySpeech = therapySpeech;
