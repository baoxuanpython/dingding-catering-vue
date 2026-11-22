/**
 * 密码校验规则 - 与后端 PasswordConstant 保持一致
 *
 * 后端规则：长度 6~32 位、不能包含空格、允许任意可见字符。
 * 前端校验只为体验，最终以后端校验为准，两边必须同步修改。
 */
import type { FormItemRule } from "element-plus";

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 32;
export const PASSWORD_PATTERN = /^\S+$/;

interface NewPasswordRuleOptions {
  /** 返回旧密码的函数；传入时会额外校验「新密码不能与旧密码相同」 */
  getOldPassword?: () => string;
}

/**
 * 生成「新密码」校验规则
 * 自助改密传 getOldPassword（需要比对旧密码）；管理员改他人密码不传
 */
export function createNewPasswordRules(
  options: NewPasswordRuleOptions = {},
): FormItemRule[] {
  const { getOldPassword } = options;

  const rules: FormItemRule[] = [
    { required: true, message: "请输入新密码", trigger: "blur" },
    {
      min: PASSWORD_MIN,
      max: PASSWORD_MAX,
      message: `密码长度需在 ${PASSWORD_MIN} 到 ${PASSWORD_MAX} 位之间`,
      trigger: "blur",
    },
    {
      pattern: PASSWORD_PATTERN,
      message: "密码不能包含空格",
      trigger: "blur",
    },
  ];

  if (getOldPassword) {
    rules.push({
      validator: (_rule, value, callback) => {
        if (value && value === getOldPassword()) {
          callback(new Error("新密码不能与旧密码相同"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    });
  }

  return rules;
}

/**
 * 生成「确认密码」校验规则
 */
export function createConfirmPasswordRules(
  getNewPassword: () => string,
): FormItemRule[] {
  return [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (value !== getNewPassword()) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ];
}
