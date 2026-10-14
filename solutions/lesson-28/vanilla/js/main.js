// The starting point of the app: load the data, set everything up, draw the screen.

import { applyBrand } from './brand.js';
import { loadData } from './data.js';
import { state, onChange, loadSaved } from './state.js';
import { renderServers, setupServers } from './servers.js';
import { renderChannels, setupChannels } from './channels.js';
import { renderChat, setupChat } from './chat.js';
import { setupComposer } from './composer.js';
import { setupEmojiPicker } from './reactions.js';
import { renderMembers, setupMembers } from './members.js';
import { renderUserPanel, setupUserPanel } from './user-panel.js';
import { setupModals } from './modals.js';
import { setupMenus } from './menus.js';
import { setupTooltips, hideTooltip } from './tooltips.js';
import { renderTyping, startSimulation } from './simulation.js';
import { setupLayout } from './layout.js';

// Draws the whole screen from the current state.
function render() {
  renderServers();
  renderChannels();
  renderChat();
  renderMembers();
  renderUserPanel();
  renderTyping();
  hideTooltip();
}

async function start() {
  applyBrand();
  const data = await loadData();
  state.emojiCategories = data.emojiCategories;
  state.chatter = data.chatter;

  // Use the saved state from last time if there is one, otherwise the JSON data.
  const saved = loadSaved();
  if (saved !== null) {
    state.users = saved.users;
    state.servers = saved.servers;
    state.messages = saved.messages;
    state.activeServerId = saved.activeServerId;
    state.activeChannelByServer = saved.activeChannelByServer;
    state.collapsedCategoryIds = saved.collapsedCategoryIds;
  } else {
    state.users = data.users;
    state.servers = data.servers;
    state.messages = data.messages;
    state.activeServerId = data.servers[0].id;
  }

  setupLayout();
  setupServers();
  setupChannels();
  setupChat();
  setupComposer();
  setupEmojiPicker();
  setupMembers();
  setupUserPanel();
  setupModals();
  setupMenus();
  setupTooltips();

  onChange(render);
  render();
  startSimulation();
}

start().catch((error) => {
  console.error(error);
  document.querySelector('#message-list').textContent = `Something went wrong while starting the app: ${error.message}`;
});
