import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/deployments";
import Common "../types/common";

module {
  public func create(
    deployments : List.List<Types.Deployment>,
    nextId : Nat,
    caller : Common.UserId,
    params : Types.CreateDeploymentParams,
  ) : Types.Deployment {
    let deployment : Types.Deployment = {
      id = nextId;
      callerId = caller;
      name = params.name;
      deployedUrl = params.deployedUrl;
      githubUrl = params.githubUrl;
      engineType = params.engineType;
      architecture = params.architecture;
      createdAt = Time.now();
    };
    deployments.add(deployment);
    deployment;
  };

  public func getAll(
    deployments : List.List<Types.Deployment>,
    _caller : Common.UserId,
  ) : [Types.Deployment] {
    deployments.toArray();
  };

  public func delete(
    deployments : List.List<Types.Deployment>,
    _caller : Common.UserId,
    id : Nat,
  ) : Bool {
    let sizeBefore = deployments.size();
    let filtered = deployments.filter(func(d) { d.id != id });
    deployments.clear();
    deployments.append(filtered);
    deployments.size() < sizeBefore;
  };

  public func update(
    deployments : List.List<Types.Deployment>,
    _caller : Common.UserId,
    id : Nat,
    params : Types.UpdateDeploymentParams,
  ) : { #ok; #err : Text } {
    var found = false;
    deployments.mapInPlace(
      func(deployment) {
        if (deployment.id == id) {
          found := true;
          { deployment with
            name = params.name;
            deployedUrl = params.deployedUrl;
            githubUrl = params.githubUrl;
            engineType = params.engineType;
            architecture = params.architecture;
          };
        } else { deployment };
      }
    );
    if (found) #ok else #err("Deployment not found");
  };
};
