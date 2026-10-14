// Lesson 13: changing the page from JavaScript.

// ---------- The user panel (bottom left) ----------

const userName = document.querySelector('#user-panel-name');
const userTag = document.querySelector('#user-panel-tag');
const userAvatar = document.querySelector('#user-panel-avatar');

userName.textContent = currentUser.displayName;
userTag.textContent = currentUser.customStatus;

// The avatar's color comes from the data, through a CSS variable
userAvatar.style.setProperty('--avatar-color', currentUser.avatarColor);

// Show the right status dot: remove the one from the HTML, add the real one
userAvatar.classList.remove('status-online');
userAvatar.classList.add(`status-${currentUser.status}`);

// ---------- The sidebar header ----------

const serverName = document.querySelector('#server-name');
serverName.textContent = servers[0].name;

// ---------- The tab title ----------

document.title = `${servers[0].name} | Hubbub`;

// ---------- Hiding and showing ----------

// Every element has a `hidden` property. Try this in the Console:
//   document.querySelector('#member-list').hidden = true
const memberList = document.querySelector('#member-list');
console.log('Is the member list hidden?', memberList.hidden);
