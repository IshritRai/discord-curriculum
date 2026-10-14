// Lesson 12: getting to know JavaScript in the browser's console.
// Open DevTools → Console to see what this file prints.

console.log('Hello from app.js!');

// ---------- Values and variables ----------

const appName = 'Hubbub';
let messageCount = 0;
messageCount = messageCount + 1;
console.log(appName, messageCount);

// ---------- Objects (like Python dictionaries) ----------

console.log(currentUser.displayName);
console.log(`Logged in as ${currentUser.displayName} (${currentUser.username})`);

// ---------- Arrays (like Python lists) ----------

console.log(`You have joined ${servers.length} servers`);
console.log('The first server is', servers[0].name);

// ---------- Loops ----------

for (const server of servers) {
  console.log(server.name);
}

// ---------- Functions and if/else ----------

function describeServer(server) {
  if (server.iconIsEmoji) {
    return `${server.icon} ${server.name}`;
  } else {
    return `[${server.icon}] ${server.name}`;
  }
}

for (const server of servers) {
  console.log(describeServer(server));
}

function countEmojiServers(serverList) {
  let count = 0;
  for (const server of serverList) {
    if (server.iconIsEmoji === true) {
      count += 1;
    }
  }
  return count;
}

console.log('Servers with an emoji icon:', countEmojiServers(servers));

// console.table shows an array of objects as a table
console.table(servers);
