import { z } from 'zod';
import { RBAC_ACTIONS, ROLE_TYPES } from '@/lib/rbac/rbacConstants';

const slugSchema = z
  .string()
  .min(1, 'Slug bắt buộc')
  .max(64)
  .regex(/^[a-z0-9_-]+$/, 'Slug chỉ gồm chữ thường, số, gạch ngang và gạch dưới');

const nameSchema = z.string().min(1, 'Tên bắt buộc').max(120);

const grantSchema = z.object({
  resource: z.string().min(1),
  actions: z.array(z.enum(RBAC_ACTIONS)).min(1),
  attributes: z.string().max(200).optional(),
});

export const createResourceSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().max(500).optional(),
});

export const createRoleSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  role_type: z.enum(ROLE_TYPES),
  description: z.string().max(500).optional(),
  grants: z.array(grantSchema).optional(),
});

export const updateRoleSchema = z.object({
  role_name: nameSchema,
  role_slug: slugSchema,
  role_description: z.string().max(500).optional(),
  role_type: z.enum(ROLE_TYPES),
  grants: z.array(grantSchema).optional(),
});

export const updateResourceSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: z.string().max(500).optional(),
});

export const insertGrantsSchema = z.array(grantSchema).min(1);

export const updateGrantSchema = z.object({
  actions: z.array(z.enum(RBAC_ACTIONS)).min(1),
  attributes: z.string().max(200).optional(),
});

export const idSchema = z.string().min(1, 'Thiếu ID');

/**
 * @param {import('zod').ZodError} error
 */
export function formatRbacSchemaError(error) {
  const first = error.flatten().fieldErrors;
  const msg = Object.values(first).flat()[0];
  return msg ?? 'Dữ liệu không hợp lệ';
}
