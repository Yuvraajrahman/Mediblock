// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentData {
    struct SemesterData {
        string gpa;
        uint256 studentID;
        string semesterName;
        uint256 coursesTaken;
    }

    mapping(uint256 => SemesterData[]) private studentRecords;

    function addSemesterData(
        uint256 id,
        string memory gpa,
        string memory semesterName,
        uint256 coursesTaken
    ) public {
        studentRecords[id].push(SemesterData(gpa, id, semesterName, coursesTaken));
    }


    function getSemesterData(uint256 id) public view returns (SemesterData[] memory) {
        return studentRecords[id];
    }
}
