import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 优化数据关联性能的工具函数
 * 使用 Map 数据结构进行快速查找，避免 O(n²) 的复杂度
 * @param {Array} mainData - 主数据数组（需要关联的数据）
 * @param {Array} referenceData - 参考数据数组（personnel等）
 * @param {string} mainKey - 主数据中的关联字段名（如 'personnel_id'）
 * @param {string} refKey - 参考数据中的关联字段名（如 '_id'）
 * @param {Object} fieldMapping - 字段映射关系，如 { name: 'name', department: 'department' }
 * @returns {Array} 关联后的数据数组
 */
export function mergeDataWithReference(mainData, referenceData, mainKey, refKey, fieldMapping) {
  if (!mainData || !referenceData || !mainKey || !refKey || !fieldMapping) {
    return mainData || [];
  }

  // 创建 Map 以实现 O(1) 查找
  const referenceMap = new Map();
  referenceData.forEach(item => {
    if (item && item[refKey]) {
      referenceMap.set(String(item[refKey]), item);
    }
  });

  // 使用 Map 进行快速关联
  return mainData.map(record => {
    const keyValue = record[mainKey];
    const referenceItem = keyValue ? referenceMap.get(String(keyValue)) : null;

    const mergedRecord = { ...record };
    
    // 根据字段映射进行关联
    Object.keys(fieldMapping).forEach(targetField => {
      const sourceField = fieldMapping[targetField];
      mergedRecord[targetField] = referenceItem?.[sourceField] || record[targetField] || '未知';
    });

    return mergedRecord;
  });
}