// 把指定的竖图预裁成横版「脸+头」区域，避免 Astro 自动裁剪切到脸
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const targets = [
	// { file, topRatio: 顶部裁剪起点（占原图高度比例）, bottomRatio: 底部裁剪终点 }
	{ file: 'src/assets/blog/building-this-blog.jpg', topRatio: 0.0, bottomRatio: 0.65 },
	{ file: 'src/assets/blog/feishu-doc-monitor.jpg', topRatio: 0.0, bottomRatio: 0.62 },
];

for (const { file, topRatio, bottomRatio } of targets) {
	const input = readFileSync(file);
	const meta = await sharp(input).metadata();
	const top = Math.round(meta.height * topRatio);
	const bottom = Math.round(meta.height * bottomRatio);
	const newHeight = bottom - top;
	const buffer = await sharp(input)
		.extract({ left: 0, top, width: meta.width, height: newHeight })
		.jpeg({ quality: 90 })
		.toBuffer();
	writeFileSync(file, buffer);
	console.log(`✓ ${file}  ${meta.width}x${meta.height} → ${meta.width}x${newHeight}`);
}
