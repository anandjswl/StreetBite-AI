import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Bool "mo:core/Bool";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Types
  type Coordinates = {
    latitude : Float;
    longitude : Float;
  };

  type Vendor = {
    id : Text;
    name : Text;
    foodType : Text;
    coordinates : Coordinates;
    availability : Bool;
    menu : [MenuItem];
    createdAt : Int;
    address : Text;
    isVerified : Bool;
    owner : Principal;
    lastUpdated : Int;
  };

  type MenuItem = {
    name : Text;
    price : Float;
    currency : Text;
  };

  type AdminRole = {
    #government;
    #ngo;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  module Vendor {
    public func compareByName(v1 : Vendor, v2 : Vendor) : Order.Order {
      Text.compare(v1.name, v2.name);
    };

    public func compareByCreatedAt(v1 : Vendor, v2 : Vendor) : Order.Order {
      Int.compare(v1.createdAt, v2.createdAt);
    };
  };

  // State
  var vendorIdCounter = 0;
  let vendors = Map.empty<Text, Vendor>();
  let adminRoles = Map.empty<Principal, AdminRole>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper to generate unique vendor IDs
  func generateVendorId() : Text {
    let id = vendorIdCounter.toText();
    vendorIdCounter += 1;
    id;
  };

  // Helper to check if caller owns vendor or is admin
  // For development: treat all authenticated users as admins
  // Guests (anonymous users) are restricted from admin actions
  func canModifyVendor(caller : Principal, vendor : Vendor) : Bool {
    // Owner can always modify their vendor
    if (caller == vendor.owner) {
      return true;
    };

    // Development: allow any authenticated (non-anonymous) user
    if (caller.isAnonymous()) {
      return false;
    };

    // Any authenticated user has admin access for development
    true;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Vendor Registration - Open to all users including guests
  public shared ({ caller }) func registerVendor(
    name : Text,
    foodType : Text,
    coordinates : Coordinates,
    menu : [MenuItem],
    address : Text
  ) : async Text {
    let vendorId = generateVendorId();

    let newVendor : Vendor = {
      id = vendorId;
      name;
      foodType;
      coordinates;
      availability = true;
      menu;
      createdAt = Time.now();
      address;
      isVerified = false;
      owner = caller;
      lastUpdated = Time.now();
    };

    vendors.add(vendorId, newVendor);
    vendorId;
  };

  // Vendor Management - Owner or authenticated users can modify
  public shared ({ caller }) func updateVendorLocation(vendorId : Text, newCoordinates : Coordinates) : async () {
    let vendor = vendors.get(vendorId);
    switch (vendor) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?existingVendor) {
        if (not canModifyVendor(caller, existingVendor)) {
          Runtime.trap("Unauthorized: Only the vendor owner or authenticated users can update location");
        };
        let updatedVendor = {
          existingVendor with
          coordinates = newCoordinates;
          lastUpdated = Time.now();
        };
        vendors.add(vendorId, updatedVendor);
      };
    };
  };

  public shared ({ caller }) func setAvailability(vendorId : Text, available : Bool) : async () {
    let vendor = vendors.get(vendorId);
    switch (vendor) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?existingVendor) {
        if (not canModifyVendor(caller, existingVendor)) {
          Runtime.trap("Unauthorized: Only the vendor owner or authenticated users can set availability");
        };
        let updatedVendor = {
          existingVendor with
          availability = available;
          lastUpdated = Time.now();
        };
        vendors.add(vendorId, updatedVendor);
      };
    };
  };

  // Query functions - Open to all users including guests
  public query ({ caller }) func getVendorById(vendorId : Text) : async Vendor {
    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) { vendor };
    };
  };

  public query ({ caller }) func getVendorsByFoodType(foodType : Text) : async [Vendor] {
    vendors.values().toArray().filter(
      func(v) { v.foodType == foodType }
    );
  };

  public query ({ caller }) func getAvailableVendors() : async [Vendor] {
    vendors.values().toArray().filter(func(v) { v.availability });
  };

  // Admin function - For development: open to all authenticated users
  public shared ({ caller }) func verifyVendor(vendorId : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Guests (anonymous users) cannot verify vendors");
    };

    let vendor = vendors.get(vendorId);
    switch (vendor) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?existingVendor) {
        let updatedVendor = {
          existingVendor with
          isVerified = true;
        };
        vendors.add(vendorId, updatedVendor);
      };
    };
  };

  // HTTP outcall functions
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // HTTP outcalls - For development: open to authenticated users
  public shared ({ caller }) func makeOutcall(url : Text) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Guests (anonymous users) cannot make HTTP outcalls");
    };
    await OutCall.httpGetRequest(url, [], transform);
  };

  // Public query functions - Open to all
  public query ({ caller }) func getAllVendors() : async [Vendor] {
    vendors.values().toArray().sort(Vendor.compareByName);
  };

  public query ({ caller }) func getMenu(vendorId : Text) : async [MenuItem] {
    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) { vendor.menu };
    };
  };

  // Menu Management - Owner or authenticated users can modify
  public shared ({ caller }) func addMenuItem(vendorId : Text, item : MenuItem) : async () {
    let vendor = vendors.get(vendorId);
    switch (vendor) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?existingVendor) {
        if (not canModifyVendor(caller, existingVendor)) {
          Runtime.trap("Unauthorized: Only the vendor owner or authenticated users can add menu items");
        };
        let updatedMenu = existingVendor.menu.concat([item]);
        let updatedVendor = {
          existingVendor with menu = updatedMenu;
        };
        vendors.add(vendorId, updatedVendor);
      };
    };
  };

  public shared ({ caller }) func removeMenuItem(vendorId : Text, itemName : Text) : async () {
    let vendor = vendors.get(vendorId);
    switch (vendor) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?existingVendor) {
        if (not canModifyVendor(caller, existingVendor)) {
          Runtime.trap("Unauthorized: Only the vendor owner or authenticated users can remove menu items");
        };
        let updatedMenu = existingVendor.menu.filter(
          func(item) { item.name != itemName }
        );
        let updatedVendor = { existingVendor with menu = updatedMenu };
        vendors.add(vendorId, updatedVendor);
      };
    };
  };

  public shared ({ caller }) func updateMenuItem(vendorId : Text, itemName : Text, updatedItem : MenuItem) : async () {
    let vendor = vendors.get(vendorId);
    switch (vendor) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?existingVendor) {
        if (not canModifyVendor(caller, existingVendor)) {
          Runtime.trap("Unauthorized: Only the vendor owner or authenticated users can update menu items");
        };
        let updatedMenu = existingVendor.menu.map(
          func(item) {
            if (item.name == itemName) { updatedItem } else { item };
          }
        );
        let updatedVendor = {
          existingVendor with
          menu = updatedMenu;
        };
        vendors.add(vendorId, updatedVendor);
      };
    };
  };

  // Search and filter functions - Open to all
  public query ({ caller }) func searchVendorsByName(searchTerm : Text) : async [Vendor] {
    let lowercaseSearchTerm = searchTerm.toLower();
    vendors.values().toArray().filter(
      func(v) { v.name.toLower().contains(#text lowercaseSearchTerm) }
    );
  };

  public query ({ caller }) func getVendorsByProximity(userCoordinates : Coordinates, radius : Float) : async [Vendor] {
    func calculateDistance(coords1 : Coordinates, coords2 : Coordinates) : Float {
      let earthRadiusKm = 6371.0;
      let lat1 = coords1.latitude;
      let lon1 = coords1.longitude;
      let lat2 = coords2.latitude;
      let lon2 = coords2.longitude;

      let dLat = (lat2 - lat1) * Float.pi / 180.0;
      let dLon = (lon2 - lon1) * Float.pi / 180.0;

      let a = Float.sin(dLat / 2.0) * Float.sin(dLat / 2.0) +
              Float.cos(lat1 * Float.pi / 180.0) *
              Float.cos(lat2 * Float.pi / 180.0) *
              Float.sin(dLon / 2.0) *
              Float.sin(dLon / 2.0);

      let c = 2.0 * Float.arctan2(Float.sqrt(a), Float.sqrt(1.0 - a));
      earthRadiusKm * c;
    };

    vendors.values().toArray().filter(
      func(v) { calculateDistance(userCoordinates, v.coordinates) <= radius }
    );
  };

  public query ({ caller }) func getRecentVendors(limit : Nat) : async [Vendor] {
    let allVendors = vendors.values().toArray().sort(Vendor.compareByCreatedAt);
    if (limit >= allVendors.size()) {
      allVendors;
    } else {
      allVendors.sliceToArray(0, limit);
    };
  };

  public query ({ caller }) func getVendorsByLocation(location : Text) : async [Vendor] {
    vendors.values().toArray().filter(
      func(v) { v.address == location }
    );
  };

  // Real-time vendor location updates - Owner or authenticated users can modify
  public shared ({ caller }) func updateVendorCoordinates(
    vendorId : Text,
    coordinates : Coordinates
  ) : async () {
    let vendor = vendors.get(vendorId);
    switch (vendor) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?existingVendor) {
        if (not canModifyVendor(caller, existingVendor)) {
          Runtime.trap("Unauthorized: Only the vendor owner or authenticated users can update coordinates");
        };
        let updatedVendor = {
          existingVendor with
          coordinates;
          lastUpdated = Time.now();
        };
        vendors.add(vendorId, updatedVendor);
      };
    };
  };

  public query ({ caller }) func getLiveVendorLocations() : async [(Text, Coordinates)] {
    let entries = vendors.entries();
    entries.toArray().map(
      func((id, vendor)) {
        (id, vendor.coordinates);
      }
    );
  };
};
