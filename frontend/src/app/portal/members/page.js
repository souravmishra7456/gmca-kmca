"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  IdCard,
  KeyRound,
  ShieldCheck,
  UserRoundMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { playersAPI } from "@/services/api";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

const creationRoles = [
  { value: ROLES.PLAYER, label: "Player" },
  { value: ROLES.DIRECTOR, label: "Director" },
];

export default function MembersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES.PLAYER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleActionId, setRoleActionId] = useState("");
  const [createdMember, setCreatedMember] = useState(null);
  const [copied, setCopied] = useState("");

  const director = useMemo(
    () => members.find((member) => member.role === ROLES.DIRECTOR),
    [members]
  );
  const playersCount = useMemo(
    () => members.filter((member) => member.role === ROLES.PLAYER).length,
    [members]
  );

  useEffect(() => {
    if (user && user.role !== ROLES.CHAIRMAN) {
      router.push("/portal/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const { data } = await playersAPI.getAll();
        setMembers(data.players || []);
      } catch (err) {
        toast.error(err.message || "Unable to load members.");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  useEffect(() => {
    if (director && role === ROLES.DIRECTOR) {
      setRole(ROLES.PLAYER);
    }
  }, [director, role]);

  if (!user || user.role !== ROLES.CHAIRMAN) {
    return null;
  }

  const handleCreateMember = async (event) => {
    event.preventDefault();
    setCopied("");
    setCreatedMember(null);

    if (!name.trim()) {
      toast.error("Enter the member's full name");
      return;
    }

    if (role === ROLES.DIRECTOR && director) {
      toast.error("A director already exists");
      return;
    }

    setSaving(true);
    try {
      const { data } = await playersAPI.create({
        name: name.trim(),
        role,
      });

      const newMember = {
        ...data.user,
        status: "active",
      };

      setMembers((current) => [newMember, ...current]);
      setCreatedMember({
        ...data.user,
        tempPassword: data.tempPassword,
      });
      setName("");
      setRole(ROLES.PLAYER);
      toast.success("Member account created.");
    } catch (err) {
      toast.error(err.message || "Unable to create member.");
    } finally {
      setSaving(false);
    }
  };

  const handleDemoteDirector = async (member) => {
    if (!window.confirm(`Demote ${member.name} from Director to Player?`)) return;

    setRoleActionId(member.id);
    try {
      const { data } = await playersAPI.demoteDirector(member.id);
      setMembers((current) => current.map((currentMember) => (
        currentMember.id === member.id
          ? { ...currentMember, role: data.user.role }
          : currentMember
      )));
      toast.success(`${member.name} is now a player. You can assign a new director.`);
    } catch (err) {
      toast.error(err.message || "Unable to demote director.");
    } finally {
      setRoleActionId("");
    }
  };

  const handleAssignDirector = async (member) => {
    if (!window.confirm(`Assign ${member.name} as Director?`)) return;

    setRoleActionId(member.id);
    try {
      const { data } = await playersAPI.assignDirector(member.id);
      setMembers((current) => current.map((currentMember) => (
        currentMember.id === member.id
          ? { ...currentMember, role: data.user.role }
          : currentMember
      )));
      toast.success(`${member.name} is now the director.`);
    } catch (err) {
      toast.error(err.message || "Unable to assign director.");
    } finally {
      setRoleActionId("");
    }
  };

  const copyCredentials = async () => {
    if (!createdMember) return;

    const credentials = [
      `Name: ${createdMember.name}`,
      `Role: ${ROLE_LABELS[createdMember.role]}`,
      `Member ID: ${createdMember.memberId}`,
      `Username: ${createdMember.username}`,
      `Temporary Password: ${createdMember.tempPassword}`,
    ].join("\n");

    await navigator.clipboard.writeText(credentials);
    setCopied("credentials");
  };

  return (
    <div className="space-y-7 pb-8">
      {/* Page header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Users className="h-4 w-4" />
            Association Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Members
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Manage players and association leadership from one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <StatusPill icon={Users} label="Players" value={playersCount} />
          <StatusPill
            icon={ShieldCheck}
            label="Director"
            value={director ? "Assigned" : "Open"}
            accent={Boolean(director)}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* Add member */}
        <Card className="h-fit overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Add Member</CardTitle>
                <CardDescription className="mt-1 leading-relaxed">
                  Create a new account for the association.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <form className="space-y-6" onSubmit={handleCreateMember}>
              <div className="space-y-2">
                <Label htmlFor="member-name" className="text-sm font-semibold">
                  Full name
                </Label>
                <Input
                  id="member-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="First name Last name"
                  disabled={saving}
                  className="h-12 rounded-xl bg-background px-4 shadow-none"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Role</Label>

                <div className="grid grid-cols-2 gap-2">
                  {creationRoles.map((option) => {
                    const disabled =
                      option.value === ROLES.DIRECTOR && !!director;
                    const selected = role === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={disabled || saving}
                        onClick={() => setRole(option.value)}
                        className={`relative flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-all ${selected
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background hover:border-primary/40 hover:bg-primary/[0.03]"
                          } disabled:cursor-not-allowed disabled:opacity-45`}
                      >
                        {option.value === ROLES.DIRECTOR ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                {director ? (
                  <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-300">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Director is currently assigned to{" "}
                      <strong>{director.name}</strong>.
                    </span>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Only one Director can be assigned at a time.
                  </p>
                )}
              </div>

              <Button
                className="h-12 w-full rounded-xl text-sm font-semibold shadow-sm"
                type="submit"
                disabled={saving}
              >
                <UserPlus className="h-4 w-4" />
                {saving ? "Creating..." : "Create Member"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Members */}
        <div className="min-w-0 space-y-6">
          {createdMember && (
            <Card className="overflow-hidden rounded-2xl border-emerald-200 bg-emerald-50/70 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/20">
              <CardHeader className="border-b border-emerald-200/70 pb-4 dark:border-emerald-900/70">
                <CardTitle className="flex items-center gap-2 text-base text-emerald-800 dark:text-emerald-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  Member Created
                </CardTitle>
                <CardDescription className="text-emerald-800/70 dark:text-emerald-300/70">
                  Share these login details with the member. The temporary
                  password is shown only now.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Credential label="Member ID" value={createdMember.memberId} />
                  <Credential label="Username" value={createdMember.username} />
                  <Credential
                    label="Temporary Password"
                    value={createdMember.tempPassword}
                  />
                  <Credential
                    label="Role"
                    value={ROLE_LABELS[createdMember.role]}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl bg-background"
                  onClick={copyCredentials}
                >
                  <Copy className="h-4 w-4" />
                  {copied === "credentials" ? "Copied" : "Copy Credentials"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="flex flex-col gap-3 border-b bg-muted/[0.15] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <CardTitle className="text-lg">Current Members</CardTitle>
                <CardDescription className="mt-1">
                  Active accounts created for the association
                </CardDescription>
              </div>

              <div className="inline-flex w-fit items-center rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {members.length} {members.length === 1 ? "member" : "members"}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="divide-y">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 px-5 py-5 sm:px-6"
                    >
                      <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-52 animate-pulse rounded bg-muted" />
                      </div>
                      <div className="hidden h-7 w-20 animate-pulse rounded-full bg-muted sm:block" />
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="mx-5 my-6 rounded-2xl border border-dashed p-10 text-center sm:mx-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-semibold">No members yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create the first member account using the form.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {members.map((member) => {
                    const isDirector = member.role === ROLES.DIRECTOR;
                    const isActing = roleActionId === member.id;

                    return (
                      <div
                        key={member.id}
                        className={`group flex flex-col gap-4 px-5 py-5 transition-colors sm:flex-row sm:items-center sm:px-6 ${isDirector
                            ? "bg-primary/[0.035] hover:bg-primary/[0.06]"
                            : "hover:bg-muted/[0.35]"
                          }`}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3.5">
                          <MemberAvatar name={member.name} director={isDirector} />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="min-w-0 whitespace-normal break-words font-semibold tracking-tight">
                                {member.name}
                              </p>

                              {isDirector && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                                  <ShieldCheck className="h-3 w-3" />
                                  Director
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                              {member.username}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <span className="rounded-lg border bg-background px-2.5 py-1.5 font-mono text-[11px] font-medium text-muted-foreground">
                            {member.memberId}
                          </span>

                          <Badge
                            variant={isDirector ? "default" : "secondary"}
                            className={`rounded-full px-2.5 py-1 text-xs ${isDirector
                                ? "bg-primary text-primary-foreground"
                                : ""
                              }`}
                          >
                            {ROLE_LABELS[member.role] || member.role}
                          </Badge>

                          {isDirector ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="ml-auto rounded-lg bg-background sm:ml-1"
                              disabled={Boolean(roleActionId)}
                              onClick={() => handleDemoteDirector(member)}
                            >
                              <UserRoundMinus className="h-4 w-4" />
                              {isActing ? "Demoting..." : "Demote"}
                            </Button>
                          ) : member.role === ROLES.PLAYER ? (
                            director ? (
                              <span className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Director assigned
                              </span>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="ml-auto rounded-lg bg-background sm:ml-1"
                                disabled={Boolean(roleActionId)}
                                onClick={() => handleAssignDirector(member)}
                              >
                                <ShieldCheck className="h-4 w-4" />
                                {isActing ? "Assigning..." : "Assign Director"}
                              </Button>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="flex min-w-[140px] items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

function MemberAvatar({ name, director }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${director
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground"
        }`}
    >
      {initials}
    </div>
  );
}

function Credential({ label, value }) {
  const Icon = label === "Temporary Password" ? KeyRound : IdCard;

  return (
    <div className="rounded-xl border bg-background p-3.5">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="break-all font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
