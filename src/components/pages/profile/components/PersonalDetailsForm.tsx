"use client";

import * as React from "react";
import { toast } from "sonner";

import { TIMEZONES } from "@/components/pages/profile/constants/profile.constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserProfile } from "@/types/profile.types";

type Fields = Pick<UserProfile, "firstName" | "lastName" | "email" | "phone" | "timezone">;

export function PersonalDetailsForm({ profile }: { profile: UserProfile }) {
  const initial: Fields = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone ?? "",
    timezone: profile.timezone,
  };
  const [saved, setSaved] = React.useState(initial);
  const [form, setForm] = React.useState(initial);
  const dirty = (Object.keys(form) as (keyof Fields)[]).some((k) => form[k] !== saved[k]);

  const set = (key: keyof Fields) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: event.target.value }));

  // TODO(auth): persist through the profile endpoint.
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(form);
    toast.success("Profile updated");
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="flex flex-col gap-(--card-spacing)">
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>How your name and contact details appear to your team.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={set("firstName")}
              autoComplete="given-name"
              required
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={set("lastName")}
              autoComplete="family-name"
              required
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
              required
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">
              Phone <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              autoComplete="tel"
              placeholder="+91 98765 43210"
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="timezone">Time zone</Label>
            <Select
              value={form.timezone}
              onValueChange={(timezone) => setForm((f) => ({ ...f, timezone }))}
            >
              <SelectTrigger id="timezone" className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" disabled={!dirty} onClick={() => setForm(saved)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!dirty}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
