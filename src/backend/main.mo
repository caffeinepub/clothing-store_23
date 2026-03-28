import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    sizes : [Text];
    colors : [Text];
    imageUrl : Text;
    stock : Nat;
    featured : Bool;
  };

  type OrderItem = {
    productId : Nat;
    name : Text;
    price : Nat;
    quantity : Nat;
    size : Text;
    color : Text;
  };

  type Order = {
    id : Nat;
    items : [OrderItem];
    total : Nat;
    customerName : Text;
    customerEmail : Text;
    address : Text;
    status : Text;
    createdAt : Int;
    owner : Principal;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    address : Text;
  };

  module OrderHelper {
    public func compare(order1 : Order, order2 : Order) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };
  };

  // State
  var nextProductId = 0;
  var nextOrderId = 0;

  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Functions
  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    checkAdminOrTrap(caller);
    let id = nextProductId;
    nextProductId += 1;

    let newProduct : Product = {
      id;
      name = product.name;
      description = product.description;
      price = product.price;
      category = product.category;
      sizes = product.sizes;
      colors = product.colors;
      imageUrl = product.imageUrl;
      stock = product.stock;
      featured = product.featured;
    };

    products.add(id, newProduct);
    id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, product : Product) : async Bool {
    checkAdminOrTrap(caller);
    if (not products.containsKey(id)) { return false };
    let updatedProduct : Product = {
      id;
      name = product.name;
      description = product.description;
      price = product.price;
      category = product.category;
      sizes = product.sizes;
      colors = product.colors;
      imageUrl = product.imageUrl;
      stock = product.stock;
      featured = product.featured;
    };
    products.add(id, updatedProduct);
    true;
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async Bool {
    checkAdminOrTrap(caller);
    if (products.containsKey(id)) {
      products.remove(id);
      true;
    } else {
      false;
    };
  };

  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public query func getFeaturedProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.featured });
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { Text.equal(p.category, category) });
  };

  public shared ({ caller }) func seedProducts() : async () {
    checkAdminOrTrap(caller);

    let sampleProducts : [Product] = [
      {
        id = 0;
        name = "Men's T-Shirt";
        description = "Comfortable cotton t-shirt";
        price = 2500;
        category = "Men";
        sizes = ["S", "M", "L", "XL"];
        colors = ["Black", "White", "Blue"];
        imageUrl = "https://example.com/mens-tshirt.jpg";
        stock = 100;
        featured = true;
      },
      {
        id = 1;
        name = "Women's Dress";
        description = "Elegant summer dress";
        price = 4000;
        category = "Women";
        sizes = ["S", "M", "L"];
        colors = ["Red", "Blue", "Green"];
        imageUrl = "https://example.com/womens-dress.jpg";
        stock = 50;
        featured = true;
      },
      {
        id = 2;
        name = "Men's Jeans";
        description = "Classic denim jeans";
        price = 3500;
        category = "Men";
        sizes = ["30", "32", "34", "36"];
        colors = ["Blue"];
        imageUrl = "https://example.com/mens-jeans.jpg";
        stock = 80;
        featured = false;
      },
      {
        id = 3;
        name = "Women's Handbag";
        description = "Stylish leather handbag";
        price = 6000;
        category = "Accessories";
        sizes = [];
        colors = ["Black", "Brown"];
        imageUrl = "https://example.com/handbag.jpg";
        stock = 30;
        featured = true;
      },
      {
        id = 4;
        name = "Men's Hoodie";
        description = "Comfortable fleece hoodie";
        price = 3000;
        category = "Men";
        sizes = ["S", "M", "L"];
        colors = ["Grey", "Black"];
        imageUrl = "https://example.com/mens-hoodie.jpg";
        stock = 70;
        featured = false;
      },
      {
        id = 5;
        name = "Women's Sweater";
        description = "Soft wool sweater";
        price = 4500;
        category = "Women";
        sizes = ["S", "M", "L"];
        colors = ["White", "Pink"];
        imageUrl = "https://example.com/womens-sweater.jpg";
        stock = 60;
        featured = true;
      },
      {
        id = 6;
        name = "Men's Sneakers";
        description = "Comfortable running sneakers";
        price = 5000;
        category = "Men";
        sizes = ["8", "9", "10", "11"];
        colors = ["Black", "White"];
        imageUrl = "https://example.com/mens-sneakers.jpg";
        stock = 90;
        featured = true;
      },
      {
        id = 7;
        name = "Women's Sandals";
        description = "Stylish summer sandals";
        price = 2500;
        category = "Women";
        sizes = ["6", "7", "8"];
        colors = ["Brown", "Beige"];
        imageUrl = "https://example.com/womens-sandals.jpg";
        stock = 40;
        featured = false;
      },
      {
        id = 8;
        name = "Men's Jacket";
        description = "Warm winter jacket";
        price = 8000;
        category = "Men";
        sizes = ["M", "L", "XL"];
        colors = ["Black", "Grey"];
        imageUrl = "https://example.com/mens-jacket.jpg";
        stock = 20;
        featured = true;
      },
      {
        id = 9;
        name = "Women's Scarf";
        description = "Cozy knitted scarf";
        price = 1500;
        category = "Accessories";
        sizes = [];
        colors = ["Red", "Blue", "Green"];
        imageUrl = "https://example.com/scarf.jpg";
        stock = 100;
        featured = false;
      },
      {
        id = 10;
        name = "Men's Shorts";
        description = "Comfortable summer shorts";
        price = 2000;
        category = "Men";
        sizes = ["S", "M", "L"];
        colors = ["Blue", "Beige"];
        imageUrl = "https://example.com/mens-shorts.jpg";
        stock = 60;
        featured = false;
      },
      {
        id = 11;
        name = "Women's Blouse";
        description = "Lightweight cotton blouse";
        price = 3000;
        category = "Women";
        sizes = ["S", "M", "L"];
        colors = ["White", "Blue", "Pink"];
        imageUrl = "https://example.com/womens-blouse.jpg";
        stock = 40;
        featured = true;
      },
      {
        id = 12;
        name = "Men's Watch";
        description = "Stylish analog watch";
        price = 12000;
        category = "Accessories";
        sizes = [];
        colors = ["Black", "Brown"];
        imageUrl = "https://example.com/mens-watch.jpg";
        stock = 25;
        featured = true;
      },
      {
        id = 13;
        name = "Women's Sunglasses";
        description = "Fashionable sunglasses";
        price = 2500;
        category = "Accessories";
        sizes = [];
        colors = ["Black", "Brown"];
        imageUrl = "https://example.com/sunglasses.jpg";
        stock = 75;
        featured = false;
      },
      {
        id = 14;
        name = "Sale Item - Hoodie";
        description = "Clearance sale - limited stock";
        price = 1500;
        category = "Sale";
        sizes = ["M", "L"];
        colors = ["Grey"];
        imageUrl = "https://example.com/sale-hoodie.jpg";
        stock = 20;
        featured = true;
      },
    ];

    for (product in sampleProducts.values()) {
      if (not products.containsKey(product.id)) {
        products.add(product.id, product);
      };
    };
    nextProductId := 15;
  };

  // Order Functions
  public shared ({ caller }) func placeOrder(order : Order) : async Nat {
    // Prevent anonymous users from placing orders
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot place orders");
    };

    let id = nextOrderId;
    nextOrderId += 1;

    let newOrder : Order = {
      id;
      items = order.items;
      total = order.total;
      customerName = order.customerName;
      customerEmail = order.customerEmail;
      address = order.address;
      status = "pending";
      createdAt = Time.now();
      owner = caller;
    };

    orders.add(id, newOrder);
    id;
  };

  public query ({ caller }) func getOrder(id : Nat) : async ?Order {
    switch (orders.get(id)) {
      case (null) { null };
      case (?order) {
        // Users can only view their own orders, admins can view any order
        if (caller != order.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public shared ({ caller }) func getOrders() : async [Order] {
    checkAdminOrTrap(caller);
    orders.values().toArray().sort();
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text) : async Bool {
    checkAdminOrTrap(caller);
    switch (orders.get(id)) {
      case (null) { false };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          items = order.items;
          total = order.total;
          customerName = order.customerName;
          customerEmail = order.customerEmail;
          address = order.address;
          status;
          createdAt = order.createdAt;
          owner = order.owner;
        };
        orders.add(id, updatedOrder);
        true;
      };
    };
  };

  func checkAdminOrTrap(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };
};
