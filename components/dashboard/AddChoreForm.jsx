import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AddChoreForm = ({
  choreData,
  setChoreData,
  handleAddChore,
  error,
}) => {
  const MIN_REWARD_SATS = 600;

  const handleClearDueDate = () => {
    setChoreData({ ...choreData, dueDate: "" });
  };

  const handleRewardChange = (e) => {
    const value = e.target.value;
    const numeric = Number(value);
    if (value === "" || (!isNaN(numeric) && numeric >= MIN_REWARD_SATS)) {
      setChoreData({ ...choreData, reward: value === "" ? "" : numeric });
    }
  };

  // Check if form is valid
  const isRewardValid = choreData.reward >= MIN_REWARD_SATS;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Add Chore</CardTitle>
        <CardDescription className="text-gray-400">
          Create a new task for your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddChore} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Chore Name</Label>
              <Input
                id="name"
                value={choreData.name}
                onChange={(e) =>
                  setChoreData({ ...choreData, name: e.target.value })
                }
                className="bg-gray-950 border-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward">Reward (sats)</Label>
              <Input
                id="reward"
                type="number"
                value={choreData.reward}
                onChange={handleRewardChange}
                className="bg-gray-950 border-gray-800"
                min={MIN_REWARD_SATS}
                step={100} // 👈 this is the magic
                placeholder={`Minimum ${MIN_REWARD_SATS} sats`}
              />
              {!isRewardValid && choreData.reward !== "" && (
                <p className="text-red-400 text-sm mt-1">
                  Reward must be at least {MIN_REWARD_SATS} sats
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={choreData.frequency}
                onValueChange={(value) =>
                  setChoreData({ ...choreData, frequency: value })
                }
              >
                <SelectTrigger className="bg-gray-950 border-gray-800">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once">Once</SelectItem>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="dueDate">Due Date</Label>
                <button
                  type="button"
                  onClick={handleClearDueDate}
                  className="border-gray-800 text-gray-400 hover:underline text-xs"
                >
                  Clear
                </button>
              </div>
              <Input
                id="dueDate"
                type="datetime-local"
                value={choreData.dueDate}
                onChange={(e) =>
                  setChoreData({ ...choreData, dueDate: e.target.value })
                }
                className="bg-gray-950 border-gray-800"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assigneeEmail">Assignee Email (optional)</Label>
            <Input
              id="assigneeEmail"
              type="email"
              value={choreData.assigneeEmail}
              onChange={(e) =>
                setChoreData({ ...choreData, assigneeEmail: e.target.value })
              }
              className="bg-gray-950 border-gray-800"
            />
          </div>
          <Button
            type="submit"
            className="bg-amber-500 text-black hover:bg-amber-400"
            disabled={!isRewardValid}
          >
            Add Chore
          </Button>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
};
