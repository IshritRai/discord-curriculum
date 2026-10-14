// Loads the app's fake data from the JSON files in data/.

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path} (HTTP ${response.status})`);
  }
  return response.json();
}

export async function loadData() {
  // Start all four downloads at once and wait until every one has finished.
  const [users, servers, messages, emojiCategories] = await Promise.all([
    loadJson('data/users.json'),
    loadJson('data/servers.json'),
    loadJson('data/messages.json'),
    loadJson('data/emoji.json'),
  ]);
  return { users, servers, messages, emojiCategories };
}
