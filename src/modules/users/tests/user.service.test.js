const prisma = require("../../../database/prisma");
const AppError = require("../../../shared/errors/AppError");
const transporter = require("../../../shared/utils/mail.util");
const UsersService = require("../users.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../../../database/prisma", () => ({
  usuarios: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock("../../../shared/utils/mail.util");

describe("UsersService", () => {
  let service;

  const mockReturnedUser = {
    id: 1,
    nome: "Usuário da Silva",
    cpf: "12345678901",
    email: "usuario@email.com",
    emailVerificado: true,
  };

  beforeEach(() => {
    service = new UsersService();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe("create", () => {
    const newUser = {
      nome: "Usuário da Silva",
      email: "usuario@email.com",
      cpf: "12345678901",
      senha: "123456",
    };

    it("should throw error if password is not provided", async () => {
      const result = service.create({ email: "teste@email.com" });

      await expect(result).rejects.toMatchObject({ status: 400 });
      await expect(result).rejects.toBeInstanceOf(AppError);
    });

    it("should create user with hashed password and send confirmation email", async () => {
      prisma.usuarios.create.mockResolvedValue(mockReturnedUser);
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");
      transporter.sendMail.mockResolvedValue(true);
      jest.spyOn(jwt, "sign").mockReturnValue("token");

      expect(await service.create(newUser)).toEqual(mockReturnedUser);
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ html: expect.stringContaining("token") }),
      );
      expect(prisma.usuarios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ senha: "hashedPassword" }),
          omit: { senha: true },
        }),
      );
    });

    it("should still create user even if email sending fails", async () => {
      prisma.usuarios.create.mockResolvedValue(mockReturnedUser);
      transporter.sendMail.mockRejectedValue(new Error("SMTP Timeout"));
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");
      jest.spyOn(jwt, "sign").mockReturnValue("token");

      expect(await service.create(newUser)).toEqual(mockReturnedUser);
      expect(transporter.sendMail).toHaveBeenCalled();
    });
  });

  describe("confirmEmail", () => {
    it("should verify email if provided token is valid", async () => {
      jest.spyOn(jwt, "verify").mockReturnValue({ id: 1 });
      jest
        .spyOn(service, "findById")
        .mockResolvedValue({ id: 1, emailVerificado: false });

      jest.spyOn(service, "update").mockResolvedValue({
        id: 1,
        emailVerificado: true,
      });

      const result = await service.confirmEmail("validToken");
      expect(result).toEqual({ id: 1, emailVerificado: true });
    });

    it("should throw error if token is invalid", async () => {
      jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error();
      });

      const result = service.confirmEmail("invalid-token");

      await expect(result).rejects.toMatchObject({ status: 400 });
      await expect(result).rejects.toBeInstanceOf(AppError);
    });

    it("should throw error if user doesn't exist", async () => {
      jest.spyOn(jwt, "verify").mockReturnValue({ id: 0 });
      jest.spyOn(service, "findById").mockResolvedValue(null);

      await expect(service.confirmEmail("token")).rejects.toMatchObject({
        status: 404,
      });
    });

    it("should throw error if email has already been verified", async () => {
      jest.spyOn(service, "findById").mockResolvedValue(mockReturnedUser);
      expect(service.confirmEmail("token")).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  describe("findAll", () => {
    it("should return users without password", async () => {
      const mockUsers = [
        { id: 2, nome: "User 2" },
        { id: 1, nome: "User 1" },
      ];

      prisma.usuarios.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(prisma.usuarios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          omit: { senha: true },
        }),
      );
    });
  });

  describe("update", () => {
    beforeEach(() => {
      prisma.usuarios.update.mockResolvedValue(mockReturnedUser);
    });

    it("should update user and hash password if it's provided", async () => {
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");

      const result = await service.update(1, { senha: "12345678" });

      expect(result).toEqual(mockReturnedUser);
      expect(prisma.usuarios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ senha: "hashedPassword" }),
          omit: { senha: true },
        }),
      );
    });

    it("should update user without hashing if password is not provided", async () => {
      jest.spyOn(bcrypt, "hash");

      const result = await service.update(1, { nome: "Maria" });

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toEqual(mockReturnedUser);
    });
  });

  describe("findById", () => {
    it("should return user when a valid id is provided", async () => {
      prisma.usuarios.findUnique.mockResolvedValue(mockReturnedUser);

      expect(await service.findById(1)).toEqual(mockReturnedUser);
      expect(prisma.usuarios.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ omit: { senha: true } }),
      );
    });

    it("should throw error if user doesn't exist", async () => {
      prisma.usuarios.findUnique.mockResolvedValue(null);

      const result = service.findById(0);
      await expect(result).rejects.toMatchObject({ status: 404 });
      await expect(result).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      prisma.usuarios.delete.mockResolvedValue(mockReturnedUser);

      const result = await service.delete(1);
      expect(result).toEqual(mockReturnedUser);
    });
  });
});
