# ZeroKey

ZeroKey is a behavioral biometric authentication system. Instead of relying only on passwords, it checks how you type based on rhythm, timing, and muscle memory. 

## How It Works

- Users type a given sentence three times during signup.
- Their typing vectors (based on time between keypresses) are stored.
- When logging in, users type the same sentence again.
- If their typing pattern matches what’s stored (with some tolerance), they’re authenticated.

## Getting Started
- Clone the repo through git clone https://github.com/swechchhaad/zerokey.git.
- Install dependencies.
- Create a .env file in the root directory and add your Supabase URL and API key.
- Run npm run dev.
- Visit http://localhost:5173/.

## Notes
- You must type the sentence exactly including punctuation and spaces. The system does not allow mistakes and they affect timing data.
- Backspaces are supported during signup, but also affect timing data.
- Outliers in keystroke timing are capped to improve accuracy.
- You can open DevTools → Console to see timing vectors and RMSE differences.

## Disclaimer

This model is not 100% accurate and it’s not supposed to be (yet).
ZeroKey started as a first-time full-stack project and is still an early prototype of the author’s broader vision for behavioral biometric authentication. The current system uses simple timing vectors to evaluate typing patterns, which works moderately well but is not production-grade. Future iterations will focus on integrating more accurate machine learning models and handling edge cases (like hesitations, corrections, and device variability).

