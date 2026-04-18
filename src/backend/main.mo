import List "mo:core/List";
import Map "mo:core/Map";
import IdeasTypes "types/ideas";
import IncubatorTypes "types/incubator";
import TasksTypes "types/tasks";
import DeploymentsTypes "types/deployments";
import SettingsTypes "types/settings";
import Common "types/common";
import IdeasApi "mixins/ideas-api";
import IncubatorApi "mixins/incubator-api";
import TasksApi "mixins/tasks-api";
import DeploymentsApi "mixins/deployments-api";
import SettingsApi "mixins/settings-api";
import DashboardApi "mixins/dashboard-api";
import FilesApi "mixins/files-api";

actor {
  // Ideas state
  let ideas = List.empty<IdeasTypes.Idea>();

  // Incubator state
  let incubatorProjects = List.empty<IncubatorTypes.IncubatorProject>();

  // Tasks state
  let tasks = List.empty<TasksTypes.Task>();

  // Deployments state
  let deployments = List.empty<DeploymentsTypes.Deployment>();

  // Settings state
  let profiles = Map.empty<Common.UserId, SettingsTypes.UserProfile>();
  let webLinks = List.empty<SettingsTypes.WebLink>();

  // File storage state (objectId -> StoredFile)
  let fileStore = Map.empty<Common.ObjectId, Common.StoredFile>();

  include IdeasApi(ideas, 0);
  include IncubatorApi(incubatorProjects, 0);
  include TasksApi(tasks, 0);
  include DeploymentsApi(deployments, 0);
  include SettingsApi(profiles, webLinks, 0);
  include DashboardApi(ideas, incubatorProjects, deployments);
  include FilesApi(fileStore, 0);
};
