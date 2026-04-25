const checkerForm = document.querySelector("#id-checker");
const checkerInput = document.querySelector("#student-id");
const checkerResult = document.querySelector("#checker-result");
const storedFullName = "Md. Tasnim Kabir";

function setResult(message, status) {
  checkerResult.textContent = message;
  checkerResult.className = `result ${status}`;
}

checkerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const fullID = Number.parseInt(checkerInput.value, 10);

  if (!Number.isSafeInteger(fullID) || fullID <= 0) {
    setResult("Please enter a valid positive student ID.", "error");
    return;
  }

  const lastTwoDigits = fullID % 100;
  const passesFinalRule = lastTwoDigits !== 0 && fullID % lastTwoDigits === 0;

  if (passesFinalRule) {
    setResult(`Found: ${storedFullName}`, "success");
    return;
  }

  setResult("Not found", "error");
});
