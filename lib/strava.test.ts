import { describe, expect, it } from "vitest";
import { projectPublicStravaActivity } from "./strava";

const activity = {
  id: 42,
  name: "Home address tempo loop",
  sport_type: "Run",
  start_date_local: "2026-07-12T07:30:00Z",
  moving_time: 1_800,
  distance: 5_000,
  average_heartrate: 142,
  visibility: "everyone",
};

describe("public Strava projection", () => {
  it("replaces user-authored titles with a generic activity label", () => {
    const projected = projectPublicStravaActivity(activity);

    expect(projected?.name).toBe("Run");
    expect(JSON.stringify(projected)).not.toContain(activity.name);
  });

  it("excludes private and followers-only activities", () => {
    expect(projectPublicStravaActivity({ ...activity, private: true })).toBeNull();
    expect(projectPublicStravaActivity({
      ...activity,
      private: false,
      visibility: "followers_only",
    })).toBeNull();
  });
});
