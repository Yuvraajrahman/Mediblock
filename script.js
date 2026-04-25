const CONTRACT_ABI = [
  "function appointmentFee() view returns (uint256)",
  "function registerUser(uint8 role, string name, uint256 age, string district)",
  "function updatePatient(address patient, uint256 age, string district, string covidStatus)",
  "function addMySlot(string time)",
  "function addDoctorSlot(address doctor, string time)",
  "function bookAppointment(uint256 slotId, address adminReceiver) payable",
  "function getMyUser() view returns (tuple(string name,uint256 age,string district,uint8 role,bool registered), string covidStatus)",
  "function getUser(address account) view returns (tuple(string name,uint256 age,string district,uint8 role,bool registered), string covidStatus)",
  "function getAdmins() view returns (address[])",
  "function getSlotsCount() view returns (uint256)",
  "function getSlot(uint256 slotId) view returns (tuple(uint256 id,address doctor,string time,bool booked,address patient,address paidToAdmin,uint256 paidAmount))",
  "function getCovidPositiveAges() view returns (uint256[])",
  "event UserRegistered(address indexed account, uint8 role, string name)",
  "event PatientUpdated(address indexed patient, uint256 age, string district, string covidStatus)",
  "event SlotAdded(uint256 indexed slotId, address indexed doctor, string time)",
  "event AppointmentBooked(uint256 indexed slotId, address indexed patient, address indexed doctor, address paidToAdmin, uint256 amount)",
];

const ROLE_NAMES = ["None", "Admin", "Patient", "Doctor"];
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

let provider;
let signer;
let contract;
let account;
let appointmentFee = 0n;

const $ = (id) => document.getElementById(id);

window.addEventListener("DOMContentLoaded", () => {
  $("contractAddress").value = localStorage.getItem("mediblockContractAddress") || "";
  bindEvents();
  if ($("contractAddress").value) {
    loadContract();
  }
});

function bindEvents() {
  $("saveContract").addEventListener("click", () => {
    const address = $("contractAddress").value.trim();
    if (!ethers.isAddress(address)) {
      showMessage("Please enter a valid contract address.", "error");
      return;
    }
    localStorage.setItem("mediblockContractAddress", address);
    loadContract();
    showMessage("Contract address saved.", "success");
  });

  $("connectWallet").addEventListener("click", connectWallet);
  $("refreshData").addEventListener("click", refreshAll);
  $("refreshSchedule").addEventListener("click", refreshAll);
  $("registerForm").addEventListener("submit", handleRegister);
  $("updatePatientForm").addEventListener("submit", handleUpdatePatient);
  $("slotForm").addEventListener("submit", handleAddSlot);
  $("bookForm").addEventListener("submit", handleBookAppointment);

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    showMessage("MetaMask is required for local testing.", "error");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  account = accounts[0];
  signer = await provider.getSigner();
  $("walletStatus").textContent = `Connected: ${short(account)}`;

  if (!contract) {
    loadContract();
  }
  await refreshAll();
}

