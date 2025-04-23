"use client";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cog } from "lucide-react";
import { Bell, Clock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { COINS } from "@/lib/constants";
import { AlertTriangle } from "lucide-react";
import { useSettings } from "@/lib/context/SettingsContext";

export default function SettingsPage() {
  const finalSettings = useSettings();

  const {
    role,
    email,
    firstName,
    lastName,
    language,
    timezone,
    choreReminders,
    rewardNotifications,
    marketingEmails,
    Wallet: [addressObj = {}] = [],
    payoutFrequency,
    payoutTime,
    payoutCurrency,
    chorePenalty,
    dailyChoreDeadline,
    dailyChoreWindow,
  } = finalSettings || {};

  const address = addressObj.address || "";

  const [loading, setLoading] = useState(false);
  const [availableTimezones, setAvailableTimezones] = useState([]);
  const [settings, setSettings] = useState({
    firstName: firstName || "",
    lastName: lastName || "",
    email: email || "",
    language: language || "English",
    timezone,
    choreReminders,
    rewardNotifications,
    marketingEmails,
    payoutTime,
    payoutFrequency,
    walletAddress: address || "",
    payoutCurrency,
    chorePenalty,
    timezone,
    dailyChoreDeadline,
    dailyChoreWindow,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
      toast.success("Settings saved successfully");
    }
  };

  useEffect(() => {
    const fetchTimezone = async () => {
      const response = await fetch("/api/timezone");
      if (response.ok) {
        const data = await response.json();
        setAvailableTimezones(data);
      } else {
        throw new Error("Failed to fetch timezone");
      }
    };
    fetchTimezone();
  }, []);

  console.log("availableTimezones", availableTimezones);

  return (
    <div className="px-0.5 md:px-4 space-y-6 mt-4 md:mt-0 pb-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-400">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {role === "Creator" ? (
            <TabsTrigger value="organization">Organization</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <Card className="bg-gray-900 border border-gray-700 flex flex-col h-full px-0">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <CardTitle>Account Settings</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Manage your personal details and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 flex-grow">
              <div className="grid md:grid-cols-2 gap-8">
                {/* User Information */}
                <div className="space-y-4  p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <h3 className="text-lg font-semibold text-white">
                    User Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        defaultValue={settings.firstName}
                        className="bg-gray-950 border-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        defaultValue={settings.lastName}
                        className="bg-gray-950 border-gray-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={settings.email}
                        disabled
                        className="bg-gray-950 border-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4  p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <h3 className="text-lg font-semibold text-white">
                    Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        defaultValue={settings.language}
                        onValueChange={(value) =>
                          handleChange("language", value)
                        }
                      >
                        <SelectTrigger className="bg-gray-950 border-gray-800">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={settings.timezone}
                        onValueChange={(value) =>
                          handleChange("timezone", value)
                        }
                      >
                        <SelectTrigger className="bg-gray-950 border-gray-800">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimezones.map((timezone) => (
                            <SelectItem key={timezone} value={timezone}>
                              {timezone.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-gray-400">
                          Always use dark mode
                        </p>
                      </div>
                      <Switch id="dark-mode" defaultChecked disabled />
                    </div>
                  </div>
                </div>
                <div className="space-y-4  p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <Label htmlFor="wallet-address">Bitcoin Wallet Address</Label>
                  <Input
                    id="wallet-address"
                    value={address}
                    disabled
                    className="bg-gray-950 border-gray-800 cursor-pointer"
                  />
                  <p className="text-xs text-gray-400">
                    This is where your rewards will be sent
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-amber-500 text-black hover:bg-amber-400"
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-gray-900 border border-gray-700 flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <CardTitle>Notifications & Payments</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Manage notifications and alerts for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 flex-grow">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Notification Settings */}
                <div className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <h3 className="text-lg font-semibold text-white">
                    Notification Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label>Chore Reminders</Label>
                        <p className="text-sm text-gray-400">
                          Receive reminders for upcoming chores
                        </p>
                      </div>
                      <Switch
                        checked={settings.choreReminders}
                        onCheckedChange={(checked) =>
                          handleChange("choreReminders", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label>Reward Notifications</Label>
                        <p className="text-sm text-gray-400">
                          Get notified when you earn rewards
                        </p>
                      </div>
                      <Switch
                        checked={settings.rewardNotifications}
                        onCheckedChange={(checked) =>
                          handleChange("rewardNotifications", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label>Streak Updates</Label>
                        <p className="text-sm text-gray-400">
                          Notifications about your streak progress
                        </p>
                      </div>
                      <Switch
                        checked={settings.streakUpdates || false}
                        onCheckedChange={(checked) =>
                          handleChange("streakUpdates", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-gray-400">
                          Receive updates about new features
                        </p>
                      </div>
                      <Switch
                        checked={settings.marketingEmails}
                        onCheckedChange={(checked) =>
                          handleChange("marketingEmails", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-amber-500 text-black hover:bg-amber-400"
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="mt-6">
          <Card className="bg-gray-900 border border-gray-700 flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Cog className="h-5 w-5 text-gray-400" />
                <CardTitle>Organization Settings</CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Manage Organization information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 flex-grow">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <h3 className="text-lg font-semibold text-white">
                    Payout Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Payout Method</Label>
                        <RadioGroup
                          defaultValue={settings.payoutFrequency}
                          onValueChange={(value) =>
                            handleChange("payoutFrequency", value)
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Daily" id="daily" />
                            <Label htmlFor="daily">Daily</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Weekly" id="weekly" />
                            <Label htmlFor="weekly">Weekly</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="BiWeekly" id="bi-weekly" />
                            <Label htmlFor="bi-weekly">Bi-Weekly</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Payout Currency</Label>
                        <Select
                          value={settings.payoutCurrency}
                          onValueChange={(value) =>
                            handleChange("payoutCurrency", value)
                          }
                          disabled
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 hover:border-amber-500 transition-colors text-gray-200">
                            <SelectValue placeholder="Select payout currency" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {COINS.map((coin, index) => (
                              <SelectItem
                                value={coin.name}
                                key={index}
                                className="hover:bg-gray-700"
                              >
                                <span className="flex items-center gap-2">
                                  {coin.icon} {coin.name} {coin.tag}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Payout Schedule
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          When earnings are distributed
                        </p>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Payment Time</Label>
                          <Select
                            value={settings.payoutTime}
                            onValueChange={(value) =>
                              handleChange("payoutTime", value)
                            }
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-700 hover:border-amber-500 transition-colors text-gray-200">
                              <SelectValue placeholder="Select payout time" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem
                                value="Early"
                                className="hover:bg-gray-700"
                              >
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-amber-500" />
                                  3:00 PM (Early Close)
                                </span>
                              </SelectItem>
                              <SelectItem
                                value="Standard"
                                className="hover:bg-gray-700"
                              >
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-green-500" />
                                  6:00 PM (Standard)
                                </span>
                              </SelectItem>
                              <SelectItem
                                value="Late"
                                className="hover:bg-gray-700"
                              >
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  9:00 PM (Late Shift)
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                  <h3 className="text-lg font-semibold text-white">
                    Chore Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Daily Chore Dealine</Label>
                        <RadioGroup
                          defaultValue={settings.dailyChoreDeadline}
                          onValueChange={(value) =>
                            handleChange("dailyChoreDeadline", value)
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="18:00" id="18:00" />
                            <Label htmlFor="18:00">6PM</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="20:00" id="20:00" />
                            <Label htmlFor="20:00">8PM</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="23:59" id="23:59" />
                            <Label htmlFor="23:59">Midnight</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Chore Completion Window</Label>
                        <div className="relative">
                          <Input
                            id="choreCompletionWindow"
                            type="number"
                            min="0"
                            defaultValue={settings.dailyChoreWindow}
                            className="pr-16"
                          />
                          <div className="absolute inset-y-0 right-4 flex items-center text-gray-400 text-sm pointer-events-none">
                            hours
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Late Penalty
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          Penalty when completing chore late
                        </p>
                        <div className="space-y-2">
                          <Label className="text-gray-300">
                            Chore Penalty (%)
                          </Label>
                          <Select
                            value={String(settings.chorePenalty)}
                            onValueChange={
                              (value) =>
                                handleChange("chorePenalty", parseFloat(value)) // Make sure to parseFloat it back
                            }
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-700 hover:border-amber-500 transition-colors text-gray-200">
                              <SelectValue placeholder="Select penalty" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {[
                                { value: 0, color: "text-green-300" },

                                { value: 15, color: "text-amber-400" },

                                { value: 25, color: "text-red-500" },
                              ].map((penalty) => (
                                <SelectItem
                                  key={penalty.value}
                                  value={String(penalty.value)}
                                  className={`hover:bg-gray-700 ${penalty.color}`}
                                >
                                  <span
                                    className={`flex items-center gap-2 ${penalty.color}`}
                                  >
                                    <AlertTriangle className="size-4" />
                                    {penalty.value}% Penalty
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="bg-amber-500 text-black hover:bg-amber-400"
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
