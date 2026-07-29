import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post(
    "/",
    async ({ body, set }) => {
      const result = await registerUser(body);

      if (!result.success) {
        set.status = 400;
        return {
          error: result.error,
        };
      }

      set.status = 200;
      return {
        data: result.data,
      };
    },
    {
      body: t.Object({
        name: t.String({
          minLength: 1,
          error: "Nama wajib diisi",
        }),
        email: t.String({
          minLength: 1,
          format: "email",
          error: "Email wajib diisi dan berformat valid",
        }),
        password: t.String({
          minLength: 1,
          error: "Password wajib diisi",
        }),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      const result = await loginUser(body);

      if (!result.success) {
        set.status = 400;
        return {
          error: result.error,
        };
      }

      set.status = 200;
      return {
        data: result.data,
      };
    },
    {
      body: t.Object({
        email: t.String({
          minLength: 1,
          format: "email",
          error: "Email wajib diisi dan berformat valid",
        }),
        password: t.String({
          minLength: 1,
          error: "Password wajib diisi",
        }),
      }),
    }
  );

