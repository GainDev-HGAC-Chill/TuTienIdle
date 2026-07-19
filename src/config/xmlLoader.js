const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', parseAttributeValue: true, trimValues: true });
function loadXml(filePath) {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) throw new Error(`Không tìm thấy XML: ${absolute}`);
  return parser.parse(fs.readFileSync(absolute, 'utf8'));
}
function arrayOf(value) { return value == null ? [] : Array.isArray(value) ? value : [value]; }
module.exports = { loadXml, arrayOf };
