import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SystemHealth } from "@/components/SystemHealth";
import { useThemeStore } from "@/state/themeStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Save, Download, RefreshCw, Lock, Bell, Palette, Database } from "lucide-react";

interface SystemSettings {
  restaurantName: string;
  restaurantPhone: string;
  restaurantEmail: string;
  restaurantAddress: string;
  currency: string;
  businessHours: {
    open: string;
    close: string;
  };
  timezone: string;
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  theme: "light" | "dark" | "auto";
  maintenanceMode: boolean;
}

export default function SystemPreferences() {
  const { theme, setTheme } = useThemeStore();
  const [settings, setSettings] = useState<SystemSettings>({
    restaurantName: "Nakowa Events & Restaurant",
    restaurantPhone: "+234 1 234 5678",
    restaurantEmail: "info@nakowa.com",
    restaurantAddress: "123 Business Avenue, Lagos",
    currency: "NGN",
    businessHours: { open: "09:00", close: "23:00" },
    timezone: "Africa/Lagos",
    enableNotifications: true,
    enableOfflineMode: true,
    backupFrequency: "daily",
    theme: theme,
    maintenanceMode: false,
  });

  const [originalSettings, setOriginalSettings] = useState<SystemSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Check if any settings have changed
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleSave = () => {
    setSaved(true);
    setOriginalSettings(settings);
    setHasChanges(false);
    // Update theme store
    if (settings.theme !== theme) {
      setTheme(settings.theme as "light" | "dark" | "system");
    }
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const handleInputChange = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleBusinessHoursChange = (field: "open" | "close", value: string) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: { ...prev.businessHours, [field]: value },
    }));
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="System Preferences"
        icon={<Settings className="h-6 w-6" />}
        showBackButton={true}
        backTo="/admin"
      />

      {/* System Health Monitor */}
      <SystemHealth />

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>General Settings</span>
            <Badge variant="outline" className="ml-auto">Restaurant Info</Badge>
          </CardTitle>
          <CardDescription>Manage your restaurant's basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                value={settings.restaurantName}
                onChange={(e) => handleInputChange("restaurantName", e.target.value)}
                placeholder="Enter restaurant name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={settings.currency} onValueChange={(v) => handleInputChange("currency", v)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantPhone">Phone</Label>
              <Input
                id="restaurantPhone"
                value={settings.restaurantPhone}
                onChange={(e) => handleInputChange("restaurantPhone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantEmail">Email</Label>
              <Input
                id="restaurantEmail"
                type="email"
                value={settings.restaurantEmail}
                onChange={(e) => handleInputChange("restaurantEmail", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="restaurantAddress">Address</Label>
              <Input
                id="restaurantAddress"
                value={settings.restaurantAddress}
                onChange={(e) => handleInputChange("restaurantAddress", e.target.value)}
                placeholder="Enter restaurant address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Business Hours</span>
            <Badge variant="outline" className="ml-auto">Operating Times</Badge>
          </CardTitle>
          <CardDescription>Set your restaurant's operating hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="openTime">Opening Time</Label>
              <Input
                id="openTime"
                type="time"
                value={settings.businessHours.open}
                onChange={(e) => handleBusinessHoursChange("open", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeTime">Closing Time</Label>
              <Input
                id="closeTime"
                type="time"
                value={settings.businessHours.close}
                onChange={(e) => handleBusinessHoursChange("close", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(v) => handleInputChange("timezone", v)}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                  <SelectItem value="Africa/Cairo">Africa/Cairo (EAT)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
            <Badge variant="outline" className="ml-auto">Theme</Badge>
          </CardTitle>
          <CardDescription>Customize the system appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={settings.theme} onValueChange={(v: any) => handleInputChange("theme", v)}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto (System)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Current system preference: <span className="font-semibold">{theme}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
            <Badge variant="outline" className="ml-auto">System Alerts</Badge>
          </CardTitle>
          <CardDescription>Manage system notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts for important system events</p>
            </div>
            <Button
              variant={settings.enableNotifications ? "default" : "outline"}
              size="sm"
              onClick={() => handleInputChange("enableNotifications", !settings.enableNotifications)}
            >
              {settings.enableNotifications ? "On" : "Off"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Data Management</span>
            <Badge variant="outline" className="ml-auto">Backup & Export</Badge>
          </CardTitle>
          <CardDescription>Manage system data and backups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">Backup Frequency</p>
              <Select value={settings.backupFrequency} onValueChange={(v: any) => handleInputChange("backupFrequency", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="font-medium">Data Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Create Backup
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>System Features</span>
            <Badge variant="outline" className="ml-auto">Advanced</Badge>
          </CardTitle>
          <CardDescription>Toggle advanced system features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Offline Mode</p>
                <p className="text-sm text-muted-foreground">Allow offline operation with sync on reconnect</p>
              </div>
              <Button
                variant={settings.enableOfflineMode ? "default" : "outline"}
                size="sm"
                onClick={() => handleInputChange("enableOfflineMode", !settings.enableOfflineMode)}
              >
                {settings.enableOfflineMode ? "On" : "Off"}
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Restrict access while performing maintenance</p>
              </div>
              <Button
                variant={settings.maintenanceMode ? "destructive" : "outline"}
                size="sm"
                onClick={() => handleInputChange("maintenanceMode", !settings.maintenanceMode)}
              >
                {settings.maintenanceMode ? "Active" : "Inactive"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>System and version details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">System Version:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database Status:</span>
            <Badge variant="default" className="bg-green-600">Connected</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">API Status:</span>
            <Badge variant="default" className="bg-green-600">Operational</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="flex flex-wrap gap-2 sticky bottom-0 bg-background py-4 border-t">
          <Button onClick={handleSave} size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            {saved ? "Settings Saved!" : "Save Settings"}
          </Button>
          <Button variant="outline" size="lg" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
