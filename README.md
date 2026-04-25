# MediBlock Patient Management

Minimal Ethereum patient-management DApp for the final project of the CSE446 Blockchain and Cryptocurrency course in BRACU.

The project is intentionally simple and focused on the required features:

- Admin, patient, and doctor registration through the smart contract.
- Admin-only patient data update with covid status validation.
- Patient appointment booking with MetaMask payment to a selected admin.
- Public appointment schedule for every doctor.
- Covid trend table showing median age and age-group percentages for positive patients.

## Local Testing

This project is built for local testing with Ganache, Truffle, and MetaMask.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Ganache on `127.0.0.1:7545`.

3. Compile and deploy the smart contract:

   ```bash
   npm run compile
   npm run migrate
   ```

4. Copy the deployed `PatientManagement` contract address from Truffle output.

5. Open the website and paste that address into the "Connect Local Contract" section.

6. Connect MetaMask to the same Ganache network and use imported Ganache accounts for admin, patient, and doctor testing.

## Production Frontend

The Vercel deployment hosts the static frontend only. Blockchain data and transactions still require a locally running Ganache chain, a deployed contract address, and MetaMask connected to that local network.

## Useful Commands

```bash
npm run build
npm run compile
npm run migrate
npm start
```
