const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'data.json');

const DEFAULT = {
  employees: [
    { id: 1, name: 'Landon' },
    { id: 2, name: 'Cristian' },
    { id: 3, name: 'Andrew' },
    { id: 4, name: 'Riley' }
  ],
  jobs: [
    { id: 1, name: '103 N Jarvis' },
    { id: 2, name: '105 N Jarvis' },
    { id: 3, name: '805 E. 1st St' },
    { id: 4, name: '105 S Rotary Ave' },
    { id: 5, name: '107 S Rotary Ave' },
    { id: 6, name: '111 S Rotary Ave' }
  ],
  entries: [],
  nextId: { employee: 5, job: 7, entry: 1 }
};

function load() {
  if (!fs.existsSync(FILE)) return JSON.parse(JSON.stringify(DEFAULT));
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch (_) { return JSON.parse(JSON.stringify(DEFAULT)); }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
