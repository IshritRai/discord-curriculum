// The starting point of the app: set everything up and draw the screen.

import { applyBrand } from './brand.js';
import { users, servers, messages } from './data.js';
import { state, onChange, loadSaved } from './state.js';
import { renderServers, setupServers } from './servers.js';
import { renderChannels, setupChannels } from './channels.js';
import { renderChat } from './chat.js';
import { renderMembers } from './members.js';
import { renderUserPanel } from './user-panel.js';
import { setupLayout } from './layout.js';

// Draws the whole screen from the current state.
function render() {
  renderServers();
  renderChannels();
  renderChat();
  renderMembers();
  renderUserPanel();
}

applyBrand();

// Use the saved state from last time if there is one, otherwise the data in data.js.
const saved = loadSaved();
if (saved !== null) {
  state.users = saved.users;
  state.servers = saved.servers;
  state.messages = saved.messages;
  state.activeServerId = saved.activeServerId;
  state.activeChannelByServer = saved.activeChannelByServer;
  state.collapsedCategoryIds = saved.collapsedCategoryIds;
} else {
  state.users = users;
  state.servers = servers;
  state.messages = messages;
  state.activeServerId = servers[0].id;
}

setupLayout();
setupServers();
setupChannels();

onChange(render);
render();
