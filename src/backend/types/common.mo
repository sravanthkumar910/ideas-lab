module {
  public type Timestamp = Int;
  public type UserId = Principal;

  public type DashboardStats = {
    liveProjects : Nat;
    completedProjects : Nat;
    pendingIdeas : Nat;
  };

  // File storage types
  public type ObjectId = Text;

  public type StoredFile = {
    objectId : ObjectId;
    owner : UserId;
    filename : Text;
    contentType : Text;
    size : Nat;
    data : Blob;
    createdAt : Timestamp;
  };

  public type UploadFileResult = {
    objectId : ObjectId;
    filename : Text;
    contentType : Text;
    size : Nat;
  };

  public type DownloadFileResult = {
    filename : Text;
    contentType : Text;
    data : Blob;
  };
};
