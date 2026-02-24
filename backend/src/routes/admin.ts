import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { authorize } from '../plugins/authorize.js';

const userIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/v1/admin/users — List all users
  fastify.get(
    '/api/v1/admin/users',
    { preHandler: [fastify.authenticate, authorize('admin')] },
    async (_request, _reply) => {
      // Get all users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        throw fastify.httpErrors.internalServerError(authError.message);
      }

      // Get user profiles and roles
      const userIds = authUsers.users.map((u) => u.id);

      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url, created_at')
        .in('id', userIds);

      if (profilesError) {
        throw fastify.httpErrors.internalServerError(profilesError.message);
      }

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) {
        throw fastify.httpErrors.internalServerError(rolesError.message);
      }

      // Build a map for quick lookups
      const profileMap = new Map(profiles?.map((p) => [p.id, p]));
      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]));

      // Combine data
      const users = authUsers.users.map((user) => {
        const profile = profileMap.get(user.id);
        const role = roleMap.get(user.id) || 'member';

        return {
          id: user.id,
          email: user.email,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          role,
          created_at: user.created_at,
        };
      });

      return { data: users };
    },
  );

  // PATCH /api/v1/admin/users/:userId/role — Update user role
  fastify.patch(
    '/api/v1/admin/users/:userId/role',
    { preHandler: [fastify.authenticate, authorize('admin')] },
    async (request, _reply) => {
      const paramsResult = userIdParamsSchema.safeParse(request.params);
      if (!paramsResult.success) {
        throw fastify.httpErrors.badRequest('Invalid user ID');
      }

      const bodyResult = updateRoleSchema.safeParse(request.body);
      if (!bodyResult.success) {
        throw fastify.httpErrors.badRequest('Invalid role');
      }

      const { userId } = paramsResult.data;
      const { role } = bodyResult.data;

      // Prevent admin from removing their own admin role
      if (userId === request.user.id && role !== 'admin') {
        throw fastify.httpErrors.badRequest('Cannot remove your own admin role');
      }

      // Check if user_role record exists
      const { data: existingRole, error: fetchError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        throw fastify.httpErrors.internalServerError(fetchError.message);
      }

      if (existingRole) {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);

        if (updateError) {
          throw fastify.httpErrors.internalServerError(updateError.message);
        }
      } else {
        // Insert new role record
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (insertError) {
          throw fastify.httpErrors.internalServerError(insertError.message);
        }
      }

      return { success: true, role };
    },
  );
};

export default adminRoutes;
