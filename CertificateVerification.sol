// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateVerification {

    address public admin;

    struct Certificate {
        string recipientName;
        string courseName;
        string issueDate;
        bool isValid;
        bool exists;
    }

    mapping(string => Certificate) private certificates;

    event CertificateIssued(string certId, string recipientName, string courseName);
    event CertificateRevoked(string certId);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function issueCertificate(
        string memory certId,
        string memory recipientName,
        string memory courseName,
        string memory issueDate
    ) public onlyAdmin {
        require(!certificates[certId].exists, "Certificate ID already exists");

        certificates[certId] = Certificate({
            recipientName: recipientName,
            courseName: courseName,
            issueDate: issueDate,
            isValid: true,
            exists: true
        });

        emit CertificateIssued(certId, recipientName, courseName);
    }

    function verifyCertificate(string memory certId)
        public view
        returns (
            string memory recipientName,
            string memory courseName,
            string memory issueDate,
            bool isValid
        )
    {
        require(certificates[certId].exists, "Certificate not found");
        Certificate memory cert = certificates[certId];
        return (cert.recipientName, cert.courseName, cert.issueDate, cert.isValid);
    }

    function revokeCertificate(string memory certId) public onlyAdmin {
        require(certificates[certId].exists, "Certificate not found");
        certificates[certId].isValid = false;
        emit CertificateRevoked(certId);
    }

    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin cannot be zero address");
        require(newAdmin != admin, "New admin is already the current admin");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }
}
