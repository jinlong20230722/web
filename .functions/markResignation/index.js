const cloudbase = require("@cloudbase/node-sdk");

const app = cloudbase.init({
  env: process.env.TCB_ENV || "your-env-id",
});

const models = app.models;

/**
 * 验证 personnelId 参数
 * @param {any} personnelId - 待验证的人员 ID
 * @returns {{valid: boolean, message: string}} 验证结果
 */
function validatePersonnelId(personnelId) {
  if (personnelId === null || personnelId === undefined || personnelId === "") {
    return { valid: false, message: "人员 ID 不能为空" };
  }
  
  if (typeof personnelId !== "string" && typeof personnelId !== "number") {
    return { valid: false, message: "人员 ID 格式不正确，应为字符串或数字" };
  }
  
  return { valid: true, message: "" };
}

/**
 * 主函数：标记人员离职
 * @param {CloudFunctionEvent} event - 事件参数
 * @param {any} context - 上下文
 * @returns {Promise<CloudFunctionResponse>} 操作结果
 */
exports.main = async (event, context) => {
  try {
    const { personnelId } = event;

    // 参数验证
    const validation = validatePersonnelId(personnelId);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    // 检查人员是否存在
    const { data: existingPersonnel } = await models.personnel.findOne({
      filter: {
        where: {
          _id: { $eq: personnelId },
        },
      },
    });

    if (!existingPersonnel) {
      return {
        success: false,
        message: `人员 ID ${personnelId} 不存在`,
      };
    }

    // 检查当前状态是否已经是离职
    if (existingPersonnel.employment_status === "离职") {
      return {
        success: true,
        message: "该人员已经是离职状态",
        data: {
          personnelId,
          employmentStatus: existingPersonnel.employment_status,
          resignationTime: existingPersonnel.resignation_time || null,
        },
      };
    }

    // 更新人员状态为离职，并记录离职时间
    const now = new Date();
    const { data: updatedPersonnel } = await models.personnel.update({
      data: {
        employment_status: "离职",
        resignation_time: now,
        updatedAt: now,
      },
      filter: {
        where: {
          _id: { $eq: personnelId },
        },
      },
    });

    return {
      success: true,
      message: "成功标记人员离职",
      data: {
        personnelId,
        employmentStatus: "离职",
        resignationTime: now,
        updatedAt: now,
      },
    };
  } catch (error) {
    console.error("标记离职操作失败:", error);
    return {
      success: false,
      message: `操作失败: ${error.message || "未知错误"}`,
    };
  }
};