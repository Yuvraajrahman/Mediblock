const PatientManagement = artifacts.require("PatientManagement");

module.exports = function (deployer) {
  deployer.deploy(PatientManagement);
};
