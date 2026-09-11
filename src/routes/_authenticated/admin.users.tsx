import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { AppRole, AccountStatus } from "@/lib/account.functions";
import {
  listUsers,
  rejectStaffRequest,
  setUserRole,
  setUserStatus,
  type StaffUser,
} from "@/lib/admin.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/settings-placeholder-users")({
  component: () => null,
});
