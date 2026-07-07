import { beforeEach, describe, expect, it, vi } from "vitest";

const findByEmail = vi.fn();
const createWithOrganization = vi.fn();
const storeRefreshToken = vi.fn();
const findPendingByEmail = vi.fn();
const listForUser = vi.fn();

vi.mock("../../repositories/AuthRepository", () => ({
  AuthRepository: vi.fn().mockImplementation(function () {
    return {
      findByEmail,
      createWithOrganization,
      storeRefreshToken,
      findById: vi.fn(),
      findRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
      createInOrganization: vi.fn(),
    };
  }),
}));

vi.mock("../../repositories/InvitationRepository", () => ({
  InvitationRepository: vi.fn().mockImplementation(function () {
    return {
      findPendingByEmail,
      findByToken: vi.fn(),
      markAccepted: vi.fn(),
    };
  }),
}));

vi.mock("../../repositories/PermissionRepository", () => ({
  PermissionRepository: vi.fn().mockImplementation(function () {
    return {
      listForUser,
    };
  }),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

import bcrypt from "bcryptjs";
import { AuthService } from "../AuthService";
import { ConflictError, UnauthorizedError } from "../../utils/errors";
import { Role } from "../../types";

const baseUser = {
  id: "user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  passwordHash: "hashed-password",
  role: Role.SUPER_ADMIN,
  organizationId: "org-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    storeRefreshToken.mockResolvedValue(undefined);
    authService = new AuthService();
  });

  describe("signup", () => {
    it("creates a new user and organization when the email is unused", async () => {
      findByEmail.mockResolvedValue(null);
      findPendingByEmail.mockResolvedValue(null);
      createWithOrganization.mockResolvedValue(baseUser);

      const result = await authService.signup({
        name: "Ada Lovelace",
        email: "ada@example.com",
        password: "supersecret",
        organizationName: "Analytical Engines",
      });

      expect(createWithOrganization).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "ada@example.com",
          organizationName: "Analytical Engines",
          role: Role.SUPER_ADMIN,
        }),
      );
      expect(result.user.email).toBe("ada@example.com");
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(storeRefreshToken).toHaveBeenCalledTimes(1);
    });

    it("rejects signup when the email is already registered", async () => {
      findByEmail.mockResolvedValue(baseUser);

      await expect(
        authService.signup({
          name: "Ada Lovelace",
          email: "ada@example.com",
          password: "supersecret",
          organizationName: "Analytical Engines",
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(createWithOrganization).not.toHaveBeenCalled();
    });

    it("rejects signup when the email has a pending team invitation", async () => {
      findByEmail.mockResolvedValue(null);
      findPendingByEmail.mockResolvedValue({ id: "invite-1" });

      await expect(
        authService.signup({
          name: "Ada Lovelace",
          email: "ada@example.com",
          password: "supersecret",
          organizationName: "Analytical Engines",
        }),
      ).rejects.toBeInstanceOf(ConflictError);

      expect(createWithOrganization).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("issues tokens for valid credentials", async () => {
      findByEmail.mockResolvedValue(baseUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      listForUser.mockResolvedValue([]);

      const result = await authService.login({
        email: "ada@example.com",
        password: "supersecret",
      });

      expect(result.user.email).toBe("ada@example.com");
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it("rejects login when the user does not exist", async () => {
      findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "nobody@example.com",
          password: "whatever",
        }),
      ).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it("rejects login when the password is incorrect", async () => {
      findByEmail.mockResolvedValue(baseUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({
          email: "ada@example.com",
          password: "wrong-password",
        }),
      ).rejects.toBeInstanceOf(UnauthorizedError);

      expect(storeRefreshToken).not.toHaveBeenCalled();
    });
  });
});
