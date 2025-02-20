const ldap = require("ldapjs");
const path = require("path");
const fs = require("fs");

const USERS_FILE = path.join(__dirname, "users.json");
const PORT = 3899;

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), "utf8");
    return [];
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function runServer() {
  const server = ldap.createServer();
  let users = readUsers();
  server.bind("", (req, res, next) => {
    console.log(`Incoming authentication request for DN: ${req.dn.toString()}`);

    const user = users.find((u) => u.dn === req.dn.toString());

    if (user && user.attributes.userPassword === req.credentials) {
      console.info(`Authentication successful for ${req.dn.toString()}`);
      res.end();
    } else {
      console.error(`Authentication failed for ${req.dn.toString()}`);
      return next(new ldap.InvalidCredentialsError());
    }
  });

  server.listen(PORT, () => {
    console.log(`LDAP Server running at ldap://127.0.0.1:${PORT}`);
  });
}

runServer();
