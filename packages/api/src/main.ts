import Fastify from "fastify";
import {
  TypeBoxTypeProvider,
  TypeBoxValidatorCompiler,
} from "@fastify/type-provider-typebox";
import { UsersModel } from "@app/core/users/model";
import { UsersSchema } from "@app/core/users/schema";

const fastify = Fastify({
  logger: true,
})
  // Con questo sfruttiamo i tipi generati da drizzle per validare gli input
  .withTypeProvider<TypeBoxTypeProvider>()
  .setValidatorCompiler(TypeBoxValidatorCompiler);

fastify.get("/users", async (_request, reply) => {
  reply.send(await UsersModel.list());
});

fastify.post(
  "/user",
  // Come ad esempio qui
  { schema: { body: UsersSchema.insert } },
  async (request, reply) => {
    const result = await UsersModel.create(request.body);
    if (result) {
      reply.status(200).send(result.id);
    } else {
      reply.status(500).send();
    }
  }
);

// Necessario per il nostro Load Balancer
fastify.get("/health", (_request, reply) => {
  reply.status(200).send("Ok");
});

fastify.listen(
  {
    port: 3000,
    // Ascoltiamo su tutte le interfacce nel container
    host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost",
  },
  (err, _address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }
);
