"use client";

import { useState, useTransition } from "react";
import { Table, Tag, Switch, Input, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import { promoteToAdmin, demoteFromAdmin, setAdminPermission, getAllUsersForTeamManagement } from "@/actions";

const ALL_PERMISSIONS = [
  "MANAGE_PRODUCTS",
  "MANAGE_ORDERS",
  "MANAGE_COHORTS",
  "MANAGE_ENROLMENTS",
  "MANAGE_CONTACT_MESSAGES",
  "SEND_BROADCASTS",
  "VIEW_LOGGER",
] as const;

const PERMISSION_LABELS: Record<string, string> = {
  MANAGE_PRODUCTS: "Products",
  MANAGE_ORDERS: "Orders",
  MANAGE_COHORTS: "Cohorts",
  MANAGE_ENROLMENTS: "Enrolments",
  MANAGE_CONTACT_MESSAGES: "Contact messages",
  SEND_BROADCASTS: "Broadcasts",
  VIEW_LOGGER: "Audit log",
};

type UserRow = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: { role: string }[];
  adminPermissions: { type: string }[];
};

export function TeamTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();
  const { message, modal } = App.useApp();

  function refresh(query: string) {
    startTransition(async () => {
      const result = await getAllUsersForTeamManagement(query || undefined);
      setUsers(result);
    });
  }

  function handlePromote(userId: string, email: string) {
    modal.confirm({
      title: "Promote to admin?",
      content: `${email} will gain access to the admin dashboard. You'll need to grant specific permissions next.`,
      okText: "Promote",
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            const result = await promoteToAdmin(userId);
            if (result.ok) {
              message.success("User promoted to Admin");
              refresh(search);
              resolve();
            } else {
              message.error(result.error);
              reject();
            }
          });
        }),
    });
  }

  function handleDemote(userId: string, email: string) {
    modal.confirm({
      title: "Remove admin access?",
      content: `${email} will lose all admin permissions and access to the admin dashboard.`,
      okText: "Remove access",
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          startTransition(async () => {
            const result = await demoteFromAdmin(userId);
            if (result.ok) {
              message.success("Admin access removed");
              refresh(search);
              resolve();
            } else {
              message.error(result.error);
              reject();
            }
          });
        }),
    });
  }

  function handlePermissionToggle(userId: string, type: string, granted: boolean) {
    startTransition(async () => {
      const result = await setAdminPermission(userId, type as never, granted);
      if (result.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  adminPermissions: granted
                    ? [...u.adminPermissions, { type }]
                    : u.adminPermissions.filter((p) => p.type !== type),
                }
              : u
          )
        );
      } else {
        message.error(result.error);
      }
    });
  }

  const columns: ColumnsType<UserRow> = [
    {
      title: "User",
      key: "user",
      render: (_, u) => (
        <div>
          <p className="font-medium text-sm">{u.firstname} {u.lastname}</p>
          <p className="text-xs text-text-on-cream-muted">{u.email}</p>
        </div>
      ),
    },
    {
      title: "Roles",
      key: "roles",
      render: (_, u) => (
        <div className="flex gap-1 flex-wrap">
          {u.roles.map((r) => (
            <Tag key={r.role} color={r.role === "SuperAdmin" ? "gold" : r.role === "Admin" ? "blue" : "default"}>
              {r.role}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Permissions",
      key: "permissions",
      width: 420,
      render: (_, u) => {
        const isAdmin = u.roles.some((r) => r.role === "Admin");
        const isSuperAdmin = u.roles.some((r) => r.role === "SuperAdmin");
        if (!isAdmin || isSuperAdmin) return <span className="text-text-on-cream-muted text-xs">—</span>;

        const granted = new Set(u.adminPermissions.map((p) => p.type));
        return (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {ALL_PERMISSIONS.map((p) => (
              <label key={p} className="flex items-center gap-2 text-xs">
                <Switch
                  size="small"
                  checked={granted.has(p)}
                  onChange={(checked) => handlePermissionToggle(u.id, p, checked)}
                />
                {PERMISSION_LABELS[p]}
              </label>
            ))}
          </div>
        );
      },
    },
    {
      title: "",
      key: "actions",
      render: (_, u) => {
        const isAdmin = u.roles.some((r) => r.role === "Admin");
        const isSuperAdmin = u.roles.some((r) => r.role === "SuperAdmin");
        if (isSuperAdmin) return null;
        return isAdmin ? (
          <button onClick={() => handleDemote(u.id, u.email)} className="text-xs text-error hover:underline">
            Remove admin
          </button>
        ) : (
          <button onClick={() => handlePromote(u.id, u.email)} className="text-xs text-gold-deep hover:underline">
            Make admin
          </button>
        );
      },
    },
  ];

  return (
    <div>
      <Input.Search
        placeholder="Search users by name or email"
        size="large"
        className="mb-5 max-w-sm"
        onSearch={(val) => {
          setSearch(val);
          refresh(val);
        }}
      />
      <div className="bg-white border border-line overflow-x-scroll md:overflow-clip">
        <Table rowKey="id" columns={columns} dataSource={users} pagination={{ pageSize: 10 }} />
      </div>
    </div>
  );
}
