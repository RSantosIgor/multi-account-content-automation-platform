type RequestUser = {
  id: string;
  email: string;
  role: 'admin' | 'member';
};

declare module 'fastify' {
  interface FastifyRequest {
    user: RequestUser;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
  }
}