function loadContract() {
  const address = $("contractAddress").value.trim();
  if (!ethers.isAddress(address)) {
    $("contractStatus").textContent = "Contract not loaded";
    return;
  }

  if (!provider && window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  const runner = signer || provider;
  if (!runner) {
    $("contractStatus").textContent = "Connect MetaMask to load contract";
    return;
  }

  contract = new ethers.Contract(address, CONTRACT_ABI, runner);
  $("contractStatus").textContent = `Contract: ${short(address)}`;
  listenForContractEvents();
}

function listenForContractEvents() {
  if (!contract || contract._mediblockListening) {
    return;
  }

  contract._mediblockListening = true;
  contract.on("UserRegistered", refreshAll);
  contract.on("PatientUpdated", refreshAll);
  contract.on("SlotAdded", refreshAll);
  contract.on("AppointmentBooked", async () => {
    showMessage("Success: appointment booked and payment completed.", "success");
    await refreshAll();
  });
}

async function handleRegister(event) {
  event.preventDefault();
  await withTransaction(async () => {
    const role = Number($("registerRole").value);
    const name = $("registerName").value.trim();
    const age = BigInt($("registerAge").value || "0");
    const district = $("registerDistrict").value.trim();
    const tx = await getWritableContract().registerUser(role, name, age, district);
    await tx.wait();
    showMessage("Registration successful.", "success");
  });
}

async function handleUpdatePatient(event) {
  event.preventDefault();
  await withTransaction(async () => {
    const patient = $("patientAddress").value.trim();
    const age = BigInt($("patientAge").value || "0");
    const district = $("patientDistrict").value.trim();
    const status = $("patientStatus").value;
    const tx = await getWritableContract().updatePatient(patient, age, district, status);
    await tx.wait();
    showMessage("Patient data updated.", "success");
  });
}

async function handleAddSlot(event) {
  event.preventDefault();
  await withTransaction(async () => {
    const doctor = $("slotDoctor").value.trim();
    const time = $("slotTime").value.trim();
    const writable = getWritableContract();
    const tx = doctor ? await writable.addDoctorSlot(doctor, time) : await writable.addMySlot(time);
    await tx.wait();
    showMessage("Slot added.", "success");
  });
}

async function handleBookAppointment(event) {
  event.preventDefault();
  await withTransaction(async () => {
    const slotId = $("slotSelect").value;
    const admin = $("adminSelect").value;
    const tx = await getWritableContract().bookAppointment(slotId, admin, {
      value: appointmentFee,
    });
    await tx.wait();
    showMessage("Success: appointment booked.", "success");
  });
}

async function refreshAll() {
  if (!contract) {
    loadContract();
  }
  if (!contract) {
    return;
  }

  await Promise.all([refreshMyAccount(), refreshAdmins(), refreshSchedule(), refreshCovidTrends()]);
}

async function refreshMyAccount() {
  if (!account) {
    $("myAccount").textContent = "Connect MetaMask to view your on-chain profile.";
    return;
  }

  try {
    const [user, covidStatus] = await contract.getMyUser();
    if (!user.registered) {
      $("myAccount").textContent = `${short(account)} is not registered yet.`;
      return;
    }

    $("myAccount").innerHTML = `
      <strong>${escapeHtml(user.name)}</strong><br>
      Address: ${short(account)}<br>
      Role: ${ROLE_NAMES[Number(user.role)]}<br>
      Age: ${user.age.toString()}<br>
      District: ${escapeHtml(user.district || "-")}<br>
      Covid Status: ${escapeHtml(covidStatus || "-")}
    `;
  } catch (error) {
    $("myAccount").textContent = "Could not load account data.";
    console.error(error);
  }
}

async function refreshAdmins() {
  const adminSelect = $("adminSelect");
  adminSelect.innerHTML = "";

  try {
    const admins = await contract.getAdmins();
    if (!admins.length) {
      adminSelect.innerHTML = '<option value="">No admins registered</option>';
      return;
    }

    for (const admin of admins) {
      adminSelect.add(new Option(short(admin), admin));
    }
  } catch (error) {
    adminSelect.innerHTML = '<option value="">Unable to load admins</option>';
    console.error(error);
  }
}

async function refreshSchedule() {
  const body = $("scheduleBody");
  const slotSelect = $("slotSelect");
  body.innerHTML = "";
  slotSelect.innerHTML = "";

  try {
    appointmentFee = await contract.appointmentFee();
    $("feeText").textContent = `${ethers.formatEther(appointmentFee)} ETH`;

    const count = Number(await contract.getSlotsCount());
    if (!count) {
      body.innerHTML = '<tr><td colspan="6">No doctor slots have been added yet.</td></tr>';
      slotSelect.innerHTML = '<option value="">No available slots</option>';
      return;
    }

    let available = 0;
    for (let index = 0; index < count; index++) {
      const slot = await contract.getSlot(index);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${slot.id.toString()}</td>
        <td>${short(slot.doctor)}</td>
        <td>${escapeHtml(slot.time)}</td>
        <td>${slot.booked ? "Booked" : "Available"}</td>
        <td>${slot.patient === ZERO_ADDRESS ? "-" : short(slot.patient)}</td>
        <td>${slot.paidToAdmin === ZERO_ADDRESS ? "-" : short(slot.paidToAdmin)}</td>
      `;
      body.appendChild(row);

      if (!slot.booked) {
        slotSelect.add(new Option(`#${slot.id.toString()} - ${slot.time} (${short(slot.doctor)})`, slot.id.toString()));
        available++;
      }
    }

    if (!available) {
      slotSelect.innerHTML = '<option value="">No available slots</option>';
    }
  } catch (error) {
    body.innerHTML = '<tr><td colspan="6">Unable to load appointment schedule.</td></tr>';
    slotSelect.innerHTML = '<option value="">Unable to load slots</option>';
    console.error(error);
  }
}

async function refreshCovidTrends() {
  try {
    const rawAges = await contract.getCovidPositiveAges();
    const ages = rawAges.map((age) => Number(age)).sort((a, b) => a - b);
    const total = ages.length;

    $("medianAge").textContent = total ? getMedian(ages).toString() : "No positive patients";
    $("childrenPercent").textContent = formatPercent(ages.filter((age) => age < 13).length, total);
    $("teenPercent").textContent = formatPercent(ages.filter((age) => age >= 13 && age < 20).length, total);
    $("youngPercent").textContent = formatPercent(ages.filter((age) => age >= 20 && age < 50).length, total);
    $("elderPercent").textContent = formatPercent(ages.filter((age) => age >= 50).length, total);
  } catch (error) {
    ["medianAge", "childrenPercent", "teenPercent", "youngPercent", "elderPercent"].forEach((id) => {
      $(id).textContent = "-";
    });
    console.error(error);
  }
}

async function withTransaction(action) {
  try {
    setButtonsDisabled(true);
    if (!signer) {
      await connectWallet();
    }
    if (!contract) {
      throw new Error("Load the contract address first.");
    }
    await action();
    await refreshAll();
  } catch (error) {
    showMessage(getErrorMessage(error), "error");
    console.error(error);
  } finally {
    setButtonsDisabled(false);
  }
}

function getWritableContract() {
  if (!contract || !signer) {
    throw new Error("Connect MetaMask and load the contract first.");
  }
  return contract.connect(signer);
}

function setButtonsDisabled(disabled) {
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = disabled;
  });
}

function getMedian(values) {
  const middle = Math.floor(values.length / 2);
  if (values.length % 2) {
    return values[middle];
  }
  return (values[middle - 1] + values[middle]) / 2;
}

function formatPercent(count, total) {
  if (!total) {
    return "0%";
  }
  return `${((count / total) * 100).toFixed(2)}%`;
}

function short(address) {
  if (!address) {
    return "-";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function showMessage(text, type = "") {
  const message = $("message");
  message.textContent = text;
  message.className = `message show ${type}`.trim();
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => {
    message.className = "message";
  }, 5000);
}

function getErrorMessage(error) {
  const message =
    error?.revert?.args?.[0] ||
    error?.reason ||
    error?.shortMessage ||
    error?.message ||
    "Something went wrong.";
  return message.replace(/^execution reverted: /i, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
