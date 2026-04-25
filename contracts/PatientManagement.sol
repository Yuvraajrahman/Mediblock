// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PatientManagement {
    enum Role {
        None,
        Admin,
        Patient,
        Doctor
    }

    struct User {
        string name;
        uint256 age;
        string district;
        Role role;
        bool registered;
    }

    struct Slot {
        uint256 id;
        address doctor;
        string time;
        bool booked;
        address patient;
        address paidToAdmin;
        uint256 paidAmount;
    }

    uint256 public appointmentFee = 0.01 ether;

    mapping(address => User) private users;
    mapping(address => string) private patientStatus;

    address[] private admins;
    address[] private patients;
    address[] private doctors;
    Slot[] private slots;

    event UserRegistered(address indexed account, Role role, string name);
    event PatientUpdated(address indexed patient, uint256 age, string district, string covidStatus);
    event SlotAdded(uint256 indexed slotId, address indexed doctor, string time);
    event AppointmentBooked(
        uint256 indexed slotId,
        address indexed patient,
        address indexed doctor,
        address paidToAdmin,
        uint256 amount
    );

    modifier onlyRegistered() {
        require(users[msg.sender].registered, "Please register first");
        _;
    }

    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.Admin, "Only admin can do this");
        _;
    }

    modifier onlyPatient() {
        require(users[msg.sender].role == Role.Patient, "Only patient can do this");
        _;
    }

    modifier onlyDoctor() {
        require(users[msg.sender].role == Role.Doctor, "Only doctor can do this");
        _;
    }

    function registerUser(uint8 role, string calldata name, uint256 age, string calldata district) external {
        require(role >= uint8(Role.Admin) && role <= uint8(Role.Doctor), "Choose a valid role");
        require(!users[msg.sender].registered, "Account already registered");
        require(bytes(name).length > 0, "Name is required");

        Role selectedRole = Role(role);
        users[msg.sender] = User(name, age, district, selectedRole, true);

        if (selectedRole == Role.Admin) {
            admins.push(msg.sender);
        } else if (selectedRole == Role.Patient) {
            patients.push(msg.sender);
            patientStatus[msg.sender] = "unknown";
        } else {
            doctors.push(msg.sender);
        }

        emit UserRegistered(msg.sender, selectedRole, name);
    }

    function updatePatient(
        address patient,
        uint256 age,
        string calldata district,
        string calldata covidStatus
    ) external onlyAdmin {
        require(users[patient].role == Role.Patient, "Address is not a patient");
        require(isValidStatus(covidStatus), "Use status: unknown, negative, positive, or recovered");

        users[patient].age = age;
        users[patient].district = district;
        patientStatus[patient] = covidStatus;

        emit PatientUpdated(patient, age, district, covidStatus);
    }

    function addMySlot(string calldata time) external onlyDoctor {
        _addSlot(msg.sender, time);
    }

    function addDoctorSlot(address doctor, string calldata time) external onlyAdmin {
        require(users[doctor].role == Role.Doctor, "Address is not a doctor");
        _addSlot(doctor, time);
    }

    function bookAppointment(uint256 slotId, address payable adminReceiver) external payable onlyPatient {
        require(slotId < slots.length, "Slot does not exist");
        require(users[adminReceiver].role == Role.Admin, "Receiver must be an admin");
        require(msg.value >= appointmentFee, "Payment is below appointment fee");

        Slot storage slot = slots[slotId];
        require(!slot.booked, "Slot already booked");

        slot.booked = true;
        slot.patient = msg.sender;
        slot.paidToAdmin = adminReceiver;
        slot.paidAmount = msg.value;

        (bool paid, ) = adminReceiver.call{value: appointmentFee}("");
        require(paid, "Admin payment failed");

        if (msg.value > appointmentFee) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - appointmentFee}("");
            require(refunded, "Refund failed");
        }

        emit AppointmentBooked(slotId, msg.sender, slot.doctor, adminReceiver, appointmentFee);
    }

    function getMyUser() external view returns (User memory user, string memory covidStatus) {
        return (users[msg.sender], patientStatus[msg.sender]);
    }

    function getUser(address account) external view returns (User memory user, string memory covidStatus) {
        return (users[account], patientStatus[account]);
    }

    function getAdmins() external view returns (address[] memory) {
        return admins;
    }

    function getPatients() external view returns (address[] memory) {
        return patients;
    }

    function getDoctors() external view returns (address[] memory) {
        return doctors;
    }

    function getSlotsCount() external view returns (uint256) {
        return slots.length;
    }

    function getSlot(uint256 slotId) external view returns (Slot memory) {
        require(slotId < slots.length, "Slot does not exist");
        return slots[slotId];
    }

    function getCovidPositiveAges() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < patients.length; i++) {
            if (_same(patientStatus[patients[i]], "positive")) {
                count++;
            }
        }

        uint256[] memory ages = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < patients.length; i++) {
            address patient = patients[i];
            if (_same(patientStatus[patient], "positive")) {
                ages[index] = users[patient].age;
                index++;
            }
        }

        return ages;
    }

    function isValidStatus(string calldata status) public pure returns (bool) {
        return
            _same(status, "unknown") ||
            _same(status, "negative") ||
            _same(status, "positive") ||
            _same(status, "recovered");
    }

    function _addSlot(address doctor, string calldata time) private {
        require(bytes(time).length > 0, "Slot time is required");

        uint256 slotId = slots.length;
        slots.push(Slot(slotId, doctor, time, false, address(0), address(0), 0));

        emit SlotAdded(slotId, doctor, time);
    }

    function _same(string memory left, string memory right) private pure returns (bool) {
        return keccak256(bytes(left)) == keccak256(bytes(right));
    }
}
