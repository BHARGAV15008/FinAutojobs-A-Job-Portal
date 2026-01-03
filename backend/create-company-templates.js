import fs from "fs";
import path from "path";
import emailService from "./services/emailService.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, "templates", "emails");

console.log("📝 Creating company email templates...\n");

// Make sure templates directory exists
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
  console.log("✅ Created templates directory");
}

// Get templates from emailService
const templates = emailService.templates;

// Company template names
const companyTemplates = [
  "companyVerified",
  "companyRejected",
  "companySuspended",
  "companySubmittedForReview",
];

let created = 0;
companyTemplates.forEach((templateName) => {
  if (templates[templateName]) {
    const filePath = path.join(templatesDir, `${templateName}.html`);
    fs.writeFileSync(filePath, templates[templateName]);
    console.log(`✅ Created ${templateName}.html`);
    created++;
  } else {
    console.log(`⚠️  Template ${templateName} not found in service`);
  }
});

console.log(
  `\n🎉 Created ${created} out of ${companyTemplates.length} company email templates`
);
console.log(`📂 Templates location: ${templatesDir}`);

// List all templates
console.log("\n📋 All templates in directory:");
const files = fs.readdirSync(templatesDir);
files.forEach((file) => {
  const stats = fs.statSync(path.join(templatesDir, file));
  console.log(`   - ${file} (${Math.round(stats.size / 1024)}KB)`);
});

process.exit(0);
