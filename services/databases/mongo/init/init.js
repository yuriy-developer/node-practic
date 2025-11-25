db = db.getSiblingDB("appdb");

db.createCollection("users");

db.users.insert({
  name: "Admin",
  role: "admin",
  createdAt: new Date()
});
