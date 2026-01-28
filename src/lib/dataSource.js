// 数据源访问工具函数

/**
 * 查询多条记录
 * @param {string} dataSourceName - 数据源名称
 * @param {object} filter - 查询条件
 * @param {number} pageSize - 每页数量
 * @param {number} pageNumber - 页码
 * @param {array} orderBy - 排序条件
 */
export async function getRecords(dataSourceName, filter = {}, pageSize = 100, pageNumber = 1, orderBy = []) {
  try {
    const result = await window.$w?.cloud?.callDataSource?.({
      dataSourceName,
      methodName: 'wedaGetRecordsV2',
      params: {
        filter: {
          where: filter,
        },
        select: {
          $master: true,
        },
        getCount: true,
        pageSize,
        pageNumber,
        orderBy,
      },
    });
    return result;
  } catch (error) {
    console.error('查询数据失败:', error);
    throw error;
  }
}

/**
 * 查询单条记录
 * @param {string} dataSourceName - 数据源名称
 * @param {object} filter - 查询条件
 */
export async function getItem(dataSourceName, filter) {
  try {
    const result = await window.$w?.cloud?.callDataSource?.({
      dataSourceName,
      methodName: 'wedaGetItemV2',
      params: {
        filter: {
          where: filter,
        },
        select: {
          $master: true,
        },
      },
    });
    return result;
  } catch (error) {
    console.error('查询数据失败:', error);
    throw error;
  }
}

/**
 * 创建单条记录
 * @param {string} dataSourceName - 数据源名称
 * @param {object} data - 数据对象
 */
export async function createRecord(dataSourceName, data) {
  try {
    const result = await window.$w?.cloud?.callDataSource?.({
      dataSourceName,
      methodName: 'wedaCreateV2',
      params: {
        data,
      },
    });
    return result;
  } catch (error) {
    console.error('创建数据失败:', error);
    throw error;
  }
}

/**
 * 更新单条记录
 * @param {string} dataSourceName - 数据源名称
 * @param {object} data - 更新数据
 * @param {object} filter - 查询条件
 */
export async function updateRecord(dataSourceName, data, filter) {
  try {
    const result = await window.$w?.cloud?.callDataSource?.({
      dataSourceName,
      methodName: 'wedaUpdateV2',
      params: {
        data,
        filter: {
          where: filter,
        },
      },
    });
    return result;
  } catch (error) {
    console.error('更新数据失败:', error);
    throw error;
  }
}

/**
 * 删除单条记录
 * @param {string} dataSourceName - 数据源名称
 * @param {object} filter - 查询条件
 */
export async function deleteRecord(dataSourceName, filter) {
  try {
    const result = await window.$w?.cloud?.callDataSource?.({
      dataSourceName,
      methodName: 'wedaDeleteV2',
      params: {
        filter: {
          where: filter,
        },
      },
    });
    return result;
  } catch (error) {
    console.error('删除数据失败:', error);
    throw error;
  }
}

/**
 * 格式化日期时间
 * @param {number} timestamp - 时间戳
 * @param {string} format - 格式化模板
 */
export function formatDateTime(timestamp, format = 'YYYY-MM-DD HH:mm') {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化日期
 * @param {number} timestamp - 时间戳
 */
export function formatDate(timestamp) {
  return formatDateTime(timestamp, 'YYYY-MM-DD');
}

/**
 * 格式化时间
 * @param {number} timestamp - 时间戳
 */
export function formatTime(timestamp) {
  return formatDateTime(timestamp, 'HH:mm:ss');
}
