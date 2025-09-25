// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentCheck {
    uint256 private studentID = 21301647;
    string private studentName = "Md. Tasnim Kabir";

    // Function to verify student ID and return the name
    function getStudentName(uint256 inputID) public view returns (string memory) {
        if (inputID == studentID) {
            return studentName;
        } else {
            return "This is not your ID";
        }
    }
}