// @ts-ignore
/**
 * 角色定义
 * - admin: 管理员，拥有所有权限
 * - manager: 部门经理，可以查看数据、审批请假，但不能删除人员
 * - staff: 普通员工，只能查看自己有权限的数据
 */

/**
 * 获取用户角色
 * @param {Object} currentUser - 当前用户对象
 * @returns {string} 用户角色
 */
export const getUserRole = (currentUser) => {
  if (!currentUser) return 'staff';
  
  // 根据用户类型或自定义字段判断角色
  // 这里假设用户对象中有 role 字段，如果没有则根据其他条件判断
  if (currentUser.role) {
    return currentUser.role;
  }
  
  // 如果没有 role 字段，可以根据用户名或其他字段判断
  // 例如：administrator 为管理员
  if (currentUser.name === 'administrator' || currentUser.nickName === 'administrator') {
    return 'admin';
  }
  
  // 默认为普通员工
  return 'staff';
};

/**
 * 检查用户是否有权限执行某个操作
 * @param {Object} currentUser - 当前用户对象
 * @param {string} permission - 权限名称
 * @returns {boolean} 是否有权限
 */
export const hasPermission = (currentUser, permission) => {
  const role = getUserRole(currentUser);
  
  // 管理员拥有所有权限
  if (role === 'admin') {
    return true;
  }
  
  // 部门经理的权限
  if (role === 'manager') {
    const managerPermissions = [
      'view:personnel',
      'view:attendance',
      'view:leave',
      'view:event',
      'view:feedback',
      'view:announcement',
      'approve:leave',
      'view:personnel_detail',
      'view:leave_detail',
      'view:event_detail',
      'view:feedback_detail',
      'view:announcement_detail',
      'add:personnel',
      'edit:personnel',
      'create:announcement',
      'edit:announcement',
      'delete:announcement'
    ];
    return managerPermissions.includes(permission);
  }
  
  // 部门经理的权限
  if (role === 'manager') {
    const managerPermissions = [
      'view:personnel',
      'view:attendance',
      'view:leave',
      'view:event',
      'view:feedback',
      'view:announcement',
      'approve:leave',
      'view:personnel_detail',
      'view:leave_detail',
      'view:event_detail',
      'view:feedback_detail',
      'view:announcement_detail',
      'add:personnel',
      'edit:personnel',
      'create:announcement',
      'edit:announcement',
      'delete:announcement'
    ];
    return managerPermissions.includes(permission);
  }
  
  // 普通员工的权限
  if (role === 'staff') {
    const staffPermissions = [
      'view:attendance',
      'view:leave',
      'view:event',
      'view:feedback',
      'view:announcement',
      'view:leave_detail',
      'view:event_detail',
      'view:feedback_detail',
      'view:announcement_detail'
    ];
    return staffPermissions.includes(permission);
  }
  
  return false;
};

/**
 * 获取用户可访问的页面列表
 * @param {Object} currentUser - 当前用户对象
 * @returns {Array<string>} 可访问的页面列表
 */
export const getAccessiblePages = (currentUser) => {
  const role = getUserRole(currentUser);
  
  // 管理员可以访问所有页面
  if (role === 'admin') {
    return ['home', 'personnel', 'attendance', 'leave', 'event', 'feedback', 'announcement', 'personnelLedger', 'roleManagement'];
  }
  
  // 部门经理可以访问的页面
  if (role === 'manager') {
    return ['home', 'personnel', 'attendance', 'leave', 'event', 'feedback', 'announcement', 'personnelLedger'];
  }
  
  // 普通员工可以访问的页面
  if (role === 'staff') {
    return ['home', 'attendance', 'leave', 'event', 'feedback', 'announcement'];
  }
  
  return [];
};

/**
 * 检查用户是否可以访问某个页面
 * @param {Object} currentUser - 当前用户对象
 * @param {string} pageId - 页面 ID
 * @returns {boolean} 是否可以访问
 */
export const canAccessPage = (currentUser, pageId) => {
  const accessiblePages = getAccessiblePages(currentUser);
  return accessiblePages.includes(pageId);
};

/**
 * 获取角色显示名称
 * @param {string} role - 角色代码
 * @returns {string} 角色显示名称
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: '管理员',
    manager: '部门经理',
    staff: '普通员工'
  };
  return roleNames[role] || '未知';
};
