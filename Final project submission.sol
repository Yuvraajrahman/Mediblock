// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IDChecker {
    // State variable to store your full name
    string public fullName = "Md. Tasnim Kabir"; 

    // Function to check divisibility
    function checkID(uint256 fullID) public view returns (string memory) {
        // Extract the last two digits using a local variable
        uint256 lastTwoDigits = fullID % 100;

        // Check if the ID is divisible by the last two digits
        if (lastTwoDigits != 0 && fullID % lastTwoDigits == 0) {
            return fullName;
        } else {
            return "Not found";
        }
    }
}

