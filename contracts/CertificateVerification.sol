// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateVerification
 * @author Shaurya Kalra — Christ University Delhi NCR (Reg. 24215223)
 * @notice Decentralised Certificate Verification System
 * @dev Stores certificate records on-chain; only admin can issue or revoke.
 *      verifyCertificate is a free public view — no gas required to verify.
 */
contract CertificateVerification {

    address public admin;

    struct Certificate {
        string recipientName;
        string courseName;
        string issueDate;
        bool   isValid;
        bool   exists;
    }

    mapping(string => Certificate) private certificates;

    // ── Events ──────────────────────────────────────────────────────────────
    event CertificateIssued(
        string indexed certId,
        string recipientName,
        string courseName,
        string issueDate
    );
    event CertificateRevoked(string indexed certId);

    // ── Constructor ──────────────────────────────────────────────────────────
    constructor() {
        admin = msg.sender;
    }

    // ── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // ── Write functions (admin only) ─────────────────────────────────────────

    /**
     * @notice Issue a new certificate on-chain
     * @param certId       Unique certificate identifier
     * @param recipientName Full name of the certificate holder
     * @param courseName   Course or programme name
     * @param issueDate    Date of issue (string, e.g. "2026-10-01")
     */
    function issueCertificate(
        string memory certId,
        string memory recipientName,
        string memory courseName,
        string memory issueDate
    ) public onlyAdmin {
        require(bytes(certId).length > 0,          "certId cannot be empty");
        require(bytes(recipientName).length > 0,   "recipientName cannot be empty");
        require(bytes(courseName).length > 0,      "courseName cannot be empty");
        require(!certificates[certId].exists,      "Certificate ID already exists");

        certificates[certId] = Certificate({
            recipientName: recipientName,
            courseName:    courseName,
            issueDate:     issueDate,
            isValid:       true,
            exists:        true
        });

        emit CertificateIssued(certId, recipientName, courseName, issueDate);
    }

    /**
     * @notice Revoke an existing certificate (sets isValid to false)
     * @param certId Certificate identifier to revoke
     */
    function revokeCertificate(string memory certId) public onlyAdmin {
        require(certificates[certId].exists,  "Certificate not found");
        require(certificates[certId].isValid, "Certificate already revoked");

        certificates[certId].isValid = false;
        emit CertificateRevoked(certId);
    }

    // ── Read functions (public, free) ────────────────────────────────────────

    /**
     * @notice Verify a certificate — free, no gas, callable by anyone
     * @param certId Certificate identifier to look up
     * @return recipientName, courseName, issueDate, isValid
     */
    function verifyCertificate(string memory certId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            bool
        )
    {
        require(certificates[certId].exists, "Certificate not found");
        Certificate memory cert = certificates[certId];
        return (cert.recipientName, cert.courseName, cert.issueDate, cert.isValid);
    }

    /**
     * @notice Check if a certificate ID already exists on-chain
     */
    function certificateExists(string memory certId) public view returns (bool) {
        return certificates[certId].exists;
    }
}
