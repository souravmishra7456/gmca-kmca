"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  IdCard,
  KeyRound,
  ShieldCheck,
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
  const [error, setError] = useState("");
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
        setError(err.message);
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
    setError("");
    setCopied("");
    setCreatedMember(null);

    if (!name.trim()) {
      setError("Enter the member's full name");
      return;
    }

    if (role === ROLES.DIRECTOR && director) {
      setError("A director already exists");
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
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Manage Members</h1>
          <p className="mt-1 text-muted-foreground">
            Create player accounts and assign the single director role
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <StatusPill icon={Users} label="Players" value={playersCount} />
          <StatusPill
            icon={ShieldCheck}
            label="Director"
            value={director ? "Assigned" : "Open"}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Member
            </CardTitle>
            <CardDescription>
              Member ID, username, and temporary password are generated
              automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleCreateMember}>
              <div className="space-y-2">
                <Label htmlFor="member-name">Full name</Label>
                <Input
                  id="member-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="First name Last name"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {creationRoles.map((option) => {
                    const disabled = option.value === ROLES.DIRECTOR && !!director;
                    const selected = role === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={disabled || saving}
                        onClick={() => setRole(option.value)}
                        className={`flex h-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background hover:bg-accent"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {director && (
                  <p className="text-xs text-muted-foreground">
                    Director role is already assigned to {director.name}.
                  </p>
                )}
              </div>

              <Button className="w-full" type="submit" disabled={saving}>
                <UserPlus className="h-4 w-4" />
                {saving ? "Creating..." : "Create Member"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {createdMember && (
            <Card className="rounded-lg border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  Member Created
                </CardTitle>
                <CardDescription>
                  Share these login details with the member. The temporary
                  password is shown only now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
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
                <Button type="button" variant="outline" onClick={copyCredentials}>
                  <Copy className="h-4 w-4" />
                  {copied === "credentials" ? "Copied" : "Copy Credentials"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Current Members</CardTitle>
              <CardDescription>
                Active accounts created for the association
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-sm text-muted-foreground">
                  Loading members...
                </div>
              ) : members.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No members have been created yet.
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border">
                  <div className="grid grid-cols-[1.2fr_0.9fr_0.8fr] border-b bg-muted/50 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
                    <span>Name</span>
                    <span>Member ID</span>
                    <span>Role</span>
                  </div>
                  <div className="divide-y">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="grid grid-cols-[1.2fr_0.9fr_0.8fr] items-center gap-3 px-4 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{member.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.username}
                          </p>
                        </div>
                        <span className="font-mono text-xs">{member.memberId}</span>
                        <Badge
                          variant={
                            member.role === ROLES.DIRECTOR ? "default" : "secondary"
                          }
                          className="w-fit"
                        >
                          {ROLE_LABELS[member.role] || member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ icon: Icon, label, value }) {
  return (
    <div className="flex h-16 min-w-32 items-center gap-3 rounded-lg border bg-card px-4">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Credential({ label, value }) {
  const Icon = label === "Temporary Password" ? KeyRound : IdCard;

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="break-all font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
