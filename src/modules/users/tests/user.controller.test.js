const request = require("supertest");
const express = require("express");

const UsersController = require("../users.controller");
const UsersService = require("../users.service");
const errorMiddleware = require("../../../shared/middlewares/error.middleware");
const AppError = require("../../../shared/errors/AppError");

jest.mock("../users.service");

describe("UsersController", () => {
  let service;

  mockUser = {
    id: 1,
    nome: "Usuário da Silva",
    email: "usuario@email.com",
    cpf: "12345678901",
  };

  beforeEach(() => {
    service = new UsersService();
    const controller = new UsersController();
    controller.service = service;

    app = express();
    app.use(express.json());

    app.post("/users", controller.create.bind(controller));
    app.get("/users", controller.getAll.bind(controller));
    app.get("/users/:id", controller.getById.bind(controller));
    app.patch("/users/:id", controller.update.bind(controller));
    app.delete("/users/:id", controller.delete.bind(controller));
    app.get("/users/confirm-email", controller.confirmEmail.bind(controller));

    app.use(errorMiddleware);

    jest.clearAllMocks();
  });

  describe("POST /users", () => {
    it("should create a user and return 201", async () => {
      service.create.mockResolvedValue(mockUser);

      const response = await request(app).post("/users").send({
        nome: "Usuário da Silva",
        email: "usuario@email.com",
        senha: "123456",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Usuário criado com sucesso",
        data: mockUser,
      });
    });
  });

  //   describe("GET /users");

  //   describe("GET /users/:id");

  //   describe("PATCH /users/:id");

  //   describe("DELETE /users/:id");
});
