# Blockchain Student Records

Blockchain Student Records is a simple Solidity learning project with a static project website. The repository shows a checkpoint-by-checkpoint progression from basic student ID checking to mapped student records and semester data storage.

## Live Website

Live deployment: [mediblock-ten.vercel.app](https://mediblock-ten.vercel.app)

The website is designed for Vercel deployment and includes:

- A landing page for the Blockchain Student Records app idea.
- A GitHub repository link section.
- A checkpoint timeline for the Solidity contracts.
- A browser demo that mirrors the final `IDChecker` contract rule.

Repository: [github.com/Yuvraajrahman/CSE446](https://github.com/Yuvraajrahman/CSE446)

## Project Files

| File | Purpose |
| --- | --- |
| `checkpoint1.sol` | Checks an input student ID against one stored ID. |
| `checkpoint2.sol` | Stores and retrieves student names using a mapping. |
| `checkpoint3.sol` | Stores semester records using structs and arrays. |
| `Final project submission.sol` | Final ID checker contract. |
| `index.html` | Static website markup. |
| `styles.css` | Website styling. |
| `script.js` | Interactive browser demo for the final ID rule. |
| `vercel.json` | Vercel deployment configuration. |

## Final Solidity Contract

The final submission contract stores a student name and exposes a `checkID` function. It extracts the last two digits of the submitted ID, then returns the stored name when the full ID is divisible by those last two digits. If the rule fails, it returns `Not found`.

## Run Locally

Install dependencies if needed:

```bash
npm install
```

Validate the static website files:

```bash
npm run build
```

Start a local static server:

```bash
npm start
```

## Deploy With Vercel CLI

Install and run the Vercel CLI:

```bash
npm i -g vercel
vercel --prod
```

The included `vercel.json` tells Vercel to run the static build check and serve the project root as the output directory.

## Author

Md. Tasnim Kabir