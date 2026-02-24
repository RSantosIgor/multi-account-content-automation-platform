import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';

// Helper function to verify account ownership
async function verifyAccountOwnership(userId: string, accountId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('x_accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', userId)
    .maybeSingle();

  return !error && !!data;
}

const paramsSchema = z.object({
  accountId: z.string().uuid(),
  ruleId: z.string().uuid(),
});

const querySchema = z.object({
  type: z.enum(['analysis', 'publication']).optional(),
});

const createRuleSchema = z.object({
  rule_type: z.enum(['analysis', 'publication']),
  rule_name: z.string().min(1).max(100),
  prompt_text: z.string().min(1).max(2000),
  priority: z.number().int().min(0).default(0),
});

const updateRuleSchema = z.object({
  rule_name: z.string().min(1).max(100).optional(),
  prompt_text: z.string().min(1).max(2000).optional(),
  is_active: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
});

const promptRulesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/v1/accounts/:accountId/prompt-rules
  fastify.get<{
    Params: { accountId: string };
    Querystring: { type?: 'analysis' | 'publication' };
  }>(
    '/api/v1/accounts/:accountId/prompt-rules',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paramsResult = paramsSchema.pick({ accountId: true }).safeParse(request.params);
      if (!paramsResult.success) {
        return reply.badRequest('Invalid account ID');
      }

      const queryResult = querySchema.safeParse(request.query);
      if (!queryResult.success) {
        return reply.badRequest('Invalid query parameters');
      }

      const { accountId } = paramsResult.data;
      const { type } = queryResult.data;

      // Verify ownership
      const hasAccess = await verifyAccountOwnership(request.user.id, accountId);
      if (!hasAccess) {
        return reply.notFound();
      }

      // Build query
      let query = supabase
        .from('prompt_rules')
        .select('*')
        .eq('x_account_id', accountId)
        .order('priority', { ascending: true });

      if (type) {
        query = query.eq('rule_type', type);
      }

      const { data, error } = await query;

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      return { data: data ?? [] };
    },
  );

  // POST /api/v1/accounts/:accountId/prompt-rules
  fastify.post<{
    Params: { accountId: string };
    Body: z.infer<typeof createRuleSchema>;
  }>(
    '/api/v1/accounts/:accountId/prompt-rules',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paramsResult = paramsSchema.pick({ accountId: true }).safeParse(request.params);
      if (!paramsResult.success) {
        return reply.badRequest('Invalid account ID');
      }

      const bodyResult = createRuleSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.badRequest('Invalid request body');
      }

      const { accountId } = paramsResult.data;
      const { rule_type, rule_name, prompt_text, priority } = bodyResult.data;

      // Verify ownership
      const hasAccess = await verifyAccountOwnership(request.user.id, accountId);
      if (!hasAccess) {
        return reply.notFound();
      }

      const { data, error } = await supabase
        .from('prompt_rules')
        .insert({
          x_account_id: accountId,
          rule_type,
          rule_name,
          prompt_text,
          priority,
        })
        .select()
        .single();

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      return { data };
    },
  );

  // PUT /api/v1/accounts/:accountId/prompt-rules/:ruleId
  fastify.put<{
    Params: { accountId: string; ruleId: string };
    Body: z.infer<typeof updateRuleSchema>;
  }>(
    '/api/v1/accounts/:accountId/prompt-rules/:ruleId',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paramsResult = paramsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        return reply.badRequest('Invalid parameters');
      }

      const bodyResult = updateRuleSchema.safeParse(request.body);
      if (!bodyResult.success) {
        return reply.badRequest('Invalid request body');
      }

      const { accountId, ruleId } = paramsResult.data;

      // Verify ownership
      const hasAccess = await verifyAccountOwnership(request.user.id, accountId);
      if (!hasAccess) {
        return reply.notFound();
      }

      // Build update object without undefined values
      const updateData: {
        rule_name?: string;
        prompt_text?: string;
        is_active?: boolean;
        priority?: number;
      } = {};
      if (bodyResult.data.rule_name !== undefined) updateData.rule_name = bodyResult.data.rule_name;
      if (bodyResult.data.prompt_text !== undefined)
        updateData.prompt_text = bodyResult.data.prompt_text;
      if (bodyResult.data.is_active !== undefined) updateData.is_active = bodyResult.data.is_active;
      if (bodyResult.data.priority !== undefined) updateData.priority = bodyResult.data.priority;

      const { data, error } = await supabase
        .from('prompt_rules')
        .update(updateData)
        .eq('id', ruleId)
        .eq('x_account_id', accountId)
        .select()
        .single();

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      if (!data) {
        return reply.notFound();
      }

      return { data };
    },
  );

  // DELETE /api/v1/accounts/:accountId/prompt-rules/:ruleId
  fastify.delete<{
    Params: { accountId: string; ruleId: string };
  }>(
    '/api/v1/accounts/:accountId/prompt-rules/:ruleId',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const paramsResult = paramsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        return reply.badRequest('Invalid parameters');
      }

      const { accountId, ruleId } = paramsResult.data;

      // Verify ownership
      const hasAccess = await verifyAccountOwnership(request.user.id, accountId);
      if (!hasAccess) {
        return reply.notFound();
      }

      const { error } = await supabase
        .from('prompt_rules')
        .delete()
        .eq('id', ruleId)
        .eq('x_account_id', accountId);

      if (error) {
        throw fastify.httpErrors.internalServerError(error.message);
      }

      return { success: true };
    },
  );
};

export default promptRulesRoutes;
