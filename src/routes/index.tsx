import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import { ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Users, UserCheck, UserX, IdCard, Eye } from "lucide-react";
import {
  fetchDashboardStats,
  fetchRecentMembers,
  dashboardQueryKey,
} from "../lib/api/dashboard";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: dashboardQueryKey,
    queryFn: fetchDashboardStats,
  });
  const { data: recentMembers = [], isLoading: recentLoading } = useQuery({
    queryKey: [...dashboardQueryKey, "recentMembers"],
    queryFn: () => fetchRecentMembers(5),
  });

  const totalMembers = dashboardStats?.totalMembers ?? 0;
  const activeCount = dashboardStats?.activeCount ?? 0;
  const inactiveCount = dashboardStats?.inactiveCount ?? 0;
  const idCreatedCount = dashboardStats?.idCreatedCount ?? 0;

  const stats = [
    {
      label: "All Members",
      value: totalMembers.toLocaleString(),
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Active",
      value: activeCount.toLocaleString(),
      icon: UserCheck,
      color: "text-success",
    },
    {
      label: "Inactive",
      value: inactiveCount.toLocaleString(),
      icon: UserX,
      color: "text-text-secondary",
    },
    {
      label: "ID Created",
      value: idCreatedCount.toLocaleString(),
      icon: IdCard,
      color: "text-primary",
    },
  ];

  const formatCreatedDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const idCardPieData = [
    { name: "ID Created", value: idCreatedCount, color: "#1e3a5f" },
    {
      name: "Not Created",
      value: Math.max(0, totalMembers - idCreatedCount),
      color: "#e8e8e6",
    },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="card">
          <h1 className="text-text-main text-2xl md:text-3xl font-bold mb-1 tracking-tight">
            Dashboard
          </h1>
          <p className="text-text-secondary text-sm">
            Welcome back. Here's what's happening with your association today.
          </p>
        </div>

        {/* Stats Row: 2 per row on mobile, 4 on large */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-12 w-12 rounded bg-surface-gray mb-3" />
                  <div className="h-8 w-16 bg-surface-gray rounded mb-2" />
                  <div className="h-4 w-24 bg-surface-gray rounded" />
                </div>
              ))
            : stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-end mb-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-primary/10 shrink-0">
                        <Icon size={22} className={stat.color} />
                      </div>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold text-text-main mb-0.5 leading-tight">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-text-secondary font-medium">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-5">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
            {/* Recent Members */}
            <div className="card">
              <div className="flex justify-between items-center pb-2 border-b border-black mb-4">
                <h3 className="text-text-main font-bold text-base">
                  Recent Members
                </h3>
                <Link
                  to="/members"
                  className="text-primary text-sm font-semibold hover:underline py-2 px-1 -m-1 min-h-[44px] inline-flex items-center"
                >
                  View All
                </Link>
              </div>
              <div className="min-h-[240px]">
                {recentLoading ? (
                  <div className="space-y-0 divide-y divide-surface-gray/80">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2.5 animate-pulse"
                      >
                        <div className="h-4 w-32 bg-surface-gray rounded" />
                        <div className="h-4 w-16 bg-surface-gray rounded" />
                      </div>
                    ))}
                  </div>
                ) : recentMembers.length === 0 ? (
                  <p className="text-text-muted text-sm py-4">
                    No members yet. Add members to see them here.
                  </p>
                ) : (
                  <ul className="space-y-0 divide-y divide-surface-gray/80">
                    {recentMembers.map((member) => (
                      <li
                        key={member.id}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          navigate({
                            to: "/members/$memberId",
                            params: { memberId: member.id },
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate({
                              to: "/members/$memberId",
                              params: { memberId: member.id },
                            });
                          }
                        }}
                        className="flex items-center gap-3 py-2.5 first:pt-0 cursor-pointer hover:bg-surface-gray/50 transition-colors"
                      >
                        <div className="shrink-0 h-12 w-12 overflow-hidden bg-surface-gray flex items-center justify-center">
                          {member.avatar_url ? (
                            <img
                              alt=""
                              className="h-8 w-8 object-cover"
                              src={member.avatar_url}
                            />
                          ) : (
                            <span className="text-primary font-bold text-xs">
                              {initials(member.name ?? "")}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-text-main truncate block text-sm">
                            {member.name ?? "—"}
                          </span>
                          <span className="text-xs text-text-muted block">
                            Created {formatCreatedDate(member.created_at)}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 text-xs font-semibold px-2 py-1 rounded ${
                            member.status === "Active"
                              ? "bg-success/10 text-success"
                              : "bg-surface-gray text-text-secondary"
                          }`}
                        >
                          {member.status}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate({
                              to: "/members/$memberId",
                              params: { memberId: member.id },
                            });
                          }}
                          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
            {/* ID Card Status */}
            <div className="card">
              <h3 className="text-text-main font-bold text-lg mb-6">
                ID Card Status
              </h3>
              {statsLoading ? (
                <div className="h-[200px] flex items-center justify-center animate-pulse bg-surface-gray/50 rounded" />
              ) : totalMembers === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">
                  No members yet
                </div>
              ) : (
                <>
                  <div className="h-[200px] w-full min-w-0 flex items-center justify-center">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minWidth={0}
                      minHeight={undefined}
                    >
                      <PieChart>
                        <Pie
                          data={idCardPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {idCardPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} members`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {idCardPieData.map((source, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: source.color }}
                          />
                          <span className="text-sm text-text-main font-medium">
                            {source.name}
                          </span>
                        </div>
                        <span className="text-sm text-text-secondary font-semibold">
                          {source.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
