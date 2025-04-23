// components/get-started/PreferencesStep.jsx
import { Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const PreferencesStep = ({ formData, setFormData }) => (
  <>
    <CardHeader>
      <div className="flex items-center space-x-2">
        <Settings className="h-5 w-5 text-amber-500" />
        <div>
          <CardTitle className="text-2xl">Preferences</CardTitle>
          <CardDescription className="text-gray-400">Customize your experience</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label>What types of chores are you interested in?</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {["Household Cleaning", "Outdoor Work", "Organization", "Cooking", "Pet Care", "Errands"].map((chore) => (
            <div key={chore} className="flex items-center space-x-2 rounded-md border border-gray-800 p-3">
              <input 
                type="checkbox" 
                id={chore} 
                className="h-4 w-4 rounded border-gray-500 bg-gray-950" 
                onChange={(e) => {
                  const interests = e.target.checked
                    ? [...formData.choreInterests, chore]
                    : formData.choreInterests.filter((i) => i !== chore);
                  setFormData({ ...formData, choreInterests: interests });
                }}
              />
              <Label htmlFor={chore}>{chore}</Label>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reminder-time">When do you want daily reminders?</Label>
        <Select 
          value={formData.reminderTime} 
          onValueChange={(value) => setFormData({ ...formData, reminderTime: value })}
        >
          <SelectTrigger className="bg-gray-950 border-gray-800">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="morning">Morning (8:00 AM)</SelectItem>
            <SelectItem value="afternoon">Afternoon (2:00 PM)</SelectItem>
            <SelectItem value="evening">Evening (6:00 PM)</SelectItem>
            <SelectItem value="none">Don't send reminders</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">Weekly goal (number of chores)</Label>
        <Select 
          value={formData.weeklyGoal.toString()} 
          onValueChange={(value) => setFormData({ ...formData, weeklyGoal: parseInt(value) })}
        >
          <SelectTrigger className="bg-gray-950 border-gray-800">
            <SelectValue placeholder="Select goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 chores per week</SelectItem>
            <SelectItem value="10">10 chores per week</SelectItem>
            <SelectItem value="15">15 chores per week</SelectItem>
            <SelectItem value="20">20 chores per week</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </>
);