# ZeroKey

ZeroKey is a behavioral biometric authentication system. Instead of relying only on passwords, it checks how you type based on rhythm, timing, and muscle memory. 

## How It Works

- Users type a given sentence three times during signup.
- Their typing vectors (based on time between keypresses) are stored.
- When logging in, users type the same sentence again.
- If their typing pattern matches what’s stored (with some tolerance), they’re authenticated.

## Disclaimer

This is a work in progress and not supposed to be 100% accurate (yet). The current system uses simple timing vectors to evaluate typing patterns, which works moderately well but is not production-grade. Future iterations will focus on integrating more accurate machine learning models and handling edge cases (like hesitations, corrections, and device variability). If you want to know more and/or test it, please contact me directly.

