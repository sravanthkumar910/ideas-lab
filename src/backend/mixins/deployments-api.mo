import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import DeploymentsLib "../lib/deployments";
import DeploymentsTypes "../types/deployments";

mixin (
  deployments : List.List<DeploymentsTypes.Deployment>,
  nextDeploymentId : Nat,
) {
  var _deploymentCounter : Nat = nextDeploymentId;

  public query ({ caller }) func getDeployments() : async [DeploymentsTypes.Deployment] {
    DeploymentsLib.getAll(deployments, caller);
  };

  public shared ({ caller }) func createDeployment(params : DeploymentsTypes.CreateDeploymentParams) : async DeploymentsTypes.Deployment {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    let deployment = DeploymentsLib.create(deployments, _deploymentCounter, caller, params);
    _deploymentCounter += 1;
    deployment;
  };

  public shared ({ caller }) func deleteDeployment(id : Nat) : async Bool {
    if (caller.isAnonymous()) Runtime.trap("Authentication required");
    DeploymentsLib.delete(deployments, caller, id);
  };
};
