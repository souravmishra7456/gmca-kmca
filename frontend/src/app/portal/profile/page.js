"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { ROLE_LABELS } from "@/lib/constants";
import { capitalizeRole, getInitials } from "@/lib/utils";
import useAuthStore from "@/store/authStore";
import { playersAPI } from "@/services/api";
import { toast } from "sonner";

const emptyPersonalDetails = {
  dateOfBirth: "",
  birthPlace: "",
  battingStyle: "",
  bowlingStyle: "",
};

export default function ProfilePage() {
  const { user, loading, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(emptyPersonalDetails);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPersonalDetails({ ...emptyPersonalDetails, ...user?.playerProfile });
  }, [user]);

  if (loading) {
    return <LoadingSpinner className="py-20" label="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Your session has ended. Please sign in again to view your profile.
      </div>
    );
  }

  const profileFields = [
    { label: "Full Name", value: user?.name },
    { label: "Member ID", value: user?.memberId },
    { label: "Username", value: user?.username },
    {
      label: "Role",
      value: ROLE_LABELS[user?.role] || capitalizeRole(user?.role),
    },
  ];

  const updateDetail = (field, value) => {
    setPersonalDetails((current) => ({ ...current, [field]: value }));
  };

  const cancelEdit = () => {
    setPersonalDetails({ ...emptyPersonalDetails, ...user.playerProfile });
    setEditing(false);
  };

  const savePersonalDetails = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const { data } = await playersAPI.updateProfile(user.id, personalDetails);
      setUser({ ...user, playerProfile: data.playerProfile });
      setEditing(false);
      toast.success("Personal details saved successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to save personal details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Profile</h1>
          <p className="mt-1 text-muted-foreground">
            Your member account information
          </p>
        </div>
        <Button
          variant={editing ? "secondary" : "outline"}
          onClick={editing ? cancelEdit : () => setEditing(true)}
        >
          <Pencil className="h-4 w-4" />
          {editing ? "Cancel Edit" : "Edit Profile"}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              {ROLE_LABELS[user.role] || capitalizeRole(user.role)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileFields.map((field) => (
            <div
              key={field.label}
              className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm text-muted-foreground">{field.label}</span>
              <span className="font-medium">{field.value}</span>
            </div>
          ))}

          {editing && (
            <form className="space-y-4 border-t pt-6" onSubmit={savePersonalDetails}>
              <div>
                <h3 className="font-semibold">Personal cricket details</h3>
                <p className="mt-1 text-sm text-muted-foreground">These details appear on your player profile card.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input id="dateOfBirth" type="date" value={personalDetails.dateOfBirth} onChange={(event) => updateDetail("dateOfBirth", event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Birth place</Label>
                  <Input id="birthPlace" placeholder="City, State" value={personalDetails.birthPlace} onChange={(event) => updateDetail("birthPlace", event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="battingStyle">Batting style</Label>
                  <Input id="battingStyle" placeholder="e.g. Right-hand bat" value={personalDetails.battingStyle} onChange={(event) => updateDetail("battingStyle", event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bowlingStyle">Bowling style</Label>
                  <Input id="bowlingStyle" placeholder="e.g. Right-arm medium" value={personalDetails.bowlingStyle} onChange={(event) => updateDetail("bowlingStyle", event.target.value)} required />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save details"}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
