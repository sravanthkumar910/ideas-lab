import Map "mo:core/Map";
import Time "mo:core/Time";
import Common "../types/common";

module {
  // Max sizes in bytes
  let MAX_IMAGE_SIZE : Nat = 5242880; // 5 MB
  let MAX_PPT_SIZE : Nat = 20971520; // 20 MB
  let MAX_DOC_SIZE : Nat = 10485760; // 10 MB
  let MAX_INCUBATOR_IMAGE_SIZE : Nat = 3145728; // 3 MB

  public type FileCategory = {
    #ideaPhoto;
    #incubatorImage;
    #incubatorPpt;
    #incubatorDoc;
    #incubatorSrc;
    #profilePhoto;
  };

  // Validate file by category
  public func validateFile(
    category : FileCategory,
    contentType : Text,
    size : Nat,
  ) : ?Text {
    switch (category) {
      case (#ideaPhoto) {
        if (contentType != "image/jpeg" and contentType != "image/png" and contentType != "image/gif") {
          return ?"Only JPG, PNG, or GIF images are allowed";
        };
        if (size > MAX_IMAGE_SIZE) {
          return ?"File exceeds 5 MB limit";
        };
      };
      case (#profilePhoto) {
        if (contentType != "image/jpeg" and contentType != "image/png" and contentType != "image/gif") {
          return ?"Only JPG, PNG, or GIF images are allowed";
        };
        if (size > MAX_IMAGE_SIZE) {
          return ?"File exceeds 5 MB limit";
        };
      };
      case (#incubatorImage) {
        if (contentType != "image/jpeg" and contentType != "image/png") {
          return ?"Only JPG or PNG images are allowed";
        };
        if (size > MAX_INCUBATOR_IMAGE_SIZE) {
          return ?"File exceeds 3 MB limit";
        };
      };
      case (#incubatorPpt) {
        if (size > MAX_PPT_SIZE) {
          return ?"File exceeds 20 MB limit";
        };
      };
      case (#incubatorDoc) {
        if (size > MAX_DOC_SIZE) {
          return ?"File exceeds 10 MB limit";
        };
      };
      case (#incubatorSrc) {
        if (size > MAX_DOC_SIZE) {
          return ?"File exceeds 10 MB limit";
        };
      };
    };
    null;
  };

  // Generate a unique objectId from a counter
  public func makeObjectId(caller : Common.UserId, counter : Nat) : Common.ObjectId {
    caller.toText() # "-" # counter.toText();
  };

  public func upload(
    store : Map.Map<Common.ObjectId, Common.StoredFile>,
    objectId : Common.ObjectId,
    caller : Common.UserId,
    filename : Text,
    contentType : Text,
    data : Blob,
  ) : Common.UploadFileResult {
    let file : Common.StoredFile = {
      objectId;
      owner = caller;
      filename;
      contentType;
      size = data.size();
      data;
      createdAt = Time.now();
    };
    store.add(objectId, file);
    { objectId; filename; contentType; size = data.size() };
  };

  public func download(
    store : Map.Map<Common.ObjectId, Common.StoredFile>,
    objectId : Common.ObjectId,
  ) : ?Common.DownloadFileResult {
    switch (store.get(objectId)) {
      case (?f) ?{ filename = f.filename; contentType = f.contentType; data = f.data };
      case null null;
    };
  };

  public func delete(
    store : Map.Map<Common.ObjectId, Common.StoredFile>,
    objectId : Common.ObjectId,
  ) : Bool {
    let exists = store.get(objectId) != null;
    store.remove(objectId);
    exists;
  };
};
