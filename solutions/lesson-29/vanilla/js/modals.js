// Modals built with the <dialog> element: create a server, view a profile, confirm a delete.

import { getUser, getActiveServer, getMember } from './state.js';
import { createServer, deleteMessage } from './actions.js';
import { avatar } from './dom.js';

const createDialog = document.querySelector('#create-server-dialog');
const createForm = document.querySelector('#create-server-form');
const createCancel = document.querySelector('#create-server-cancel');
const addServerButton = document.querySelector('.add-server-button');

const profileDialog = document.querySelector('#profile-dialog');
const deleteDialog = document.querySelector('#delete-dialog');
const deletePreview = document.querySelector('#delete-preview');

let messageToDelete = null;

// ---------- Create server ----------

export function openCreateServer() {
  createForm.reset();
  createDialog.returnValue = '';
  createDialog.showModal();
}

// ---------- User profile ----------

export function openProfile(userId) {
  const user = getUser(userId);
  const server = getActiveServer();
  const member = getMember(server, userId);
  const role = member && server.roles.find((r) => r.id === member.roleId);

  profileDialog.style.setProperty('--avatar-color', user.avatarColor);
  profileDialog.querySelector('#profile-avatar').replaceWith(createProfileAvatar(user));
  profileDialog.querySelector('#profile-name').textContent = user.displayName;
  profileDialog.querySelector('#profile-username').textContent = user.username;
  profileDialog.querySelector('#profile-custom-status').textContent = user.customStatus;
  profileDialog.querySelector('#profile-bio').textContent = user.bio;
  profileDialog.querySelector('#profile-role').textContent = role ? role.name : 'No roles';
  profileDialog.showModal();
}

function createProfileAvatar(user) {
  const element = avatar(user, true);
  element.classList.add('profile-avatar');
  element.id = 'profile-avatar';
  return element;
}

// ---------- Delete confirmation ----------

// Shift+click deletes right away, like in the real app.
export function confirmDelete(message, skipConfirm) {
  if (skipConfirm) {
    deleteMessage(message.id);
    return;
  }
  messageToDelete = message;
  deletePreview.textContent = message.content;
  deleteDialog.returnValue = '';
  deleteDialog.showModal();
}

// ---------- Setup ----------

// Clicking the dark backdrop closes a dialog. The click "lands" on the
// <dialog> element itself only when it's outside the dialog's content.
function closeOnBackdropClick(dialog) {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}

export function setupModals() {
  addServerButton.addEventListener('click', openCreateServer);
  createCancel.addEventListener('click', () => createDialog.close());

  createDialog.addEventListener('close', () => {
    if (createDialog.returnValue === 'create') {
      const data = new FormData(createForm);
      createServer(data.get('serverName'), data.get('serverIcon').trim());
    }
  });

  deleteDialog.addEventListener('close', () => {
    if (deleteDialog.returnValue === 'delete' && messageToDelete) {
      deleteMessage(messageToDelete.id);
    }
    messageToDelete = null;
  });

  closeOnBackdropClick(createDialog);
  closeOnBackdropClick(profileDialog);
  closeOnBackdropClick(deleteDialog);
}
