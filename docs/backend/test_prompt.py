import main

# Create long history of 10 exchanges
history = [
    {"user": f"question {i}", "ai": "answer" * 50} for i in range(10)
]
user_input = "Tell me about management of chronic atrial fibrillation in detail"

prompt = main.prepare_prompt(history, user_input)

num_tokens = len(main.llm.tokenize(prompt.encode()))
print("Tokens:", num_tokens)
print("Prompt:\n", prompt[:200], "...")

assert num_tokens <= main.MAX_PROMPT_TOKENS, "Prompt exceeds context window"
print("Test passed")
