const fs = require('fs');
const readline = require('readline');
const path = require('path');

const transcriptPath = '/Users/aditya/.gemini/antigravity/brain/95224673-ca49-41d6-9419-d2756b93c821/.system_generated/logs/transcript_full.jsonl';

async function restore() {
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const firstWrites = new Map();

  for await (const line of rl) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'PLANNER_RESPONSE' && entry.tool_calls) {
        for (const call of entry.tool_calls) {
          if (call.name === 'write_to_file' || call.name === 'default_api:write_to_file') {
            const targetFile = call.args?.TargetFile;
            const content = call.args?.CodeContent;
            
            if (targetFile && content && targetFile.includes('src/') && !firstWrites.has(targetFile)) {
              firstWrites.set(targetFile, content);
            }
          }
        }
      }
    } catch(e) {}
  }

  for (const [file, content] of firstWrites.entries()) {
    console.log(`Restoring ${file}...`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
}

restore();
