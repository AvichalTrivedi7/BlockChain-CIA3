const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateVerification", function () {

  let contract;
  let admin, user1, user2;

  // Sample certificate data
  const CERT = {
    id:        "CERT-2026-001",
    name:      "Shaurya Kalra",
    course:    "BSc Data Science & AI",
    date:      "2026-10-01"
  };

  // Deploy a fresh contract before each test
  beforeEach(async function () {
    [admin, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CertificateVerification");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ── Deployment ─────────────────────────────────────────────────────────────
  describe("Deployment", function () {

    it("sets the deployer as admin", async function () {
      expect(await contract.admin()).to.equal(admin.address);
    });

  });

  // ── issueCertificate ───────────────────────────────────────────────────────
  describe("issueCertificate()", function () {

    it("allows admin to issue a certificate", async function () {
      await expect(
        contract.issueCertificate(CERT.id, CERT.name, CERT.course, CERT.date)
      ).to.emit(contract, "CertificateIssued");
    });

    it("stores the certificate correctly on-chain", async function () {
      await contract.issueCertificate(CERT.id, CERT.name, CERT.course, CERT.date);

      const [name, course, date, isValid] = await contract.verifyCertificate(CERT.id);
      expect(name).to.equal(CERT.name);
      expect(course).to.equal(CERT.course);
      expect(date).to.equal(CERT.date);
      expect(isValid).to.equal(true);
    });

    it("emits CertificateIssued with correct args", async function () {
      await expect(
        contract.issueCertificate(CERT.id, CERT.name, CERT.course, CERT.date)
      )
        .to.emit(contract, "CertificateIssued")
        .withArgs(CERT.id, CERT.name, CERT.course, CERT.date);
    });

    it("reverts if a non-admin tries to issue", async function () {
      await expect(
        contract.connect(user1).issueCertificate(CERT.id, CERT.name, CERT.course, CERT.date)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("reverts on duplicate certificate ID", async function () {
      await contract.issueCertificate(CERT.id, CERT.name, CERT.course, CERT.date);
      await expect(
        contract.issueCertificate(CERT.id, "Someone Else", CERT.course, CERT.date)
      ).to.be.revertedWith("Certificate ID already exists");
    });

    it("reverts if certId is empty", async function () {
      await expect(
        contract.issueCertificate("", CERT.name, CERT.course, CERT.date)
      ).to.be.revertedWith("certId cannot be empty");
    });

    it("reverts if recipientName is empty", async function () {
      await expect(
        contract.issueCertificate(CERT.id, "", CERT.course, CERT.date)
      ).to.be.revertedWith("recipientName cannot be empty");
    });

    it("allows multiple different certificates to be issued", async function () {
      await contract.issueCertificate("CERT-001", "Alice", CERT.course, CERT.date);
      await contract.issueCertificate("CERT-002", "Bob",   CERT.course, CERT.date);
      await contract.issueCertificate("CERT-003", "Carol", CERT.course, CERT.date);

      const [name1] = await contract.verifyCertificate("CERT-001");
      const [name2] = await contract.verifyCertificate("CERT-002");
      const [name3] = await contract.verifyCertificate("CERT-003");

      expect(name1).to.equal("Alice");
      expect(name2).to.equal("Bob");
      expect(name3).to.equal("Carol");
    });

  });

  // ── verifyCertificate ──────────────────────────────────────────────────────
  describe("verifyCertificate()", function () {

    it("returns correct data for a valid certificate", async function () {
      await contract.issueCertificate(CERT.id, CERT.name, CERT.course, CERT.date);
      const [name, course, date, isValid] = await contract.verifyCertificate(CERT.id);

      expect(name).to.equal(CERT.name);
      expect(course).to.equal(CERT.course);
      expect(date).to.equal(CERT.date);
      expect(isValid).to.be.true;
    });

    it("can be called by any address (not just admin)", async function () {
      await contract.issueCertificate(CERT.id, CERT.name, CERT.course, CERT.date);
      // user2 — completely unrelated wallet — can verify
      const [, , , isValid] = await contract.connect(user2).verifyCertificate(CERT.id);
      expect(isValid).to.be.true;
    });

    it("reverts for a non-existent certificate ID", async function () {
      await expect(
        contract.verifyCertificate("FAKE-999")
      ).to.be.revertedWith("Certificate not found");
    });

  });

  // ── revokeCertificate ──────────────────────────────────────────────────────
  describe("revokeCertificate()", function () {

    beforeEach(async function () {
      // Issue a cert before each revoke test
      await contract.issueCertificate(CERT.id, CERT.name, CERT.course, CERT.date);
    });

    it("admin can revoke a certificate", async function () {
      await expect(
        contract.revokeCertificate(CERT.id)
      ).to.emit(contract, "CertificateRevoked").withArgs(CERT.id);
    });

    it("sets isValid to false after revocation", async function () {
      await contract.revokeCertificate(CERT.id);
      const [, , , isValid] = await contract.verifyCertificate(CERT.id);
      expect(isValid).to.be.false;
    });

    it("reverts if non-admin tries to revoke", async function () {
      await expect(
        contract.connect(user1).revokeCertificate(CERT.id)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("reverts when revoking a non-existent certificate", async function () {
      await expect(
        contract.revokeCertificate("FAKE-999")
      ).to.be.revertedWith("Certificate not found");
    });

    it("reverts when revoking an already-revoked certificate", async function () {
      await contract.revokeCertificate(CERT.id);
      await expect(
        contract.revokeCertificate(CERT.id)
      ).to.be.revertedWith("Certificate already revoked");
    });

    it("revoked certificate still exists but shows isValid = false", async function () {
      await contract.revokeCertificate(CERT.id);
      expect(await contract.certificateExists(CERT.id)).to.be.true;

      const [, , , isValid] = await contract.verifyCertificate(CERT.id);
      expect(isValid).to.be.false;
    });

  });

  // ── certificateExists ──────────────────────────────────────────────────────
  describe("certificateExists()", function () {

    it("returns false for unknown ID", async function () {
      expect(await contract.certificateExists("FAKE")).to.be.false;
    });

    it("returns true after issuance", async function () {
      await contract.issueCertificate(CERT.id, CERT.name, CERT.course, CERT.date);
      expect(await contract.certificateExists(CERT.id)).to.be.true;
    });

  });

});
