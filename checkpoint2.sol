// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentDirectory {
    mapping(uint256 => string) private students;

    // Function to add a student
    function addStudent(uint256 id, string memory name) public {
        students[id] = name;
    }

    // Function to get the name of the student by ID
    function getStudentName(uint256 id) public view returns (string memory) {
        string memory name = students[id];
        if (bytes(name).length == 0) {
            return "Student not found";
        }
        return name;
    }
}

