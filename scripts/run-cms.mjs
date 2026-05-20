// 运行 CMS：首次自动 npm install，之后直接启动 dev server
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CMS_DIR = resolve(__dirname, '../cms');

if (!existsSync(resolve(CMS_DIR, 'node_modules'))) {
	console.log('首次启动 CMS——安装依赖（大约 30 秒）...\n');
	const install = spawnSync('npm', ['install'], {
		cwd: CMS_DIR,
		stdio: 'inherit',
		shell: true, // Windows 上 npm 是 .cmd，必须 shell: true
	});
	if (install.status !== 0) {
		console.error('\n× CMS 依赖安装失败');
		process.exit(install.status || 1);
	}
	console.log('\n✓ 依赖安装完成，启动 CMS...\n');
}

const dev = spawnSync('npm', ['run', 'dev'], {
	cwd: CMS_DIR,
	stdio: 'inherit',
	shell: true,
});
process.exit(dev.status || 0);
