import { Route, Routes } from "react-router-dom";
import { ProfileScreen } from "./profile/ProfileScreen";
import { ProfilePersonalInfoScreen } from "./profile/ProfilePersonalInfoScreen";
import { ProfileSecurityScreen } from "./profile/ProfileSecurityScreen";
import { ProfilePreferencesScreen } from "./profile/ProfilePreferencesScreen";
import { ProfileOverviewScreen } from "./profile/ProfileOverviewScreen";

export { ActivityScreen } from "./ActivityScreen";
export { EventsScreen } from "./EventsScreen";
export { InsightsScreen } from "./InsightsScreen";
export { ProfileScreen };

export function ProfileRoutes() {
  return (
    <Routes>
      <Route index element={<ProfileScreen />} />
      <Route path="personal" element={<ProfilePersonalInfoScreen />} />
      <Route path="security" element={<ProfileSecurityScreen />} />
      <Route path="preferences" element={<ProfilePreferencesScreen />} />
      <Route path="overview" element={<ProfileOverviewScreen />} />
    </Routes>
  );
}
