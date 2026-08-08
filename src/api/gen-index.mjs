import { readdir, writeFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

const generatedDir = 'src/api/generated';
const outputFile = 'src/api/index.ts';

const camelCase = (value) => value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

const entries = await readdir(generatedDir, { withFileTypes: true });
const tags = entries.filter((entry) => entry.isFile() && extname(entry.name) === '.ts').map((entry) => basename(entry.name, '.ts'));

tags.sort();

const imports = tags
  .map((tag) => {
    const variable = camelCase(tag);

    return `import * as ${variable} from './generated/${tag}';`;
  })
  .join('\n');

const properties = tags.map((tag) => `  ${camelCase(tag)},`).join('\n');

const content = `// 此文件由脚本自动生成，请勿手动修改。
${imports}

export const api = {
${properties}
} as const;

export default api;
`;

await writeFile(outputFile, content, 'utf8');
