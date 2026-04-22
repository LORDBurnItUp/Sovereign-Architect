import { connect } from 'framer-api';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const TOKEN = process.env.FRAMER_TOKEN;

async function run() {
    const args = process.argv.slice(2);
    const command = args[0];
    const projectUrl = args[1];

    if (!TOKEN) {
        console.error(JSON.stringify({ status: "error", message: "FRAMER_TOKEN not found in .env" }));
        process.exit(1);
    }

    if (!command || !projectUrl) {
        console.log("Usage: node framer_bridge.js <command> <projectUrl> [options]");
        console.log("Commands: info, collections, publish, sync-cms");
        process.exit(1);
    }

    try {
        const framer = await connect(projectUrl, TOKEN);

        switch (command) {
            case 'info':
                const info = await framer.getProjectInfo();
                console.log(JSON.stringify(info, null, 2));
                break;
            case 'collections':
                const collections = await framer.getCollections();
                console.log(JSON.stringify(collections, null, 2));
                break;
            case 'publish':
                await framer.publish();
                console.log(JSON.stringify({ status: "success", message: "Site published" }));
                break;
            case 'sync-cms':
                const collectionId = args[2];
                if (!args[3]) throw new Error("Missing CMS item data");
                const itemData = JSON.parse(args[3]);
                const result = await framer.addCollectionItem(collectionId, itemData);
                console.log(JSON.stringify(result, null, 2));
                break;
            default:
                console.error(JSON.stringify({ status: "error", message: "Unknown command: " + command }));
        }

        await framer.disconnect();
    } catch (error) {
        console.error(JSON.stringify({ status: "error", message: error.message }));
        process.exit(1);
    }
}

run();
