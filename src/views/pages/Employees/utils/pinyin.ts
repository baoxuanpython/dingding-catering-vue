/**
 * 员工管理 - 拼音工具函数
 */
import { pinyin } from "pinyin-pro";

/**
 * 获取姓名拼音的首字母（大写）
 * @param name 中文姓名
 * @returns 拼音首字母，如 "莫彬" -> "MB"
 */
export function getPinyinInitials(name: string): string {
  const result = pinyin(name, { pattern: "first", toneType: "none" });
  return result
    .split(" ")
    .map((char) => char.toUpperCase())
    .join("");
}

/**
 * 获取姓名的拼音（姓的全拼，首字母大写）
 * @param name 中文姓名
 * @returns 姓的全拼，如 "莫彬" -> "Mo"
 */
export function getSurnamePinyin(name: string): string {
  if (!name || name.length === 0) return name;

  // 获取第一个字的全拼
  const firstChar = name.charAt(0);
  const result = pinyin(firstChar, { pattern: "pinyin", toneType: "none" });

  // 首字母大写
  if (result && result.length > 0) {
    return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  }

  return firstChar.toUpperCase();
}

/**
 * 获取姓名拼音的首字母（仅第一个字）
 * @param name 中文姓名
 * @returns 单个大写字母，如 "莫彬" -> "M"
 */
export function getFirstLetter(name: string): string {
  const surname = getSurnamePinyin(name);
  return surname.charAt(0) || name.charAt(0).toUpperCase();
}

/**
 * 根据姓名生成头像颜色
 * @param name 中文姓名
 * @returns 颜色值
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "#67c23a", // 绿色（主题色）
    "#409eff", // 蓝色
    "#e6a23c", // 橙色
    "#f56c6c", // 红色
    "#909399", // 灰色
    "#a855f7", // 紫色
    "#06b6d4", // 青色
    "#f97316", // 深橙
    "#ec4899", // 粉色
    "#14b8a6", // 蓝绿
    "#8b5cf6", // 紫罗兰
    "#f43f5e", // 玫红
  ];

  // 根据姓名计算哈希值
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return colors[hash % colors.length];
}
