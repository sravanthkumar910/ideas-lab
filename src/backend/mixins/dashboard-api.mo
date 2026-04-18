import List "mo:core/List";
import IdeasTypes "../types/ideas";
import IncubatorTypes "../types/incubator";
import DeploymentsTypes "../types/deployments";
import Common "../types/common";

mixin (
  ideas : List.List<IdeasTypes.Idea>,
  incubatorProjects : List.List<IncubatorTypes.IncubatorProject>,
  deployments : List.List<DeploymentsTypes.Deployment>,
) {
  public query ({ caller }) func getDashboardStats() : async Common.DashboardStats {
    {
      liveProjects = deployments.size();
      completedProjects = incubatorProjects.size();
      pendingIdeas = ideas.size();
    };
  };
};
